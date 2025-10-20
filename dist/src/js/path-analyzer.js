// Path Analyzer Application
class PathAnalyzerApp {
    constructor() {
        this.analyzer = new PathAnalyzerEngine(questionnaireConfig);
        this.analysisResults = null;
        this.init();
    }

    init() {
        this.bindEventListeners();
        console.log('Path Analyzer App initialized');
    }

    bindEventListeners() {
        const analyzeButton = document.getElementById('analyzeButton');
        const exportButton = document.getElementById('exportButton');

        analyzeButton.addEventListener('click', () => this.runAnalysis());
        exportButton.addEventListener('click', () => this.exportResults());
    }

    async runAnalysis() {
        const analyzeButton = document.getElementById('analyzeButton');
        const originalText = analyzeButton.textContent;

        try {
            // Show loading state
            analyzeButton.innerHTML = '<span class="loading-spinner"></span>Analyzing...';
            analyzeButton.disabled = true;

            // Add small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500));

            // Run the analysis
            this.analysisResults = this.analyzer.analyzeAllPaths();
            
            // Update UI
            this.updateStatistics();
            this.displayPaths();
            
            // Enable export button
            document.getElementById('exportButton').disabled = false;
            
            this.showNotification(`Analysis complete! Found ${this.analysisResults.paths.number} possible paths.`, 'success');

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showNotification('Analysis failed. Please check the console for details.', 'error');
        } finally {
            // Reset button
            analyzeButton.textContent = originalText;
            analyzeButton.disabled = false;
        }
    }

    updateStatistics() {
        if (!this.analysisResults) return;

        const stats = this.analysisResults.statistics;
        
        document.getElementById('totalPaths').textContent = stats.totalPaths;
        document.getElementById('avgLength').textContent = stats.averageLength;
        document.getElementById('maxLength').textContent = stats.maxLength;

        // Add animation to statistics
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            stat.style.transform = 'scale(1.1)';
            stat.style.color = 'var(--success-color)';
            
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
                stat.style.color = 'var(--primary-color)';
            }, 200);
        });
    }

    displayPaths() {
        if (!this.analysisResults) return;

        const pathsContainer = document.getElementById('pathsContainer');
        const emptyState = document.getElementById('emptyState');

        // Hide empty state
        if (emptyState) {
            emptyState.remove();
        }

        // Clear previous results
        pathsContainer.innerHTML = '';

        // Get detailed paths
        const detailedPaths = this.analyzer.getDetailedPaths();

        // Create path elements
        detailedPaths.forEach(pathData => {
            const pathElement = this.createPathElement(pathData);
            pathsContainer.appendChild(pathElement);
        });

        // Add staggered animation
        const pathItems = pathsContainer.querySelectorAll('.path-item');
        pathItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 50 * index);
        });
    }

    createPathElement(pathData) {
        const pathDiv = document.createElement('div');
        pathDiv.className = 'path-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'path-header';

        const pathNumber = document.createElement('div');
        pathNumber.className = 'path-number';
        pathNumber.textContent = `Path ${pathData.id}`;

        const pathLength = document.createElement('div');
        pathLength.className = 'path-length';
        pathLength.textContent = `${pathData.length} step${pathData.length !== 1 ? 's' : ''}`;

        headerDiv.appendChild(pathNumber);
        headerDiv.appendChild(pathLength);

        const stepsDiv = document.createElement('div');
        stepsDiv.className = 'path-steps';

        pathData.steps.forEach(step => {
            const stepElement = this.createStepElement(step);
            stepsDiv.appendChild(stepElement);
        });

        pathDiv.appendChild(headerDiv);
        pathDiv.appendChild(stepsDiv);

        return pathDiv;
    }

    createStepElement(step) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';

        const stepNumber = document.createElement('div');
        stepNumber.className = 'step-number';
        stepNumber.textContent = step.stepNumber;

        const stepContent = document.createElement('div');
        stepContent.className = 'step-content';

        const stepQuestion = document.createElement('div');
        stepQuestion.className = 'step-question';
        stepQuestion.textContent = step.question;

        const stepAnswer = document.createElement('div');
        stepAnswer.className = 'step-answer';
        stepAnswer.textContent = step.answer;

        stepContent.appendChild(stepQuestion);
        stepContent.appendChild(stepAnswer);

        stepDiv.appendChild(stepNumber);
        stepDiv.appendChild(stepContent);

        return stepDiv;
    }

    exportResults() {
        if (!this.analysisResults) {
            this.showNotification('No analysis results to export. Run analysis first.', 'warning');
            return;
        }

        try {
            const jsonData = this.analyzer.exportToJSON();
            
            // Create and trigger download
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `questionnaire-analysis-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Analysis results exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
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

        // Set background color based on type
        const colors = {
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444',
            success: '#10b981'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
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
    new PathAnalyzerApp();
});