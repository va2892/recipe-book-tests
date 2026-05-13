package kirill.hits.recipebook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import kirill.hits.recipebook.model.Dish;

import kirill.hits.recipebook.model.enums.DishCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("Dish API Integration Tests")
class DishControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private Dish validDish;

    @BeforeEach
    void setup() {
        validDish = new Dish();
        validDish.setName("Test Dish");
        validDish.setCategory(DishCategory.FIRST);
        validDish.setPortionSize(100.0);
        validDish.setCalories(100.0);
        validDish.setProteins(10.0);
        validDish.setFats(5.0);
        validDish.setCarbs(20.0);
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Test
    @DisplayName("Create valid dish")
    void shouldCreateDish() {

        HttpEntity<Dish> request = new HttpEntity<>(validDish, jsonHeaders());
        ResponseEntity<Dish> response = restTemplate.postForEntity("/api/dishes", request, Dish.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getId());
    }

    @ParameterizedTest
    @CsvSource({
            "'', BAD_REQUEST",
            "' ', BAD_REQUEST",
            "'Soup', OK",
            "'Борщ', OK"
    })
    @DisplayName("Should create dish only with correctly name")
    void shouldValidateDishName(String name, HttpStatus expected) {

        validDish.setName(name);

        ResponseEntity<?> response = restTemplate.postForEntity("/api/dishes", new HttpEntity<>(validDish, jsonHeaders()), String.class);

        assertEquals(expected, response.getStatusCode());
    }

    @Test
    @DisplayName("Get dish by id")
    void shouldGetDishById() {

        Dish created = restTemplate.postForObject("/api/dishes", new HttpEntity<>(validDish, jsonHeaders()), Dish.class);
        ResponseEntity<Dish> response = restTemplate.getForEntity("/api/dishes/" + created.getId(), Dish.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test Dish", response.getBody().getName());
    }

    @Test
    @DisplayName("Get non-existing dish")
    void shouldReturn404ForMissingDish() {

        ResponseEntity<Dish> response = restTemplate.getForEntity("/api/dishes/999999", Dish.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Delete dish")
    void shouldDeleteDish() {

        Dish created = restTemplate.postForObject("/api/dishes", new HttpEntity<>(validDish, jsonHeaders()), Dish.class);

        restTemplate.delete("/api/dishes/" + created.getId());
        ResponseEntity<String> response = restTemplate.getForEntity("/api/dishes/" + created.getId(), String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Update dish")
    void shouldUpdateDish() {

        Dish dish = validDish;

        Dish created = restTemplate.postForObject("/api/dishes", new HttpEntity<>(dish, jsonHeaders()), Dish.class);
        created.setName("Updated Dish");

        HttpEntity<Dish> request = new HttpEntity<>(created, jsonHeaders());
        ResponseEntity<Dish> response = restTemplate.exchange("/api/dishes/" + created.getId(), HttpMethod.PUT, request, Dish.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated Dish", response.getBody().getName());
    }

    @ParameterizedTest
    @CsvSource({"1", "100", "1000", "5000"})
    @DisplayName("Boundary test for portion size")
    void shouldHandlePortionSizes(double portion) {

        validDish.setPortionSize(portion);
        ResponseEntity<Dish> response = restTemplate.postForEntity("/api/dishes", new HttpEntity<>(validDish, jsonHeaders()), Dish.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @ParameterizedTest
    @CsvSource({"0", "-1"})
    @DisplayName("Invalid portion sizes should fail")
    void shouldRejectInvalidPortion(double portion) {

        validDish.setPortionSize(portion);
        ResponseEntity<String> response = restTemplate.postForEntity("/api/dishes", new HttpEntity<>(validDish, jsonHeaders()), String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Empty dish should fail validation")
    void shouldRejectEmptyDish() {

        Dish empty = new Dish();
        ResponseEntity<String> response = restTemplate.postForEntity("/api/dishes", new HttpEntity<>(empty, jsonHeaders()), String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Filter dishes by category")
    void shouldFilterDishes() {

        ResponseEntity<Dish[]> response = restTemplate.getForEntity("/api/dishes?category=SECOND", Dish[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("Sort dishes by calories desc")
    void shouldSortDishes() {

        ResponseEntity<Dish[]> response = restTemplate.getForEntity("/api/dishes?sortBy=calories&direction=desc", Dish[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
