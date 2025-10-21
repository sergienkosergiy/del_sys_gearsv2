import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/asteroid-finder.css';

export default function AsteroidFinder() {
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        '/src/js/asteroid-finder-engine.js',
        '/src/js/asteroid-finder-visualization.js',
        '/src/js/asteroid-finder.js'
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
        if ((window as any).AsteroidFinderApp) {
          new (window as any).AsteroidFinderApp();
        }
      }, 100);
    };

    loadScripts().catch(console.error);

    return () => {
      const scripts = document.querySelectorAll('script[src*="asteroid-finder"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <>
      <div className="container">
        <header className="header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <div className="header-content">
            <div className="header-text">
              <h1 className="title">3D Asteroid Finder</h1>
              <p className="subtitle">Advanced space exploration with intelligent probe deployment</p>
            </div>
            <div className="header-image">
              <div className="asteroid-container">
                <img
                  src="/изображение.png"
                  alt="Asteroid in space"
                  className="asteroid-preview"
                />
                <div className="glow-effect"></div>
                <div className="particle-field">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="particle" style={{
                      '--x': `${Math.random() * 100}%`,
                      '--y': `${Math.random() * 100}%`,
                      '--delay': `${Math.random() * 3}s`,
                      '--duration': `${3 + Math.random() * 2}s`
                    } as React.CSSProperties}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="control-panel">
            <div className="control-section">
              <h3>Mission Control</h3>
              <div className="control-buttons">
                <button className="control-btn primary" id="generateAsteroid">Generate New Asteroid</button>
                <button className="control-btn secondary" id="startSearch">Start Search</button>
                <button className="control-btn tertiary" id="resetMission">Reset Mission</button>
              </div>
            </div>

            <div className="algorithm-section">
              <h3>Search Algorithm</h3>
              <div className="algorithm-options">
                <label className="radio-label">
                  <input type="radio" name="algorithm" value="binary" defaultChecked />
                  <span>Binary Search (Optimal)</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="algorithm" value="gradient" />
                  <span>Gradient Descent</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="algorithm" value="trilateration" />
                  <span>Trilateration</span>
                </label>
              </div>
            </div>

            <div className="stats-panel">
              <div className="stat-item">
                <span className="stat-label">Probes Used:</span>
                <span className="stat-value" id="probeCount">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Search Status:</span>
                <span className="stat-value" id="searchStatus">Ready</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value" id="accuracy">-</span>
              </div>
            </div>
          </div>

          <div className="visualization-container">
            <div className="canvas-wrapper">
              <canvas id="spaceCanvas" width="800" height="600"></canvas>
              <div className="canvas-overlay">
                <div className="coordinates-display" id="coordinatesDisplay">
                  <div className="coord-item">
                    <span className="coord-label">Asteroid:</span>
                    <span className="coord-value" id="asteroidCoords">Unknown</span>
                  </div>
                  <div className="coord-item">
                    <span className="coord-label">Found:</span>
                    <span className="coord-value" id="foundCoords">-</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="visualization-controls">
              <div className="view-controls">
                <button className="view-btn" id="rotateLeft">↺</button>
                <button className="view-btn" id="rotateRight">↻</button>
                <button className="view-btn" id="zoomIn">+</button>
                <button className="view-btn" id="zoomOut">-</button>
                <button className="view-btn" id="resetView">⌂</button>
              </div>
            </div>
          </div>

          <div className="results-panel">
            <div className="panel-header">
              <h3>Mission Results</h3>
              <button className="export-btn" id="exportResults" disabled>Export JSON</button>
            </div>
            <div className="results-content" id="resultsContent">
              <div className="empty-results">
                <div className="empty-icon">🚀</div>
                <h4>No Mission Data</h4>
                <p>Start a search mission to see detailed results</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="loading-overlay" id="loadingOverlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>Deploying Probes...</h3>
          <p id="loadingText">Initializing search algorithms</p>
        </div>
      </div>
    </>
  );
}
