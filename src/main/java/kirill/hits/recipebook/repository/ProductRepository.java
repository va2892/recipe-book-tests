package kirill.hits.recipebook.repository;

import kirill.hits.recipebook.model.enums.CookingType;
import kirill.hits.recipebook.model.Product;
import kirill.hits.recipebook.model.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategory(ProductCategory category);
    List<Product> findByCookingType(CookingType cookingType);

}