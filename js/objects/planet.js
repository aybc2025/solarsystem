// אובייקט כוכב לכת גנרי במערכת השמש
class SolarSystemPlanet {
    constructor(planetName) {
        this.name = planetName;
        
        // נתוני כוכב הלכת עם fallback
        this.data = null;
        if (typeof PLANETS_DATA !== 'undefined' && PLANETS_DATA[planetName]) {
            this.data = PLANETS_DATA[planetName];
        } else {
            // נתונים בסיסיים כחלופה
            this.data = this.getBasicPlanetData(planetName);
        }
        
        if (!this.data) {
            throw new Error(`Planet data not found for: ${planetName}`);
        }
        
        // רכיבים ויזואליים
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.group = new THREE.Group();
        
        // אפקטים נוספים
        this.effects = {
            atmosphere: null,
            clouds: null,
            rings: null,
            moons: [],
            magnetosphere: null,
            aurorae: null
        };
        
        // פרמטרי מסלול
        this.orbital = {
            radius: 0,
            speed: 0,
            angle: Math.random() * Math.PI * 2,
            inclination: 0,
            eccentricity: 0,
            rotationSpeed: 0
        };
        
        // הגדרות ויזואליות
        this.settings = {
            radius: 1,
            segments: 32,
            atmosphereEnabled: false,
            cloudsEnabled: false,
            ringsEnabled: false,
            moonsEnabled: false,
            auroraEnabled: false,
            realisticScale: false
        };
        
        // אנימציה
        this.animation = {
            time: 0,
            rotationAngle: 0,
            cloudRotation: 0,
            atmospherePulse: 0
        };
        
        // טקסטורות
        this.textures = {
            surface: null,
            normal: null,
            specular: null,
            clouds: null,
            rings: null
        };
        
        this.isInitialized = false;
    }

    // נתונים בסיסיים לכוכבי לכת כחלופה
    getBasicPlanetData(planetName) {
        const basicData = {
            mercury: {
                name: 'כוכב חמה',
                radius: 2439.7,
                scaledRadius: 2,
                distance: 57.9,
                scaledDistance: 50,
                period: 88,
                rotationPeriod: 58.6,
                color: 0x8c7853
            },
            venus: {
                name: 'נוגה',
                radius: 6051.8,
                scaledRadius: 3,
                distance: 108.2,
                scaledDistance: 70,
                period: 225,
                rotationPeriod: -243,
                color: 0xffc649
            },
            earth: {
                name: 'כדור הארץ',
                radius: 6371,
                scaledRadius: 4,
                distance: 149.6,
                scaledDistance: 100,
                period: 365.25,
                rotationPeriod: 1,
                color: 0x6b93d6
            },
            mars: {
                name: 'מאדים',
                radius: 3389.5,
                scaledRadius: 3,
                distance: 227.9,
                scaledDistance: 130,
                period: 687,
                rotationPeriod: 1.03,
                color: 0xcd5c5c
            },
            jupiter: {
                name: 'צדק',
                radius: 69911,
                scaledRadius: 12,
                distance: 778.5,
                scaledDistance: 200,
                period: 4333,
                rotationPeriod: 0.41,
                color: 0xd8ca9d
            },
            saturn: {
                name: 'שבתאי',
                radius: 58232,
                scaledRadius: 10,
                distance: 1432,
                scaledDistance: 270,
                period: 10759,
                rotationPeriod: 0.45,
                color: 0xfad5a5
            },
            uranus: {
                name: 'אורנוס',
                radius: 25362,
                scaledRadius: 6,
                distance: 2867,
                scaledDistance: 340,
                period: 30687,
                rotationPeriod: -0.72,
                color: 0x4fd0e7
            },
            neptune: {
                name: 'נפטון',
                radius: 24622,
                scaledRadius: 6,
                distance: 4515,
                scaledDistance: 410,
                period: 60190,
                rotationPeriod: 0.67,
                color: 0x4b70dd
            }
        };
        
        return basicData[planetName] || null;
    }

