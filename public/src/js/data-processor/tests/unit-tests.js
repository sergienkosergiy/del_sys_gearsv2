/**
 * Unit Tests for Data Processor System
 * Comprehensive test suite covering all modules and functionality
 */

const UnitTests = (() => {
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
        }
    });

    // Sample test data
    const sampleData = [
        { name: "John", email: "john2@mail.com", age: 30, status: "active" },
        { name: "John", email: "john1@mail.com", age: 25, status: "inactive" },
        { name: "Jane", email: "jane@mail.com", age: 28, status: "active" },
        { name: "Bob", email: "bob@mail.com", age: 35, status: "active" }
    ];

    // Functional Utils Tests
    test('FunctionalUtils.deepClone should create deep copy', () => {
        const original = { a: 1, b: { c: 2 } };
        const cloned = FunctionalUtils.deepClone(original);
        cloned.b.c = 3;
        expect(original.b.c).toBe(2);
        expect(cloned.b.c).toBe(3);
    });

    test('FunctionalUtils.getNestedProperty should access nested properties', () => {
        const obj = { user: { profile: { name: 'John' } } };
        expect(FunctionalUtils.getNestedProperty(obj, 'user.profile.name')).toBe('John');
        expect(FunctionalUtils.getNestedProperty(obj, 'user.profile.age', 0)).toBe(0);
    });

    test('FunctionalUtils.naturalSort should sort naturally', () => {
        expect(FunctionalUtils.naturalSort('item2', 'item10')).toBe(-1);
        expect(FunctionalUtils.naturalSort(5, 10)).toBe(-5);
        expect(FunctionalUtils.naturalSort('apple', 'banana')).toBe(-1);
    });

    test('FunctionalUtils.filter should filter arrays', () => {
        const isEven = x => x % 2 === 0;
        const result = FunctionalUtils.filter(isEven, [1, 2, 3, 4, 5]);
        expect(result).toEqual([2, 4]);
    });

    test('FunctionalUtils.pipe should compose functions left to right', () => {
        const add1 = x => x + 1;
        const multiply2 = x => x * 2;
        const pipeline = FunctionalUtils.pipe(add1, multiply2);
        expect(pipeline(5)).toBe(12); // (5 + 1) * 2
    });

    // Include Rule Tests
    test('IncludeRule should filter records with OR logic', () => {
        const rule = new IncludeRule();
        const config = [{ name: "John" }, { name: "Jane" }];
        const result = rule.execute(sampleData, config);
        expect(result).toHaveLength(3);
        expect(result.every(r => r.name === "John" || r.name === "Jane")).toBeTrue();
    });

    test('IncludeRule should filter records with AND logic', () => {
        const rule = new IncludeRule();
        const config = { name: "John", status: "active" };
        const result = rule.execute(sampleData, config);
        expect(result).toHaveLength(1);
        expect(result[0].email).toBe("john2@mail.com");
    });

    test('IncludeRule validation should catch invalid config', () => {
        const rule = new IncludeRule();
        const validation = rule.validate(null);
        expect(validation.isValid).toBeFalse();
        expect(validation.errors).toHaveLength(1);
    });

    // Exclude Rule Tests
    test('ExcludeRule should remove records with OR logic', () => {
        const rule = new ExcludeRule();
        const config = [{ name: "John" }];
        const result = rule.execute(sampleData, config);
        expect(result).toHaveLength(2);
        expect(result.every(r => r.name !== "John")).toBeTrue();
    });

    test('ExcludeRule should remove records with AND logic', () => {
        const rule = new ExcludeRule();
        const config = { name: "John", email: "john2@mail.com" };
        const result = rule.execute(sampleData, config);
        expect(result).toHaveLength(3);
        expect(result.find(r => r.email === "john2@mail.com")).toBe(undefined);
    });

    // Sort Rule Tests
    test('SortRule should sort by single field', () => {
        const rule = new SortRule();
        const result = rule.execute(sampleData, "email");
        expect(result[0].email).toBe("bob@mail.com");
        expect(result[1].email).toBe("jane@mail.com");
    });

    test('SortRule should sort by multiple fields', () => {
        const rule = new SortRule();
        const result = rule.execute(sampleData, ["name", "email"]);
        expect(result[0].name).toBe("Bob");
        expect(result[1].name).toBe("Jane");
        expect(result[2].email).toBe("john1@mail.com");
        expect(result[3].email).toBe("john2@mail.com");
    });

    // Limit Rule Tests
    test('LimitRule should limit number of records', () => {
        const rule = new LimitRule();
        const result = rule.execute(sampleData, 2);
        expect(result).toHaveLength(2);
    });

    test('LimitRule should support offset', () => {
        const rule = new LimitRule();
        const result = rule.execute(sampleData, { count: 2, offset: 1 });
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(sampleData[1]);
    });

    // Transform Rule Tests
    test('TransformRule should select specific fields', () => {
        const rule = new TransformRule();
        const config = { fields: ["name", "email"] };
        const result = rule.execute(sampleData, config);
        expect(result[0]).toEqual({ name: "John", email: "john2@mail.com" });
        expect(result[0].age).toBe(undefined);
    });

    test('TransformRule should add computed fields', () => {
        const rule = new TransformRule();
        const config = {
            computed: {
                isAdult: record => record.age >= 18,
                displayName: "{{name}} ({{age}})"
            }
        };
        const result = rule.execute(sampleData, config);
        expect(result[0].isAdult).toBeTrue();
        expect(result[0].displayName).toBe("John (30)");
    });

    test('TransformRule should rename fields', () => {
        const rule = new TransformRule();
        const config = { rename: { name: "fullName", email: "emailAddress" } };
        const result = rule.execute(sampleData, config);
        expect(result[0].fullName).toBe("John");
        expect(result[0].emailAddress).toBe("john2@mail.com");
        expect(result[0].name).toBe(undefined);
    });

    // Rule Registry Tests
    test('RuleRegistry should register and retrieve rules', () => {
        const rule = new IncludeRule();
        RuleRegistry.registerRule(rule);
        const retrieved = RuleRegistry.getRule('include');
        expect(retrieved).toBe(rule);
    });

    test('RuleRegistry should execute rules', () => {
        const config = [{ name: "John" }];
        const result = RuleRegistry.executeRule('include', sampleData, config);
        expect(result).toHaveLength(2);
    });

    // Data Processor Tests
    test('DataProcessor should process data with multiple rules', () => {
        const condition = {
            include: [{ status: "active" }],
            sortBy: ["name", "email"],
            limit: 2
        };
        const result = DataProcessor.processData(sampleData, condition);
        expect(result.result).toHaveLength(2);
        expect(result.metadata.inputCount).toBe(4);
        expect(result.metadata.outputCount).toBe(2);
        expect(result.metadata.appliedRules).toHaveLength(3);
    });

    test('DataProcessor should validate conditions', () => {
        const validation = DataProcessor.validateCondition({
            include: [{ name: "John" }],
            invalidRule: {}
        });
        expect(validation.isValid).toBeFalse();
        expect(validation.errors).toContain("Unknown rule type: invalidRule");
    });

    test('DataProcessor should get data statistics', () => {
        const stats = DataProcessor.getDataStatistics(sampleData);
        expect(stats.totalRecords).toBe(4);
        expect(stats.fields).toContain("name");
        expect(stats.fields).toContain("email");
        expect(stats.fieldTypes.age).toContain("number");
    });

    test('DataProcessor should export to JSON', () => {
        const result = { result: sampleData.slice(0, 2), metadata: {} };
        const exported = DataProcessor.exportResult(result, 'json');
        const parsed = JSON.parse(exported);
        expect(parsed.result).toHaveLength(2);
    });

    // Integration Tests
    test('Integration: Complex filtering and sorting', () => {
        const condition = {
            exclude: [{ status: "inactive" }],
            sortBy: ["age"],
            transform: {
                fields: ["name", "age"],
                computed: {
                    category: record => record.age >= 30 ? "senior" : "junior"
                }
            },
            limit: 2
        };
        const result = DataProcessor.processData(sampleData, condition);
        expect(result.result).toHaveLength(2);
        expect(result.result[0].category).toBe("junior");
        expect(result.result[1].category).toBe("senior");
    });

    test('Integration: Error handling', () => {
        const result = DataProcessor.processData("invalid", {});
        expect(result.result).toHaveLength(0);
        expect(result.metadata.error).toContain("Data must be an array");
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
    window.UnitTests = UnitTests;
}