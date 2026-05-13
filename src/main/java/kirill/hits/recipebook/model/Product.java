package kirill.hits.recipebook.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import kirill.hits.recipebook.model.enums.CookingType;
import kirill.hits.recipebook.model.enums.Flag;
import kirill.hits.recipebook.model.enums.ProductCategory;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

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
    @Max(100)
    private Double proteins;

    @NotNull
    @Min(0)
    @Max(100)
    private Double fats;

    @NotNull
    @Min(0)
    @Max(100)
    private Double carbs;

    @Column(length = 2000)
    private String composition;

    @Enumerated(EnumType.STRING)
    @NotNull
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @NotNull
    private CookingType cookingType;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_flags")
    @Enumerated(EnumType.STRING)
    private Set<Flag> flags = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_images")
    @Column(name = "image_path")
    private List<String> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonIgnore
    public Boolean isVegan() {
        return flags != null && flags.contains(Flag.VEGAN);
    }

    @JsonIgnore
    public Boolean isGlutenFree() {
        return flags != null && flags.contains(Flag.GLUTEN_FREE);
    }

    @JsonIgnore
    public Boolean isSugarFree() {
        return flags != null && flags.contains(Flag.SUGAR_FREE);
    }
}