// Asteroid Finder Application
class AsteroidFinderApp {
    constructor() {
        this.engine = new AsteroidFinderEngine();
        this.visualization = new AsteroidVisualization('spaceCanvas');
        this.currentResult = null;
        this.isSearching = false;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.updateStats(0, 'Ready', 0);
        this.updateCoordinatesDisplay(null, null);
        console.log('Asteroid Finder App initialized');
    }

    bindEventListeners() {
        // Control buttons
        document.getElementById('generateAsteroid').addEventListener('click', () => this.generateNewAsteroid());
        document.getElementById('startSearch').addEventListener('click', () => this.startSearch());
        document.getElementById('resetMission').addEventListener('click', () => this.resetMission());
        document.getElementById('exportResults').addEventListener('click', () => this.exportResults());

        // Visualization controls
        document.getElementById('rotateLeft').addEventListener('click', () => this.visualization.rotateLeft());
        document.getElementById('rotateRight').addEventListener('click', () => this.visualization.rotateRight());
        document.getElementById('zoomIn').addEventListener('click', () => this.visualization.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.visualization.zoomOut());
        document.getElementById('resetView').addEventListener('click', () => this.visualization.resetView());
    }

    generateNewAsteroid() {
        if (this.isSearching) {
            this.showNotification('Cannot generate asteroid during active search', 'warning');
            return;
        }

        const location = this.engine.generateAsteroid();
        this.visualization.setAsteroidLocation(location);
        this.visualization.clearProbes();
        this.visualization.clearFoundLocation();
        
        this.updateCoordinatesDisplay(location, null);
        this.updateStats(0, 'Ready', 0);
        this.clearResults();
        
        this.showNotification('New asteroid generated!', 'success');
    }

    async startSearch() {
        if (this.isSearching) {
            this.showNotification('Search already in progress', 'warning');
            return;
        }

        if (!this.engine.getAsteroidLocation()) {
            this.showNotification('Please generate an asteroid first', 'warning');
            return;
        }

        const algorithm = document.querySelector('input[name="algorithm"]:checked').value;
        
        this.isSearching = true;
        this.showLoadingOverlay(true);
        this.updateStats(0, 'Searching...', 0);
        
        try {
            let result;
            
            switch (algorithm) {
                case 'binary':
                    result = await this.runBinarySearch();
                    break;
                case 'gradient':
                    result = await this.runGradientDescent();
                    break;
                case 'trilateration':
                    result = await this.runTrilateration();
                    break;
                default:
                    throw new Error('Unknown algorithm selected');
            }
            
            this.currentResult = result;
            this.displayResults(result);
            this.updateStats(result.probes.count, 'Complete', result.accuracy);
            this.updateCoordinatesDisplay(this.engine.getAsteroidLocation(), result.location);
            
            this.showNotification(`Search complete! Found with ${result.accuracy}% accuracy using ${result.probes.count} probes.`, 'success');
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showNotification('Search failed: ' + error.message, 'error');
            this.updateStats(0, 'Failed', 0);
        } finally {
            this.isSearching = false;
            this.showLoadingOverlay(false);
        }
    }