    // אתחול כוכב הלכת
    async init() {
        try {
            // חישוב פרמטרים פיזיקליים
            this.calculateOrbitalParameters();
            
            // יצירת גיאומטריה ראשית
            await this.createGeometry();
            
            // טעינת טקסטורות (אופציונלי)
            await this.loadTextures();
            
            // יצירת חומרים
            await this.createMaterials();
            
            // יצירת mesh ראשי
            await this.createMesh();
            
            // יצירת אפקטים נוספים
            await this.createEffects();
            
            this.isInitialized = true;
            console.log(`✅ Planet ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize planet ${this.name}:`, error);
            // יצירת כוכב לכת פשוט כחלופה
            this.createSimplePlanet();
        }
    }

    // חישוב פרמטרים אורביטליים
    calculateOrbitalParameters() {
        // רדיוס מסלול
        this.orbital.radius = this.data.scaledDistance || 100;
        
        // מהירות מסלול (הפוכה לתקופה)
        this.orbital.speed = this.data.period ? 
            (Math.PI * 2) / (this.data.period * 0.1) : 0.001;
        
        // מהירות סיבוב עצמי
        this.orbital.rotationSpeed = this.data.rotationPeriod ? 
            (Math.PI * 2) / (Math.abs(this.data.rotationPeriod) * 24 * 3600 * 0.001) : 0.001;
        
        // רדיוס כוכב הלכת (בקנה מידה)
        this.settings.radius = this.data.scaledRadius || 
            Math.max(1, Math.log(this.data.radius || 1000) * 0.5);
    }

    // יצירת גיאומטריה
    async createGeometry() {
        this.geometry = new THREE.SphereGeometry(
            this.settings.radius,
            this.settings.segments,
            this.settings.segments
        );
        
        // חישוב טנגנטים לnormal mapping
        if (this.geometry.computeTangents) {
            this.geometry.computeTangents();
        }
    }

    // טעינת טקסטורות (אופציונלי)
    async loadTextures() {
        try {
            // טקסטורת פני השטח
            if (typeof TEXTURE_URLS !== 'undefined' && TEXTURE_URLS.planets && TEXTURE_URLS.planets[this.name]?.diffuse) {
                this.textures.surface = await this.loadTextureFromUrl(TEXTURE_URLS.planets[this.name].diffuse);
            } else {
                this.textures.surface = await this.createProceduralTexture();
            }
            
            // טקסטורת נורמלים
            if (typeof TEXTURE_URLS !== 'undefined' && TEXTURE_URLS.planets && TEXTURE_URLS.planets[this.name]?.normal) {
                this.textures.normal = await this.loadTextureFromUrl(TEXTURE_URLS.planets[this.name].normal);
            }
            
        } catch (error) {
            console.warn(`Failed to load textures for ${this.name}, using fallback`);
            this.textures.surface = await this.createProceduralTexture();
        }
    }

