import {Request, Response} from "express";
import {MovementController} from "../controllers/movementsController";
import { AccountsController } from "../controllers/accountsController";

export class Routes {
    
    protected movementsController: MovementController = new MovementController();
    protected accountsController: AccountsController = new AccountsController(); 

    public routes(app): void {   
        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })
        // Contact 
        app.route('/movementCategories') 
        // GET endpoint 
        .get(this.movementsController.getMovementCategories);
        // POST endpoint
        
        app.route('/movement').post(this.movementsController.addMovement);

        app.route('/movements').get(this.movementsController.getMovements);
        
        app.route('/generateMovements').post(this.movementsController.generateMovements);

        app.route('/movementsByCategory').get(this.movementsController.getMovementsByCategory);

        app.route('/accounts').get(this.accountsController.getAccounts);

        app.route('/accountsBalances').get(this.accountsController.getAccountBalances);
        
        // Contact detail
        app.route('/contact/:contactId')
        // get specific contact
        .get((req: Request, res: Response) => {
        // Get a single contact detail            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })
        .put((req: Request, res: Response) => {
        // Update a contact           
            res.status(200).send({
                message: 'PUT request successfulll!!!!'
            })
        })
        .delete((req: Request, res: Response) => {       
        // Delete a contact     
            res.status(200).send({
                message: 'DELETE request successfulll!!!!'
            })
        })
    }
}