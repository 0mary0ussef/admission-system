// Simple validation tests
import { 
  validateEmail, 
  validatePhone, 
  validateNationalId, 
  validateName,
  validateForm 
} from './validation';

// Test email validation
console.log('Email validation tests:');
console.log('Valid email:', validateEmail('test@example.com')); // true
console.log('Invalid email:', validateEmail('invalid-email')); // false
console.log('Empty email:', validateEmail('')); // false

// Test phone validation
console.log('\nPhone validation tests:');
console.log('Valid Egyptian phone:', validatePhone('01234567890')); // true
console.log('Valid international:', validatePhone('+201234567890')); // true
console.log('Invalid phone:', validatePhone('123')); // false

// Test National ID validation
console.log('\nNational ID validation tests:');
console.log('Valid National ID:', validateNationalId('12345678901234')); // true
console.log('Invalid National ID:', validateNationalId('1234567890123')); // false

// Test name validation
console.log('\nName validation tests:');
console.log('Valid name:', validateName('Ahmed Mohamed')); // true
console.log('Invalid name:', validateName('A')); // false

// Test form validation
console.log('\nForm validation tests:');
const testFormData = {
  name: 'Ahmed Mohamed',
  email: 'ahmed@example.com',
  phone: '01234567890',
  nationalId: '12345678901234'
};

const validationRules = {
  name: { required: true, name: true },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  nationalId: { required: true, nationalId: true }
};

const formErrors = validateForm(testFormData, validationRules);
console.log('Form validation result:', formErrors); // Should be empty object if all valid

console.log('\nAll validation tests completed!'); 