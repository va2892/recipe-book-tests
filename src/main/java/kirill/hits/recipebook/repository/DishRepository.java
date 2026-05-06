package kirill.hits.recipebook.repository;

import kirill.hits.recipebook.model.Dish;
import kirill.hits.recipebook.model.enums.DishCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {

    List<Dish> findByNameContainingIgnoreCase(String name);
    List<Dish> findByCategory(DishCategory category);

}
