import { useState, useEffect } from "react";
import { validateForm } from "../utils/validation";

export const useFormValidation = (initialData, validationRules) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({});

  // Validate form whenever formData changes
  useEffect(() => {
    const newErrors = validateForm(formData, validationRules);
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData, validationRules]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsValid(false);
  };

  const getFieldError = (field) => {
    return touched[field] ? errors[field] : "";
  };

  const isFieldValid = (field) => {
    return !errors[field] || !touched[field];
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  const getInvalidFields = () => {
    return Object.keys(errors);
  };

  return {
    formData,
    errors,
    isValid,
    touched,
    handleInputChange,
    handleFieldBlur,
    validateField,
    resetForm,
    getFieldError,
    isFieldValid,
    hasErrors,
    getInvalidFields,
    setFormData,
  };
};
