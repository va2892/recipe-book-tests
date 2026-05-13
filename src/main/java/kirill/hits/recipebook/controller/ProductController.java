package kirill.hits.recipebook.controller;

import jakarta.validation.Valid;
import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.CookingType;
import kirill.hits.recipebook.model.enums.ProductCategory;
import kirill.hits.recipebook.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

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
            @RequestParam(required = false) CookingType cookingType,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Boolean sugarFree,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        return productService.findAll(name, category, cookingType, vegan, glutenFree, sugarFree, sortBy, direction);
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Product product) throws BadRequestException {
        productService.create(product);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return productService.update(id, product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            productService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return productService.search(name);
    }

    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public ResponseEntity<?> createWithImages(@RequestPart("product") String productJson, @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Product product = mapper.readValue(productJson, Product.class);
        List<String> paths = new ArrayList<>();

        if (files != null) {
            if (files.size() > 5) {
                return ResponseEntity.badRequest().body("Максимум 5 фото");
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
        productService.create(product);
        return ResponseEntity.ok(product);
    }

    @PutMapping(value = "/{id}/with-images", consumes = "multipart/form-data")
    public Product updateWithImages(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();

        Product product = mapper.readValue(productJson, Product.class);

        List<String> paths = new ArrayList<>();

        // старые картинки, которые оставили
        if (product.getImages() != null) {
            paths.addAll(product.getImages());
        }

        // новые картинки
        if (files != null) {

            if (paths.size() + files.size() > 5) {
                throw new RuntimeException("Максимум 5 фото");
            }

            for (MultipartFile file : files) {

                String filename =
                        System.currentTimeMillis()
                                + "_"
                                + file.getOriginalFilename();

                Path path = Paths.get("uploads/" + filename);

                Files.createDirectories(path.getParent());

                Files.write(path, file.getBytes());

                paths.add(filename);
            }
        }

        product.setImages(paths);

        return productService.update(id, product);
    }
}
