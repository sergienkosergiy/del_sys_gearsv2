// Configuration Editor Application
class ConfigEditorApp {
    constructor() {
        this.currentConfig = this.getDefaultConfig();
        this.validationTimeout = null;
        this.init();
    }

    getDefaultConfig() {
        return {
            "startQuestion": "q1",
            "questions": {
                "q1": {
                    "question": "What is your marital status?",
                    "answers": {
                        "Single": "q2",
                        "Married": "q3",
                        "Divorced": "q2",
                        "Widowed": "q2"
                    }
                },
                "q2": {
                    "question": "Are you planning on getting married next year?",
                    "answers": {
                        "Yes": null,
                        "No": null,
                        "Maybe": null
                    }
                },
                "q3": {
                    "question": "How long have you been married?",
                    "answers": {
                        "Less than a year": "q4",
                        "1-5 years": "q5",
                        "More than 5 years": "q6"
                    }
                },
                "q4": {
                    "question": "Have you celebrated your one year anniversary?",
                    "answers": {
                        "Yes": null,
                        "No": null,
                        "Planning to": null
                    }
                },
                "q5": {
                    "question": "Do you have children?",
                    "answers": {
                        "Yes": "q7",
                        "No": "q8"
                    }
                },
                "q6": {
                    "question": "Are you satisfied with your marriage?",
                    "answers": {
                        "Very satisfied": null,
                        "Somewhat satisfied": null,
                        "Not satisfied": null
                    }
                },
                "q7": {
                    "question": "How many children do you have?",
                    "answers": {
                        "1": null,
                        "2": null,
                        "3 or more": null
                    }
                },
                "q8": {
                    "question": "What are your future family plans?",
                    "answers": {
                        "Want children soon": null,
                        "Want children later": null,
                        "No children planned": null
                    }
                }
            }
        };
    }

    init() {
        this.setupEditor();
        this.bindEventListeners();
        this.loadConfiguration();
        console.log('Config Editor App initialized');
    }

