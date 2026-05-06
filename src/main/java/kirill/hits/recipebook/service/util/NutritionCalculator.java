package kirill.hits.recipebook.service.util;

import kirill.hits.recipebook.model.DishProduct;
import kirill.hits.recipebook.model.Product;

import java.util.List;

public class NutritionCalculator {
    public static double calculateCalories( List<DishProduct> items) {
        double total = 0;

        for (DishProduct dp : items) {
            Product p = dp.getProduct();
            total += p.getCalories() * dp.getAmount() / 100.0;
        }

        return round(total);
    }

    public static double calculateProteins(List<DishProduct> items) {
        double total = 0;

        for (DishProduct dp : items) {
            Product p = dp.getProduct();
            total += p.getProteins() * dp.getAmount() / 100.0;
        }

        return round(total);
    }

    public static double calculateFats(List<DishProduct> items) {
        double total = 0;

        for (DishProduct dp : items) {
            Product p = dp.getProduct();
            total += p.getFats() * dp.getAmount() / 100.0;
        }

        return round(total);
    }

    public static double calculateCarbs(List<DishProduct> items) {
        double total = 0;

        for (DishProduct dp : items) {
            Product p = dp.getProduct();
            total += p.getCarbs() * dp.getAmount() / 100.0;
        }

        return round(total);
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}