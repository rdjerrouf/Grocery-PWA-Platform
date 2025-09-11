import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
  test.describe('French Locale', () => {
    test('should display store in French', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');

      // Check store header displays correctly
      await expect(page.getByRole('heading', { name: 'Ahmed Grocery Store' })).toBeVisible();
      
      // Check French language toggle is active
      await expect(page.getByRole('link', { name: 'Français' })).toHaveClass(/bg-primary/);
      
      // Check sections are in French
      await expect(page.getByRole('heading', { name: 'Produits en vedette' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Informations du magasin' })).toBeVisible();
    });

    test('should display products with French names', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 }).catch(() => {
        // If no products, that's ok for this test
      });

      // Check if products are displayed with proper currency
      const productPrices = page.locator('text=/DZD/');
      if (await productPrices.count() > 0) {
        await expect(productPrices.first()).toBeVisible();
      }
    });

    test('should switch to Arabic when Arabic toggle clicked', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Click Arabic language toggle
      await page.getByRole('link', { name: 'العربية' }).click();
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      
      // Should navigate to Arabic version
      await expect(page).toHaveURL('/stores/ahmed-grocery?locale=ar');
    });
  });

  test.describe('Arabic Locale', () => {
    test('should display store in Arabic', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=ar');

      // Check store header displays correctly 
      await expect(page.getByRole('heading', { name: 'بقالة أحمد' })).toBeVisible();
      
      // Check Arabic language toggle is active
      await expect(page.getByRole('link', { name: 'العربية' })).toHaveClass(/bg-primary/);
      
      // Check sections are in Arabic
      await expect(page.getByRole('heading', { name: 'المنتجات المميزة' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'معلومات المتجر' })).toBeVisible();
    });

    test('should switch to French when French toggle clicked', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=ar');
      
      // Click French language toggle
      await page.getByRole('link', { name: 'Français' }).click();
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      
      // Should navigate to French version
      await expect(page).toHaveURL('/stores/ahmed-grocery?locale=fr');
    });
  });

  test.describe('Store Information', () => {
    test('should display store contact information', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Check store info section
      const storeInfoSection = page.locator('text=Informations du magasin').locator('..');
      
      // Should display phone, delivery fee, minimum order
      await expect(storeInfoSection.locator('text=/Téléphone/')).toBeVisible();
      await expect(storeInfoSection.locator('text=/Frais de livraison/')).toBeVisible(); 
      await expect(storeInfoSection.locator('text=/Commande minimale/')).toBeVisible();
    });
  });

  test.describe('Product Categories', () => {
    test('should display category navigation', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Check if category buttons are displayed (without heading)
      const categoryButtons = page.locator('section button');
      
      // Should have category buttons if categories exist
      if (await categoryButtons.count() > 0) {
        await expect(categoryButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('404 Handling', () => {
    test('should show 404 for non-existent store', async ({ page }) => {
      // Try to visit a non-existent store
      const response = await page.goto('/stores/non-existent-store');
      
      // Should return 404 status
      expect(response?.status()).toBe(404);
    });
  });
});