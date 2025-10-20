/**
 * Transform Rule - Transform record fields using specified operations
 * Supports field mapping, value transformation, and computed fields
 */

class TransformRule extends BaseRule {
    constructor() {
        super('Transform', 'transform');
        this.priority = 15; // Execute after filtering but before limiting
    }

    /**
     * Validate transform rule configuration
     * @param {Object} config - Transform configuration
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        const errors = [];
        const warnings = [];

        if (!config || typeof config !== 'object') {
            errors.push('Transform rule requires configuration object');
            return { isValid: false, errors, warnings };
        }

        const { fields, computed, rename } = config;

        // Validate fields selection
        if (fields != null) {
            if (!Array.isArray(fields)) {
                errors.push('Transform rule fields must be an array');
            } else {
                fields.forEach((field, index) => {
                    if (typeof field !== 'string') {
                        errors.push(`Transform rule fields[${index}] must be a string`);
                    }
                });
            }
        }

        // Validate computed fields
        if (computed != null) {
            if (typeof computed !== 'object') {
                errors.push('Transform rule computed must be an object');
            } else {
                Object.entries(computed).forEach(([key, value]) => {
                    if (typeof value !== 'function' && typeof value !== 'string') {
                        errors.push(`Transform rule computed.${key} must be a function or string expression`);
                    }
                });
            }
        }

        // Validate field renaming
        if (rename != null) {
            if (typeof rename !== 'object') {
                errors.push('Transform rule rename must be an object');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Execute transform rule - transform records
     * @param {DataRecord[]} data - Input data
     * @param {Object} config - Transform configuration
     * @returns {DataRecord[]} Transformed data
     */
    execute(data, config) {
        if (!Array.isArray(data)) {
            throw new Error('Transform rule requires data to be an array');
        }

        return data.map(record => this.transformRecord(record, config));
    }

    /**
     * Transform a single record
     * @param {DataRecord} record - Record to transform
     * @param {Object} config - Transform configuration
     * @returns {DataRecord} Transformed record
     */
    transformRecord(record, config) {
        let result = FunctionalUtils.deepClone(record);

        // Select specific fields
        if (config.fields) {
            const selectedFields = {};
            config.fields.forEach(field => {
                const value = FunctionalUtils.getNestedProperty(record, field);
                if (value !== undefined) {
                    selectedFields[field] = value;
                }
            });
            result = selectedFields;
        }

        // Add computed fields
        if (config.computed) {
            Object.entries(config.computed).forEach(([key, computation]) => {
                try {
                    let value;
                    if (typeof computation === 'function') {
                        value = computation(record);
                    } else if (typeof computation === 'string') {
                        // Simple string template evaluation
                        value = this.evaluateStringTemplate(computation, record);
                    }
                    result[key] = value;
                } catch (error) {
                    console.warn(`Error computing field ${key}:`, error);
                    result[key] = null;
                }
            });
        }

        // Rename fields
        if (config.rename) {
            Object.entries(config.rename).forEach(([oldKey, newKey]) => {
                if (result.hasOwnProperty(oldKey)) {
                    result[newKey] = result[oldKey];
                    delete result[oldKey];
                }
            });
        }

        return result;
    }

    /**
     * Evaluate simple string template with field references
     * @param {string} template - Template string with {{field}} placeholders
     * @param {DataRecord} record - Record for field values
     * @returns {string} Evaluated string
     */
    evaluateStringTemplate(template, record) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, fieldPath) => {
            const value = FunctionalUtils.getNestedProperty(record, fieldPath.trim());
            return value != null ? String(value) : '';
        });
    }

    /**
     * Get configuration schema
     * @returns {Object} Configuration schema
     */
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                fields: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of field names to include in output'
                },
                computed: {
                    type: 'object',
                    additionalProperties: true,
                    description: 'Computed fields with string templates or functions'
                },
                rename: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                    description: 'Field renaming map (oldName: newName)'
                }
            },
            additionalProperties: false
        };
    }

    /**
     * Get rule description
     * @returns {string} Rule description
     */
    getDescription() {
        return 'Transform records by selecting fields, computing new fields, and renaming fields.';
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [
            {
                name: 'Select specific fields',
                config: {
                    fields: ['name', 'email', 'status']
                },
                description: 'Include only name, email, and status fields'
            },
            {
                name: 'Add computed field',
                config: {
                    computed: {
                        fullName: '{{firstName}} {{lastName}}',
                        isActive: record => record.status === 'active'
                    }
                },
                description: 'Add fullName template and isActive computed field'
            },
            {
                name: 'Rename fields',
                config: {
                    rename: {
                        'user_name': 'username',
                        'email_address': 'email'
                    }
                },
                description: 'Rename user_name to username and email_address to email'
            },
            {
                name: 'Combined transformation',
                config: {
                    fields: ['name', 'age', 'department'],
                    computed: {
                        category: record => record.age >= 18 ? 'adult' : 'minor'
                    },
                    rename: {
                        'department': 'dept'
                    }
                },
                description: 'Select fields, add category, and rename department'
            }
        ];
    }
}

// Register rule
if (typeof window !== 'undefined') {
    window.TransformRule = TransformRule;
}