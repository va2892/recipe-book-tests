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

@Service
@RequiredArgsConstructor
public class DishService {

    private final DishRepository dishRepository;
    private final ProductRepository productRepository;

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

        existing.setName( dish.getName() );
        existing.setPortionSize( dish.getPortionSize() );
        existing.setProducts( dish.getProducts() );

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


        for (DishProduct dp : dish.getProducts()) {
            Product fullProduct = productRepository.findById(dp.getProduct().getId()).orElseThrow(() -> new RuntimeException("Product not found"));

            dp.setProduct(fullProduct);
            dp.setDish(dish);
        }

        dish.setCalories( NutritionCalculator.calculateCalories( dish.getProducts() ) );
        dish.setProteins( NutritionCalculator.calculateProteins( dish.getProducts() ) );
        dish.setFats( NutritionCalculator.calculateFats( dish.getProducts() ) );
        dish.setCarbs( NutritionCalculator.calculateCarbs( dish.getProducts() ));

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
}