package kirill.hits.recipebook.repository;

import kirill.hits.recipebook.model.DishProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DishProductRepository extends JpaRepository<DishProduct, Long> {

    boolean existsByProductId(Long productId);

    List<DishProduct> findByProductId(Long productId);

}