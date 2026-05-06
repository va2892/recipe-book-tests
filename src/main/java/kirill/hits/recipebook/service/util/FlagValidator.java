package kirill.hits.recipebook.service.util;

import kirill.hits.recipebook.model.DishProduct;
import kirill.hits.recipebook.model.enums.Flag;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FlagValidator {
    public static Set<Flag> calculateAllowedFlags(List<DishProduct> items) {
        Set<Flag> allowed =
                new HashSet<>(Set.of(
                        Flag.VEGAN,
                        Flag.GLUTEN_FREE,
                        Flag.SUGAR_FREE
                ));

        for (DishProduct dp : items) {
            Set<Flag> productFlags = dp.getProduct().getFlags();
            allowed.retainAll(productFlags);
        }

        return allowed;
    }
}