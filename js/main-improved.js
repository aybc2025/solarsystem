// מערכת השמש - אפליקציה משופרת עם פתרונות לכל הבעיות
class ImprovedSolarSystemApp {
    constructor() {
        this.isInitialized = false;
        this.isLoading = true;
        
        // רכיבי האפליקציה הראשיים
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.ui = null;
        this.infoPanel = null;
        
        // אובייקטים תלת ממדיים
        this.sun = null;
        this.planets = new Map();
        this.asteroidBelt = null;
        this.orbits = new Map();
        this.labels = new Map();
        
        // מצב האפליקציה
        this.state = {
            isPaused: false,
            timeScale: 1,
            selectedPlanet: null,
            currentView: 'solar-system',
            showOrbits: true,
            showLabels: true,
            showAsteroids: true,
            realisticMode: false
        };
        
        // מונה ביצועים
        this.performance = {
            lastTime: 0,
            frameCount: 0,
            fps: 0,
            lastFpsUpdate: 0
        };
        
        // הגדרות טעינה
        this.loadingProgress = {
            total: 100,
            loaded: 0,
            current: 'מאתחל...'
        };
        
        // אירועים
        this.eventListeners = new Map();
    }

    // אתחול האפליקציה
    async init() {
        try {
            console.log('🚀 Starting Improved Solar System PWA...');
            
            // אתחול מערכות בסיס
            await this.initializeBaseSystems();
            
            // יצירת סצנה תלת ממדית
            await this.create3DScene();
            
            // יצירת אובייקטים
            await this.createSolarSystemObjects();
            
            // הגדרת ממשק משתמש
            await this.setupUI();
            
            // התחלת לולאת רנדור
            this.startRenderLoop();
            
            // סיום טעינה
            this.finishLoading();
            
            this.isInitialized = true;
            console.log('✅ Improved Solar System PWA initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Solar System PWA:', error);
            this.showError('שגיאה באתחול האפליקציה: ' + error.message);
        }
    }

    // אתחול מערכות בסיס
    async initializeBaseSystems() {
        this.updateLoadingProgress('אתחול מערכות בסיס...', 5);
        
        // בדיקת תמיכה בWebGL
        if (!this.checkWebGLSupport()) {
            throw new Error('הדפדפן שלך אינו תומך בWebGL');
        }
        
        this.updateLoadingProgress('מערכות בסיס מוכנות', 15);
    }

