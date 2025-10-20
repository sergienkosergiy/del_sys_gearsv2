/**
 * Functional programming utilities for data processing
 * Pure functions following functional programming principles
 */

const FunctionalUtils = (() => {
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
     * Check if value is empty (null, undefined, empty string, empty array, empty object)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    const isEmpty = (value) => {
        if (value == null) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    };

    /**
     * Get nested property value safely
     * @param {Object} obj - Object to get property from
     * @param {string} path - Dot-separated path to property
     * @param {*} defaultValue - Default value if property not found
     * @returns {*} Property value or default
     */
    const getNestedProperty = (obj, path, defaultValue = undefined) => {
        return path.split('.').reduce((current, key) => {
            return (current && current[key] !== undefined) ? current[key] : defaultValue;
        }, obj);
    };

    /**
     * Set nested property value immutably
     * @param {Object} obj - Object to set property in
     * @param {string} path - Dot-separated path to property
     * @param {*} value - Value to set
     * @returns {Object} New object with property set
     */
    const setNestedProperty = (obj, path, value) => {
        const keys = path.split('.');
        const result = deepClone(obj);
        
        keys.reduce((current, key, index) => {
            if (index === keys.length - 1) {
                current[key] = value;
            } else {
                current[key] = current[key] || {};
            }
            return current[key];
        }, result);
        
        return result;
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
     * Sort array with comparator function
     * @param {Function} comparator - Comparator function
     * @returns {Function} Sort function
     */
    const sort = curry((comparator, array) => [...array].sort(comparator));

    /**
     * Take first n elements from array
     * @param {number} n - Number of elements to take
     * @returns {Function} Take function
     */
    const take = curry((n, array) => array.slice(0, n));

    /**
     * Skip first n elements from array
     * @param {number} n - Number of elements to skip
     * @returns {Function} Skip function
     */
    const skip = curry((n, array) => array.slice(n));

    /**
     * Group array elements by key function
     * @param {Function} keyFn - Function to get grouping key
     * @returns {Function} Group by function
     */
    const groupBy = curry((keyFn, array) => {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    });

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
     * Find first element that satisfies predicate
     * @param {Function} predicate - Predicate function
     * @returns {Function} Find function
     */
    const find = curry((predicate, array) => array.find(predicate));

    /**
     * Natural sort comparator for strings and numbers
     * @param {*} a - First value
     * @param {*} b - Second value
     * @returns {number} Comparison result
     */
    const naturalSort = (a, b) => {
        const aStr = String(a);
        const bStr = String(b);
        
        // Handle numbers
        const aNum = parseFloat(aStr);
        const bNum = parseFloat(bStr);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }
        
        // Handle strings with natural sorting
        return aStr.localeCompare(bStr, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    };

    /**
     * Create a comparator function for sorting by multiple keys
     * @param {string[]} keys - Array of keys to sort by
     * @returns {Function} Comparator function
     */
    const multiKeyComparator = (keys) => (a, b) => {
        for (const key of keys) {
            const aVal = getNestedProperty(a, key);
            const bVal = getNestedProperty(b, key);
            const result = naturalSort(aVal, bVal);
            if (result !== 0) return result;
        }
        return 0;
    };

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
        isEmpty,
        getNestedProperty,
        setNestedProperty,
        filter,
        map,
        reduce,
        sort,
        take,
        skip,
        groupBy,
        every,
        some,
        find,
        naturalSort,
        multiKeyComparator,
        debounce,
        throttle,
        memoize
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.FunctionalUtils = FunctionalUtils;
}