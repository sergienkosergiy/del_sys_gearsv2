import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/data-processor.css';

export default function DataProcessor() {
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        '/src/js/data-processor/core/types.js',
        '/src/js/data-processor/core/functional-utils.js',
        '/src/js/data-processor/rules/base-rule.js',
        '/src/js/data-processor/rules/include-rule.js',
        '/src/js/data-processor/rules/exclude-rule.js',
        '/src/js/data-processor/rules/sort-rule.js',
        '/src/js/data-processor/rules/limit-rule.js',
        '/src/js/data-processor/rules/transform-rule.js',
        '/src/js/data-processor/core/rule-registry.js',
        '/src/js/data-processor/core/data-processor.js',
        '/src/js/data-processor/tests/unit-tests.js',
        '/src/js/data-processor/ui/data-processor-ui.js'
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
        if ((window as any).DataProcessorUI) {
          const ui = new (window as any).DataProcessorUI();
          (window as any).dataProcessorUI = ui;
        }
      }, 100);
    };

    loadScripts().catch(console.error);

    return () => {
      const scripts = document.querySelectorAll('script[src*="data-processor"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="container">
      <header className="header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 className="title">Data Filter & Sort System</h1>
        <p className="subtitle">Advanced JSON data processing with modular rule engine</p>
      </header>

      <main className="main-content">
        <div className="processor-layout">
          <div className="input-section">
            <div className="section-header">
              <h2>Input Data</h2>
              <div className="section-controls">
                <button className="control-btn" id="loadSampleData">Load Sample</button>
                <button className="control-btn" id="validateData">Validate</button>
                <button className="control-btn" id="clearData">Clear</button>
              </div>
            </div>
            <div className="editor-wrapper">
              <textarea id="dataInput" className="data-editor" placeholder='{"data": [{"name": "John", "email": "john@mail.com"}]}'></textarea>
              <div className="validation-status" id="dataValidation"></div>
            </div>
          </div>

          <div className="rules-section">
            <div className="section-header">
              <h2>Processing Rules</h2>
              <div className="section-controls">
                <button className="control-btn" id="addRule">Add Rule</button>
                <button className="control-btn primary" id="processData">Process</button>
              </div>
            </div>

            <div className="rules-container" id="rulesContainer">
              <div className="rule-builder">
                <div className="rule-type-selector">
                  <label className="rule-label">Rule Type:</label>
                  <select id="ruleType" className="rule-select">
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                    <option value="sortBy">Sort By</option>
                    <option value="limit">Limit</option>
                    <option value="transform">Transform</option>
                  </select>
                </div>

                <div className="rule-config" id="ruleConfig">
                </div>
              </div>
            </div>
          </div>

          <div className="output-section">
            <div className="section-header">
              <h2>Results</h2>
              <div className="section-controls">
                <button className="control-btn" id="exportResults">Export JSON</button>
                <button className="control-btn" id="copyResults">Copy</button>
              </div>
            </div>
            <div className="results-container" id="resultsContainer">
              <div className="empty-results">
                <div className="empty-icon">📊</div>
                <h3>No Results Yet</h3>
                <p>Configure your data and rules, then click "Process" to see results</p>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-content">
                <div className="stat-value" id="inputCount">0</div>
                <div className="stat-label">Input Records</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <div className="stat-content">
                <div className="stat-value" id="rulesCount">0</div>
                <div className="stat-label">Active Rules</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-content">
                <div className="stat-value" id="outputCount">0</div>
                <div className="stat-label">Output Records</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value" id="processingTime">0ms</div>
                <div className="stat-label">Processing Time</div>
              </div>
            </div>
          </div>
        </div>

        <div className="documentation-section">
          <div className="section-header">
            <h2>Documentation & Examples</h2>
            <button className="control-btn" id="toggleDocs">Show/Hide</button>
          </div>
          <div className="docs-content" id="docsContent">
            <div className="docs-grid">
              <div className="doc-card">
                <h3>Include Rule</h3>
                <p>Filter records that match specified criteria</p>
                <pre><code>{`{
  "include": [
    {"name": "John"},
    {"status": "active"}
  ]
}`}</code></pre>
              </div>
              <div className="doc-card">
                <h3>Exclude Rule</h3>
                <p>Remove records that match specified criteria</p>
                <pre><code>{`{
  "exclude": [
    {"name": "John", "email": "john@test.com"}
  ]
}`}</code></pre>
              </div>
              <div className="doc-card">
                <h3>Sort Rule</h3>
                <p>Sort records by specified fields</p>
                <pre><code>{`{
  "sortBy": ["name", "email"]
}`}</code></pre>
              </div>
              <div className="doc-card">
                <h3>Limit Rule</h3>
                <p>Limit the number of output records</p>
                <pre><code>{`{
  "limit": 10
}`}</code></pre>
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
