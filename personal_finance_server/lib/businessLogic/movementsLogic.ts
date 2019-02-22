import * as mongoose from 'mongoose';
import { MovementSchema, MovementCategorySchema, CategoryMapping } from '../models/movementsModel';

import { XlsxParser } from '../helpers/xlsxParser';
import { Movement } from '../entities/movement';
import { MovementCategory } from '../entities/MovementCategory';
import { MovementCategoryMapping } from '../entities/MovementCategoryMapping';
import { MovementsByCategory } from '../entities/movementsByCategory';
import { AccountsLogic } from './accountsLogic';
import { Banks } from '../entities/Banks';

const MovementCategoryModel = mongoose.model('movement_categories', MovementCategorySchema);
const MovementModel = mongoose.model('movements', MovementSchema);
const CategoryMappingModel = mongoose.model('category_mappings', CategoryMapping);
const movementCategories: MovementCategory[] = [];
const movementCategoryMappings: MovementCategoryMapping[] = [];
const accountsLogic: AccountsLogic = new AccountsLogic();

export class MovementsLogic {


    public getMovementCategories(callback: (err: any, categories: MovementCategory[]) => void): void {
        if (movementCategories.length == 0) {
            MovementCategoryModel.find({}, (err, auxCategories) => {
                auxCategories.forEach(cat => movementCategories.push(cat.toJSON() as MovementCategory));
                callback(err, movementCategories);
            });
        } else {
            callback(null, movementCategories);
        }
    }

    public addMovement(movement: mongoose.Document, callback: (err: any, addedMovement: mongoose.Document) => void): void {
        let newMovement = new MovementModel(movement);
        
        

        newMovement.save((err, mov) => {
            callback(err, mov);
        });

        // if(newMovement.update({},(err, mov)=>{},{upsert:true}))
        // newMovement.save((err, mov) => {
        //     callback(err, mov);
        // });
    }

    public generateMovements(filePath: string, bank: Banks, callback: (movements: Movement[]) => void): void {
        let xlsxParser = new XlsxParser();
        let accountMovements = xlsxParser.parseXlsx(filePath, bank);

        accountsLogic.updateAccount(accountMovements.account);
        if(accountMovements.movements && accountMovements.movements.length > 0){
            this.getMovementCategories((err, categories) => {
                if (!err) {
                    this.getMovementCategoryMappings((err, catMapps) => {
                        this.categorizeMovements(accountMovements.movements, categories, catMapps);
    
                        let newMovementModel = new MovementModel();
                        
                        accountMovements.movements.forEach(mov =>{
                            mov.credit
                            newMovementModel.collection.findOneAndUpdate(
                                {
                                accountNumber: mov.accountNumber,
                                credit: mov.credit,
                                debit: mov.debit,
                                description: mov.description,
                                movementType: mov.movementType,
                                date: mov.date
                                },
                                {$set:{
                                    accountNumber: mov.accountNumber,
                                    credit: mov.credit,
                                    debit: mov.debit,
                                    description: mov.description,
                                    movementType: mov.movementType,
                                    category: mov.category,
                                    date: mov.date
                                }},
                                {upsert: true}, (err, mov)=>{
                                    if(err)
                                    {
                                        console.log(err);
                                    };
                            
                                }
                            );
                        });
    
                        // newMovementModel.collection.insert(accountMovements.movements);
                        
                        
                        callback(accountMovements.movements);
                    });
                }
            });
        }
    }

    public getMovements(callback: (err: any, movements: Movement[]) => void): void {
        let movements: Movement[] = [];
        MovementModel.find({}, (err, auxMovs) => {
            auxMovs.forEach(auxMov => movements.push(auxMov.toJSON() as Movement))
            callback(err, movements);
        });

    }

