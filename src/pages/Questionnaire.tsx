import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/questionnaire.css';

export default function Questionnaire() {
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        '/src/js/questionnaire-config.js',
        '/src/js/questionnaire-engine.js',
        '/src/js/questionnaire.js'
      ];

      for (const src of scripts) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.body.appendChild(script);
        });
      }

      // Initialize after all scripts loaded
      setTimeout(() => {
        if ((window as any).QuestionnaireApp) {
          new (window as any).QuestionnaireApp();
        }
      }, 100);
    };

    loadScripts().catch(console.error);

    return () => {
      const scripts = document.querySelectorAll('script[src*="questionnaire"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 className="title">Interactive Questionnaire</h1>
      </header>

      <main className="questionnaire-container">
        <div className="progress-bar">
          <div className="progress-fill" id="progressFill"></div>
        </div>

        <div className="questionnaire-content">
          <div className="question-card" id="questionCard">
            <div className="question-text" id="questionText"></div>
            <div className="answers-container" id="answersContainer"></div>
          </div>

          <div className="results-card hidden" id="resultsCard">
            <h2>Questionnaire Complete!</h2>
            <div className="results-content" id="resultsContent"></div>
            <button className="restart-button" id="restartButton">Start Over</button>
          </div>
        </div>

        <div className="controls">
          <button className="control-button secondary" id="prevButton" disabled>Previous</button>
          <button className="control-button primary" id="nextButton" disabled>Next</button>
        </div>
      </main>
    </div>
  );
}
