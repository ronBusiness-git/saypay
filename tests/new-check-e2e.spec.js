import { test, expect } from '@playwright/test';

test.describe('SayPay /new-check Interactive & Staged E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => console.log('[PAGE ERROR]:', err.message));
    // Safely dismiss the sandbox welcome modal in test sessions without SecurityError
    await page.addInitScript(() => {
      try {
        window.localStorage?.setItem('saypay_welcome_dismissed', 'true');
      } catch {}
    });
  });

  test('Flow 1: /new-check typed/voice intent entry -> MatchCheck CLEAR -> Interactive Yes Pay -> Receipt', async ({ page }) => {
    // 1. Visit /new-check
    await page.goto('/new-check');
    await expect(page).toHaveTitle(/SayPay/i);

    // Verify presence of intent and request inputs
    const intentBox = page.locator('#intent-text');
    const requestBox = page.locator('#request-text');
    await expect(intentBox).toBeVisible();
    await expect(requestBox).toBeVisible();

    // 2. Clear and fill test scenario with a fresh reference so duplicate check passes CLEAR
    const uniqueRef = `GL-${Date.now().toString().slice(-4)}`;
    await intentBox.fill(`I want to pay USD 12.50 to GreenLeaf Demo Store for invoice ${uniqueRef}`);
    await requestBox.fill(`GreenLeaf Demo Store\nInvoice: ${uniqueRef}\nAmount: $12.50 USD\nThank you for your business!`);

    // 3. Trigger MatchCheck
    const checkButton = page.locator('#check-payment-button');
    await expect(checkButton).toBeEnabled();
    await checkButton.click();

    // 4. Verify MatchCheck returns CLEAR and Human Confirmation Banner appears (Gemini extraction can take ~10-15s)
    const confirmSection = page.locator('text=MatchCheck Passed · CLEAR');
    await expect(confirmSection).toBeVisible({ timeout: 35000 });

    const payButton = page.locator('#confirm-pay-now-button');
    await expect(payButton).toBeVisible();
    await expect(payButton).toContainText('Yes, Pay with PayPal');

    // 5. Human clicks "Yes, Pay with PayPal" to authorize and execute sandbox transaction
    await payButton.click();

    // 6. Verify transition to /result/[transactionId]
    await expect(page).toHaveURL(/\/result\//, { timeout: 25000 });
    await expect(page.locator('text=Verified by server')).toBeVisible();
    await expect(page.locator('text=COMPLETED').first()).toBeVisible();
  });

  test('Flow 2: /new-check -> Stage 2 MatchCheck -> Stage 3 Confirm & Pay -> Stage 4 Receipt', async ({ page }) => {
    // 1. Visit /new-check
    await page.goto('/new-check');

    const intentBox = page.locator('#intent-text');
    const requestBox = page.locator('#request-text');
    const uniqueRef = `GL-${(Date.now() + 100).toString().slice(-4)}`;
    await intentBox.fill(`I want to pay USD 12.50 to GreenLeaf Demo Store for invoice ${uniqueRef}`);
    await requestBox.fill(`GreenLeaf Demo Store\nInvoice: ${uniqueRef}\nAmount: $12.50 USD`);

    // Trigger check
    await page.locator('#check-payment-button').click();

    // Wait for CLEAR banner (Gemini extraction can take ~10-15s)
    await expect(page.locator('text=MatchCheck Passed · CLEAR')).toBeVisible({ timeout: 35000 });

    // Click step-by-step review
    const stepLink = page.locator('text=Or review details step-by-step');
    await expect(stepLink).toBeVisible();
    await stepLink.click();

    // 2. Stage 2: /checks/[checkId]
    await expect(page).toHaveURL(/\/checks\//, { timeout: 15000 });
    await expect(page.locator('h1, h2, span').filter({ hasText: /AI Match & Safety Check/i }).first()).toBeVisible({ timeout: 15000 });

    // Click "Continue to review"
    const continueReview = page.locator('text=Continue to review');
    if (await continueReview.isVisible()) {
      await continueReview.click();
    } else {
      await page.locator('a[href*="/checkout/"]').first().click();
    }

    // 3. Stage 3: /checkout/[checkId]
    await expect(page).toHaveURL(/\/checkout\/[^/]+$/, { timeout: 20000 });
    await expect(page.locator('text=Review the payment details').first()).toBeVisible();

    // Click "continue to confirm"
    await page.locator('#continue-to-confirm-link').click();

    // 4. Stage 3 Confirm: /checkout/[checkId]/confirm
    await expect(page).toHaveURL(/\/checkout\/[^/]+\/confirm/, { timeout: 20000 });
    await expect(page.locator('text=Confirm this payment').first()).toBeVisible();

    // Confirm with button
    const confirmBtn = page.locator('#confirm-button');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verify CONFIRMED_PAY and unlock PayPal button
    const continuePaypal = page.locator('#continue-to-paypal-button');
    await expect(continuePaypal).toBeVisible({ timeout: 20000 });
    await continuePaypal.click();

    // 5. Stage 3 Pay: /checkout/[checkId]/pay
    await expect(page).toHaveURL(/\/checkout\/[^/]+\/pay/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Continue in PayPal Sandbox' })).toBeVisible();

    // Click Approve in PayPal Sandbox
    const approveBtn = page.locator('#approve-paypal-sandbox-button');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // 6. Stage 4: /result/[transactionId]
    await expect(page).toHaveURL(/\/result\//, { timeout: 25000 });
    await expect(page.locator('text=Verified by server')).toBeVisible();
  });

  test('Flow 3: /history shows captured transactions and search filter works', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('text=Transaction History')).toBeVisible();

    // Search bar check
    const searchInput = page.locator('input[placeholder*="Search merchant"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('GreenLeaf');

    // Confirm filtered results remain visible
    await expect(page.locator('text=GreenLeaf Demo Store').first()).toBeVisible();
  });

});