    public getMovementsByCategory(callback: (err: any, movementsByCategory: MovementsByCategory[]) => void) {
        this.getMovements((err,movements)=>{
            let movementsByCat: MovementsByCategory[] = [];
            if(!err){
                let movementByCat: MovementsByCategory;
                movements.forEach(mov => {
                    movementByCat = movementsByCat.find(mc => mc.category.id == mov.category.id);
                    if(movementByCat == undefined){
                        movementByCat = new MovementsByCategory();
                        movementByCat.movements = [];
                        movementByCat.category = mov.category;
                        movementByCat.creditAmount = 0;
                        movementByCat.debitAmount = 0;
                        movementsByCat.push(movementByCat);
                    }
                    movementByCat.creditAmount = movementByCat.creditAmount + mov.credit;
                    movementByCat.debitAmount = movementByCat.debitAmount + mov.debit;
                    movementByCat.movements.push(mov);
                });
            }
            callback(err, movementsByCat);
        });
    }

    protected getMovementCategoryMappings(callback: (err: any, categoryMapps: MovementCategoryMapping[]) => void) {
        if (movementCategoryMappings.length == 0) {
            CategoryMappingModel.find({}, (err, catMapps) => {
                catMapps.forEach(catMapp => {
                    movementCategoryMappings.push(catMapp.toJSON());
                });
                callback(err, movementCategoryMappings);
            });
        } else {
            callback(null, movementCategoryMappings);
        }

    }

    protected categorizeMovements(movs: Movement[], categories: MovementCategory[], categoryMappings: MovementCategoryMapping[]): void {
        movs.forEach(mov =>
            this.categorizeMovement(mov, categories, categoryMappings)
        );
    }

    protected categorizeMovement(movement: Movement, categories: MovementCategory[], categoryMappings: MovementCategoryMapping[]): void {
        //filter by movement type
        let categoriesMatched: MovementCategoryMapping[] = movementCategoryMappings.filter(mcm => mcm.movementType === movement.movementType);

        if (categoriesMatched.length > 1) {
            //filter by movement description
            categoriesMatched = categoriesMatched.filter(catm =>
                catm.movementDescription.length > 0 && movement.description.indexOf(catm.movementDescription) > -1
                || catm.movementDescription.length == 0 && movement.description.length == 0
            );

        }

        if (categoriesMatched.length == 1) {
            movement.category = categories.find(cat => cat.id == categoriesMatched[0].categoryId);
        } else {
            //Undefined category
            movement.category = categories.find(cat => cat.id == 1);
        }

    }
    
    // protected categorizeMovement(mov:Movement):void{
    //     let movCat:MovementCategory = new
    // }

    //#region initialize categories
    // public generateMovementCategories(): any {
    //     let result = undefined;

    //     let category: Array<any> = [
    //         {
    //             "id": 1,
    //             "description": "Undefined"
    //         },
    //         {
    //             "id": 2,
    //             "description": "Cine"
    //         },
    //         {
    //             "id": 3,
    //             "description": "Fondo Solidaridad"
    //         },
    //         {
    //             "id": 4,
    //             "description": "Nafta"
    //         },
    //         {
    //             "id": 5,
    //             "description": "Restaurante"
    //         },
    //         {
    //             "id": 6,
    //             "description": "Super"
    //         },
    //         {
    //             "id": 7,
    //             "description": "Gastos comunes"
    //         },
    //         {
    //             "id": 8,
    //             "description": "Farmacia"
    //         },
    //         {
    //             "id": 9,
    //             "description": "Tiendas ropa"
    //         },
    //         {
    //             "id": 10,
    //             "description": "Club Defensor"
    //         },
    //         {
    //             "id": 11,
    //             "description": "Antel Internet"
    //         },
    //         {
    //             "id": 12,
    //             "description": "Retiro Cajero"
    //         },
    //         {
    //             "id": 13,
    //             "description": "Estacionamiento"
    //         },
    //         {
    //             "id": 14,
    //             "description": "Service HB20"
    //         },
    //         {
    //             "id": 15,
    //             "description": "Antel Cel GP"
    //         },
    //         {
    //             "id": 16,
    //             "description": "Antel Cel VF"
    //         },
    //         {
    //             "id": 17,
    //             "description": "Otros"
    //         },
    //         {
    //             "id": 18,
    //             "description": "Transferencia online"
    //         },
    //         {
    //             "id": 19,
    //             "description": "Salidas"
    //         },
    //         {
    //             "id": 20,
    //             "description": "Pago Tarjeta Crédito"
    //         },
    //         {
    //             "id": 21,
    //             "description": "Pago IMM"
    //         }
    //     ]





