
//import XLSX = require("xlsx/types");
import * as XLSX from 'xlsx';
import { Movement } from '../entities/movement';
import { Account } from "../entities/account";
import { AccountMovements } from "../entities/accountMovements";
import { Banks } from "../entities/Banks";
import * as parseDecimalNumber from "parse-decimal-number";
import * as moment from 'moment';
import { json } from '../../node_modules/@types/body-parser';

export class XlsxParser {
    protected bank:Banks;
    public parseXlsx(filePath: string, bank: Banks): AccountMovements {
        let jsonMovements = this.xlsxToJson(filePath);
        this.bank = bank;
        let result: AccountMovements = new AccountMovements();
        result.account = this.getAccount(jsonMovements);

        result.movements = this.generateMovements(jsonMovements, result.account.accountNumber);

        result.account.currentDate = result.movements[result.movements.length-1].date;
        
        // if(this.bank != Banks.Santander){
        //     result.movements = [];
        // }
        return result;
    }

    protected xlsxToJson(filePath: string): any[] {
        let result = [];
        const workbook = XLSX.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        return result;
    }

    protected generateMovements(jsonMovements: any[], accountNumber: string): Movement[] {
        let result: Movement[] = [];
        let startEndIndex = this.getFirstAndLastMovementIndex(jsonMovements);
        if (startEndIndex && startEndIndex.length == 2) {
            for (let index: number = startEndIndex[0]; index < startEndIndex[1]; index++) {
                // const element = array[startIndex];
                result.push(this.generateMovement(jsonMovements[index], accountNumber));
            }
        }
        return result;
    }

    protected getAccount(jsonMovements: any[]): Account {
        let result: Account = new Account();
        let accountIndex: number; 
        switch (this.bank) {
            case Banks.Santander:
                accountIndex = jsonMovements.findIndex(m => m.__EMPTY && m.__EMPTY.indexOf('007000081226') > 0);
                if (accountIndex > -1) {
                    result.accountNumber = '007000081226';
                    result.currency = 'UYU';
                    result.currentBalance = parseDecimalNumber(jsonMovements[jsonMovements.length-1].__EMPTY_6);               
                } else {
                    throw "Can't find account number in Santader file";
                }
                break;
            case Banks.Brou:
                accountIndex = jsonMovements.findIndex(m => m.__EMPTY_1 && m.__EMPTY_1.indexOf('001298002-00001') > 0);
                if (accountIndex > -1) {
                    result.accountNumber = '001298002-00001';
                    result.currency = 'UYU';
                    let matchResult: RegExpMatchArray = jsonMovements[accountIndex].__EMPTY_1.match(/(Saldo Actual:\s*)([0-9.,]*)/);
                    result.currentBalance = parseDecimalNumber(matchResult[2].replace(".", "").replace(",", "."));
                
                } else {
                    accountIndex = jsonMovements.findIndex(m => m.__EMPTY_1 && m.__EMPTY_1.indexOf('001251612-00001') > 0);
                    if (accountIndex > -1) {
                        result.accountNumber = '001251612-00001';
                        result.currency = 'USD';
                        let matchResult: RegExpMatchArray = jsonMovements[accountIndex].__EMPTY_1.match(/(Saldo Actual:\s*)([0-9.,]*)/);
                        result.currentBalance = parseDecimalNumber(matchResult[2].replace(".", "").replace(",", "."));
                    
                    } else {
                        throw "Can't find account number in Brou file";
                    }
                }
                break;
            case Banks.Scotiabank:
                break;
        }
        return result;
    }

    protected getAccountCurrency(jsonMovements: any[]): string {
        let result: string = "";


        return result;
    }

    protected getFirstAndLastMovementIndex(jsonMovements: any[]): number[] {
        let result: number[] = [];
        let headerIndex: number;
        switch (this.bank) {
            case Banks.Santander:
                headerIndex = jsonMovements.findIndex(m => m.__EMPTY == 'Fecha');
                if (headerIndex > -1) {
                    result.push(headerIndex + 2);
                    result.push(jsonMovements.length - 1);
                }
                break;
        
            case Banks.Brou:
                headerIndex = jsonMovements.findIndex(m => m.__EMPTY_1 == 'Fecha');
                if (headerIndex > -1) {
                    result.push(headerIndex + 1);
                    result.push(jsonMovements.length - 2);
                }
                break;

            case Banks.Scotiabank:
                
                break;
        }

        return result;
    }

    protected generateMovement(jsonMovement: any, accountNumber: string): Movement {
        let result: Movement = new Movement();
        let firstValue: string = "";
        let dateMoment: moment.Moment;
        result.accountNumber = accountNumber;

        switch (this.bank) {
            case Banks.Santander:
                firstValue = jsonMovement.__EMPTY;
                dateMoment = moment(firstValue, "DD/MM/YYYY", true);
                if (dateMoment.isValid()) { //Santander file
                    result.date = dateMoment.toDate();
                    result.description = jsonMovement.__EMPTY_3;
                    if (!result.description) {
                        result.description = "";
                    }
                    result.movementType = jsonMovement.__EMPTY_2;
        
                    if (jsonMovement['__EMPTY_4']) {
                        result.debit = parseDecimalNumber(jsonMovement.__EMPTY_4);
                        result.credit = 0;
                    } else {
                        result.debit = 0;
                        result.credit = parseDecimalNumber(jsonMovement.__EMPTY_5);
        
                    }        
                }
                break;
        
            case Banks.Brou:
                firstValue = jsonMovement.__EMPTY_1;
                dateMoment = moment(firstValue, "DD/MM/YYYY", true);
                if (dateMoment.isValid()) {
                    result.date = dateMoment.toDate();
                    result.description = jsonMovement.__EMPTY_6;
                    if (!result.description) {
                        result.description = "";
                    }
                    result.movementType = jsonMovement.__EMPTY_3 + " | " + jsonMovement.__EMPTY_5;
                    if (jsonMovement['__EMPTY_8']) {
                        result.debit = parseDecimalNumber(jsonMovement.__EMPTY_8);
                        result.credit = 0;
                    } else {
                        result.debit = 0;
                        result.credit = parseDecimalNumber(jsonMovement.__EMPTY_9);
        
                    } 
                }
                break;
            case Banks.Scotiabank:
                break;
        }

        return result;
    }
}


