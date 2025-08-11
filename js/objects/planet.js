// אובייקט כוכב לכת גנרי במערכת השמש - מתוקן עם מסלולים אליפטיים ומהירות איטית יותר
class SolarSystemPlanet {
    constructor(planetName) {
        this.name = planetName;
        
        // נתוני כוכב הלכת עם fallback
        this.data = null;
        if (typeof PLANETS_DATA !== 'undefined' && PLANETS_DATA[planetName]) {
            this.data = PLANETS_DATA[planetName];
        } else {
            // נתונים בסיסיים כחלופה עם נתונים מדויקים
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
        
        // פרמטרי מסלול אליפטי מדויק
        this.orbital = {
            semiMajorAxis: this.data.scaledDistance || 100,  // ציר ראשי
            semiMinorAxis: 0,  // ציר משני (יחושב)
            eccentricity: this.data.eccentricity || 0,  // אקסצנטריות
            speed: 0,  // מהירות מסלול
            meanAnomaly: Math.random() * Math.PI * 2,  // אנומליה ממוצעת התחלתית
            eccentricAnomaly: 0,  // אנומליה אקסצנטרית
            trueAnomaly: 0,  // אנומליה אמיתית
            inclination: this.data.inclination || 0,  // נטיית המסלול
            rotationSpeed: 0,  // מהירות סיבוב עצמי
            focalDistance: 0  // מרחק המוקד מהמרכז
        };
        
        // הגדרות ויזואליות
        this.settings = {
            radius: this.data.scaledRadius || 1,
            segments: 64,
            atmosphereEnabled: false,
            cloudsEnabled: false,
            ringsEnabled: false,
            moonsEnabled: false,
            auroraEnabled: false,
            realisticScale: false,
            showOrbit: true
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
            // הגדרת פרמטרי מסלול אליפטי
            this.setupEllipticalOrbit();
            
            // יצירת רכיבים ויזואליים
            await this.createVisualComponents();
            
            // הגדרת אפקטים מיוחדים
            await this.setupSpecialEffects();
            
            this.isInitialized = true;
            console.log(`✅ Planet ${this.name} initialized with elliptical orbit (e=${this.orbital.eccentricity.toFixed(3)})`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize planet ${this.name}:`, error);
            throw error;
        }
    }

    // הגדרת פרמטרי מסלול אליפטי
    setupEllipticalOrbit() {
        const a = this.data.scaledDistance || 100;  // ציר ראשי
        const e = this.data.eccentricity || 0;  // אקסצנטריות
        
        this.orbital.semiMajorAxis = a;
        this.orbital.eccentricity = e;
        
        // חישוב ציר משני: b = a * sqrt(1 - e²)
        this.orbital.semiMinorAxis = a * Math.sqrt(1 - e * e);
        
        // חישוב מרחק המוקד מהמרכז: c = a * e
        this.orbital.focalDistance = a * e;
        
        // מהירות מסלול איטית יותר - הקטנה פי 5 מהמקור
        this.orbital.speed = Math.sqrt(1 / a) * 0.0002;  // שונה מ-0.001 ל-0.0002
        
        // מהירות סיבוב עצמי
        this.orbital.rotationSpeed = this.data.rotationPeriod ? 
            (2 * Math.PI) / (Math.abs(this.data.rotationPeriod) * 60) : 0.01;
        
        // נטיית המסלול
        this.orbital.inclination = (this.data.inclination || 0) * Math.PI / 180;
        
        // אנומליה התחלתית מהנתונים
        const initialPos = INITIAL_POSITIONS[this.name];
        if (initialPos) {
            this.orbital.meanAnomaly = initialPos.angle;
        }
        
        // חישוב מיקום התחלתי במסלול האליפטי
        this.updateEllipticalPosition(0);
    }

    // חישוב מיקום במסלול אליפטי
    calculateEllipticalPosition(meanAnomaly) {
        const e = this.orbital.eccentricity;
        const a = this.orbital.semiMajorAxis;
        
        // פתרון משוואת קפלר: M = E - e*sin(E)
        // M = mean anomaly, E = eccentric anomaly
        let E = meanAnomaly;  // ערך התחלתי
        
        // איטרציות ניוטון-רפסון
        for (let i = 0; i < 10; i++) {
            const dE = (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
            E -= dE;
            if (Math.abs(dE) < 1e-6) break;
        }
        
        this.orbital.eccentricAnomaly = E;
        
        // חישוב אנומליה אמיתית
        const cosE = Math.cos(E);
        const sinE = Math.sin(E);
        const sqrtOneMinusESq = Math.sqrt(1 - e * e);
        
        const cosNu = (cosE - e) / (1 - e * cosE);
        const sinNu = (sqrtOneMinusESq * sinE) / (1 - e * cosE);
        
        this.orbital.trueAnomaly = Math.atan2(sinNu, cosNu);
        
        // חישוב מרחק מהמוקד
        const r = a * (1 - e * cosE);
        
        // חישוב מיקום במישור המסלול
        const x = r * Math.cos(this.orbital.trueAnomaly);
        const z = r * Math.sin(this.orbital.trueAnomaly);
        
        // החלת נטיית המסלול
        const y = z * Math.sin(this.orbital.inclination) * 0.1;  // הקטנת האפקט לנראות טובה יותר
        const z_final = z * Math.cos(this.orbital.inclination);
        
        return { x, y, z: z_final, r };
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

    // יצירת חומר בסיסי
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
                // שילוב של ים ויבשה
                materialOptions.shininess = 30;
                this.material = new THREE.MeshPhongMaterial(materialOptions);
                break;
                
            case 'mars':
                // משטח מאובק
                materialOptions.roughness = 0.9;
                this.material = new THREE.MeshLambertMaterial(materialOptions);
                break;
                
            case 'jupiter':
            case 'saturn':
            case 'uranus':
            case 'neptune':
                // ענקי גז עם בנדות
                materialOptions.shininess = 10;
                this.material = new THREE.MeshPhongMaterial(materialOptions);
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

    // עדכון כוכב הלכת בלולאת האנימציה
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון מיקום במסלול אליפטי
        this.updateEllipticalPosition(deltaTime);
        
        // עדכון סיבוב עצמי
        this.updateRotation(deltaTime);
        
        // עדכון אפקטים
        this.updateEffects(deltaTime);
    }

    // עדכון מיקום במסלול אליפטי
    updateEllipticalPosition(deltaTime) {
        // עדכון אנומליה ממוצעת (בהתאם לחוק קפלר השני)
        this.orbital.meanAnomaly += this.orbital.speed * deltaTime;
        
        // נרמול ל-0 עד 2π
        while (this.orbital.meanAnomaly > Math.PI * 2) {
            this.orbital.meanAnomaly -= Math.PI * 2;
        }
        
        // חישוב מיקום חדש במסלול האליפטי
        const position = this.calculateEllipticalPosition(this.orbital.meanAnomaly);
        
        // עדכון מיקום הקבוצה
        this.group.position.set(position.x, position.y, position.z);
    }

    // עדכון סיבוב עצמי
    updateRotation(deltaTime) {
        this.animation.rotationAngle += this.orbital.rotationSpeed * deltaTime;
        
        if (this.mesh) {
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
        
        // סיבוב הפוך לוונוס ואורנוס
        if (this.name === 'venus' || this.data.rotationPeriod < 0) {
            this.mesh.rotation.y = -this.animation.rotationAngle;
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
        return this.group.position.length();
    }

    // קבלת מהירות נוכחית
    getCurrentSpeed() {
        return this.orbital.speed;
    }

    // קבלת נתוני מסלול
    getOrbitalData() {
        return {
            semiMajorAxis: this.orbital.semiMajorAxis,
            semiMinorAxis: this.orbital.semiMinorAxis,
            eccentricity: this.orbital.eccentricity,
            inclination: this.orbital.inclination,
            focalDistance: this.orbital.focalDistance,
            currentAnomaly: this.orbital.trueAnomaly,
            currentRadius: this.getDistanceFromSun()
        };
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
                distance: this.data.distance,
                period: this.data.orbitalPeriod,
                eccentricity: this.data.eccentricity,
                inclination: this.data.inclination,
                currentPosition: this.getPosition(),
                currentAnomaly: this.orbital.trueAnomaly
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
        // החזרת mesh הראשי לזיהוי לחיצות
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
            this.updateEllipticalPosition(0);
        }
    }

    // שמירת מצב נוכחי
    saveState() {
        return {
            name: this.name,
            position: this.group.position.clone(),
            rotation: this.mesh ? this.mesh.rotation.clone() : new THREE.Euler(),
            orbitalAnomaly: this.orbital.meanAnomaly,
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
            this.orbital.meanAnomaly = state.orbitalAnomaly || 0;
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
    calculateEllipticalPosition(angle, semiMajorAxis, eccentricity, inclination = 0) {
        // חישוב מרחק במסלול אליפטי
        const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
        
        return new THREE.Vector3(
            r * Math.cos(angle),
            r * Math.sin(angle) * Math.sin(inclination) * 0.1,
            r * Math.sin(angle) * Math.cos(inclination)
        );
    },
    
    // חישוב מהירות מסלול (חוק קפלר השלישי) - איטית יותר
    calculateOrbitalSpeed(distance) {
        return Math.sqrt(1 / distance) * 0.0002;  // הקטנה פי 5
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
