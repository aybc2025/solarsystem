// מערכת השמש - נקודת כניסה ראשית לאפליקציה
// Solar System PWA - Main Application Entry Point

class SolarSystemApp {
    constructor() {
        this.isInitialized = false;
        this.isLoading = true;
        
        // רכיבי האפליקציה הראשיים
        this.scene = null;
        this.camera = null;
        this.lights = null;
        this.controls = null;
        this.ui = null;
        
        // אובייקטים תלת ממדיים
        this.sun = null;
        this.planets = new Map();
        this.asteroidBelt = null;
        
        // מצב האפליקציה
        this.state = {
            isPaused: false,
            timeScale: 1,
            selectedPlanet: null,
            currentView: 'solar-system',
            showOrbits: true,
            showLabels: true,
            realisticMode: false
        };
        
        // מונה ביצועים
        this.performance = {
            lastTime: 0,
            frameCount: 0,
            fps: 0,
            lastFpsUpdate: 0
        };
        
        // אירועים
        this.eventHandlers = new Map();
        
        // הגדרות טעינה
        this.loadingProgress = {
            total: 0,
            loaded: 0,
            current: ''
        };
    }

    // אתחול האפליקציה
    async init() {
        try {
            console.log('🚀 Starting Solar System PWA...');
            
            // אתחול מערכות בסיס
            await this.initializeBaseSystems();
            
            // טעינת נתונים
            await this.loadData();
            
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
            console.log('✅ Solar System PWA initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Solar System PWA:', error);
            this.showError('שגיאה באתחול האפליקציה: ' + error.message);
        }
    }

    // אתחול מערכות בסיס
    async initializeBaseSystems() {
        this.updateLoadingProgress('אתחול מערכות בסיס...', 0);
        
        // בדיקת תמיכה בWebGL
        if (!this.checkWebGLSupport()) {
            throw new Error('הדפדפן שלך אינו תומך בWebGL');
        }
        
        // אתחול TextureLoader
        if (typeof TextureLoader !== 'undefined') {
            TextureLoader.init();
        }
        
        // רישום Service Worker
        await this.registerServiceWorker();
        
        this.updateLoadingProgress('מערכות בסיס מוכנות', 10);
    }

