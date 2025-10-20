/**
 * Functional programming utilities for distance conversion
 * Pure functions following functional programming principles
 */

const ConverterFunctionalUtils = (() => {
    'use strict';

    /**
     * Compose functions from right to left
     * @param {...Function} fns - Functions to compose
     * @returns {Function} Composed function
     */
    const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

    /**
     * Pipe functions from left to right
     * @param {...Function} fns - Functions to pipe
     * @returns {Function} Piped function
     */
    const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

    /**
     * Curry a function
     * @param {Function} fn - Function to curry
     * @returns {Function} Curried function
     */
    const curry = (fn) => {
        return function curried(...args) {
            if (args.length >= fn.length) {
                return fn.apply(this, args);
            } else {
                return function(...args2) {
                    return curried.apply(this, args.concat(args2));
                };
            }
        };
    };

    /**
     * Deep clone an object (immutable operations)
     * @param {*} obj - Object to clone
     * @returns {*} Deep cloned object
     */
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    };

    /**
     * Check if value is a valid number
     * @param {*} value - Value to check
     * @returns {boolean} True if valid number
     */
    const isValidNumber = (value) => {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    };

    /**
     * Round number to specified decimal places
     * @param {number} decimals - Number of decimal places
     * @returns {Function} Rounding function
     */
    const roundTo = curry((decimals, number) => {
        const factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
    });

    /**
     * Round to 2 decimal places (common for distance conversions)
     */
    const roundToTwo = roundTo(2);

    /**
     * Validate that a value is a positive number
     * @param {*} value - Value to validate
     * @returns {boolean} True if positive number
     */
    const isPositiveNumber = (value) => {
        return isValidNumber(value) && value >= 0;
    };

    /**
     * Safe division that handles division by zero
     * @param {number} dividend - Number to divide
     * @param {number} divisor - Number to divide by
     * @returns {number} Result or 0 if division by zero
     */
    const safeDivide = curry((dividend, divisor) => {
        return divisor === 0 ? 0 : dividend / divisor;
    });

    /**
     * Safe multiplication
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} Product
     */
    const safeMultiply = curry((a, b) => {
        if (!isValidNumber(a) || !isValidNumber(b)) return 0;
        return a * b;
    });

    /**
     * Create a validator function
     * @param {Function} predicate - Validation predicate
     * @param {string} errorMessage - Error message if validation fails
     * @returns {Function} Validator function
     */
    const createValidator = curry((predicate, errorMessage, value) => {
        return predicate(value) ? { isValid: true, errors: [] } : { isValid: false, errors: [errorMessage] };
    });

    /**
     * Combine multiple validation results
     * @param {Object[]} validations - Array of validation results
     * @returns {Object} Combined validation result
     */
    const combineValidations = (validations) => {
        const errors = validations.flatMap(v => v.errors || []);
        return {
            isValid: errors.length === 0,
            errors
        };
    };

    /**
     * Filter array with predicate function
     * @param {Function} predicate - Filter predicate
     * @returns {Function} Filter function
     */
    const filter = curry((predicate, array) => array.filter(predicate));

    /**
     * Map array with transform function
     * @param {Function} transform - Transform function
     * @returns {Function} Map function
     */
    const map = curry((transform, array) => array.map(transform));

    /**
     * Reduce array with reducer function
     * @param {Function} reducer - Reducer function
     * @param {*} initialValue - Initial value
     * @returns {Function} Reduce function
     */
    const reduce = curry((reducer, initialValue, array) => array.reduce(reducer, initialValue));

    /**
     * Find first element that satisfies predicate
     * @param {Function} predicate - Predicate function
     * @returns {Function} Find function
     */
    const find = curry((predicate, array) => array.find(predicate));

    /**
     * Check if all elements satisfy predicate
     * @param {Function} predicate - Predicate function
     * @returns {Function} Every function
     */
    const every = curry((predicate, array) => array.every(predicate));

    /**
     * Check if any element satisfies predicate
     * @param {Function} predicate - Predicate function
     * @returns {Function} Some function
     */
    const some = curry((predicate, array) => array.some(predicate));

    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    /**
     * Format number with proper locale formatting
     * @param {number} number - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    const formatNumber = curry((decimals, number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    });

    /**
     * Debounce function execution
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    const debounce = (fn, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    /**
     * Throttle function execution
     * @param {Function} fn - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    const throttle = (fn, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Memoize function results
     * @param {Function} fn - Function to memoize
     * @returns {Function} Memoized function
     */
    const memoize = (fn) => {
        const cache = new Map();
        return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    };

    // Public API
    return {
        compose,
        pipe,
        curry,
        deepClone,
        isValidNumber,
        roundTo,
        roundToTwo,
        isPositiveNumber,
        safeDivide,
        safeMultiply,
        createValidator,
        combineValidations,
        filter,
        map,
        reduce,
        find,
        every,
        some,
        generateId,
        formatNumber,
        debounce,
        throttle,
        memoize
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ConverterFunctionalUtils = ConverterFunctionalUtils;
}