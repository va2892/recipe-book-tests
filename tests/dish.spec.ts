import { test, expect, request } from '@playwright/test';

const unique = () => `Dish-${Date.now()}-${Math.random()}`;

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByText('Блюда').click();
    await page.getByRole('button', { name: 'Добавить блюдо' }).click();
});

async function deleteDish(page, name: string) {
    const card = page.locator('[data-testid="dish-card"]').filter({ hasText: name });
    await card.getByRole('button', { name: 'Удалить' }).click();
}

test('Should create valid dish', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
    await expect(page.getByText(name)).toBeVisible();
    await deleteDish(page, name);
});

const macroses = {
    '!суп': 'Суп',
    '!десерт': 'Десерт',
    '!первое': 'Первое',
    '!второе': 'Второе',
    '!напиток': 'Напиток',
    '!салат': 'Салат',
    '!перекус': 'Перекус'
};
for (const [macros, category] of Object.entries(macroses)) {

    test(`Should enable macros ${macros}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(macros + name);
        await page.getByRole('button', { name: 'Добавить продукт' }).click();

        await page.getByRole('button', { name: 'Создать блюдо' }).click();

        const card = page.locator('[data-testid="dish-card"]').filter({ hasText: name });
        await expect(card).toContainText(category);
        await deleteDish(page, name);
    });

}

test('Should not create invalid dish without category', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Категория не задана. Добавьте макрос (!суп, !десерт и т.д.) или выберите категорию вручную');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
});

test('Should not create invalid dish without any products', async ({ page }) => {

    const name = unique();

    await page.getByLabel('Название').fill('!суп' + name);

    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Добавьте хотя бы один продукт');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
});

const invalidNames = ['', ' ', '  ', 'A'];
for (const name of invalidNames) {

    test(`Should reject invalid dish name = "${name}"`, async ({ page }) => {

        await page.getByLabel('Название').fill(name);

        await page.getByLabel('Категория').click();
        await page.getByRole('option', { name: 'Первое' }).click();

        await page.getByRole('button', { name: 'Добавить продукт' }).click();

        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Название должно содержать минимум 2 символа');
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Создать блюдо' }).click();
    });
}

const validNames = ['BB', 'AAA'];
for (const name of validNames) {

    test(`Should accept valid dish name = "${name}"`, async ({ page }) => {

        await page.getByLabel('Название').fill(name);

        await page.getByLabel('Категория').click();
        await page.getByRole('option', { name: 'Первое' }).click();

        await page.getByRole('button', { name: 'Добавить продукт' }).click();

        await page.getByRole('button', { name: 'Создать блюдо' }).click();
        await expect(page.getByText(name)).toBeVisible();
        await deleteDish(page, name);
    });
}

const validPortions = [1, 2];
for (const portion of validPortions) {

    test(`Should accept portion = ${portion}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);

        await page.getByLabel('Категория').click();
        await page.getByRole('option', { name: 'Первое' }).click();

        await page.getByRole('button', { name: 'Добавить продукт' }).click();

        await page.getByLabel('Размер порции').fill(String(portion));

        await page.getByRole('button', { name: 'Создать блюдо' }).click();
        await expect(page.getByText(name)).toBeVisible();
        await deleteDish(page, name);
    });
}

const invalidPortions = [0, -1];
for (const portion of invalidPortions) {

    test(`Should reject portion = ${portion}`, async ({ page }) => {

        const name = unique();
        await page.getByLabel('Название').fill(name);

        await page.getByLabel('Категория').click();
        await page.getByRole('option', { name: 'Первое' }).click();

        await page.getByRole('button', { name: 'Добавить продукт' }).click();

        await page.getByLabel('Размер порции').fill(String(portion));

        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Размер порции должен быть > 0');
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Создать блюдо' }).click();
    });
}

test('Should upload dish image', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.setInputFiles(
        'input[type="file"]',
        'tests/files/test.jpg'
    );

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
    await expect(page.getByText(name)).toBeVisible();
    await deleteDish(page, name);
});

test('Should upload dish with 5 image', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.setInputFiles(
        'input[type="file"]',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg'
    );

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
    await expect(page.getByText(name)).toBeVisible();
    await deleteDish(page, name);
});

test('Should reject dish with more than 5 image', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Максимум 5 фото');
        await dialog.accept();
    });

    await page.setInputFiles(
        'input[type="file"]',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg',
        'tests/files/test.jpg'
    );
});

test('Should delete dish', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.getByRole('button', { name: 'Создать блюдо' }).click();
    await deleteDish(page, name);
    await expect(page.getByText(name)).not.toBeVisible();
});

test('Should update dish', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.getByRole('button', { name: 'Создать блюдо' }).click();

    const card = page.locator('[data-testid="dish-card"]').filter({ hasText: name });
    await card.getByRole('button', { name: 'Редактировать' }).click();

    const updatedName = unique();
    const input = page.getByLabel('Название');

    await input.clear();
    await input.fill(updatedName);

    await page.getByRole('button', { name: 'Сохранить изменения' }).click();
    await expect(page.getByText(updatedName)).toBeVisible();
    await deleteDish(page, updatedName);
});

test('Should filter dishes by category', async ({ page }) => {

    const name = unique();
    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();
    await page.getByRole('button', { name: 'Добавить продукт' }).click();
    await page.getByRole('button', { name: 'Создать блюдо' }).click();

    await page.goto('http://localhost:3000/dishes');

    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    const firstCards = page.locator('[data-testid="dish-card"]').filter({ hasText: 'Первое' });
    const secondCards = page.locator('[data-testid="dish-card"]').filter({ hasText: 'Второе' });
    
    await expect(firstCards.first()).toBeVisible();
    await expect(secondCards).toHaveCount(0);

    await deleteDish(page, name);
});

test('Should show alert when all products removed in edit mode', async ({ page }) => {

    const name = unique();

    await page.getByLabel('Название').fill(name);
    await page.getByLabel('Категория').click();
    await page.getByRole('option', { name: 'Первое' }).click();

    await page.getByRole('button', { name: 'Добавить продукт' }).click();

    await page.getByRole('button', { name: 'Создать блюдо' }).click();

    const card = page.locator('[data-testid="dish-card"]').filter({ hasText: name });
    await card.getByRole('button', { name: 'Редактировать' }).click();

    const deleteButtons = page.getByRole('button', { name: 'Удалить' });
    await deleteButtons.first().click();

    page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Добавьте хотя бы один продукт');
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Сохранить изменения' }).click();
});