// אובייקט כוכב לכת גנרי במערכת השמש - מתוקן עם תנועה אליפטית
class SolarSystemPlanet {
    constructor(planetName) {
        this.name = planetName;
        
        // נתוני כוכב הלכת עם fallback
        this.data = null;
        if (typeof PLANETS_DATA !== 'undefined' && PLANETS_DATA[planetName]) {
            this.data = PLANETS_DATA[planetName];
        } else {
            this.data = this.getAccuratePlanetData(planetName);
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
        
        // פרמטרי מסלול אליפטיים
        this.orbital = {
            semiMajorAxis: this.data.scaledDistance || 100,
            eccentricity: this.data.eccentricity || 0,
            inclination: (this.data.inclination || 0) * Math.PI / 180,
            speed: 0,
            meanAnomaly: Math.random() * Math.PI * 2,
            eccentricAnomaly: 0,
            trueAnomaly: 0,
            radius: 0, // מרחק נוכחי מהשמש
            rotationSpeed: 0
        };
        
        // חישוב מהירות מסלול
        this.orbital.speed = Math.sqrt(1 / this.orbital.semiMajorAxis) * 0.001;
        
        // הגדרות ויזואליות
        this.settings = {
            radius: this.data.scaledRadius || 1,
            segments: 64,
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

    // אתחול כוכב הלכת
    async init() {
        try {
            // הגדרת פרמטרי מסלול
            this.setupOrbitalParameters();
            
            // יצירת רכיבים ויזואליים
            await this.createVisualComponents();
            
            // הגדרת אפקטים מיוחדים
            await this.setupSpecialEffects();
            
            this.isInitialized = true;
            console.log(`✅ Planet ${this.name} initialized with elliptical orbit`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize planet ${this.name}:`, error);
            throw error;
        }
    }

    // הגדרת פרמטרי מסלול אליפטיים
    setupOrbitalParameters() {
        // חישוב מהירות מסלול לפי חוק קפלר השלישי
        this.orbital.speed = Math.sqrt(1 / this.orbital.semiMajorAxis) * 0.001;
        
        // מהירות סיבוב עצמי
        this.orbital.rotationSpeed = this.data.rotationPeriod ? 
            (2 * Math.PI) / (Math.abs(this.data.rotationPeriod) * 60) : 0.01;
        
        // זווית התחלה מהנתונים
        const initialPos = INITIAL_POSITIONS[this.name];
        if (initialPos) {
            this.orbital.meanAnomaly = initialPos.angle;
        }
        
        // חישוב מיקום התחלתי
        this.updateOrbitalElements(0);
    }

    // יצירת רכיבים ויזואליים
    async createVisualComponents() {
        // יצירת גיאומטריה עם רזולוציה גבוהה
        this.geometry = new THREE.SphereGeometry(
            this.settings.radius,
            this.settings.segments,
            this.settings.segments / 2
        );
        
        // יצירת חומר בסיסי
        await this.createBasicMaterial();
        
        // יצירת mesh ראשי
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // userData לזיהוי לחיצות
        this.mesh.userData = {
            planetName: this.name,
            data: this.data,
            type: 'planet'
        };
        
        // הוספה לקבוצה
        this.group.add(this.mesh);
        
        console.log(`Created visual components for ${this.name} with radius ${this.settings.radius}`);
    }

    // יצירת חומר בסיסי - תיקון: ללא shininess ב-MeshLambertMaterial
    async createBasicMaterial() {
        const materialOptions = {
            color: this.data.color || 0x888888,
            transparent: false,
            side: THREE.FrontSide
        };
        
        // שיפורים לפי סוג כוכב הלכת
        switch(this.name) {
            case 'sun':
                materialOptions.emissive = this.data.emissive || this.data.color;
                materialOptions.emissiveIntensity = 0.5;
                this.material = new THREE.MeshBasicMaterial(materialOptions);
                break;
                
            case 'venus':
                // אטמוספירה עבה
                materialOptions.transparent = true;
                materialOptions.opacity = 0.9;
                this.material = new THREE.MeshLambertMaterial(materialOptions);
                break;
                
            case 'earth':
                // שילוב של ים ויבשה - תיקון: שימוש ב-MeshPhongMaterial עבור shininess
                this.material = new THREE.MeshPhongMaterial({
                    ...materialOptions,
                    shininess: 30
                });
                break;
                
            case 'mars':
                // משטח מאובק - תיקון: ללא roughness
                this.material = new THREE.MeshLambertMaterial(materialOptions);
                break;
                
            case 'jupiter':
            case 'saturn':
            case 'uranus':
            case 'neptune':
                // ענקי גז עם בנדות - תיקון: שימוש ב-MeshPhongMaterial
                this.material = new THREE.MeshPhongMaterial({
                    ...materialOptions,
                    shininess: 10
                });
                break;
                
            default:
                this.material = new THREE.MeshLambertMaterial(materialOptions);
        }
    }

    // הגדרת אפקטים מיוחדים
    async setupSpecialEffects() {
        // טבעות לשבתאי
        if (this.name === 'saturn') {
            await this.createRings();
        }
        
        // אטמוספירה לכוכבי לכת מתאימים
        if (['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
            await this.createAtmosphere();
        }
        
        // עננים לכוכבי לכת גזיים
        if (['venus', 'earth', 'jupiter', 'saturn'].includes(this.name)) {
            await this.createClouds();
        }
    }

    // יצירת טבעות
    async createRings() {
        if (this.name !== 'saturn') return;
        
        const ringGeometry = new THREE.RingGeometry(
            this.settings.radius * 1.5, // רדיוס פנימי
            this.settings.radius * 2.5, // רדיוס חיצוני
            64 // סגמנטים
        );
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xF5F5DC,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        this.effects.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        this.effects.rings.rotation.x = Math.PI / 2; // מיקום אופקי
        this.effects.rings.name = `${this.name}Rings`;
        
        this.group.add(this.effects.rings);
    }

    // יצירת אטמוספירה
    async createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.settings.radius * 1.1, // מעט גדול יותר מהכוכב
            this.settings.segments,
            this.settings.segments / 2
        );
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.getAtmosphereColor(),
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide // רק הצד הפנימי
        });
        
        this.effects.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.effects.atmosphere.name = `${this.name}Atmosphere`;
        
        this.group.add(this.effects.atmosphere);
    }

    // קבלת צבע אטמוספירה
    getAtmosphereColor() {
        const atmosphereColors = {
            venus: 0xFFF5AA,    // צהוב לבן (חומצה גופרתית)
            earth: 0x87CEEB,    // כחול שמיים
            mars: 0xDEB887,     // חום בהיר (אבק)
            jupiter: 0xF4A460,  // כתום חול
            saturn: 0xF5DEB3,   // בז' בהיר
            uranus: 0x40E0D0,   // טורקיז (מתאן)
            neptune: 0x4169E1   // כחול מלכותי
        };
        
        return atmosphereColors[this.name] || 0xCCCCCC;
    }

    // יצירת עננים
    async createClouds() {
        if (!['venus', 'earth', 'jupiter', 'saturn'].includes(this.name)) return;
        
        const cloudGeometry = new THREE.SphereGeometry(
            this.settings.radius * 1.02, // קרוב מאוד לפני השטח
            this.settings.segments,
            this.settings.segments / 2
        );
        
        let cloudColor, cloudOpacity;
        switch(this.name) {
            case 'venus':
                cloudColor = 0xFFF8DC;
                cloudOpacity = 0.8;
                break;
            case 'earth':
                cloudColor = 0xFFFFFF;
                cloudOpacity = 0.4;
                break;
            case 'jupiter':
            case 'saturn':
                cloudColor = 0xF5F5DC;
                cloudOpacity = 0.3;
                break;
            default:
                cloudColor = 0xFFFFFF;
                cloudOpacity = 0.3;
        }
        
        const cloudMaterial = new THREE.MeshLambertMaterial({
            color: cloudColor,
            transparent: true,
            opacity: cloudOpacity
        });
        
        this.effects.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.effects.clouds.name = `${this.name}Clouds`;
        
        this.group.add(this.effects.clouds);
    }

    // יצירת mesh ראשי להחזרה
    createMesh() {
        if (!this.isInitialized) {
            console.warn(`Planet ${this.name} not initialized, returning basic mesh`);
            return this.createBasicMesh();
        }
        
        // החזרת הקבוצה המלאה עם כל האפקטים
        this.group.name = this.name;
        this.group.userData = {
            planetName: this.name,
            data: this.data,
            type: 'planet'
        };
        
        return this.group;
    }

    // יצירת mesh בסיסי כחלופה
    createBasicMesh() {
        const radius = this.data.scaledRadius || 1;
        const color = this.data.color || 0x888888;
        
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshLambertMaterial({ color: color });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = this.name;
        mesh.userData = {
            planetName: this.name,
            data: this.data,
            type: 'planet'
        };
        
        return mesh;
    }

    // עדכון אלמנטים אורביטליים - משוואת קפלר
    updateOrbitalElements(deltaTime) {
        // עדכון Mean Anomaly
        this.orbital.meanAnomaly += this.orbital.speed * deltaTime;
        this.orbital.meanAnomaly = this.orbital.meanAnomaly % (2 * Math.PI);
        
        // פתרון משוואת קפלר לEccentric Anomaly
        this.orbital.eccentricAnomaly = this.solveKeplerEquation(
            this.orbital.meanAnomaly, 
            this.orbital.eccentricity
        );
        
        // חישוב True Anomaly
        const E = this.orbital.eccentricAnomaly;
        const e = this.orbital.eccentricity;
        
        const sinE = Math.sin(E);
        const cosE = Math.cos(E);
        
        const beta = e / (1 + Math.sqrt(1 - e * e));
        this.orbital.trueAnomaly = E + 2 * Math.atan2(beta * sinE, 1 - beta * cosE);
        
        // חישוב מרחק מהשמש
        this.orbital.radius = this.orbital.semiMajorAxis * (1 - e * cosE);
    }

    // פתרון משוואת קפלר בשיטת ניוטון-רפסון
    solveKeplerEquation(M, e, tolerance = 1e-6) {
        let E = M; // ניחוש ראשוני
        let delta = 1;
        let iterations = 0;
        const maxIterations = 50;
        
        while (Math.abs(delta) > tolerance && iterations < maxIterations) {
            delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
            E -= delta;
            iterations++;
        }
        
        return E;
    }

    // עדכון כוכב הלכת בלולאת האנימציה
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון מיקום במסלול אליפטי
        this.updateOrbitalPosition(deltaTime);
        
        // עדכון סיבוב עצמי
        this.updateRotation(deltaTime);
        
        // עדכון אפקטים
        this.updateEffects(deltaTime);
    }

    // עדכון מיקום במסלול אליפטי
    updateOrbitalPosition(deltaTime) {
        // עדכון אלמנטים אורביטליים
        this.updateOrbitalElements(deltaTime);
        
        // חישוב מיקום בקרטזי
        const r = this.orbital.radius;
        const nu = this.orbital.trueAnomaly;
        const i = this.orbital.inclination;
        
        // מיקום במישור המסלול
        const x = r * Math.cos(nu);
        const z = r * Math.sin(nu);
        const y = r * Math.sin(nu) * Math.sin(i) * 0.1; // נטייה קלה
        
        this.group.position.set(x, y, z);
    }

    // עדכון סיבוב עצמי
    updateRotation(deltaTime) {
        this.animation.rotationAngle += this.orbital.rotationSpeed * deltaTime;
        
        if (this.mesh) {
            // סיבוב הפוך לוונוס ואורנוס
            if (this.name === 'venus' || this.data.rotationPeriod < 0) {
                this.mesh.rotation.y = -this.animation.rotationAngle;
            } else {
                this.mesh.rotation.y = this.animation.rotationAngle;
            }
        }
    }

    // עדכון אפקטים
    updateEffects(deltaTime) {
        // סיבוב עננים (אם יש)
        if (this.effects.clouds) {
            this.animation.cloudRotation += deltaTime * 0.0001;
            this.effects.clouds.rotation.y = this.animation.cloudRotation;
        }
        
        // פעמות אטמוספירה
        if (this.effects.atmosphere) {
            this.animation.atmospherePulse += deltaTime * 0.002;
            const pulse = Math.sin(this.animation.atmospherePulse) * 0.1 + 0.9;
            this.effects.atmosphere.scale.setScalar(pulse);
        }
        
        // סיבוב טבעות
        if (this.effects.rings) {
            this.effects.rings.rotation.z += deltaTime * 0.0005;
        }
    }

    // קבלת נתוני כוכב לכת מדויקים כחלופה
    getAccuratePlanetData(planetName) {
        const fallbackData = {
            mercury: {
                name: 'כוכב חמה',
                radius: 2439.7,
                scaledRadius: 4,
                scaledDistance: 25,
                color: 0x8C7853,
                orbitalPeriod: 87.969,
                rotationPeriod: 58.646,
                eccentricity: 0.2056,
                inclination: 7.00,
                description: 'הכוכב הקרוב ביותר לשמש'
            },
            venus: {
                name: 'נוגה',
                radius: 6051.8,
                scaledRadius: 6,
                scaledDistance: 45,
                color: 0xFFC649,
                orbitalPeriod: 224.701,
                rotationPeriod: -243.025,
                eccentricity: 0.0067,
                inclination: 3.39,
                description: 'הכוכב החם ביותר במערכת השמש'
            },
            earth: {
                name: 'כדור הארץ',
                radius: 6371,
                scaledRadius: 6,
                scaledDistance: 65,
                color: 0x6B93D6,
                orbitalPeriod: 365.256,
                rotationPeriod: 0.99726968,
                eccentricity: 0.0167,
                inclination: 0.00,
                description: 'הכוכב היחיד עם חיים'
            },
            mars: {
                name: 'מאדים',
                radius: 3389.5,
                scaledRadius: 5,
                scaledDistance: 90,
                color: 0xCD5C5C,
                orbitalPeriod: 686.971,
                rotationPeriod: 1.025957,
                eccentricity: 0.0935,
                inclination: 1.85,
                description: 'הכוכב האדום'
            },
            jupiter: {
                name: 'צדק',
                radius: 69911,
                scaledRadius: 14,
                scaledDistance: 200,
                color: 0xD8CA9D,
                orbitalPeriod: 4332.59,
                rotationPeriod: 0.41354,
                eccentricity: 0.0489,
                inclination: 1.30,
                description: 'ענק הגז הגדול ביותר'
            },
            saturn: {
                name: 'שבתאי',
                radius: 58232,
                scaledRadius: 12,
                scaledDistance: 280,
                color: 0xFAD5A5,
                orbitalPeriod: 10747.0,
                rotationPeriod: 0.43958,
                eccentricity: 0.0565,
                inclination: 2.49,
                description: 'מפורסם בטבעות המרהיבות'
            },
            uranus: {
                name: 'אורנוס',
                radius: 25362,
                scaledRadius: 9,
                scaledDistance: 400,
                color: 0x4FD0E7,
                orbitalPeriod: 30588.0,
                rotationPeriod: -0.71833,
                eccentricity: 0.0444,
                inclination: 0.77,
                description: 'מסתובב על הצד'
            },
            neptune: {
                name: 'נפטון',
                radius: 24622,
                scaledRadius: 8,
                scaledDistance: 500,
                color: 0x4B70DD,
                orbitalPeriod: 60182.0,
                rotationPeriod: 0.6713,
                eccentricity: 0.0113,
                inclination: 1.77,
                description: 'הכוכב הרחוק ביותר'
            }
        };
        
        return fallbackData[planetName] || null;
    }

    // קבלת מיקום נוכחי
    getPosition() {
        return this.group.position.clone();
    }

    // קבלת מרחק מהשמש
    getDistanceFromSun() {
        return this.orbital.radius;
    }

    // קבלת מהירות נוכחית
    getCurrentSpeed() {
        return this.orbital.speed;
    }

    // הגדרת מיקום ידני
    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    // הגדרת סיבוב ידני
    setRotation(x, y, z) {
        if (this.mesh) {
            this.mesh.rotation.set(x, y, z);
        }
    }

    // הפעלה/כיבוי אפקטים
    setAtmosphereEnabled(enabled) {
        this.settings.atmosphereEnabled = enabled;
        if (this.effects.atmosphere) {
            this.effects.atmosphere.visible = enabled;
        }
    }

    setCloudsEnabled(enabled) {
        this.settings.cloudsEnabled = enabled;
        if (this.effects.clouds) {
            this.effects.clouds.visible = enabled;
        }
    }

    setRingsEnabled(enabled) {
        this.settings.ringsEnabled = enabled;
        if (this.effects.rings) {
            this.effects.rings.visible = enabled;
        }
    }

    // הגדרת מצב ריאליסטי
    setRealisticMode(enabled) {
        this.settings.realisticScale = enabled;
        
        if (enabled) {
            // גדלים ריאליסטיים (יחסיים)
            const earthRadius = PLANETS_DATA.earth?.scaledRadius || 6;
            const realRatio = this.data.radius / PLANETS_DATA.earth.radius;
            this.settings.radius = earthRadius * realRatio;
        } else {
            // גדלים מותאמים לתצוגה
            this.settings.radius = this.data.scaledRadius || 1;
        }
        
        // עדכון הגיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = new THREE.SphereGeometry(
                this.settings.radius,
                this.settings.segments,
                this.settings.segments / 2
            );
            
            if (this.mesh) {
                this.mesh.geometry = this.geometry;
            }
        }
    }

    // קבלת מידע מפורט
    getDetailedInfo() {
        return {
            name: this.data.name,
            nameEn: this.data.nameEn,
            type: this.getObjectType(),
            physicalData: {
                radius: this.data.radius,
                mass: this.data.mass,
                density: this.data.mass && this.data.radius ? 
                    this.data.mass / (4/3 * Math.PI * Math.pow(this.data.radius * 1000, 3)) : null
            },
            orbitalData: {
                semiMajorAxis: this.orbital.semiMajorAxis,
                eccentricity: this.orbital.eccentricity,
                currentDistance: this.orbital.radius,
                period: this.data.orbitalPeriod,
                inclination: this.data.inclination,
                trueAnomaly: this.orbital.trueAnomaly * 180 / Math.PI
            },
            rotationalData: {
                period: this.data.rotationPeriod,
                axialTilt: this.data.axialTilt
            },
            currentStatus: {
                position: this.getPosition(),
                distanceFromSun: this.getDistanceFromSun(),
                speed: this.getCurrentSpeed(),
                rotationAngle: this.animation.rotationAngle
            }
        };
    }

    // זיהוי סוג האובייקט
    getObjectType() {
        if (this.name === 'sun') return 'כוכב';
        
        const terrestrial = ['mercury', 'venus', 'earth', 'mars'];
        const gasGiants = ['jupiter', 'saturn'];
        const iceGiants = ['uranus', 'neptune'];
        
        if (terrestrial.includes(this.name)) return 'כוכב לכת סלעי';
        if (gasGiants.includes(this.name)) return 'ענק גז';
        if (iceGiants.includes(this.name)) return 'ענק קרח';
        
        return 'כוכב לכת';
    }

    // שיוך לסצנה
    addToScene(scene) {
        if (scene && this.group) {
            scene.add(this.group);
        }
    }

    // הסרה מהסצנה
    removeFromScene(scene) {
        if (scene && this.group) {
            scene.remove(this.group);
        }
    }

    // קבלת mesh לצורכי raycasting
    getMeshForRaycasting() {
        return this.mesh || this.group;
    }

    // בדיקה אם נקודה נמצאת על כוכב הלכת
    containsPoint(point) {
        if (!this.mesh) return false;
        
        const distance = this.mesh.position.distanceTo(point);
        return distance <= this.settings.radius;
    }

    // קבלת מרחק מנקודה
    distanceTo(point) {
        if (!this.mesh) return Infinity;
        return this.mesh.position.distanceTo(point);
    }

    // איפוס מיקום למסלול ההתחלתי
    resetToInitialPosition() {
        const initialPos = INITIAL_POSITIONS[this.name];
        if (initialPos) {
            this.orbital.meanAnomaly = initialPos.angle;
            this.updateOrbitalElements(0);
            this.updateOrbitalPosition(0);
        }
    }

    // שמירת מצב נוכחי
    saveState() {
        return {
            name: this.name,
            position: this.group.position.clone(),
            rotation: this.mesh ? this.mesh.rotation.clone() : new THREE.Euler(),
            orbitalAngle: this.orbital.meanAnomaly,
            animationTime: this.animation.time,
            settings: { ...this.settings }
        };
    }

    // טעינת מצב שמור
    loadState(state) {
        if (!state || state.name !== this.name) return false;
        
        try {
            this.group.position.copy(state.position);
            if (this.mesh && state.rotation) {
                this.mesh.rotation.copy(state.rotation);
            }
            this.orbital.meanAnomaly = state.orbitalAngle || 0;
            this.animation.time = state.animationTime || 0;
            
            if (state.settings) {
                Object.assign(this.settings, state.settings);
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to load state for ${this.name}:`, error);
            return false;
        }
    }

    // קבלת צבע דומיננטי
    getDominantColor() {
        return this.data.color || 0x888888;
    }

    // קבלת מידע לתצוגה מהירה
    getQuickDisplayInfo() {
        return {
            name: this.data.name,
            color: this.getDominantColor(),
            radius: this.settings.radius,
            position: this.getPosition(),
            type: this.getObjectType(),
            emoji: this.getPlanetEmoji()
        };
    }

    // קבלת אמוג'י של כוכב הלכת
    getPlanetEmoji() {
        const emojis = {
            sun: '☀️',
            mercury: '☿️',
            venus: '♀️',
            earth: '🌍',
            mars: '♂️',
            jupiter: '♃',
            saturn: '♄',
            uranus: '♅',
            neptune: '♆'
        };
        
        return emojis[this.name] || '🪐';
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי גיאומטריות
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }
        
        // ניקוי חומרים
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
        
        // ניקוי אפקטים
        Object.values(this.effects).forEach(effect => {
            if (effect && effect.geometry) effect.geometry.dispose();
            if (effect && effect.material) effect.material.dispose();
        });
        
        // ניקוי טקסטורות
        Object.values(this.textures).forEach(texture => {
            if (texture && texture.dispose) texture.dispose();
        });
        
        // איפוס הפניות
        this.mesh = null;
        this.group = null;
        this.isInitialized = false;
        
        console.log(`Planet ${this.name} disposed`);
    }
}

// פונקציות עזר לכוכבי לכת
const PlanetUtils = {
    // יצירת כוכב לכת מהיר
    createQuickPlanet(planetName, radius, distance, color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.name = planetName;
        mesh.userData = { planetName: planetName, type: 'planet' };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    },
    
    // חישוב מיקום במסלול אליפטי
    calculateEllipticalPosition(meanAnomaly, semiMajorAxis, eccentricity, inclination = 0) {
        // פתרון משוואת קפלר
        let E = meanAnomaly;
        for (let i = 0; i < 10; i++) {
            E = meanAnomaly + eccentricity * Math.sin(E);
        }
        
        // חישוב true anomaly
        const nu = 2 * Math.atan2(
            Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
            Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
        );
        
        // חישוב מרחק
        const r = semiMajorAxis * (1 - eccentricity * Math.cos(E));
        
        return new THREE.Vector3(
            r * Math.cos(nu),
            r * Math.sin(nu) * Math.sin(inclination) * 0.1,
            r * Math.sin(nu)
        );
    },
    
    // חישוב מהירות מסלול (חוק קפלר השלישי)
    calculateOrbitalSpeed(semiMajorAxis) {
        return Math.sqrt(1 / semiMajorAxis) * 0.001;
    },
    
    // המרת יחידות מדויקות
    scaleDistance(realDistanceKm, scaleFactor = 1000000) {
        return realDistanceKm / scaleFactor;
    },
    
    scaleRadius(realRadiusKm, scaleFactor = 100) {
        return Math.max(0.5, realRadiusKm / scaleFactor);
    }
};

// הפוך הכל זמין גלובלית
if (typeof window !== 'undefined') {
    window.SolarSystemPlanet = SolarSystemPlanet;
    window.PlanetUtils = PlanetUtils;
}
