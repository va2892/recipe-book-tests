import { DishCategory } from "../models/Dish";
import { Flag } from "../models/Product";

export const DISH_CATEGORY_LABELS: Record<DishCategory, string> = {
    [DishCategory.DESSERT]: "Десерт",
    [DishCategory.FIRST]: "Первое",
    [DishCategory.SECOND]: "Второе",
    [DishCategory.DRINK]: "Напиток",
    [DishCategory.SALAD]: "Салат",
    [DishCategory.SOUP]: "Суп",
    [DishCategory.SNACK]: "Перекус"
};

export const FLAG_LABELS: Record<Flag, string> = {
    [Flag.VEGAN]: "Веган",
    [Flag.GLUTEN_FREE]: "Без глютена",
    [Flag.SUGAR_FREE]: "Без сахара"
};