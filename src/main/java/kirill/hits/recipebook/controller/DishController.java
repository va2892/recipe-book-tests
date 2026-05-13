package kirill.hits.recipebook.controller;

import jakarta.validation.Valid;
import kirill.hits.recipebook.model.Dish;
import kirill.hits.recipebook.model.enums.DishCategory;
import kirill.hits.recipebook.service.DishService;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
@CrossOrigin
public class DishController {

    private final DishService dishService;

//    @GetMapping
//    public List<Dish> getAll() {
//        return dishService.getAll();
//    }

    @GetMapping
    public List<Dish> getDishes(
            @RequestParam(required = false) DishCategory category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Boolean sugarFree
    ) {
        return dishService.filter(category, name, vegan, glutenFree, sugarFree);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getById(@PathVariable Long id) {
        try {
            Dish response = dishService.getById(id);
            return ResponseEntity.ok().body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @PostMapping
    public Dish create(@Valid @RequestBody Dish dish) {
        return dishService.create(dish);
    }

    @PutMapping("/{id}")
    public Dish update(@PathVariable Long id, @RequestBody Dish dish) {
        return dishService.update(id, dish);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            dishService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public Dish createWithImages(@RequestPart("dish") String dishJson, @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        Dish dish = mapper.readValue(dishJson, Dish.class);
        List<String> paths = new ArrayList<>();

        if (files != null) {

            if (files.size() > 5) {
                throw new RuntimeException("Максимум 5 фото");
            }

            for (MultipartFile file : files) {
                String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();

                Path path = Paths.get("uploads/" + filename);

                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());

                paths.add(filename);
            }
        }

        dish.setImages(paths);

        return dishService.create(dish);
    }

    @PutMapping(value = "/{id}/with-images", consumes = "multipart/form-data")
    public Dish updateWithImages(
            @PathVariable Long id,
            @RequestPart("dish") String dishJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();

        Dish dish = mapper.readValue(dishJson, Dish.class);

        List<String> paths = new ArrayList<>();

        // старые фото
        if (dish.getImages() != null) {
            paths.addAll(dish.getImages());
        }

        // новые фото
        if (files != null) {

            if (paths.size() + files.size() > 5) {
                throw new RuntimeException("Максимум 5 фото");
            }

            for (MultipartFile file : files) {

                String filename =
                        System.currentTimeMillis() +
                                "_" +
                                file.getOriginalFilename();

                Path path = Paths.get("uploads/" + filename);

                Files.createDirectories(path.getParent());

                Files.write(path, file.getBytes());

                paths.add(filename);
            }
        }

        dish.setImages(paths);

        return dishService.update(id, dish);
    }
}