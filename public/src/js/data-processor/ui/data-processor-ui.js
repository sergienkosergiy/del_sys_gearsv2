/**
 * Data Processor UI - User interface for the data processing system
 * Implements modern UI patterns with reactive updates
 */

class DataProcessorUI {
    constructor() {
        this.currentData = null;
        this.currentCondition = {};
        this.lastResult = null;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.loadSampleData();
        this.updateRuleTypeSelector();
        this.updateStats(0, 0, 0, 0);
        console.log('Data Processor UI initialized');
    }

    bindEventListeners() {
        // Data input controls
        document.getElementById('loadSampleData').addEventListener('click', () => this.loadSampleData());
        document.getElementById('validateData').addEventListener('click', () => this.validateData());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());

        // Rule controls
        document.getElementById('addRule').addEventListener('click', () => this.addRule());
        document.getElementById('processData').addEventListener('click', () => this.processData());
        document.getElementById('ruleType').addEventListener('change', () => this.updateRuleConfig());

        // Output controls
        document.getElementById('exportResults').addEventListener('click', () => this.exportResults());
        document.getElementById('copyResults').addEventListener('click', () => this.copyResults());

        // Documentation
        document.getElementById('toggleDocs').addEventListener('click', () => this.toggleDocumentation());

        // Test runner
        document.getElementById('runTests').addEventListener('click', () => this.runTests());

