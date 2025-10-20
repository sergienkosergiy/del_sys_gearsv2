import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Dynamic Questionnaire System</h1>
        <p className="subtitle">Advanced questionnaire with conditional logic and path analysis</p>
      </header>

      <main className="main-content">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Dynamic Questions</h3>
            <p>Questions adapt based on previous answers using conditional logic</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔀</div>
            <h3>Path Analysis</h3>
            <p>Comprehensive analysis of all possible questionnaire paths</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>JSON Configuration</h3>
            <p>Flexible configuration system using structured JSON format</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Automated Testing</h3>
            <p>Built-in testing script to validate all possible scenarios</p>
          </div>
        </div>

        <div className="navigation-section">
          <h2>Available Tasks</h2>
          <div className="task-grid">
            <Link to="/questionnaire" className="task-card">
              <div className="task-number">1</div>
              <h3>Dynamic Questionnaire System</h3>
              <p>Опросник с динамической логикой переходов между вопросами на основе JSON конфигурации</p>
              <span className="task-arrow">→</span>
            </Link>

            <Link to="/distance-converter" className="task-card">
              <div className="task-number">2</div>
              <h3>Distance Converter</h3>
              <p>Конвертер единиц измерения расстояния с поддержкой метрической и имперской систем</p>
              <span className="task-arrow">→</span>
            </Link>

            <Link to="/data-processor" className="task-card">
              <div className="task-number">3</div>
              <h3>Data Filter & Sort System</h3>
              <p>Система сортировки и фильтрации JSON данных с модульными правилами обработки</p>
              <span className="task-arrow">→</span>
            </Link>

            <Link to="/asteroid-finder" className="task-card">
              <div className="task-number">4</div>
              <h3>3D Asteroid Finder</h3>
              <p>Поиск астероида в 3D космическом пространстве с использованием оптимальных алгоритмов</p>
              <span className="task-arrow">→</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Dynamic Questionnaire System. Built with modern web technologies.</p>
      </footer>
    </div>
  );
}
