import { test, expect } from '@playwright/test'; // <--- This is the line that was missing!

// Scenario 1: Authentication & Navigation
test('Scenario 1: Full user journey from Presentation to Dashboard', async ({ page }) => {
  await page.goto('/');

  // 1. Presentation Page
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Login Page
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /Sign In|Login/i }).click();

  // 3. Info Page
  await page.getByRole('button', { name: /Get Started|Go to Dashboard/i }).click();

  // 4. Dashboard Assertion
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 10000 });
});

// Scenario 2: RAM Volatility Proof
test('Scenario 2: Verify data wipes on refresh (RAM Proof)', async ({ page }) => {
  await page.goto('/');
  
  // Navigate through the 3 screens quickly
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /Sign In|Login/i }).click();
  await page.getByRole('button', { name: /Get Started|Go to Dashboard/i }).click();

  // Add an item to RAM
  await page.getByRole('button', { name: 'Add Transaction' }).click();
  // Fill the title and amount
  await page.locator('input[type="text"], input[placeholder*="name"]').first().fill('RAM Test Item');
  await page.locator('input[type="number"]').first().fill('150');
  // Click your save/add button (adjust text if your AddExpense.jsx uses a different word)
  await page.getByRole('button', { name: /Save|Add/i }).click();

  // Verify it exists in the table
  await expect(page.getByText('RAM Test Item')).toBeVisible();

  // THE PROOF: Refresh the browser
  await page.reload();

  // Verify the data is wiped
  await expect(page.getByText('RAM Test Item')).not.toBeVisible();
});

// Scenario 3: CRUD & Master-Detail Navigation
test('Scenario 3: View transaction details', async ({ page }) => {
  await page.goto('/');
  
  // 1. Navigate to Dashboard
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: /Sign In|Login/i }).click();
  await page.getByRole('button', { name: /Get Started|Go to Dashboard/i }).click();

  // 2. Add an item using your specific button text
  await page.getByRole('button', { name: 'Add Transaction' }).click();
  await page.locator('input[type="text"], input[placeholder*="name"]').first().fill('Special Coffee');
  await page.locator('input[type="number"]').first().fill('25');
  await page.getByRole('button', { name: /Save|Add/i }).click();

  // 3. Click the newly created row in the Master table
  await page.getByText('Special Coffee').click();

  // 4. Assert Detail view is open by looking for the "Back" button
  await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
  
  // 5. Prove we can go back to the Master table
  await page.getByRole('button', { name: /Back/i }).click();
  await expect(page.getByRole('button', { name: 'Add Transaction' })).toBeVisible();
});