        // Data input validation
        const dataInput = document.getElementById('dataInput');
        dataInput.addEventListener('input', FunctionalUtils.debounce(() => this.validateData(), 500));
    }

    loadSampleData() {
        const sampleData = {
            data: [
                { name: "John", email: "john2@mail.com", age: 30, status: "active", department: "Engineering" },
                { name: "John", email: "john1@mail.com", age: 25, status: "inactive", department: "Marketing" },
                { name: "Jane", email: "jane@mail.com", age: 28, status: "active", department: "Design" },
                { name: "Bob", email: "bob@mail.com", age: 35, status: "active", department: "Engineering" },
                { name: "Alice", email: "alice@mail.com", age: 32, status: "active", department: "Sales" },
                { name: "Charlie", email: "charlie@mail.com", age: 29, status: "inactive", department: "Support" }
            ]
        };

        document.getElementById('dataInput').value = JSON.stringify(sampleData, null, 2);
        this.validateData();
        this.showNotification('Sample data loaded successfully!', 'success');
    }

    validateData() {
        const dataInput = document.getElementById('dataInput');
        const validationStatus = document.getElementById('dataValidation');
        
        try {
            const inputText = dataInput.value.trim();
            if (!inputText) {
                validationStatus.className = 'validation-status';
                validationStatus.textContent = 'Enter JSON data to validate';
                this.currentData = null;
                this.updateStats(0, 0, 0, 0);
                return false;
            }

            const parsed = JSON.parse(inputText);
            
            if (!parsed.data || !Array.isArray(parsed.data)) {
                validationStatus.className = 'validation-status invalid';
                validationStatus.textContent = '❌ Data must have a "data" property containing an array';
                this.currentData = null;
                this.updateStats(0, 0, 0, 0);
                return false;
            }

            this.currentData = parsed.data;
            validationStatus.className = 'validation-status valid';
            validationStatus.textContent = `✅ Valid JSON with ${parsed.data.length} records`;
            this.updateStats(parsed.data.length, 0, 0, 0);
            return true;

        } catch (error) {
            validationStatus.className = 'validation-status invalid';
            validationStatus.textContent = `❌ JSON Parse Error: ${error.message}`;
            this.currentData = null;
            this.updateStats(0, 0, 0, 0);
            return false;
        }
    }

    clearData() {
        document.getElementById('dataInput').value = '';
        this.currentData = null;
        this.validateData();
        this.clearResults();
        this.showNotification('Data cleared', 'info');
    }

    updateRuleTypeSelector() {
        const ruleSelect = document.getElementById('ruleType');
        const ruleTypes = RuleRegistry.getRuleTypes();
        
        ruleSelect.innerHTML = '';
        ruleTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = RuleRegistry.getRule(type).name;
            ruleSelect.appendChild(option);
        });

        this.updateRuleConfig();
    }

    updateRuleConfig() {
        const ruleType = document.getElementById('ruleType').value;
        const ruleConfig = document.getElementById('ruleConfig');
        
        if (!ruleType) {
            ruleConfig.innerHTML = '<p>Select a rule type to configure</p>';
            return;
        }

        const ruleInfo = RuleRegistry.getRuleInfo(ruleType);
        if (!ruleInfo) {
            ruleConfig.innerHTML = '<p>Rule information not available</p>';
            return;
        }

        ruleConfig.innerHTML = `
            <div class="rule-info">
                <h4>${ruleInfo.name} Rule</h4>
                <p class="rule-description">${ruleInfo.description}</p>
                
                <div class="rule-examples">
                    <h5>Examples:</h5>
                    ${ruleInfo.examples.map(example => `
                        <div class="example-item">
                            <strong>${example.name}</strong>
                            <p>${example.description}</p>
                            <pre><code>${JSON.stringify(example.config, null, 2)}</code></pre>
                            <button class="control-btn" onclick="dataProcessorUI.useExample('${ruleType}', ${JSON.stringify(example.config).replace(/"/g, '&quot;')})">
                                Use This Example
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    useExample(ruleType, config) {
        this.currentCondition[ruleType] = config;
        this.showNotification(`Added ${ruleType} rule with example configuration`, 'success');
        this.updateRulesCount();
    }

    addRule() {
        const ruleType = document.getElementById('ruleType').value;
        if (!ruleType) {
            this.showNotification('Please select a rule type', 'warning');
            return;
        }

        // For demo purposes, add a basic configuration
        const ruleInfo = RuleRegistry.getRuleInfo(ruleType);
        if (ruleInfo.examples.length > 0) {
            this.currentCondition[ruleType] = ruleInfo.examples[0].config;
            this.showNotification(`Added ${ruleInfo.name} rule`, 'success');
            this.updateRulesCount();
        }
    }

    async processData() {
        if (!this.currentData) {
            this.showNotification('Please load and validate data first', 'warning');
            return;
        }

        if (Object.keys(this.currentCondition).length === 0) {
            this.showNotification('Please add at least one rule', 'warning');
            return;
        }

        const processButton = document.getElementById('processData');
        const originalText = processButton.textContent;
        
        try {
            processButton.textContent = 'Processing...';
            processButton.disabled = true;
            processButton.classList.add('loading');

            // Add small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 300));

            const result = DataProcessor.processData(this.currentData, this.currentCondition);
            this.lastResult = result;

            if (result.metadata.error) {
                this.showNotification(`Processing failed: ${result.metadata.error}`, 'error');
                this.clearResults();
            } else {
                this.displayResults(result);
                this.updateStats(
                    result.metadata.inputCount,
                    Object.keys(this.currentCondition).length,
                    result.metadata.outputCount,
                    result.metadata.processingTime
                );
                this.showNotification(`Processing complete! ${result.metadata.outputCount} records processed in ${result.metadata.processingTime}ms`, 'success');
            }

        } catch (error) {
            console.error('Processing failed:', error);
            this.showNotification(`Processing failed: ${error.message}`, 'error');
            this.clearResults();
        } finally {
            processButton.textContent = originalText;
            processButton.disabled = false;
            processButton.classList.remove('loading');
        }
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';

        if (result.result.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-results">
                    <div class="empty-icon">📭</div>
                    <h3>No Results</h3>
                    <p>The processing rules resulted in no matching records</p>
                </div>
            `;
            return;
        }

        const resultsContent = document.createElement('div');
        resultsContent.className = 'results-content';

        // Add metadata summary
        const summary = document.createElement('div');
        summary.className = 'results-summary';
        summary.innerHTML = `
            <h4>Processing Summary</h4>
            <p>Input: ${result.metadata.inputCount} records → Output: ${result.metadata.outputCount} records</p>
            <p>Processing time: ${result.metadata.processingTime}ms</p>
            <p>Applied rules: ${result.metadata.appliedRules.map(r => r.type).join(', ')}</p>
        `;
        resultsContent.appendChild(summary);

        // Display results
        result.result.forEach((record, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-header">
                    <strong>Record ${index + 1}</strong>
                </div>
                <pre><code>${JSON.stringify(record, null, 2)}</code></pre>
            `;
            resultsContent.appendChild(resultItem);
        });

        resultsContainer.appendChild(resultsContent);
    }

    clearResults() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <div class="empty-icon">📊</div>
                <h3>No Results Yet</h3>
                <p>Configure your data and rules, then click "Process" to see results</p>
            </div>
        `;
        this.lastResult = null;
    }

    updateStats(inputCount, rulesCount, outputCount, processingTime) {
        document.getElementById('inputCount').textContent = inputCount;
        document.getElementById('rulesCount').textContent = rulesCount;
        document.getElementById('outputCount').textContent = outputCount;
        document.getElementById('processingTime').textContent = `${processingTime}ms`;
    }

    updateRulesCount() {
        const count = Object.keys(this.currentCondition).length;
        document.getElementById('rulesCount').textContent = count;
    }

    exportResults() {
        if (!this.lastResult) {
            this.showNotification('No results to export. Process data first.', 'warning');
            return;
        }

        try {
            const jsonData = DataProcessor.exportResult(this.lastResult, 'json');
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `data-processing-results-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Results exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    async copyResults() {
        if (!this.lastResult) {
            this.showNotification('No results to copy. Process data first.', 'warning');
            return;
        }

        try {
            const jsonData = JSON.stringify(this.lastResult, null, 2);
            await navigator.clipboard.writeText(jsonData);
            this.showNotification('Results copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showNotification('Copy failed. Please try again.', 'error');
        }
    }

    toggleDocumentation() {
        const docsContent = document.getElementById('docsContent');
        const isVisible = docsContent.style.display !== 'none';
        docsContent.style.display = isVisible ? 'none' : 'block';
    }

    runTests() {
        const testRunner = document.getElementById('testRunner');
        const testResults = document.getElementById('testResults');
        
        testRunner.classList.add('active');
        testResults.innerHTML = '<div class="loading">Running tests...</div>';

        setTimeout(() => {
            const results = UnitTests.runTests();
            
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

// Make DataProcessorUI available globally for React component
window.DataProcessorUI = DataProcessorUI;