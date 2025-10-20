// 3D Visualization Engine for Asteroid Finder
class AsteroidVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 3D projection settings
        this.camera = {
            x: 0,
            y: 0,
            z: -200,
            rotationX: 0.3,
            rotationY: 0.3,
            zoom: 1
        };
        
        this.spaceSize = 100;
        this.scale = 3;
        
        // Visual elements
        this.asteroidLocation = null;
        this.probes = [];
        this.foundLocation = null;
        
        // Animation
        this.animationFrame = null;
        this.stars = this.generateStars(200);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAnimation();
    }

    setupEventListeners() {
        // Mouse interaction for rotation
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                
                this.camera.rotationY += deltaX * 0.01;
                this.camera.rotationX += deltaY * 0.01;
                
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.zoom *= (e.deltaY > 0) ? 0.9 : 1.1;
            this.camera.zoom = Math.max(0.1, Math.min(3, this.camera.zoom));
        });
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                z: (Math.random() - 0.5) * 400,
                brightness: Math.random()
            });
        }
        return stars;
    }

    project3D(x, y, z) {
        // Apply camera rotation
        const cosX = Math.cos(this.camera.rotationX);
        const sinX = Math.sin(this.camera.rotationX);
        const cosY = Math.cos(this.camera.rotationY);
        const sinY = Math.sin(this.camera.rotationY);

        // Rotate around Y axis
        let rotatedX = x * cosY - z * sinY;
        let rotatedZ = x * sinY + z * cosY;

        // Rotate around X axis
        let rotatedY = y * cosX - rotatedZ * sinX;
        rotatedZ = y * sinX + rotatedZ * cosX;

        // Apply camera position and zoom
        const distance = rotatedZ - this.camera.z;
        const scale = (this.scale * this.camera.zoom * 200) / (distance + 200);

        return {
            x: this.width / 2 + rotatedX * scale,
            y: this.height / 2 - rotatedY * scale,
            scale: scale,
            z: distance
        };
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
        this.ctx.lineWidth = 1;

        const step = 20;
        const size = this.spaceSize;

        // Draw grid lines
        for (let i = 0; i <= size; i += step) {
            // XY plane lines
            const start1 = this.project3D(i - size/2, -size/2, -size/2);
            const end1 = this.project3D(i - size/2, size/2, -size/2);
            
            const start2 = this.project3D(-size/2, i - size/2, -size/2);
            const end2 = this.project3D(size/2, i - size/2, -size/2);

            if (start1.z > 0 && end1.z > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(start1.x, start1.y);
                this.ctx.lineTo(end1.x, end1.y);
                this.ctx.stroke();
            }

            if (start2.z > 0 && end2.z > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(start2.x, start2.y);
                this.ctx.lineTo(end2.x, end2.y);
                this.ctx.stroke();
            }
        }
    }

    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        this.stars.forEach(star => {
            const projected = this.project3D(star.x, star.y, star.z);
            if (projected.z > 0) {
                const size = star.brightness * 2;
                this.ctx.globalAlpha = star.brightness * 0.8;
                this.ctx.fillRect(projected.x - size/2, projected.y - size/2, size, size);
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    drawCube() {
        const size = this.spaceSize;
        const half = size / 2;
        
        // Define cube vertices
        const vertices = [
            [-half, -half, -half], [half, -half, -half],
            [half, half, -half], [-half, half, -half],
            [-half, -half, half], [half, -half, half],
            [half, half, half], [-half, half, half]
        ];

        // Define cube edges
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back face
            [4, 5], [5, 6], [6, 7], [7, 4], // front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
        ];

        // Project vertices
        const projectedVertices = vertices.map(v => 
            this.project3D(v[0], v[1], v[2])
        );

        // Draw edges
        this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
        this.ctx.lineWidth = 2;

        edges.forEach(edge => {
            const start = projectedVertices[edge[0]];
            const end = projectedVertices[edge[1]];
            
            if (start.z > 0 && end.z > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y);
                this.ctx.lineTo(end.x, end.y);
                this.ctx.stroke();
            }
        });
    }

    drawAsteroid() {
        if (!this.asteroidLocation) return;

        const pos = this.project3D(
            this.asteroidLocation.x - this.spaceSize/2,
            this.asteroidLocation.y - this.spaceSize/2,
            this.asteroidLocation.z - this.spaceSize/2
        );

        if (pos.z > 0) {
            const size = Math.max(8, pos.scale * 0.8);
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                pos.x, pos.y, 0,
                pos.x, pos.y, size * 2
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(pos.x - size*2, pos.y - size*2, size*4, size*4);
            
            // Asteroid core
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Sparkle effect
            const time = Date.now() * 0.005;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + time;
                const sparkleX = pos.x + Math.cos(angle) * size * 1.5;
                const sparkleY = pos.y + Math.sin(angle) * size * 1.5;
                this.ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
            }
        }
    }

    drawProbes() {
        this.probes.forEach((probe, index) => {
            const pos = this.project3D(
                probe.coordinates.x - this.spaceSize/2,
                probe.coordinates.y - this.spaceSize/2,
                probe.coordinates.z - this.spaceSize/2
            );

            if (pos.z > 0) {
                const size = Math.max(4, pos.scale * 0.3);
                const age = (Date.now() - probe.timestamp) / 1000;
                const alpha = Math.max(0.3, 1 - age * 0.1);
                
                // Probe body
                this.ctx.fillStyle = `rgba(0, 150, 255, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Probe number
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${Math.max(8, size)}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(probe.id.toString(), pos.x, pos.y);
                
                // Distance visualization (optional line to asteroid)
                if (this.asteroidLocation && alpha > 0.5) {
                    const asteroidPos = this.project3D(
                        this.asteroidLocation.x - this.spaceSize/2,
                        this.asteroidLocation.y - this.spaceSize/2,
                        this.asteroidLocation.z - this.spaceSize/2
                    );
                    
                    if (asteroidPos.z > 0) {
                        this.ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * 0.3})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.setLineDash([2, 4]);
                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(asteroidPos.x, asteroidPos.y);
                        this.ctx.stroke();
                        this.ctx.setLineDash([]);
                    }
                }
            }
        });
    }

    drawFoundLocation() {
        if (!this.foundLocation) return;

        const pos = this.project3D(
            this.foundLocation.x - this.spaceSize/2,
            this.foundLocation.y - this.spaceSize/2,
            this.foundLocation.z - this.spaceSize/2
        );

        if (pos.z > 0) {
            const size = Math.max(6, pos.scale * 0.6);
            const time = Date.now() * 0.01;
            
            // Pulsing ring
            this.ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + 0.3 * Math.sin(time)})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size + 5 * Math.sin(time), 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Found marker
            this.ctx.fillStyle = '#00FF00';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Cross marker
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x - size, pos.y);
            this.ctx.lineTo(pos.x + size, pos.y);
            this.ctx.moveTo(pos.x, pos.y - size);
            this.ctx.lineTo(pos.x, pos.y + size);
            this.ctx.stroke();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(15, 15, 35, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background elements
        this.drawStars();
        this.drawGrid();
        this.drawCube();
        
        // Draw main elements
        this.drawProbes();
        this.drawAsteroid();
        this.drawFoundLocation();
    }

    startAnimation() {
        const animate = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    // Public methods for updating visualization
    setAsteroidLocation(location) {
        this.asteroidLocation = location;
    }

    addProbe(probe) {
        this.probes.push({
            ...probe,
            timestamp: Date.now()
        });
    }

    setProbes(probes) {
        this.probes = probes.map(probe => ({
            ...probe,
            timestamp: Date.now()
        }));
    }

    setFoundLocation(location) {
        this.foundLocation = location;
    }

    clearProbes() {
        this.probes = [];
    }

    clearFoundLocation() {
        this.foundLocation = null;
    }

    reset() {
        this.asteroidLocation = null;
        this.probes = [];
        this.foundLocation = null;
    }

    // Camera controls
    rotateLeft() {
        this.camera.rotationY -= 0.2;
    }

    rotateRight() {
        this.camera.rotationY += 0.2;
    }

    zoomIn() {
        this.camera.zoom = Math.min(3, this.camera.zoom * 1.2);
    }

    zoomOut() {
        this.camera.zoom = Math.max(0.1, this.camera.zoom * 0.8);
    }

    resetView() {
        this.camera.rotationX = 0.3;
        this.camera.rotationY = 0.3;
        this.camera.zoom = 1;
    }
}