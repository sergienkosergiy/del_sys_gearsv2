import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/distance-converter.css';

export default function DistanceConverter() {
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        '/src/js/distance-converter/core/types.js',
        '/src/js/distance-converter/core/functional-utils.js',
        '/src/js/distance-converter/core/unit-registry.js',
        '/src/js/distance-converter/core/converter-engine.js',
        '/src/js/distance-converter/tests/unit-tests.js',
        '/src/js/distance-converter/ui/converter-ui.js'
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
        if ((window as any).DistanceConverterUI) {
          new (window as any).DistanceConverterUI();
        }
      }, 100);
    };

    loadScripts().catch(console.error);

    return () => {
      const scripts = document.querySelectorAll('script[src*="distance-converter"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 className="title">Distance Converter</h1>
        <p className="subtitle">Advanced unit conversion with extensible configuration</p>
      </header>

      <main className="main-content">
        <div className="converter-layout">
          <div className="input-section">
            <div className="section-header">
              <h2>Input Distance</h2>
              <div className="section-controls">
                <button className="control-btn" id="clearInput">Clear</button>
                <button className="control-btn" id="swapUnits">⇄ Swap</button>
              </div>
            </div>

            <div className="input-group">
              <div className="value-input">
                <label htmlFor="inputValue" className="input-label">Value</label>
                <input type="number" id="inputValue" className="value-field" placeholder="Enter distance" step="any" />
                <div className="input-validation" id="inputValidation"></div>
              </div>

              <div className="unit-selector">
                <label htmlFor="inputUnit" className="input-label">From Unit</label>
                <select id="inputUnit" className="unit-select">
                  <option value="">Select unit...</option>
                </select>
              </div>
            </div>
          </div>

          <div className="conversion-arrow">
            <div className="arrow-icon">→</div>
            <button className="convert-btn" id="convertBtn">Convert</button>
          </div>

          <div className="output-section">
            <div className="section-header">
              <h2>Output Distance</h2>
              <div className="section-controls">
                <button className="control-btn" id="copyResult">Copy</button>
                <button className="control-btn" id="exportJson">Export JSON</button>
              </div>
            </div>

            <div className="output-group">
              <div className="unit-selector">
                <label htmlFor="outputUnit" className="input-label">To Unit</label>
                <select id="outputUnit" className="unit-select">
                  <option value="">Select unit...</option>
                </select>
              </div>

              <div className="result-display">
                <div className="result-value" id="resultValue">0.00</div>
                <div className="result-unit" id="resultUnit">unit</div>
              </div>
            </div>
          </div>
        </div>

        <div className="conversion-history">
          <div className="section-header">
            <h2>Conversion History</h2>
            <div className="section-controls">
              <button className="control-btn" id="clearHistory">Clear History</button>
              <button className="control-btn" id="exportHistory">Export</button>
            </div>
          </div>
          <div className="history-list" id="historyList">
            <div className="empty-history">
              <div className="empty-icon">📏</div>
              <h3>No Conversions Yet</h3>
              <p>Start converting distances to see your history</p>
            </div>
          </div>
        </div>

        <div className="units-reference">
          <div className="section-header">
            <h2>Supported Units</h2>
            <button className="control-btn" id="toggleReference">Show/Hide</button>
          </div>
          <div className="reference-content" id="referenceContent">
            <div className="units-grid" id="unitsGrid">
            </div>
          </div>
        </div>

        <div className="batch-converter">
          <div className="section-header">
            <h2>Batch Converter</h2>
            <button className="control-btn primary" id="processBatch">Process Batch</button>
          </div>
          <div className="batch-content">
            <div className="batch-input">
              <label htmlFor="batchInput" className="input-label">JSON Input (Array of conversions)</label>
              <textarea id="batchInput" className="batch-textarea" placeholder='[{"distance": {"unit": "m", "value": 1}, "convertTo": "ft"}]'></textarea>
              <div className="batch-validation" id="batchValidation"></div>
            </div>
            <div className="batch-output">
              <label className="input-label">Batch Results</label>
              <div className="batch-results" id="batchResults">
                <div className="empty-batch">
                  <div className="empty-icon">⚡</div>
                  <h4>No Batch Results</h4>
                  <p>Enter JSON array and click "Process Batch"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="test-runner" id="testRunner">
        <div className="test-header">
          <h3>Unit Tests</h3>
          <button className="control-btn" id="runTests">Run Tests</button>
        </div>
        <div className="test-results" id="testResults"></div>
      </div>
    </div>
  );
}
