/**
 * Converter Engine - Core conversion logic
 * Implements pure functional conversion algorithms
 */

const ConverterEngine = (() => {
    'use strict';

    /**
     * Convert distance between units
     * @param {ConversionRequest} request - Conversion request
     * @returns {ConversionResult} Conversion result
     */
    const convert = (request) => {
        try {
            // Validate input
            const validation = validateConversionRequest(request);
            if (!validation.isValid) {
                throw new Error(`Invalid conversion request: ${validation.errors.join(', ')}`);
            }

            const { distance, convertTo } = request;
            
            // Get conversion factor
            const factor = UnitRegistry.getConversionFactor(distance.unit, convertTo);
            if (factor === null) {
                throw new Error(`Cannot convert from ${distance.unit} to ${convertTo}: units not found`);
            }

            // Perform conversion
            const convertedValue = ConverterFunctionalUtils.safeMultiply(distance.value, factor);
            const roundedValue = ConverterFunctionalUtils.roundToTwo(convertedValue);

            return {
                unit: convertTo,
                value: roundedValue
            };

        } catch (error) {
            console.error('Conversion failed:', error);
            throw error;
        }
    };

    /**
     * Convert multiple distances in batch
     * @param {ConversionRequest[]} requests - Array of conversion requests
     * @returns {BatchConversionResult} Batch conversion result
     */
    const convertBatch = (requests) => {
        if (!Array.isArray(requests)) {
            throw new Error('Batch conversion requires an array of requests');
        }

        const results = [];
        const errors = [];
        let successfulConversions = 0;
        let failedConversions = 0;

        requests.forEach((request, index) => {
            try {
                const result = convert(request);
                results.push(result);
                successfulConversions++;
            } catch (error) {
                results.push(null);
                errors.push(`Request ${index}: ${error.message}`);
                failedConversions++;
            }
        });

        return {
            results: results.filter(r => r !== null),
            metadata: {
                totalConversions: requests.length,
                successfulConversions,
                failedConversions,
                errors
            }
        };
    };

    /**
     * Validate conversion request
     * @param {ConversionRequest} request - Request to validate
     * @returns {ValidationResult} Validation result
     */
    const validateConversionRequest = (request) => {
        const errors = [];

        if (!request || typeof request !== 'object') {
            errors.push('Request must be an object');
            return { isValid: false, errors };
        }

        // Validate distance object
        if (!request.distance || typeof request.distance !== 'object') {
            errors.push('Request must have a distance object');
        } else {
            const { unit, value } = request.distance;
            
            if (!unit || typeof unit !== 'string') {
                errors.push('Distance must have a valid unit string');
            } else if (!UnitRegistry.hasUnit(unit)) {
                errors.push(`Unknown unit: ${unit}`);
            }
            
            if (!ConverterFunctionalUtils.isValidNumber(value)) {
                errors.push('Distance value must be a valid number');
            } else if (!ConverterFunctionalUtils.isPositiveNumber(value)) {
                errors.push('Distance value must be non-negative');
            }
        }

        // Validate convertTo
        if (!request.convertTo || typeof request.convertTo !== 'string') {
            errors.push('Request must have a convertTo unit string');
        } else if (!UnitRegistry.hasUnit(request.convertTo)) {
            errors.push(`Unknown target unit: ${request.convertTo}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    /**
     * Get all possible conversions for a unit
     * @param {string} fromUnit - Source unit symbol
     * @returns {Object[]} Array of possible conversions with factors
     */
    const getPossibleConversions = (fromUnit) => {
        if (!UnitRegistry.hasUnit(fromUnit)) {
            return [];
        }

        const allUnits = UnitRegistry.getAllUnits();
        return allUnits
            .filter(unit => unit.symbol !== fromUnit)
            .map(unit => ({
                unit: unit.symbol,
                name: unit.name,
                system: unit.system,
                factor: UnitRegistry.getConversionFactor(fromUnit, unit.symbol)
            }))
            .filter(conversion => conversion.factor !== null);
    };

    /**
     * Create conversion table for a specific unit
     * @param {string} baseUnit - Base unit symbol
     * @param {number} baseValue - Base value to convert
     * @returns {Object[]} Conversion table
     */
    const createConversionTable = (baseUnit, baseValue = 1) => {
        if (!UnitRegistry.hasUnit(baseUnit)) {
            throw new Error(`Unknown unit: ${baseUnit}`);
        }

        if (!ConverterFunctionalUtils.isPositiveNumber(baseValue)) {
            throw new Error('Base value must be a positive number');
        }

        const conversions = getPossibleConversions(baseUnit);
        return conversions.map(conversion => {
            const convertedValue = ConverterFunctionalUtils.safeMultiply(baseValue, conversion.factor);
            return {
                unit: conversion.unit,
                name: conversion.name,
                system: conversion.system,
                value: ConverterFunctionalUtils.roundToTwo(convertedValue)
            };
        });
    };

    /**
     * Find the best unit for displaying a value (human-readable)
     * @param {Distance} distance - Input distance
     * @param {string} [preferredSystem] - Preferred system ('metric' or 'imperial')
     * @returns {ConversionResult} Best unit conversion
     */
    const findBestUnit = (distance, preferredSystem = null) => {
        const validation = validateDistance(distance);
        if (!validation.isValid) {
            throw new Error(`Invalid distance: ${validation.errors.join(', ')}`);
        }

        let candidateUnits = UnitRegistry.getAllUnits();
        
        // Filter by preferred system if specified
        if (preferredSystem) {
            candidateUnits = candidateUnits.filter(unit => unit.system === preferredSystem);
        }

        // Convert to all candidate units and find the best one
        const conversions = candidateUnits.map(unit => {
            const factor = UnitRegistry.getConversionFactor(distance.unit, unit.symbol);
            if (factor === null) return null;
            
            const convertedValue = ConverterFunctionalUtils.safeMultiply(distance.value, factor);
            return {
                unit: unit.symbol,
                value: convertedValue,
                absValue: Math.abs(convertedValue)
            };
        }).filter(c => c !== null);

        // Find unit where the value is between 1 and 1000 (most readable)
        const readable = conversions.find(c => c.absValue >= 1 && c.absValue < 1000);
        if (readable) {
            return {
                unit: readable.unit,
                value: ConverterFunctionalUtils.roundToTwo(readable.value)
            };
        }

        // If no readable unit found, find the closest to 1
        const closest = conversions.reduce((best, current) => {
            const bestDistance = Math.abs(Math.log10(best.absValue));
            const currentDistance = Math.abs(Math.log10(current.absValue));
            return currentDistance < bestDistance ? current : best;
        });

        return {
            unit: closest.unit,
            value: ConverterFunctionalUtils.roundToTwo(closest.value)
        };
    };

    /**
     * Validate distance object
     * @param {Distance} distance - Distance to validate
     * @returns {ValidationResult} Validation result
     */
    const validateDistance = (distance) => {
        const errors = [];

        if (!distance || typeof distance !== 'object') {
            errors.push('Distance must be an object');
            return { isValid: false, errors };
        }

        if (!distance.unit || typeof distance.unit !== 'string') {
            errors.push('Distance must have a valid unit string');
        } else if (!UnitRegistry.hasUnit(distance.unit)) {
            errors.push(`Unknown unit: ${distance.unit}`);
        }

        if (!ConverterFunctionalUtils.isValidNumber(distance.value)) {
            errors.push('Distance value must be a valid number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    /**
     * Calculate precision for a given value
     * @param {number} value - Value to analyze
     * @returns {number} Recommended decimal places
     */
    const calculatePrecision = (value) => {
        if (!ConverterFunctionalUtils.isValidNumber(value)) return 2;
        
        const absValue = Math.abs(value);
        if (absValue >= 1000) return 0;
        if (absValue >= 100) return 1;
        if (absValue >= 1) return 2;
        if (absValue >= 0.1) return 3;
        return 4;
    };

    /**
     * Format conversion result for display
     * @param {ConversionResult} result - Conversion result
     * @param {boolean} [includeUnit=true] - Whether to include unit
     * @returns {string} Formatted string
     */
    const formatResult = (result, includeUnit = true) => {
        if (!result || !ConverterFunctionalUtils.isValidNumber(result.value)) {
            return 'Invalid result';
        }

        const precision = calculatePrecision(result.value);
        const formattedValue = ConverterFunctionalUtils.formatNumber(precision, result.value);
        
        if (includeUnit && result.unit) {
            const unit = UnitRegistry.getUnit(result.unit);
            const unitName = unit ? unit.name : result.unit;
            return `${formattedValue} ${unitName}${Math.abs(result.value) !== 1 ? 's' : ''}`;
        }
        
        return formattedValue;
    };

    // Public API
    return {
        convert,
        convertBatch,
        validateConversionRequest,
        getPossibleConversions,
        createConversionTable,
        findBestUnit,
        validateDistance,
        calculatePrecision,
        formatResult
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ConverterEngine = ConverterEngine;
}