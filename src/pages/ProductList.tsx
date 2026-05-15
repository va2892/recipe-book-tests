import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField } from "@mui/material";
import { ProductCategory, CookingType, Flag } from "../models/Product";
import { Grid, Card, CardContent, CardMedia, Chip, Stack, Box } from "@mui/material";
import { getProducts, deleteProduct } from "../api/productApi";
import { Product } from "../models/Product";
import { CATEGORY_LABELS, COOKING_TYPE_LABELS, FLAG_LABELS } from "../utils/productLabels";

function ProductList() {
    interface ProductFilters {
        name: string;
        category: string;
        cookingType: string;
        vegan: boolean | null;
        glutenFree: boolean | null;
        sugarFree: boolean | null;
        sortBy: string;
        direction: string;
    }

    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<ProductFilters>({
        name: "",
        category: "",
        cookingType: "",
        vegan: null,
        glutenFree: null,
        sugarFree: null,
        sortBy: "name",
        direction: "asc"
    });

    const loadProducts = async () => {
        const params: any = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "") {
                params[key] = value;
            }
        });

        const res = await getProducts(params);
        setProducts(res.data);
    };

    useEffect(() => {
        loadProducts();
    }, [filters]);


    const handleDelete = async (id?: number) => {
        if (!id) return;

        try {
            await deleteProduct(id);
            loadProducts();

        } catch (error: any) {

            if (error.response) {
                alert(error.response?.data);
            } else {
                alert("Ошибка удаления");
            }
        }
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ mt: 2 }}>Список продуктов</Typography>
            <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => navigate("/products/new")}>Добавить продукт</Button>

            <br/>

            <TextField label="Поиск" value={filters.name} onChange={ (e) => setFilters({ ...filters, name: e.target.value }) }/>

            <FormControl style={{ width: 250 }}>
                <InputLabel>Тип готовности</InputLabel>

                <Select
                    value={filters.cookingType}
                    label="Тип готовности"
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            cookingType: e.target.value
                        })
                    }
                >
                    <MenuItem value="">Все</MenuItem>

                    <MenuItem value="READY_TO_EAT">
                        Готово к употреблению
                    </MenuItem>

                    <MenuItem value="SEMI_FINISHED">
                        Полуфабрикат
                    </MenuItem>

                    <MenuItem value="NEEDS_COOKING">
                        Требует приготовления
                    </MenuItem>
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel id="category-label">Категория</InputLabel>
                <Select 
                    labelId="category-label" 
                    label="Категория"
                    style={{ width: 130 }} 
                    value={filters.category} 
                    onChange={ (e) => setFilters({ ...filters, category: e.target.value }) }
                >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="FROZEN">Замороженное</MenuItem>
                    <MenuItem value="MEAT">Мясо</MenuItem>
                    <MenuItem value="VEGETABLES">Овощи</MenuItem>
                    <MenuItem value="GREENS">Зелень</MenuItem>
                    <MenuItem value="SPICES">Специи</MenuItem>
                    <MenuItem value="GRAINS">Зерна</MenuItem>
                    <MenuItem value="CANNED">Консервы</MenuItem>
                    <MenuItem value="LIQUID">Напитки</MenuItem>
                    <MenuItem value="SWEETS">Сладкое</MenuItem>
                </Select>   
            </FormControl>

            <FormControl>
                <InputLabel>Сортировка</InputLabel>
                <Select style={{ width: 130 }} value={filters.sortBy} onChange={ (e) => setFilters({ ...filters, sortBy: e.target.value }) }>
                    <MenuItem value="name">Название</MenuItem>
                    <MenuItem value="calories">Калории</MenuItem>
                    <MenuItem value="proteins">Белки</MenuItem>
                    <MenuItem value="fats">Жиры</MenuItem>
                    <MenuItem value="carbs">Углеводы</MenuItem>
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel>Порядок</InputLabel>
                <Select style={{ width: 130 }} value={filters.direction} onChange={ (e) => setFilters({ ...filters, direction: e.target.value }) }>
                    <MenuItem value="asc">↑</MenuItem>
                    <MenuItem value="desc">↓</MenuItem>
                </Select>
            </FormControl>

            <br/>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={filters.vegan ?? false}
                        onChange={(e) => setFilters({ ...filters, vegan: e.target.checked ? true : null })}
                    />
                }
                label="Веган"
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={filters.glutenFree ?? false}
                        onChange={(e) => setFilters({ ...filters, glutenFree: e.target.checked ? true : null })}
                    />
                }
                label="Без глютена"
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={filters.sugarFree ?? false}
                        onChange={(e) => setFilters({ ...filters, sugarFree: e.target.checked ? true : null })}
                    />
                }
                label="Без сахара"
            />

            <Grid container spacing={3} sx={{ mt: 2 }}>

                {products.map((product) => (

                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={product.id}>
                        <Card
                            data-testid="product-card"
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 3,
                                boxShadow: 3
                            }}
                        >

                            {product.images && product.images.length > 0 && (

                                <div
                                    style={{
                                        display: "flex",
                                        overflowX: "auto",
                                        height: 160,
                                        gap: 8,
                                        padding: 10
                                    }}
                                >
                                    {product.images.map((img, i) => (

                                        <CardMedia
                                            key={i}
                                            component="img"
                                            image={`http://localhost:8080/${img}`}
                                            sx={{
                                                width: 180,
                                                height: 140,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                flexShrink: 0
                                            }}
                                        />

                                    ))}
                                </div>
                            )}

                            <CardContent sx={{ flexGrow: 1 }}>

                                <Typography variant="h6">
                                    {product.name}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {CATEGORY_LABELS[product.category]}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{ mt: 1 }}
                                >
                                    {COOKING_TYPE_LABELS[product.cookingType]}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        mt: 2,
                                        flexWrap: "wrap",
                                        gap: 1
                                    }}
                                >
                                    {product.flags?.map((flag, i) => (
                                        <Chip
                                            key={i}
                                            label={FLAG_LABELS[flag]}
                                            color="success"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>

                                <Typography sx={{ mt: 2 }}>
                                    🔥 {product.calories} ккал
                                </Typography>

                                <Typography>
                                    Б: {product.proteins}
                                    {" | "}
                                    Ж: {product.fats}
                                    {" | "}
                                    У: {product.carbs}
                                </Typography>

                                {product.composition && (
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 2 }}
                                    >
                                        {product.composition}
                                    </Typography>
                                )}
                                {!product.composition && <div style={{height: 36}}></div>}

                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 2,
                                        display: "block"
                                    }}
                                >
                                    Создан:
                                    {" "}
                                    {product.createdAt
                                        ? new Date(product.createdAt).toLocaleString()
                                        : "-"}
                                </Typography>

                                {product.createdAt !== product.updatedAt && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block"
                                        }}
                                    >
                                        Обновлён:
                                        {" "}
                                        {product.updatedAt
                                            ? new Date(product.updatedAt).toLocaleString()
                                            : "-"}
                                    </Typography>
                                )}
                                {product.createdAt == product.updatedAt && <div style={{height: 20}}></div>}         

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 2 }}
                                >

                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate(`/products/edit/${product.id}`)
                                        }
                                    >
                                        Редактировать
                                    </Button>

                                    <Button
                                        color="error"
                                        variant="contained"
                                        onClick={() =>
                                            handleDelete(product.id)
                                        }
                                    >
                                        Удалить
                                    </Button>

                                </Stack>

                            </CardContent>

                        </Card>

                    </Grid>
                ))}

            </Grid>
        </Container>
    );
}

export default ProductList;