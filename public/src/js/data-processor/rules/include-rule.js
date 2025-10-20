/**
 * Include Rule - Filter records that match specified criteria
 * Supports both OR logic (array of criteria) and AND logic (single criteria object)
 */

class IncludeRule extends BaseRule {
    constructor() {
        super('Include', 'include');
        this.priority = 1;
    }

    /**
     * Validate include rule configuration
     * @param {Object|Object[]} config - Include criteria
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        return this.validateCriteriaConfig(config, 'Include');
    }

    /**
     * Execute include rule - keep only records that match criteria
     * @param {DataRecord[]} data - Input data
     * @param {Object|Object[]} config - Include criteria
     * @returns {DataRecord[]} Filtered data
     */
    execute(data, config) {
        if (!Array.isArray(data)) {
            throw new Error('Include rule requires data to be an array');
        }

        return data.filter(record => this.matchesRecord(record, config));
    }

    /**
     * Get configuration schema
     * @returns {Object} Configuration schema
     */
    getConfigSchema() {
        return {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: true
            },
            minItems: 1,
            description: 'Array of criteria objects (OR logic) or single criteria object (AND logic)'
        };
    }

    /**
     * Get rule description
     * @returns {string} Rule description
     */
    getDescription() {
        return 'Include records that match the specified criteria. Use array for OR logic, object for AND logic.';
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [
            {
                name: 'Include by single field (OR logic)',
                config: [
                    { "name": "John" },
                    { "name": "Jane" }
                ],
                description: 'Include records where name is "John" OR "Jane"'
            },
            {
                name: 'Include by multiple fields (AND logic)',
                config: { "name": "John", "status": "active" },
                description: 'Include records where name is "John" AND status is "active"'
            },
            {
                name: 'Include by nested field',
                config: [{ "user.profile.role": "admin" }],
                description: 'Include records where nested role is "admin"'
            }
        ];
    }
}

// Register rule
if (typeof window !== 'undefined') {
    window.IncludeRule = IncludeRule;
}