/**
 * Unit Tests for Distance Converter System
 * Comprehensive test suite covering all modules and functionality
 */

const DistanceConverterTests = (() => {
    'use strict';

    const tests = [];
    let testResults = [];

    /**
     * Test framework - simple test runner
     */
    const test = (name, testFn) => {
        tests.push({ name, testFn });
    };

    const expect = (actual) => ({
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
        },
        toEqual: (expected) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toBeCloseTo: (expected, precision = 2) => {
            const factor = Math.pow(10, precision);
            if (Math.round(actual * factor) !== Math.round(expected * factor)) {
                throw new Error(`Expected ${expected} (±${1/factor}), got ${actual}`);
            }
        },
        toBeArray: () => {
            if (!Array.isArray(actual)) {
                throw new Error(`Expected array, got ${typeof actual}`);
            }
        },
        toHaveLength: (length) => {
            if (actual.length !== length) {
                throw new Error(`Expected length ${length}, got ${actual.length}`);
            }
        },
        toContain: (item) => {
            if (!actual.includes(item)) {
                throw new Error(`Expected array to contain ${item}`);
            }
        },
        toBeTrue: () => {
            if (actual !== true) {
                throw new Error(`Expected true, got ${actual}`);
            }
        },
        toBeFalse: () => {
            if (actual !== false) {
                throw new Error(`Expected false, got ${actual}`);
            }
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null, got ${actual}`);
            }
        },
        toBeUndefined: () => {
            if (actual !== undefined) {
                throw new Error(`Expected undefined, got ${actual}`);
            }
        }
    });

    // Functional Utils Tests
    test('ConverterFunctionalUtils.isValidNumber should validate numbers correctly', () => {
        expect(ConverterFunctionalUtils.isValidNumber(42)).toBeTrue();
        expect(ConverterFunctionalUtils.isValidNumber(0)).toBeTrue();
        expect(ConverterFunctionalUtils.isValidNumber(-5.5)).toBeTrue();
        expect(ConverterFunctionalUtils.isValidNumber(NaN)).toBeFalse();
        expect(ConverterFunctionalUtils.isValidNumber(Infinity)).toBeFalse();
        expect(ConverterFunctionalUtils.isValidNumber('42')).toBeFalse();
    });

    test('ConverterFunctionalUtils.roundToTwo should round to 2 decimal places', () => {
        expect(ConverterFunctionalUtils.roundToTwo(3.14159)).toBeCloseTo(3.14);
        expect(ConverterFunctionalUtils.roundToTwo(2.999)).toBeCloseTo(3.00);
        expect(ConverterFunctionalUtils.roundToTwo(1.005)).toBeCloseTo(1.01);
    });

    test('ConverterFunctionalUtils.isPositiveNumber should validate positive numbers', () => {
        expect(ConverterFunctionalUtils.isPositiveNumber(5)).toBeTrue();
        expect(ConverterFunctionalUtils.isPositiveNumber(0)).toBeTrue();
        expect(ConverterFunctionalUtils.isPositiveNumber(-1)).toBeFalse();
        expect(ConverterFunctionalUtils.isPositiveNumber('5')).toBeFalse();
    });

    test('ConverterFunctionalUtils.safeDivide should handle division by zero', () => {
        expect(ConverterFunctionalUtils.safeDivide(10, 2)).toBe(5);
        expect(ConverterFunctionalUtils.safeDivide(10, 0)).toBe(0);
    });

    test('ConverterFunctionalUtils.deepClone should create deep copies', () => {
        const original = { a: 1, b: { c: 2 } };
        const cloned = ConverterFunctionalUtils.deepClone(original);
        cloned.b.c = 3;
        expect(original.b.c).toBe(2);
        expect(cloned.b.c).toBe(3);
    });

    // Unit Registry Tests
    test('UnitRegistry should have default units', () => {
        expect(UnitRegistry.hasUnit('m')).toBeTrue();
        expect(UnitRegistry.hasUnit('ft')).toBeTrue();
        expect(UnitRegistry.hasUnit('cm')).toBeTrue();
        expect(UnitRegistry.hasUnit('in')).toBeTrue();
    });

    test('UnitRegistry.getUnit should return unit configuration', () => {
        const meter = UnitRegistry.getUnit('m');
        expect(meter.symbol).toBe('m');
        expect(meter.name).toBe('meter');
        expect(meter.system).toBe('metric');
        expect(meter.toMeters).toBe(1);
    });

    test('UnitRegistry.getConversionFactor should calculate correct factors', () => {
        // 1 meter = 3.28084 feet (approximately)
        const factor = UnitRegistry.getConversionFactor('m', 'ft');
        expect(factor).toBeCloseTo(3.28084, 4);
        
        // 1 foot = 12 inches
        const inchFactor = UnitRegistry.getConversionFactor('ft', 'in');
        expect(inchFactor).toBeCloseTo(12, 2);
    });

    test('UnitRegistry.registerUnit should add new units', () => {
        const testUnit = {
            symbol: 'test',
            name: 'test unit',
            system: 'metric',
            toMeters: 2
        };
        
        const success = UnitRegistry.registerUnit(testUnit);
        expect(success).toBeTrue();
        expect(UnitRegistry.hasUnit('test')).toBeTrue();
        
        // Clean up
        UnitRegistry.removeUnit('test');
    });

    test('UnitRegistry.getUnitsBySystem should filter by system', () => {
        const metricUnits = UnitRegistry.getUnitsBySystem('metric');
        const imperialUnits = UnitRegistry.getUnitsBySystem('imperial');
        
        expect(metricUnits).toBeArray();
        expect(imperialUnits).toBeArray();
        expect(metricUnits.every(unit => unit.system === 'metric')).toBeTrue();
        expect(imperialUnits.every(unit => unit.system === 'imperial')).toBeTrue();
    });

    // Converter Engine Tests
    test('ConverterEngine.convert should convert between units correctly', () => {
        const request = {
            distance: { unit: 'm', value: 1 },
            convertTo: 'ft'
        };
        
        const result = ConverterEngine.convert(request);
        expect(result.unit).toBe('ft');
        expect(result.value).toBeCloseTo(3.28, 2);
    });

    test('ConverterEngine.convert should handle same unit conversion', () => {
        const request = {
            distance: { unit: 'm', value: 5 },
            convertTo: 'm'
        };
        
        const result = ConverterEngine.convert(request);
        expect(result.unit).toBe('m');
        expect(result.value).toBe(5);
    });

    test('ConverterEngine.convert should convert centimeters to inches', () => {
        const request = {
            distance: { unit: 'cm', value: 2.54 },
            convertTo: 'in'
        };
        
        const result = ConverterEngine.convert(request);
        expect(result.unit).toBe('in');
        expect(result.value).toBeCloseTo(1, 2);
    });

    test('ConverterEngine.validateConversionRequest should validate requests', () => {
        const validRequest = {
            distance: { unit: 'm', value: 1 },
            convertTo: 'ft'
        };
        
        const validation = ConverterEngine.validateConversionRequest(validRequest);
        expect(validation.isValid).toBeTrue();
        expect(validation.errors).toHaveLength(0);
    });

    test('ConverterEngine.validateConversionRequest should catch invalid requests', () => {
        const invalidRequest = {
            distance: { unit: 'invalid', value: -1 },
            convertTo: 'ft'
        };
        
        const validation = ConverterEngine.validateConversionRequest(invalidRequest);
        expect(validation.isValid).toBeFalse();
        expect(validation.errors.length).toBe(2); // Unknown unit and negative value
    });

    test('ConverterEngine.convertBatch should handle multiple conversions', () => {
        const requests = [
            { distance: { unit: 'm', value: 1 }, convertTo: 'ft' },
            { distance: { unit: 'cm', value: 100 }, convertTo: 'm' },
            { distance: { unit: 'ft', value: 12 }, convertTo: 'in' }
        ];
        
        const result = ConverterEngine.convertBatch(requests);
        expect(result.results).toHaveLength(3);
        expect(result.metadata.successfulConversions).toBe(3);
        expect(result.metadata.failedConversions).toBe(0);
    });

    test('ConverterEngine.getPossibleConversions should return all possible conversions', () => {
        const conversions = ConverterEngine.getPossibleConversions('m');
        expect(conversions).toBeArray();
        expect(conversions.length).toBe(UnitRegistry.getAllUnits().length - 1); // All except 'm' itself
        expect(conversions.every(c => c.unit !== 'm')).toBeTrue();
    });

    test('ConverterEngine.createConversionTable should create conversion table', () => {
        const table = ConverterEngine.createConversionTable('m', 1);
        expect(table).toBeArray();
        expect(table.every(entry => entry.value > 0)).toBeTrue();
        expect(table.find(entry => entry.unit === 'ft').value).toBeCloseTo(3.28, 2);
    });

    test('ConverterEngine.findBestUnit should find human-readable units', () => {
        // 1000 meters should convert to 1 kilometer
        const distance = { unit: 'm', value: 1000 };
        const best = ConverterEngine.findBestUnit(distance, 'metric');
        expect(best.unit).toBe('km');
        expect(best.value).toBe(1);
    });

    // Integration Tests
    test('Integration: Complete conversion workflow', () => {
        // Test the complete workflow from request to formatted result
        const request = {
            distance: { unit: 'm', value: 0.5 },
            convertTo: 'ft'
        };
        
        const result = ConverterEngine.convert(request);
        const formatted = ConverterEngine.formatResult(result);
        
        expect(result.unit).toBe('ft');
        expect(result.value).toBeCloseTo(1.64, 2);
        expect(formatted).toContain('1.64');
        expect(formatted).toContain('feet');
    });

    test('Integration: Metric to Imperial conversions', () => {
        const conversions = [
            { from: { unit: 'm', value: 1 }, to: 'ft', expected: 3.28 },
            { from: { unit: 'cm', value: 2.54 }, to: 'in', expected: 1 },
            { from: { unit: 'km', value: 1.609344 }, to: 'mi', expected: 1 }
        ];
        
        conversions.forEach(({ from, to, expected }) => {
            const result = ConverterEngine.convert({ distance: from, convertTo: to });
            expect(result.value).toBeCloseTo(expected, 2);
        });
    });

    test('Integration: Imperial to Metric conversions', () => {
        const conversions = [
            { from: { unit: 'ft', value: 3.28084 }, to: 'm', expected: 1 },
            { from: { unit: 'in', value: 1 }, to: 'cm', expected: 2.54 },
            { from: { unit: 'mi', value: 1 }, to: 'km', expected: 1.609344 }
        ];
        
        conversions.forEach(({ from, to, expected }) => {
            const result = ConverterEngine.convert({ distance: from, convertTo: to });
            expect(result.value).toBeCloseTo(expected, 2);
        });
    });

    test('Integration: Error handling', () => {
        // Test various error conditions
        const errorCases = [
            { distance: { unit: 'invalid', value: 1 }, convertTo: 'ft' },
            { distance: { unit: 'm', value: 'invalid' }, convertTo: 'ft' },
            { distance: { unit: 'm', value: 1 }, convertTo: 'invalid' },
            null,
            undefined,
            {}
        ];
        
        errorCases.forEach(testCase => {
            try {
                ConverterEngine.convert(testCase);
                throw new Error('Should have thrown an error');
            } catch (error) {
                expect(error.message).toContain('Invalid');
            }
        });
    });

    /**
     * Run all tests
     * @returns {Object} Test results
     */
    const runTests = () => {
        testResults = [];
        let passed = 0;
        let failed = 0;

        tests.forEach(({ name, testFn }) => {
            try {
                testFn();
                testResults.push({ name, status: 'passed', error: null });
                passed++;
            } catch (error) {
                testResults.push({ name, status: 'failed', error: error.message });
                failed++;
            }
        });

        return {
            total: tests.length,
            passed,
            failed,
            results: testResults
        };
    };

    /**
     * Get test results
     * @returns {Object[]} Test results
     */
    const getResults = () => testResults;

    /**
     * Clear all tests
     */
    const clearTests = () => {
        tests.length = 0;
        testResults.length = 0;
    };

    // Public API
    return {
        test,
        expect,
        runTests,
        getResults,
        clearTests
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.DistanceConverterTests = DistanceConverterTests;
}