// חגורת האסטרואידים - אזור בין מאדים לצדק
class AsteroidBelt {
    constructor() {
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.particleSystem = null;
        
        // הגדרות חגורת האסטרואידים
        this.settings = {
            asteroidCount: 5000,
            innerRadius: 180,  // בקנה מידה - בין מאדים לצדק
            outerRadius: 220,
            thickness: 20,
            minSize: 0.5,
            maxSize: 3.0,
            rotationSpeed: 0.00005,
            enabled: true
        };
        
        // אסטרואידים בודדים גדולים יותר
        this.majorAsteroids = [];
        this.majorAsteroidData = [
            { name: 'Ceres', radius: 2.5, distance: 185, color: 0x999999 },
            { name: 'Vesta', radius: 1.8, distance: 195, color: 0xaaaaaa },
            { name: 'Pallas', radius: 1.5, distance: 205, color: 0x888888 },
            { name: 'Juno', radius: 1.2, distance: 215, color: 0x777777 }
        ];
        
        // אנימציה
        this.animation = {
            time: 0,
            rotationAngle: 0,
            twinklePhase: 0
        };
        
        this.isInitialized = false;
    }

    // אתחול חגורת האסטרואידים
    async init() {
        try {
            // יצירת מערכת חלקיקים עיקרית
            await this.createParticleSystem();
            
            // יצירת אסטרואידים בודדים גדולים
            await this.createMajorAsteroids();
            
            // יצירת קבוצה כללית
            this.createGroup();
            
            this.isInitialized = true;
            console.log('Asteroid Belt initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Asteroid Belt:', error);
            throw error;
        }
    }

