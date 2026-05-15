import { test, expect } from '@playwright/test';

const unique = () => `Chicken-${Date.now()}-${Math.random()}`;

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByText('Продукты').click();
    await page.getByRole('button', { name: 'Добавить продукт' }).click();
});

async function deleteProduct(page, name: string) {
    const card = page.locator('[data-testid="product-card"]').filter({hasText: name});
    await card.getByRole('button', { name: 'Удалить' }).click();
}

test('Should create valid product', async ({ page }) => {

    const name = "Chicken";
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Калории').fill('100');
    await page.getByLabel('Белки').fill('20');
    await page.getByLabel('Жиры').fill('5');
    await page.getByLabel('Углеводы').fill('0');

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Мясо' }).click();

    await page.getByLabel('Тип готовности').click();
    await page.getByRole('option', { name: 'Требует готовки' }).click();

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await expect(page).toHaveURL(/products/);
    await deleteProduct(page, name);
});

test('Should reject empty name', async ({ page }) => {

    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Название должно содержать минимум 2 символа');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Сохранить'}).click();
});

const names = {
    'valid': "AAA",
    'valid': "BB",
    'invalid': "", 
    'invalid': "A", 
    'invalid': "  "
};
for (const [isValid, name] of Object.entries(names)) {

    test(`Should accept valid and reject invalid name = ${name}`, async ({ page }) => {

        await page.getByLabel('Название').fill(name);

        if (isValid == 'valid') {
            await page.getByRole('button', { name: 'Сохранить'}).click();

            await expect(page.getByText(name)).toBeVisible();
            await expect(page).toHaveURL(/products/);
            await deleteProduct(page, name);
        }

        if (isValid == 'invalid') {
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('Название должно содержать минимум 2 символа');
                await dialog.accept();
            });

            await page.getByRole('button', { name: 'Сохранить'}).click();
        }
    });

}

const invalidNutrient = {
    'КБЖУ должны быть >= 0': -0.01,
    'Сумма БЖУ не должна быть > 100': 100.01
};
for (const [message, nutrient] of Object.entries(invalidNutrient)) {

    test(`Should reject invalid proteins = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Белки').fill(String(nutrient));

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain(message);
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Сохранить'}).click();
    });

    test(`Should reject invalid fats = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Жиры').fill(String(nutrient));

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain(message);
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Сохранить'}).click();
    });

    test(`Should reject invalid carbs = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Углеводы').fill(String(nutrient));

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain(message);
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Сохранить'}).click();
    });
}

test(`Should reject invalid callories = ${-0.01}`, async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Калории').fill(String(-0.01));

    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('КБЖУ должны быть >= 0');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Сохранить'}).click();
});

const validNutrient = [0, 0.01, 99.99, 100];
for (const nutrient of validNutrient) {

    test(`Should accept valid proteins = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Белки').fill(String(nutrient));
        await page.getByRole('button', { name: 'Сохранить'}).click();

        await expect(page.getByText(name)).toBeVisible();
        await expect(page).toHaveURL(/products/);
        await deleteProduct(page, name);
    });

    test(`Should accept valid fats = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Жиры').fill(String(nutrient));
        await page.getByRole('button', { name: 'Сохранить'}).click();

        await expect(page.getByText(name)).toBeVisible();
        await expect(page).toHaveURL(/products/);
        await deleteProduct(page, name);
    });

    test(`Should accept valid carbs = ${nutrient}`, async ({ page }) => {
        
        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Углеводы').fill(String(nutrient));
        await page.getByRole('button', { name: 'Сохранить'}).click();

        await expect(page.getByText(name)).toBeVisible();
        await expect(page).toHaveURL(/products/);
        await deleteProduct(page, name);
    });

    test(`Should accept valid callories = ${nutrient}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);
        await page.getByLabel('Калории').fill(String(nutrient));
        await page.getByRole('button', { name: 'Сохранить'}).click();

        await expect(page.getByText(name)).toBeVisible();
        await expect(page).toHaveURL(/products/);
        await deleteProduct(page, name);
    });
}

test('Should accept total nutrients = 99.99', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Белки').fill('39.99');
    await page.getByLabel('Жиры').fill('30');
    await page.getByLabel('Углеводы').fill('30');

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await deleteProduct(page, name);
});

test('Should accept total nutrients = 100', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Белки').fill('40');
    await page.getByLabel('Жиры').fill('30');
    await page.getByLabel('Углеводы').fill('30');

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await deleteProduct(page, name);
});

test('Should reject total nutrients = 100.01', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Белки').fill('40.01');
    await page.getByLabel('Жиры').fill('40');
    await page.getByLabel('Углеводы').fill('30');

    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Сумма БЖУ не должна быть > 100');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Сохранить' }).click();
});

test('Should upload image', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.setInputFiles(
        'input[type="file"]',
        'tests/files/test.jpg'
    );

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await deleteProduct(page, name);
});

test('Should upload 5 images', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.setInputFiles(
        'input[type="file"]',
        [
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg'
        ]
    );

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await deleteProduct(page, name);
});

test('Should reject more than 5 images', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Максимум 5 фото');
        await dialog.accept();
    });

    await page.setInputFiles(
        'input[type="file"]',
        [
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
            'tests/files/test.jpg',
        ]
    );
});

test('Should delete product', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await deleteProduct(page, name);
    await expect(page.getByText(name)).not.toBeVisible();
});

test('Should update product', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText(name)).toBeVisible();
    const card = page.locator('[data-testid="product-card"]').filter({ hasText: name });
    await card.getByRole('button', { name: 'Редактировать' }).click();

    await expect(page).toHaveURL(/edit/);

    const updatedName = unique();
    const input = page.getByLabel('Название');

    await input.clear();
    await input.fill(updatedName);

    await page.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.getByText(updatedName)).toBeVisible();
    await deleteProduct(page, updatedName);
});

test('Should filter products by category', async ({ page }) => {

    const name = "Chicken";
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Калории').fill('100');
    await page.getByLabel('Белки').fill('20');
    await page.getByLabel('Жиры').fill('5');
    await page.getByLabel('Углеводы').fill('0');
    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Мясо' }).click();
    await page.getByLabel('Тип готовности').click();
    await page.getByRole('option', { name: 'Требует готовки' }).click();
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await page.goto('http://localhost:3000/products');

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Мясо' }).click();

    const firstCards = page.locator('[data-testid="product-card"]').filter({ hasText: 'Мясо' });
    const secondCards = page.locator('[data-testid="product-card"]').filter({ hasText: 'Овощи' });
    
    await expect(firstCards.first()).toBeVisible();
    await expect(secondCards).toHaveCount(0);

    await deleteProduct(page, name);
});