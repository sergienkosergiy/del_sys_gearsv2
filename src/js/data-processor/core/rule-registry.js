/**
 * Rule Registry - Manages registration and retrieval of rule modules
 * Implements the Registry pattern for modular rule system
 */

const RuleRegistry = (() => {
    'use strict';

    const rules = new Map();

    /**
     * Register a rule module
     * @param {BaseRule} ruleInstance - Rule instance to register
     */
    const registerRule = (ruleInstance) => {
        if (!(ruleInstance instanceof BaseRule)) {
            throw new Error('Rule must extend BaseRule class');
        }

        if (rules.has(ruleInstance.type)) {
            console.warn(`Rule type '${ruleInstance.type}' is already registered. Overwriting.`);
        }

        rules.set(ruleInstance.type, ruleInstance);
        console.log(`Registered rule: ${ruleInstance.name} (${ruleInstance.type})`);
    };

    /**
     * Get a rule by type
     * @param {string} type - Rule type
     * @returns {BaseRule|null} Rule instance or null if not found
     */
    const getRule = (type) => {
        return rules.get(type) || null;
    };

    /**
     * Get all registered rules
     * @returns {BaseRule[]} Array of all registered rules
     */
    const getAllRules = () => {
        return Array.from(rules.values());
    };

    /**
     * Get all rule types
     * @returns {string[]} Array of all registered rule types
     */
    const getRuleTypes = () => {
        return Array.from(rules.keys());
    };

    /**
     * Check if a rule type is registered
     * @param {string} type - Rule type to check
     * @returns {boolean} True if rule is registered
     */
    const hasRule = (type) => {
        return rules.has(type);
    };

    /**
     * Unregister a rule
     * @param {string} type - Rule type to unregister
     * @returns {boolean} True if rule was unregistered
     */
    const unregisterRule = (type) => {
        return rules.delete(type);
    };

    /**
     * Clear all registered rules
     */
    const clearRules = () => {
        rules.clear();
    };

    /**
     * Get rules sorted by priority
     * @returns {BaseRule[]} Rules sorted by priority (lower number = higher priority)
     */
    const getRulesByPriority = () => {
        return Array.from(rules.values()).sort((a, b) => a.priority - b.priority);
    };

    /**
     * Validate and execute a rule
     * @param {string} type - Rule type
     * @param {DataRecord[]} data - Input data
     * @param {*} config - Rule configuration
     * @returns {DataRecord[]} Processed data
     */
    const executeRule = (type, data, config) => {
        const rule = getRule(type);
        if (!rule) {
            throw new Error(`Rule type '${type}' is not registered`);
        }

        // Validate configuration
        const validation = rule.validate(config);
        if (!validation.isValid) {
            throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);
        }

        // Log warnings
        if (validation.warnings.length > 0) {
            console.warn(`Rule warnings for ${type}:`, validation.warnings);
        }

        // Execute rule
        return rule.execute(data, config);
    };

    /**
     * Get rule information for UI
     * @param {string} type - Rule type
     * @returns {Object|null} Rule information or null if not found
     */
    const getRuleInfo = (type) => {
        const rule = getRule(type);
        if (!rule) return null;

        return {
            name: rule.name,
            type: rule.type,
            priority: rule.priority,
            description: rule.getDescription(),
            schema: rule.getConfigSchema(),
            examples: rule.getExamples()
        };
    };

    /**
     * Get all rule information for UI
     * @returns {Object[]} Array of rule information objects
     */
    const getAllRuleInfo = () => {
        return getAllRules().map(rule => ({
            name: rule.name,
            type: rule.type,
            priority: rule.priority,
            description: rule.getDescription(),
            schema: rule.getConfigSchema(),
            examples: rule.getExamples()
        }));
    };

    // Auto-register built-in rules when they become available
    const autoRegisterRules = () => {
        const ruleClasses = [
            'IncludeRule',
            'ExcludeRule', 
            'SortRule',
            'LimitRule',
            'TransformRule'
        ];

        ruleClasses.forEach(className => {
            if (typeof window !== 'undefined' && window[className]) {
                try {
                    const ruleInstance = new window[className]();
                    registerRule(ruleInstance);
                } catch (error) {
                    console.error(`Failed to register ${className}:`, error);
                }
            }
        });
    };

    // Auto-register rules when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoRegisterRules);
        } else {
            // DOM is already ready
            setTimeout(autoRegisterRules, 0);
        }
    }

    // Public API
    return {
        registerRule,
        getRule,
        getAllRules,
        getRuleTypes,
        hasRule,
        unregisterRule,
        clearRules,
        getRulesByPriority,
        executeRule,
        getRuleInfo,
        getAllRuleInfo
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.RuleRegistry = RuleRegistry;
}