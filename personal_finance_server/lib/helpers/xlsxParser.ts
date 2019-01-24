
//import XLSX = require("xlsx/types");
import * as XLSX from 'xlsx';
import { Movement } from '../entities/movement';
import { Account } from "../entities/account";
import { AccountMovements } from "../entities/accountMovements";
import * as parseDecimalNumber from "parse-decimal-number";
import * as moment from 'moment';

export class XlsxParser {

    public parseXlsx(filePath: string): AccountMovements {
        let jsonMovements = this.xlsxToJson(filePath);
        
        let result: AccountMovements = new AccountMovements();
        result.account = this.getAccount(jsonMovements);

        result.movements = this.generateMovements(jsonMovements, result.account.accountNumber);

        result.account.currentDate = result.movements[result.movements.length-1].date;

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
        let startEndIndex = this.getFirstLastMovementIndex(jsonMovements);
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
        
        let accountIndex = jsonMovements.findIndex(m => m.__EMPTY && m.__EMPTY.indexOf('007000081226') > 0);
        if (accountIndex > -1) {
            result.accountNumber = '007000081226';
            result.currency = 'UYU';
            result.currentBalance = parseDecimalNumber(jsonMovements[jsonMovements.length-1].__EMPTY_6);

        // } else {
        //     accountIndex = jsonMovements.findIndex(m => m.__EMPTY == '007000081226');
        //     if (accountIndex > -1) {
        //         result.accountNumber = '007000081226';
        //         result.currency = 'UYU';
        //         result.currentBalance = 
        //         jsonMovements.findIndex(m => m.__EMPTY == 'Saldo Final'):
        //     }
        }
        return result;
    }

    protected getAccountCurrency(jsonMovements: any[]): string {
        let result: string = "";


        return result;
    }

    protected getFirstLastMovementIndex(jsonMovements: any[]): number[] {
        let result: number[] = [];
        let headerIndex = jsonMovements.findIndex(m => m.__EMPTY == 'Fecha');
        if (headerIndex < 0) {
            headerIndex = jsonMovements.findIndex(m => m.__EMPTY_1 == 'Fecha');
            if (headerIndex > -1) {
                result.push(headerIndex + 1);
                result.push(jsonMovements.length - 1);
            }
        } else {
            result.push(headerIndex + 2);
            result.push(jsonMovements.length - 2);
        }
        return result;
    }

    protected generateMovement(jsonMovement: any, accountNumber: string): Movement {
        let result: Movement = new Movement();
        let firstValue = jsonMovement.__EMPTY;
        let dateMoment = moment(firstValue, "DD/MM/YYYY", true);
        result.accountNumber = accountNumber;
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

        return result;
    }
}


