import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const AccountSchema = new Schema({
    accountNumber:{
        type: String
    },
    currency:{
        type: String
    },
    currentBalance:{
        type: Number
    },
    currentDate:{
        type: Date
    }
});

export const AccountBalanceSchema = new Schema({
    accountNumber:{
        type: String
    },
    balance:{
        type: Number
    },
    date:{
        type: Date
    }
});