    // בדיקת תמיכה בWebGL
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!context;
        } catch (error) {
            return false;
        }
    }

    // רישום Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // האזנה לעדכונים
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration.installing);
                });
                
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    // טיפול בעדכון Service Worker
    handleServiceWorkerUpdate(installingWorker) {
        installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            }
        });
    }

    // הצגת הודעת עדכון זמין
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <h3>עדכון זמין</h3>
                <p>גרסה חדשה של האפליקציה זמינה</p>
                <button id="updateApp" class="btn primary">עדכן עכשיו</button>
                <button id="dismissUpdate" class="btn">אחר כך</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('updateApp').onclick = () => {
            window.location.reload();
        };
        
        document.getElementById('dismissUpdate').onclick = () => {
            notification.remove();
        };
    }

    // טעינת נתונים
    async loadData() {
        this.updateLoadingProgress('טוען נתונים אסטרונומיים...', 20);
        
        // הנתונים כבר נטענו מהקובץ planets.js
        // כאן נוכל להוסיף טעינת נתונים נוספים מAPI
        
        this.updateLoadingProgress('נתונים נטענו בהצלחה', 30);
    }

    // יצירת סצנה תלת ממדית
    async create3DScene() {
        this.updateLoadingProgress('יוצר סצנה תלת ממדית...', 40);
        
        // אתחול סצנה
        this.scene = new SolarSystemScene();
        await this.scene.init('scene');
        
        // אתחול מצלמה
        this.camera = new SolarSystemCamera();
        await this.camera.init();
        this.camera.setupControls(this.scene.canvas);
        
        // אתחול תאורה
        this.lights = new SolarSystemLights();
        await this.lights.init(this.scene.scene);
        
        this.updateLoadingProgress('סצנה תלת ממדית מוכנה', 50);
    }

    // יצירת אובייקטים במערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר כוכבי לכת...', 60);
        
        // יצירת השמש
        await this.createSun();
        
        // יצירת כוכבי הלכת
        await this.createPlanets();
        
        // יצירת חגורת האסטרואידים
        await this.createAsteroidBelt();
        
        this.updateLoadingProgress('כוכבי הלכת נוצרו', 80);
    }

    // יצירת השמש
    async createSun() {
        this.sun = new SolarSystemSun();
        await this.sun.init();
        
        this.scene.addPlanet('sun', this.sun.mesh);
        
        // הוספת אור השמש
        this.lights.setSunPosition(this.sun.mesh.position);
    }

    // יצירת כוכבי הלכת
    async createPlanets() {
        const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        for (const planetName of planetNames) {
            const planet = new SolarSystemPlanet(planetName);
            await planet.init();
            
            this.planets.set(planetName, planet);
            this.scene.addPlanet(planetName, planet.mesh);
        }
    }

    // יצירת חגורת האסטרואידים
    async createAsteroidBelt() {
        this.asteroidBelt = new AsteroidBelt();
        await this.asteroidBelt.init();
        
        this.scene.scene.add(this.asteroidBelt.mesh);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 90);
        
        // בקרות
        this.controls = new UIControls();
        await this.controls.init(this);
        
        // פאנל מידע
        this.infoPanel = new InfoPanel();
        await this.infoPanel.init(this);
        
        // הגדרת אירועי לחיצה על כוכבי לכת
        this.setupPlanetClickHandlers();
        
        this.updateLoadingProgress('ממשק המשתמש מוכן', 95);
    }

    // הגדרת אירועי לחיצה על כוכבי לכת
    setupPlanetClickHandlers() {
        const canvas = this.scene.canvas;
        
        canvas.addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });
        
        canvas.addEventListener('dblclick', (event) => {
            this.handleCanvasDoubleClick(event);
        });
    }

    // טיפול בלחיצה על הcanvas
    handleCanvasClick(event) {
        const rect = this.scene.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // יצירת ray מהמיקום שנלחץ
        const intersects = this.camera.intersectObjects(
            x, y, 
            Array.from(this.planets.values()).map(p => p.mesh).concat([this.sun.mesh]),
            rect.width, rect.height
        );
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const planetName = this.findPlanetNameByMesh(clickedObject);
            
            if (planetName) {
                this.selectPlanet(planetName);
            }
        } else {
            this.deselectPlanet();
        }
    }

    // טיפול בלחיצה כפולה
    handleCanvasDoubleClick(event) {
        const rect = this.scene.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const intersects = this.camera.intersectObjects(
            x, y,
            Array.from(this.planets.values()).map(p => p.mesh).concat([this.sun.mesh]),
            rect.width, rect.height
        );
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const planetName = this.findPlanetNameByMesh(clickedObject);
            
            if (planetName) {
                this.focusOnPlanet(planetName);
            }
        }
    }

    // מציאת שם כוכב לכת לפי mesh
    findPlanetNameByMesh(mesh) {
        // בדיקה בשמש
        if (this.sun && this.sun.mesh === mesh) {
            return 'sun';
        }
        
        // בדיקה בכוכבי לכת
        for (const [name, planet] of this.planets) {
            if (planet.mesh === mesh) {
                return name;
            }
        }
        
        return null;
    }

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        this.scene.selectPlanet(planetName);
        this.infoPanel.showPlanetInfo(planetName);
        
        // עדכון רשימת כוכבי הלכת בממשק
        this.controls.updatePlanetSelection(planetName);
        
        this.emit('planetSelected', { planet: planetName });
    }

    // ביטול בחירת כוכב לכת
    deselectPlanet() {
        this.state.selectedPlanet = null;
        this.scene.selectPlanet(null);
        this.infoPanel.hide();
        this.controls.updatePlanetSelection(null);
        
        this.emit('planetDeselected');
    }

    // מיקוד על כוכב לכת
    focusOnPlanet(planetName) {
        this.selectPlanet(planetName);
        this.camera.focusOnPlanet(planetName);
        
        this.emit('planetFocused', { planet: planetName });
    }

    // התחלת לולאת רנדור
    startRenderLoop() {
        const animate = (currentTime) => {
            // חישוב delta time
            const deltaTime = currentTime - this.performance.lastTime;
            this.performance.lastTime = currentTime;
            
            // עדכון מונה FPS
            this.updateFPS(currentTime);
            
            // עדכון המערכת
            this.update(deltaTime);
            
            // רנדור
            this.render();
            
            // המשך הלולאה
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון מונה FPS
    updateFPS(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            // עדכון תצוגת FPS אם קיימת
            this.emit('fpsUpdate', { fps: this.performance.fps });
        }
    }

    // עדכון המערכת
    update(deltaTime) {
        if (!this.isInitialized || this.state.isPaused) return;
        
        // עדכון הסצנה
        this.scene.update(deltaTime, this.camera.camera);
        
        // עדכון המצלמה
        this.camera.update(deltaTime);
        
        // עדכון השמש
        if (this.sun) {
            this.sun.update(deltaTime * this.state.timeScale);
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet, name) => {
            planet.update(deltaTime * this.state.timeScale);
        });
        
        // עדכון חגורת האסטרואידים
        if (this.asteroidBelt) {
            this.asteroidBelt.update(deltaTime * this.state.timeScale);
        }
        
        // עדכון התאורה
        this.lights.update(deltaTime);
        
        // עדכון ממשק המשתמש
        this.controls.update(deltaTime);
    }

    // רנדור
    render() {
        if (!this.isInitialized) return;
        
        this.scene.render(this.camera.camera);
    }

    // עדכון progress הטעינה
    updateLoadingProgress(message, progress) {
        this.loadingProgress.current = message;
        this.loadingProgress.loaded = progress;
        
        const loadingElement = document.getElementById('loadingProgress');
        if (loadingElement) {
            loadingElement.style.width = progress + '%';
        }
        
        const loadingText = document.querySelector('#loading h2');
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        console.log(`📋 Loading: ${message} (${progress}%)`);
    }

    // סיום טעינה והסתרת מסך טעינה
    finishLoading() {
        this.updateLoadingProgress('מערכת השמש מוכנה!', 100);
        this.isLoading = false;
        
        setTimeout(() => {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.classList.add('fade-out');
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                }, 500);
            }
        }, 1000);
    }

    // הצגת שגיאה
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-content">
                <h2>שגיאה</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn primary">נסה שוב</button>
            </div>
        `;
        
        document.body.appendChild(errorElement);
    }

    // שינוי מצב תצוגה
    setViewMode(mode, value) {
        this.state[mode] = value;
        this.scene.setViewMode(mode, value);
        
        this.emit('viewModeChanged', { mode, value });
    }

    // שינוי מהירות זמן
    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(1000, scale));
        this.emit('timeScaleChanged', { scale: this.state.timeScale });
    }

    // השהיה/המשכה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        this.emit('pauseToggled', { isPaused: this.state.isPaused });
    }

    // איפוס תצוגה
    resetView() {
        this.camera.resetView();
        this.deselectPlanet();
        this.setTimeScale(1);
        
        this.emit('viewReset');
    }

    // מערכת אירועים פשוטה
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data = {}) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
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
        console.group('🌍 Solar System App Debug Info');
        console.log('State:', this.getState());
        console.log('Scene Info:', this.scene?.getSceneInfo());
        console.log('Camera Info:', this.camera?.getCameraInfo());
        console.log('Planets:', Array.from(this.planets.keys()));
        console.log('Performance:', this.performance);
        console.groupEnd();
    }

    // ניקוי משאבים
    dispose() {
        // ביטול לולאת הרנדור
        this.isInitialized = false;
        
        // ניקוי אובייקטים
        if (this.scene) this.scene.dispose();
        if (this.camera) this.camera.dispose();
        if (this.lights) this.lights.dispose();
        if (this.controls) this.controls.dispose();
        if (this.infoPanel) this.infoPanel.dispose();
        
        // ניקוי כוכבי הלכת
        this.planets.forEach(planet => planet.dispose());
        this.planets.clear();
        
        if (this.sun) this.sun.dispose();
        if (this.asteroidBelt) this.asteroidBelt.dispose();
        
        // ניקוי event handlers
        this.eventHandlers.clear();
        
        console.log('🧹 Solar System App disposed');
    }
}

// מחלקות placeholder לאובייקטים שעדיין לא יצרנו
class SolarSystemLights {
    constructor() {
        this.lights = [];
        this.sunLight = null;
        this.ambientLight = null;
    }

    async init(scene) {
        // אור השמש (DirectionalLight)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 2);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        
        // הגדרות צל
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1000;
        
        scene.add(this.sunLight);
        this.lights.push(this.sunLight);
        
        // אור סביבתי עדין
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        scene.add(this.ambientLight);
        this.lights.push(this.ambientLight);
    }

    setSunPosition(position) {
        if (this.sunLight) {
            this.sunLight.position.copy(position);
        }
    }

    update(deltaTime) {
        // עדכון תאורה דינמית
    }

    dispose() {
        this.lights.forEach(light => {
            if (light.parent) light.parent.remove(light);
            if (light.dispose) light.dispose();
        });
        this.lights = [];
    }
}

class SolarSystemSun {
    constructor() {
        this.mesh = null;
        this.material = null;
        this.geometry = null;
    }

    async init() {
        const sunData = PLANETS_DATA.sun;
        
        // גיאומטריה
        this.geometry = new THREE.SphereGeometry(10, 32, 32);
        
        // חומר עם אמיסיביות
        this.material = new THREE.MeshBasicMaterial({
            color: sunData.color,
            emissive: sunData.emissive || sunData.color,
            emissiveIntensity: 0.5
        });
        
        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = 'sun';
        
        // אפקטי חלקיקים לאור השמש
        this.createSunGlow();
    }

    createSunGlow() {
        const glowGeometry = new THREE.SphereGeometry(12, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
    }

    update(deltaTime) {
        // סיבוב השמש
        this.mesh.rotation.y += deltaTime * 0.001;
        
        // פולסציה עדינה
        const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1;
        this.material.emissiveIntensity = 0.5 * pulse;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}

class SolarSystemPlanet {
    constructor(name) {
        this.name = name;
        this.data = PLANETS_DATA[name];
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.orbitRadius = 0;
        this.orbitSpeed = 0;
        this.angle = Math.random() * Math.PI * 2;
    }

    async init() {
        if (!this.data) {
            throw new Error(`No data found for planet: ${this.name}`);
        }

        // חישוב גודל וקנה מידה
        const radius = Math.max(1, this.data.radius * PHYSICS_CONSTANTS.SCALE_FACTOR * 0.1);
        this.orbitRadius = this.data.distance * PHYSICS_CONSTANTS.SCALE_FACTOR;
        this.orbitSpeed = MathUtils.orbits.orbitalAngularVelocity(this.data.orbitalPeriod || 365);

        // גיאומטריה
        this.geometry = new THREE.SphereGeometry(radius, 32, 32);

        // חומר
        this.material = new THREE.MeshLambertMaterial({
            color: this.data.color,
            transparent: false
        });

        // טעינת טקסטורה אם זמינה
        if (TEXTURE_URLS.planets[this.name]) {
            const textureUrl = TEXTURE_URLS.planets[this.name].diffuse;
            const texture = TextureLoader.load(textureUrl);
            this.material.map = texture;
        }

        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // מיקום ראשוני
        this.updatePosition();
    }

    updatePosition() {
        const x = Math.cos(this.angle) * this.orbitRadius;
        const z = Math.sin(this.angle) * this.orbitRadius;
        
        this.mesh.position.set(x, 0, z);
    }

    update(deltaTime) {
        // עדכון מסלול
        this.angle += this.orbitSpeed * deltaTime * 0.001;
        this.updatePosition();

        // סיבוב עצמי
        const rotationSpeed = (this.data.rotationPeriod || 1) * 0.001;
        this.mesh.rotation.y += deltaTime * rotationSpeed;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) {
            if (this.material.map) this.material.map.dispose();
            this.material.dispose();
        }
    }
}

class AsteroidBelt {
    constructor() {
        this.mesh = null;
        this.asteroids = [];
    }

    async init() {
        const asteroidCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);
        const colors = new Float32Array(asteroidCount * 3);

        for (let i = 0; i < asteroidCount; i++) {
            const i3 = i * 3;
            
            // מיקום בחגורת האסטרואידים (בין מאדים לצדק)
            const angle = Math.random() * Math.PI * 2;
            const radius = 180 + (Math.random() - 0.5) * 40;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = Math.sin(angle) * radius;
            
            // צבע אפרפר
            const gray = 0.3 + Math.random() * 0.3;
            colors[i3] = gray;
            colors[i3 + 1] = gray;
            colors[i3 + 2] = gray;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.name = 'asteroidBelt';
    }

    update(deltaTime) {
        // סיבוב איטי של חגורת האסטרואידים
        this.mesh.rotation.y += deltaTime * 0.0001;
    }

    dispose() {
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
    }
}

class UIControls {
    constructor() {
        this.app = null;
        this.elements = new Map();
    }

    async init(app) {
        this.app = app;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // כפתור השהיה/המשכה
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.app.togglePause();
                this.updatePlayPauseButton();
            });
        }

        // כפתור איפוס
        const resetBtn = document.getElementById('reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.app.resetView();
            });
        }

        // מחוון מהירות זמן
        const timeSpeedSlider = document.getElementById('timeSpeed');
        if (timeSpeedSlider) {
            timeSpeedSlider.addEventListener('input', (e) => {
                const scale = parseFloat(e.target.value);
                this.app.setTimeScale(scale);
                this.updateSpeedDisplay(scale);
            });
        }

        // כפתורי תצוגה
        this.setupViewButtons();
        this.setupPlanetList();
    }

    setupViewButtons() {
        const viewButtons = [
            { id: 'viewOrbits', mode: 'showOrbits' },
            { id: 'viewLabels', mode: 'showLabels' },
            { id: 'viewRealistic', mode: 'realisticMode' }
        ];

        viewButtons.forEach(({ id, mode }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    const isActive = button.classList.contains('active');
                    button.classList.toggle('active');
                    this.app.setViewMode(mode, !isActive);
                });
            }
        });
    }

    setupPlanetList() {
        const planetList = document.getElementById('planetList');
        if (!planetList) return;

        const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        planets.forEach(planetName => {
            const planetData = PLANETS_DATA[planetName];
            if (!planetData) return;

            const planetItem = document.createElement('div');
            planetItem.className = 'planet-item';
            planetItem.dataset.planet = planetName;
            
            planetItem.innerHTML = `
                <div class="planet-color"></div>
                <span class="planet-name">${planetData.name}</span>
                <span class="planet-distance">${Math.round(planetData.distance / 1e6)} מיליון ק"מ</span>
            `;

            planetItem.addEventListener('click', () => {
                this.app.focusOnPlanet(planetName);
            });

            planetList.appendChild(planetItem);
        });
    }

    updatePlayPauseButton() {
        const button = document.getElementById('playPause');
        if (button) {
            button.textContent = this.app.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
    }

    updateSpeedDisplay(scale) {
        const display = document.getElementById('speedValue');
        if (display) {
            display.textContent = scale + 'x';
        }
    }

    updatePlanetSelection(planetName) {
        document.querySelectorAll('.planet-item').forEach(item => {
            item.classList.remove('active');
        });

        if (planetName) {
            const item = document.querySelector(`[data-planet="${planetName}"]`);
            if (item) {
                item.classList.add('active');
            }
        }
    }

    update(deltaTime) {
        // עדכון ממשק המשתמש
    }

    dispose() {
        // ניקוי event listeners
    }
}

class InfoPanel {
    constructor() {
        this.panel = document.getElementById('infoPanel');
        this.isVisible = false;
    }

    async init(app) {
        this.app = app;
        this.setupCloseButton();
    }

    setupCloseButton() {
        const closeBtn = document.getElementById('closeInfo');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
    }

    showPlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData || !this.panel) return;

        // עדכון תוכן
        this.updatePlanetContent(planetData);
        
        // הצגת הפאנל
        this.panel.classList.remove('hidden');
        this.panel.classList.add(`planet-${planetName}`);
        this.isVisible = true;
    }

    updatePlanetContent(data) {
        // שם הכוכב
        const nameElement = document.getElementById('planetName');
        if (nameElement) nameElement.textContent = data.name;

        // נתונים
        const dataElements = {
            distance: this.formatDistance(data.distance),
            diameter: this.formatDiameter(data.radius * 2),
            mass: this.formatMass(data.mass),
            period: this.formatPeriod(data.orbitalPeriod),
            temperature: this.formatTemperature(data.temperature)
        };

        Object.entries(dataElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // תיאור
        const descElement = document.getElementById('planetDescription');
        if (descElement) descElement.textContent = data.description;
    }

    formatDistance(distance) {
        if (!distance) return 'לא זמין';
        return `${(distance / 1e6).toFixed(1)} מיליון ק"מ`;
    }

    formatDiameter(diameter) {
        if (!diameter) return 'לא זמין';
        return `${diameter.toLocaleString()} ק"מ`;
    }

    formatMass(mass) {
        if (!mass) return 'לא זמין';
        return `${(mass / 5.972e24).toFixed(2)} × מסת כדור הארץ`;
    }

    formatPeriod(period) {
        if (!period) return 'לא זמין';
        if (period < 365) {
            return `${Math.round(period)} ימים`;
        }
        return `${(period / 365).toFixed(1)} שנים`;
    }

    formatTemperature(temp) {
        if (!temp) return 'לא זמין';
        if (typeof temp === 'object') {
            if (temp.avg) return `${temp.avg}°C`;
            if (temp.min && temp.max) return `${temp.min}°C עד ${temp.max}°C`;
        }
        return `${temp}°C`;
    }

    hide() {
        if (this.panel) {
            this.panel.classList.add('hidden');
            this.panel.className = this.panel.className.replace(/planet-\w+/g, '');
            this.isVisible = false;
        }
    }

    dispose() {
        // ניקוי
    }
}

