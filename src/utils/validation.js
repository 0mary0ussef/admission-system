// Validation utility functions

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (supports multiple formats)
export const validatePhone = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Egyptian phone number patterns
  const egyptianPhoneRegex = /^(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)\d{8}$/;
  
  // International format (with country code)
  const internationalRegex = /^\+20\d{10}$/;
  
  return egyptianPhoneRegex.test(cleanPhone) || internationalRegex.test(cleanPhone);
};

// National ID validation (Egyptian)
export const validateNationalId = (nationalId) => {
  const cleanId = nationalId.replace(/\D/g, '');
  return cleanId.length === 14 && /^\d{14}$/.test(cleanId);
};

// Name validation
export const validateName = (name) => {
  return name.trim().length >= 2 && /^[a-zA-Z\u0600-\u06FF\s]+$/.test(name);
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// Number range validation
export const validateNumberRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Date validation
export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Future date validation
export const validateFutureDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj > today;
};

// Past date validation
export const validatePastDate = (date) => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj instanceof Date && !isNaN(dateObj) && dateObj < today;
};

// Age validation (for birth dates)
export const validateAge = (birthDate, minAge = 0, maxAge = 120) => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

// Text length validation
export const validateTextLength = (text, minLength, maxLength) => {
  const length = text.trim().length;
  return length >= minLength && length <= maxLength;
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Comprehensive form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    // Required validation
    if (rules.required && !validateRequired(value)) {
      errors[field] = rules.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!validateRequired(value)) {
      return;
    }
    
    // Email validation
    if (rules.email && !validateEmail(value)) {
      errors[field] = rules.emailMessage || 'Please enter a valid email address';
      return;
    }
    
    // Phone validation
    if (rules.phone && !validatePhone(value)) {
      errors[field] = rules.phoneMessage || 'Please enter a valid phone number';
      return;
    }
    
    // Name validation
    if (rules.name && !validateName(value)) {
      errors[field] = rules.nameMessage || 'Please enter a valid name';
      return;
    }
    
    // National ID validation
    if (rules.nationalId && !validateNationalId(value)) {
      errors[field] = rules.nationalIdMessage || 'Please enter a valid 14-digit National ID';
      return;
    }
    
    // Number range validation
    if (rules.min !== undefined || rules.max !== undefined) {
      const min = rules.min !== undefined ? rules.min : 0;
      const max = rules.max !== undefined ? rules.max : Infinity;
      if (!validateNumberRange(value, min, max)) {
        errors[field] = rules.rangeMessage || `Value must be between ${min} and ${max}`;
        return;
      }
    }
    
    // Text length validation
    if (rules.minLength || rules.maxLength) {
      const minLength = rules.minLength || 0;
      const maxLength = rules.maxLength || Infinity;
      if (!validateTextLength(value, minLength, maxLength)) {
        errors[field] = rules.lengthMessage || `Text must be between ${minLength} and ${maxLength} characters`;
        return;
      }
    }
    
    // Date validation
    if (rules.date) {
      if (!validateDate(value)) {
        errors[field] = rules.dateMessage || 'Please enter a valid date';
        return;
      }
      
      if (rules.pastDate && !validatePastDate(value)) {
        errors[field] = rules.pastDateMessage || 'Date must be in the past';
        return;
      }
      
      if (rules.futureDate && !validateFutureDate(value)) {
        errors[field] = rules.futureDateMessage || 'Date must be in the future';
        return;
      }
    }
    
    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value, formData);
      if (customResult !== true) {
        errors[field] = customResult || `Invalid ${field}`;
        return;
      }
    }
  });
  
  return errors;
}; 