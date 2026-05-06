package kirill.hits.recipebook.controller;

import kirill.hits.recipebook.model.Dish;
import kirill.hits.recipebook.service.DishService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

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

    @GetMapping
    public List<Dish> getAll() {
        return dishService.getAll();
    }

    @GetMapping("/{id}")
    public Dish getById(@PathVariable Long id) {
        return dishService.getById(id);
    }

    @PostMapping
    public Dish create(@RequestBody Dish dish) {
        return dishService.create(dish);
    }

    @PutMapping("/{id}")
    public Dish update(@PathVariable Long id, @RequestBody Dish dish) {
        return dishService.update(id, dish);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        dishService.delete(id);
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
}