import { MovementCategory } from "./MovementCategory";

export class Movement{
    
    public id : number;
    
    public accountNumber : string;

    public movementType : string;
    
    public description : string;
    
    public date : Date;

    public debit : number;
    
    public credit : number;
    
    public category : MovementCategory;
    
}