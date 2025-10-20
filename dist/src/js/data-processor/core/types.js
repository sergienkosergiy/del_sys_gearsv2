/**
 * Type definitions and interfaces for the data processor system
 * Following functional programming principles with immutable data structures
 */

/**
 * @typedef {Object} DataRecord
 * @description Generic data record with arbitrary key-value pairs
 */

/**
 * @typedef {Object} ProcessingRule
 * @property {string} type - Rule type identifier
 * @property {*} config - Rule-specific configuration
 * @property {number} priority - Execution priority (lower = higher priority)
 */

/**
 * @typedef {Object} ProcessingResult
 * @property {DataRecord[]} result - Processed data records
 * @property {Object} metadata - Processing metadata
 * @property {number} metadata.inputCount - Number of input records
 * @property {number} metadata.outputCount - Number of output records
 * @property {number} metadata.processingTime - Processing time in milliseconds
 * @property {ProcessingRule[]} metadata.appliedRules - Rules that were applied
 */

/**
 * @typedef {Object} RuleModule
 * @property {string} name - Rule module name
 * @property {string} type - Rule type identifier
 * @property {Function} validate - Rule validation function
 * @property {Function} execute - Rule execution function
 * @property {Function} getConfigSchema - Get configuration schema
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of validation error messages
 * @property {string[]} warnings - Array of validation warnings
 */

// Export types for JSDoc (not actual runtime exports in vanilla JS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Type definitions are for documentation only
    };
}