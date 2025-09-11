import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test.describe('Supabase Connection', () => {
    test('should connect to Supabase successfully', async ({ page }) => {
      // Navigate to store page which uses Supabase queries
      const response = await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Should load successfully (not 500 error)
      expect(response?.status()).toBeLessThan(500);
      
      // Page should render without database connection errors
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle tenant data correctly', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Should display tenant name from database
      await expect(page.getByRole('heading', { name: /Ahmed|بقالة/ })).toBeVisible();
      
      // Should not show database error messages
      await expect(page.locator('text=/Error fetching/')).not.toBeVisible();
    });
  });

  test.describe('Data Loading', () => {
    test('should load store data without errors', async ({ page }) => {
      // Monitor console for errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/stores/ahmed-grocery?locale=fr');
      await page.waitForTimeout(3000); // Wait for data loading

      // Filter out non-critical errors
      const criticalErrors = errors.filter(error => 
        error.includes('Error fetching') || 
        error.includes('Failed to fetch') ||
        error.includes('Network error')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should handle empty product data gracefully', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      await page.waitForTimeout(2000);
      
      // Should either show products or empty state message
      const hasProducts = await page.locator('[data-testid="product-card"]').count() > 0;
      const hasEmptyMessage = await page.getByText(/Aucun produit en vedette/).isVisible();
      
      expect(hasProducts || hasEmptyMessage).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle non-existent store gracefully', async ({ page }) => {
      const response = await page.goto('/stores/non-existent-store-123');
      
      // Should return 404 status
      expect(response?.status()).toBe(404);
    });

    test('should handle malformed store slug', async ({ page }) => {
      const response = await page.goto('/stores/../../etc/passwd');
      
      // Should not cause server error
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe('Performance', () => {
    test('should load store page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Wait for content to be fully loaded - look for main content area
      await page.waitForSelector('main', { timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 15 seconds (generous for database queries)
      expect(loadTime).toBeLessThan(15000);
    });
  });

  test.describe('Database Security', () => {
    test('should not expose sensitive data in client', async ({ page }) => {
      await page.goto('/stores/ahmed-grocery?locale=fr');
      
      // Check that sensitive environment variables are not exposed
      const pageContent = await page.content();
      
      // Should not contain service role key or other secrets
      expect(pageContent).not.toContain('service_role');
      expect(pageContent).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'); // JWT prefix
    });
  });
});