    setupEditor() {
        const editor = document.getElementById('configEditor');
        const lineNumbers = document.getElementById('lineNumbers');

        // Set initial content
        editor.value = JSON.stringify(this.currentConfig, null, 2);
        this.updateLineNumbers();

        // Add input listeners
        editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.scheduleValidation();
        });

        editor.addEventListener('scroll', () => {
            lineNumbers.scrollTop = editor.scrollTop;
        });

        // Add keyboard shortcuts
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveConfiguration();
                } else if (e.key === 'f') {
                    e.preventDefault();
                    this.formatJSON();
                }
            }

            // Tab handling
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 2;
            }
        });
    }

    bindEventListeners() {
        document.getElementById('validateBtn').addEventListener('click', () => this.validateConfiguration());
        document.getElementById('formatBtn').addEventListener('click', () => this.formatJSON());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('previewBtn').addEventListener('click', () => this.previewFlow());
        document.getElementById('testBtn').addEventListener('click', () => this.testAllPaths());
    }

    updateLineNumbers() {
        const editor = document.getElementById('configEditor');
        const lineNumbers = document.getElementById('lineNumbers');
        const lines = editor.value.split('\n').length;
        
        let lineNumbersContent = '';
        for (let i = 1; i <= lines; i++) {
            lineNumbersContent += i + '\n';
        }
        
        lineNumbers.textContent = lineNumbersContent;
    }

    scheduleValidation() {
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
            this.validateConfiguration();
        }, 1000);
    }

    loadConfiguration() {
        const editor = document.getElementById('configEditor');
        editor.value = JSON.stringify(this.currentConfig, null, 2);
        this.updateLineNumbers();
        this.validateConfiguration();
    }

    validateConfiguration() {
        const editor = document.getElementById('configEditor');
        const validationStatus = document.getElementById('validationStatus');
        
        try {
            const config = JSON.parse(editor.value);
            const validation = QuestionnaireEngine.validateConfig(config);
            
            if (validation.isValid) {
                this.currentConfig = config;
                validationStatus.className = 'validation-status valid';
                validationStatus.innerHTML = '✅ Configuration is valid';
                return true;
            } else {
                validationStatus.className = 'validation-status invalid';
                validationStatus.innerHTML = `❌ ${validation.errors.join(', ')}`;
                return false;
            }
        } catch (error) {
            validationStatus.className = 'validation-status invalid';
            validationStatus.innerHTML = `❌ JSON Parse Error: ${error.message}`;
            return false;
        }
    }

    formatJSON() {
        const editor = document.getElementById('configEditor');
        
        try {
            const config = JSON.parse(editor.value);
            editor.value = JSON.stringify(config, null, 2);
            this.updateLineNumbers();
            this.showNotification('JSON formatted successfully!', 'success');
        } catch (error) {
            this.showNotification('Cannot format invalid JSON', 'error');
        }
    }

    saveConfiguration() {
        if (this.validateConfiguration()) {
            // In a real application, this would save to a server or local storage
            localStorage.setItem('questionnaireConfig', JSON.stringify(this.currentConfig));
            this.showNotification('Configuration saved successfully!', 'success');
        } else {
            this.showNotification('Cannot save invalid configuration', 'error');
        }
    }

    previewFlow() {
        if (!this.validateConfiguration()) {
            this.showNotification('Fix configuration errors before previewing', 'error');
            return;
        }

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '';

        const flowDiagram = document.createElement('div');
        flowDiagram.className = 'flow-diagram';

        // Create flow visualization
        Object.entries(this.currentConfig.questions).forEach(([questionId, questionData]) => {
            const nodeElement = this.createFlowNode(questionId, questionData, questionId === this.currentConfig.startQuestion);
            flowDiagram.appendChild(nodeElement);
        });

        previewContent.appendChild(flowDiagram);
    }

    createFlowNode(questionId, questionData, isStart = false) {
        const node = document.createElement('div');
        node.className = `flow-node ${isStart ? 'start' : ''}`;

        const header = document.createElement('div');
        header.className = 'node-header';

        const nodeIdSpan = document.createElement('span');
        nodeIdSpan.className = 'node-id';
        nodeIdSpan.textContent = questionId;

        header.appendChild(nodeIdSpan);

        const question = document.createElement('div');
        question.className = 'node-question';
        question.textContent = questionData.question;

        const answers = document.createElement('div');
        answers.className = 'node-answers';

        Object.entries(questionData.answers).forEach(([answer, nextQuestionId]) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';

            const answerText = document.createElement('span');
            answerText.className = 'answer-text';
            answerText.textContent = answer;

            const answerNext = document.createElement('span');
            answerNext.className = 'answer-next';
            answerNext.textContent = nextQuestionId ? `→ ${nextQuestionId}` : '→ END';

            answerOption.appendChild(answerText);
            answerOption.appendChild(answerNext);
            answers.appendChild(answerOption);
        });

        node.appendChild(header);
        node.appendChild(question);
        node.appendChild(answers);

        return node;
    }

    async testAllPaths() {
        if (!this.validateConfiguration()) {
            this.showNotification('Fix configuration errors before testing', 'error');
            return;
        }

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '<div class="loading-spinner" style="margin: 2rem auto;"></div>';

        try {
            // Add delay to show loading
            await new Promise(resolve => setTimeout(resolve, 500));

            const analyzer = new PathAnalyzerEngine(this.currentConfig);
            const results = analyzer.analyzeAllPaths();

            this.displayPathAnalysis(results);
            this.showNotification(`Found ${results.paths.number} possible paths!`, 'success');

        } catch (error) {
            console.error('Path analysis failed:', error);
            this.showNotification('Path analysis failed', 'error');
            previewContent.innerHTML = '<div class="empty-preview"><p>Analysis failed. Check console for details.</p></div>';
        }
    }

    displayPathAnalysis(results) {
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '';

        // Create summary
        const summary = document.createElement('div');
        summary.className = 'path-summary';

        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Path Analysis Summary';

        const summaryStats = document.createElement('div');
        summaryStats.className = 'summary-stats';

        const stats = [
            { label: 'Total Paths', value: results.statistics.totalPaths },
            { label: 'Avg Length', value: results.statistics.averageLength },
            { label: 'Max Length', value: results.statistics.maxLength },
            { label: 'Min Length', value: results.statistics.minLength }
        ];

        stats.forEach(stat => {
            const statBox = document.createElement('div');
            statBox.className = 'stat-box';

            const statValue = document.createElement('span');
            statValue.className = 'stat-value';
            statValue.textContent = stat.value;

            const statLabel = document.createElement('span');
            statLabel.className = 'stat-label';
            statLabel.textContent = stat.label;

            statBox.appendChild(statValue);
            statBox.appendChild(statLabel);
            summaryStats.appendChild(statBox);
        });

        summary.appendChild(summaryTitle);
        summary.appendChild(summaryStats);
        previewContent.appendChild(summary);

        // Display first few paths as examples
        if (results.paths.list.length > 0) {
            const examplesTitle = document.createElement('h3');
            examplesTitle.textContent = 'Example Paths (first 3)';
            examplesTitle.style.margin = '2rem 0 1rem 0';
            previewContent.appendChild(examplesTitle);

            results.paths.list.slice(0, 3).forEach((path, index) => {
                const pathElement = this.createPathExample(path, index + 1);
                previewContent.appendChild(pathElement);
            });
        }
    }

    createPathExample(path, pathNumber) {
        const pathDiv = document.createElement('div');
        pathDiv.className = 'flow-node';
        pathDiv.style.marginBottom = '1rem';

        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `<strong>Path ${pathNumber} (${path.length} steps)</strong>`;

        const steps = document.createElement('div');
        steps.style.marginTop = '1rem';

        path.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.style.padding = '0.5rem';
            stepDiv.style.background = 'var(--bg-secondary)';
            stepDiv.style.borderRadius = 'var(--radius-sm)';
            stepDiv.style.marginBottom = '0.5rem';

            const question = Object.keys(step)[0];
            const answer = Object.values(step)[0];

            stepDiv.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${index + 1}. ${question}</div>
                <div style="color: var(--secondary-color); font-weight: 500;">→ ${answer}</div>
            `;

            steps.appendChild(stepDiv);
        });

        pathDiv.appendChild(header);
        pathDiv.appendChild(steps);

        return pathDiv;
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
    new ConfigEditorApp();
});