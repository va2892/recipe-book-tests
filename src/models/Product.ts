export enum ProductCategory {
    FROZEN = "FROZEN",
    MEAT = "MEAT",
    VEGETABLES = "VEGETABLES",
    GREENS = "GREENS",
    SPICES = "SPICES",
    GRAINS = "GRAINS",
    CANNED = "CANNED",
    LIQUID = "LIQUID",
    SWEETS = "SWEETS"
}

export enum CookingType {
    READY_TO_EAT = "READY_TO_EAT",
    SEMI_FINISHED = "SEMI_FINISHED",
    NEEDS_COOKING = "NEEDS_COOKING"
}

export enum Flag {
    VEGAN = "VEGAN",
    GLUTEN_FREE = "GLUTEN_FREE",
    SUGAR_FREE = "SUGAR_FREE"
}

export interface Product {
    id?: number;
    name: string;
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
    composition?: string;
    category: ProductCategory;
    cookingType: CookingType;
    flags: Flag[];
    images?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}