const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

async function testOrderModels() {
  console.log('--- Testing Order toJSON Prototype ---');
  const sampleOrder = Order.build({
    id: '123e4567-e89b-12d3-a456-426614174000',
    order_number: 'LF-123456-789',
    subtotal: 10000.00,
    discount_amount: 1000.00,
    shipping_amount: 0.00,
    tax_amount: 1620.00,
    total_amount: 10620.00,
    payment_status: 'paid',
    status: 'confirmed'
  });

  const jsonOrder = sampleOrder.toJSON();
  console.log('Serialized Order JSON:', JSON.stringify(jsonOrder, null, 2));

  const requiredOrderFields = ['totalAmount', 'subtotal', 'grandTotal', 'amountPaid', 'total_amount'];
  for (const field of requiredOrderFields) {
    if (jsonOrder[field] === undefined || isNaN(jsonOrder[field])) {
      console.error(`FAILED: ${field} is missing or NaN in serialized Order!`);
      process.exit(1);
    }
  }
  console.log('✓ Order JSON validation passed!');

  console.log('\n--- Testing OrderItem toJSON Prototype ---');
  const sampleItem = OrderItem.build({
    id: '987e6543-e89b-12d3-a456-426614174000',
    quantity: 2,
    unit_price: 5000.00,
    total_price: 10000.00
  });

  const jsonItem = sampleItem.toJSON();
  console.log('Serialized OrderItem JSON:', JSON.stringify(jsonItem, null, 2));

  const requiredItemFields = ['price', 'unit_price', 'total_price', 'quantity'];
  for (const field of requiredItemFields) {
    if (jsonItem[field] === undefined || isNaN(jsonItem[field])) {
      console.error(`FAILED: ${field} is missing or NaN in serialized OrderItem!`);
      process.exit(1);
    }
  }
  console.log('✓ OrderItem JSON validation passed!');

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

testOrderModels().catch(err => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
