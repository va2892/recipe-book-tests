import API from "./api";
import { Dish } from "../models/Dish";

export const getDishes = (params?: any) => {
    return API.get("/dishes", { params });
};

export const getDish = (id: number) => {
    return API.get<Dish>(`/dishes/${id}`);
};

export const createDish = (dish: Dish) => {
    try {
        return API.post<Dish>("/dishes", dish);
    } catch (error: any) {
        if (error.response) {
            alert('Сумма БЖУ > 100')
        }
    }
};

export const updateDish = (id: number, dish: Dish) => {
    return API.put<Dish>(`/dishes/${id}`, dish);
};

export const deleteDish = (id: number) => {
    return API.delete(`/dishes/${id}`);
};