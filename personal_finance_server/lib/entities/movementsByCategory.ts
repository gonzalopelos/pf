import { MovementCategory } from "./MovementCategory";
import { Movement } from "./movement";

export class MovementsByCategory {
    public category: MovementCategory;
    public movements: Movement[];
    public creditAmount: number;
    public debitAmount: number;
}