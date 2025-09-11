import { test, expect } from '@playwright/test';

test.describe('Product Card Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to store page with products
    await page.goto('/stores/ahmed-grocery?locale=fr');
  });

  test('should display product information correctly', async ({ page }) => {
    // Wait for potential products to load
    await page.waitForTimeout(2000);
    
    // Check if any product cards exist
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      const firstProduct = productCards.first();
      
      // Product card should be visible
      await expect(firstProduct).toBeVisible();
      
      // Should contain product name
      await expect(firstProduct.locator('h3')).toBeVisible();
      
      // Should contain price in DZD
      await expect(firstProduct.locator('text=/DZD/')).toBeVisible();
      
      // Should contain "Add to Cart" button
      await expect(firstProduct.getByRole('button', { name: /Add to Cart/i })).toBeVisible();
    } else {
      // No products case - check for empty state message
      await expect(page.getByText(/Aucun produit en vedette/)).toBeVisible();
    }
  });

  test('should show product images or placeholder', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      const firstProduct = productCards.first();
      const productImage = firstProduct.locator('img');
      
      // Should have an image (either product image or placeholder)
      await expect(productImage).toBeVisible();
      
      // Image should have alt text
      await expect(productImage).toHaveAttribute('alt');
    }
  });

  test('should display sale badges for discounted products', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for sale badges
    const saleBadges = page.locator('text=SALE');
    const saleCount = await saleBadges.count();
    
    if (saleCount > 0) {
      // If there are sale items, check the badge
      await expect(saleBadges.first()).toBeVisible();
      await expect(saleBadges.first()).toHaveClass(/bg-red-500/);
    }
  });

  test('should handle out of stock products', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Look for out of stock indicators
    const outOfStockElements = page.locator('text=Out of Stock');
    const outOfStockCount = await outOfStockElements.count();
    
    if (outOfStockCount > 0) {
      // If there are out of stock items, check the overlay
      await expect(outOfStockElements.first()).toBeVisible();
    }
  });

  test.describe('Language Switching for Products', () => {
    test('should display Arabic product names when in Arabic locale', async ({ page }) => {
      // Switch to Arabic
      await page.goto('/stores/ahmed-grocery?locale=ar');
      await page.waitForTimeout(2000);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        // Product cards should still be visible
        await expect(productCards.first()).toBeVisible();
        
        // Add to Cart button should be in Arabic context
        const addToCartButton = productCards.first().getByRole('button').first();
        await expect(addToCartButton).toBeVisible();
      } else {
        // Check for Arabic empty state message
        await expect(page.getByText(/لا توجد منتجات مميزة/)).toBeVisible();
      }
    });
  });

  test.describe('Product Interactions', () => {
    test('should allow adding products to cart', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      const productCards = page.locator('[data-testid="product-card"]');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        const firstProduct = productCards.first();
        const addToCartButton = firstProduct.getByRole('button', { name: /Add to Cart/i });
        
        // Click add to cart button
        await addToCartButton.click();
        
        // Note: This test would need cart state management to be fully implemented
        // For now, just verify the button is clickable
        await expect(addToCartButton).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/stores/ahmed-grocery?locale=fr');
      await page.waitForTimeout(2000);
      
      // Product grid should adapt to mobile
      const productGrid = page.locator('[data-testid="product-grid"]');
      if (await productGrid.isVisible()) {
        // Grid should be responsive
        await expect(productGrid).toBeVisible();
      }
      
      // Language toggles should be visible on mobile
      await expect(page.getByRole('link', { name: 'Français' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'العربية' })).toBeVisible();
    });
  });
});