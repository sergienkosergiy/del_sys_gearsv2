/**
 * Limit Rule - Limit the number of output records
 * Supports offset for pagination-like functionality
 */

class LimitRule extends BaseRule {
    constructor() {
        super('Limit', 'limit');
        this.priority = 20; // Execute after sorting
    }

    /**
     * Validate limit rule configuration
     * @param {number|Object} config - Limit configuration
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        const errors = [];
        const warnings = [];

        if (config == null) {
            errors.push('Limit rule requires configuration');
        } else if (typeof config === 'number') {
            if (!Number.isInteger(config) || config < 0) {
                errors.push('Limit rule count must be a non-negative integer');
            }
            if (config === 0) {
                warnings.push('Limit rule count is 0, will return empty result');
            }
        } else if (typeof config === 'object') {
            const { count, offset } = config;
            
            if (count == null) {
                errors.push('Limit rule object must have count property');
            } else if (!Number.isInteger(count) || count < 0) {
                errors.push('Limit rule count must be a non-negative integer');
            }
            
            if (offset != null && (!Number.isInteger(offset) || offset < 0)) {
                errors.push('Limit rule offset must be a non-negative integer');
            }
            
            if (count === 0) {
                warnings.push('Limit rule count is 0, will return empty result');
            }
        } else {
            errors.push('Limit rule configuration must be a number or object with count/offset');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Execute limit rule - limit number of records
     * @param {DataRecord[]} data - Input data
     * @param {number|Object} config - Limit configuration
     * @returns {DataRecord[]} Limited data
     */
    execute(data, config) {
        if (!Array.isArray(data)) {
            throw new Error('Limit rule requires data to be an array');
        }

        let count, offset = 0;

        if (typeof config === 'number') {
            count = config;
        } else {
            count = config.count;
            offset = config.offset || 0;
        }

        return FunctionalUtils.pipe(
            FunctionalUtils.skip(offset),
            FunctionalUtils.take(count)
        )(data);
    }

    /**
     * Get configuration schema
     * @returns {Object} Configuration schema
     */
    getConfigSchema() {
        return {
            oneOf: [
                {
                    type: 'number',
                    minimum: 0,
                    description: 'Maximum number of records to return'
                },
                {
                    type: 'object',
                    properties: {
                        count: {
                            type: 'number',
                            minimum: 0,
                            description: 'Maximum number of records to return'
                        },
                        offset: {
                            type: 'number',
                            minimum: 0,
                            description: 'Number of records to skip'
                        }
                    },
                    required: ['count'],
                    additionalProperties: false
                }
            ]
        };
    }

    /**
     * Get rule description
     * @returns {string} Rule description
     */
    getDescription() {
        return 'Limit the number of output records. Supports offset for pagination.';
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [
            {
                name: 'Simple limit',
                config: 10,
                description: 'Return first 10 records'
            },
            {
                name: 'Limit with offset',
                config: { count: 10, offset: 20 },
                description: 'Skip first 20 records, then return next 10 (pagination)'
            },
            {
                name: 'Get single record',
                config: 1,
                description: 'Return only the first record'
            }
        ];
    }
}

// Register rule
if (typeof window !== 'undefined') {
    window.LimitRule = LimitRule;
}