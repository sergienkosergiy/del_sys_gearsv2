// Testing Suite Engine - Comprehensive testing framework for the questionnaire system
class TestingSuiteEngine {
    constructor(config) {
        this.config = config;
        this.testResults = [];
        this.testGroups = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    /**
     * Run all enabled tests
     * @param {Object} options - Test options
     * @returns {Promise<Object>} Test results
     */
    async runAllTests(options = {}) {
        this.resetResults();
        
        const {
            validateConfig = true,
            testAllPaths = true,
            testEngineLogic = true,
            performanceTest = false
        } = options;

        console.log('Starting test suite...');

        try {
            if (validateConfig) {
                await this.runConfigurationTests();
            }

            if (testEngineLogic) {
                await this.runEngineLogicTests();
            }

            if (testAllPaths) {
                await this.runPathAnalysisTests();
            }

            if (performanceTest) {
                await this.runPerformanceTests();
            }

        } catch (error) {
            console.error('Test suite execution failed:', error);
        }

        return this.getTestSummary();
    }

    /**
     * Reset test results
     */
    resetResults() {
        this.testResults = [];
        this.testGroups = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    /**
     * Run configuration validation tests
     */
    async runConfigurationTests() {
        const groupName = 'Configuration Validation';
        this.startTestGroup(groupName);

        // Test 1: Basic structure validation
        await this.runTest(
            'Basic Structure Validation',
            'Validates that the configuration has required properties',
            () => {
                const validation = QuestionnaireEngine.validateConfig(this.config);
                if (!validation.isValid) {
                    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
                }
                return true;
            }
        );

        // Test 2: Start question exists
        await this.runTest(
            'Start Question Exists',
            'Verifies that the start question exists in questions object',
            () => {
                if (!this.config.questions[this.config.startQuestion]) {
                    throw new Error(`Start question "${this.config.startQuestion}" not found in questions`);
                }
                return true;
            }
        );

        // Test 3: All referenced questions exist
        await this.runTest(
            'Question References Valid',
            'Checks that all answer references point to valid questions or null',
            () => {
                const errors = [];
                Object.entries(this.config.questions).forEach(([questionId, questionData]) => {
                    Object.entries(questionData.answers).forEach(([answer, nextQuestionId]) => {
                        if (nextQuestionId !== null && !this.config.questions[nextQuestionId]) {
                            errors.push(`Question "${questionId}" answer "${answer}" refers to non-existent question "${nextQuestionId}"`);
                        }
                    });
                });
                
                if (errors.length > 0) {
                    throw new Error(errors.join('; '));
                }
                return true;
            }
        );

        // Test 4: No circular references
        await this.runTest(
            'No Circular References',
            'Detects circular references that could cause infinite loops',
            () => {
                const visited = new Set();
                const stack = new Set();
                
                const hasCircular = (questionId) => {
                    if (!questionId) return false;
                    if (stack.has(questionId)) return true;
                    if (visited.has(questionId)) return false;
                    
                    visited.add(questionId);
                    stack.add(questionId);
                    
                    const question = this.config.questions[questionId];
                    if (question) {
                        for (const nextQuestionId of Object.values(question.answers)) {
                            if (hasCircular(nextQuestionId)) {
                                return true;
                            }
                        }
                    }
                    
                    stack.delete(questionId);
                    return false;
                };
                
                if (hasCircular(this.config.startQuestion)) {
                    throw new Error('Circular reference detected in questionnaire flow');
                }
                return true;
            }
        );

        this.endTestGroup(groupName);
    }

    /**
     * Run engine logic tests
     */
    async runEngineLogicTests() {
        const groupName = 'Engine Logic Tests';
        this.startTestGroup(groupName);

        // Test 1: Engine initialization
        await this.runTest(
            'Engine Initialization',
            'Tests that the engine initializes correctly with valid configuration',
            () => {
                const engine = new QuestionnaireEngine(this.config);
                if (engine.currentQuestionId !== this.config.startQuestion) {
                    throw new Error(`Engine should start with question "${this.config.startQuestion}", got "${engine.currentQuestionId}"`);
                }
                return true;
            }
        );

        // Test 2: Current question retrieval
        await this.runTest(
            'Current Question Retrieval',
            'Tests getting current question data',
            () => {
                const engine = new QuestionnaireEngine(this.config);
                const question = engine.getCurrentQuestion();
                
                if (!question.id || !question.question || !question.answers) {
                    throw new Error('getCurrentQuestion should return object with id, question, and answers');
                }
                return true;
            }
        );

        // Test 3: Answer processing
        await this.runTest(
            'Answer Processing',
            'Tests answering questions and navigation',
            () => {
                const engine = new QuestionnaireEngine(this.config);
                const firstQuestion = engine.getCurrentQuestion();
                const firstAnswer = firstQuestion.answers[0];
                
                const hasNext = engine.answerQuestion(firstAnswer);
                const answers = engine.getAnswers();
                
                if (answers.length !== 1) {
                    throw new Error(`Expected 1 answer, got ${answers.length}`);
                }
                
                if (answers[0].answer !== firstAnswer) {
                    throw new Error(`Expected answer "${firstAnswer}", got "${answers[0].answer}"`);
                }
                
                return true;
            }
        );

        // Test 4: Back navigation
        await this.runTest(
            'Back Navigation',
            'Tests going back to previous questions',
            () => {
                const engine = new QuestionnaireEngine(this.config);
                
                // Can't go back at start
                if (engine.goBack()) {
                    throw new Error('Should not be able to go back at start');
                }
                
                // Answer a question, then go back
                const firstQuestion = engine.getCurrentQuestion();
                const firstAnswer = firstQuestion.answers[0];
                engine.answerQuestion(firstAnswer);
                
                const canGoBack = engine.goBack();
                if (!canGoBack) {
                    throw new Error('Should be able to go back after answering question');
                }
                
                if (engine.getAnswers().length !== 0) {
                    throw new Error('Answers should be empty after going back');
                }
                
                return true;
            }
        );

        // Test 5: Progress calculation
        await this.runTest(
            'Progress Calculation',
            'Tests progress percentage calculation',
            () => {
                const engine = new QuestionnaireEngine(this.config);
                const initialProgress = engine.getProgress();
                
                if (initialProgress < 0 || initialProgress > 100) {
                    throw new Error(`Progress should be between 0-100, got ${initialProgress}`);
                }
                
                return true;
            }
        );

        this.endTestGroup(groupName);
    }

    /**
     * Run path analysis tests
     */
    async runPathAnalysisTests() {
        const groupName = 'Path Analysis Tests';
        this.startTestGroup(groupName);

        // Test 1: Path analyzer initialization
        await this.runTest(
            'Path Analyzer Initialization',
            'Tests that the path analyzer initializes correctly',
            () => {
                const analyzer = new PathAnalyzerEngine(this.config);
                if (!analyzer.config) {
                    throw new Error('Path analyzer should have config property');
                }
                return true;
            }
        );

        // Test 2: Path generation
        await this.runTest(
            'Path Generation',
            'Tests that paths are generated correctly',
            () => {
                const analyzer = new PathAnalyzerEngine(this.config);
                const results = analyzer.analyzeAllPaths();
                
                if (!results.paths || !results.paths.list) {
                    throw new Error('Results should contain paths.list array');
                }
                
                if (results.paths.list.length === 0) {
                    throw new Error('Should generate at least one path');
                }
                
                if (results.paths.number !== results.paths.list.length) {
                    throw new Error('Path number should match list length');
                }
                
                return true;
            }
        );

        // Test 3: Path validation
        await this.runTest(
            'Path Validation',
            'Validates that all generated paths are valid sequences',
            () => {
                const analyzer = new PathAnalyzerEngine(this.config);
                const results = analyzer.analyzeAllPaths();
                
                results.paths.list.forEach((path, pathIndex) => {
                    if (!Array.isArray(path)) {
                        throw new Error(`Path ${pathIndex} should be an array`);
                    }
                    
                    if (path.length === 0) {
                        throw new Error(`Path ${pathIndex} should not be empty`);
                    }
                    
                    path.forEach((step, stepIndex) => {
                        const keys = Object.keys(step);
                        const values = Object.values(step);
                        
                        if (keys.length !== 1 || values.length !== 1) {
                            throw new Error(`Step ${stepIndex} in path ${pathIndex} should have exactly one question-answer pair`);
                        }
                    });
                });
                
                return true;
            }
        );

        // Test 4: Statistics calculation
        await this.runTest(
            'Statistics Calculation',
            'Tests that path statistics are calculated correctly',
            () => {
                const analyzer = new PathAnalyzerEngine(this.config);
                const results = analyzer.analyzeAllPaths();
                
                const stats = results.statistics;
                if (typeof stats.totalPaths !== 'number' || stats.totalPaths < 0) {
                    throw new Error('Total paths should be a non-negative number');
                }
                
                if (typeof stats.averageLength !== 'number' || stats.averageLength < 0) {
                    throw new Error('Average length should be a non-negative number');
                }
                
                if (typeof stats.maxLength !== 'number' || stats.maxLength < 0) {
                    throw new Error('Max length should be a non-negative number');
                }
                
                if (stats.maxLength < stats.averageLength) {
                    throw new Error('Max length should be >= average length');
                }
                
                return true;
            }
        );

        this.endTestGroup(groupName);
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        const groupName = 'Performance Tests';
        this.startTestGroup(groupName);

        // Test 1: Engine performance
        await this.runTest(
            'Engine Performance',
            'Tests questionnaire engine performance with multiple operations',
            () => {
                const startTime = performance.now();
                
                for (let i = 0; i < 1000; i++) {
                    const engine = new QuestionnaireEngine(this.config);
                    engine.getCurrentQuestion();
                    const firstQuestion = engine.getCurrentQuestion();
                    if (firstQuestion.answers.length > 0) {
                        engine.answerQuestion(firstQuestion.answers[0]);
                    }
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (duration > 1000) { // More than 1 second for 1000 operations
                    throw new Error(`Engine performance too slow: ${duration}ms for 1000 operations`);
                }
                
                return true;
            }
        );

        // Test 2: Path analysis performance
        await this.runTest(
            'Path Analysis Performance',
            'Tests path analysis performance',
            () => {
                const startTime = performance.now();
                
                const analyzer = new PathAnalyzerEngine(this.config);
                analyzer.analyzeAllPaths();
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                if (duration > 5000) { // More than 5 seconds
                    throw new Error(`Path analysis too slow: ${duration}ms`);
                }
                
                return true;
            }
        );

        this.endTestGroup(groupName);
    }

    /**
     * Run a single test
     */
    async runTest(name, description, testFunction) {
        const startTime = performance.now();
        let status = 'running';
        let error = null;

        try {
            const result = await testFunction();
            status = result ? 'passed' : 'failed';
            if (status === 'passed') {
                this.passedTests++;
            } else {
                this.failedTests++;
            }
        } catch (e) {
            status = 'failed';
            error = e.message;
            this.failedTests++;
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        const testResult = {
            name,
            description,
            status,
            error,
            duration
        };

        this.testResults.push(testResult);
        return testResult;
    }

    /**
     * Start a test group
     */
    startTestGroup(name) {
        this.testGroups.push({
            name,
            startIndex: this.testResults.length,
            status: 'running'
        });
    }

    /**
     * End a test group
     */
    endTestGroup(name) {
        const group = this.testGroups.find(g => g.name === name);
        if (group) {
            const groupTests = this.testResults.slice(group.startIndex);
            const hasFailures = groupTests.some(test => test.status === 'failed');
            group.status = hasFailures ? 'failed' : 'passed';
        }
    }

    /**
     * Get test summary
     */
    getTestSummary() {
        return {
            totalTests: this.testResults.length,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            testGroups: this.testGroups,
            testResults: this.testResults,
            overallStatus: this.failedTests === 0 ? 'passed' : 'failed'
        };
    }

    /**
     * Export test results to JSON
     */
    exportResults() {
        const summary = this.getTestSummary();
        return JSON.stringify({
            ...summary,
            metadata: {
                timestamp: new Date().toISOString(),
                configHash: this.generateConfigHash()
            }
        }, null, 2);
    }

    /**
     * Generate a simple hash of the configuration
     */
    generateConfigHash() {
        const configString = JSON.stringify(this.config);
        let hash = 0;
        for (let i = 0; i < configString.length; i++) {
            const char = configString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}