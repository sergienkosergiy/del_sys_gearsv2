// Asteroid Finder Engine - Core algorithms for asteroid location
class AsteroidFinderEngine {
    constructor() {
        this.spaceSize = 100;
        this.asteroidLocation = null;
        this.probes = [];
        this.searchHistory = [];
    }

    /**
     * Generate random asteroid location
     * @returns {Object} Asteroid coordinates {x, y, z}
     */
    generateAsteroid() {
        this.asteroidLocation = {
            x: Math.floor(Math.random() * (this.spaceSize + 1)),
            y: Math.floor(Math.random() * (this.spaceSize + 1)),
            z: Math.floor(Math.random() * (this.spaceSize + 1))
        };
        
        console.log('Generated asteroid at:', this.asteroidLocation);
        return { ...this.asteroidLocation };
    }

    /**
     * Calculate distance from probe to asteroid
     * @param {Object} probeCoords - Probe coordinates {x, y, z}
     * @returns {number} Euclidean distance to asteroid
     */
    getDistanceToAsteroid(probeCoords) {
        if (!this.asteroidLocation) {
            throw new Error('Asteroid location not set');
        }

        const dx = probeCoords.x - this.asteroidLocation.x;
        const dy = probeCoords.y - this.asteroidLocation.y;
        const dz = probeCoords.z - this.asteroidLocation.z;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Deploy probe and get distance reading
     * @param {Object} coords - Probe coordinates {x, y, z}
     * @returns {Object} Probe data with distance
     */
    deployProbe(coords) {
        const distance = this.getDistanceToAsteroid(coords);
        const probe = {
            id: this.probes.length + 1,
            coordinates: { ...coords },
            distance: distance,
            timestamp: Date.now()
        };
        
        this.probes.push(probe);
        return probe;
    }

    /**
     * Binary search algorithm for asteroid location
     * @returns {Promise<Object>} Search result with location and probe data
     */
    async binarySearchAlgorithm() {
        this.resetSearch();
        const result = {
            algorithm: 'Binary Search',
            location: null,
            probes: {
                count: 0,
                coordinates: []
            },
            accuracy: 0,
            steps: []
        };

        // Binary search for each dimension
        let xRange = [0, this.spaceSize];
        let yRange = [0, this.spaceSize];
        let zRange = [0, this.spaceSize];

        const tolerance = 0.1;
        let iterations = 0;
        const maxIterations = 50;

        while (iterations < maxIterations) {
            // Find midpoints
            const midX = Math.floor((xRange[0] + xRange[1]) / 2);
            const midY = Math.floor((yRange[0] + yRange[1]) / 2);
            const midZ = Math.floor((zRange[0] + zRange[1]) / 2);

            const probe = this.deployProbe({ x: midX, y: midY, z: midZ });
            result.probes.coordinates.push(probe.coordinates);

            // If we're very close, we found it
            if (probe.distance < tolerance) {
                result.location = { x: midX, y: midY, z: midZ };
                break;
            }

            // Binary search refinement for each axis
            await this.refineSearchRanges(xRange, yRange, zRange, midX, midY, midZ, result);

            // Check if ranges are too small to continue
            if ((xRange[1] - xRange[0]) <= 1 && 
                (yRange[1] - yRange[0]) <= 1 && 
                (zRange[1] - zRange[0]) <= 1) {
                
                // Final precise search in the small remaining space
                result.location = await this.preciseSearch(xRange, yRange, zRange, result);
                break;
            }

            iterations++;
            
            // Add delay for visualization
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        result.probes.count = result.probes.coordinates.length;
        result.accuracy = this.calculateAccuracy(result.location);
        
        return result;
    }

    /**
     * Refine search ranges using additional probes
     */
    async refineSearchRanges(xRange, yRange, zRange, midX, midY, midZ, result) {
        // Test points around the midpoint to determine direction
        const testPoints = [
            { x: Math.max(0, midX - 1), y: midY, z: midZ },
            { x: Math.min(this.spaceSize, midX + 1), y: midY, z: midZ },
            { x: midX, y: Math.max(0, midY - 1), z: midZ },
            { x: midX, y: Math.min(this.spaceSize, midY + 1), z: midZ },
            { x: midX, y: midY, z: Math.max(0, midZ - 1) },
            { x: midX, y: midY, z: Math.min(this.spaceSize, midZ + 1) }
        ];

        const distances = [];
        for (const point of testPoints) {
            const probe = this.deployProbe(point);
            result.probes.coordinates.push(probe.coordinates);
            distances.push({ point, distance: probe.distance });
        }

        // Find the direction with minimum distance for each axis
        const minXDistance = Math.min(distances[0].distance, distances[1].distance);
        const minYDistance = Math.min(distances[2].distance, distances[3].distance);
        const minZDistance = Math.min(distances[4].distance, distances[5].distance);

        // Update ranges based on minimum distances
        if (distances[0].distance < distances[1].distance) {
            xRange[1] = midX;
        } else {
            xRange[0] = midX;
        }

        if (distances[2].distance < distances[3].distance) {
            yRange[1] = midY;
        } else {
            yRange[0] = midY;
        }

        if (distances[4].distance < distances[5].distance) {
            zRange[1] = midZ;
        } else {
            zRange[0] = midZ;
        }
    }

    /**
     * Precise search in a small area
     */
    async preciseSearch(xRange, yRange, zRange, result) {
        let bestLocation = null;
        let minDistance = Infinity;

        for (let x = xRange[0]; x <= xRange[1]; x++) {
            for (let y = yRange[0]; y <= yRange[1]; y++) {
                for (let z = zRange[0]; z <= zRange[1]; z++) {
                    const probe = this.deployProbe({ x, y, z });
                    result.probes.coordinates.push(probe.coordinates);

                    if (probe.distance < minDistance) {
                        minDistance = probe.distance;
                        bestLocation = { x, y, z };
                    }

                    if (probe.distance < 0.1) {
                        return bestLocation;
                    }
                }
            }
        }

        return bestLocation;
    }

    /**
     * Gradient descent algorithm
     * @returns {Promise<Object>} Search result
     */
    async gradientDescentAlgorithm() {
        this.resetSearch();
        const result = {
            algorithm: 'Gradient Descent',
            location: null,
            probes: {
                count: 0,
                coordinates: []
            },
            accuracy: 0
        };

        // Start from center
        let current = {
            x: Math.floor(this.spaceSize / 2),
            y: Math.floor(this.spaceSize / 2),
            z: Math.floor(this.spaceSize / 2)
        };

        let currentDistance = this.deployProbe(current).distance;
        result.probes.coordinates.push({ ...current });

        const stepSize = 5;
        const tolerance = 0.1;
        let iterations = 0;
        const maxIterations = 100;

        while (iterations < maxIterations && currentDistance > tolerance) {
            let bestMove = null;
            let bestDistance = currentDistance;

            // Try all 6 directions
            const directions = [
                { x: stepSize, y: 0, z: 0 },
                { x: -stepSize, y: 0, z: 0 },
                { x: 0, y: stepSize, z: 0 },
                { x: 0, y: -stepSize, z: 0 },
                { x: 0, y: 0, z: stepSize },
                { x: 0, y: 0, z: -stepSize }
            ];

            for (const dir of directions) {
                const newPos = {
                    x: Math.max(0, Math.min(this.spaceSize, current.x + dir.x)),
                    y: Math.max(0, Math.min(this.spaceSize, current.y + dir.y)),
                    z: Math.max(0, Math.min(this.spaceSize, current.z + dir.z))
                };

                const probe = this.deployProbe(newPos);
                result.probes.coordinates.push(newPos);

                if (probe.distance < bestDistance) {
                    bestDistance = probe.distance;
                    bestMove = newPos;
                }
            }

            if (bestMove) {
                current = bestMove;
                currentDistance = bestDistance;
            } else {
                // Reduce step size if no improvement
                if (stepSize > 1) {
                    stepSize = Math.max(1, Math.floor(stepSize / 2));
                } else {
                    break;
                }
            }

            iterations++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        result.location = current;
        result.probes.count = result.probes.coordinates.length;
        result.accuracy = this.calculateAccuracy(result.location);

        return result;
    }

    /**
     * Trilateration algorithm
     * @returns {Promise<Object>} Search result
     */
    async trilaterationAlgorithm() {
        this.resetSearch();
        const result = {
            algorithm: 'Trilateration',
            location: null,
            probes: {
                count: 0,
                coordinates: []
            },
            accuracy: 0
        };

        // Deploy 4 probes at corners of the space for initial trilateration
        const initialProbes = [
            { x: 0, y: 0, z: 0 },
            { x: this.spaceSize, y: 0, z: 0 },
            { x: 0, y: this.spaceSize, z: 0 },
            { x: 0, y: 0, z: this.spaceSize }
        ];

        const spheres = [];
        for (const coords of initialProbes) {
            const probe = this.deployProbe(coords);
            result.probes.coordinates.push(coords);
            spheres.push({
                center: coords,
                radius: probe.distance
            });
        }

        // Solve trilateration
        let estimated = this.solveTrilaterationApproximate(spheres);
        
        // Refine with additional probes
        const refinementSteps = 5;
        for (let step = 0; step < refinementSteps; step++) {
            const searchRadius = Math.max(5, 20 - step * 3);
            const candidates = this.generateCandidatesAroundPoint(estimated, searchRadius, 8);
            
            let bestCandidate = estimated;
            let bestError = Infinity;
            
            for (const candidate of candidates) {
                const probe = this.deployProbe(candidate);
                result.probes.coordinates.push(candidate);
                
                // Calculate error as sum of sphere equation violations
                let error = 0;
                for (const sphere of spheres) {
                    const dist = this.calculateDistance(candidate, sphere.center);
                    error += Math.abs(dist - sphere.radius);
                }
                
                if (error < bestError) {
                    bestError = error;
                    bestCandidate = candidate;
                }
            }
            
            estimated = bestCandidate;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        result.location = estimated;
        result.probes.count = result.probes.coordinates.length;
        result.accuracy = this.calculateAccuracy(result.location);

        return result;
    }

    /**
     * Approximate trilateration solver
     */
    solveTrilaterationApproximate(spheres) {
        // Simplified trilateration - find point that minimizes distance to all spheres
        let bestPoint = { x: 50, y: 50, z: 50 };
        let bestError = Infinity;

        // Grid search for approximate solution
        const step = 10;
        for (let x = 0; x <= this.spaceSize; x += step) {
            for (let y = 0; y <= this.spaceSize; y += step) {
                for (let z = 0; z <= this.spaceSize; z += step) {
                    const point = { x, y, z };
                    let error = 0;
                    
                    for (const sphere of spheres) {
                        const dist = this.calculateDistance(point, sphere.center);
                        error += Math.abs(dist - sphere.radius);
                    }
                    
                    if (error < bestError) {
                        bestError = error;
                        bestPoint = point;
                    }
                }
            }
        }

        return bestPoint;
    }

    /**
     * Generate candidate points around a center point
     */
    generateCandidatesAroundPoint(center, radius, count) {
        const candidates = [];
        
        for (let i = 0; i < count; i++) {
            const angle1 = (i / count) * 2 * Math.PI;
            const angle2 = Math.random() * Math.PI;
            
            const x = Math.round(center.x + radius * Math.cos(angle1) * Math.sin(angle2));
            const y = Math.round(center.y + radius * Math.sin(angle1) * Math.sin(angle2));
            const z = Math.round(center.z + radius * Math.cos(angle2));
            
            candidates.push({
                x: Math.max(0, Math.min(this.spaceSize, x)),
                y: Math.max(0, Math.min(this.spaceSize, y)),
                z: Math.max(0, Math.min(this.spaceSize, z))
            });
        }
        
        return candidates;
    }

    /**
     * Calculate 3D distance between two points
     */
    calculateDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Calculate accuracy of found location
     */
    calculateAccuracy(foundLocation) {
        if (!foundLocation || !this.asteroidLocation) {
            return 0;
        }

        const distance = this.calculateDistance(foundLocation, this.asteroidLocation);
        const maxDistance = Math.sqrt(3 * this.spaceSize * this.spaceSize);
        return Math.max(0, Math.round((1 - distance / maxDistance) * 100));
    }

    /**
     * Reset search state
     */
    resetSearch() {
        this.probes = [];
        this.searchHistory = [];
    }

    /**
     * Get current asteroid location (for testing)
     */
    getAsteroidLocation() {
        return this.asteroidLocation ? { ...this.asteroidLocation } : null;
    }

    /**
     * Get all deployed probes
     */
    getProbes() {
        return [...this.probes];
    }

    /**
     * Export results to JSON format
     */
    exportResults(searchResult) {
        return {
            result: {
                algorithm: searchResult.algorithm,
                location: searchResult.location,
                actualLocation: this.asteroidLocation,
                accuracy: searchResult.accuracy,
                probes: {
                    count: searchResult.probes.count,
                    coordinates: searchResult.probes.coordinates
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    spaceSize: this.spaceSize,
                    searchDuration: Date.now() - (this.probes[0]?.timestamp || Date.now())
                }
            }
        };
    }
}