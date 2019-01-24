import { Request, Response } from 'express';
import {MovementsLogic} from '../businessLogic/movementsLogic' 


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
        
        movementsLogic.generateMovements(req.param("filePath", ""), (movements)=>{
            res.json(movements);
        });
    }

    public getMovements(req: Request, res: Response){
        let movementsLogic: MovementsLogic = new MovementsLogic();
        
        movementsLogic.getMovements((err, movements)=>{
            if(err){
                res.send(err);
            }else{
                res.json(movements);
            }
        });
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