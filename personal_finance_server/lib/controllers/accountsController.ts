import { AccountsLogic } from "../businessLogic/accountsLogic";
import { Request, Response } from 'express';


const accountsLogic: AccountsLogic = new AccountsLogic();

export class AccountsController {
    public getAccounts(req:Request, res:Response){
        accountsLogic.getAccounts((err, accounts)=>{
            if(err){
                res.send(err);
            }else{
                res.json(accounts);
            }
        });
    }
}