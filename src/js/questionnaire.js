// Interactive Questionnaire Application
class QuestionnaireApp {
    constructor() {
        this.engine = new QuestionnaireEngine(questionnaireConfig);
        this.currentAnswer = null;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.showCurrentQuestion();
        this.updateProgress();
        console.log('Questionnaire App initialized');
    }

    bindEventListeners() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const restartButton = document.getElementById('restartButton');

        prevButton.addEventListener('click', () => this.goToPreviousQuestion());
        nextButton.addEventListener('click', () => this.goToNextQuestion());
        restartButton.addEventListener('click', () => this.restart());

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !prevButton.disabled) {
                this.goToPreviousQuestion();
            } else if (e.key === 'ArrowRight' && !nextButton.disabled) {
                this.goToNextQuestion();
            }
        });
    }

    showCurrentQuestion() {
        if (this.engine.isComplete()) {
            this.showResults();
            return;
        }

        const questionData = this.engine.getCurrentQuestion();
        const questionCard = document.getElementById('questionCard');
        const questionText = document.getElementById('questionText');
        const answersContainer = document.getElementById('answersContainer');

        // Show question card, hide results
        questionCard.classList.remove('hidden');
        document.getElementById('resultsCard').classList.add('hidden');

        // Set question text
        questionText.textContent = questionData.question;

        // Clear previous answers
        answersContainer.innerHTML = '';
        this.currentAnswer = null;

        // Create answer buttons
        questionData.answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = answer;
            button.addEventListener('click', () => this.selectAnswer(answer, button));
            answersContainer.appendChild(button);
        });

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    selectAnswer(answer, buttonElement) {
        // Remove selection from all buttons
        document.querySelectorAll('.answer-button').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select current button
        buttonElement.classList.add('selected');
        this.currentAnswer = answer;

        // Enable next button
        document.getElementById('nextButton').disabled = false;

        // Add subtle animation
        buttonElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
    }

    goToNextQuestion() {
        if (!this.currentAnswer) {
            this.showNotification('Please select an answer before continuing.', 'warning');
            return;
        }

        // Add transition effect
        const questionCard = document.getElementById('questionCard');
        questionCard.style.opacity = '0.7';
        questionCard.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            const hasNext = this.engine.answerQuestion(this.currentAnswer);
            this.updateProgress();
            this.showCurrentQuestion();

            // Reset card position
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateX(0)';
        }, 200);
    }

    goToPreviousQuestion() {
        const canGoBack = this.engine.goBack();
        if (canGoBack) {
            this.updateProgress();
            this.showCurrentQuestion();
        }
    }

    showResults() {
        const questionCard = document.getElementById('questionCard');
        const resultsCard = document.getElementById('resultsCard');
        const resultsContent = document.getElementById('resultsContent');

        // Hide question card, show results
        questionCard.classList.add('hidden');
        resultsCard.classList.remove('hidden');

        // Clear previous results
        resultsContent.innerHTML = '';

        // Display all answers
        const answers = this.engine.getAnswers();
        answers.forEach(answerData => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            resultItem.innerHTML = `
                <div class="result-question">${answerData.question}</div>
                <div class="result-answer">${answerData.answer}</div>
            `;

            resultsContent.appendChild(resultItem);
        });

        // Update navigation buttons
        this.updateNavigationButtons();

        // Add completion animation
        resultsCard.style.transform = 'scale(0.9)';
        resultsCard.style.opacity = '0';
        setTimeout(() => {
            resultsCard.style.transition = 'all 0.3s ease';
            resultsCard.style.transform = 'scale(1)';
            resultsCard.style.opacity = '1';
        }, 100);
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');

        // Enable/disable previous button
        prevButton.disabled = this.engine.questionHistory.length === 0;

        // Enable/disable next button
        if (this.engine.isComplete()) {
            nextButton.style.display = 'none';
        } else {
            nextButton.style.display = 'block';
            nextButton.disabled = !this.currentAnswer;
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progress = this.engine.getProgress();
        progressFill.style.width = `${progress}%`;
    }

    restart() {
        this.engine.reset();
        this.currentAnswer = null;
        
        // Add restart animation
        const container = document.querySelector('.questionnaire-content');
        container.style.opacity = '0.5';
        container.style.transform = 'scale(0.95)';

        setTimeout(() => {
            this.showCurrentQuestion();
            this.updateProgress();
            
            // Reset animation
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 200);
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
            transition: 'transform 0.3s ease'
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Make QuestionnaireApp available globally for React component
window.QuestionnaireApp = QuestionnaireApp;