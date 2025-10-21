import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/distance-converter.css';

interface Unit {
  symbol: string;
  name: string;
  system: string;
  toMeters: number;
}

const units: Record<string, Unit> = {
  'm': { symbol: 'm', name: 'meter', system: 'metric', toMeters: 1 },
  'cm': { symbol: 'cm', name: 'centimeter', system: 'metric', toMeters: 0.01 },
  'mm': { symbol: 'mm', name: 'millimeter', system: 'metric', toMeters: 0.001 },
  'km': { symbol: 'km', name: 'kilometer', system: 'metric', toMeters: 1000 },
  'ft': { symbol: 'ft', name: 'foot', system: 'imperial', toMeters: 0.3048 },
  'in': { symbol: 'in', name: 'inch', system: 'imperial', toMeters: 0.0254 },
  'yd': { symbol: 'yd', name: 'yard', system: 'imperial', toMeters: 0.9144 },
  'mi': { symbol: 'mi', name: 'mile', system: 'imperial', toMeters: 1609.344 },
};

interface ConversionHistory {
  id: string;
  from: { value: number; unit: string };
  to: { value: number; unit: string };
  timestamp: number;
}

export default function DistanceConverter() {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<string>('');
  const [outputUnit, setOutputUnit] = useState<string>('');
  const [resultValue, setResultValue] = useState<number>(0);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [showReference, setShowReference] = useState(false);

  const convert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value < 0 || !inputUnit || !outputUnit) {
      showNotification('Please enter valid values', 'warning');
      return;
    }

    const fromUnit = units[inputUnit];
    const toUnit = units[outputUnit];

    if (!fromUnit || !toUnit) {
      showNotification('Invalid units selected', 'error');
      return;
    }

    const meters = value * fromUnit.toMeters;
    const result = meters / toUnit.toMeters;

    setResultValue(result);

    const historyItem: ConversionHistory = {
      id: Date.now().toString(),
      from: { value, unit: inputUnit },
      to: { value: result, unit: outputUnit },
      timestamp: Date.now(),
    };

    setHistory([historyItem, ...history.slice(0, 49)]);
    showNotification('Conversion completed successfully!', 'success');
  };

  const swapUnits = () => {
    const temp = inputUnit;
    setInputUnit(outputUnit);
    setOutputUnit(temp);
    if (resultValue > 0) {
      setInputValue(resultValue.toString());
      setResultValue(0);
    }
  };

  const clearInput = () => {
    setInputValue('');
    setInputUnit('');
    setOutputUnit('');
    setResultValue(0);
  };

  const clearHistory = () => {
    setHistory([]);
    showNotification('History cleared', 'info');
  };

  const copyResult = async () => {
    if (resultValue === 0) {
      showNotification('No result to copy', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(`${resultValue.toFixed(2)} ${outputUnit}`);
      showNotification('Result copied to clipboard!', 'success');
    } catch {
      showNotification('Copy failed', 'error');
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const groupedUnits = Object.values(units).reduce((acc, unit) => {
    if (!acc[unit.system]) acc[unit.system] = [];
    acc[unit.system].push(unit);
    return acc;
  }, {} as Record<string, Unit[]>);

  return (
    <div className="container">
      {notification && (
        <div className={`notification notification-${notification.type}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          color: 'white',
          fontWeight: '500',
          zIndex: 1001,
          backgroundColor: notification.type === 'success' ? '#10b981' :
                          notification.type === 'warning' ? '#f59e0b' :
                          notification.type === 'error' ? '#ef4444' : '#3b82f6',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

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
                <button className="control-btn" onClick={clearInput}>Clear</button>
                <button className="control-btn" onClick={swapUnits}>⇄ Swap</button>
              </div>
            </div>

            <div className="input-group">
              <div className="value-input">
                <label htmlFor="inputValue" className="input-label">Value</label>
                <input
                  type="number"
                  id="inputValue"
                  className="value-field"
                  placeholder="Enter distance"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div className="unit-selector">
                <label htmlFor="inputUnit" className="input-label">From Unit</label>
                <select
                  id="inputUnit"
                  className="unit-select"
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value)}
                >
                  <option value="">Select unit...</option>
                  {Object.entries(groupedUnits).map(([system, systemUnits]) => (
                    <optgroup key={system} label={system.charAt(0).toUpperCase() + system.slice(1)}>
                      {systemUnits.map(unit => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="conversion-arrow">
            <div className="arrow-icon">→</div>
            <button className="convert-btn" onClick={convert}>Convert</button>
          </div>

          <div className="output-section">
            <div className="section-header">
              <h2>Output Distance</h2>
              <div className="section-controls">
                <button className="control-btn" onClick={copyResult}>Copy</button>
              </div>
            </div>

            <div className="output-group">
              <div className="unit-selector">
                <label htmlFor="outputUnit" className="input-label">To Unit</label>
                <select
                  id="outputUnit"
                  className="unit-select"
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value)}
                >
                  <option value="">Select unit...</option>
                  {Object.entries(groupedUnits).map(([system, systemUnits]) => (
                    <optgroup key={system} label={system.charAt(0).toUpperCase() + system.slice(1)}>
                      {systemUnits.map(unit => (
                        <option key={unit.symbol} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="result-display">
                <div className="result-value">{resultValue.toFixed(2)}</div>
                <div className="result-unit">{outputUnit || 'unit'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="conversion-history">
          <div className="section-header">
            <h2>Conversion History</h2>
            <div className="section-controls">
              <button className="control-btn" onClick={clearHistory}>Clear History</button>
            </div>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon">📏</div>
                <h3>No Conversions Yet</h3>
                <p>Start converting distances to see your history</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-conversion">
                    {item.from.value} {item.from.unit} → {item.to.value.toFixed(2)} {item.to.unit}
                  </div>
                  <div className="history-timestamp">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="units-reference">
          <div className="section-header">
            <h2>Supported Units</h2>
            <button className="control-btn" onClick={() => setShowReference(!showReference)}>
              {showReference ? 'Hide' : 'Show'}
            </button>
          </div>
          {showReference && (
            <div className="reference-content">
              <div className="units-grid">
                {Object.values(units).map(unit => (
                  <div key={unit.symbol} className="unit-card">
                    <div className="unit-symbol">{unit.symbol}</div>
                    <div className="unit-name">{unit.name}</div>
                    <div className="unit-system">{unit.system}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
