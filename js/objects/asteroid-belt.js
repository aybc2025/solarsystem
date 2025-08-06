// חגורת האסטרואידים - אזור בין מאדים לצדק
class AsteroidBelt {
    constructor() {
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.particleSystem = null;
        
        // הגדרות חגורת האסטרואידים - תיקון מיקום
        this.settings = {
            asteroidCount: 5000,
            innerRadius: 120,  // תיקון: אחרי מאדים (90) + מרווח
            outerRadius: 180,  // תיקון: לפני צדק (200) - מרווח
            thickness: 15,     // הקטנה מ-20 ל-15 לחגורה יותר מדויקת
            minSize: 0.5,
            maxSize: 3.0,
            rotationSpeed: 0.00005,
            enabled: true
        };
        
        // אסטרואידים בודדים גדולים יותר
        this.majorAsteroids = [];
        this.majorAsteroidData = [
            { name: 'Ceres', radius: 2.5, distance: 135, color: 0x999999 },     // במרכז החגורה
            { name: 'Vesta', radius: 1.8, distance: 145, color: 0xaaaaaa },     // מעט יותר רחוק
            { name: 'Pallas', radius: 1.5, distance: 155, color: 0x888888 },    // עוד יותר רחוק
            { name: 'Juno', radius: 1.2, distance: 165, color: 0x777777 }       // בחלק החיצוני
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
            const radiusRatio = this.generateRadiusDistribution();
            const radius = this.settings.innerRadius + radiusRatio * (this.settings.outerRadius - this.settings.innerRadius);
            
            // גובה אקראי (חגורה לא שטוחה לגמרי)
            const height = (Math.random() - 0.5) * this.settings.thickness;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // צבעים משתנים - חום, אפור, כתום מתכתי
            const colorVariant = Math.random();
            if (colorVariant < 0.4) {
                // אפור כהה (אסטרואידים פחמיים)
                colors[i3] = 0.25 + Math.random() * 0.15;     // R
                colors[i3 + 1] = 0.25 + Math.random() * 0.15; // G
                colors[i3 + 2] = 0.25 + Math.random() * 0.15; // B
            } else if (colorVariant < 0.7) {
                // חום (אסטרואידים סיליקטיים)
                colors[i3] = 0.4 + Math.random() * 0.25;     // R
                colors[i3 + 1] = 0.25 + Math.random() * 0.2; // G
                colors[i3 + 2] = 0.1 + Math.random() * 0.15; // B
            } else {
                // כתום-אדום (אסטרואידים מתכתיים עשירים בברזל)
                colors[i3] = 0.6 + Math.random() * 0.3;     // R
                colors[i3 + 1] = 0.3 + Math.random() * 0.2; // G
                colors[i3 + 2] = 0.05 + Math.random() * 0.1; // B
            }
            
            // גדלים משתנים עם התפלגות פרבולית (הרבה קטנים, מעט גדולים)
            const sizeRandom = Math.random();
            sizes[i] = this.settings.minSize + Math.pow(sizeRandom, 2) * (this.settings.maxSize - this.settings.minSize);
            
            // זוויות סיבוב ראשוניות
            rotations[i] = Math.random() * Math.PI * 2;
            
            // מהירויות מסלול ריאליסטיות (חוק קפלר השלישי)
            const orbitalSpeed = Math.sqrt(1 / radius) * 0.0001;
            velocities[i3] = -Math.sin(angle) * orbitalSpeed;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = Math.cos(angle) * orbitalSpeed;
        }
        
        // הגדרת attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
        this.geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        // חומר מתקדם עם shaders
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                twinkleIntensity: { value: 0.3 }
            },
            vertexShader: `
                attribute float size;
                attribute float rotation;
                attribute vec3 velocity;
                
                varying vec3 vColor;
                varying float vSize;
                varying float vRotation;
                
                uniform float time;
                
                void main() {
                    vColor = color;
                    vSize = size;
                    vRotation = rotation + time * 0.1;
                    
                    // עדכון מיקום במסלול
                    vec3 pos = position + velocity * time * 100.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vSize;
                varying float vRotation;
                
                uniform float time;
                uniform float twinkleIntensity;
                
                void main() {
                    // צורת אסטרואיד לא סדירה
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float distance = length(coord);
                    
                    // צורה אליפטית לא סדירה
                    float angle = atan(coord.y, coord.x) + vRotation;
                    float irregularity = 0.8 + 0.2 * sin(angle * 3.0 + time * 0.5);
                    float asteroidShape = 1.0 - smoothstep(0.3 * irregularity, 0.5 * irregularity, distance);
                    
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
            
            // הוספת רעש לכל קודקוד (פונקציית רעש פשוטה)
            const noise = Math.sin(vertex.x * 0.5) * Math.sin(vertex.y * 0.5) * Math.sin(vertex.z * 0.5);
            
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
        const newCount = Math.floor(5000 * Math.max(0.1, Math.min(2.0, density)));
        
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
            this.material.uniforms.twinkleIntensity.value = Math.max(0, Math.min(1, intensity));
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

    // קבלת אסטרואיד הקרוב ביותר למיקום
    getNearestAsteroid(position) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.majorAsteroids.forEach(asteroid => {
            const distance = asteroid.position.distanceTo(position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = asteroid;
            }
        });
        
        return { asteroid: nearest, distance: minDistance };
    }

    // קבלת מידע סטטיסטי על החגורה
    getStatistics() {
        return {
            totalAsteroids: this.settings.asteroidCount + this.majorAsteroids.length,
            majorAsteroids: this.majorAsteroids.length,
            innerRadius: this.settings.innerRadius,
            outerRadius: this.settings.outerRadius,
            thickness: this.settings.thickness,
            volume: Math.PI * (Math.pow(this.settings.outerRadius, 2) - Math.pow(this.settings.innerRadius, 2)) * this.settings.thickness,
            density: this.settings.asteroidCount / (Math.PI * (Math.pow(this.settings.outerRadius, 2) - Math.pow(this.settings.innerRadius, 2)))
        };
    }

    // קבלת מידע על אסטרואיד מסוים
    getAsteroidInfo(asteroidName) {
        const asteroid = this.majorAsteroids.find(a => a.name === asteroidName);
        if (!asteroid) return null;
        
        const data = this.majorAsteroidData.find(d => d.name === asteroidName);
        if (!data) return null;
        
        return {
            name: asteroidName,
            radius: data.radius,
            distance: data.distance,
            position: asteroid.position.clone(),
            color: data.color,
            type: this.getAsteroidType(asteroidName)
        };
    }

    // זיהוי סוג האסטרואיד
    getAsteroidType(asteroidName) {
        const types = {
            'Ceres': 'כוכב לכת ננסי עם מים תת-קרקעיים',
            'Vesta': 'אסטרואיד מתכתי עם ליבת ברזל',
            'Pallas': 'אסטרואיד סיליקטי גדול',
            'Juno': 'אסטרואיד סלעי עם מתכת'
        };
        
        return types[asteroidName] || 'אסטרואיד סלעי';
    }

    // שיוך החגורה לסצנה
    addToScene(scene) {
        if (this.mesh && scene) {
            scene.add(this.mesh);
        }
    }

    // הסרה מהסצנה
    removeFromScene(scene) {
        if (this.mesh && scene) {
            scene.remove(this.mesh);
        }
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי גיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }
        
        // ניקוי חומר
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
        
        // ניקוי אסטרואידים גדולים
        this.majorAsteroids.forEach(asteroid => {
            if (asteroid.geometry) asteroid.geometry.dispose();
            if (asteroid.material) asteroid.material.dispose();
        });
        this.majorAsteroids = [];
        
        // איפוס מערכת החלקיקים
        this.particleSystem = null;
        this.mesh = null;
        this.isInitialized = false;
    }

    // חזרת המאפיינים הבסיסיים
    getBasicInfo() {
        return {
            name: 'חגורת האסטרואידים',
            nameEn: 'Asteroid Belt', 
            location: 'בין מאדים לצדק',
            distance: `${this.settings.innerRadius}-${this.settings.outerRadius} יחידות סקלה`,
            realDistance: '2.2-3.2 AU מהשמש',
            asteroidCount: this.settings.asteroidCount,
            majorBodies: ['קרס', 'וסטה', 'פלאס', 'יונו'],
            description: 'חגורת האסטרואידים היא אזור בין מאדים לצדק המכיל מאות אלפי גרמי שמיים סלעיים. בניגוד לתיאורים בסרטים, האזור די ריק - המרחק הממוצע בין אסטרואידים הוא כמיליון קילומטר!'
        };
    }
}

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.AsteroidBelt = AsteroidBelt;
}
