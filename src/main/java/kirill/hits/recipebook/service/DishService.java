package kirill.hits.recipebook.service;

import kirill.hits.recipebook.model.Dish;
import kirill.hits.recipebook.model.DishProduct;
import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.DishCategory;
import kirill.hits.recipebook.model.enums.Flag;
import kirill.hits.recipebook.repository.DishRepository;
import kirill.hits.recipebook.repository.ProductRepository;
import kirill.hits.recipebook.service.util.FlagValidator;
import kirill.hits.recipebook.service.util.MacroParser;
import kirill.hits.recipebook.service.util.NutritionCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class DishService {

    private final DishRepository dishRepository;
    private final ProductRepository productRepository;

    private double round2(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public Dish create(Dish dish) {
        processDish(dish);
        return dishRepository.save(dish);
    }

    public List<Dish> getAll() {
        return dishRepository.findAll();
    }

    public Dish getById(Long id) {
        return dishRepository.findById(id).orElseThrow( () -> new RuntimeException("Dish not found") );
    }

    public Dish update(Long id, Dish dish) {
        Dish existing = getById(id);

        existing.setName(dish.getName());
        existing.setPortionSize(dish.getPortionSize());
        existing.setCategory(dish.getCategory());
        existing.setFlags(new HashSet<>(dish.getFlags()));

        existing.setCalories(dish.getCalories());
        existing.setProteins(dish.getProteins());
        existing.setFats(dish.getFats());
        existing.setCarbs(dish.getCarbs());

        existing.setImages(new ArrayList<>(dish.getImages()));

        existing.getProducts().clear();

        if (dish.getProducts() != null) {
            for (DishProduct dp : dish.getProducts()) {

                Product product = productRepository.findById(dp.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                DishProduct newDp = new DishProduct();
                newDp.setProduct(product);
                newDp.setAmount(dp.getAmount());
                newDp.setDish(existing);

                existing.getProducts().add(newDp);
            }
        }

        processDish(existing);

        return dishRepository.save(existing);
    }

    public void delete(Long id) {
        dishRepository.deleteById(id);
    }

    private void processDish(Dish dish) {
        DishCategory macroCategory = MacroParser.parseCategory(dish.getName());

        if (dish.getCategory() == null && macroCategory != null) {
            dish.setCategory(macroCategory);
        }

        dish.setName( MacroParser.cleanName( dish.getName() ) );


        if (dish.getProducts() != null) {
            for (DishProduct dp : dish.getProducts()) {
                Product fullProduct = productRepository.findById(dp.getProduct().getId()).orElseThrow(() -> new RuntimeException("Product not found"));

                dp.setProduct(fullProduct);
                dp.setDish(dish);
            }
        }

        double calories = NutritionCalculator.calculateCalories(dish.getProducts());
        double proteins = NutritionCalculator.calculateProteins(dish.getProducts());
        double fats = NutritionCalculator.calculateFats(dish.getProducts());
        double carbs = NutritionCalculator.calculateCarbs(dish.getProducts());

        if (dish.getCalories() == null || dish.getCalories() == 0) {
            dish.setCalories(round2(calories));
        }

        if (dish.getProteins() == null || dish.getProteins() == 0) {
            dish.setProteins(round2(proteins));
        }

        if (dish.getFats() == null || dish.getFats() == 0) {
            dish.setFats(round2(fats));
        }

        if (dish.getCarbs() == null || dish.getCarbs() == 0) {
            dish.setCarbs(round2(carbs));
        }

        Set<Flag> allowedFlags = FlagValidator.calculateAllowedFlags( dish.getProducts() );

        dish.getFlags().retainAll(allowedFlags);
    }

    public double calculateCalories(Dish dish) {

        if (dish.getProducts() == null || dish.getProducts().isEmpty()) {
            return 0;
        }

        return dish.getProducts().stream()
                .mapToDouble(dp ->
                        dp.getProduct().getCalories() *
                                dp.getAmount() / 100.0
                )
                .sum();
    }

    private void validateDishFlags(Dish dish, Set<Flag> productFlags) {

        if (dish.getFlags() == null) return;

        if (dish.getFlags().contains(Flag.VEGAN)) {
            boolean allVegan = productFlags.contains(Flag.VEGAN);
            if (!allVegan) {
                throw new RuntimeException("Нельзя установить VEGAN — не все продукты веганские");
            }
        }

        if (dish.getFlags().contains(Flag.GLUTEN_FREE)) {
            boolean allGlutenFree = productFlags.contains(Flag.GLUTEN_FREE);
            if (!allGlutenFree) {
                throw new RuntimeException("Нельзя установить GLUTEN_FREE — есть продукты с глютеном");
            }
        }

        if (dish.getFlags().contains(Flag.SUGAR_FREE)) {
            boolean allSugarFree = productFlags.contains(Flag.SUGAR_FREE);
            if (!allSugarFree) {
                throw new RuntimeException("Нельзя установить SUGAR_FREE — есть сахар в продуктах");
            }
        }
    }

    public List<Dish> filter(DishCategory category,
                             String name,
                             Boolean vegan,
                             Boolean glutenFree,
                             Boolean sugarFree) {

        return dishRepository.filter(category, name, vegan, glutenFree, sugarFree);
    }

    private double totalCalories(Dish dish) {
        if (dish.getProducts() == null || dish.getProducts().isEmpty()) {
            return 0;
        }

        return dish.getProducts().stream()
                .mapToDouble(dp ->
                        dp.getProduct().getCalories() * dp.getAmount() / 100.0
                )
                .sum();
    }
}