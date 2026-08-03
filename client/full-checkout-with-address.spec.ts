import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

test('Complete checkout flow with address', async ({ page }) => {
  test.setTimeout(300000);

  console.log('=== Step 1: Register new user ===');
  await page.goto('http://localhost:5173/auth');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.click('button:has-text("Register")');
  await page.waitForTimeout(1000);

  await page.fill('input[name="full_name"]', 'Test User');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

  await page.click('button:has-text("Create Account")');
  await page.waitForURL(/\/($|\?)/, { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('Registered, URL:', page.url());

  console.log('=== Step 2: Add items to cart ===');
  await page.goto('http://localhost:5173/product/monogram-leather-bag');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const addToBagBtn = page.locator('button:has-text("ADD TO BAG")').first();
  await expect(addToBagBtn).toBeVisible({ timeout: 10000 });
  await addToBagBtn.click();
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:5173/product/noir-tailored-suit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const sizeMBtn = page.locator('button:has-text("M")').first();
  await expect(sizeMBtn).toBeVisible({ timeout: 10000 });
  await sizeMBtn.click();
  await page.waitForTimeout(1000);

  const addSuitBtn = page.locator('button:has-text("ADD TO BAG")').first();
  await expect(addSuitBtn).toBeVisible({ timeout: 10000 });
  await addSuitBtn.click();
  await page.waitForTimeout(2000);

  console.log('=== Step 3: Go to checkout and add address ===');
  await page.goto('http://localhost:5173/checkout');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click "Add New Address"
  const addAddressBtn = page.locator('button:has-text("Add New Address")').first();
  await expect(addAddressBtn).toBeVisible({ timeout: 10000 });
  await addAddressBtn.click();
  await page.waitForTimeout(2000);

  // Fill address form - wait for modal/form to appear
  console.log('Filling address form...');
  
  // The form might be in a modal or inline - check for inputs
  await page.fill('input[name="fullName"], input[placeholder*="name" i], input[placeholder*="Name" i]', 'Test User');
  await page.fill('input[name="phone"], input[placeholder*="phone" i], input[placeholder*="Phone" i]', '9876543210');
  await page.fill('input[name="addressLine1"], input[placeholder*="address" i], input[placeholder*="Address" i]', '123 Test Street');
  await page.fill('input[name="city"], input[placeholder*="city" i], input[placeholder*="City" i]', 'Mumbai');
  await page.fill('input[name="state"], input[placeholder*="state" i], input[placeholder*="State" i]', 'Maharashtra');
  await page.fill('input[name="pincode"], input[name="postalCode"], input[placeholder*="pin" i], input[placeholder*="Pin" i]', '400001');

  // Submit address form
  const saveAddressBtn = page.locator('button:has-text("Save"), button:has-text("Add Address"), button:has-text("Submit")').first();
  await expect(saveAddressBtn).toBeVisible({ timeout: 10000 });
  await saveAddressBtn.click();
  await page.waitForTimeout(3000);

  console.log('=== Step 4: Continue to payment ===');
  // Now the address should be selected, click CONTINUE TO PAYMENT
  const continueBtn = page.locator('button:has-text("CONTINUE TO PAYMENT")').first();
  await expect(continueBtn).toBeVisible({ timeout: 10000 });
  await continueBtn.click();
  console.log('Clicked CONTINUE TO PAYMENT');
  await page.waitForTimeout(3000);

  console.log('=== Step 5: Fill Razorpay payment ===');
  const razorpayFrame = page.frameLocator('iframe[src*="razorpay"]').first();
  await expect(razorpayFrame.locator('input[name="card[number]"]')).toBeVisible({ timeout: 15000 });

  await razorpayFrame.locator('input[name="card[number]"]').fill('4111 1111 1111 1111');
  await razorpayFrame.locator('input[name="card[expiry]"]').fill('12/25');
  await razorpayFrame.locator('input[name="card[cvv]"]').fill('123');
  await razorpayFrame.locator('button:has-text("Pay")').click();
  console.log('Payment submitted');

  console.log('=== Step 6: Wait for order confirmation ===');
  await page.waitForURL(/order.*confirmation|success|order/, { timeout: 30000 });
  await page.waitForTimeout(3000);

  const orderIdText = await page.locator('[data-testid="order-id"], .order-id, [data-order-id], *:has-text("Order")').first().textContent();
  console.log('Order confirmation:', orderIdText);

  const orderId = orderIdText?.match(/[A-Z0-9]{8,}/)?.[0] || 'unknown';
  console.log('Order ID:', orderId);

  console.log('=== Step 7: Check orders page ===');
  await page.goto('http://localhost:5173/account/orders');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const orderVisible = await page.locator(`text=${orderId}`).isVisible().catch(() => false);
  console.log('Order visible in account/orders:', orderVisible);

  console.log('=== Step 8: Check product stock via API ===');
  const stockResponse = await page.request.get('http://localhost:3000/api/products?limit=100');
  const stockData = await stockResponse.json();

  const bag = stockData.products?.find((p: any) => p.name?.toLowerCase().includes('bag'));
  const suit = stockData.products?.find((p: any) => p.name?.toLowerCase().includes('suit'));

  console.log('BAG stock:', bag?.name, bag?.variants?.map((v: any) => ({ size: v.size, stock: v.stock_quantity })));
  console.log('SUIT stock:', suit?.name, suit?.variants?.map((v: any) => ({ size: v.size, stock: v.stock_quantity })));

  console.log('=== Step 9: Verify cart is empty ===');
  await page.goto('http://localhost:5173/cart');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const cartEmpty = await page.locator('text=empty, text=Empty, text=Your cart is empty').isVisible().catch(() => false);
  console.log('Cart empty:', cartEmpty);

  console.log('=== Step 10: Hard reload and verify cart still empty ===');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const cartEmptyAfterReload = await page.locator('text=empty, text=Empty, text=Your cart is empty').isVisible().catch(() => false);
  console.log('Cart empty after reload:', cartEmptyAfterReload);

  console.log('=== ALL STEPS COMPLETE ===');
});