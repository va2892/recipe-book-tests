package kirill.hits.recipebook.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import kirill.hits.recipebook.model.enums.DishCategory;
import kirill.hits.recipebook.model.enums.Flag;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "dishes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 2)
    private String name;

    @NotNull
    @Min(0)
    private Double calories;

    @NotNull
    @Min(0)
    private Double proteins;

    @NotNull
    @Min(0)
    private Double fats;

    @NotNull
    @Min(0)
    private Double carbs;

    @NotNull
    @Min(1)
    private Double portionSize;

    @Enumerated(EnumType.STRING)
    @NotNull
    private DishCategory category;

    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DishProduct> products = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "dish_flags")
    @Enumerated(EnumType.STRING)
    private Set<Flag> flags = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "dish_images")
    @Column(name = "image_path")
    private List<String> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void validateBJU() {

        if (proteins + fats + carbs > 100) {
            throw new RuntimeException("Сумма БЖУ блюда не может превышать 100");
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        updatedAt = LocalDateTime.now();
    }

}