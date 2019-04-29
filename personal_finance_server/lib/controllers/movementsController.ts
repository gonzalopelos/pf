import { Request, Response } from 'express';
import {MovementsLogic} from '../businessLogic/movementsLogic' 
import { Banks } from '../entities/Banks';


export class MovementController{
    
    public getMovementCategories (req: Request, res: Response) {        
        let movementsLogic: MovementsLogic = new MovementsLogic();
        movementsLogic.getMovementCategories((err, contact) => {
            if(err){
                res.send(err);
            }
            res.json(contact);
        });
    }

    public addMovement(req: Request, res: Response){
        let movementsLogic: MovementsLogic = new MovementsLogic();
        movementsLogic.addMovement(req.body, (err, movement) => {
            if(err){
                res.send(err);
            }
            res.json(movement);
        });
    }

    public generateMovements(req: Request, res: Response){
        let movementsLogic: MovementsLogic = new MovementsLogic();
        let bank: Banks = Banks[req.param("bank", undefined)];
        let filepath:string = req.param("filePath", undefined);


        movementsLogic.generateMovements(filepath, bank,(movements)=>{
            res.json(movements);
        });
    }

    public getMovements(req: Request, res: Response){
        let movementsLogic: MovementsLogic = new MovementsLogic();
        let accountNumber:string = req.query.accountNumber;
        let year:number = req.query.year;

        movementsLogic.getMovements((err, movements)=>{
            if(err){
                res.send(err);
            }else{
                res.json(movements);
            }
        }, accountNumber, year);
    }

    public getMovementsByCategory(req:Request, res:Response){
        let movementsLogic: MovementsLogic = new MovementsLogic();
        
        movementsLogic.getMovementsByCategory((err, movementsByCat)=>{
            if(err){
                res.send(err);
            }else{
                res.json(movementsByCat);
            }
        })
    }

}