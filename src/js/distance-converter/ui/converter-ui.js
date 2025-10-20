/**
 * Distance Converter UI - User interface for the distance conversion system
 * Implements modern UI patterns with reactive updates
 */

class DistanceConverterUI {
    constructor() {
        this.conversionHistory = [];
        this.currentConversion = null;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.populateUnitSelectors();
        this.updateUnitsReference();
        this.clearResults();
        console.log('Distance Converter UI initialized');
    }

    bindEventListeners() {
        // Input controls
        document.getElementById('inputValue').addEventListener('input', 
            ConverterFunctionalUtils.debounce(() => this.validateInput(), 300));
        document.getElementById('inputUnit').addEventListener('change', () => this.onUnitChange());
        document.getElementById('outputUnit').addEventListener('change', () => this.onUnitChange());

        // Control buttons
        document.getElementById('clearInput').addEventListener('click', () => this.clearInput());
        document.getElementById('swapUnits').addEventListener('click', () => this.swapUnits());
        document.getElementById('convertBtn').addEventListener('click', () => this.performConversion());
        document.getElementById('copyResult').addEventListener('click', () => this.copyResult());
        document.getElementById('exportJson').addEventListener('click', () => this.exportJson());

        // History controls
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('exportHistory').addEventListener('click', () => this.exportHistory());

        // Reference controls
        document.getElementById('toggleReference').addEventListener('click', () => this.toggleReference());

        // Batch processing
        document.getElementById('processBatch').addEventListener('click', () => this.processBatch());
        document.getElementById('batchInput').addEventListener('input', 
            ConverterFunctionalUtils.debounce(() => this.validateBatchInput(), 500));

        // Test runner
        document.getElementById('runTests').addEventListener('click', () => this.runTests());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performConversion();
                } else if (e.key === 'r') {
                    e.preventDefault();
                    this.swapUnits();
                }
            }
        });
    }

    populateUnitSelectors() {
        const inputSelect = document.getElementById('inputUnit');
        const outputSelect = document.getElementById('outputUnit');
        
        // Clear existing options (except first placeholder)
        inputSelect.innerHTML = '<option value="">Select unit...</option>';
        outputSelect.innerHTML = '<option value="">Select unit...</option>';

        // Group units by system
        const groupedUnits = UnitRegistry.getUnitsGroupedBySystem();

        Object.entries(groupedUnits).forEach(([system, units]) => {
            if (units.length === 0) return;

            // Create optgroup for each system
            const inputGroup = document.createElement('optgroup');
            inputGroup.label = system.charAt(0).toUpperCase() + system.slice(1);
            
            const outputGroup = document.createElement('optgroup');
            outputGroup.label = system.charAt(0).toUpperCase() + system.slice(1);

            units.forEach(unit => {
                const inputOption = document.createElement('option');
                inputOption.value = unit.symbol;
                inputOption.textContent = `${unit.name} (${unit.symbol})`;
                inputGroup.appendChild(inputOption);

                const outputOption = document.createElement('option');
                outputOption.value = unit.symbol;
                outputOption.textContent = `${unit.name} (${unit.symbol})`;
                outputGroup.appendChild(outputOption);
            });

            inputSelect.appendChild(inputGroup);
            outputSelect.appendChild(outputGroup);
        });
    }

    updateUnitsReference() {
        const unitsGrid = document.getElementById('unitsGrid');
        unitsGrid.innerHTML = '';

        const groupedUnits = UnitRegistry.getUnitsGroupedBySystem();

        Object.entries(groupedUnits).forEach(([system, units]) => {
            if (units.length === 0) return;

            units.forEach(unit => {
                const unitCard = document.createElement('div');
                unitCard.className = 'unit-card';
                unitCard.innerHTML = `
                    <div class="unit-symbol">${unit.symbol}</div>
                    <div class="unit-name">${unit.name}</div>
                    <div class="unit-system">${system}</div>
                `;
                unitsGrid.appendChild(unitCard);
            });
        });
    }

    validateInput() {
        const inputValue = document.getElementById('inputValue').value;
        const validation = document.getElementById('inputValidation');

        if (!inputValue.trim()) {
            validation.className = 'input-validation';
            validation.textContent = '';
            return false;
        }

        const numValue = parseFloat(inputValue);
        if (!ConverterFunctionalUtils.isValidNumber(numValue)) {
            validation.className = 'input-validation invalid';
            validation.textContent = '❌ Please enter a valid number';
            return false;
        }

        if (!ConverterFunctionalUtils.isPositiveNumber(numValue)) {
            validation.className = 'input-validation invalid';
            validation.textContent = '❌ Distance must be non-negative';
            return false;
        }

        validation.className = 'input-validation valid';
        validation.textContent = '✅ Valid input';
        return true;
    }

    onUnitChange() {
        const inputUnit = document.getElementById('inputUnit').value;
        const outputUnit = document.getElementById('outputUnit').value;
        const convertBtn = document.getElementById('convertBtn');

        // Enable convert button if both units are selected
        convertBtn.disabled = !inputUnit || !outputUnit;

        // Auto-convert if all fields are valid
        if (inputUnit && outputUnit && this.validateInput()) {
            this.performConversion();
        }
    }

    clearInput() {
        document.getElementById('inputValue').value = '';
        document.getElementById('inputUnit').value = '';
        document.getElementById('outputUnit').value = '';
        this.clearResults();
        this.validateInput();
        document.getElementById('convertBtn').disabled = true;
    }

    swapUnits() {
        const inputUnit = document.getElementById('inputUnit');
        const outputUnit = document.getElementById('outputUnit');
        
        const temp = inputUnit.value;
        inputUnit.value = outputUnit.value;
        outputUnit.value = temp;

        // If we have a current conversion, swap the values too
        if (this.currentConversion) {
            const inputValue = document.getElementById('inputValue');
            inputValue.value = this.currentConversion.value;
            this.performConversion();
        }

        this.onUnitChange();
    }

    performConversion() {
        const inputValue = parseFloat(document.getElementById('inputValue').value);
        const inputUnit = document.getElementById('inputUnit').value;
        const outputUnit = document.getElementById('outputUnit').value;

        if (!this.validateInput() || !inputUnit || !outputUnit) {
            this.showNotification('Please fill all fields with valid values', 'warning');
            return;
        }

        try {
            const request = {
                distance: { unit: inputUnit, value: inputValue },
                convertTo: outputUnit
            };

            const result = ConverterEngine.convert(request);
            this.currentConversion = result;
            this.displayResult(result);
            this.addToHistory(request, result);
            
            this.showNotification('Conversion completed successfully!', 'success');

        } catch (error) {
            console.error('Conversion failed:', error);
            this.showNotification(`Conversion failed: ${error.message}`, 'error');
            this.clearResults();
        }
    }

    displayResult(result) {
        const resultValue = document.getElementById('resultValue');
        const resultUnit = document.getElementById('resultUnit');
        const resultDisplay = document.querySelector('.result-display');

        resultValue.textContent = ConverterFunctionalUtils.formatNumber(2, result.value);
        
        const unit = UnitRegistry.getUnit(result.unit);
        resultUnit.textContent = unit ? unit.name : result.unit;

        // Add animation
        resultDisplay.classList.add('fade-in');
        setTimeout(() => resultDisplay.classList.remove('fade-in'), 300);

        // Update result display styling
        resultDisplay.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            resultDisplay.style.borderColor = 'var(--border-color)';
        }, 1000);
    }

    clearResults() {
        document.getElementById('resultValue').textContent = '0.00';
        document.getElementById('resultUnit').textContent = 'unit';
        this.currentConversion = null;
    }

    addToHistory(request, result) {
        const historyItem = {
            id: ConverterFunctionalUtils.generateId(),
            from: request.distance,
            to: result,
            timestamp: Date.now()
        };

        this.conversionHistory.unshift(historyItem);
        
        // Keep only last 50 conversions
        if (this.conversionHistory.length > 50) {
            this.conversionHistory = this.conversionHistory.slice(0, 50);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.conversionHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <div class="empty-icon">📏</div>
                    <h3>No Conversions Yet</h3>
                    <p>Start converting distances to see your history</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = '';
        
        this.conversionHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item slide-in-up';
            
            const fromUnit = UnitRegistry.getUnit(item.from.unit);
            const toUnit = UnitRegistry.getUnit(item.to.unit);
            
            historyItem.innerHTML = `
                <div class="history-conversion">
                    ${item.from.value} ${fromUnit ? fromUnit.symbol : item.from.unit} → 
                    ${item.to.value} ${toUnit ? toUnit.symbol : item.to.unit}
                </div>
                <div class="history-timestamp">
                    ${new Date(item.timestamp).toLocaleTimeString()}
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.conversionHistory = [];
        this.updateHistoryDisplay();
        this.showNotification('History cleared', 'info');
    }

    async copyResult() {
        if (!this.currentConversion) {
            this.showNotification('No result to copy', 'warning');
            return;
        }

        try {
            const resultText = ConverterEngine.formatResult(this.currentConversion);
            await navigator.clipboard.writeText(resultText);
            this.showNotification('Result copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showNotification('Copy failed. Please try again.', 'error');
        }
    }

    exportJson() {
        if (!this.currentConversion) {
            this.showNotification('No result to export', 'warning');
            return;
        }

        try {
            const jsonData = JSON.stringify(this.currentConversion, null, 2);
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversion-result-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Result exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    exportHistory() {
        if (this.conversionHistory.length === 0) {
            this.showNotification('No history to export', 'warning');
            return;
        }

        try {
            const jsonData = JSON.stringify(this.conversionHistory, null, 2);
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversion-history-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('History exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    toggleReference() {
        const referenceContent = document.getElementById('referenceContent');
        const isVisible = referenceContent.style.display !== 'none';
        referenceContent.style.display = isVisible ? 'none' : 'block';
    }

    validateBatchInput() {
        const batchInput = document.getElementById('batchInput').value.trim();
        const validation = document.getElementById('batchValidation');

        if (!batchInput) {
            validation.className = 'batch-validation';
            validation.textContent = '';
            return false;
        }

        try {
            const parsed = JSON.parse(batchInput);
            
            if (!Array.isArray(parsed)) {
                validation.className = 'batch-validation invalid';
                validation.textContent = '❌ Input must be an array of conversion requests';
                return false;
            }

            if (parsed.length === 0) {
                validation.className = 'batch-validation invalid';
                validation.textContent = '❌ Array cannot be empty';
                return false;
            }

            // Validate each request
            for (let i = 0; i < parsed.length; i++) {
                const request = parsed[i];
                const requestValidation = ConverterEngine.validateConversionRequest(request);
                if (!requestValidation.isValid) {
                    validation.className = 'batch-validation invalid';
                    validation.textContent = `❌ Request ${i + 1}: ${requestValidation.errors[0]}`;
                    return false;
                }
            }

            validation.className = 'batch-validation valid';
            validation.textContent = `✅ Valid batch with ${parsed.length} conversions`;
            return true;

        } catch (error) {
            validation.className = 'batch-validation invalid';
            validation.textContent = `❌ JSON Parse Error: ${error.message}`;
            return false;
        }
    }

    processBatch() {
        if (!this.validateBatchInput()) {
            this.showNotification('Please fix batch input errors first', 'warning');
            return;
        }

        try {
            const batchInput = document.getElementById('batchInput').value.trim();
            const requests = JSON.parse(batchInput);
            
            const result = ConverterEngine.convertBatch(requests);
            this.displayBatchResults(result);
            
            this.showNotification(
                `Batch processed: ${result.metadata.successfulConversions}/${result.metadata.totalConversions} successful`, 
                result.metadata.failedConversions === 0 ? 'success' : 'warning'
            );

        } catch (error) {
            console.error('Batch processing failed:', error);
            this.showNotification(`Batch processing failed: ${error.message}`, 'error');
        }
    }

    displayBatchResults(result) {
        const batchResults = document.getElementById('batchResults');
        batchResults.innerHTML = '';

        if (result.results.length === 0) {
            batchResults.innerHTML = `
                <div class="empty-batch">
                    <div class="empty-icon">❌</div>
                    <h4>No Successful Conversions</h4>
                    <p>All batch conversions failed</p>
                </div>
            `;
            return;
        }

        result.results.forEach((conversion, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'batch-result-item';
            resultItem.textContent = `${index + 1}. ${JSON.stringify(conversion)}`;
            batchResults.appendChild(resultItem);
        });

        // Show errors if any
        if (result.metadata.errors.length > 0) {
            const errorsDiv = document.createElement('div');
            errorsDiv.className = 'batch-result-item';
            errorsDiv.style.color = 'var(--error-color)';
            errorsDiv.innerHTML = `<strong>Errors:</strong><br>${result.metadata.errors.join('<br>')}`;
            batchResults.appendChild(errorsDiv);
        }
    }

    runTests() {
        const testRunner = document.getElementById('testRunner');
        const testResults = document.getElementById('testResults');
        
        testRunner.classList.add('active');
        testResults.innerHTML = '<div class="loading">Running tests...</div>';

        setTimeout(() => {
            const results = DistanceConverterTests.runTests();
            
            testResults.innerHTML = `
                <div class="test-summary">
                    <strong>Tests: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}</strong>
                </div>
                ${results.results.map(test => `
                    <div class="test-case ${test.status}">
                        <span class="test-name">${test.name}</span>
                        <span class="test-status">${test.status === 'passed' ? '✅' : '❌'}</span>
                        ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                    </div>
                `).join('')}
            `;

            this.showNotification(`Tests completed: ${results.passed}/${results.total} passed`, 
                results.failed === 0 ? 'success' : 'warning');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });

        const colors = {
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444',
            success: '#10b981'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DistanceConverterUI();
});