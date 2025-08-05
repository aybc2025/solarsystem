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
                if (typeof SolarSystemPlanet !== 'undefined' && typeof PLANETS_DATA !== 'undefined') {
                    const planet = new SolarSystemPlanet(planetName);
                    await planet.init();
                    
                    const planetMesh = planet.createMesh();
                    this.scene.add(planetMesh);
                    this.planets.set(planetName, planetMesh);
                    
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
        
        // יצירת חגורת האסטרואידים (אופציונלי)
        try {
            if (typeof SolarSystemAsteroidBelt !== 'undefined') {
                this.asteroidBelt = new SolarSystemAsteroidBelt();
                const beltMesh = await this.asteroidBelt.create();
                this.scene.add(beltMesh);
            }
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
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
        
        this.scene.add(sunMesh);
        this.sun = { mesh: sunMesh, update: () => {} };
    }

    // יצירת כוכב לכת פשוט כפתרון חלופי
    createSimplePlanet(planetName) {
        // נתונים בסיסיים לכוכבי לכת
        const planetData = {
            mercury: { radius: 2, distance: 50, color: 0x8c7853 },
            venus: { radius: 3, distance: 70, color: 0xffc649 },
            earth: { radius: 4, distance: 100, color: 0x6b93d6 },
            mars: { radius: 3, distance: 130, color: 0xcd5c5c },
            jupiter: { radius: 12, distance: 200, color: 0xd8ca9d },
            saturn: { radius: 10, distance: 270, color: 0xfad5a5 },
            uranus: { radius: 6, distance: 340, color: 0x4fd0e7 },
            neptune: { radius: 6, distance: 410, color: 0x4b70dd }
        };
        
        const data = planetData[planetName];
        if (!data) return;
        
        const geometry = new THREE.SphereGeometry(data.radius, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: data.color });
        
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = planetName;
        
        // מיקום במסלול
        const angle = Math.random() * Math.PI * 2;
        planetMesh.position.set(
            Math.cos(angle) * data.distance,
            0,
            Math.sin(angle) * data.distance
        );
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, { scaledDistance: data.distance });
    }

    // יצירת מסלול לכוכב לכת
    createOrbit(planetName, planetData) {
        const radius = planetData.scaledDistance || 50;
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
        
        // אתחול פאנל מידע
        if (typeof InfoPanel !== 'undefined') {
            this.infoPanel = new InfoPanel();
            await this.infoPanel.init();
        }
        
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

    // עדכון אובייקטים
    updateObjects(deltaTime) {
        const scaledDelta = deltaTime * this.state.timeScale;
        
        // עדכון השמש
        if (this.sun && this.sun.update) {
            this.sun.update(scaledDelta);
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet) => {
            if (planet.update) {
                planet.update(scaledDelta);
            } else {
                // סיבוב בסיסי
                planet.rotation.y += scaledDelta * 0.001;
            }
        });
        
        // עדכון חגורת אסטרואידים
        if (this.asteroidBelt && this.asteroidBelt.update) {
            this.asteroidBelt.update(scaledDelta);
        }
    }

    // עדכון FPS
    updateFPS(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = this.performance.frameCount;
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
        const planet = this.planets.get(planetName);
        if (!planet || !this.camera) return;
        
        const planetPosition = planet.position.clone();
        const distance = planetName === 'sun' ? 100 : 50;
        
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

    // ניקוי משאבים
    dispose() {
        // ניקוי אובייקטים
        if (this.sun && this.sun.dispose) this.sun.dispose();
        this.planets.forEach(planet => {
            if (planet.dispose) planet.dispose();
        });
        
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
