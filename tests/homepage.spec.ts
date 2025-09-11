import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/');

    // Check page title and main heading
    await expect(page).toHaveTitle(/Grocery PWA Platform/);
    await expect(page.getByRole('heading', { name: 'Multi-Tenant Grocery Platform' })).toBeVisible();

    // Check demo store section
    await expect(page.getByRole('heading', { name: 'Demo Store' })).toBeVisible();
    await expect(page.getByText('Ahmed Grocery Store')).toBeVisible();

    // Check language links
    await expect(page.getByRole('link', { name: 'View in French' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View in Arabic' })).toBeVisible();

    // Check features section
    await expect(page.getByRole('heading', { name: 'Multi-Tenant', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bilingual', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PWA Ready', exact: true })).toBeVisible();
  });

  test('should navigate to French store page', async ({ page }) => {
    await page.goto('/');
    
    // Click on French store link
    await page.getByRole('link', { name: 'View in French' }).click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should navigate to store page
    await expect(page).toHaveURL('/stores/ahmed-grocery?locale=fr');
  });

  test('should navigate to Arabic store page', async ({ page }) => {
    await page.goto('/');
    
    // Click on Arabic store link  
    await page.getByRole('link', { name: 'View in Arabic' }).click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should navigate to store page
    await expect(page).toHaveURL('/stores/ahmed-grocery?locale=ar');
  });
});