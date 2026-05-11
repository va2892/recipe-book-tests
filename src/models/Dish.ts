import { Flag } from "./Product";
import { Product } from "./Product";

export enum DishCategory {
    DESSERT = "DESSERT",
    FIRST = "FIRST",
    SECOND = "SECOND",
    DRINK = "DRINK",
    SALAD = "SALAD",
    SOUP = "SOUP",
    SNACK = "SNACK"
}

export interface DishProduct {
    product?: Product;
    productId: number;
    amount: number;
}

export interface Dish {
    id?: number;
    name: string;
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
    portionSize: number;
    category: DishCategory;
    products: DishProduct[];
    flags: Flag[];
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}