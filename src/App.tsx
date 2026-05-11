import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import DishList from "./pages/DishList";
import DishForm from "./pages/DishForm";
import DishEdit from "./pages/DishEdit";

import { AppBar, Toolbar, Button } from "@mui/material";

function App() {
    return (
        <BrowserRouter>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" href="/products">Продукты</Button>
                    <Button color="inherit" href="/dishes">Блюда</Button>
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/products" element={ <ProductList /> }/>
                <Route path="/products/new"element={ <ProductForm /> }/>
                <Route path="/dishes"element={ <DishList /> }/>
                <Route path="/dishes/new" element={ <DishForm /> }/>
                <Route path="/products/edit/:id" element={<ProductForm />} />
                <Route path="/dishes/edit/:id" element={<DishForm />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;