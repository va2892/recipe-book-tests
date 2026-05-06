package kirill.hits.recipebook.controller;

import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.ProductCategory;
import kirill.hits.recipebook.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) Boolean requiresCooking,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Boolean sugarFree,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return productService.findAll(name, category, requiresCooking, vegan, glutenFree, sugarFree, sortBy, direction);
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.create(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return productService.update(id, product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return productService.search(name);
    }

    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public Product createWithImages(@RequestPart("product") String productJson,  @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Product product = mapper.readValue(productJson, Product.class);
        List<String> paths = new ArrayList<>();

        if (files != null) {
            if (files.size() > 5) {
                throw new RuntimeException("Максимум 5 фото");
            }

            for (MultipartFile file : files) {
                String filename = System.currentTimeMillis()  + "_" + file.getOriginalFilename();
                Path path = Paths.get("uploads/" + filename);
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
                paths.add(filename);
            }
        }

        product.setImages(paths);
        return productService.create(product);
    }
}
