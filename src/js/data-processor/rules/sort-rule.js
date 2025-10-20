/**
 * Sort Rule - Sort records by specified fields using natural sorting
 * Supports multiple sort keys and nested field access
 */

class SortRule extends BaseRule {
    constructor() {
        super('Sort', 'sortBy');
        this.priority = 10; // Execute after filtering rules
    }

    /**
     * Validate sort rule configuration
     * @param {string|string[]} config - Sort keys
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        const errors = [];
        const warnings = [];

        if (!config) {
            errors.push('Sort rule requires configuration');
        } else if (typeof config === 'string') {
            if (config.trim() === '') {
                errors.push('Sort rule key cannot be empty');
            }
        } else if (Array.isArray(config)) {
            if (config.length === 0) {
                warnings.push('Sort rule has empty keys array');
            }
            config.forEach((key, index) => {
                if (typeof key !== 'string') {
                    errors.push(`Sort rule key[${index}] must be a string`);
                } else if (key.trim() === '') {
                    errors.push(`Sort rule key[${index}] cannot be empty`);
                }
            });
        } else {
            errors.push('Sort rule configuration must be a string or array of strings');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Execute sort rule - sort records by specified keys
     * @param {DataRecord[]} data - Input data
     * @param {string|string[]} config - Sort keys
     * @returns {DataRecord[]} Sorted data
     */
    execute(data, config) {
        if (!Array.isArray(data)) {
            throw new Error('Sort rule requires data to be an array');
        }

        const keys = Array.isArray(config) ? config : [config];
        const comparator = FunctionalUtils.multiKeyComparator(keys);
        
        return FunctionalUtils.sort(comparator, data);
    }

    /**
     * Get configuration schema
     * @returns {Object} Configuration schema
     */
    getConfigSchema() {
        return {
            oneOf: [
                {
                    type: 'string',
                    description: 'Single field name to sort by'
                },
                {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    minItems: 1,
                    description: 'Array of field names to sort by (in priority order)'
                }
            ]
        };
    }

    /**
     * Get rule description
     * @returns {string} Rule description
     */
    getDescription() {
        return 'Sort records by specified fields using natural sorting. Supports nested field access with dot notation.';
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [
            {
                name: 'Sort by single field',
                config: 'name',
                description: 'Sort records by name field'
            },
            {
                name: 'Sort by multiple fields',
                config: ['category', 'name', 'date'],
                description: 'Sort by category first, then name, then date'
            },
            {
                name: 'Sort by nested field',
                config: ['user.profile.lastName', 'user.profile.firstName'],
                description: 'Sort by nested lastName, then firstName'
            },
            {
                name: 'Sort mixed data types',
                config: ['priority', 'name'],
                description: 'Sort by priority (numbers first), then by name'
            }
        ];
    }
}

// Register rule
if (typeof window !== 'undefined') {
    window.SortRule = SortRule;
}