    // טעינת טקסטורה מURL
    async loadTextureFromUrl(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn(`Failed to load texture ${url}:`, error);
                    reject(error);
                }
            );
        });
    }

    // יצירת טקסטורה פרוצדורלית
    async createProceduralTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // צבע בסיס לפי כוכב הלכת
        let baseColor = this.data.color || 0x888888;
        if (typeof baseColor === 'number') {
            const r = (baseColor >> 16) & 255;
            const g = (baseColor >> 8) & 255;
            const b = baseColor & 255;
            baseColor = `rgb(${r}, ${g}, ${b})`;
        }
        
        // גרדיאנט רדיאלי פשוט
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // הוספת נקודות אקראיות לטקסטורה
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 3 + 1;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }

    // יצירת חומרים
    async createMaterials() {
        // פרמטרי חומר בסיסיים
        const materialParams = {
            color: this.data.color || 0xffffff
        };
        
        // הוספת טקסטורה אם קיימת
        if (this.textures.surface) {
            materialParams.map = this.textures.surface;
        }
        
        // הוספת מפת נורמלים
        if (this.textures.normal) {
            materialParams.normalMap = this.textures.normal;
            materialParams.normalScale = new THREE.Vector2(1, 1);
        }
        
        // בחירת סוג החומר לפי כוכב הלכת
        if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
            // ענקי גז - חומר עם תאורה מיוחדת
            this.material = new THREE.MeshPhongMaterial(materialParams);
        } else if (this.name === 'earth') {
            // כדור הארץ - חומר מתקדם עם השתקפויות
            this.material = new THREE.MeshPhongMaterial({
                ...materialParams,
                specular: 0x222222,
                shininess: 25
            });
        } else {
            // כוכבי לכת סלעיים - חומר למברט
            this.material = new THREE.MeshLambertMaterial(materialParams);
        }
    }

    // יצירת mesh ראשי
    async createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // מיקום במסלול
        this.updateOrbitalPosition();
        
        // הוספת לקבוצה
        this.group.add(this.mesh);
    }

    // יצירת אפקטים נוספים
    async createEffects() {
        try {
            // אטמוספרה (לכוכבי לכת מתאימים)
            if (['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
                this.createAtmosphere();
            }
            
            // טבעות (לשבתאי ואורנוס)
            if (['saturn', 'uranus'].includes(this.name)) {
                this.createRings();
            }
            
            // ירחים (לכוכבי לכת מתאימים)
            if (['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
                this.createMoons();
            }
            
        } catch (error) {
            console.warn(`Failed to create effects for ${this.name}:`, error);
        }
    }

    // יצירת אטמוספרה
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.settings.radius * 1.1, 16, 16);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.getAtmosphereColor(),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.effects.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.effects.atmosphere);
        this.settings.atmosphereEnabled = true;
    }

    // קבלת צבע אטמוספרה
    getAtmosphereColor() {
        const atmosphereColors = {
            venus: 0xffcc00,
            earth: 0x87ceeb,
            mars: 0xff6b47,
            jupiter: 0xd2691e,
            saturn: 0xf4a460,
            uranus: 0x40e0d0,
            neptune: 0x4169e1
        };
        
        return atmosphereColors[this.name] || 0x87ceeb;
    }

    // יצירת טבעות
    createRings() {
        const innerRadius = this.settings.radius * 1.2;
        const outerRadius = this.settings.radius * 2.0;
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.name === 'saturn' ? 0xc4b5a0 : 0x4fd0e7,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        this.effects.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        this.effects.rings.rotation.x = Math.PI / 2; // סיבוב לרוחב
        this.group.add(this.effects.rings);
        this.settings.ringsEnabled = true;
    }

    // יצירת ירחים
    createMoons() {
        const moonData = this.getMoonData();
        
        moonData.forEach((moon, index) => {
            const moonGeometry = new THREE.SphereGeometry(moon.radius, 8, 8);
            const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            
            // מיקום הירח
            const angle = (index / moonData.length) * Math.PI * 2;
            moonMesh.position.set(
                Math.cos(angle) * moon.distance,
                0,
                Math.sin(angle) * moon.distance
            );
            
            const moonGroup = new THREE.Group();
            moonGroup.add(moonMesh);
            moonGroup.userData = {
                angle: angle,
                speed: moon.speed,
                distance: moon.distance
            };
            
            this.effects.moons.push(moonGroup);
            this.group.add(moonGroup);
        });
        
        if (moonData.length > 0) {
            this.settings.moonsEnabled = true;
        }
    }

    // נתוני ירחים בסיסיים
    getMoonData() {
        const moonDataByPlanet = {
            earth: [{ radius: 1, distance: 15, speed: 0.01 }],
            mars: [
                { radius: 0.3, distance: 8, speed: 0.02 },
                { radius: 0.2, distance: 12, speed: 0.015 }
            ],
            jupiter: [
                { radius: 1.5, distance: 25, speed: 0.008 },
                { radius: 1.2, distance: 30, speed: 0.006 },
                { radius: 1.8, distance: 35, speed: 0.005 },
                { radius: 1.1, distance: 40, speed: 0.004 }
            ],
            saturn: [
                { radius: 2, distance: 28, speed: 0.007 },
                { radius: 0.8, distance: 35, speed: 0.005 }
            ],
            uranus: [
                { radius: 0.6, distance: 18, speed: 0.009 }
            ],
            neptune: [
                { radius: 1.3, distance: 22, speed: 0.006 }
            ]
        };
        
        return moonDataByPlanet[this.name] || [];
    }

    // יצירת כוכב לכת פשוט כחלופה
    createSimplePlanet() {
        const geometry = new THREE.SphereGeometry(this.settings.radius, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.data.color || 0x888888 
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.updateOrbitalPosition();
        this.group.add(this.mesh);
        
        this.isInitialized = true;
        console.log(`✅ Simple planet ${this.name} created`);
    }

    // עדכון מיקום במסלול
    updateOrbitalPosition() {
        const x = Math.cos(this.orbital.angle) * this.orbital.radius;
        const z = Math.sin(this.orbital.angle) * this.orbital.radius;
        
        this.group.position.set(x, 0, z);
    }

    // יצירת mesh (פונקציה נדרשת)
    createMesh() {
        return this.group;
    }

    // עדכון אנימציה
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון מיקום במסלול
        this.orbital.angle += this.orbital.speed * deltaTime * 0.1;
        this.updateOrbitalPosition();
        
        // סיבוב עצמי
        this.animation.rotationAngle += this.orbital.rotationSpeed * deltaTime;
        if (this.mesh) {
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
        
        // עדכון אטמוספרה
        if (this.effects.atmosphere && this.effects.atmosphere.material.uniforms) {
            this.effects.atmosphere.material.uniforms.time.value = this.animation.time * 0.001;
        }
        
        // עדכון עננים
        if (this.effects.clouds) {
            this.animation.cloudRotation += deltaTime * 0.0002;
            this.effects.clouds.rotation.y = this.animation.cloudRotation;
        }
        
        // עדכון ירחים
        this.effects.moons.forEach(moonGroup => {
            const userData = moonGroup.userData;
            userData.angle += userData.speed * deltaTime;
            
            const x = Math.cos(userData.angle) * userData.distance;
            const z = Math.sin(userData.angle) * userData.distance;
            
            moonGroup.rotation.y = userData.angle;
            if (moonGroup.children[0]) {
                moonGroup.children[0].position.set(x, 0, z);
            }
        });
        
        // עדכון טבעות
        if (this.effects.rings) {
            this.effects.rings.rotation.z += deltaTime * 0.0001;
        }
    }

    // החזרת האובייקט הראשי
    getMesh() {
        return this.group;
    }

    // הגדרת מצב ריאליסטי
    setRealisticScale(enabled) {
        this.settings.realisticScale = enabled;
        this.calculateOrbitalParameters();
        
        // עדכון גיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = new THREE.SphereGeometry(
                this.settings.radius,
                this.settings.segments,
                this.settings.segments
            );
            if (this.mesh) {
                this.mesh.geometry = this.geometry;
            }
        }
    }

    // הצגת/הסתרת אפקטים
    toggleEffect(effectName, visible) {
        if (this.effects[effectName]) {
            this.effects[effectName].visible = visible;
        }
    }

    // קבלת מידע על כוכב הלכת
    getPlanetInfo() {
        return {
            name: this.name,
            data: this.data,
            settings: { ...this.settings },
            orbital: { ...this.orbital },
            animation: { ...this.animation },
            effects: {
                atmosphere: !!this.effects.atmosphere,
                clouds: !!this.effects.clouds,
                rings: !!this.effects.rings,
                moons: this.effects.moons.length,
                aurorae: !!this.effects.aurorae
            },
            isInitialized: this.isInitialized
        };
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
        
        // ניקוי טקסטורות
        Object.values(this.textures).forEach(texture => {
            if (texture && texture.dispose) {
                texture.dispose();
            }
        });
        
        // ניקוי אפקטים
        Object.values(this.effects).forEach(effect => {
            if (effect) {
                if (Array.isArray(effect)) {
                    effect.forEach(e => {
                        if (e && e.geometry) e.geometry.dispose();
                        if (e && e.material) e.material.dispose();
                    });
                } else {
                    if (effect.geometry) effect.geometry.dispose();
                    if (effect.material) effect.material.dispose();
                }
            }
        });
        
        this.isInitialized = false;
        console.log(`Planet ${this.name} disposed`);
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemPlanet;
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
window.SolarSystemPlanet = SolarSystemPlanet;
