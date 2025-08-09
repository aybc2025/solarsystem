// חגורת האסטרואידים במערכת השמש - קובץ מלא ומתוקן
class SolarSystemAsteroidBelt {
    constructor() {
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.isInitialized = false;
        this.majorAsteroids = [];
        this.group = new THREE.Group();
        
        // הגדרות חגורת האסטרואידים
        this.settings = {
            enabled: true,
            innerRadius: 120,  // אחרי מאדים
            outerRadius: 180,  // לפני צדק
            asteroidCount: 5000,
            thickness: 15,
            rotationSpeed: 0.0001,
            showMajorAsteroids: true
        };
        
        // אנימציה
        this.animation = {
            time: 0,
            rotationAngle: 0
        };
        
        // צבעים
        this.colors = {
            min: 0x404040,
            max: 0x808080,
            major: {
                ceres: 0x8b7765,
                vesta: 0xa0522d,
                pallas: 0x696969,
                hygiea: 0x2f4f4f
            }
        };
    }

    // אתחול חגורת האסטרואידים
    async init() {
        try {
            console.log('Initializing asteroid belt...');
            
            // יצירת חגורת האסטרואידים הראשית
            await this.createAsteroidBelt();
            
            // יצירת אסטרואידים גדולים
            if (this.settings.showMajorAsteroids) {
                await this.createMajorAsteroids();
            }
            
            this.isInitialized = true;
            console.log('✅ Asteroid belt initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize asteroid belt:', error);
            throw error;
        }
    }

    // יצירת חגורת האסטרואידים
    async createAsteroidBelt() {
        const { innerRadius, outerRadius, asteroidCount, thickness } = this.settings;
        
        // יצירת מערכת חלקיקים
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);
        const colors = new Float32Array(asteroidCount * 3);
        const sizes = new Float32Array(asteroidCount);
        
        for (let i = 0; i < asteroidCount; i++) {
            const i3 = i * 3;
            
            // התפלגות במסלול טבעתי
            const angle = Math.random() * Math.PI * 2;
            const radiusVariation = Math.random();
            const radius = innerRadius + (outerRadius - innerRadius) * radiusVariation;
            
            // מיקום במרחב
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * thickness;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // צבע אקראי באפור-חום
            const colorVariation = 0.3 + Math.random() * 0.4;
            colors[i3] = colorVariation;
            colors[i3 + 1] = colorVariation * 0.9;
            colors[i3 + 2] = colorVariation * 0.8;
            
            // גודל אקראי
            sizes[i] = 0.5 + Math.random() * 2.5;
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // יצירת חומר עם שיידר מותאם אישית
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // גודל משתנה לפי מרחק
                    float distanceScale = 300.0 / -mvPosition.z;
                    gl_PointSize = size * distanceScale;
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                uniform float opacity;
                
                void main() {
                    // יצירת צורה עגולה
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = (1.0 - distance * 2.0) * opacity;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false
        });
        
        // יצירת מערכת הנקודות
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.name = 'asteroidBelt';
        
        // הוספת סיבוב עדין
        this.mesh.userData = {
            rotationSpeed: this.settings.rotationSpeed,
            originalPositions: positions.slice()
        };
        
