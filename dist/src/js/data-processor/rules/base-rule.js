/**
 * Base rule class implementing the Strategy pattern
 * All rule modules must extend this base class
 */

class BaseRule {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.priority = 0;
    }

    /**
     * Validate rule configuration
     * @param {*} config - Rule configuration
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        return {
            isValid: true,
            errors: [],
            warnings: []
        };
    }

    /**
     * Execute the rule on data
     * @param {DataRecord[]} data - Input data
     * @param {*} config - Rule configuration
     * @returns {DataRecord[]} Processed data
     */
    execute(data, config) {
        throw new Error(`Rule ${this.name} must implement execute method`);
    }

    /**
     * Get configuration schema for UI generation
     * @returns {Object} Configuration schema
     */
    getConfigSchema() {
        return {
            type: 'object',
            properties: {},
            required: []
        };
    }

    /**
     * Get rule description
     * @returns {string} Rule description
     */
    getDescription() {
        return `${this.name} rule`;
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [];
    }

    /**
     * Check if two values match using deep comparison
     * @param {*} value1 - First value
     * @param {*} value2 - Second value
     * @returns {boolean} True if values match
     */
    deepEquals(value1, value2) {
        if (value1 === value2) return true;
        
        if (value1 == null || value2 == null) return value1 === value2;
        
        if (typeof value1 !== typeof value2) return false;
        
        if (typeof value1 === 'object') {
            if (Array.isArray(value1) !== Array.isArray(value2)) return false;
            
            if (Array.isArray(value1)) {
                if (value1.length !== value2.length) return false;
                return value1.every((item, index) => this.deepEquals(item, value2[index]));
            }
            
            const keys1 = Object.keys(value1);
            const keys2 = Object.keys(value2);
            
            if (keys1.length !== keys2.length) return false;
            
            return keys1.every(key => 
                keys2.includes(key) && this.deepEquals(value1[key], value2[key])
            );
        }
        
        return false;
    }

    /**
     * Check if record matches criteria (supports both AND and OR logic)
     * @param {DataRecord} record - Record to check
     * @param {Object|Object[]} criteria - Matching criteria
     * @returns {boolean} True if record matches
     */
    matchesRecord(record, criteria) {
        if (Array.isArray(criteria)) {
            // OR logic: record matches if it matches any criteria object
            return criteria.some(criterion => this.matchesSingleCriterion(record, criterion));
        } else {
            // AND logic: record matches if it matches all properties in the criteria object
            return this.matchesSingleCriterion(record, criteria);
        }
    }

    /**
     * Check if record matches a single criterion object (AND logic)
     * @param {DataRecord} record - Record to check
     * @param {Object} criterion - Single criterion object
     * @returns {boolean} True if record matches all properties
     */
    matchesSingleCriterion(record, criterion) {
        return Object.entries(criterion).every(([key, value]) => {
            const recordValue = FunctionalUtils.getNestedProperty(record, key);
            return this.deepEquals(recordValue, value);
        });
    }

    /**
     * Validate that config is an array or object
     * @param {*} config - Configuration to validate
     * @param {string} ruleName - Name of the rule for error messages
     * @returns {ValidationResult} Validation result
     */
    validateCriteriaConfig(config, ruleName) {
        const errors = [];
        const warnings = [];

        if (!config) {
            errors.push(`${ruleName} rule requires configuration`);
        } else if (!Array.isArray(config) && typeof config !== 'object') {
            errors.push(`${ruleName} rule configuration must be an array or object`);
        } else if (Array.isArray(config)) {
            if (config.length === 0) {
                warnings.push(`${ruleName} rule has empty criteria array`);
            }
            config.forEach((item, index) => {
                if (typeof item !== 'object' || item === null) {
                    errors.push(`${ruleName} rule criteria[${index}] must be an object`);
                }
            });
        } else if (typeof config === 'object') {
            if (Object.keys(config).length === 0) {
                warnings.push(`${ruleName} rule has empty criteria object`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.BaseRule = BaseRule;
}