    async runBinarySearch() {
        this.updateLoadingText('Initializing binary search algorithm...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await this.engine.binarySearchAlgorithm();
        
        // Update visualization in real-time
        this.visualization.setProbes(this.engine.getProbes());
        this.visualization.setFoundLocation(result.location);
        
        return result;
    }

    async runGradientDescent() {
        this.updateLoadingText('Initializing gradient descent algorithm...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await this.engine.gradientDescentAlgorithm();
        
        // Update visualization
        this.visualization.setProbes(this.engine.getProbes());
        this.visualization.setFoundLocation(result.location);
        
        return result;
    }

    async runTrilateration() {
        this.updateLoadingText('Deploying trilateration probes...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await this.engine.trilaterationAlgorithm();
        
        // Update visualization
        this.visualization.setProbes(this.engine.getProbes());
        this.visualization.setFoundLocation(result.location);
        
        return result;
    }

    resetMission() {
        if (this.isSearching) {
            this.showNotification('Cannot reset during active search', 'warning');
            return;
        }

        this.engine.resetSearch();
        this.visualization.reset();
        this.currentResult = null;
        
        this.updateStats(0, 'Ready', 0);
        this.updateCoordinatesDisplay(null, null);
        this.clearResults();
        
        this.showNotification('Mission reset', 'info');
    }

    displayResults(result) {
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = '';

        const resultElement = document.createElement('div');
        resultElement.className = 'mission-result';

        const accuracy = result.accuracy;
        const status = accuracy >= 95 ? 'success' : 'partial';
        
        resultElement.innerHTML = `
            <div class="result-header">
                <div class="result-title">${result.algorithm} Results</div>
                <div class="result-status ${status}">${status === 'success' ? 'Success' : 'Partial'}</div>
            </div>
            
            <div class="result-details">
                <div class="detail-item">
                    <div class="detail-label">Probes Used</div>
                    <div class="detail-value">${result.probes.count}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Accuracy</div>
                    <div class="detail-value">${accuracy}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Found Location</div>
                    <div class="detail-value">(${result.location.x}, ${result.location.y}, ${result.location.z})</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Actual Location</div>
                    <div class="detail-value">(${this.engine.getAsteroidLocation().x}, ${this.engine.getAsteroidLocation().y}, ${this.engine.getAsteroidLocation().z})</div>
                </div>
            </div>
            
            <div class="probe-list">
                <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Probe Deployments:</h4>
                ${result.probes.coordinates.slice(0, 10).map((coord, index) => `
                    <div class="probe-item">
                        <span>Probe ${index + 1}</span>
                        <span class="probe-coords">(${coord.x}, ${coord.y}, ${coord.z})</span>
                    </div>
                `).join('')}
                ${result.probes.coordinates.length > 10 ? `
                    <div class="probe-item" style="font-style: italic; color: var(--text-secondary);">
                        ... and ${result.probes.coordinates.length - 10} more probes
                    </div>
                ` : ''}
            </div>
        `;

        resultsContent.appendChild(resultElement);
        
        // Enable export button
        document.getElementById('exportResults').disabled = false;
    }

    clearResults() {
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = `
            <div class="empty-results">
                <div class="empty-icon">🚀</div>
                <h4>No Mission Data</h4>
                <p>Start a search mission to see detailed results</p>
            </div>
        `;
        
        document.getElementById('exportResults').disabled = true;
    }

    updateStats(probeCount, status, accuracy) {
        document.getElementById('probeCount').textContent = probeCount;
        document.getElementById('searchStatus').textContent = status;
        document.getElementById('accuracy').textContent = accuracy > 0 ? `${accuracy}%` : '-';
    }

    updateCoordinatesDisplay(asteroidCoords, foundCoords) {
        const asteroidDisplay = document.getElementById('asteroidCoords');
        const foundDisplay = document.getElementById('foundCoords');
        
        if (asteroidCoords) {
            asteroidDisplay.textContent = `(${asteroidCoords.x}, ${asteroidCoords.y}, ${asteroidCoords.z})`;
        } else {
            asteroidDisplay.textContent = 'Unknown';
        }
        
        if (foundCoords) {
            foundDisplay.textContent = `(${foundCoords.x}, ${foundCoords.y}, ${foundCoords.z})`;
        } else {
            foundDisplay.textContent = '-';
        }
    }

    showLoadingOverlay(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }

    updateLoadingText(text) {
        document.getElementById('loadingText').textContent = text;
    }

    exportResults() {
        if (!this.currentResult) {
            this.showNotification('No results to export', 'warning');
            return;
        }

        try {
            const exportData = this.engine.exportResults(this.currentResult);
            const jsonString = JSON.stringify(exportData, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `asteroid-search-${this.currentResult.algorithm.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Results exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });

        const colors = {
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444',
            success: '#10b981'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Make AsteroidFinderApp available globally for React component
window.AsteroidFinderApp = AsteroidFinderApp;