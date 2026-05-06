package kirill.hits.recipebook.service;

import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.ProductCategory;
import kirill.hits.recipebook.repository.DishProductRepository;
import kirill.hits.recipebook.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final DishProductRepository dishProductRepository;


    public Product create(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow( () -> new RuntimeException("Product not found") );
    }


    public Product update(Long id, Product product) {

        Product existing = getById(id);

        existing.setName(product.getName());
        existing.setCalories(product.getCalories());
        existing.setProteins(product.getProteins());
        existing.setFats(product.getFats());
        existing.setCarbs(product.getCarbs());
        existing.setCategory(product.getCategory());
        existing.setCookingType(product.getCookingType());
        existing.setComposition(product.getComposition());
        existing.setFlags(product.getFlags());

        return productRepository.save(existing);
    }

    public void delete(Long id) {
        boolean used = dishProductRepository.existsByProductId(id);

        if (used) {
            throw new RuntimeException("Нельзя удалить продукт — он используется в блюде");
        }

        productRepository.deleteById(id);
    }

    public List<Product> search(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> findAll(String name, ProductCategory category, Boolean requiresCooking, Boolean vegan, Boolean glutenFree, Boolean sugarFree, String sortBy, String direction) {
        List<Product> products = productRepository.findAll();

        return products.stream()

                .filter(p ->
                        name == null ||
                                p.getName().toLowerCase()
                                        .contains(name.toLowerCase())
                )

                .filter(p ->
                        category == null ||
                                p.getCategory() == category
                )

                .filter(p ->
                        requiresCooking == null ||
                                p.isRequiresCooking() == requiresCooking
                )

                .filter(p ->
                        vegan == null ||
                                p.isVegan() == vegan
                )

                .filter(p ->
                        glutenFree == null ||
                                p.isGlutenFree() == glutenFree
                )

                .filter(p ->
                        sugarFree == null ||
                                p.isSugarFree() == sugarFree
                )

                // 🔃 Сортировка

                .sorted((a, b) -> {

                    int cmp = 0;

                    switch (sortBy) {

                        case "calories":
                            cmp = Double.compare(a.getCalories(), b.getCalories());
                            break;

                        case "proteins":
                            cmp = Double.compare(a.getProteins(), b.getProteins());
                            break;

                        case "fats":
                            cmp = Double.compare(a.getFats(), b.getFats());
                            break;

                        case "carbs":
                            cmp = Double.compare(a.getCarbs(), b.getCarbs());
                            break;

                        default:
                            cmp = a.getName().compareToIgnoreCase(b.getName());
                    }

                    return direction.equals("desc") ? -cmp : cmp;
                })

                .toList();
    }
}
