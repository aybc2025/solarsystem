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

    // יצירת בקרות fallback בסיסיות
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
            _rotateSpeed: 1.0,
            _zoomSpeed: 1.0,
            
            // מתודות
            update: () => {
                if (!controls.enabled) return;
                
                const offset = new THREE.Vector3();
                offset.copy(this.camera.position).sub(controls.target);
                
                controls._spherical.setFromVector3(offset);
                controls._spherical.theta += controls._sphericalDelta.theta;
                controls._spherical.phi += controls._sphericalDelta.phi;
                
                // הגבלות
                controls._spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, controls._spherical.phi));
                controls._spherical.radius *= controls._scale;
                controls._spherical.radius = Math.max(controls.minDistance, Math.min(controls.maxDistance, controls._spherical.radius));
                
                offset.setFromSpherical(controls._spherical);
                this.camera.position.copy(controls.target).add(offset);
                this.camera.lookAt(controls.target);
                
                // איפוס דלתות
                controls._sphericalDelta.set(0, 0, 0);
                controls._scale = 1;
            }
        };
        
        // הוספת מאזיני עכבר בסיסיים
        this.setupBasicMouseControls(controls);
        
        return controls;
    }

    // הגדרת בקרות עכבר בסיסיות
    setupBasicMouseControls(controls) {
        const canvas = this.renderer.domElement;
        let isMouseDown = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            
            controls._sphericalDelta.theta -= deltaX * 0.01;
            controls._sphericalDelta.phi -= deltaY * 0.01;
            
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            controls._scale *= scale;
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
        this.sun = new SolarSystemSun();
        const sunMesh = await this.sun.create();
        this.scene.add(sunMesh);
        
        this.updateLoadingProgress('יוצר כוכבי לכת...', 55);
        
        // יצירת כוכבי הלכת
        const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        for (const planetName of planetNames) {
            try {
                const planet = new SolarSystemPlanet(planetName);
                await planet.init();
                
                const planetMesh = planet.createMesh();
                this.scene.add(planetMesh);
                this.planets.set(planetName, planetMesh);
                
                // יצירת מסלול
                this.createOrbit(planetName, planet.data);
                
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
        }
        
        // אתחול בקרות
        if (typeof Controls !== 'undefined') {
            this.ui = new Controls(this);
        }
        
        // הגדרת אירועי מקלדת
        this.setupKeyboardControls();
        
        // הגדרת אירועי עכבר
        this.setupMouseControls();
        
        // הגדרת אירועי מגע
        this.setupTouchControls();
        
        // הגדרת resize
        window.addEventListener('resize', () => this.handleResize());
    }

    // התחלת לולאת הרנדור
    startRenderLoop() {
        this.updateLoadingProgress('מתחיל רנדור...', 95);
        
        const animate = (currentTime) => {
            if (!this.isInitialized) return;
            
            const deltaTime = currentTime - this.performance.lastTime;
            this.performance.lastTime = currentTime;
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // עדכון אובייקטים
            this.updateObjects(deltaTime);
            
            // רנדור
            this.renderer.render(this.scene, this.camera);
            
            // עדכון ביצועים
            this.updatePerformance(currentTime);
            
            // המשך הלולאה
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון כל האובייקטים
    updateObjects(deltaTime) {
        if (this.state.isPaused) return;
        
        const adjustedDeltaTime = deltaTime * this.state.timeScale;
        
        // עדכון השמש
        if (this.sun) {
            this.sun.update(adjustedDeltaTime);
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planetMesh, planetName) => {
            const planetData = PLANETS_DATA[planetName];
            if (planetData) {
                this.updatePlanetPosition(planetMesh, planetData, adjustedDeltaTime);
            }
        });
        
        // עדכון חגורת האסטרואידים
        if (this.asteroidBelt) {
            this.asteroidBelt.update(adjustedDeltaTime);
        }
    }

    // עדכון מיקום כוכב לכת
    updatePlanetPosition(planetMesh, planetData, deltaTime) {
        if (!planetMesh.userData) {
            planetMesh.userData = {
                angle: Math.random() * Math.PI * 2,
                distance: planetData.scaledDistance || 50
            };
        }
        
        // חישוב מהירות מסלול (חוק קפלר השלישי)
        const orbitSpeed = Math.sqrt(1 / Math.pow(planetData.scaledDistance || 50, 3)) * 0.001;
        
        // עדכון זווית
        planetMesh.userData.angle += orbitSpeed * deltaTime * this.state.timeScale;
        
        // עדכון מיקום
        const x = Math.cos(planetMesh.userData.angle) * planetMesh.userData.distance;
        const z = Math.sin(planetMesh.userData.angle) * planetMesh.userData.distance;
        planetMesh.position.set(x, 0, z);
        
        // סיבוב עצמי
        const rotationSpeed = (planetData.rotationPeriod || 24) * 0.001;
        planetMesh.rotation.y += rotationSpeed * deltaTime * this.state.timeScale;
    }

    // הגדרת בקרות מקלדת
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.resetCamera();
                    break;
                case 'KeyO':
                    event.preventDefault();
                    this.toggleOrbits();
                    break;
                case 'KeyL':
                    event.preventDefault();
                    this.toggleLabels();
                    break;
            }
        });
    }

    // הגדרת בקרות עכבר
    setupMouseControls() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.handleClick(x, y);
        });
    }

    // הגדרת בקרות מגע
    setupTouchControls() {
        // הגדרות בסיסיות למגע - יותר מורכב נדרש עבור תמיכה מלאה
        const canvas = this.renderer.domElement;
        canvas.style.touchAction = 'none';
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.state.isPaused = true;
            }
        });
    }

    // טיפול בלחיצה על אובייקט
    handleClick(x, y) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        
        raycaster.setFromCamera(mouse, this.camera);
        
        const objects = [];
        this.planets.forEach(planet => objects.push(planet));
        if (this.sun && this.sun.mesh) objects.push(this.sun.mesh);
        
        const intersects = raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const planetName = clickedObject.name;
            
            if (planetName && planetName !== 'sun') {
                this.focusOnPlanet(planetName);
            } else if (planetName === 'sun') {
                this.focusOnSun();
            }
        }
    }

    // מיקוד על כוכב לכת
    focusOnPlanet(planetName) {
        const planet = this.planets.get(planetName);
        if (!planet) return;
        
        // אנימציה חלקה למיקום החדש
        const targetPosition = planet.position.clone();
        targetPosition.add(new THREE.Vector3(100, 50, 100));
        
        this.animateToPosition(targetPosition, planet.position);
        this.showPlanetInfo(planetName);
    }

    // מיקוד על השמש
    focusOnSun() {
        const sunPosition = new THREE.Vector3(200, 100, 200);
        const sunTarget = new THREE.Vector3(0, 0, 0);
        
        this.animateToPosition(sunPosition, sunTarget);
        this.showPlanetInfo('sun');
    }

    // אנימציה חלקה לעמדה חדשה
    animateToPosition(newPosition, newTarget) {
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

    // פונקציות בקרה
    togglePlayPause() {
        this.state.isPaused = !this.state.isPaused;
        
        const button = document.getElementById('playPause');
        const quickButton = document.getElementById('quickPlayPause');
        
        if (this.state.isPaused) {
            if (button) button.innerHTML = '▶️ המשך';
            if (quickButton) quickButton.innerHTML = '▶️';
        } else {
            if (button) button.innerHTML = '⏸️ השהה';
            if (quickButton) quickButton.innerHTML = '⏸️';
        }
    }

    resetCamera() {
        this.camera.position.set(400, 200, 400);
        if (this.controls.target) {
            this.controls.target.set(0, 0, 0);
        }
        this.state.selectedPlanet = null;
        
        if (this.infoPanel) {
            this.infoPanel.hide();
        }
    }

    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        this.orbits.forEach(orbit => {
            orbit.visible = this.state.showOrbits;
        });
        
        const button = document.getElementById('showOrbits');
        if (button) {
            button.classList.toggle('active', this.state.showOrbits);
        }
    }

    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        // כאן נטפל בתוויות כשהן יהיו מוכנות
        
        const button = document.getElementById('showLabels');
        if (button) {
            button.classList.toggle('active', this.state.showLabels);
        }
    }

    // עדכון ביצועים
    updatePerformance(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime > this.performance.lastFpsUpdate + 1000) {
            this.performance.fps = Math.round(this.performance.frameCount * 1000 / (currentTime - this.performance.lastFpsUpdate));
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            const fpsCounter = document.getElementById('fpsCounter');
            if (fpsCounter) {
                fpsCounter.textContent = this.performance.fps;
            }
            
            const objectCount = document.getElementById('objectCount');
            if (objectCount) {
                objectCount.textContent = this.scene.children.length;
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
        if (this.sun) this.sun.dispose();
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

// הפוך את המחלקה זמינה גלובלית
window.ImprovedSolarSystemApp = ImprovedSolarSystemApp;