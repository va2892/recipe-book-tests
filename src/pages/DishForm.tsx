import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag } from "../models/Product";
import { DISH_CATEGORY_LABELS, FLAG_LABELS } from "../utils/dishLabels";
import { useParams } from "react-router-dom";
import { getDish, updateDish } from "../api/dishApi";

import { Container, Typography, TextField, Button, MenuItem, Select, FormControl, FormGroup, FormControlLabel, InputLabel, IconButton, Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { getProducts } from "../api/productApi";
import { createDish } from "../api/dishApi";
import { Dish, DishCategory } from "../models/Dish";
import { Product } from "../models/Product";

function DishForm() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const { id } = useParams();
    const isEdit = Boolean(id);

    const [dish, setDish] = useState<Dish>({
        name: "",
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
        portionSize: 100,
        category: DishCategory.SECOND,
        products: [],
        flags: []
    });

    const canEnableFlag = (flag: Flag) => {
        if (dish.products.length === 0) return false;
        if (products.length === 0) return false;

        return dish.products.every(p => {
            const product = products.find(prod => prod.id === p.productId);
            return product?.flags?.includes(flag);
        });
    };


    const toggleFlag = (flag: Flag) => {
        if (!canEnableFlag(flag)) return;

        setDish(prev => {
            const hasFlag = prev.flags.includes(flag);

            return {
                ...prev,
                flags: hasFlag
                    ? prev.flags.filter(f => f !== flag)
                    : [...prev.flags, flag]
            };
        });
    };

    const CATEGORY_MACROS: Record<string, DishCategory> = {
        "!десерт": DishCategory.DESSERT,
        "!первое": DishCategory.FIRST,
        "!второе": DishCategory.SECOND,
        "!напиток": DishCategory.DRINK,
        "!салат": DishCategory.SALAD,
        "!суп": DishCategory.SOUP,
        "!перекус": DishCategory.SNACK,
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        setDish(prev => ({
            ...prev,
            flags: prev.flags.filter(flag => canEnableFlag(flag))
        }));
    }, [dish.products, products]);

    useEffect(() => {
        if (!id) return;

        getDish(Number(id)).then(res => {
            const d = res.data;

            setExistingImages(d.images || []);

            setDish({
                ...d,
                flags: d.flags || [],
                products: d.products?.map((p: any) => ({
                    productId: p.product?.id,
                    amount: p.amount
                })) || []
            });
        });
    }, [id]);

    const loadProducts = async () => {
        const res = await getProducts();
        setProducts(res.data);
    };

    const normalizeDish = (dish: Dish) => {
        let name = dish.name;
        let category = dish.category;

        for (const macro in CATEGORY_MACROS) {
            if (name.toLowerCase().includes(macro)) {
                category = CATEGORY_MACROS[macro];
                name = name.replace(new RegExp(macro, "gi"), "").trim();
            }
        }

        return {
            ...dish,
            name,
            category
        };
    };

    const addProduct = () => {

        const updated = [
            ...dish.products,
            {
                productId: products[0]?.id || 0,
                amount: 100
            }
        ];

        setDish(prev => ({
            ...prev,
            products: updated
        }));

        recalculateNutrition(updated);
    };

    const updateProduct = (index: number, field: string, value: any) => {
        const updated = [...dish.products];

        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setDish(prev => ({
            ...prev,
            products: updated
        }));

        recalculateNutrition(updated);
    };

    const removeProduct = (index: number) => {

        const updated = [...dish.products];

        updated.splice(index, 1);

        setDish(prev => ({
            ...prev,
            products: updated
        }));

        recalculateNutrition(updated);
    };

    const recalculateNutrition = (
        productsList = dish.products
    ) => {

        let calories = 0;
        let proteins = 0;
        let fats = 0;
        let carbs = 0;

        productsList.forEach(item => {

            const product = products.find(
                p => p.id === item.productId
            );

            if (!product) return;

            calories += product.calories * item.amount / 100;
            proteins += product.proteins * item.amount / 100;
            fats += product.fats * item.amount / 100;
            carbs += product.carbs * item.amount / 100;
        });

        setDish(prev => ({
            ...prev,
            calories: Number(calories.toFixed(2)),
            proteins: Number(proteins.toFixed(2)),
            fats: Number(fats.toFixed(2)),
            carbs: Number(carbs.toFixed(2))
        }));
    };

    const handleSubmit = async () => {
        if (dish.products.length === 0) {
            alert("Добавьте хотя бы один продукт");
            return;
        }

        if (dish.name.trim().length < 2) {
            alert("Название должно содержать минимум 2 символа");
            return;
        }

        if (
            dish.calories < 0 ||
            dish.proteins < 0 ||
            dish.fats < 0 ||
            dish.carbs < 0
        ) {
            alert("КБЖУ должны быть > -1");
            return;
        }

        if (newFiles.length > 5) {
            alert("Можно загрузить максимум 5 фото");
            return;
        }

        const normalized = normalizeDish(dish);

        if (!normalized.category) {
            alert("Категория не задана. Добавьте макрос (!суп, !десерт и т.д.) или выберите категорию вручную");
            return;
        }

        const totalWeight = dish.products.reduce(
            (sum, p) => sum + p.amount,
            0
        );

        if (dish.proteins + dish.fats + dish.carbs > totalWeight) {
            alert("Сумма БЖУ не может превышать общий вес блюда");
            return;
        }

        const formData = new FormData();

        formData.append(
            "dish",
            JSON.stringify({
                ...dish,
                products: dish.products.map(p => ({
                    product: { id: p.productId },
                    amount: p.amount
                })),
                images: existingImages
            })
        );

        newFiles.forEach(file => {
            formData.append("files", file);
        });

        if (isEdit) {
            await fetch(`http://localhost:8080/api/dishes/${id}/with-images`, {
                method: "PUT",
                body: formData
            });

            navigate("/dishes");
        } else {
            try {
                const response = await fetch("http://localhost:8080/api/dishes/with-images", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Ошибка сервера");
                }

                navigate("/dishes");

            } catch (error: any) {
                alert(error.message || "Ошибка при создании блюда");
            }
        }
    };
    
    return (
        <Container>
            <Typography variant="h4" sx={{ mt: 2 }}>
                {isEdit ? "Редактировать блюдо" : "Создать блюдо"}
            </Typography>

            <TextField
                label="Название"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.name}
                onChange={(e) => setDish({ ...dish, name: e.target.value })}
            />

            <TextField
                label="Размер порции (г)"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.portionSize}
                onChange={(e) => {
                    const value = Number(e.target.value);

                    setDish(prev => ({
                        ...prev,
                        portionSize: value
                    }));
                }}
            />

            <TextField
                label="Калории"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.calories}
                onChange={(e) =>
                    setDish({ ...dish, calories: Number(e.target.value) })
                }
            />

            <TextField
                label="Белки"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.proteins}
                onChange={(e) =>
                    setDish({ ...dish, proteins: Number(e.target.value) })
                }
            />

            <TextField
                label="Жиры"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.fats}
                onChange={(e) =>
                    setDish({ ...dish, fats: Number(e.target.value) })
                }
            />

            <TextField
                label="Углеводы"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={dish.carbs}
                onChange={(e) =>
                    setDish({ ...dish, carbs: Number(e.target.value) })
                }
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Категория</InputLabel>
                <Select
                    value={dish.category || ""}
                    onChange={(e) => {
                        const value = e.target.value as DishCategory;
                        setDish(prev => ({
                            ...prev,
                            category: value || null
                        }));
                    }}
                >
                    <MenuItem key={0} value="">
                        Не выбрано
                    </MenuItem>

                    {Object.values(DishCategory).map(cat => (
                        <MenuItem key={cat} value={cat}>
                            {DISH_CATEGORY_LABELS[cat]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormGroup>
                <FormControlLabel 
                    control={
                        <Checkbox 
                            checked={dish.flags.includes(Flag.VEGAN)} 
                            onChange={() => toggleFlag(Flag.VEGAN)}
                            disabled={!canEnableFlag(Flag.VEGAN)}
                        />
                    } 
                    label="Веган"
                />

                <FormControlLabel
                    control={ 
                        <Checkbox 
                            checked={dish.flags.includes(Flag.GLUTEN_FREE)} 
                            onChange={() => toggleFlag(Flag.GLUTEN_FREE)}
                            disabled={!canEnableFlag(Flag.GLUTEN_FREE)}
                        /> 
                    }
                    label="Без глютена"
                />

                <FormControlLabel
                    control={ 
                        <Checkbox 
                            checked={dish.flags.includes(Flag.SUGAR_FREE)} 
                            onChange={() => toggleFlag(Flag.SUGAR_FREE)}
                            disabled={!canEnableFlag(Flag.SUGAR_FREE)}
                        />
                    }
                    label="Без сахара"
                />
            </FormGroup>

            <Button
                variant="outlined"
                component="label"
                sx={{ mt: 2 }}
            >
                Добавить фото

                <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {

                        if (!e.target.files) return;

                        const selected = Array.from(e.target.files);

                        const total =
                            existingImages.length +
                            newFiles.length +
                            selected.length;

                        if (total > 5) {
                            alert("Максимум 5 фото");
                            return;
                        }

                        setNewFiles(prev => [...prev, ...selected]);
                    }}
                />
            </Button>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 15
                }}
            >
                {existingImages.map((img, index) => (

                    <div
                        key={index}
                        style={{
                            position: "relative",
                            display: "grid"
                        }}
                    >
                        <img
                            src={`http://localhost:8080/${img}`}
                            width={120}
                            height={120}
                            style={{
                                objectFit: "cover",
                                borderRadius: 8
                            }}
                        />

                        <Button
                            color="error"
                            size="small"
                            onClick={() => {

                                setExistingImages(prev =>
                                    prev.filter((_, i) => i !== index)
                                );
                            }}
                        >
                            Удалить
                        </Button>

                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 15
                }}
            >
                {newFiles.map((file, index) => (

                    <div
                        key={index}
                        style={{
                            position: "relative",
                            display: "grid"
                        }}
                    >
                        <img
                            src={URL.createObjectURL(file)}
                            width={120}
                            height={120}
                            style={{
                                objectFit: "cover",
                                borderRadius: 8
                            }}
                        />

                        <Button
                            color="error"
                            size="small"
                            onClick={() => {
                                setNewFiles(prev =>
                                    prev.filter((_, i) => i !== index)
                                );
                            }}
                        >
                            Удалить
                        </Button>

                    </div>
                ))}
            </div>

            <Typography sx={{ mt: 3 }}>Состав блюда</Typography>

            {dish.products.map((p, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", marginTop: "10px" }} >

                    <Select value={p.productId} onChange={ (e) => updateProduct(index, "productId",Number(e.target.value)) }>
                        {products.map(prod => (
                            <MenuItem key={prod.id} value={prod.id}>{prod.name}</MenuItem>
                        ))}
                    </Select>

                    <TextField type="number" label="граммы" value={p.amount} onChange={ (e) => updateProduct(index, "amount", Number(e.target.value)) }/>

                    <IconButton onClick={ () => removeProduct(index) }>
                        <DeleteIcon/>
                    </IconButton>

                </div>
            ))}

            <div style={{display: "flex", gap: 10, marginBottom: 80}}>
                <Button variant="outlined" sx={{ mt: 3 }} onClick={addProduct}>Добавить продукт</Button>
                <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
                    {isEdit ? "Сохранить изменения" : "Создать блюдо"}
                </Button>
            </div>

        </Container>
    );
}

export default DishForm;