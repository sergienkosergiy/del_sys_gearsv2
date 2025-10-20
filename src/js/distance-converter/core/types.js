/**
 * Type definitions for the Distance Converter System
 * Following functional programming principles with immutable data structures
 */

/**
 * @typedef {Object} Unit
 * @property {string} symbol - Unit symbol (e.g., 'm', 'ft')
 * @property {string} name - Full unit name (e.g., 'meter', 'foot')
 * @property {string} system - Measurement system ('metric' or 'imperial')
 * @property {number} toMeters - Conversion factor to meters
 * @property {string} [category] - Unit category (e.g., 'length', 'distance')
 */

/**
 * @typedef {Object} Distance
 * @property {string} unit - Unit symbol
 * @property {number} value - Numeric value
 */

/**
 * @typedef {Object} ConversionRequest
 * @property {Distance} distance - Input distance
 * @property {string} convertTo - Target unit symbol
 */

/**
 * @typedef {Object} ConversionResult
 * @property {string} unit - Result unit symbol
 * @property {number} value - Converted value (rounded to 2 decimal places)
 */

/**
 * @typedef {Object} ConversionHistory
 * @property {string} id - Unique conversion ID
 * @property {Distance} from - Original distance
 * @property {ConversionResult} to - Converted result
 * @property {number} timestamp - Conversion timestamp
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of validation error messages
 * @property {string[]} warnings - Array of validation warnings
 */

/**
 * @typedef {Object} BatchConversionRequest
 * @property {ConversionRequest[]} conversions - Array of conversion requests
 */

/**
 * @typedef {Object} BatchConversionResult
 * @property {ConversionResult[]} results - Array of conversion results
 * @property {Object} metadata - Processing metadata
 * @property {number} metadata.totalConversions - Total number of conversions
 * @property {number} metadata.successfulConversions - Number of successful conversions
 * @property {number} metadata.failedConversions - Number of failed conversions
 * @property {string[]} metadata.errors - Array of error messages
 */

// Export types for JSDoc (not actual runtime exports in vanilla JS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Type definitions are for documentation only
    };
}