    // יצירת מערכת חלקיקים
    async createParticleSystem() {
        this.geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(this.settings.asteroidCount * 3);
        const colors = new Float32Array(this.settings.asteroidCount * 3);
        const sizes = new Float32Array(this.settings.asteroidCount);
        const rotations = new Float32Array(this.settings.asteroidCount);
        const velocities = new Float32Array(this.settings.asteroidCount * 3);
        
        // יצירת התפלגות ריאליסטית של אסטרואידים
        for (let i = 0; i < this.settings.asteroidCount; i++) {
            const i3 = i * 3;
            
            // מיקום רדיאלי עם התפלגות לא אחידה
            const angle = Math.random() * Math.PI * 2;
            
            // התפלגות רדיוס עם צפיפות גבוהה יותר באמצע
            const radiusNormalized = this.generateRadiusDistribution();
            const radius = MathUtils.lerp(
                this.settings.innerRadius,
                this.settings.outerRadius,
                radiusNormalized
            );
            
            // גובה עם התפלגות גאוסיאנית
            const height = MathUtils.random.gaussian(0, this.settings.thickness * 0.3);
            
            // מיקום בקואורדינטות קרטזיות
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.max(-this.settings.thickness, 
                                       Math.min(this.settings.thickness, height));
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // צבע עם וריאציות
            const baseColor = new THREE.Color();
            const colorVariations = [0x666666, 0x777777, 0x888888, 0x999999, 0x555555];
            baseColor.setHex(MathUtils.random.choice(colorVariations));
            
            // הוספת רעש לצבע
            const colorNoise = (Math.random() - 0.5) * 0.2;
            colors[i3] = Math.max(0, Math.min(1, baseColor.r + colorNoise));
            colors[i3 + 1] = Math.max(0, Math.min(1, baseColor.g + colorNoise));
            colors[i3 + 2] = Math.max(0, Math.min(1, baseColor.b + colorNoise));
            
            // גודל עם התפלגות power law (הרבה קטנים, מעט גדולים)
            const sizeRandom = Math.random();
            const size = this.settings.minSize + 
                        Math.pow(sizeRandom, 3) * (this.settings.maxSize - this.settings.minSize);
            sizes[i] = size;
            
            // סיבוב אקראי
            rotations[i] = Math.random() * Math.PI * 2;
            
            // מהירות מסלול (חוק שלישי של קפלר - מהירות נמוכה יותר ברדיוס גדול יותר)
            const orbitalSpeed = Math.sqrt(1 / radius) * 0.001;
            velocities[i3] = -Math.sin(angle) * orbitalSpeed;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = Math.cos(angle) * orbitalSpeed;
        }
        
        // הגדרת מאפיינים
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
        this.geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // חומר עם שיידר מותאם
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                pixelRatio: { value: window.devicePixelRatio },
                twinkleIntensity: { value: 0.3 }
            },
            vertexShader: `
                attribute float size;
                attribute float rotation;
                attribute vec3 color;
                attribute vec3 velocity;
                
                varying vec3 vColor;
                varying float vRotation;
                varying float vSize;
                
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vRotation = rotation + time * 0.5;
                    vSize = size;
                    
                    // מיקום עם אנימציית מסלול איטית
                    vec3 pos = position + velocity * time * 10.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    gl_PointSize = size * pixelRatio * (100.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vRotation;
                varying float vSize;
                
                uniform float time;
                uniform float twinkleIntensity;
                
                // פונקציית רעש לנצנוץ
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distance = length(center);
                    
                    if (distance > 0.5) discard;
                    
                    // צורת אסטרואיד לא עגולה
                    vec2 rotatedCoord = vec2(
                        center.x * cos(vRotation) - center.y * sin(vRotation),
                        center.x * sin(vRotation) + center.y * cos(vRotation)
                    );
                    
                    float asteroidShape = 1.0 - length(rotatedCoord * vec2(1.2, 0.8)) * 2.0;
                    asteroidShape *= 1.0 - random(rotatedCoord + time * 0.1) * 0.3;
                    
                    if (asteroidShape <= 0.0) discard;
                    
                    // נצנוץ עדין
                    float twinkle = sin(time * 3.0 + vSize * 10.0) * twinkleIntensity + (1.0 - twinkleIntensity);
                    
                    // הדרגת אור לפי מרחק מהמרכז
                    float alpha = asteroidShape * twinkle;
                    
                    gl_FragColor = vec4(vColor * (0.7 + asteroidShape * 0.3), alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthTest: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        
        // יצירת מערכת החלקיקים
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.particleSystem.name = 'asteroidBelt';
        this.particleSystem.frustumCulled = false; // למנוע culling של חלקיקים
    }

    // התפלגות רדיוס ריאליסטית
    generateRadiusDistribution() {
        // התפלגות עם צפיפות גבוהה יותר באמצע החגורה
        const random1 = Math.random();
        const random2 = Math.random();
        
        // התפלגות בטא עם פרמטרים שיוצרים פיק באמצע
        const alpha = 2.5;
        const beta = 2.5;
        
        let x = random1;
        for (let i = 0; i < 10; i++) {
            const fx = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
            const target = random2 * 0.25; // נרמליזציה קרובה
            
            if (fx > target) break;
            x = Math.random();
        }
        
        return x;
    }

    // יצירת אסטרואידים בודדים גדולים
    async createMajorAsteroids() {
        for (const asteroidData of this.majorAsteroidData) {
            const asteroid = await this.createMajorAsteroid(asteroidData);
            this.majorAsteroids.push(asteroid);
        }
    }

    // יצירת אסטרואיד בודד גדול
    async createMajorAsteroid(data) {
        // גיאומטריה לא סדירה לאסטרואיד
        const geometry = this.createIrregularAsteroidGeometry(data.radius);
        
        const material = new THREE.MeshLambertMaterial({
            color: data.color,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = data.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // מיקום במסלול
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(
            Math.cos(angle) * data.distance,
            (Math.random() - 0.5) * 5,
            Math.sin(angle) * data.distance
        );
        
        // פרמטרי מסלול
        mesh.userData = {
            orbitalRadius: data.distance,
            orbitalSpeed: Math.sqrt(1 / data.distance) * 0.0002,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            angle: angle
        };
        
        return mesh;
    }

    // יצירת גיאומטריה לא סדירה לאסטרואיד
    createIrregularAsteroidGeometry(baseRadius) {
        const geometry = new THREE.SphereGeometry(baseRadius, 16, 12);
        
        // עיוות הקודקודים ליצירת צורה לא סדירה
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            
            // הוספת רעש לכל קודקוד
            const noise = MathUtils.noise.perlin(
                vertex.x * 0.5,
                vertex.y * 0.5,
                vertex.z * 0.5
            );
            
            const distortion = 1 + noise * 0.4;
            vertex.multiplyScalar(distortion);
            
            positions[i] = vertex.x;
            positions[i + 1] = vertex.y;
            positions[i + 2] = vertex.z;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    // יצירת קבוצה כללית
    createGroup() {
        this.mesh = new THREE.Group();
        this.mesh.name = 'asteroidBeltGroup';
        
        // הוספת מערכת החלקיקים
        if (this.particleSystem) {
            this.mesh.add(this.particleSystem);
        }
        
        // הוספת אסטרואידים גדולים
        this.majorAsteroids.forEach(asteroid => {
            this.mesh.add(asteroid);
        });
    }

    // הפעלה/כיבוי של חגורת האסטרואידים
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        if (this.mesh) {
            this.mesh.visible = enabled;
        }
    }

    // הגדרת צפיפות אסטרואידים
    setDensity(density) {
        // density בין 0.1 ל-2.0
        const newCount = Math.floor(this.settings.asteroidCount * MathUtils.clamp(density, 0.1, 2.0));
        
        if (newCount !== this.settings.asteroidCount) {
            this.settings.asteroidCount = newCount;
            
            // יצירה מחדש של מערכת החלקיקים
            if (this.particleSystem) {
                this.mesh.remove(this.particleSystem);
                this.dispose();
                this.createParticleSystem().then(() => {
                    this.mesh.add(this.particleSystem);
                });
            }
        }
    }

    // הגדרת עוצמת נצנוץ
    setTwinkleIntensity(intensity) {
        if (this.material && this.material.uniforms) {
            this.material.uniforms.twinkleIntensity.value = MathUtils.clamp(intensity, 0, 1);
        }
    }

    // עדכון האנימציות
    update(deltaTime) {
        if (!this.isInitialized || !this.settings.enabled) return;
        
        this.animation.time += deltaTime;
        
        // עדכון שיידר של מערכת החלקיקים
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = this.animation.time * 0.001;
        }
        
        // עדכון אסטרואידים גדולים
        this.majorAsteroids.forEach(asteroid => {
            const userData = asteroid.userData;
            
            // עדכון מסלול
            userData.angle += userData.orbitalSpeed * deltaTime;
            
            const x = Math.cos(userData.angle) * userData.orbitalRadius;
            const z = Math.sin(userData.angle) * userData.orbitalRadius;
            
            asteroid.position.x = x;
            asteroid.position.z = z;
            
            // סיבוב עצמי
            asteroid.rotation.x += userData.rotationSpeed * deltaTime;
            asteroid.rotation.y += userData.rotationSpeed * deltaTime * 0.7;
            asteroid.rotation.z += userData.rotationSpeed * deltaTime * 0.3;
        });
        
        // סיבוב איטי של כל החגורה
        this.animation.rotationAngle += this.settings.rotationSpeed * deltaTime;
        if (this.mesh) {
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
    }

    // בדיקת התנגשות עם אסטרואיד
    checkCollision(position, radius) {
        // בדיקה פשוטה - האם המיקום נמצא בטווח החגורה
        const distance = Math.sqrt(position.x * position.x + position.z * position.z);
        const inBelt = distance >= this.settings.innerRadius && 
                      distance <= this.settings.outerRadius &&
                      Math.abs(position.y) <= this.settings.thickness;
        
        if (inBelt) {
            // בדיקת התנגשות עם אסטרואידים גדולים
            for (const asteroid of this.majorAsteroids) {
                const asteroidDistance = asteroid.position.distanceTo(new THREE.Vector3(position.x, position.y, position.z));
                if (asteroidDistance < radius + 2) {
                    return {
                        collision: true,
                        asteroid: asteroid,
                        distance: asteroidDistance
                    };
                }
            }
            
            // התנגשות כללית עם החגורה
            return {
                collision: true,
                asteroid: null,
                distance: 0
            };
        }
        
        return { collision: false };
    }

    // יצירת אפקט מטאור
    createMeteorShower(count = 10) {
        const meteors = [];
        
        for (let i = 0; i < count; i++) {
            // בחירת אסטרואיד אקראי מהחגורה
            const angle = Math.random() * Math.PI * 2;
            const radius = MathUtils.lerp(this.settings.innerRadius, this.settings.outerRadius, Math.random());
            
            const meteorGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const meteorMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.8
            });
            
            const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
            meteor.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * this.settings.thickness,
                Math.sin(angle) * radius
            );
            
            // כיוון אקראי לתנועה
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            meteor.userData = {
                velocity: direction.multiplyScalar(0.5),
                life: 1.0,
                decay: 0.002
            };
            
            meteors.push(meteor);
            this.mesh.add(meteor);
        }
        
        return meteors;
    }

    // קבלת מידע על החגורה
    getBeltInfo() {
        return {
            settings: { ...this.settings },
            animation: { ...this.animation },
            majorAsteroids: this.majorAsteroids.map(asteroid => ({
                name: asteroid.name,
                position: asteroid.position.toArray(),
                radius: asteroid.userData?.orbitalRadius || 0
            })),
            particleCount: this.settings.asteroidCount,
            isEnabled: this.settings.enabled
        };
    }

    // קבלת רשימת אסטרואידים גדולים
    getMajorAsteroids() {
        return this.majorAsteroids.map(asteroid => ({
            name: asteroid.name,
            position: asteroid.position.clone(),
            mesh: asteroid
        }));
    }

    // מיקוד על אסטרואיד ספציפי
    focusOnAsteroid(asteroidName) {
        const asteroid = this.majorAsteroids.find(a => a.name === asteroidName);
        return asteroid ? asteroid.position.clone() : null;
    }

    // יצירת מפת צפיפות
    getDensityMap(resolution = 64) {
        const densityMap = new Array(resolution * resolution).fill(0);
        
        if (!this.geometry) return densityMap;
        
        const positions = this.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            // המרה לקואורדינטות מפה
            const mapX = Math.floor(((x + this.settings.outerRadius) / (this.settings.outerRadius * 2)) * resolution);
            const mapZ = Math.floor(((z + this.settings.outerRadius) / (this.settings.outerRadius * 2)) * resolution);
            
            if (mapX >= 0 && mapX < resolution && mapZ >= 0 && mapZ < resolution) {
                densityMap[mapZ * resolution + mapX]++;
            }
        }
        
        return densityMap;
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי גיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
        }
        
        // ניקוי חומר
        if (this.material) {
            this.material.dispose();
        }
        
        // ניקוי אסטרואידים גדולים
        this.majorAsteroids.forEach(asteroid => {
            if (asteroid.geometry) asteroid.geometry.dispose();
            if (asteroid.material) asteroid.material.dispose();
        });
        
        this.majorAsteroids = [];
        this.isInitialized = false;
        
        console.log('Asteroid Belt disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AsteroidBelt;
}
