import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const SEEDED_PRODUCTS = /Sofá Moderno Gris 3 Cuerpos|Mesa Comedor Roble 6 Personas/i;

test.describe('Smoke E2E', () => {
  test('admin login and dashboard loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /Admin productos/i })).toBeVisible();

    await page.getByPlaceholder('admin@example.com').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Entrar/i }).click();

    await expect(page.getByText(ADMIN_EMAIL)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Resumen')).toBeVisible();
    await expect(page.getByText('Vistas AR', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Stock bajo')).toBeVisible();
  });

  test('catalog to PDP to AR event tracked', async ({ page }) => {
    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: /Productos/i })).toBeVisible();

    const productCard = page.locator('a[href^="/productos/"]').first();
    await expect(productCard).toBeVisible();
    await productCard.click();

    await expect(page).toHaveURL(/\/productos\/[^/]+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const arButton = page.getByRole('button', { name: 'Ver en AR' });
    await expect(arButton).toBeVisible({ timeout: 10_000 });

    const [arResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/events/ar-view') && res.status() < 500, { timeout: 20_000 }),
      arButton.click(),
    ]);

    expect(arResponse.ok()).toBeTruthy();
    await expect(page.getByText('Escaneá para abrir AR')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar' }).click();
  });
});
