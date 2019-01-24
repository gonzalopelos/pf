import * as mongoose from 'mongoose';
// import { D Decimal128 } from '../../node_modules/@types/bson';

const Schema = mongoose.Schema;

export const MovementSchema = new Schema({
    id: {
        type: Number
    },
    accountNumber: {
        type: String
    },
    movementTyoe:{
        type: String
    },
    description: {
        type: String            
    },
    date: {
        type: Date            
    },
    debit: {
        type: Number            
    },
    credit: {
        type: Number            
    },
    categoryId: {
        type: Number
    }
});

export const MovementCategorySchema = new Schema({
    id: {
        type: Number
    },
    description: {
        type: String
    }
});

export const CategoryMapping = new Schema({
    categoryId:{
        type: Number
    },
    movementType:{
        type: String
    },
    movementDescription:{
        type: String
    }
});