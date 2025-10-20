/**
 * Unit Registry - Manages distance units and their conversion factors
 * Implements the Registry pattern for extensible unit system
 */

const UnitRegistry = (() => {
    'use strict';

    // Default units configuration
    const defaultUnits = {
        // Metric System
        'm': {
            symbol: 'm',
            name: 'meter',
            system: 'metric',
            toMeters: 1,
            category: 'length'
        },
        'cm': {
            symbol: 'cm',
            name: 'centimeter',
            system: 'metric',
            toMeters: 0.01,
            category: 'length'
        },
        'mm': {
            symbol: 'mm',
            name: 'millimeter',
            system: 'metric',
            toMeters: 0.001,
            category: 'length'
        },
        'km': {
            symbol: 'km',
            name: 'kilometer',
            system: 'metric',
            toMeters: 1000,
            category: 'length'
        },
        
        // Imperial System
        'ft': {
            symbol: 'ft',
            name: 'foot',
            system: 'imperial',
            toMeters: 0.3048,
            category: 'length'
        },
        'in': {
            symbol: 'in',
            name: 'inch',
            system: 'imperial',
            toMeters: 0.0254,
            category: 'length'
        },
        'yd': {
            symbol: 'yd',
            name: 'yard',
            system: 'imperial',
            toMeters: 0.9144,
            category: 'length'
        },
        'mi': {
            symbol: 'mi',
            name: 'mile',
            system: 'imperial',
            toMeters: 1609.344,
            category: 'length'
        }
    };

    let units = ConverterFunctionalUtils.deepClone(defaultUnits);

    /**
     * Register a new unit
     * @param {Unit} unit - Unit configuration
     * @returns {boolean} True if successfully registered
     */
    const registerUnit = (unit) => {
        if (!validateUnit(unit)) {
            console.error('Invalid unit configuration:', unit);
            return false;
        }

        if (units[unit.symbol]) {
            console.warn(`Unit '${unit.symbol}' already exists. Overwriting.`);
        }

        units[unit.symbol] = ConverterFunctionalUtils.deepClone(unit);
        console.log(`Registered unit: ${unit.name} (${unit.symbol})`);
        return true;
    };

    /**
     * Get a unit by symbol
     * @param {string} symbol - Unit symbol
     * @returns {Unit|null} Unit configuration or null if not found
     */
    const getUnit = (symbol) => {
        return units[symbol] ? ConverterFunctionalUtils.deepClone(units[symbol]) : null;
    };

    /**
     * Get all registered units
     * @returns {Unit[]} Array of all units
     */
    const getAllUnits = () => {
        return Object.values(units).map(unit => ConverterFunctionalUtils.deepClone(unit));
    };

    /**
     * Get units by system
     * @param {string} system - System name ('metric' or 'imperial')
     * @returns {Unit[]} Array of units in the system
     */
    const getUnitsBySystem = (system) => {
        return getAllUnits().filter(unit => unit.system === system);
    };

    /**
     * Get all unit symbols
     * @returns {string[]} Array of unit symbols
     */
    const getUnitSymbols = () => {
        return Object.keys(units);
    };

    /**
     * Check if a unit exists
     * @param {string} symbol - Unit symbol
     * @returns {boolean} True if unit exists
     */
    const hasUnit = (symbol) => {
        return units.hasOwnProperty(symbol);
    };

    /**
     * Remove a unit
     * @param {string} symbol - Unit symbol to remove
     * @returns {boolean} True if unit was removed
     */
    const removeUnit = (symbol) => {
        if (units[symbol]) {
            delete units[symbol];
            return true;
        }
        return false;
    };

    /**
     * Clear all units
     */
    const clearUnits = () => {
        units = {};
    };

    /**
     * Reset to default units
     */
    const resetToDefaults = () => {
        units = ConverterFunctionalUtils.deepClone(defaultUnits);
    };

    /**
     * Load units from JSON configuration
     * @param {Object} config - Units configuration object
     * @returns {ValidationResult} Loading result
     */
    const loadUnitsFromConfig = (config) => {
        const errors = [];
        const warnings = [];

        if (!config || typeof config !== 'object') {
            errors.push('Configuration must be an object');
            return { isValid: false, errors, warnings };
        }

        let successCount = 0;
        let failCount = 0;

        Object.entries(config).forEach(([symbol, unitConfig]) => {
            const unit = { symbol, ...unitConfig };
            if (registerUnit(unit)) {
                successCount++;
            } else {
                failCount++;
                errors.push(`Failed to register unit: ${symbol}`);
            }
        });

        if (successCount > 0) {
            console.log(`Successfully loaded ${successCount} units`);
        }

        if (failCount > 0) {
            warnings.push(`Failed to load ${failCount} units`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    };

    /**
     * Export units configuration to JSON
     * @returns {string} JSON string of units configuration
     */
    const exportUnitsConfig = () => {
        const config = {};
        Object.entries(units).forEach(([symbol, unit]) => {
            const { symbol: _, ...unitConfig } = unit;
            config[symbol] = unitConfig;
        });
        return JSON.stringify(config, null, 2);
    };

    /**
     * Validate unit configuration
     * @param {Unit} unit - Unit to validate
     * @returns {boolean} True if valid
     */
    const validateUnit = (unit) => {
        if (!unit || typeof unit !== 'object') return false;
        
        const requiredFields = ['symbol', 'name', 'system', 'toMeters'];
        const hasAllFields = requiredFields.every(field => unit.hasOwnProperty(field));
        
        if (!hasAllFields) return false;
        
        if (typeof unit.symbol !== 'string' || unit.symbol.trim() === '') return false;
        if (typeof unit.name !== 'string' || unit.name.trim() === '') return false;
        if (!['metric', 'imperial'].includes(unit.system)) return false;
        if (!ConverterFunctionalUtils.isValidNumber(unit.toMeters) || unit.toMeters <= 0) return false;
        
        return true;
    };

    /**
     * Get conversion factor between two units
     * @param {string} fromUnit - Source unit symbol
     * @param {string} toUnit - Target unit symbol
     * @returns {number|null} Conversion factor or null if units not found
     */
    const getConversionFactor = (fromUnit, toUnit) => {
        const from = getUnit(fromUnit);
        const to = getUnit(toUnit);
        
        if (!from || !to) return null;
        
        // Convert from source unit to meters, then from meters to target unit
        return from.toMeters / to.toMeters;
    };

    /**
     * Get units grouped by system
     * @returns {Object} Units grouped by system
     */
    const getUnitsGroupedBySystem = () => {
        const grouped = { metric: [], imperial: [] };
        
        getAllUnits().forEach(unit => {
            if (grouped[unit.system]) {
                grouped[unit.system].push(unit);
            }
        });
        
        // Sort units within each system by conversion factor
        Object.keys(grouped).forEach(system => {
            grouped[system].sort((a, b) => a.toMeters - b.toMeters);
        });
        
        return grouped;
    };

    /**
     * Search units by name or symbol
     * @param {string} query - Search query
     * @returns {Unit[]} Matching units
     */
    const searchUnits = (query) => {
        if (!query || typeof query !== 'string') return [];
        
        const lowerQuery = query.toLowerCase();
        return getAllUnits().filter(unit => 
            unit.symbol.toLowerCase().includes(lowerQuery) ||
            unit.name.toLowerCase().includes(lowerQuery)
        );
    };

    // Initialize with default units
    console.log('Unit Registry initialized with default units');

    // Public API
    return {
        registerUnit,
        getUnit,
        getAllUnits,
        getUnitsBySystem,
        getUnitSymbols,
        hasUnit,
        removeUnit,
        clearUnits,
        resetToDefaults,
        loadUnitsFromConfig,
        exportUnitsConfig,
        validateUnit,
        getConversionFactor,
        getUnitsGroupedBySystem,
        searchUnits
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.UnitRegistry = UnitRegistry;
}