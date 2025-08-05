// מערכת השמש - אפליקציה משופרת עם פתרונות לכל הבעיות וחגורת אסטרואידים
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
            
            // קבלת canvas שכבר קיים ב-HTML
            const canvas = document.getElementById('scene');
            if (!canvas) {
                throw new Error('Canvas element with id "scene" not found in HTML');
            }
            
            // יצירת renderer עם הcanvas הקיים
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
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
            // נסה קודם את THREE.OrbitControls הרשמי
            if (typeof THREE.OrbitControls === 'function') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                console.log('✅ Using THREE.OrbitControls');
            } else {
                // אם לא זמין, השתמש ב-fallback
                this.controls = window.createFallbackOrbitControls(this.camera, this.renderer.domElement);
                console.log('⚠️ Using fallback controls');
            }
            
            // הגדרות משופרות לניווט
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enableRotate = true;
            this.controls.enablePan = true;
            
            // הגבלות זום
            if (this.controls.minDistance !== undefined) {
                this.controls.minDistance = 10;
                this.controls.maxDistance = 2000;
            }
            
            // מקלדת - מאזינים מותאמים למובייל
            this.setupKeyboardControls();
            
        } catch (error) {
            console.warn('Failed to setup camera controls:', error);
            // המשך בלי בקרות - לא כשל קריטי
        }
    }

    // הגדרת בקרות מקלדת
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.resetView();
                    break;
            }
        });
    }

    // יצירת תאורה
    async createLighting() {
        this.updateLoadingProgress('יוצר תאורה...', 30);
        
        // אור שמש מרכזי
        const sunLight = new THREE.PointLight(0xffffff, 1, 10000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // אור סביבתי חלש
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
    }

    // יצירת שדה כוכבים
    async createStarfield() {
        this.updateLoadingProgress('יוצר שדה כוכבים...', 35);
        
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        
        for(let i = 0; i < starCount; i++) {
            const radius = 10000;
            const i3 = i * 3;
            
            // מיקום אקראי על כדור
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    // יצירת אובייקטים במערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר השמש...', 45);
        
        // יצירת השמש
        if (typeof SolarSystemSun !== 'undefined') {
            this.sun = new SolarSystemSun();
            const sunMesh = await this.sun.create();
            this.scene.add(sunMesh);
        } else {
            // יצירת שמש פשוטה אם המחלקה לא קיימת
            this.createSimpleSun();
        }
        
        this.updateLoadingProgress('יוצר כוכבי לכת...', 55);
        
        // יצירת כוכבי הלכת
        const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        for (const planetName of planetNames) {
            try {
                if (typeof SolarSystemPlanet !== 'undefined') {
                    const planet = new SolarSystemPlanet(planetName);
                    await planet.init();
                    
                    const planetMesh = planet.createMesh();
                    this.scene.add(planetMesh);
                    this.planets.set(planetName, planet); // שמירת האובייקט המלא
                    
                    // יצירת מסלול
                    this.createOrbit(planetName, planet.data);
                } else {
                    // יצירת כוכב לכת פשוט אם המחלקה לא קיימת
                    this.createSimplePlanet(planetName);
                }
                
            } catch (error) {
                console.warn(`Failed to create planet ${planetName}:`, error);
                // המשך גם אם כוכב לכת אחד נכשל
            }
        }
        
        this.updateLoadingProgress('יוצר חגורת אסטרואידים...', 75);
        
        // יצירת חגורת האסטרואידים - תמיד ליצור
        await this.createAsteroidBelt();
    }

    // יצירת חגורת אסטרואידים פשוטה ויעילה
    async createAsteroidBelt() {
        try {
            console.log('Creating asteroid belt...');
            
            // פרמטרי חגורת האסטרואידים
            const innerRadius = 180; // בין מאדים לצדק
            const outerRadius = 280;
            const asteroidCount = 3000; // מספר אסטרואידים
            
            // יצירת גיאומטריה לאסטרואידים
            const positions = new Float32Array(asteroidCount * 3);
            const colors = new Float32Array(asteroidCount * 3);
            const sizes = new Float32Array(asteroidCount);
            
            for (let i = 0; i < asteroidCount; i++) {
                const i3 = i * 3;
                
                // מיקום אקראי בחגורה
                const angle = Math.random() * Math.PI * 2;
                const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                
                // הוספת רעש לגובה (חגורה לא שטוחה לגמרי)
                const height = (Math.random() - 0.5) * 20;
                
                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = height;
                positions[i3 + 2] = Math.sin(angle) * radius;
                
                // צבעים משתנים - חום, אפור, כתום
                const colorVariant = Math.random();
                if (colorVariant < 0.4) {
                    // אפור כהה
                    colors[i3] = 0.3 + Math.random() * 0.2;     // R
                    colors[i3 + 1] = 0.3 + Math.random() * 0.2; // G
                    colors[i3 + 2] = 0.3 + Math.random() * 0.2; // B
                } else if (colorVariant < 0.7) {
                    // חום
                    colors[i3] = 0.4 + Math.random() * 0.3;     // R
                    colors[i3 + 1] = 0.25 + Math.random() * 0.2; // G
                    colors[i3 + 2] = 0.1 + Math.random() * 0.15; // B
                } else {
                    // כתום-אדום (אסטרואידים עשירים בברזל)
                    colors[i3] = 0.6 + Math.random() * 0.3;     // R
                    colors[i3 + 1] = 0.3 + Math.random() * 0.2; // G
                    colors[i3 + 2] = 0.1 + Math.random() * 0.1; // B
                }
                
                // גדלים משתנים
                sizes[i] = 0.5 + Math.random() * 2.5;
            }
            
            // יצירת גיאומטריה
            const asteroidGeometry = new THREE.BufferGeometry();
            asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            asteroidGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            // יצירת חומר לאסטרואידים
            const asteroidMaterial = new THREE.PointsMaterial({
                size: 1.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true // גודל יקטן עם המרחק
            });
            
            // יצירת מערכת הנקודות
            this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
            this.asteroidBelt.name = 'asteroidBelt';
            
            // הוספת סיבוב עדין לחגורה
            this.asteroidBelt.userData = {
                rotationSpeed: 0.0001, // סיבוב איטי
                originalPositions: positions.slice() // שמירת מיקומים מקוריים
            };
            
            this.scene.add(this.asteroidBelt);
            
            // יצירת כמה אסטרואידים גדולים (קרס, וסטה, פלאס)
            await this.createMajorAsteroids();
            
            console.log('✅ Asteroid belt created successfully');
            
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
    }

    // יצירת אסטרואידים גדולים ומפורסמים
    async createMajorAsteroids() {
        const majorAsteroids = [
            { name: 'Ceres', radius: 3, distance: 220, angle: 0, color: 0x8b7765 },
            { name: 'Vesta', radius: 2, distance: 230, angle: Math.PI / 3, color: 0xa0522d },
            { name: 'Pallas', radius: 1.8, distance: 240, angle: Math.PI * 2/3, color: 0x696969 },
            { name: 'Hygiea', radius: 1.5, distance: 250, angle: Math.PI, color: 0x2f4f4f }
        ];
        
        majorAsteroids.forEach(asteroid => {
            // יצירת גיאומטריה לא סדירה
            const geometry = this.createIrregularAsteroidGeometry(asteroid.radius);
            const material = new THREE.MeshLambertMaterial({ 
                color: asteroid.color,
                roughness: 0.9
            });
            
            const asteroidMesh = new THREE.Mesh(geometry, material);
            asteroidMesh.name = asteroid.name;
            asteroidMesh.castShadow = true;
            asteroidMesh.receiveShadow = true;
            
            // מיקום במסלול
            asteroidMesh.position.set(
                Math.cos(asteroid.angle) * asteroid.distance,
                (Math.random() - 0.5) * 10, // גובה אקראי
                Math.sin(asteroid.angle) * asteroid.distance
            );
            
            // סיבוב אקראי
            asteroidMesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // הוספת נתוני מסלול
            asteroidMesh.userData = {
                angle: asteroid.angle,
                distance: asteroid.distance,
                rotationSpeed: (Math.random() - 0.5) * 0.02, // סיבוב אקראי
                orbitalSpeed: 0.0005 + Math.random() * 0.0003 // מהירות מסלול
            };
            
            this.scene.add(asteroidMesh);
        });
    }

    // יצירת גיאומטריה לא סדירה לאסטרואיד
    createIrregularAsteroidGeometry(baseRadius) {
        const geometry = new THREE.SphereGeometry(baseRadius, 8, 6);
        const positions = geometry.attributes.position.array;
        
        // עיוות הנקודות ליצירת צורה לא סדירה
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            
            // הוספת רעש לכל vertex
            const noise = 0.3 + Math.random() * 0.4; // 30%-70% מהרדיוס המקורי
            vertex.multiplyScalar(noise);
            
            positions[i] = vertex.x;
            positions[i + 1] = vertex.y;
            positions[i + 2] = vertex.z;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals(); // חישוב מחדש של הנורמלים
        
        return geometry;
    }

    // יצירת שמש פשוטה כפתרון חלופי
    createSimpleSun() {
        const geometry = new THREE.SphereGeometry(20, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffd700,
            emissive: 0xff8800,
            emissiveIntensity: 0.3
        });
        
        const sunMesh = new THREE.Mesh(geometry, material);
        sunMesh.name = 'sun';
        sunMesh.position.set(0, 0, 0);
        
        // אור נקודתי
        const sunLight = new THREE.PointLight(0xffffff, 1, 5000);
        sunLight.position.set(0, 0, 0);
        sunMesh.add(sunLight);
        
        this.scene.add(sunMesh);
        this.sun = { 
            mesh: sunMesh, 
            update: (deltaTime) => {
                sunMesh.rotation.y += deltaTime * 0.001;
            }
        };
    }

    // יצירת כוכב לכת פשוט כפתרון חלופי
    createSimplePlanet(planetName) {
        // נתונים בסיסיים מדויקים לכוכבי לכת
        const planetData = {
            mercury: { radius: 2.5, distance: 58, color: 0x8c7853, period: 88 },
            venus: { radius: 3.8, distance: 72, color: 0xffc649, period: 225 },
            earth: { radius: 4, distance: 100, color: 0x6b93d6, period: 365 },
            mars: { radius: 3.2, distance: 152, color: 0xcd5c5c, period: 687 },
            jupiter: { radius: 18, distance: 520, color: 0xd2b48c, period: 4333 },
            saturn: { radius: 15, distance: 954, color: 0xfad5a5, period: 10759 },
            uranus: { radius: 8, distance: 1916, color: 0x4fd0e7, period: 30687 },
            neptune: { radius: 7.8, distance: 3010, color: 0x4169e1, period: 60190 }
        };
        
        const data = planetData[planetName];
        if (!data) return;
        
        const geometry = new THREE.SphereGeometry(data.radius, 24, 24);
        const material = new THREE.MeshPhongMaterial({ color: data.color });
        
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = planetName;
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        
        // מיקום במסלול עם זוויות התחלה שונות
        const startAngles = {
            mercury: 0, venus: Math.PI/4, earth: Math.PI/2, mars: Math.PI*3/4,
            jupiter: Math.PI, saturn: Math.PI*5/4, uranus: Math.PI*3/2, neptune: Math.PI*7/4
        };
        
        const angle = startAngles[planetName] || Math.random() * Math.PI * 2;
        planetMesh.position.set(
            Math.cos(angle) * data.distance,
            0,
            Math.sin(angle) * data.distance
        );
        
        // הוספת נתוני מסלול לאובייקט
        planetMesh.userData = {
            angle: angle,
            distance: data.distance,
            orbitalSpeed: (Math.PI * 2) / (data.period * 2), // מהירות ייחודית
            rotationSpeed: 0.01 + Math.random() * 0.02, // סיבוב עצמי
            originalData: data
        };
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, data);
    }

    // יצירת מסלול לכוכב לכת
    createOrbit(planetName, planetData) {
        const radius = planetData.scaledDistance || planetData.distance || 50;
        const points = [];
        
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.name = `${planetName}_orbit`;
        this.scene.add(orbit);
        this.orbits.set(planetName, orbit);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 85);
        
        // אתחול בקרות ממשק
        if (typeof UIControls !== 'undefined') {
            this.ui = new UIControls();
            await this.ui.init(this);
        } else {
            // הגדרת בקרות בסיסיות
            this.setupBasicControls();
        }
        
        // הוספת מאזיני אירועים למקלדת
        this.setupEventListeners();
    }

    // הגדרת בקרות בסיסיות כחלופה
    setupBasicControls() {
        // כפתור השהיה/המשכה
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // כפתור איפוס
        const resetBtn = document.getElementById('resetView');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetView());
        }
        
        // בקרת מהירות זמן
        const timeSpeedSlider = document.getElementById('timeSpeed');
        if (timeSpeedSlider) {
            timeSpeedSlider.addEventListener('input', (e) => {
                this.state.timeScale = parseFloat(e.target.value);
                const valueDisplay = document.getElementById('timeScaleValue');
                if (valueDisplay) {
                    valueDisplay.textContent = this.state.timeScale.toFixed(1) + 'x';
                }
            });
        }
        
        // כפתורי כוכבי לכת
        const planetButtons = document.querySelectorAll('.planet-btn');
        planetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const planetName = btn.dataset.planet;
                this.focusOnPlanet(planetName);
            });
        });
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // התאמה לשינוי גודל חלון
        window.addEventListener('resize', () => this.onWindowResize());
        
        // מאזינים למקלדת
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // התנתקות מהעמוד
        window.addEventListener('beforeunload', () => this.dispose());
    }

    // התאמה לשינוי גודל חלון
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // טיפול באירועי מקלדת
    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                this.resetView();
                break;
        }
    }

    // התחלת לולאת רנדור
    startRenderLoop() {
        this.updateLoadingProgress('מתחיל רנדור...', 95);
        
        const animate = (currentTime) => {
            if (!this.isInitialized) return;
            
            // חישוב delta time
            const deltaTime = currentTime - this.performance.lastTime;
            this.performance.lastTime = currentTime;
            
            // עדכון FPS
            this.updateFPS(currentTime);
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // עדכון אובייקטים
            if (!this.state.isPaused) {
                this.updateObjects(deltaTime);
            }
            
            // רנדור
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
            
            // המשכת האנימציה
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אובייקטים עם מהירויות שונות
    updateObjects(deltaTime) {
        const scaledDelta = deltaTime * this.state.timeScale;
        
        // עדכון השמש
        if (this.sun && this.sun.update) {
            this.sun.update(scaledDelta);
        }
        
        // עדכון כוכבי הלכת עם מהירויות ייחודיות
        this.planets.forEach((planet, planetName) => {
            if (planet.update) {
                // מחלקה מלאה של כוכב לכת
                planet.update(scaledDelta);
            } else if (planet.userData) {
                // כוכב לכת פשוט - עדכון מסלול ידני
                planet.userData.angle += planet.userData.orbitalSpeed * scaledDelta * 0.001;
                
                const x = Math.cos(planet.userData.angle) * planet.userData.distance;
                const z = Math.sin(planet.userData.angle) * planet.userData.distance;
                planet.position.set(x, 0, z);
                
                // סיבוב עצמי
                planet.rotation.y += planet.userData.rotationSpeed * scaledDelta * 0.001;
            }
        });
        
        // עדכון חגורת האסטרואידים
        if (this.asteroidBelt && this.asteroidBelt.userData) {
            this.asteroidBelt.rotation.y += this.asteroidBelt.userData.rotationSpeed * scaledDelta;
        }
        
        // עדכון אסטרואידים גדולים
        this.scene.children.forEach(child => {
            if (child.name && ['Ceres', 'Vesta', 'Pallas', 'Hygiea'].includes(child.name)) {
                if (child.userData) {
                    // עדכון מסלול
                    child.userData.angle += child.userData.orbitalSpeed * scaledDelta * 0.001;
                    
                    const x = Math.cos(child.userData.angle) * child.userData.distance;
                    const z = Math.sin(child.userData.angle) * child.userData.distance;
                    child.position.x = x;
                    child.position.z = z;
                    
                    // סיבוב עצמי לא סדיר
                    child.rotation.x += child.userData.rotationSpeed * scaledDelta * 0.001;
                    child.rotation.y += child.userData.rotationSpeed * scaledDelta * 0.0007;
                    child.rotation.z += child.userData.rotationSpeed * scaledDelta * 0.0005;
                }
            }
        });
    }

    // עדכון FPS
    updateFPS(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = Math.round((this.performance.frameCount * 1000) / (currentTime - this.performance.lastFpsUpdate));
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            // עדכון תצוגת FPS
            const fpsCounter = document.getElementById('fpsCounter');
            if (fpsCounter) {
                fpsCounter.textContent = this.performance.fps;
            }
            
            // עדכון מספר אובייקטים
            const objectCount = document.getElementById('objectCount');
            if (objectCount && this.scene) {
                let count = 0;
                this.scene.traverse(() => count++);
                objectCount.textContent = count;
            }
        }
    }

    // עדכון התקדמות טעינה
    updateLoadingProgress(text, percent) {
        this.loadingProgress.current = text;
        this.loadingProgress.loaded = percent;
        
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    // השהיה/המשכה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
        
        const quickPause = document.getElementById('quickPause');
        if (quickPause) {
            quickPause.textContent = this.state.isPaused ? '▶️' : '⏸️';
        }
        
        console.log(this.state.isPaused ? 'Animation paused' : 'Animation resumed');
    }

    // איפוס תצוגה
    resetView() {
        if (this.camera && this.controls) {
            this.camera.position.set(400, 200, 400);
            this.camera.lookAt(0, 0, 0);
            
            if (this.controls.target) {
                this.controls.target.set(0, 0, 0);
            }
            
            console.log('View reset to default position');
        }
    }

    // התמקדות על כוכב לכת
    focusOnPlanet(planetName) {
        let planetObject = null;
        
        // חיפוש האובייקט (מחלקה מלאה או mesh פשוט)
        const planet = this.planets.get(planetName);
        if (planet) {
            if (planet.group && planet.group.position) {
                planetObject = planet.group; // מחלקה מלאה
            } else if (planet.position) {
                planetObject = planet; // mesh פשוט
            }
        }
        
        // אם לא נמצא, חפש בשמש
        if (!planetObject && planetName === 'sun' && this.sun) {
            if (this.sun.group && this.sun.group.position) {
                planetObject = this.sun.group;
            } else if (this.sun.mesh && this.sun.mesh.position) {
                planetObject = this.sun.mesh;
            }
        }
        
        if (!planetObject || !this.camera) {
            console.warn(`Planet ${planetName} not found for focus`);
            return;
        }
        
        const planetPosition = planetObject.position.clone();
        const distance = planetName === 'sun' ? 100 : 
                        ['jupiter', 'saturn'].includes(planetName) ? 80 :
                        ['uranus', 'neptune'].includes(planetName) ? 60 : 30;
        
        // מיקום המצלמה ליד כוכב הלכת
        const cameraPosition = planetPosition.clone();
        cameraPosition.add(new THREE.Vector3(distance, distance * 0.5, distance));
        
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(planetPosition);
        
        if (this.controls && this.controls.target) {
            this.controls.target.copy(planetPosition);
        }
        
        console.log(`Focused on ${planetName}`);
    }

    // סיום טעינה
    finishLoading() {
        this.updateLoadingProgress('מוכן!', 100);
        this.isLoading = false;
        
        // הסתרת מסך הטעינה
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.style.display = 'none', 500);
            }
        }, 500);
    }

    // הצגת שגיאה
    showError(message) {
        console.error('Solar System Error:', message);
        
        const existing = document.querySelector('.error-message');
        if (existing) existing.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>⚠️ שגיאה באפליקציה</h3>
            <p>${message}</p>
            <button onclick="location.reload()">🔄 טען מחדש</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // הצגת/הסתרת חגורת אסטרואידים
    toggleAsteroidBelt(visible = null) {
        if (visible === null) {
            this.state.showAsteroids = !this.state.showAsteroids;
        } else {
            this.state.showAsteroids = visible;
        }
        
        if (this.asteroidBelt) {
            this.asteroidBelt.visible = this.state.showAsteroids;
        }
        
        // עדכון אסטרואידים גדולים
        this.scene.children.forEach(child => {
            if (child.name && ['Ceres', 'Vesta', 'Pallas', 'Hygiea'].includes(child.name)) {
                child.visible = this.state.showAsteroids;
            }
        });
        
        console.log('Asteroid belt visibility:', this.state.showAsteroids);
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי אובייקטים
        if (this.sun && this.sun.dispose) this.sun.dispose();
        this.planets.forEach(planet => {
            if (planet.dispose) planet.dispose();
        });
        
        // ניקוי חגורת אסטרואידים
        if (this.asteroidBelt) {
            if (this.asteroidBelt.geometry) this.asteroidBelt.geometry.dispose();
            if (this.asteroidBelt.material) this.asteroidBelt.material.dispose();
        }
        
        // ניקוי סצנה
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) object.material.dispose();
            });
        }
        
        // ניקוי renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
    }
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
window.ImprovedSolarSystemApp = ImprovedSolarSystemApp;
