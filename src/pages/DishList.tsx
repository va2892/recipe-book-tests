import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Typography, Button, FormControl, TextField, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { Grid, Card, CardContent, CardMedia, Chip, Stack } from "@mui/material";
import { getDishes, deleteDish } from "../api/dishApi";
import { Dish } from "../models/Dish";
import { DISH_CATEGORY_LABELS, FLAG_LABELS } from "../utils/dishLabels";

function DishList() {

    const [dishes, setDishes] =useState<Dish[]>([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: "",
        name: "",
        vegan: false,
        glutenFree: false,
        sugarFree: false
    });

    const loadDishes = async () => {
        const response = await getDishes(filters);
        console.log(response.data);
        setDishes(Array.isArray(response.data) ? response.data : []);
    };

    useEffect(() => {
        loadDishes();
    }, [filters]);

    const handleDelete = async (id?: number) => {
        if (!id) return;

        try {
            await deleteDish(id);
            loadDishes();
        } catch (error: any) {
            console.error(error);

            if (error) {
                alert(error.response.status);
            } else {
                alert("Нельзя удалить продукт, так как он используется в блюдах");
            }
        }
    };

    return (
        <Container>

            <Typography variant="h4" sx={{ mt: 2 }}>Список блюд</Typography>

            <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={ () => navigate("/dishes/new") }>Добавить блюдо</Button>

            <br/>

            <TextField
                label="Поиск"
                value={filters.name}
                onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                }
            />

            <FormControl>
                <InputLabel>Категория</InputLabel>
                <Select
                    value={filters.category}
                    style={{ width: 130 }}
                    onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                    }
                >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="DESSERT">Десерт</MenuItem>
                    <MenuItem value="FIRST">Первое</MenuItem>
                    <MenuItem value="SECOND">Второе</MenuItem>
                    <MenuItem value="DRINK">Напиток</MenuItem>
                    <MenuItem value="SALAD">Салат</MenuItem>
                    <MenuItem value="SOUP">Суп</MenuItem>
                    <MenuItem value="SNACK">Снэк</MenuItem>
                </Select>
            </FormControl>

            <FormControlLabel
                style={{ width: 140, height: 56, marginLeft: 20 }}
                control={
                    <Checkbox
                        checked={filters.vegan}
                        onChange={(e) =>
                            setFilters({ ...filters, vegan: e.target.checked })
                        }
                    />
                }
                label="Веганский"
            />

            <FormControlLabel
                style={{ width: 140, height: 56, marginLeft: 20 }}
                control={
                    <Checkbox
                        checked={filters.glutenFree}
                        onChange={(e) =>
                            setFilters({ ...filters, glutenFree: e.target.checked })
                        }
                    />
                }
                label="Без глютена"
            />

            <FormControlLabel
                style={{ width: 140, height: 56, marginLeft: 20 }}
                control={
                    <Checkbox
                        checked={filters.sugarFree}
                        onChange={(e) =>
                            setFilters({ ...filters, sugarFree: e.target.checked })
                        }
                    />
                }
                label="Без сахара"
            />

            <Grid container spacing={3} sx={{ mt: 2 }}>

                {dishes.map((dish) => (

                    <Grid
                        key={dish.id}
                        size={{ xs: 12, md: 6, lg: 4 }}
                    >

                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 3,
                                boxShadow: 3
                            }}
                        >

                            {dish.images && dish.images.length > 0 && (

                                <div
                                    style={{
                                        display: "flex",
                                        overflowX: "auto",
                                        gap: 8,
                                        padding: 10
                                    }}
                                >

                                    {dish.images.map((img, i) => (

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
                                    {dish.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {DISH_CATEGORY_LABELS[dish.category]}
                                </Typography>

                                <Typography sx={{ mt: 2 }}>
                                    🍽️ Порция: {dish.portionSize} г
                                </Typography>

                                <Typography>
                                    🔥 {dish.calories} ккал
                                </Typography>

                                <Typography>
                                    Б: {dish.proteins}
                                    {" | "}
                                    Ж: {dish.fats}
                                    {" | "}
                                    У: {dish.carbs}
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

                                    {dish.flags?.map((flag, i) => (

                                        <Chip
                                            key={i}
                                            label={FLAG_LABELS[flag]}
                                            color="success"
                                            variant="outlined"
                                        />

                                    ))}

                                </Stack>

                                <Typography
                                    variant="subtitle2"
                                    sx={{ mt: 2 }}
                                >
                                    Состав:
                                </Typography>

                                {dish.products?.map((dp, i) => (

                                    <Typography
                                        key={i}
                                        variant="body2"
                                    >
                                        • {dp.product?.name} — {dp.amount} г
                                    </Typography>

                                ))}

                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 2,
                                        display: "block"
                                    }}
                                >
                                    Создан:
                                    {" "}
                                    {dish.createdAt
                                        ? new Date(dish.createdAt).toLocaleString()
                                        : "-"}
                                </Typography>

                                {dish.updatedAt !== dish.createdAt && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "block"
                                        }}
                                    >
                                        Обновлён:
                                        {" "}
                                        {dish.updatedAt
                                            ? new Date(dish.updatedAt).toLocaleString()
                                            : "-"}
                                    </Typography>
                                )}
                                {dish.updatedAt === dish.createdAt && <div style={{height: 20}}></div>}

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 2 }}
                                >

                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate(`/dishes/edit/${dish.id}`)
                                        }
                                    >
                                        Редактировать
                                    </Button>

                                    <Button
                                        color="error"
                                        variant="contained"
                                        onClick={() =>
                                            handleDelete(dish.id)
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

export default DishList;