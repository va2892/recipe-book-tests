package kirill.hits.recipebook.repository;

import kirill.hits.recipebook.model.Dish;
import kirill.hits.recipebook.model.enums.DishCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {

    List<Dish> findByNameContainingIgnoreCase(String name);
    List<Dish> findByCategory(DishCategory category);
    @Query("""
        SELECT d FROM Dish d
        WHERE (:category IS NULL OR d.category = :category)
        AND (:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')))
        AND (:vegan IS NULL OR :vegan = false OR 'VEGAN' MEMBER OF d.flags)
        AND (:glutenFree IS NULL OR :glutenFree = false OR 'GLUTEN_FREE' MEMBER OF d.flags)
        AND (:sugarFree IS NULL OR :sugarFree = false OR 'SUGAR_FREE' MEMBER OF d.flags)
    """)
    List<Dish> filter(
            @Param("category") DishCategory category,
            @Param("name") String name,
            @Param("vegan") Boolean vegan,
            @Param("glutenFree") Boolean glutenFree,
            @Param("sugarFree") Boolean sugarFree
    );

}