    // בדיקת תמיכה בWebGL
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return context !== null;
        } catch (e) {
            return false;
        }
    }

    // יצירת סצנה תלת ממדית
    async create3DScene() {
        this.updateLoadingProgress('יוצר סצנה תלת-ממדית...', 25);
        
        try {
            // יצירת סצנה
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000000);
            
            // יצירת מצלמה עם זווית רחבה יותר
            this.camera = new THREE.PerspectiveCamera(
                60, // זווית רחבה יותר לראות יותר
                window.innerWidth / window.innerHeight, 
                0.1, 
                50000 // מרחק רחוק יותר לראות את כל המערכת
            );
            this.camera.position.set(400, 200, 400); // מיקום התחלתי רחוק יותר
            
            // יצירת renderer
            const canvas = document.getElementById('scene');
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: false 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // יצירת בקרות מצלמה
            await this.createCameraControls();
            
            // יצירת תאורה
            await this.createLighting();
            
            // יצירת שדה כוכבים
            await this.createStarfield();
            
            // הוספת מאזיני אירועים
            this.setupEventListeners();
            
            this.updateLoadingProgress('סצנה תלת-ממדית מוכנה', 40);
            
        } catch (error) {
            console.error('Failed to create 3D scene:', error);
            throw error;
        }
    }

    // יצירת בקרות מצלמה משופרות
    async createCameraControls() {
        try {
            if (typeof THREE.OrbitControls === 'function') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                console.log('✅ Using THREE.OrbitControls');
            } else {
                this.controls = this.createFallbackControls();
                console.log('⚠️ Using fallback controls');
            }
            
            // הגדרות משופרות לניווט
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enableRotate = true;
            this.controls.enablePan = true;
            
            // מגבלות זום משופרות לראות את כל המערכת
            if (this.controls.minDistance !== undefined) {
                this.controls.minDistance = 10;
                this.controls.maxDistance = 10000;
            }
            
            // מטרה ראשונית
            if (this.controls.target) {
                this.controls.target.set(0, 0, 0);
            }
            
        } catch (error) {
            console.warn('OrbitControls creation failed, using basic fallback:', error);
            this.controls = this.createBasicFallback();
        }
    }

    // יצירת בקרות fallback
    createFallbackControls() {
        const controls = {
            enabled: true,
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
            minDistance: 10,
            maxDistance: 10000,
            target: new THREE.Vector3(0, 0, 0),
            
            // מצב פנימי
            _spherical: new THREE.Spherical(),
            _sphericalDelta: new THREE.Spherical(),
            _scale: 1,
            
            update: () => {
                if (!controls.enabled) return;
                
                const offset = new THREE.Vector3();
                offset.copy(this.camera.position).sub(controls.target);
                
                controls._spherical.setFromVector3(offset);
                controls._spherical.theta += controls._sphericalDelta.theta;
                controls._spherical.phi += controls._sphericalDelta.phi;
                
                // הגבלות
                controls._spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, controls._spherical.phi));
                controls._spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, controls._spherical.radius));
                
                offset.setFromSpherical(controls._spherical);
                this.camera.position.copy(controls.target).add(offset);
                this.camera.lookAt(controls.target);
                
                // דעיכה
                if (controls.enableDamping) {
                    controls._sphericalDelta.theta *= (1 - controls.dampingFactor);
                    controls._sphericalDelta.phi *= (1 - controls.dampingFactor);
                }
            },
            
            dispose: () => {}
        };
        
        this.attachControlEvents(controls);
        return controls;
    }

    // חיבור אירועי בקרה
    attachControlEvents(controls) {
        const domElement = this.renderer.domElement;
        
        let isDragging = false;
        let previousMouse = { x: 0, y: 0 };
        
        // אירועי עכבר
        domElement.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouse = { x: event.clientX, y: event.clientY };
        });
        
        domElement.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            
            const deltaMove = {
                x: event.clientX - previousMouse.x,
                y: event.clientY - previousMouse.y
            };
            
            controls._sphericalDelta.theta -= deltaMove.x * 0.01;
            controls._sphericalDelta.phi += deltaMove.y * 0.01;
            
            previousMouse = { x: event.clientX, y: event.clientY };
        });
        
        domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // זום עם גלגלת - משופר
        domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (!controls.enableZoom) return;
            
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            controls._spherical.radius *= scale;
            controls._spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, controls._spherical.radius));
        });
        
        // תמיכה במגע למכשירים ניידים
        let touchStartPos = null;
        let touchStartDistance = null;
        
        domElement.addEventListener('touchstart', (event) => {
            event.preventDefault();
            
            if (event.touches.length === 1) {
                // מגע יחיד - סיבוב
                touchStartPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            } else if (event.touches.length === 2) {
                // שני מגעים - זום
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        
        domElement.addEventListener('touchmove', (event) => {
            event.preventDefault();
            
            if (event.touches.length === 1 && touchStartPos) {
                // סיבוב
                const deltaMove = {
                    x: event.touches[0].clientX - touchStartPos.x,
                    y: event.touches[0].clientY - touchStartPos.y
                };
                
                controls._sphericalDelta.theta -= deltaMove.x * 0.01;
                controls._sphericalDelta.phi += deltaMove.y * 0.01;
                
                touchStartPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            } else if (event.touches.length === 2 && touchStartDistance) {
                // זום
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const scale = distance / touchStartDistance;
                controls._spherical.radius /= scale;
                controls._spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, controls._spherical.radius));
                
                touchStartDistance = distance;
            }
        });
        
        domElement.addEventListener('touchend', (event) => {
            event.preventDefault();
            touchStartPos = null;
            touchStartDistance = null;
        });
    }

    // יצירת תאורה
    async createLighting() {
        // תאורה סביבתית עדינה
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // תאורת השמש
        const sunLight = new THREE.DirectionalLight(0xffffff, 2);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -500;
        sunLight.shadow.camera.right = 500;
        sunLight.shadow.camera.top = 500;
        sunLight.shadow.camera.bottom = -500;
        this.scene.add(sunLight);
        
        this.lights = { ambient: ambientLight, sun: sunLight };
    }

    // יצירת שדה כוכבים
    async createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 15000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for(let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // מיקום אקראי על כדור
            const radius = 8000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבע וריאבלי לכוכבים
            const intensity = 0.5 + Math.random() * 0.5;
            const colorVariation = Math.random();
            
            if (colorVariation < 0.7) {
                // כוכבים לבנים רגילים
                colors[i3] = intensity;
                colors[i3 + 1] = intensity;
                colors[i3 + 2] = intensity;
            } else if (colorVariation < 0.85) {
                // כוכבים כחולים
                colors[i3] = intensity * 0.7;
                colors[i3 + 1] = intensity * 0.8;
                colors[i3 + 2] = intensity;
            } else {
                // כוכבים אדומים/כתומים
                colors[i3] = intensity;
                colors[i3 + 1] = intensity * 0.7;
                colors[i3 + 2] = intensity * 0.4;
            }
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'starfield';
        this.scene.add(stars);
    }

    // יצירת אובייקטי מערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר כוכבי לכת...', 50);
        
        // יצירת השמש
        await this.createSun();
        
        // יצירת כוכבי הלכת עם צבעים מדויקים
        for (const [planetName, planetData] of Object.entries(PLANETS_DATA)) {
            if (planetName !== 'sun') {
                await this.createPlanet(planetName, planetData);
            }
        }
        
        // יצירת חגורת האסטרואידים
        await this.createAsteroidBelt();
        
        this.updateLoadingProgress('אובייקטים נוצרו בהצלחה', 80);
    }

    // יצירת השמש עם אפקטים
    async createSun() {
        const sunData = PLANETS_DATA.sun;
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 32, 32);
        
        // חומר מתקדם לשמש
        const material = new THREE.MeshBasicMaterial({ 
            color: PLANET_COLORS.sun.primary,
            emissive: PLANET_COLORS.sun.secondary,
            emissiveIntensity: 0.8
        });
        
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.name = 'sun';
        this.sun.position.set(0, 0, 0);
        this.scene.add(this.sun);
        
        // אפקט זוהר לשמש
        const glowGeometry = new THREE.SphereGeometry(sunData.scaledRadius * 1.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: PLANET_COLORS.sun.glow,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
        
        // הוספת אור נקודתי בשמש
        const sunPointLight = new THREE.PointLight(PLANET_COLORS.sun.primary, 1, 1000);
        sunPointLight.position.set(0, 0, 0);
        this.scene.add(sunPointLight);
    }

    // יצירת כוכב לכת עם צבעים מדויקים
    async createPlanet(planetName, planetData) {
        const colors = PLANET_COLORS[planetName];
        const geometry = new THREE.SphereGeometry(planetData.scaledRadius, 32, 32);
        
        // בחירת חומר לפי סוג הכוכב
        let material;
        if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(planetName)) {
            // ענקי גז - חומר מבריק יותר
            material = new THREE.MeshPhongMaterial({ 
                color: colors.primary,
                shininess: 30,
                transparent: planetName === 'saturn',
                opacity: planetName === 'saturn' ? 0.9 : 1.0
            });
        } else {
            // כוכבי לכת סלעיים
            material = new THREE.MeshLambertMaterial({ 
                color: colors.primary
            });
        }
        
        const planet = new THREE.Mesh(geometry, material);
        planet.name = planetName;
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // מיקום ראשוני
        const initialAngle = INITIAL_POSITIONS[planetName]?.angle || 0;
        planet.position.set(
            Math.cos(initialAngle) * planetData.scaledDistance,
            0,
            Math.sin(initialAngle) * planetData.scaledDistance
        );
        
        // הוספת נתונים למעקב
        planet.userData = {
            ...planetData,
            angle: initialAngle,
            orbitSpeed: this.calculateOrbitSpeed(planetData.orbitalPeriod),
            rotationSpeed: this.calculateRotationSpeed(planetData.rotationPeriod)
        };
        
        this.scene.add(planet);
        this.planets.set(planetName, planet);
        
        // יצירת מסלול
        this.createOrbit(planetName, planetData);
        
        // אפקטים מיוחדים
        await this.addSpecialEffects(planet, planetName, colors);
        
        // יצירת תווית
        this.createLabel(planetName, planetData);
    }

    // חישוב מהירות מסלול
    calculateOrbitSpeed(orbitalPeriod) {
        return (2 * Math.PI) / (orbitalPeriod * 0.1); // מותאם לאנימציה
    }

    // חישוב מהירות סיבוב
    calculateRotationSpeed(rotationPeriod) {
        if (!rotationPeriod) return 0.01;
        return (2 * Math.PI) / (Math.abs(rotationPeriod) * 10); // מותאם לאנימציה
    }

    // יצירת מסלול עם קווים רציפים
    createOrbit(planetName, planetData) {
        if (!this.state.showOrbits) return;
        
        const radius = planetData.scaledDistance;
        const segments = 128;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array((segments + 1) * 3);
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: PLANET_COLORS[planetName].primary,
            transparent: true,
            opacity: 0.4,
            linewidth: 2
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.name = `${planetName}_orbit`;
        this.scene.add(orbit);
        this.orbits.set(planetName, orbit);
    }

    // הוספת אפקטים מיוחדים
    async addSpecialEffects(planet, planetName, colors) {
        switch (planetName) {
            case 'earth':
                await this.addEarthEffects(planet, colors);
                break;
            case 'saturn':
                await this.addSaturnRings(planet, colors);
                break;
            case 'jupiter':
                await this.addJupiterBands(planet, colors);
                break;
            case 'mars':
                await this.addMarsPolarCaps(planet, colors);
                break;
            case 'uranus':
            case 'neptune':
                await this.addIceGiantEffects(planet, planetName, colors);
                break;
        }
    }

    // אפקטים של כדור הארץ
    async addEarthEffects(planet, colors) {
        // עננים
        const cloudGeometry = new THREE.SphereGeometry(planet.geometry.parameters.radius * 1.02, 32, 32);
        const cloudMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        clouds.name = 'earth_clouds';
        planet.add(clouds);
        
        // אטמוספירה
        const atmosphereGeometry = new THREE.SphereGeometry(planet.geometry.parameters.radius * 1.1, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    }

    // טבעות שבתאי
    async addSaturnRings(planet, colors) {
        const innerRadius = planet.geometry.parameters.radius * 1.5;
        const outerRadius = planet.geometry.parameters.radius * 2.8;
        
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const ringMaterial = new THREE.MeshLambertMaterial({
            color: PLANET_COLORS.saturn.rings,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = -Math.PI / 2;
        rings.rotation.z = Math.PI / 12; // נטייה קלה
        rings.name = 'saturn_rings';
        planet.add(rings);
    }

    // רצועות צדק
    async addJupiterBands(planet, colors) {
        // יצירת טקסטורה עם רצועות
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // רצועות צבעוניות
        const bands = [
            { y: 0, h: 20, color: '#e8dabd' },
            { y: 20, h: 15, color: '#d8ca9d' },
            { y: 35, h: 18, color: '#c8ba8d' },
            { y: 53, h: 22, color: '#b8a07d' },
            { y: 75, h: 25, color: '#a8906d' },
            { y: 100, h: 28, color: '#98805d' }
        ];
        
        bands.forEach(band => {
            ctx.fillStyle = band.color;
            ctx.fillRect(0, band.y, 256, band.h);
        });
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        planet.material.map = texture;
        planet.material.needsUpdate = true;
    }

    // כפות קרח של מאדים
    async addMarsPolarCaps(planet, colors) {
        // כפה צפונית
        const northCapGeometry = new THREE.SphereGeometry(planet.geometry.parameters.radius * 0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const northCap = new THREE.Mesh(northCapGeometry, capMaterial);
        northCap.position.y = planet.geometry.parameters.radius * 0.8;
        planet.add(northCap);
        
        // כפה דרומית
        const southCap = northCap.clone();
        southCap.position.y = -planet.geometry.parameters.radius * 0.8;
        southCap.rotation.x = Math.PI;
        planet.add(southCap);
    }

    // אפקטים של ענקי הקרח
    async addIceGiantEffects(planet, planetName, colors) {
        // אטמוספירה עבה יותר
        const atmosphereGeometry = new THREE.SphereGeometry(planet.geometry.parameters.radius * 1.15, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: colors.secondary,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
        
        // טבעות דקות לאורנוס ונפטון
        if (planetName === 'uranus' || planetName === 'neptune') {
            const ringGeometry = new THREE.RingGeometry(
                planet.geometry.parameters.radius * 1.8,
                planet.geometry.parameters.radius * 2.2,
                64
            );
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = planetName === 'uranus' ? Math.PI / 2 : -Math.PI / 6;
            planet.add(rings);
        }
    }

    // יצירת חגורת האסטרואידים
    async createAsteroidBelt() {
        if (!this.state.showAsteroids) return;
        
        const asteroidCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);
        const colors = new Float32Array(asteroidCount * 3);
        const sizes = new Float32Array(asteroidCount);
        
        const innerRadius = ASTEROID_BELT_DATA.scaledInnerRadius;
        const outerRadius = ASTEROID_BELT_DATA.scaledOuterRadius;
        
        for (let i = 0; i < asteroidCount; i++) {
            const i3 = i * 3;
            
            // מיקום רדיאלי
            const angle = Math.random() * Math.PI * 2;
            const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
            const height = (Math.random() - 0.5) * 10;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // צבע אפור-חום
            const colorVariation = 0.3 + Math.random() * 0.4;
            colors[i3] = colorVariation;
            colors[i3 + 1] = colorVariation * 0.8;
            colors[i3 + 2] = colorVariation * 0.6;
            
            // גודל אקראי
            sizes[i] = 0.5 + Math.random() * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.asteroidBelt = new THREE.Points(geometry, material);
        this.asteroidBelt.name = 'asteroidBelt';
        this.scene.add(this.asteroidBelt);
    }

    // יצירת תווית
    createLabel(planetName, planetData) {
        if (!this.state.showLabels) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // רקע שקוף עם מסגרת
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = PLANET_COLORS[planetName].primary;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 252, 60);
        
        // טקסט
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planetData.name, 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const label = new THREE.Sprite(material);
        label.scale.set(30, 7.5, 1);
        label.name = `${planetName}_label`;
        
        this.scene.add(label);
        this.labels.set(planetName, label);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 85);
        
        // כפתורי בקרה
        this.setupControlButtons();
        
        // פאנל מידע משופר
        this.infoPanel = new ImprovedInfoPanel();
        await this.infoPanel.init(this);
        
        // מד ביצועים
        this.setupPerformanceMonitor();
    }

    // הגדרת כפתורי בקרה משופרים
    setupControlButtons() {
        // כפתור השהה/נגן
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        // כפתור איפוס
        const resetBtn = document.getElementById('reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetView();
            });
        }
        
        // מהירות זמן
        const timeScaleSlider = document.getElementById('timeScale');
        if (timeScaleSlider) {
            timeScaleSlider.addEventListener('input', (event) => {
                this.setTimeScale(parseFloat(event.target.value));
            });
        }
        
        // כפתורי תצוגה
        this.setupToggleButtons();
        
        // כפתורי כוכבי לכת
        const planetBtns = document.querySelectorAll('.planet-btn');
        planetBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const planetName = event.target.dataset.planet;
                this.focusOnPlanet(planetName);
            });
        });
    }

    // הגדרת כפתורי החלפה
    setupToggleButtons() {
        const toggleButtons = [
            { id: 'showOrbits', property: 'showOrbits', action: () => this.toggleOrbits() },
            { id: 'showLabels', property: 'showLabels', action: () => this.toggleLabels() },
            { id: 'showAsteroids', property: 'showAsteroids', action: () => this.toggleAsteroids() },
            { id: 'realisticMode', property: 'realisticMode', action: () => this.toggleRealisticMode() }
        ];
        
        toggleButtons.forEach(({ id, property, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.state[property] = !this.state[property];
                    btn.classList.toggle('active', this.state[property]);
                    action();
                });
            }
        });
    }

    // הגדרת מד ביצועים
    setupPerformanceMonitor() {
        this.fpsCounter = document.getElementById('fpsCounter');
        this.objectCounter = document.getElementById('objectCount');
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // שינוי גודל חלון
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // מקשי קיצור
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // לחיצה על כוכבי לכת
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onPlanetClick(event);
        });
    }

    // טיפול במקשי קיצור
    handleKeyPress(event) {
        if (!this.isInitialized) return;
        
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                this.resetView();
                break;
            case 'KeyO':
                event.preventDefault();
                this.toggleOrbits();
                break;
            case 'KeyL':
                event.preventDefault();
                this.toggleLabels();
                break;
            case 'KeyA':
                event.preventDefault();
                this.toggleAsteroids();
                break;
            case 'KeyM':
                event.preventDefault();
                this.toggleRealisticMode();
                break;
            case 'Escape':
                event.preventDefault();
                this.deselectPlanet();
                break;
        }
    }

    // טיפול בלחיצה על כוכב לכת
    onPlanetClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // בדיקת חיתוך עם כוכבי לכת
        const planetsArray = Array.from(this.planets.values());
        if (this.sun) planetsArray.push(this.sun);
        
        const intersects = raycaster.intersectObjects(planetsArray);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            this.showPlanetInfo(clickedObject.name);
        }
    }

    // התחלת לולאת רנדור
    startRenderLoop() {
        const animate = (currentTime) => {
            if (!this.isInitialized) return;
            
            const deltaTime = currentTime - this.performance.lastTime;
            this.performance.lastTime = currentTime;
            
            // עדכון ביצועים
            this.updatePerformance(currentTime);
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // עדכון אנימציות
            if (!this.state.isPaused) {
                this.updateAnimations(deltaTime);
            }
            
            // עדכון תוויות
            this.updateLabels();
            
            // רנדור
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אנימציות
    updateAnimations(deltaTime) {
        const scaledDelta = deltaTime * this.state.timeScale * 0.0001;
        
        // סיבוב השמש
        if (this.sun) {
            this.sun.rotation.y += scaledDelta * 0.1;
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet, planetName) => {
            const userData = planet.userData;
            
            // סיבוב במסלול
            userData.angle += userData.orbitSpeed * scaledDelta;
            planet.position.x = Math.cos(userData.angle) * userData.scaledDistance;
            planet.position.z = Math.sin(userData.angle) * userData.scaledDistance;
            
            // סיבוב עצמי
            planet.rotation.y += userData.rotationSpeed * scaledDelta;
            
            // אנימציות מיוחדות
            this.updateSpecialAnimations(planet, planetName, scaledDelta);
        });
        
        // סיבוב חגורת האסטרואידים
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += scaledDelta * 0.02;
        }
    }

    // עדכון אנימציות מיוחדות
    updateSpecialAnimations(planet, planetName, deltaTime) {
        // עננים של כדור הארץ
        if (planetName === 'earth') {
            const clouds = planet.getObjectByName('earth_clouds');
            if (clouds) {
                clouds.rotation.y += deltaTime * 0.5; // עננים מסתובבים מהר יותר
            }
        }
        
        // טבעות שבתאי
        if (planetName === 'saturn') {
            const rings = planet.getObjectByName('saturn_rings');
            if (rings) {
                rings.rotation.z += deltaTime * 0.1;
            }
        }
    }

    // עדכון תוויות
    updateLabels() {
        this.labels.forEach((label, planetName) => {
            const planet = this.planets.get(planetName);
            if (planet && label && this.state.showLabels) {
                label.position.copy(planet.position);
                label.position.y += planet.geometry.parameters.radius * 2;
            }
        });
    }

    // החלפת מצב השהיה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        const btn = document.getElementById('playPause');
        if (btn) {
            btn.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
    }

    // הגדרת מהירות זמן
    setTimeScale(scale) {
        this.state.timeScale = Math.max(0.1, Math.min(10, scale));
        const valueSpan = document.getElementById('timeScaleValue');
        if (valueSpan) {
            valueSpan.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
    }

    // איפוס תצוגה
    resetView() {
        this.camera.position.set(400, 200, 400);
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
        }
        this.camera.lookAt(0, 0, 0);
        
        this.deselectPlanet();
    }

    // החלפת תצוגת מסלולים
    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        this.orbits.forEach(orbit => {
            orbit.visible = this.state.showOrbits;
        });
        
        const btn = document.getElementById('showOrbits');
        if (btn) btn.classList.toggle('active', this.state.showOrbits);
    }

    // החלפת תצוגת תוויות
    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        this.labels.forEach(label => {
            label.visible = this.state.showLabels;
        });
        
        const btn = document.getElementById('showLabels');
        if (btn) btn.classList.toggle('active', this.state.showLabels);
    }

    // החלפת תצוגת אסטרואידים
    toggleAsteroids() {
        this.state.showAsteroids = !this.state.showAsteroids;
        if (this.asteroidBelt) {
            this.asteroidBelt.visible = this.state.showAsteroids;
        }
        
        const btn = document.getElementById('showAsteroids');
        if (btn) btn.classList.toggle('active', this.state.showAsteroids);
    }

    // החלפת מצב ריאליסטי
    toggleRealisticMode() {
        this.state.realisticMode = !this.state.realisticMode;
        
        // שינוי גדלים למצב ריאליסטי
        this.planets.forEach((planet, planetName) => {
            const planetData = PLANETS_DATA[planetName];
            const newRadius = this.state.realisticMode ? 
                planetData.radius * PHYSICS_CONSTANTS.REALISTIC_SCALE_FACTOR : 
                planetData.scaledRadius;
            
            planet.scale.setScalar(newRadius / planetData.scaledRadius);
        });
        
        const btn = document.getElementById('realisticMode');
        if (btn) btn.classList.toggle('active', this.state.realisticMode);
    }

    // מיקוד על כוכב לכת
    focusOnPlanet(planetName) {
        let targetObject = null;
        let targetData = null;

        if (planetName === 'sun') {
            targetObject = this.sun;
            targetData = PLANETS_DATA.sun;
        } else {
            targetObject = this.planets.get(planetName);
            targetData = PLANETS_DATA[planetName];
        }

        if (targetObject && targetData) {
            const targetPosition = targetObject.position.clone();
            const distance = planetName === 'sun' ? 80 : Math.max(50, targetData.scaledRadius * 8);
            
            // חישוב מיקום מצלמה חדש
            const direction = new THREE.Vector3().subVectors(this.camera.position, targetPosition).normalize();
            const newPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
            
            // אנימציה חלקה למיקום החדש
            this.animateCameraTo(newPosition, targetPosition);
            
            // הצגת מידע
            this.showPlanetInfo(planetName);
        }
    }

    // אנימציה של המצלמה
    animateCameraTo(newPosition, newTarget) {
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target ? this.controls.target.clone() : new THREE.Vector3();
        
        let progress = 0;
        const duration = 2000; // 2 שניות
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            progress = Math.min((currentTime - startTime) / duration, 1);
            
            // easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // אינטרפולציה של מיקום
            this.camera.position.lerpVectors(startPosition, newPosition, eased);
            
            // אינטרפולציה של מטרה
            if (this.controls.target) {
                this.controls.target.lerpVectors(startTarget, newTarget, eased);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // הצגת מידע על כוכב לכת
    showPlanetInfo(planetName) {
        if (this.infoPanel) {
            this.infoPanel.showPlanetInfo(planetName);
        }
        this.state.selectedPlanet = planetName;
    }

    // ביטול בחירת כוכב לכת
    deselectPlanet() {
        if (this.infoPanel) {
            this.infoPanel.hide();
        }
        this.state.selectedPlanet = null;
    }

    // עדכון ביצועים
    updatePerformance(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime > this.performance.lastFpsUpdate + 1000) {
            this.performance.fps = Math.round(this.performance.frameCount * 1000 / (currentTime - this.performance.lastFpsUpdate));
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            if (this.fpsCounter) {
                this.fpsCounter.textContent = this.performance.fps;
            }
            
            if (this.objectCounter) {
                this.objectCounter.textContent = this.scene.children.length;
            }
        }
    }

    // טיפול בשינוי גודל
    handleResize() {
        const { innerWidth, innerHeight } = window;
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
    }

    // עדכון התקדמות טעינה
    updateLoadingProgress(text, percentage) {
        this.loadingProgress.current = text;
        this.loadingProgress.loaded = percentage;
        
        const loadingText = document.getElementById('loadingText');
        const progressBar = document.getElementById('loadingProgress');
        
        if (loadingText) loadingText.textContent = text;
        if (progressBar) progressBar.style.width = percentage + '%';
        
        console.log(`${percentage}%: ${text}`);
    }

    // סיום טעינה
    finishLoading() {
        this.updateLoadingProgress('מוכן!', 100);
        
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                loading.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 500);
            }
            this.isLoading = false;
        }, 500);
    }

    // הצגת שגיאה
    showError(message) {
        const existing = document.querySelector('.error-message');
        if (existing) existing.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>שגיאה באפליקציה</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn primary">טען מחדש</button>
        `;
        document.body.appendChild(errorDiv);
        
        // הסתר מסך טעינה
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    // קבלת מידע על מצב האפליקציה
    getState() {
        return {
            ...this.state,
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
            performance: { ...this.performance },
            loadingProgress: { ...this.loadingProgress }
        };
    }

    // פונקציית דיבוג
    debug() {
        console.group('🌍 Improved Solar System App Debug Info');
        console.log('State:', this.getState());
        console.log('Scene children:', this.scene?.children.length);
        console.log('Planets:', Array.from(this.planets.keys()));
        console.log('Camera position:', this.camera?.position);
        console.log('Controls type:', this.controls?.constructor.name);
        console.log('Performance:', this.performance);
        console.groupEnd();
    }

    // ניקוי משאבים
    dispose() {
        this.isInitialized = false;
        
        // ניקוי אובייקטים תלת ממדיים
        this.planets.forEach(planet => {
            if (planet.geometry) planet.geometry.dispose();
            if (planet.material) planet.material.dispose();
        });
        this.planets.clear();
        
        this.orbits.forEach(orbit => {
            if (orbit.geometry) orbit.geometry.dispose();
            if (orbit.material) orbit.material.dispose();
        });
        this.orbits.clear();
        
        this.labels.forEach(label => {
            if (label.geometry) label.geometry.dispose();
            if (label.material) label.material.dispose();
        });
        this.labels.clear();
        
        if (this.sun) {
            if (this.sun.geometry) this.sun.geometry.dispose();
            if (this.sun.material) this.sun.material.dispose();
        }
        
        if (this.asteroidBelt) {
            if (this.asteroidBelt.geometry) this.asteroidBelt.geometry.dispose();
            if (this.asteroidBelt.material) this.asteroidBelt.material.dispose();
        }
        
        // ניקוי בקרות
        if (this.controls && this.controls.dispose) {
            this.controls.dispose();
        }
        
        // ניקוי renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('🧹 Improved Solar System App disposed');
    }
}

// פאנל מידע משופר
class ImprovedInfoPanel {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.currentPlanet = null;
    }

    async init(app) {
        this.app = app;
        this.panel = document.getElementById('infoPanel');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('closeInfo');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // לחיצה מחוץ לפאנל
        if (this.panel) {
            this.panel.addEventListener('click', (event) => {
                if (event.target === this.panel) {
                    this.hide();
                }
            });
        }

        // מקש Escape
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    showPlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData || !this.panel) return;

        this.currentPlanet = planetName;
        this.updatePlanetContent(planetData);
        this.show();
    }

    updatePlanetContent(planetData) {
        // עדכון שם
        const nameElement = document.getElementById('planetName');
        if (nameElement) {
            nameElement.textContent = planetData.name;
        }

        // עדכון תצוגה מקדימה
        this.updatePlanetPreview(planetData);

        // עדכון נתונים
        this.updatePlanetData(planetData);

        // עדכון תיאור
        const descElement = document.getElementById('planetDescription');
        if (descElement) {
            descElement.textContent = planetData.description;
        }

        // עדכון עובדות מעניינות
        this.updateInterestingFacts(planetData);
    }

    updatePlanetPreview(planetData) {
        const preview = document.getElementById('planetPreview');
        if (!preview) return;

        preview.innerHTML = '';
        const planetDiv = document.createElement('div');
        planetDiv.style.cssText = `
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto;
            background: radial-gradient(circle at 30% 30%, ${this.getPlanetColor(this.currentPlanet, 'light')}, ${this.getPlanetColor(this.currentPlanet, 'dark')});
            box-shadow: 0 0 20px ${this.getPlanetColor(this.currentPlanet, 'glow')};
            animation: planetRotate 10s linear infinite;
        `;

        preview.appendChild(planetDiv);
    }

    getPlanetColor(planetName, variant) {
        const colors = PLANET_COLORS[planetName];
        if (!colors) return '#888888';

        switch (variant) {
            case 'light': return `#${colors.primary.toString(16).padStart(6, '0')}dd`;
            case 'dark': return `#${colors.primary.toString(16).padStart(6, '0')}88`;
            case 'glow': return `#${colors.primary.toString(16).padStart(6, '0')}44`;
            default: return `#${colors.primary.toString(16).padStart(6, '0')}`;
        }
    }

    updatePlanetData(planetData) {
        const dataContainer = document.getElementById('planetData');
        if (!dataContainer) return;

        dataContainer.innerHTML = '';

        const dataItems = [
            { label: 'מרחק מהשמש', value: this.formatDistance(planetData.distance) },
            { label: 'רדיוס', value: this.formatRadius(planetData.radius) },
            { label: 'מסה', value: this.formatMass(planetData.mass) },
            { label: 'תקופת מסלול', value: this.formatPeriod(planetData.orbitalPeriod) },
            { label: 'תקופת סיבוב', value: this.formatRotation(planetData.rotationPeriod) },
            { label: 'טמפרטורה', value: this.formatTemperature(planetData.temperature) },
            { label: 'ירחים', value: planetData.moons || 0 }
        ];

        dataItems.forEach(item => {
            if (item.value) {
                const dataItem = document.createElement('div');
                dataItem.className = 'data-item';
                dataItem.innerHTML = `
                    <span class="label">${item.label}:</span>
                    <span class="value">${item.value}</span>
                `;
                dataContainer.appendChild(dataItem);
            }
        });
    }

    updateInterestingFacts(planetData) {
        const factsContainer = document.getElementById('interestingFacts');
        const factsList = document.getElementById('factsList');
        
        if (!factsContainer || !factsList || !planetData.facts) return;

        factsList.innerHTML = '';
        planetData.facts.forEach(fact => {
            const li = document.createElement('li');
            li.textContent = fact;
            factsList.appendChild(li);
        });

        factsContainer.style.display = 'block';
    }

    formatDistance(distance) {
        if (!distance) return 'במרכז המערכת';
        return InfoUtils.formatDistance(distance);
    }

    formatRadius(radius) {
        if (!radius) return 'לא זמין';
        return InfoUtils.formatDistance(radius);
    }

    formatMass(mass) {
        if (!mass) return 'לא זמין';
        return InfoUtils.formatMass(mass);
    }

    formatPeriod(period) {
        if (!period) return 'לא זמין';
        return InfoUtils.formatPeriod(period);
    }

    formatRotation(rotation) {
        if (!rotation) return 'לא זמין';
        if (rotation < 0) return `${InfoUtils.formatPeriod(Math.abs(rotation))} (לאחור)`;
        return InfoUtils.formatPeriod(rotation);
    }

    formatTemperature(temp) {
        if (!temp) return 'לא זמין';
        return InfoUtils.formatTemperature(temp);
    }

    show() {
        if (!this.panel || this.isVisible) return;
        this.isVisible = true;
        this.panel.classList.remove('hidden');
        this.panel.style.display = 'block';
    }

    hide() {
        if (!this.panel || !this.isVisible) return;
        this.isVisible = false;
        this.panel.classList.add('hidden');
        setTimeout(() => {
            this.panel.style.display = 'none';
        }, 300);
        
        this.currentPlanet = null;
        if (this.app) {
            this.app.state.selectedPlanet = null;
        }
    }
}

// אתחול האפליקציה כאשר הDOM מוכן
let solarSystemApp = null;

// הוספת animation לתצוגה מקדימה של כוכבי הלכת
const style = document.createElement('style');
style.textContent = `
    @keyframes planetRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ייצוא לשימוש במודולים אחרים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImprovedSolarSystemApp, ImprovedInfoPanel };
}
