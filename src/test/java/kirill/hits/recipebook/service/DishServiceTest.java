package kirill.hits.recipebook.service;

import kirill.hits.recipebook.model.*;
import kirill.hits.recipebook.repository.DishRepository;
import kirill.hits.recipebook.repository.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@DisplayName("DishService: расчет калорий")
class DishServiceTest {

    private DishService dishService;

    @Mock
    private DishRepository dishRepository;

    @Mock
    private ProductRepository productRepository;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        dishService = new DishService(dishRepository, productRepository);
    }

    private Product createProduct(double calories) {
        return Product.builder()
                .name("Test")
                .calories(calories)
                .proteins(0.0)
                .fats(0.0)
                .carbs(0.0)
                .build();
    }

    private DishProduct dp(Product p, double amount) {
        DishProduct d = new DishProduct();
        d.setProduct(p);
        d.setAmount(amount);
        return d;
    }

    @Test
    void shouldCalculateCaloriesCorrectly() {
        Product p1 = createProduct(100);
        Product p2 = createProduct(200);

        Dish dish = new Dish();
        dish.setProducts(List.of(
                dp(p1, 100),
                dp(p2, 50)
        ));

        double result = dishService.calculateCalories(dish);

        assertEquals(200, result);
    }

    @Test
    void shouldReturnZeroForEmptyDish() {
        Dish dish = new Dish();
        dish.setProducts(List.of());

        double result = dishService.calculateCalories(dish);

        assertEquals(0, result);
    }

    @Test
    void shouldReturnZeroWhenAmountIsZero() {
        Product p = createProduct(100);

        Dish dish = new Dish();
        dish.setProducts(List.of(
                dp(p, 0)
        ));

        double result = dishService.calculateCalories(dish);

        assertEquals(0, result);
    }

    @ParameterizedTest
    @CsvSource({
            "100, 1, 1",
            "50, 2, 1",
            "200, 0.5, 1"
    })
    void shouldHandleSmallValues(double calories, double amount, double expected) {

        Product p = createProduct(calories);

        Dish dish = new Dish();
        dish.setProducts(List.of(
                dp(p, amount)
        ));

        double result = dishService.calculateCalories(dish);

        assertEquals(expected, result, 0.001);
    }

    @Test
    void shouldHandleLargeValues() {
        Product p = createProduct(1000);

        Dish dish = new Dish();
        dish.setProducts(List.of(
                dp(p, 1000)
        ));

        double result = dishService.calculateCalories(dish);

        assertEquals(10000, result);
    }

    @Test
    void shouldReturnZeroWhenProductsNull() {
        Dish dish = new Dish();
        dish.setProducts(null);

        double result = dishService.calculateCalories(dish);

        assertEquals(0, result);
    }
}