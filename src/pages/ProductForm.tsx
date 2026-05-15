import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getProduct, updateProduct } from "../api/productApi";
import { CATEGORY_LABELS, COOKING_TYPE_LABELS, FLAG_LABELS } from "../utils/productLabels";

import { Container, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput} from "@mui/material";
import { createProduct } from "../api/productApi";

import { Product, ProductCategory, CookingType, Flag } from "../models/Product";

function ProductForm() {
    const navigate = useNavigate();

    const { id } = useParams();
    const isEdit = Boolean(id);

    const [product, setProduct] = useState<Product>({
        name: "",
        calories: 0,
        proteins: 0,
        fats: 0,
        carbs: 0,
        composition: "",
        category: ProductCategory.VEGETABLES,
        cookingType: CookingType.NEEDS_COOKING,
        flags: []
    });

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const handleChange = (field: string, value: any) => { 
        setProduct({ ...product, [field]: value });
    };

    const handleSubmit = async () => {
        if (product.name.trim().length < 2) {
            alert("Название должно содержать минимум 2 символа");
            return;
        }

        if (
            product.calories < 0 ||
            product.proteins < 0 ||
            product.fats < 0 ||
            product.carbs < 0
        ) {
            alert("КБЖУ должны быть >= 0");
            return;
        }

        if (product.proteins + product.fats + product.carbs > 100) {
            alert("Сумма БЖУ не должна быть > 100");
            return;
        }

        if (existingImages.length + newFiles.length > 5) {
            alert("Можно загрузить максимум 5 фото");
            return;
        }

        const formData = new FormData();
        formData.append(
            "product",
            JSON.stringify({
                ...product,
                images: existingImages
            })
        );

        newFiles.forEach(file =>
            formData.append("files", file)
        );

        try {
            let response;

            if (isEdit) {
                response = await fetch(`http://localhost:8080/api/products/${id}/with-images`, {
                    method: "PUT",
                    body: formData
                });
            } else {
                response = await fetch("http://localhost:8080/api/products/with-images", {
                    method: "POST",
                    body: formData
                });
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Ошибка сервера");
            }

            navigate("/products");

        } catch (error: any) {
            alert(error.message || "Ошибка");
        }
    };

    useEffect(() => {
        if (!id) return;

        getProduct(Number(id)).then(res => {
            const data = res.data;
            setProduct(data);
            setExistingImages(data.images || []);
        });

    }, [id]);

    return (
        <Container>

            <Typography variant="h4" sx={{ mt: 2 }}>Создать продукт</Typography>

            <TextField 
                label="Название" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.name} 
                onChange={ (e) => handleChange("name", e.target.value) }
            />
            <TextField 
                label="Калории" 
                type="number" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.calories} 
                onChange={ (e) => handleChange("calories", Number(e.target.value)) }
            />
            <TextField 
                label="Белки" 
                type="number" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.proteins} 
                onChange={ (e) => handleChange("proteins", Number(e.target.value)) }
            />
            <TextField 
                label="Жиры" 
                type="number" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.fats} 
                onChange={ (e) => handleChange("fats", Number(e.target.value)) }
            />
            <TextField 
                label="Углеводы" 
                type="number" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.carbs} 
                onChange={ (e) => handleChange("carbs", Number(e.target.value)) }
            />
            <TextField 
                label="Состав" 
                fullWidth 
                sx={{ mt: 2 }} 
                value={product.composition} 
                onChange={ (e) => handleChange("composition", e.target.value) }
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="category-label">Категория</InputLabel>

                <Select 
                    labelId="category-label" 
                    label="Категория" 
                    value={product.category} 
                    onChange={ (e) => handleChange("category", e.target.value) }
                >
                    {Object.values(ProductCategory).map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="cooking-label">Тип готовности</InputLabel>

                <Select 
                    labelId="cooking-label" 
                    label="Тип готовности" 
                    value={product.cookingType} 
                    onChange={ (e) => handleChange("cookingType", e.target.value) }
                >
                    {Object.values(CookingType).map((type) => (
                        <MenuItem key={type} value={type}>
                            {COOKING_TYPE_LABELS[type]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Флаги</InputLabel>

                <Select 
                    multiple 
                    value={product.flags} 
                    onChange={ (e) => handleChange("flags", e.target.value) } 
                    input={ <OutlinedInput /> }
                    renderValue={(selected) =>
                        (selected as Flag[])
                            .map(flag => FLAG_LABELS[flag])
                            .join(", ")
                    }
                >
                    {Object.values(Flag).map( (flag) => (
                        <MenuItem key={flag} value={flag}>
                            <Checkbox checked={ product.flags.includes(flag) }/>
                            <ListItemText primary={FLAG_LABELS[flag]}/>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

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

            <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>Сохранить</Button>

        </Container>
    );
}

export default ProductForm;