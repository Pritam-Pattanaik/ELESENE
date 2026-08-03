import { useState, useCallback } from 'react';

/**
 * Reusable hook for real-time inline form field validation.
 * Supports blur/change tracking, error states, and ARIA accessibility attributes.
 * 
 * @param {Object} initialValues - Initial form field state object
 * @param {Function} validateFn - Validation function returning error object map
 */
export const useFormValidation = (initialValues, validateFn) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setValues(prev => {
      const nextValues = { ...prev, [field]: value };
      if (touched[field] && validateFn) {
        const validationResult = validateFn(nextValues);
        setErrors(prevErrors => ({
          ...prevErrors,
          [field]: validationResult[field]
        }));
      }
      return nextValues;
    });
  }, [touched, validateFn]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (validateFn) {
      const validationResult = validateFn(values);
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: validationResult[field]
      }));
    }
  }, [values, validateFn]);

  const validateAll = useCallback(() => {
    if (!validateFn) return true;
    const allErrors = validateFn(values);
    setErrors(allErrors);
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    return Object.keys(allErrors).filter(k => !!allErrors[k]).length === 0;
  }, [values, validateFn]);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((field, optionsOrId) => {
    const customId = typeof optionsOrId === 'string' ? optionsOrId : optionsOrId?.id;
    const elementId = customId || field;
    const hasError = !!(touched[field] && errors[field]);
    return {
      id: elementId,
      name: field,
      value: values[field] ?? '',
      onChange: (e) => handleChange(field, e.target ? e.target.value : e),
      onBlur: () => handleBlur(field),
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${elementId}-error` : undefined,
    };
  }, [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    validateForm: validateAll,
    resetForm,
    setValues,
    setErrors,
    setTouched,
    getFieldProps,
  };
};

export default useFormValidation;
