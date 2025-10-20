// Questionnaire Engine - Core logic for dynamic questionnaire flow
class QuestionnaireEngine {
    constructor(config) {
        this.config = config;
        this.currentQuestionId = config.startQuestion;
        this.answers = [];
        this.questionHistory = [];
    }

    /**
     * Get current question data
     * @returns {Object} Current question object with question text and answers
     */
    getCurrentQuestion() {
        const questionData = this.config.questions[this.currentQuestionId];
        if (!questionData) {
            throw new Error(`Question with ID "${this.currentQuestionId}" not found`);
        }

        return {
            id: this.currentQuestionId,
            question: questionData.question,
            answers: Object.keys(questionData.answers)
        };
    }

    /**
     * Process answer and move to next question
     * @param {string} answer - Selected answer
     * @returns {boolean} True if there's a next question, false if questionnaire is complete
     */
    answerQuestion(answer) {
        const currentQuestion = this.config.questions[this.currentQuestionId];
        
        if (!currentQuestion) {
            throw new Error(`Invalid question ID: ${this.currentQuestionId}`);
        }

        if (!currentQuestion.answers.hasOwnProperty(answer)) {
            throw new Error(`Invalid answer "${answer}" for question "${this.currentQuestionId}"`);
        }

        // Store the answer
        this.answers.push({
            questionId: this.currentQuestionId,
            question: currentQuestion.question,
            answer: answer
        });

        // Add to history for back navigation
        this.questionHistory.push(this.currentQuestionId);

        // Get next question ID
        const nextQuestionId = currentQuestion.answers[answer];
        
        if (nextQuestionId === null) {
            // End of questionnaire
            this.currentQuestionId = null;
            return false;
        }

        this.currentQuestionId = nextQuestionId;
        return true;
    }

    /**
     * Go back to previous question
     * @returns {boolean} True if successfully went back, false if at start
     */
    goBack() {
        if (this.questionHistory.length === 0) {
            return false;
        }

        // Remove last answer
        this.answers.pop();
        
        // Go back to previous question
        this.questionHistory.pop();
        
        if (this.questionHistory.length > 0) {
            this.currentQuestionId = this.questionHistory[this.questionHistory.length - 1];
        } else {
            this.currentQuestionId = this.config.startQuestion;
        }

        return true;
    }

    /**
     * Check if questionnaire is complete
     * @returns {boolean} True if questionnaire is finished
     */
    isComplete() {
        return this.currentQuestionId === null;
    }

    /**
     * Get all answers given so far
     * @returns {Array} Array of answer objects
     */
    getAnswers() {
        return [...this.answers];
    }

    /**
     * Reset questionnaire to beginning
     */
    reset() {
        this.currentQuestionId = this.config.startQuestion;
        this.answers = [];
        this.questionHistory = [];
    }

    /**
     * Get progress percentage
     * @returns {number} Progress as percentage (0-100)
     */
    getProgress() {
        if (this.isComplete()) {
            return 100;
        }
        
        // Estimate progress based on answers given
        // This is a simplified calculation
        const totalQuestions = Object.keys(this.config.questions).length;
        const answeredQuestions = this.answers.length;
        return Math.min((answeredQuestions / totalQuestions) * 100, 95);
    }

    /**
     * Validate questionnaire configuration
     * @param {Object} config - Configuration object to validate
     * @returns {Object} Validation result with isValid boolean and errors array
     */
    static validateConfig(config) {
        const errors = [];

        // Check required properties
        if (!config.startQuestion) {
            errors.push("Missing 'startQuestion' property");
        }

        if (!config.questions || typeof config.questions !== 'object') {
            errors.push("Missing or invalid 'questions' property");
            return { isValid: false, errors };
        }

        // Check if start question exists
        if (!config.questions[config.startQuestion]) {
            errors.push(`Start question "${config.startQuestion}" not found in questions`);
        }

        // Validate each question
        Object.entries(config.questions).forEach(([questionId, questionData]) => {
            if (!questionData.question || typeof questionData.question !== 'string') {
                errors.push(`Question "${questionId}" missing or invalid question text`);
            }

            if (!questionData.answers || typeof questionData.answers !== 'object') {
                errors.push(`Question "${questionId}" missing or invalid answers`);
                return;
            }

            // Check answer references
            Object.entries(questionData.answers).forEach(([answer, nextQuestionId]) => {
                if (nextQuestionId !== null && !config.questions[nextQuestionId]) {
                    errors.push(`Question "${questionId}" answer "${answer}" refers to non-existent question "${nextQuestionId}"`);
                }
            });
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}