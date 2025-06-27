import { useState, useEffect, useCallback, useRef } from 'react';

// Hook para manejo de estado con cache local
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Hook para debounce de requests
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para requests con cache y loading state
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancelar request anterior si existe
      if (cancelRef.current) {
        cancelRef.current.abort();
      }
      
      // Crear nuevo AbortController
      cancelRef.current = new AbortController();
      
      const result = await apiCall(...args, { signal: cancelRef.current.signal });
      setData(result);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('API Error:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    execute();
    
    // Cleanup function
    return () => {
      if (cancelRef.current) {
        cancelRef.current.abort();
      }
    };
  }, dependencies);

  return { data, loading, error, refetch: execute };
};

// Hook para validación de formularios
export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((fieldName, value) => {
    try {
      if (validationSchema[fieldName]) {
        validationSchema[fieldName](value);
        setErrors(prev => ({ ...prev, [fieldName]: null }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error.message }));
    }
  }, [validationSchema]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validate(name, value);
    }
  }, [touched, validate]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(name, values[name]);
  }, [values, validate]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      try {
        validationSchema[field](values[field]);
      } catch (error) {
        newErrors[field] = error.message;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  }, [values, validationSchema]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: Object.values(errors).every(error => !error)
  };
};

// Hook para lazy loading de componentes
export const useLazyLoad = (importFunc) => {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    importFunc()
      .then((module) => {
        if (isMounted) {
          setComponent(() => module.default || module);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { component, loading, error };
};

// Hook para optimización de re-renders
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const prevStateRef = useRef(initialState);

  const optimizedSetState = useCallback((newState) => {
    const nextState = typeof newState === 'function' ? newState(prevStateRef.current) : newState;
    
    // Solo actualizar si hay cambios reales
    if (JSON.stringify(nextState) !== JSON.stringify(prevStateRef.current)) {
      prevStateRef.current = nextState;
      setState(nextState);
    }
  }, []);

  return [state, optimizedSetState];
};

// Hook para intersection observer (lazy loading de imágenes)
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options
    );

    const currentObserver = observer.current;

    if (node) currentObserver.observe(node);

    return () => currentObserver.disconnect();
  }, [node, options]);

  return [setNode, entry];
};
