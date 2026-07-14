import { expect, test } from '@playwright/test';

const SEEDED_PRODUCT_SLUG = 'mesa-comedor-roble-6-personas';
const SEEDED_PRODUCT_NAME = 'Mesa Comedor Roble 6 Personas';

test.describe('Smoke E2E', () => {
  test('admin portal presents the access form when there is no session', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Portal de Mueblerías' })).toBeVisible();
    await expect(page.getByPlaceholder('tu@muebleria.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('catalog and product page guide users to a consultation', async ({ page }) => {
    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible();

    const inquiryLink = page.locator(`a[href="/catalog/casa-linda/${SEEDED_PRODUCT_SLUG}"]`);
    await expect(inquiryLink).toBeVisible();

    await page.goto(`/productos/${SEEDED_PRODUCT_SLUG}`);
    await expect(page.getByRole('heading', { name: SEEDED_PRODUCT_NAME })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Consultar por WhatsApp' })).toBeVisible();
    await expect(page.getByText('Disponibilidad a confirmar con la tienda')).toBeVisible();
  });
});
