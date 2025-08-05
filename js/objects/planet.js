// אובייקט כוכב לכת גנרי במערכת השמש - מתוקן עם מהירויות וצבעים נכונים
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
        
        // פרמטרי מסלול
        this.orbital = {
            radius: 0,
            speed: 0,
            angle: Math.random() * Math.PI * 2, // זווית התחלה אקראית
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

    // נתונים מדויקים לכוכבי לכת עם צבעים וכל הפרטים
    getAccuratePlanetData(planetName) {
        const accurateData = {
            mercury: {
                name: 'כוכב חמה',
                nameEn: 'Mercury',
                radius: 2439.7,
                scaledRadius: 2.5,
                distance: 57.9,
                scaledDistance: 58,
                period: 88, // ימים
                rotationPeriod: 58.6, // ימים
                color: 0x8c7853, // אפור-חום
                surfaceTemp: 167,
                hasRings: false,
                moonCount: 0,
                description: 'הכוכב הקרוב ביותר לשמש, עם טמפרטורות קיצוניות'
            },
            venus: {
                name: 'נוגה',
                nameEn: 'Venus',
                radius: 6051.8,
                scaledRadius: 3.8,
                distance: 108.2,
                scaledDistance: 72,
                period: 225,
                rotationPeriod: -243, // סיבוב הפוך
                color: 0xffc649, // צהוב-כתום עז
                surfaceTemp: 464,
                hasRings: false,
                moonCount: 0,
                description: 'הכוכב החם ביותר עם אטמוספרה צפופה'
            },
            earth: {
                name: 'כדור הארץ',
                nameEn: 'Earth',
                radius: 6371,
                scaledRadius: 4,
                distance: 149.6,
                scaledDistance: 100,
                period: 365.25,
                rotationPeriod: 1,
                color: 0x6b93d6, // כחול ים
                surfaceTemp: 15,
                hasRings: false,
                moonCount: 1,
                description: 'הכוכב היחיד הידוע עם חיים'
            },
            mars: {
                name: 'מאדים',
                nameEn: 'Mars',
                radius: 3389.5,
                scaledRadius: 3.2,
                distance: 227.9,
                scaledDistance: 152,
                period: 687,
                rotationPeriod: 1.03,
                color: 0xcd5c5c, // אדום חלוד
                surfaceTemp: -65,
                hasRings: false,
                moonCount: 2,
                description: 'הכוכב האדום עם קוטבי קרח'
            },
            jupiter: {
                name: 'צדק',
                nameEn: 'Jupiter',
                radius: 69911,
                scaledRadius: 18,
                distance: 778.5,
                scaledDistance: 520,
                period: 4333, // 11.9 שנים
                rotationPeriod: 0.41, // סיבוב מהיר
                color: 0xd2b48c, // חום-כתום עם פסים
                surfaceTemp: -110,
                hasRings: true, // טבעות דקות
                moonCount: 95,
                description: 'ענק הגז הגדול ביותר במערכת השמש'
            },
            saturn: {
                name: 'שבתאי',
                nameEn: 'Saturn',
                radius: 58232,
                scaledRadius: 15,
                distance: 1432,
                scaledDistance: 954,
                period: 10759, // 29.5 שנים
                rotationPeriod: 0.45,
                color: 0xfad5a5, // צהוב חום בהיר
                surfaceTemp: -140,
                hasRings: true, // הטבעות הבולטות ביותר
                moonCount: 146,
                description: 'המפורסם בטבעותיו המרהיבות'
            },
            uranus: {
                name: 'אורנוס',
                nameEn: 'Uranus',
                radius: 25362,
                scaledRadius: 8,
                distance: 2867,
                scaledDistance: 1916,
                period: 30687, // 84 שנים
                rotationPeriod: -0.72, // סיבוב הפוך
                color: 0x4fd0e7, // כחול-ירוק (מתאן)
                surfaceTemp: -195,
                hasRings: true, // טבעות אנכיות
                moonCount: 28,
                description: 'ענק קרח שמסתובב על הצד'
            },
            neptune: {
                name: 'נפטון',
                nameEn: 'Neptune',
                radius: 24622,
                scaledRadius: 7.8,
                distance: 4515,
                scaledDistance: 3010,
                period: 60190, // 165 שנים
                rotationPeriod: 0.67,
                color: 0x4169e1, // כחול עמוק
                surfaceTemp: -200,
                hasRings: true, // טבעות דקות
                moonCount: 16,
                description: 'הכוכב הרחוק ביותר עם רוחות חזקות'
            }
        };
        
        return accurateData[planetName] || null;
    }

    // אתחול כוכב הלכת
    async init() {
        try {
            // חישוב פרמטרים פיזיקליים מדויקים
            this.calculateAccurateOrbitalParameters();
            
            // יצירת גיאומטריה ראשית
            await this.createGeometry();
            
            // טעינת טקסטורות (אופציונלי)
            await this.loadTextures();
            
            // יצירת חומרים עם צבעים מדויקים
            await this.createAccurateMaterials();
            
            // יצירת mesh ראשי
            await this.createMesh();
            
            // יצירת אפקטים ייחודיים לכוכב הלכת
            await this.createUniqueEffects();
            
            this.isInitialized = true;
            console.log(`✅ Planet ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize planet ${this.name}:`, error);
            // יצירת כוכב לכת פשוט כחלופה
            this.createSimplePlanet();
        }
    }

    // חישוב פרמטרים אורביטליים מדויקים - כל כוכב לכת מהירות שונה
    calculateAccurateOrbitalParameters() {
        // רדיוס מסלול
        this.orbital.radius = this.data.scaledDistance || 100;
        
        // מהירות מסלול מדויקת - הפוכה לתקופה (כוכבי לכת רחוקים איטיים יותר)
        this.orbital.speed = this.data.period ? 
            (Math.PI * 2) / (this.data.period * 2) : 0.001; // הפחתת המהירות הכללית
        
        // מהירות סיבוב עצמי מדויקת - לכל כוכב לכת קצב שונה
        this.orbital.rotationSpeed = this.data.rotationPeriod ? 
            (Math.PI * 2) / (Math.abs(this.data.rotationPeriod) * 50) : 0.001;
        
        // סיבוב הפוך לונוס ונוגה
        if (this.data.rotationPeriod < 0) {
            this.orbital.rotationSpeed = -this.orbital.rotationSpeed;
        }
        
        // רדיוס כוכב הלכת (בקנה מידה)
        this.settings.radius = this.data.scaledRadius || 
            Math.max(1, Math.log(this.data.radius || 1000) * 0.5);
            
        // זווית התחלה ייחודית לכל כוכב לכת (לא כולם בשורה)
        const startAngles = {
            mercury: 0,
            venus: Math.PI / 4,
            earth: Math.PI / 2,
            mars: Math.PI * 3/4,
            jupiter: Math.PI,
            saturn: Math.PI * 5/4,
            uranus: Math.PI * 3/2,
            neptune: Math.PI * 7/4
        };
        
        this.orbital.angle = startAngles[this.name] || Math.random() * Math.PI * 2;
        
        console.log(`${this.name} orbital params:`, {
            speed: this.orbital.speed,
            rotationSpeed: this.orbital.rotationSpeed,
            startAngle: this.orbital.angle,
            period: this.data.period
        });
    }

    // יצירת גיאומטריה
    async createGeometry() {
        // רזולוציה גבוהה יותר לכוכבי לכת גדולים
        const segments = this.settings.radius > 10 ? 64 : 32;
        
        this.geometry = new THREE.SphereGeometry(
            this.settings.radius,
            segments,
            segments
        );
        
        // חישוב טנגנטים לnormal mapping
        if (this.geometry.computeTangents) {
            this.geometry.computeTangents();
        }
    }

    // טעינת טקסטורות (אופציונלי)
    async loadTextures() {
        try {
            // טקסטורה פרוצדורלית ייחודית לכל כוכב לכת
            this.textures.surface = await this.createUniqueTexture();
            
        } catch (error) {
            console.warn(`Failed to create texture for ${this.name}, using fallback`);
            this.textures.surface = await this.createBasicTexture();
        }
    }

    // יצירת טקסטורה ייחודית לכל כוכב לכת
    async createUniqueTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // צבעי בסיס מדויקים לכל כוכב לכת
        const planetColors = {
            mercury: ['#8c7853', '#6b5d42', '#4a3f2e'], // אפור-חום
            venus: ['#ffc649', '#ffb732', '#e6a029'], // צהוב עז
            earth: ['#6b93d6', '#4682b4', '#2e5984'], // כחול עם ירוק
            mars: ['#cd5c5c', '#b22222', '#8b0000'], // אדום חלוד
            jupiter: ['#d2b48c', '#daa520', '#b8860b'], // חום עם פסים
            saturn: ['#fad5a5', '#f4a460', '#deb887'], // צהוב בהיר
            uranus: ['#4fd0e7', '#00ced1', '#008b8b'], // כחול-ירוק
            neptune: ['#4169e1', '#0000cd', '#191970'] // כחול עמוק
        };
        
        const colors = planetColors[this.name] || ['#888888', '#666666', '#444444'];
        
        // רקע בסיסי
        const gradient = ctx.createLinearGradient(0, 0, 512, 256);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);
        
        // תכונות ייחודיות לכל כוכב לכת
        this.addPlanetSpecificFeatures(ctx, colors);
        
        return new THREE.CanvasTexture(canvas);
    }

    // הוספת תכונות ייחודיות לכל כוכב לכת
    addPlanetSpecificFeatures(ctx, colors) {
        switch (this.name) {
            case 'earth':
                // יבשות ואוקיינוסים
                ctx.fillStyle = '#228b22'; // ירוק ליבשות
                for (let i = 0; i < 8; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 256;
                    const size = 20 + Math.random() * 40;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // עננים לבנים
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 256;
                    ctx.beginPath();
                    ctx.arc(x, y, 8 + Math.random() * 12, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'mars':
                // כתמי קוטבים לבנים
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(256, 20, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(256, 236, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // מכתשים כהים
                ctx.fillStyle = '#8b0000';
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 256;
                    ctx.beginPath();
                    ctx.arc(x, y, 2 + Math.random() * 6, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'jupiter':
                // פסי עננים אופקיים
                for (let i = 0; i < 12; i++) {
                    const y = (i / 12) * 256;
                    const color = i % 2 === 0 ? '#daa520' : '#b8860b';
                    ctx.fillStyle = color;
                    ctx.fillRect(0, y, 512, 256 / 12);
                }
                
                // הסופה הגדולה האדומה
                ctx.fillStyle = '#dc143c';
                ctx.beginPath();
                ctx.ellipse(150, 140, 25, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'saturn':
                // פסים חומים-צהובים
                for (let i = 0; i < 8; i++) {
                    const y = (i / 8) * 256;
                    const color = i % 2 === 0 ? '#fad5a5' : '#deb887';
                    ctx.fillStyle = color;
                    ctx.fillRect(0, y, 512, 256 / 8);
                }
                break;
                
            case 'uranus':
                // טקסטורה חלקה עם פסים עדינים
                for (let i = 0; i < 6; i++) {
                    const y = (i / 6) * 256;
                    ctx.fillStyle = i % 2 === 0 ? '#4fd0e7' : '#40b5cc';
                    ctx.fillRect(0, y, 512, 256 / 6);
                }
                break;
                
            case 'neptune':
                // כתמי סופה כהים
                ctx.fillStyle = '#191970';
                for (let i = 0; i < 5; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 256;
                    ctx.beginPath();
                    ctx.arc(x, y, 8 + Math.random() * 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
    }

    // יצירת חומרים מדויקים עם צבעים נכונים
    async createAccurateMaterials() {
        // פרמטרי חומר בסיסיים
        const materialParams = {
            color: this.data.color || 0xffffff
        };
        
        // הוספת טקסטורה אם קיימת
        if (this.textures.surface) {
            materialParams.map = this.textures.surface;
        }
        
        // בחירת חומר לפי סוג כוכב הלכת
        if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
            // ענקי גז - חומר עם זוהר עדין
            this.material = new THREE.MeshPhongMaterial({
                ...materialParams,
                shininess: 30,
                transparent: true,
                opacity: 0.95
            });
        } else if (this.name === 'earth') {
            // כדור הארץ - חומר עם השתקפויות מים
            this.material = new THREE.MeshPhongMaterial({
                ...materialParams,
                specular: 0x222222,
                shininess: 100 // השתקפות מהמים
            });
        } else if (this.name === 'venus') {
            // נוגה - חומר עם זוהר חזק (אטמוספרה צפופה)
            this.material = new THREE.MeshPhongMaterial({
                ...materialParams,
                emissive: new THREE.Color(0xffaa00).multiplyScalar(0.1),
                shininess: 80
            });
        } else {
            // כוכבי לכת סלעיים - חומר מט
            this.material = new THREE.MeshLambertMaterial(materialParams);
        }
    }

    // יצירת אפקטים ייחודיים לכל כוכב לכת
    async createUniqueEffects() {
        try {
            // אטמוספרה לכוכבי לכת מתאימים
            if (['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
                this.createPlanetAtmosphere();
            }
            
            // טבעות לכוכבי לכת המתאימים
            if (this.data.hasRings) {
                this.createPlanetRings();
            }
            
            // ירחים
            if (this.data.moonCount > 0) {
                this.createPlanetMoons();
            }
            
            // אפקטים מיוחדים
            this.createSpecialEffects();
            
        } catch (error) {
            console.warn(`Failed to create effects for ${this.name}:`, error);
        }
    }

    // יצירת אטמוספרה ייחודית לכל כוכב לכת
    createPlanetAtmosphere() {
        const atmosphereData = {
            venus: { color: 0xffcc00, opacity: 0.4, scale: 1.15 }, // צהוב עז
            earth: { color: 0x87ceeb, opacity: 0.2, scale: 1.1 },  // כחול שמיים
            mars: { color: 0xff6b47, opacity: 0.15, scale: 1.08 }, // אדום-כתום
            jupiter: { color: 0xd2691e, opacity: 0.3, scale: 1.2 }, // חום
            saturn: { color: 0xf4a460, opacity: 0.25, scale: 1.18 }, // צהוב-חום
            uranus: { color: 0x40e0d0, opacity: 0.2, scale: 1.12 },  // טורקיז
            neptune: { color: 0x4169e1, opacity: 0.25, scale: 1.15 } // כחול עמוק
        };
        
        const atmData = atmosphereData[this.name];
        if (!atmData) return;
        
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.settings.radius * atmData.scale, 
            24, 24
        );
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: atmData.color,
            transparent: true,
            opacity: atmData.opacity,
            side: THREE.BackSide
        });
        
        this.effects.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.effects.atmosphere);
        this.settings.atmosphereEnabled = true;
    }

    // יצירת טבעות ייחודיות לכל כוכב לכת
    createPlanetRings() {
        if (this.name === 'saturn') {
            // שבתאי - טבעות מרובות ועבות
            this.createSaturnRings();
        } else if (this.name === 'uranus') {
            // אורנוס - טבעות דקות ואנכיות
            this.createUranusRings();
        } else if (this.name === 'jupiter') {
            // צדק - טבעת דקה ובהירה
            this.createJupiterRings();
        } else if (this.name === 'neptune') {
            // נפטון - טבעות דקות וחלקיות
            this.createNeptuneRings();
        }
    }

    // טבעות שבתאי - מרובות ומפורטות
    createSaturnRings() {
        const ringGroups = [
            { inner: 1.2, outer: 1.5, opacity: 0.8, color: 0xc4b5a0 },
            { inner: 1.6, outer: 1.9, opacity: 0.6, color: 0xd4c5b0 },
            { inner: 2.0, outer: 2.3, opacity: 0.4, color: 0xe4d5c0 },
            { inner: 2.5, outer: 2.7, opacity: 0.3, color: 0xf4e5d0 }
        ];
        
        const ringsGroup = new THREE.Group();
        
        ringGroups.forEach((ring, index) => {
            const geometry = new THREE.RingGeometry(
                this.settings.radius * ring.inner,
                this.settings.radius * ring.outer,
                64
            );
            
            const material = new THREE.MeshBasicMaterial({
                color: ring.color,
                transparent: true,
                opacity: ring.opacity,
                side: THREE.DoubleSide
            });
            
            const ringMesh = new THREE.Mesh(geometry, material);
            ringMesh.rotation.x = Math.PI / 2; // אופקי
            ringsGroup.add(ringMesh);
        });
        
        this.effects.rings = ringsGroup;
        this.group.add(ringsGroup);
        this.settings.ringsEnabled = true;
    }

    // טבעות אורנוס - דקות ואנכיות
    createUranusRings() {
        const ringData = [
            { radius: 1.6, opacity: 0.4 },
            { radius: 1.65, opacity: 0.3 },
            { radius: 1.7, opacity: 0.35 },
            { radius: 1.8, opacity: 0.25 }
        ];
        
        const ringsGroup = new THREE.Group();
        
        ringData.forEach(ring => {
            const geometry = new THREE.RingGeometry(
                this.settings.radius * ring.radius,
                this.settings.radius * ring.radius + 0.5,
                32
            );
            
            const material = new THREE.MeshBasicMaterial({
                color: 0x4fd0e7,
                transparent: true,
                opacity: ring.opacity,
                side: THREE.DoubleSide
            });
            
            const ringMesh = new THREE.Mesh(geometry, material);
            ringMesh.rotation.z = Math.PI / 2; // אנכי (אורנוס מסתובב על הצד)
            ringsGroup.add(ringMesh);
        });
        
        this.effects.rings = ringsGroup;
        this.group.add(ringsGroup);
        this.settings.ringsEnabled = true;
    }

    // טבעות צדק - דקות וקשות לראיה
    createJupiterRings() {
        const geometry = new THREE.RingGeometry(
            this.settings.radius * 1.8,
            this.settings.radius * 2.2,
            32
        );
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x654321,
            transparent: true,
            opacity: 0.1, // קשות לראיה
            side: THREE.DoubleSide
        });
        
        this.effects.rings = new THREE.Mesh(geometry, material);
        this.effects.rings.rotation.x = Math.PI / 2;
        this.group.add(this.effects.rings);
        this.settings.ringsEnabled = true;
    }

    // טבעות נפטון - חלקיות
    createNeptuneRings() {
        const geometry = new THREE.RingGeometry(
            this.settings.radius * 1.4,
            this.settings.radius * 1.8,
            32
        );
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x191970,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        this.effects.rings = new THREE.Mesh(geometry, material);
        this.effects.rings.rotation.x = Math.PI / 2;
        this.group.add(this.effects.rings);
        this.settings.ringsEnabled = true;
    }

    // יצירת ירחים מדויקים
    createPlanetMoons() {
        const moonConfigs = this.getAccurateMoonData();
        
        moonConfigs.forEach((moon, index) => {
            const moonGeometry = new THREE.SphereGeometry(moon.radius, 8, 8);
            const moonMaterial = new THREE.MeshPhongMaterial({ 
                color: moon.color || 0xcccccc 
            });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            
            // מיקום הירח עם זווית ייחודית
            const angle = moon.startAngle || (index / moonConfigs.length) * Math.PI * 2;
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
                distance: moon.distance,
                name: moon.name
            };
            
            this.effects.moons.push(moonGroup);
            this.group.add(moonGroup);
        });
        
        if (moonConfigs.length > 0) {
            this.settings.moonsEnabled = true;
        }
    }

    // נתוני ירחים מדויקים לכל כוכב לכת
    getAccurateMoonData() {
        const moonData = {
            earth: [
                { name: 'הירח', radius: 1.2, distance: 15, speed: 0.02, color: 0xc0c0c0 }
            ],
            mars: [
                { name: 'פובוס', radius: 0.3, distance: 8, speed: 0.05, color: 0x8b7765 },
                { name: 'דימוס', radius: 0.2, distance: 12, speed: 0.025, color: 0x8b7765 }
            ],
            jupiter: [
                { name: 'יו', radius: 1.2, distance: 25, speed: 0.03, color: 0xffff99 },
                { name: 'אירופה', radius: 1.0, distance: 30, speed: 0.025, color: 0xe6e6fa },
                { name: 'גנימד', radius: 1.8, distance: 35, speed: 0.02, color: 0x696969 },
                { name: 'קליסטו', radius: 1.6, distance: 42, speed: 0.015, color: 0x2f4f4f }
            ],
            saturn: [
                { name: 'טיטאן', radius: 1.8, distance: 35, speed: 0.018, color: 0xdaa520 },
                { name: 'אנקלדוס', radius: 0.8, distance: 28, speed: 0.025, color: 0xffffff }
            ],
            uranus: [
                { name: 'טיטניה', radius: 0.9, distance: 22, speed: 0.02, color: 0x708090 },
                { name: 'אובירון', radius: 0.8, distance: 25, speed: 0.018, color: 0x696969 }
            ],
            neptune: [
                { name: 'טריטון', radius: 1.1, distance: 24, speed: -0.022, color: 0xd3d3d3 } // מסלול רטרוגרדי
            ]
        };
        
        return moonData[this.name] || [];
    }

    // אפקטים מיוחדים לכוכבי לכת ספציפיים
    createSpecialEffects() {
        if (this.name === 'jupiter') {
            // הסופה הגדולה האדומה
            this.createGreatRedSpot();
        } else if (this.name === 'saturn') {
            // זוהר מיוחד לטבעות
            this.enhanceRings();
        }
    }

    // הסופה הגדולה האדומה של צדק
    createGreatRedSpot() {
        const spotGeometry = new THREE.SphereGeometry(this.settings.radius * 0.3, 16, 16);
        const spotMaterial = new THREE.MeshBasicMaterial({
            color: 0xdc143c,
            transparent: true,
            opacity: 0.8
        });
        
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.position.set(this.settings.radius * 0.9, 0, 0);
        this.group.add(spot);
    }

    // שיפור טבעות שבתאי
    enhanceRings() {
        if (this.effects.rings) {
            // הוספת זוהר עדין לטבעות
            this.effects.rings.children.forEach(ring => {
                ring.material.emissive = new THREE.Color(0xffd700);
                ring.material.emissiveIntensity = 0.05;
            });
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

    // עדכון אנימציה עם מהירויות מדויקות
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון מיקום במסלול - מהירות ייחודית לכל כוכב לכת
        this.orbital.angle += this.orbital.speed * deltaTime * 0.001;
        this.updateOrbitalPosition();
        
        // סיבוב עצמי - מהירות ייחודית לכל כוכב לכת
        this.animation.rotationAngle += this.orbital.rotationSpeed * deltaTime * 0.001;
        if (this.mesh) {
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
        
        // עדכון אטמוספרה
        if (this.effects.atmosphere) {
            const pulse = Math.sin(this.animation.time * 0.001) * 0.1 + 0.9;
            this.effects.atmosphere.material.opacity = this.effects.atmosphere.material.opacity * pulse;
        }
        
        // עדכון ירחים עם מהירויות שונות
        this.effects.moons.forEach(moonGroup => {
            const userData = moonGroup.userData;
            userData.angle += userData.speed * deltaTime * 0.001;
            
            const x = Math.cos(userData.angle) * userData.distance;
            const z = Math.sin(userData.angle) * userData.distance;
            
            if (moonGroup.children[0]) {
                moonGroup.children[0].position.set(x, 0, z);
            }
        });
        
        // עדכון טבעות עם סיבוב עדין
        if (this.effects.rings) {
            if (this.name === 'saturn') {
                this.effects.rings.rotation.z += deltaTime * 0.0001;
            } else if (this.name === 'uranus') {
                this.effects.rings.rotation.y += deltaTime * 0.0002; // אנכי
            }
        }
    }

    // טקסטורה בסיסית
    async createBasicTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = `#${this.data.color.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 256, 256);
        
        return new THREE.CanvasTexture(canvas);
    }

    // החזרת האובייקט הראשי
    getMesh() {
        return this.group;
    }

    // הגדרת מצב ריאליסטי
    setRealisticScale(enabled) {
        this.settings.realisticScale = enabled;
        this.calculateAccurateOrbitalParameters();
        
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
            if (Array.isArray(this.effects[effectName])) {
                this.effects[effectName].forEach(effect => {
                    effect.visible = visible;
                });
            } else {
                this.effects[effectName].visible = visible;
            }
        }
    }

    // קבלת מידע מפורט על כוכב הלכת
    getPlanetInfo() {
        return {
            name: this.name,
            displayName: this.data.name,
            englishName: this.data.nameEn,
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
            isInitialized: this.isInitialized,
            position: this.group.position.clone()
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
