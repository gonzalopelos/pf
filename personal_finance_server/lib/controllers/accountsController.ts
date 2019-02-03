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

    public getAccountBalances(req:Request, res:Response){
        let year: number = req.query.year;
        accountsLogic.getAccountBalances((err, accountBalances)=>{
            if(err){
                res.send(err);
            }else{
                res.json(accountBalances);
            }

        }, req.param("accountNumber", undefined), year)
    }
}