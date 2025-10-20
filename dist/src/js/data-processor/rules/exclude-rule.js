/**
 * Exclude Rule - Filter out records that match specified criteria
 * Supports both OR logic (array of criteria) and AND logic (single criteria object)
 */

class ExcludeRule extends BaseRule {
    constructor() {
        super('Exclude', 'exclude');
        this.priority = 2;
    }

    /**
     * Validate exclude rule configuration
     * @param {Object|Object[]} config - Exclude criteria
     * @returns {ValidationResult} Validation result
     */
    validate(config) {
        return this.validateCriteriaConfig(config, 'Exclude');
    }

    /**
     * Execute exclude rule - remove records that match criteria
     * @param {DataRecord[]} data - Input data
     * @param {Object|Object[]} config - Exclude criteria
     * @returns {DataRecord[]} Filtered data
     */
    execute(data, config) {
        if (!Array.isArray(data)) {
            throw new Error('Exclude rule requires data to be an array');
        }

        return data.filter(record => !this.matchesRecord(record, config));
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
        return 'Exclude records that match the specified criteria. Use array for OR logic, object for AND logic.';
    }

    /**
     * Get rule examples
     * @returns {Object[]} Array of example configurations
     */
    getExamples() {
        return [
            {
                name: 'Exclude by single field (OR logic)',
                config: [
                    { "status": "inactive" },
                    { "status": "deleted" }
                ],
                description: 'Exclude records where status is "inactive" OR "deleted"'
            },
            {
                name: 'Exclude by multiple fields (AND logic)',
                config: { "name": "John", "email": "john@test.com" },
                description: 'Exclude records where name is "John" AND email is "john@test.com"'
            },
            {
                name: 'Exclude by nested field',
                config: [{ "user.settings.notifications": false }],
                description: 'Exclude records where nested notifications setting is false'
            }
        ];
    }
}

// Register rule
if (typeof window !== 'undefined') {
    window.ExcludeRule = ExcludeRule;
}