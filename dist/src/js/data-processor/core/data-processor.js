/**
 * Data Processor - Main processing engine
 * Implements the Command pattern for rule execution
 */

const DataProcessor = (() => {
    'use strict';

    /**
     * Process data with given rules
     * @param {DataRecord[]} data - Input data
     * @param {Object} condition - Processing condition with rules
     * @returns {ProcessingResult} Processing result
     */
    const processData = (data, condition) => {
        const startTime = performance.now();
        
        try {
            // Validate inputs
            if (!Array.isArray(data)) {
                throw new Error('Data must be an array');
            }

            if (!condition || typeof condition !== 'object') {
                throw new Error('Condition must be an object');
            }

            // Clone data to avoid mutations
            let result = FunctionalUtils.deepClone(data);
            const appliedRules = [];

            // Get rules sorted by priority
            const ruleEntries = Object.entries(condition)
                .map(([type, config]) => ({ type, config }))
                .filter(({ type }) => RuleRegistry.hasRule(type))
                .sort((a, b) => {
                    const ruleA = RuleRegistry.getRule(a.type);
                    const ruleB = RuleRegistry.getRule(b.type);
                    return ruleA.priority - ruleB.priority;
                });

            // Execute rules in priority order
            for (const { type, config } of ruleEntries) {
                try {
                    result = RuleRegistry.executeRule(type, result, config);
                    appliedRules.push({ type, config, priority: RuleRegistry.getRule(type).priority });
                } catch (error) {
                    throw new Error(`Failed to execute ${type} rule: ${error.message}`);
                }
            }

            const endTime = performance.now();
            const processingTime = Math.round(endTime - startTime);

            return {
                result,
                metadata: {
                    inputCount: data.length,
                    outputCount: result.length,
                    processingTime,
                    appliedRules
                }
            };

        } catch (error) {
            const endTime = performance.now();
            const processingTime = Math.round(endTime - startTime);

            return {
                result: [],
                metadata: {
                    inputCount: Array.isArray(data) ? data.length : 0,
                    outputCount: 0,
                    processingTime,
                    appliedRules: [],
                    error: error.message
                }
            };
        }
    };

    /**
     * Validate processing condition
     * @param {Object} condition - Processing condition
     * @returns {ValidationResult} Validation result
     */
    const validateCondition = (condition) => {
        const errors = [];
        const warnings = [];

        if (!condition || typeof condition !== 'object') {
            errors.push('Condition must be an object');
            return { isValid: false, errors, warnings };
        }

        // Check if any rules are specified
        const ruleTypes = Object.keys(condition);
        if (ruleTypes.length === 0) {
            warnings.push('No rules specified in condition');
        }

        // Validate each rule
        for (const [type, config] of Object.entries(condition)) {
            if (!RuleRegistry.hasRule(type)) {
                errors.push(`Unknown rule type: ${type}`);
                continue;
            }

            const rule = RuleRegistry.getRule(type);
            const ruleValidation = rule.validate(config);
            
            if (!ruleValidation.isValid) {
                errors.push(...ruleValidation.errors.map(err => `${type}: ${err}`));
            }
            
            warnings.push(...ruleValidation.warnings.map(warn => `${type}: ${warn}`));
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    };

    /**
     * Get processing statistics for data
     * @param {DataRecord[]} data - Input data
     * @returns {Object} Data statistics
     */
    const getDataStatistics = (data) => {
        if (!Array.isArray(data)) {
            return { error: 'Data must be an array' };
        }

        const stats = {
            totalRecords: data.length,
            fields: new Set(),
            fieldTypes: {},
            sampleRecord: data[0] || null
        };

        // Analyze fields and types
        data.forEach(record => {
            if (typeof record === 'object' && record !== null) {
                Object.entries(record).forEach(([key, value]) => {
                    stats.fields.add(key);
                    const type = Array.isArray(value) ? 'array' : typeof value;
                    if (!stats.fieldTypes[key]) {
                        stats.fieldTypes[key] = new Set();
                    }
                    stats.fieldTypes[key].add(type);
                });
            }
        });

        // Convert sets to arrays for JSON serialization
        stats.fields = Array.from(stats.fields);
        Object.keys(stats.fieldTypes).forEach(key => {
            stats.fieldTypes[key] = Array.from(stats.fieldTypes[key]);
        });

        return stats;
    };

    /**
     * Create a processing pipeline
     * @param {Object[]} rules - Array of rule configurations
     * @returns {Function} Pipeline function
     */
    const createPipeline = (rules) => {
        return (data) => {
            const condition = rules.reduce((acc, rule) => {
                acc[rule.type] = rule.config;
                return acc;
            }, {});
            
            return processData(data, condition);
        };
    };

    /**
     * Batch process multiple datasets
     * @param {DataRecord[][]} datasets - Array of datasets
     * @param {Object} condition - Processing condition
     * @returns {ProcessingResult[]} Array of processing results
     */
    const batchProcess = (datasets, condition) => {
        return datasets.map(data => processData(data, condition));
    };

    /**
     * Export processing result to various formats
     * @param {ProcessingResult} result - Processing result
     * @param {string} format - Export format ('json', 'csv', 'tsv')
     * @returns {string} Exported data
     */
    const exportResult = (result, format = 'json') => {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(result, null, 2);
            
            case 'csv':
                return convertToCSV(result.result);
            
            case 'tsv':
                return convertToCSV(result.result, '\t');
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    };

    /**
     * Convert data to CSV format
     * @param {DataRecord[]} data - Data to convert
     * @param {string} delimiter - Field delimiter
     * @returns {string} CSV string
     */
    const convertToCSV = (data, delimiter = ',') => {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        // Get all unique field names
        const fields = new Set();
        data.forEach(record => {
            if (typeof record === 'object' && record !== null) {
                Object.keys(record).forEach(key => fields.add(key));
            }
        });

        const fieldNames = Array.from(fields);
        
        // Create header row
        const header = fieldNames.map(field => `"${field}"`).join(delimiter);
        
        // Create data rows
        const rows = data.map(record => {
            return fieldNames.map(field => {
                const value = record[field];
                if (value == null) return '""';
                const stringValue = String(value).replace(/"/g, '""');
                return `"${stringValue}"`;
            }).join(delimiter);
        });

        return [header, ...rows].join('\n');
    };

    // Public API
    return {
        processData,
        validateCondition,
        getDataStatistics,
        createPipeline,
        batchProcess,
        exportResult
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.DataProcessor = DataProcessor;
}