// אתחול האפליקציה כאשר הדף נטען
let solarSystemApp = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 Initializing Solar System PWA...');
    
    try {
        solarSystemApp = new SolarSystemApp();
        
        // הוספת המשתנה לglobal scope לצורך debugging
        window.solarSystemApp = solarSystemApp;
        window.solarSystemScene = solarSystemApp.scene;
        window.solarSystemCamera = solarSystemApp.camera;
        
        await solarSystemApp.init();
        
        // הוספת קיצורי מקלדת
        setupKeyboardShortcuts();
        
        console.log('🎉 Solar System PWA ready!');
        
    } catch (error) {
        console.error('💥 Failed to initialize Solar System PWA:', error);
    }
});

// קיצורי מקלדת
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (!solarSystemApp || !solarSystemApp.isInitialized) return;
        
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                solarSystemApp.togglePause();
                break;
            case 'KeyR':
                event.preventDefault();
                solarSystemApp.resetView();
                break;
            case 'KeyO':
                event.preventDefault();
                solarSystemApp.setViewMode('showOrbits', !solarSystemApp.state.showOrbits);
                break;
            case 'KeyL':
                event.preventDefault();
                solarSystemApp.setViewMode('showLabels', !solarSystemApp.state.showLabels);
                break;
            case 'KeyD':
                if (event.ctrlKey) {
                    event.preventDefault();
                    solarSystemApp.debug();
                }
                break;
        }
    });
}

// טיפול בטעינה מחדש של הדף
window.addEventListener('beforeunload', () => {
    if (solarSystemApp) {
        solarSystemApp.dispose();
    }
});

// ייצוא למודולים אם נדרש
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SolarSystemApp };
}
