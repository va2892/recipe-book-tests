import { ProductCategory, CookingType, Flag } from "../models/Product";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
    FROZEN: "Замороженное",
    MEAT: "Мясо",
    VEGETABLES: "Овощи",
    GREENS: "Зелень",
    SPICES: "Специи",
    GRAINS: "Зерновые",
    CANNED: "Консервы",
    LIQUID: "Напитки",
    SWEETS: "Сладости"
};

export const COOKING_TYPE_LABELS: Record<CookingType, string> = {
    READY_TO_EAT: "Готово к употреблению",
    SEMI_FINISHED: "Полуфабрикат",
    NEEDS_COOKING: "Требует готовки"
};

export const FLAG_LABELS: Record<Flag, string> = {
    VEGAN: "Веган",
    GLUTEN_FREE: "Без глютена",
    SUGAR_FREE: "Без сахара"
};