    //     let newCategory = new MovementCategoryModel(category);
    //     newCategory.collection.insert(category);
    //     result = category;
    //     // newCategory.save((err, category)=>{
    //     //     if(err){
    //     //         console.log(err);
    //     //     }
    //     //     else {
    //     //         result = category;
    //     //     }
    //     // });
    //     return result;
    // }
    //#endregion
    //#region Initialize CategotyMapping

    // public initCategoryMapping():void{
    //      let catMapp: Array<any> = [
    //         { "categoryId": 18, "movementType": "CREDITO POR OPERACION EN SUPERNET", "movementDescription": "" },
    //         { "categoryId": 19, "movementType": "DEBITO OPERACION EN SUPERNET O SMS", "movementDescription": "salida" },
    //         { "categoryId": 18, "movementType": "TRANSFERENCIA RECIBIDA", "movementDescription": "" },
    //         { "categoryId": 4, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "ANCAP" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "DISCO" },
    //         { "categoryId": 9, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "MANOS DEL URUGUAY" },
    //         { "categoryId": 2, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "CINE" },
    //         { "categoryId": 4, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "ESSO SERVICENTRO" },
    //         { "categoryId": 8, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "NATAL" },
    //         { "categoryId": 18, "movementType": "CR. PAGO SUELDOS", "movementDescription": "" },
    //         { "categoryId": 20, "movementType": "PAGO ELECTRONICO TARJETA CREDITO", "movementDescription": "" },
    //         { "categoryId": 18, "movementType": "TRANSFERENCIA ENVIADA", "movementDescription": "" },
    //         { "categoryId": 13, "movementType": "DEBITO OPERACION EN SUPERNET O SMS", "movementDescription": "Trf. Plaza- David Amorin" },
    //         { "categoryId": 12, "movementType": "RETIRO EFECTIVO CAJERO AUTOMATICO", "movementDescription": "" },
    //         { "categoryId": 9, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "LA ISLA" },
    //         { "categoryId": 9, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "ZARA" },
    //         { "categoryId": 9, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "mulita campo" },
    //         { "categoryId": 21, "movementType": "PAGO DE SERVICIO POR BANRED", "movementDescription": "SERVICIO DE PAGOS BANRED , IMMONT" },
    //         { "categoryId": 17, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "P.P.HAMMER" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "ONE LOVE" },
    //         { "categoryId": 17, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "DIVINO" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "BAIPA" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "PANADERIA TORRE EIFF" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "KINKO" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "bocatti empanadas" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "VIA MIA" },
    //         { "categoryId": 9, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "cat" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "LA COMMEDIA TRATTORI" },
    //         { "categoryId": 5, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "belua" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "EL NOVILLO ALEGRE" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "EL NARANJO" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "madre tierra" },
    //         { "categoryId": 6, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "DE LA QUINTA" },
    //         { "categoryId": 15, "movementType": "SERVICIO PAC DEBITO", "movementDescription": "PAC ANCEL" },
    //         { "categoryId": 18, "movementType": "DEBITO OPERACION EN SUPERNET O SMS", "movementDescription": "" },
    //         { "categoryId": 11, "movementType": "SERVICIO PAC DEBITO", "movementDescription": "PAC ANTEL" },
    //         { "categoryId": 8, "movementType": "COMPRA CON TARJETA DEBITO", "movementDescription": "FARMACIA" },
    //         { "categoryId": 19, "movementType": "DEBITO OPERACION EN SUPERNET O SMS", "movementDescription": "Asado" },
    //         { "categoryId": 17, "movementType": "DEBITO A CONFIRMAR BANRED", "movementDescription": "COMPRA" }
    //     ]
    //     let categoryMappings = new CategoryMappingModel(catMapp);
    //     categoryMappings.collection.insert(catMapp);
    // }
    //#endregion
}
