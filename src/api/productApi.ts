import API from "./api";
import { Product } from "../models/Product";

export const getProducts = (params?: any) => {
    return API.get<Product[]>("/products", { params });
};

export const getProduct = (id: number) => {
    return API.get<Product>(`/products/${id}`);
};

export const createProduct = (product: Product) => {
    return API.post<Product>("/products", product);
};

export const updateProduct = (id: number, product: Product) => {
    return API.put<Product>(`/products/${id}`, product);
};

export const deleteProduct = async (id: number) => {
    return API.delete(`/products/${id}`);
};