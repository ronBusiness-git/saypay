# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: echo-conversational-gateway.spec.js >> Echo Conversational Payment Gateway & PayPal Sandbox Flow >> ECHO-03: Security Screening catches DUPLICATE_PAYMENT and blocks payment
- Location: tests\echo-conversational-gateway.spec.js:85:3

# Error details

```
Error: page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:3005/new-check
Call log:
  - navigating to "http://127.0.0.1:3005/new-check", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "Your Internet access is blocked" [level=1] [ref=e7]
    - paragraph [ref=e8]: Firewall or antivirus software may have blocked the connection.
    - generic [ref=e9]:
      - paragraph [ref=e10]: "Try:"
      - list [ref=e11]:
        - listitem [ref=e12]: Checking the connection
        - listitem [ref=e13]:
          - link "Checking firewall and antivirus configurations" [ref=e14] [cursor=pointer]:
            - /url: "#buttons"
        - listitem [ref=e15]:
          - link "Running Windows Network Diagnostics" [ref=e16] [cursor=pointer]:
            - /url: javascript:diagnoseErrors()
    - generic [ref=e17]: ERR_NETWORK_ACCESS_DENIED
  - button "Details" [ref=e19] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Echo Conversational Payment Gateway & PayPal Sandbox Flow', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     page.on('pageerror', (err) => console.log('[PAGE ERROR]:', err.message));
  7   |     page.on('console', (msg) => {
  8   |       if (msg.type() === 'error') console.log('[BROWSER LOG ERROR]:', msg.text());
  9   |     });
  10  |   });
  11  | 
  12  |   test('ECHO-01: /new-check UI verification (Echo name, Mute button, No language switcher)', async ({ page }) => {
  13  |     await page.goto('/new-check');
  14  |     await expect(page).toHaveTitle(/SayPay/i);
  15  | 
  16  |     // 1. Verify Echo name is displayed instead of SayPay Assist
  17  |     await expect(page.locator('text=Echo').first()).toBeVisible();
  18  |     await expect(page.locator('text=Autonomous voice payment companion').first()).toBeVisible();
  19  | 
  20  |     // 2. Verify Language switcher pills (EN, ES, FR, DE) are removed (exact text)
  21  |     await expect(page.locator('button:text-is("EN")')).not.toBeVisible();
  22  |     await expect(page.locator('button:text-is("ES")')).not.toBeVisible();
  23  |     await expect(page.locator('button:text-is("FR")')).not.toBeVisible();
  24  | 
  25  |     // 3. Verify Mute button is present and toggles properly
  26  |     const muteBtn = page.locator('button:has-text("Mute")');
  27  |     await expect(muteBtn).toBeVisible();
  28  |     await muteBtn.click();
  29  |     await expect(page.locator('button:has-text("Unmute")')).toBeVisible();
  30  |     await expect(page.locator('text=Microphone is muted')).toBeVisible();
  31  |     await page.locator('button:has-text("Unmute")').click();
  32  |     await expect(page.locator('button:has-text("Mute")')).toBeVisible();
  33  |   });
  34  | 
  35  |   test('ECHO-02: Clean Unpaid Invoice -> Stage 2 Safety Screening -> Stage 3 MatchCheck -> 1-Click PayPal -> Stage 4 Receipt', async ({ page }) => {
  36  |     await page.goto('/new-check');
  37  | 
  38  |     // 1. Wait for unpaid invoices list to load
  39  |     await expect(page.locator('text=Unpaid Invoices Ready for Payment')).toBeVisible({ timeout: 15000 });
  40  | 
  41  |     // 2. Pick a clean invoice that has not been paid before (e.g. GL-1043 or TN-2215)
  42  |     let reviewBtn = page.locator('div:has-text("GL-1043") button:has-text("Review & Pay")').first();
  43  |     if (!(await reviewBtn.isVisible())) {
  44  |       reviewBtn = page.locator('div:has-text("TN-2215") button:has-text("Review & Pay")').first();
  45  |     }
  46  |     if (!(await reviewBtn.isVisible())) {
  47  |       reviewBtn = page.locator('button:has-text("Review & Pay")').nth(1);
  48  |     }
  49  |     await reviewBtn.click();
  50  | 
  51  |     // 3. Verify Stage 2 Screening appears with animated security check
  52  |     const screeningSection = page.locator('text=Stage 2 · Deterministic Safety Screening');
  53  |     await expect(screeningSection).toBeVisible({ timeout: 5000 });
  54  | 
  55  |     // 4. Verify automatic progression to Stage 3 (Review & Confirm)
  56  |     const matchCheckHeader = page.locator('text=MatchCheck Verified · Ready for Payment');
  57  |     await expect(matchCheckHeader).toBeVisible({ timeout: 25000 });
  58  | 
  59  |     // 5. Verify NO [object Object] error is shown
  60  |     await expect(page.locator('text=[object Object]')).not.toBeVisible();
  61  | 
  62  |     // 6. Verify 4 green verification pills are visible
  63  |     await expect(page.locator('text=Recipient verified')).toBeVisible();
  64  |     await expect(page.locator('text=Amount matched')).toBeVisible();
  65  |     await expect(page.locator('text=Reference matched')).toBeVisible();
  66  |     await expect(page.locator('text=No duplicate')).toBeVisible();
  67  | 
  68  |     // 7. Verify 1-Click PayPal button is visible and active
  69  |     const payBtn = page.locator('button:has-text("with PayPal")');
  70  |     await expect(payBtn).toBeVisible();
  71  |     await expect(payBtn).toBeEnabled();
  72  | 
  73  |     // 8. Click Pay with PayPal
  74  |     await payBtn.click();
  75  | 
  76  |     // 9. Verify transition to Stage 4 (Receipt & Settlement)
  77  |     const receiptHeader = page.locator('h1:has-text("Payment Completed via PayPal Sandbox")');
  78  |     await expect(receiptHeader).toBeVisible({ timeout: 35000 });
  79  | 
  80  |     // 10. Verify transaction and capture IDs are displayed
  81  |     await expect(page.locator('text=Transaction ID')).toBeVisible();
  82  |     await expect(page.locator('text=PayPal Capture ID')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('ECHO-03: Security Screening catches DUPLICATE_PAYMENT and blocks payment', async ({ page }) => {
> 86  |     await page.goto('/new-check');
      |                ^ Error: page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:3005/new-check
  87  | 
  88  |     // 1. Select GL-1042 (which already has a settled transaction in the ledger)
  89  |     const gl1042Btn = page.locator('div:has-text("GL-1042") button:has-text("Review & Pay")').first();
  90  |     if (await gl1042Btn.isVisible()) {
  91  |       await gl1042Btn.click();
  92  | 
  93  |       // 2. Verify it transitions to Stage 3 BLOCKED
  94  |       await expect(page.locator('text=Payment Blocked by Safety Rules')).toBeVisible({ timeout: 20000 });
  95  |       await expect(page.locator('text=DUPLICATE_PAYMENT')).toBeVisible();
  96  |       await expect(page.locator('button:has-text("Payment Blocked by Safety Rules")')).toBeDisabled();
  97  |     }
  98  |   });
  99  | 
  100 |   test('ECHO-04: Conversational Text Intent -> Echo AI response & Stage progression', async ({ page }) => {
  101 |     await page.goto('/new-check');
  102 | 
  103 |     // 1. Type payment intent in manual entry
  104 |     const typeInsteadBtn = page.locator('text=Type instead');
  105 |     if (await typeInsteadBtn.isVisible()) {
  106 |       await typeInsteadBtn.click();
  107 |     }
  108 | 
  109 |     const textarea = page.locator('textarea');
  110 |     await expect(textarea).toBeVisible();
  111 |     await textarea.fill('Show my unpaid bills');
  112 | 
  113 |     const sendBtn = page.locator('button:has-text("Send")');
  114 |     await sendBtn.click();
  115 | 
  116 |     // 2. Verify Echo response appears in transcript
  117 |     await expect(page.locator('text=unpaid invoices').first()).toBeVisible({ timeout: 15000 });
  118 |   });
  119 | 
  120 |   test('ECHO-05: Dashboard AI Assistant integration', async ({ page }) => {
  121 |     await page.goto('/');
  122 | 
  123 |     // 1. Verify Echo Assistant panel on Dashboard
  124 |     await expect(page.locator('text=Echo').first()).toBeVisible();
  125 | 
  126 |     // 2. Verify Recent Transactions AG Grid table is loaded
  127 |     await expect(page.locator('.ag-root')).toBeVisible({ timeout: 15000 });
  128 |   });
  129 | });
  130 | 
```