package kirill.hits.recipebook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.CookingType;
import kirill.hits.recipebook.model.enums.Flag;
import kirill.hits.recipebook.model.enums.ProductCategory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("ProductController API tests")
public class ProductControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private Product validProduct;

    private String baseUrl;

    @BeforeEach
    void setup() {
        baseUrl = "http://localhost:" + port + "/api/products";

        validProduct = Product.builder()
                .name("Chicken breast")
                .calories(113.0)
                .proteins(22.0)
                .fats(2.0)
                .carbs(0.0)
                .category(ProductCategory.MEAT)
                .cookingType(CookingType.NEEDS_COOKING)
                .flags(Set.of(Flag.GLUTEN_FREE, Flag.SUGAR_FREE))
                .build();
    }

    @Test
    @DisplayName("Create valid product")
    void shouldCreateValidProduct() {

        ResponseEntity<Product> response = restTemplate.postForEntity(baseUrl, validProduct, Product.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
        assertEquals("Chicken breast", response.getBody().getName());
    }

    @Test
    @DisplayName("Create invalid product")
    void shouldRejectInvalidProduct() {

        validProduct.setName("");
        ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, validProduct, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Upload product with image")
    void shouldUploadImage() throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        ByteArrayResource image =
                new ByteArrayResource(
                        "image".getBytes()
                ) {
                    @Override
                    public String getFilename() {
                        return "test.jpg";
                    }
                };

        body.add("files", image);
        body.add("product", objectMapper.writeValueAsString(validProduct));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Product> response = restTemplate.postForEntity(baseUrl + "/with-images", request, Product.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().getImages().isEmpty());
    }

    @Test
    @DisplayName("Should upload product with 5 images")
    void shouldUploadFiveImages() throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        ByteArrayResource image =
                new ByteArrayResource(
                        "image".getBytes()
                ) {
                    @Override
                    public String getFilename() {
                        return "test.jpg";
                    }
                };

        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("product", objectMapper.writeValueAsString(validProduct));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Product> response = restTemplate.postForEntity(baseUrl + "/with-images", request, Product.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().getImages().isEmpty());
    }

    @Test
    @DisplayName("Should reject upload with more than 5 images")
    void shouldRejectSixImages() throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        ByteArrayResource image =
                new ByteArrayResource("image".getBytes()) {

                    @Override
                    public String getFilename() {
                        return "test.jpg";
                    }
                };

        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("files", image);
        body.add("product", objectMapper.writeValueAsString(validProduct));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(baseUrl + "/with-images", request, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @ParameterizedTest
    @CsvSource({
            "0,0,0,0",
            "1,1,1,1",
            "100,100,100,100"
    })
    @DisplayName("Boundary values for macros")
    void shouldHandleBoundaryValues(double calories, double proteins, double fats, double carbs) {

        validProduct.setCalories(calories);
        validProduct.setProteins(proteins);
        validProduct.setFats(fats);
        validProduct.setCarbs(carbs);
        ResponseEntity<Product> response = restTemplate.postForEntity(baseUrl, validProduct, Product.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("Filter products by category")
    void shouldFilterByCategory() {

        ResponseEntity<Product[]> response = restTemplate.getForEntity("/api/products?category=MEAT", Product[].class);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        Product[] products = response.getBody();
        assertNotNull(products);

        for (Product product : products) {
            assertEquals(ProductCategory.MEAT, product.getCategory());
        }
    }

    @Test
    @DisplayName("Delete product")
    void shouldDeleteProduct() {

        Product created = restTemplate.postForObject(baseUrl, validProduct, Product.class);
        assertNotNull(created);

        restTemplate.delete(baseUrl + "/" + created.getId());
        ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/" + created.getId(), String.class);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}