        this.group.add(this.mesh);
    }

    // יצירת אסטרואידים גדולים
    async createMajorAsteroids() {
        const majorAsteroidsData = [
            { name: 'Ceres', radius: 3, distance: 135, angle: 0, color: this.colors.major.ceres },
            { name: 'Vesta', radius: 2, distance: 145, angle: Math.PI / 3, color: this.colors.major.vesta },
            { name: 'Pallas', radius: 1.8, distance: 155, angle: Math.PI * 2/3, color: this.colors.major.pallas },
            { name: 'Hygiea', radius: 1.5, distance: 165, angle: Math.PI, color: this.colors.major.hygiea }
        ];
        
        for (const data of majorAsteroidsData) {
            const asteroid = await this.createMajorAsteroid(data);
            this.majorAsteroids.push(asteroid);
            this.group.add(asteroid);
        }
    }

    // יצירת אסטרואיד בודד גדול
    async createMajorAsteroid(data) {
        // גיאומטריה לא סדירה לאסטרואיד
        const geometry = this.createIrregularAsteroidGeometry(data.radius);
        
        // חומר מתאים
        const material = new THREE.MeshLambertMaterial({
            color: data.color
        });
        
        const asteroid = new THREE.Mesh(geometry, material);
        asteroid.name = data.name;
        asteroid.castShadow = true;
        asteroid.receiveShadow = true;
        
        // מיקום במסלול
        const x = Math.cos(data.angle) * data.distance;
        const z = Math.sin(data.angle) * data.distance;
        const y = (Math.random() - 0.5) * this.settings.thickness;
        
        asteroid.position.set(x, y, z);
        
        // סיבוב אקראי
        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // מידע מסלול
        asteroid.userData = {
            orbitalRadius: data.distance,
            orbitalSpeed: Math.sqrt(1 / data.distance) * 0.0001,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            angle: data.angle,
            name: data.name,
            planetName: data.name,
            type: 'asteroid'
        };
        
        return asteroid;
    }

    // יצירת גיאומטריה לא סדירה לאסטרואיד
    createIrregularAsteroidGeometry(radius) {
        // התחלה עם כדור בסיסי
        const geometry = new THREE.SphereGeometry(radius, 12, 8);
        const positions = geometry.attributes.position.array;
        
        // עיוות הקודקודים ליצירת צורה לא סדירה
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // רעש פרוצדורלי לעיוות
            const noise1 = Math.sin(x * 3) * Math.sin(y * 3) * Math.sin(z * 3) * 0.2;
            const noise2 = Math.sin(x * 7) * Math.sin(y * 7) * Math.sin(z * 7) * 0.1;
            const noise3 = Math.sin(x * 13) * Math.sin(y * 13) * Math.sin(z * 13) * 0.05;
            
            const distortion = 1 + noise1 + noise2 + noise3;
            
            positions[i] *= distortion;
            positions[i + 1] *= distortion;
            positions[i + 2] *= distortion;
        }
        
        // עדכון גיאומטריה
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    // יצירת mesh להחזרה
    createMesh() {
        if (!this.isInitialized) {
            console.warn('Asteroid belt not initialized, returning empty group');
            return new THREE.Group();
        }
        
        this.group.name = 'asteroidBeltGroup';
        return this.group;
    }

    // עדכון החגורה
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

    // הצגה/הסתרה של חגורת האסטרואידים
    setVisibility(visible) {
        this.settings.enabled = visible;
        
        if (this.mesh) {
            this.mesh.visible = visible;
        }
        
        // הצגה/הסתרה של אסטרואידים גדולים
        this.majorAsteroids.forEach(asteroid => {
            asteroid.visible = visible;
        });
        
        console.log(`Asteroid belt visibility: ${visible}`);
    }

    // הפעלה/כיבוי אסטרואידים גדולים
    setMajorAsteroidsEnabled(enabled) {
        this.settings.showMajorAsteroids = enabled;
        
        this.majorAsteroids.forEach(asteroid => {
            asteroid.visible = enabled;
        });
    }

    // שינוי צפיפות האסטרואידים
    setDensity(density) {
        // זה ידרוש יצירה מחדש של הגיאומטריה
        this.settings.asteroidCount = Math.floor(density * 5000);
        this.recreate();
    }

    // יצירה מחדש של החגורה
    async recreate() {
        this.dispose();
        await this.init();
    }

    // קבלת מידע על חגורת האסטרואידים
    getInfo() {
        return {
            name: 'חגורת האסטרואידים',
            englishName: 'Asteroid Belt',
            location: 'בין מאדים לצדק (2.2-3.2 AU)',
            description: 'אזור המכיל מיליוני גרמי שמיים סלעיים הנעים במסלול סביב השמש',
            majorBodies: [
                'קרס - כוכב לכת ננסי, הגדול ביותר בחגורה',
                'וסטה - אסטרואיד בהיר עם משטח מגוון',
                'פלאס - אסטרואיד גדול עם מסלול נטוי',
                'היגיאה - אחד הגדולים בחגורה'
            ],
            facts: [
                'מסה כוללת קטנה מ-4% ממסת הירח',
                'המרחק הממוצע בין אסטרואידים הוא כמיליון ק"מ',
                'רוב האסטרואידים קטנים מ-1 ק"מ',
                'התגלתה כשהחיפוש אחר "כוכב הלכת החסר" נכשל'
            ],
            statistics: this.getStatistics()
        };
    }

    // קבלת סטטיסטיקות
    getStatistics() {
        return {
            totalAsteroids: this.settings.asteroidCount,
            majorAsteroids: this.majorAsteroids.length,
            innerRadius: this.settings.innerRadius + ' AU (scaled)',
            outerRadius: this.settings.outerRadius + ' AU (scaled)',
            thickness: this.settings.thickness + ' AU (scaled)',
            isEnabled: this.settings.enabled
        };
    }

    // שמירת הגדרות
    saveSettings() {
        return {
            ...this.settings
        };
    }

    // טעינת הגדרות
    loadSettings(savedSettings) {
        if (savedSettings) {
            Object.assign(this.settings, savedSettings);
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
        
        // ניקוי mesh
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        
        // ניקוי קבוצה
        while (this.group.children.length > 0) {
            this.group.remove(this.group.children[0]);
        }
        
        this.mesh = null;
        this.isInitialized = false;
        
        console.log('Asteroid belt disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemAsteroidBelt;
}

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.SolarSystemAsteroidBelt = SolarSystemAsteroidBelt;
}
