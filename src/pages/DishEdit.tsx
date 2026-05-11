import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDish, updateDish } from "../api/dishApi";
import { Dish } from "../models/Dish";
import { Button, TextField, Container } from "@mui/material";

function DishEdit() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [dish, setDish] = useState<Dish | null>(null);

    useEffect(() => {
        if (id) {
            getDish(Number(id)).then(res => setDish(res.data));
        }
    }, [id]);

    const handleChange = (e: any) => {
        setDish({
            ...dish!,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        if (!dish || !id) return;

        await updateDish(Number(id), dish);
        navigate("/dishes");
    };

    if (!dish) return null;

    return (
        <Container>
            <h2>Редактирование блюда</h2>

            <TextField
                name="name"
                label="Название"
                value={dish.name}
                onChange={handleChange}
                fullWidth
            />

            <TextField
                name="calories"
                label="Калории"
                value={dish.calories}
                onChange={handleChange}
                fullWidth
            />

            <Button onClick={handleSave}>Сохранить</Button>
        </Container>
    );
}

export default DishEdit;