// Path Analyzer Engine - Generates all possible questionnaire paths
class PathAnalyzerEngine {
    constructor(config) {
        this.config = config;
        this.allPaths = [];
        this.statistics = {
            totalPaths: 0,
            averageLength: 0,
            maxLength: 0,
            minLength: 0
        };
    }

    /**
     * Analyze all possible paths through the questionnaire
     * @returns {Object} Analysis results with paths and statistics
     */
    analyzeAllPaths() {
        this.allPaths = [];
        this.generatePaths(this.config.startQuestion, []);
        this.calculateStatistics();
        
        return {
            paths: {
                number: this.allPaths.length,
                list: this.allPaths
            },
            statistics: this.statistics
        };
    }

    /**
     * Recursively generate all possible paths
     * @param {string} questionId - Current question ID
     * @param {Array} currentPath - Current path being built
     */
    generatePaths(questionId, currentPath) {
        // If questionId is null, we've reached the end of this path
        if (questionId === null) {
            this.allPaths.push([...currentPath]);
            return;
        }

        const question = this.config.questions[questionId];
        if (!question) {
            console.warn(`Question not found: ${questionId}`);
            return;
        }

        // For each possible answer, create a new path
        Object.entries(question.answers).forEach(([answer, nextQuestionId]) => {
            const newPathStep = {
                [question.question]: answer
            };
            
            const newPath = [...currentPath, newPathStep];
            this.generatePaths(nextQuestionId, newPath);
        });
    }

    /**
     * Calculate statistics about the paths
     */
    calculateStatistics() {
        if (this.allPaths.length === 0) {
            this.statistics = {
                totalPaths: 0,
                averageLength: 0,
                maxLength: 0,
                minLength: 0
            };
            return;
        }

        const lengths = this.allPaths.map(path => path.length);
        
        this.statistics = {
            totalPaths: this.allPaths.length,
            averageLength: Math.round((lengths.reduce((sum, len) => sum + len, 0) / lengths.length) * 10) / 10,
            maxLength: Math.max(...lengths),
            minLength: Math.min(...lengths)
        };
    }

    /**
     * Get detailed path information
     * @returns {Array} Array of detailed path objects
     */
    getDetailedPaths() {
        return this.allPaths.map((path, index) => ({
            id: index + 1,
            length: path.length,
            steps: path.map((step, stepIndex) => ({
                stepNumber: stepIndex + 1,
                question: Object.keys(step)[0],
                answer: Object.values(step)[0]
            }))
        }));
    }

    /**
     * Export analysis results to JSON format
     * @returns {string} JSON string of the analysis results
     */
    exportToJSON() {
        const results = {
            paths: {
                number: this.allPaths.length,
                list: this.allPaths
            },
            statistics: this.statistics,
            metadata: {
                generatedAt: new Date().toISOString(),
                configurationHash: this.generateConfigHash(),
                totalQuestions: Object.keys(this.config.questions).length
            }
        };

        return JSON.stringify(results, null, 2);
    }

    /**
     * Generate a simple hash of the configuration for comparison
     * @returns {string} Simple hash of the configuration
     */
    generateConfigHash() {
        const configString = JSON.stringify(this.config);
        let hash = 0;
        for (let i = 0; i < configString.length; i++) {
            const char = configString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Find paths that contain specific criteria
     * @param {Function} criteria - Function that takes a path and returns true/false
     * @returns {Array} Filtered paths
     */
    findPathsBy(criteria) {
        return this.allPaths.filter(criteria);
    }

    /**
     * Find paths that contain a specific question-answer combination
     * @param {string} question - Question text to search for
     * @param {string} answer - Answer text to search for
     * @returns {Array} Paths containing the specified question-answer combination
     */
    findPathsWithAnswer(question, answer) {
        return this.findPathsBy(path => 
            path.some(step => 
                Object.keys(step)[0] === question && 
                Object.values(step)[0] === answer
            )
        );
    }

    /**
     * Get paths grouped by length
     * @returns {Object} Paths grouped by their length
     */
    getPathsByLength() {
        const grouped = {};
        
        this.allPaths.forEach((path, index) => {
            const length = path.length;
            if (!grouped[length]) {
                grouped[length] = [];
            }
            grouped[length].push({
                id: index + 1,
                path: path
            });
        });

        return grouped;
    }

    /**
     * Validate that all paths are reachable and properly terminated
     * @returns {Object} Validation results
     */
    validatePaths() {
        const errors = [];
        const warnings = [];

        // Check if we have any paths
        if (this.allPaths.length === 0) {
            errors.push('No paths found - questionnaire may have circular references or unreachable questions');
        }

        // Check for extremely short paths (might indicate missing questions)
        const shortPaths = this.allPaths.filter(path => path.length === 1);
        if (shortPaths.length > 0) {
            warnings.push(`Found ${shortPaths.length} path(s) with only 1 question - verify this is intentional`);
        }

        // Check for extremely long paths (might indicate circular logic)
        const longPaths = this.allPaths.filter(path => path.length > 10);
        if (longPaths.length > 0) {
            warnings.push(`Found ${longPaths.length} path(s) with more than 10 questions - verify this is intentional`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}