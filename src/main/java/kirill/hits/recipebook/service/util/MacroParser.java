package kirill.hits.recipebook.service.util;

import kirill.hits.recipebook.model.enums.DishCategory;

import java.util.Map;

public class MacroParser {

    private static final Map<String, DishCategory>
            MACROS = Map.of(

            "!десерт", DishCategory.DESSERT,
            "!первое", DishCategory.FIRST,
            "!второе", DishCategory.SECOND,
            "!напиток", DishCategory.DRINK,
            "!салат", DishCategory.SALAD,
            "!суп", DishCategory.SOUP,
            "!перекус", DishCategory.SNACK
    );

    public static DishCategory parseCategory(String name) {
        if (name == null) return null;

        for (String macro : MACROS.keySet()) {
            if (name.startsWith(macro)) {
                return MACROS.get(macro);
            }
        }

        return null;
    }

    public static String cleanName(String name) {
        if (name == null) return null;

        for (String macro : MACROS.keySet()) {
            if (name.startsWith(macro)) {
                return name.replace(macro, "").trim();
            }
        }

        return name;
    }
}