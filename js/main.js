const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let particles = [];
        let natural_deacceleration = -3
        let collisionRadius = 30;
        let isPaused = false;
        let showTrails = false;
        let totalCollisions = 0;
        let collisionEvents = [];

        class Particle {
            constructor(x, y, type) {
                this.mass = 1;
                this.x = x;
                this.y = y;
                this.speed = 1 + Math.random() * 2;
                this.angle = Math.random() * Math.PI*2;    
                this.type = type; // 'driver' or 'rider'
                this.radius = 8;
                this.collision_angle = 0;
                this.collision_speed = 0;
                this.vx = Math.cos(this.angle) * this.speed + Math.cos(this.collision_angle)*this.collision_speed
                this.vy = Math.sin(this.angle) * this.speed + Math.cos(this.collision_angle)*this.collision_speed
                
                // Visual properties
                this.color = type === 'driver' ? '#3b82f6' : '#ef4444';
                this.trail = [];
                this.maxTrailLength = 20;
                
                // Collision state
                this.hasCollided = false;
                this.collisionTimer = 0;
            }

            update() {
                
                if this.collision_speed {
                   if this.collision_speed == 0 {this.collision_angle = 0}
                   else {this.collision_speed -= this.mass}
                }
                
                if (this.hasCollided) {
                    this.collisionTimer--;
                    if (this.collisionTimer <= 0) {
                        this.hasCollided = false;
                    }
                }

                // Update trail
                if (showTrails) {
                    this.trail.push({x: this.x, y: this.y});
                    if (this.trail.length > this.maxTrailLength) {
                        this.trail.shift();
                    }
                }

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off walls
                if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                    this.vx *= -1;
                    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                }
                if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                    this.vy *= -1;
                    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                }
            }

            draw() {
                // Draw trail
                if (showTrails && this.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for (let i = 1; i < this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                    ctx.strokeStyle = this.color + '40';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.hasCollided ? '#fbbf24' : this.color;
                ctx.fill();
                
                // Outline
                ctx.strokeStyle = this.hasCollided ? '#f59e0b' : 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Collision detection radius (visual)
                if (this.hasCollided) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, collisionRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = '#fbbf2440';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        }

        function detectCollisions() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];

                    // Only detect collisions between different types
                    if (p1.type !== p2.type) {
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < collisionRadius && !p1.hasCollided && !p2.hasCollided) {
                            // Collision detected!
                            handleCollision(p1, p2);
                        }
                    }
                }
            }
        }

        function handleCollision(p1, p2) {
            totalCollisions++;
            // Mark particles as collided
            p1.hasCollided = true;
            p2.hasCollided = true;
            p1.collision_angle = p2.angle;
            p1.collision_speed = p2.speed;
            p2.collision_angle = p1.angle;
            p2.collision_speed = p1.speed;    
            p1.collisionTimer = 60; // frames
            p2.collisionTimer = 60;

            // Visual feedback - create explosion effect
            createCollisionEffect(p1.x, p1.y, p2.x, p2.y);

            // Store collision event
            collisionEvents.push({
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2,
                time: Date.now()
            });
        }

        function createCollisionEffect(x1, y1, x2, y2) {
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            
            // This could be expanded with particle effects
            // For now, we'll just mark it visually in the next draw
        }

        function animate() {
            if (!isPaused) {
                // Clear canvas with slight trail effect if trails are off
                if (showTrails) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                // Update and draw collision events
                drawCollisionEvents();

                // Detect collisions
                detectCollisions();

                // Update and draw particles
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });

                // Update stats
                updateStats();
            }

            requestAnimationFrame(animate);
        }

        function drawCollisionEvents() {
            const now = Date.now();
            collisionEvents = collisionEvents.filter(event => {
                const age = now - event.time;
                if (age > 1000) return false; // Remove after 1 second

                const alpha = 1 - (age / 1000);
                const radius = 10 + (age / 10);

                ctx.beginPath();
                ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();

                return true;
            });
        }

        function addParticle(x, y, type) {
            if (!type) {
                type = document.getElementById('particleType').value;
                if (type === 'random') {
                    type = Math.random() > 0.5 ? 'driver' : 'rider';
                }
            }
            particles.push(new Particle(x, y, type));
        }

        function addRandomParticles() {
            const count = parseInt(document.getElementById('particleCount').value);
            const type = document.getElementById('particleType').value;
            
            for (let i = 0; i < count; i++) {
                const x = Math.random() * (canvas.width - 40) + 20;
                const y = Math.random() * (canvas.height - 40) + 20;
                const particleType = type === 'random' 
                    ? (Math.random() > 0.5 ? 'driver' : 'rider')
                    : type;
                addParticle(x, y, particleType);
            }
        }

        function clearParticles() {
            particles = [];
            totalCollisions = 0;
            collisionEvents = [];
            updateStats();
        }

        function togglePause() {
            isPaused = !isPaused;
            event.target.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
        }

        function toggleTrails() {
            showTrails = !showTrails;
            if (!showTrails) {
                particles.forEach(p => p.trail = []);
            }
        }

        function updateStats() {
            const drivers = particles.filter(p => p.type === 'driver').length;
            const riders = particles.filter(p => p.type === 'rider').length;
            
            document.getElementById('driverCount').textContent = drivers;
            document.getElementById('riderCount').textContent = riders;
            document.getElementById('collisionCount').textContent = totalCollisions;
            document.getElementById('totalCount').textContent = particles.length;
        }

        // Event listeners
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addParticle(x, y);
        });

        document.getElementById('collisionRadius').addEventListener('input', (e) => {
            collisionRadius = parseInt(e.target.value);
            document.getElementById('radiusValue').textContent = collisionRadius;
        });

        // Initialize with some particles
        addRandomParticles();
        
        // Start animation
        animate();
