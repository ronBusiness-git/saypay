import { test, expect } from '@playwright/test';

test.describe('Echo Conversational Payment Gateway & PayPal Sandbox Flow', () => {

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => console.log('[PAGE ERROR]:', err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('[BROWSER LOG ERROR]:', msg.text());
    });
  });

  test('ECHO-01: /new-check UI verification (Echo name, Mute button, No language switcher)', async ({ page }) => {
    await page.goto('/new-check');
    await expect(page).toHaveTitle(/SayPay/i);

    // 1. Verify Echo name is displayed instead of SayPay Assist
    await expect(page.locator('text=Echo').first()).toBeVisible();
    await expect(page.locator('text=Autonomous voice payment companion').first()).toBeVisible();

    // 2. Verify Language switcher pills (EN, ES, FR, DE) are removed (exact text)
    await expect(page.locator('button:text-is("EN")')).not.toBeVisible();
    await expect(page.locator('button:text-is("ES")')).not.toBeVisible();
    await expect(page.locator('button:text-is("FR")')).not.toBeVisible();

    // 3. Verify Mute button is present and toggles properly
    const muteBtn = page.locator('button:has-text("Mute")');
    await expect(muteBtn).toBeVisible();
    await muteBtn.click();
    await expect(page.locator('button:has-text("Unmute")')).toBeVisible();
    await expect(page.locator('text=Microphone is muted')).toBeVisible();
    await page.locator('button:has-text("Unmute")').click();
    await expect(page.locator('button:has-text("Mute")')).toBeVisible();
  });

  test('ECHO-02: Clean Unpaid Invoice -> Stage 2 Safety Screening -> Stage 3 MatchCheck -> 1-Click PayPal -> Stage 4 Receipt', async ({ page }) => {
    await page.goto('/new-check');

    // 1. Wait for unpaid invoices list to load
    await expect(page.locator('text=Unpaid Invoices Ready for Payment')).toBeVisible({ timeout: 15000 });

    // 2. Pick a clean invoice that has not been paid before (e.g. GL-1043 or TN-2215)
    let reviewBtn = page.locator('div:has-text("GL-1043") button:has-text("Review & Pay")').first();
    if (!(await reviewBtn.isVisible())) {
      reviewBtn = page.locator('div:has-text("TN-2215") button:has-text("Review & Pay")').first();
    }
    if (!(await reviewBtn.isVisible())) {
      reviewBtn = page.locator('button:has-text("Review & Pay")').nth(1);
    }
    await reviewBtn.click();

    // 3. Verify Stage 2 Screening appears with animated security check
    const screeningSection = page.locator('text=Stage 2 · Deterministic Safety Screening');
    await expect(screeningSection).toBeVisible({ timeout: 5000 });

    // 4. Verify automatic progression to Stage 3 (Review & Confirm)
    const matchCheckHeader = page.locator('text=MatchCheck Verified · Ready for Payment');
    await expect(matchCheckHeader).toBeVisible({ timeout: 25000 });

    // 5. Verify NO [object Object] error is shown
    await expect(page.locator('text=[object Object]')).not.toBeVisible();

    // 6. Verify 4 green verification pills are visible
    await expect(page.locator('text=Recipient verified')).toBeVisible();
    await expect(page.locator('text=Amount matched')).toBeVisible();
    await expect(page.locator('text=Reference matched')).toBeVisible();
    await expect(page.locator('text=No duplicate')).toBeVisible();

    // 7. Verify 1-Click PayPal button is visible and active
    const payBtn = page.locator('button:has-text("with PayPal")');
    await expect(payBtn).toBeVisible();
    await expect(payBtn).toBeEnabled();

    // 8. Click Pay with PayPal
    await payBtn.click();

    // 9. Verify transition to Stage 4 (Receipt & Settlement)
    const receiptHeader = page.locator('h1:has-text("Payment Completed via PayPal Sandbox")');
    await expect(receiptHeader).toBeVisible({ timeout: 35000 });

    // 10. Verify transaction and capture IDs are displayed
    await expect(page.locator('text=Transaction ID')).toBeVisible();
    await expect(page.locator('text=PayPal Capture ID')).toBeVisible();
  });

  test('ECHO-03: Security Screening catches DUPLICATE_PAYMENT and blocks payment', async ({ page }) => {
    await page.goto('/new-check');

    // 1. Select GL-1042 (which already has a settled transaction in the ledger)
    const gl1042Btn = page.locator('div:has-text("GL-1042") button:has-text("Review & Pay")').first();
    if (await gl1042Btn.isVisible()) {
      await gl1042Btn.click();

      // 2. Verify it transitions to Stage 3 BLOCKED
      await expect(page.locator('text=Payment Blocked by Safety Rules')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('text=DUPLICATE_PAYMENT')).toBeVisible();
      await expect(page.locator('button:has-text("Payment Blocked by Safety Rules")')).toBeDisabled();
    }
  });

  test('ECHO-04: Conversational Text Intent -> Echo AI response & Stage progression', async ({ page }) => {
    await page.goto('/new-check');

    // 1. Type payment intent in manual entry
    const typeInsteadBtn = page.locator('text=Type instead');
    if (await typeInsteadBtn.isVisible()) {
      await typeInsteadBtn.click();
    }

    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Show my unpaid bills');

    const sendBtn = page.locator('button:has-text("Send")');
    await sendBtn.click();

    // 2. Verify Echo response appears in transcript
    await expect(page.locator('text=unpaid invoices').first()).toBeVisible({ timeout: 15000 });
  });

  test('ECHO-05: Dashboard AI Assistant integration', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Echo Assistant panel on Dashboard
    await expect(page.locator('text=Echo').first()).toBeVisible();

    // 2. Verify Recent Transactions AG Grid table is loaded
    await expect(page.locator('.ag-root')).toBeVisible({ timeout: 15000 });
  });
});
