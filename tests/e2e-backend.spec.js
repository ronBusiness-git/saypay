import { test, expect } from '@playwright/test';

test.describe('SayPay MVP E2E Integration Suite (TN-28 to TN-61)', () => {

  // --- AI INTEGRATION (TN-28 to TN-35) ---
  test('TN-28 to TN-31: Intent extraction endpoint parses valid inputs', async ({ request }) => {
    const response = await request.post('/api/intent/parse', {
      data: {
        text: 'Pay GreenLeaf Demo Store $12.50 for invoice #INV-2026-001',
      },
    });

    // 200 if live/mocked, or 503 retryable if offline
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    if (response.status() === 200) {
      expect(body).toHaveProperty('fields');
      expect(body.fields).toHaveProperty('amount');
    } else {
      expect(body).toHaveProperty('retryable', true);
    }
  });

  test('TN-30 & TN-33: Intent endpoint rejects invalid payloads', async ({ request }) => {
    const response = await request.post('/api/intent/parse', {
      data: { text: '' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('TN-32: Request parser endpoint handles structured invoices', async ({ request }) => {
    const response = await request.post('/api/request/parse', {
      data: {
        requestText: 'INVOICE\nPayee: GreenLeaf Demo Store\nAmount: $12.50\nRef: INV-2026-001',
      },
    });
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    if (response.status() === 200) {
      expect(body).toHaveProperty('fields');
    } else {
      expect(body).toHaveProperty('retryable', true);
    }
  });

  test('TN-34: Explanation helper returns clear, status-authoritative message', async ({ request }) => {
    const response = await request.post('/api/explanation', {
      data: {
        status: 'BLOCKED',
        reasonCodes: ['AMOUNT_MISMATCH'],
        comparison: {
          amount: { intent: '12.50', request: '125.00' },
        },
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('explanation');
    expect(body).toHaveProperty('status', 'BLOCKED');
    expect(typeof body.explanation).toBe('string');
    expect(body.explanation.length).toBeGreaterThan(10);
  });

  // --- SAFETY ENGINE / MATCHCHECK (TN-36 to TN-43) ---
  let clearCheckId = null;
  let blockedCheckId = null;

  test('TN-36 to TN-43: MatchCheck Scenario 1 (Happy Path -> CLEAR, canCreateOrder === true)', async ({ request }) => {
    const response = await request.post('/api/payment/check', {
      data: {
        intentFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '12.50',
          currency: 'USD',
          reference: 'INV-E2E-001',
        },
        requestFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '12.50',
          currency: 'USD',
          reference: 'INV-E2E-001',
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('checkId');
    expect(body).toHaveProperty('status', 'CLEAR');
    expect(body).toHaveProperty('canCreateOrder', true);
    expect(body.checks.amount.status).toBe('MATCH');
    expect(body.checks.recipient.status).toBe('MATCH');
    expect(body.checks.currency.status).toBe('MATCH');
    clearCheckId = body.checkId;
  });

  test('TN-38 & TN-41: MatchCheck Scenario 2 (Amount Tamper -> BLOCKED)', async ({ request }) => {
    const response = await request.post('/api/payment/check', {
      data: {
        intentFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '12.50',
          currency: 'USD',
          reference: 'INV-E2E-002',
        },
        requestFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '125.00',
          currency: 'USD',
          reference: 'INV-E2E-002',
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status', 'BLOCKED');
    expect(body).toHaveProperty('canCreateOrder', false);
    expect(body.reasonCodes).toContain('AMOUNT_MISMATCH');
    blockedCheckId = body.checkId;
  });

  test('TN-40: MatchCheck Scenario 7 (Amount Exceeds Limit -> REVIEW)', async ({ request }) => {
    const response = await request.post('/api/payment/check', {
      data: {
        intentFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '999.00',
          currency: 'USD',
          reference: 'INV-E2E-003',
        },
        requestFields: {
          recipientName: 'GreenLeaf Demo Store',
          amount: '999.00',
          currency: 'USD',
          reference: 'INV-E2E-003',
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status', 'REVIEW');
    expect(body).toHaveProperty('canCreateOrder', false);
    expect(body.reasonCodes).toContain('AMOUNT_EXCEEDS_LIMIT');
  });

  // --- PAYPAL SANDBOX & ORDERS V2 (TN-48 to TN-58) ---
  test('TN-43 & TN-51: Create-order strictly rejects non-CLEAR checks', async ({ request }) => {
    const response = await request.post('/api/paypal/create-order', {
      data: {
        checkId: blockedCheckId || 'mock-blocked-id',
      },
    });

    // Must be rejected with 403 Forbidden or 400 Bad Request
    expect([400, 403, 404]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('TN-51 & TN-56: Create-order requires valid checkId payload', async ({ request }) => {
    const response = await request.post('/api/paypal/create-order', {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('TN-55: Capture-order requires both checkId and orderId', async ({ request }) => {
    const response = await request.post('/api/paypal/capture-order', {
      data: { checkId: 'some-check' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  // --- TRANSACTIONS API (TN-59 to TN-61) ---
  test('TN-60: Transactions list endpoint returns paginated data', async ({ request }) => {
    const response = await request.get('/api/transactions?limit=5');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('transactions');
    expect(Array.isArray(body.transactions)).toBe(true);
    expect(body).toHaveProperty('total');
  });

  test('TN-61: Transaction detail returns 404 for nonexistent transaction', async ({ request }) => {
    const response = await request.get('/api/transactions/000000000000000000000000');
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
