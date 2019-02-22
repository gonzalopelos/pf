import * as mongoose from 'mongoose';
import {AccountSchema, AccountBalanceSchema} from '../models/accountsModel';
import {Account} from '../entities/account'
import { AccountBalance } from '../entities/accountBalance';
import * as moment from 'moment';


const AccountModel = mongoose.model('accounts', AccountSchema);
const AccountBalanceModel = mongoose.model('accountBalances', AccountBalanceSchema);
export class AccountsLogic {
    public getAccounts(callback:(err:any, accounts:Account[])=> void): void {
        let accounts: Account[]=[];

        AccountModel.find({}, (err, accountsAux)=>{
            if(!err){
                accountsAux.forEach(acc => accounts.push(acc.toJSON()as Account));
                callback(err, accounts);
            }
        })

    }
    public updateAccount(account: Account){
        let accountModel = new AccountModel();
        let accountNumberAux:string = account.accountNumber;
        let currentDateAux:Date = account.currentDate;
        accountModel.collection.findOneAndUpdate(
            {
                accountNumber: accountNumberAux,
                currency: account.currency
            },
            {$set:{
                accountNumber: accountNumberAux,
                currency: account.currency,
                currentBalance: account.currentBalance,
                currentDate: account.currentDate
            }},
            {upsert: true}, (err, acc)=>{
            if(err)
            {
                console.log(err);
            }
        });

        AccountBalanceModel.collection.findOneAndUpdate(
            {
                accountNumber: accountNumberAux,
                date: currentDateAux
            },
            {$set:{
                accountNumber: accountNumberAux,
                balance: account.currentBalance,
                date: account.currentDate
            }},
            {upsert: true}, (err, acc)=>{
            if(err)
            {
                console.log(err);
            }
        });

        
    }

    public getAccountBalances(callback:(err:any, accountsBalances:AccountBalance[])=>void, accountNumber:string = undefined, year: number = undefined):void{
        let accountsBalances: AccountBalance[] = [];
        let dateFrom: Date =  new Date(year != undefined ? year: 2000, 0);
        let dateTo: Date = new Date(year != undefined ? year : 2100, 11);
        let conditions: any = {
            date:{
                '$gte': dateFrom,
                '$lte': dateTo
            }
        };
        if(!!accountNumber){
            conditions['accountNumber'] = accountNumber.trim();
        }

        AccountBalanceModel.find(conditions, (err, accountBalancessAux)=>{
            if(!err){
                accountBalancessAux.forEach(accB => accountsBalances.push(accB.toJSON()as AccountBalance));
            }
            if(!!year){
                accountsBalances.sort((a,b) => a.date.getMonth() - b.date.getMonth());
            }

            callback(err, accountsBalances);
        })
    }
}