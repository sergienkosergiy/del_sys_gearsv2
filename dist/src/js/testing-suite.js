// Testing Suite Application
class TestingSuiteApp {
    constructor() {
        this.testEngine = new TestingSuiteEngine(questionnaireConfig);
        this.isRunning = false;
        this.init();
    }

    init() {
        this.bindEventListeners();
        console.log('Testing Suite App initialized');
    }

    bindEventListeners() {
        const runTestsBtn = document.getElementById('runTestsBtn');
        runTestsBtn.addEventListener('click', () => this.runTests());
    }

    async runTests() {
        if (this.isRunning) return;

        this.isRunning = true;
        const runTestsBtn = document.getElementById('runTestsBtn');
        const originalText = runTestsBtn.textContent;

        try {
            // Update UI to show running state
            runTestsBtn.innerHTML = '<span class="loading-spinner"></span>Running Tests...';
            runTestsBtn.disabled = true;

            // Clear previous results
            this.clearResults();

            // Get test options from checkboxes
            const options = {
                validateConfig: document.getElementById('validateConfig').checked,
                testAllPaths: document.getElementById('testAllPaths').checked,
                testEngineLogic: document.getElementById('testEngineLogic').checked,
                performanceTest: document.getElementById('performanceTest').checked
            };

            // Run tests with real-time updates
            await this.runTestsWithUpdates(options);

            this.showNotification('All tests completed successfully!', 'success');

        } catch (error) {
            console.error('Test execution failed:', error);
            this.showNotification('Test execution failed. Check console for details.', 'error');
        } finally {
            // Reset button
            runTestsBtn.textContent = originalText;
            runTestsBtn.disabled = false;
            this.isRunning = false;
        }
    }

    async runTestsWithUpdates(options) {
        const testResults = document.getElementById('testResults');
        const emptyResults = testResults.querySelector('.empty-results');
        if (emptyResults) {
            emptyResults.remove();
        }

        // Initialize test engine
        this.testEngine = new TestingSuiteEngine(questionnaireConfig);

        // Run each test group with UI updates
        if (options.validateConfig) {
            await this.runTestGroupWithUpdates('Configuration Validation', () => 
                this.testEngine.runConfigurationTests());
        }

        if (options.testEngineLogic) {
            await this.runTestGroupWithUpdates('Engine Logic Tests', () => 
                this.testEngine.runEngineLogicTests());
        }

        if (options.testAllPaths) {
            await this.runTestGroupWithUpdates('Path Analysis Tests', () => 
                this.testEngine.runPathAnalysisTests());
        }

        if (options.performanceTest) {
            await this.runTestGroupWithUpdates('Performance Tests', () => 
                this.testEngine.runPerformanceTests());
        }

        // Update final summary
        this.updateTestSummary();
    }

    async runTestGroupWithUpdates(groupName, testFunction) {
        const testResults = document.getElementById('testResults');
        
        // Create test group element
        const groupElement = this.createTestGroupElement(groupName, 'running');
        testResults.appendChild(groupElement);

        const initialTestCount = this.testEngine.testResults.length;

        // Run the test group
        await testFunction();

        // Get the new tests from this group
        const newTests = this.testEngine.testResults.slice(initialTestCount);
        
        // Add test cases to the group with animation
        for (let i = 0; i < newTests.length; i++) {
            const testCase = newTests[i];
            const testElement = this.createTestCaseElement(testCase);
            
            // Add with slight delay for animation effect
            setTimeout(() => {
                groupElement.querySelector('.test-cases').appendChild(testElement);
                
                // Animate in
                testElement.style.opacity = '0';
                testElement.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    testElement.style.transition = 'all 0.3s ease';
                    testElement.style.opacity = '1';
                    testElement.style.transform = 'translateY(0)';
                }, 50);
            }, i * 100);
        }

        // Update group status
        setTimeout(() => {
            const hasFailures = newTests.some(test => test.status === 'failed');
            const groupStatus = hasFailures ? 'failed' : 'passed';
            
            const statusElement = groupElement.querySelector('.test-group-status');
            statusElement.textContent = groupStatus;
            statusElement.className = `test-group-status ${groupStatus}`;
        }, newTests.length * 100 + 200);
    }

    createTestGroupElement(name, status) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'test-group';

        groupDiv.innerHTML = `
            <div class="test-group-header">
                <div class="test-group-title">${name}</div>
                <div class="test-group-status ${status}">${status}</div>
            </div>
            <div class="test-cases"></div>
        `;

        return groupDiv;
    }

    createTestCaseElement(testCase) {
        const caseDiv = document.createElement('div');
        caseDiv.className = `test-case ${testCase.status}`;

        const statusIcon = testCase.status === 'passed' ? '✅' : 
                          testCase.status === 'failed' ? '❌' : '⏳';

        let errorHtml = '';
        if (testCase.error) {
            errorHtml = `<div class="test-error">${testCase.error}</div>`;
        }

        caseDiv.innerHTML = `
            <div class="test-info">
                <div class="test-name">${testCase.name}</div>
                <div class="test-description">${testCase.description}</div>
                <div class="test-duration">Duration: ${testCase.duration}ms</div>
                ${errorHtml}
            </div>
            <div class="test-status-icon ${testCase.status}">${statusIcon}</div>
        `;

        return caseDiv;
    }

    updateTestSummary() {
        const summary = this.testEngine.getTestSummary();
        
        document.getElementById('passedCount').textContent = summary.passedTests;
        document.getElementById('failedCount').textContent = summary.failedTests;
        document.getElementById('totalCount').textContent = summary.totalTests;

        // Add animation to summary counts
        const summaryValues = document.querySelectorAll('.summary-value');
        summaryValues.forEach(value => {
            value.style.transform = 'scale(1.1)';
            setTimeout(() => {
                value.style.transform = 'scale(1)';
            }, 200);
        });
    }

    clearResults() {
        const testResults = document.getElementById('testResults');
        testResults.innerHTML = '<div class="loading-message" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Running tests...</div>';
        
        // Reset summary
        document.getElementById('passedCount').textContent = '0';
        document.getElementById('failedCount').textContent = '0';
        document.getElementById('totalCount').textContent = '0';
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
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
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
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TestingSuiteApp();
});