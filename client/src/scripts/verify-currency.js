import { formatCurrency } from '../utils/currency.js';

console.log('--- Testing formatCurrency Utility ---');

console.log('Valid number (10620):', formatCurrency(10620));
console.log('Valid string ("5000.50"):', formatCurrency("5000.50"));
console.log('Zero (0):', formatCurrency(0));

console.log('\n--- Testing Fallbacks & Error Logging for Invalid Inputs ---');
console.log('Undefined:', formatCurrency(undefined, { context: 'Test Undefined' }));
console.log('Null:', formatCurrency(null, { context: 'Test Null' }));
console.log('NaN:', formatCurrency(NaN, { context: 'Test NaN' }));
console.log('Invalid string ("abc"):', formatCurrency("abc", { context: 'Test Invalid String' }));
console.log('Custom Fallback:', formatCurrency(undefined, { fallback: 'Amount unavailable', context: 'Test Custom Fallback' }));

console.log('\n✓ formatCurrency tests completed!');
