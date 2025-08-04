// מערכת השמש - נקודת כניסה ראשית לאפליקציה - גרסה מתוקנת
// Solar System PWA - Main Application Entry Point - Fixed Version

class SolarSystemApp {
    constructor() {
        this.isInitialized = false;
        this.isLoading = true;
        
        // רכיבי האפליקציה הראשיים
        this.scene = null;
        this.camera = null;
        this.renderer = null;
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
            total: 100,
            loaded: 0,
            current: 'מאתחל...'
        };
    }

    // אתחול האפליקציה
    async init() {
        try {
            console.log('🚀 Starting Solar System PWA...');
            
            // אתחול מערכות בסיס
            await this.initializeBaseSystems();
            
            // יצירת סצנה תלת ממדית
            await this.create3DScene();
            
            // טעינת נתונים
            await this.loadData();
            
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
        
        // רישום Service Worker עם טיפול שגיאות
        await this.registerServiceWorker();
        
        this.updateLoadingProgress('מערכות בסיס מוכנות', 10);
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

    // רישום Service Worker עם טיפול שגיאות משופר
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // בדוק אם קובץ ה-service worker קיים
                const response = await fetch('sw.js', { method: 'HEAD' });
                if (response.ok) {
                    const registration = await navigator.serviceWorker.register('sw.js');
                    console.log('SW registered:', registration.scope);
                } else {
                    console.log('Service worker file not found, continuing without offline support');
                }
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
                // ממשיך בלי service worker
            }
        }
    }

    // יצירת סצנה תלת ממדית
    async create3DScene() {
        this.updateLoadingProgress('יוצר סצנה תלת-ממדית...', 20);
        
        try {
            // יצירת סצנה
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000000);
            
            // יצירת מצלמה
            this.camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                10000
            );
            this.camera.position.set(100, 50, 100);
            
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
            
            // יצירת בקרות מצלמה עם fallback
            await this.createCameraControls();
            
            // יצירת תאורה
            await this.createLighting();
            
            // הוספת מאזיני אירועים
            this.setupEventListeners();
            
            this.updateLoadingProgress('סצנה תלת-ממדית מוכנה', 40);
            
        } catch (error) {
            console.error('Failed to create 3D scene:', error);
            throw error;
        }
    }

    // יצירת בקרות מצלמה עם fallback
    async createCameraControls() {
        try {
            // נסה להשתמש ב-OrbitControls מהספרייה החיצונית
            if (typeof THREE.OrbitControls === 'function') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                console.log('✅ Using THREE.OrbitControls');
            } else {
                // fallback לבקרות פשוטות
                this.controls = this.createFallbackControls();
                console.log('⚠️ Using fallback controls');
            }
            
            // הגדרות כלליות
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enableRotate = true;
            this.controls.enablePan = true;
            
            if (this.controls.minDistance !== undefined) {
                this.controls.minDistance = 5;
                this.controls.maxDistance = 5000;
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

    // יצירת בקרות fallback פשוטות
    createFallbackControls() {
        const controls = {
            enabled: true,
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
            minDistance: 5,
            maxDistance: 5000,
            target: new THREE.Vector3(0, 0, 0),
            
            // מצב פנימי
            _spherical: new THREE.Spherical(),
            _sphericalDelta: new THREE.Spherical(),
            _scale: 1,
            _panOffset: new THREE.Vector3(),
            _isUserInteracting: false,
            
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
            
            dispose: () => {
                // ניקוי event listeners
            }
        };
        
        this.attachControlEvents(controls);
        return controls;
    }

    // יצירת בקרות בסיסיות מאוד
    createBasicFallback() {
        return {
            enabled: true,
            enableDamping: false,
            target: new THREE.Vector3(0, 0, 0),
            update: () => {
                // עדכון בסיסי
                this.camera.lookAt(0, 0, 0);
            },
            dispose: () => {}
        };
    }

    // חיבור אירועי בקרה לfallback controls
    attachControlEvents(controls) {
        const domElement = this.renderer.domElement;
        
        let isDragging = false;
        let previousMouse = { x: 0, y: 0 };
        
        domElement.addEventListener('mousedown', (event) => {
            isDragging = true;
            previousMouse = { x: event.clientX, y: event.clientY };
            controls._isUserInteracting = true;
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
            controls._isUserInteracting = false;
        });
        
        domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (!controls.enableZoom) return;
            
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            controls._spherical.radius *= scale;
        });
        
        // מגע למכשירים ניידים
        let touchStartPos = null;
        
        domElement.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (event.touches.length === 1) {
                touchStartPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
                controls._isUserInteracting = true;
            }
        });
        
        domElement.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (event.touches.length === 1 && touchStartPos) {
                const deltaMove = {
                    x: event.touches[0].clientX - touchStartPos.x,
                    y: event.touches[0].clientY - touchStartPos.y
                };
                
                controls._sphericalDelta.theta -= deltaMove.x * 0.01;
                controls._sphericalDelta.phi += deltaMove.y * 0.01;
                
                touchStartPos = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            }
        });
        
        domElement.addEventListener('touchend', (event) => {
            event.preventDefault();
            touchStartPos = null;
            controls._isUserInteracting = false;
        });
    }

    // יצירת תאורה
    async createLighting() {
        // תאורה סביבתית
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // תאורת השמש
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        this.lights = { ambient: ambientLight, sun: sunLight };
    }

    // טעינת נתונים
    async loadData() {
        this.updateLoadingProgress('טוען נתוני כוכבי לכת...', 50);
        
        // נתונים בסיסיים של כוכבי הלכת
        this.planetsData = {
            sun: { 
                radius: 10, 
                distance: 0, 
                color: 0xffd700, 
                name: 'השמש',
                rotationPeriod: 25,
                orbitalPeriod: 0
            },
            mercury: { 
                radius: 0.5, 
                distance: 20, 
                color: 0x8c7853, 
                name: 'כוכב חמה',
                rotationPeriod: 58.6,
                orbitalPeriod: 88
            },
            venus: { 
                radius: 0.8, 
                distance: 30, 
                color: 0xffc649, 
                name: 'נוגה',
                rotationPeriod: 243,
                orbitalPeriod: 225
            },
            earth: { 
                radius: 1, 
                distance: 40, 
                color: 0x6b93d6, 
                name: 'כדור הארץ',
                rotationPeriod: 1,
                orbitalPeriod: 365
            },
            mars: { 
                radius: 0.7, 
                distance: 55, 
                color: 0xc1440e, 
                name: 'מאדים',
                rotationPeriod: 1.03,
                orbitalPeriod: 687
            },
            jupiter: { 
                radius: 4, 
                distance: 90, 
                color: 0xd8ca9d, 
                name: 'צדק',
                rotationPeriod: 0.41,
                orbitalPeriod: 4333
            },
            saturn: { 
                radius: 3.5, 
                distance: 120, 
                color: 0xfad5a5, 
                name: 'שבתאי',
                rotationPeriod: 0.45,
                orbitalPeriod: 10759
            },
            uranus: { 
                radius: 2, 
                distance: 150, 
                color: 0x4fd0e7, 
                name: 'אורנוס',
                rotationPeriod: 0.72,
                orbitalPeriod: 30687
            },
            neptune: { 
                radius: 1.8, 
                distance: 180, 
                color: 0x4b70dd, 
                name: 'נפטון',
                rotationPeriod: 0.67,
                orbitalPeriod: 60190
            }
        };
        
        this.updateLoadingProgress('נתונים נטענו בהצלחה', 60);
    }

    // יצירת אובייקטי מערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר כוכבי לכת...', 70);
        
        // יצירת השמש
        await this.createSun();
        
        // יצירת כוכבי הלכת
        for (const [planetName, planetData] of Object.entries(this.planetsData)) {
            if (planetName !== 'sun') {
                await this.createPlanet(planetName, planetData);
            }
        }
        
        this.updateLoadingProgress('אובייקטים נוצרו בהצלחה', 85);
    }

    // יצירת השמש
    async createSun() {
        const geometry = new THREE.SphereGeometry(this.planetsData.sun.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: this.planetsData.sun.color,
            emissive: this.planetsData.sun.color,
            emissiveIntensity: 0.5
        });
        
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.name = 'sun';
        this.scene.add(this.sun);
        
        // אפקט זוהר לשמש
        const glowGeometry = new THREE.SphereGeometry(this.planetsData.sun.radius * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);
    }

    // יצירת כוכב לכת
    async createPlanet(planetName, planetData) {
        const geometry = new THREE.SphereGeometry(planetData.radius, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: planetData.color 
        });
        
        const planet = new THREE.Mesh(geometry, material);
        planet.name = planetName;
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // מיקום ראשוני
        planet.position.set(planetData.distance, 0, 0);
        
        // הוספת נתונים למעקב
        planet.userData = {
            ...planetData,
            angle: Math.random() * Math.PI * 2,
            orbitSpeed: 0.01 / Math.sqrt(planetData.distance) // חוק קפלר פשוט
        };
        
        this.scene.add(planet);
        this.planets.set(planetName, planet);
        
        // יצירת מסלול
        this.createOrbit(planetData);
    }

    // יצירת מסלול
    createOrbit(planetData) {
        if (!this.state.showOrbits) return;
        
        const geometry = new THREE.RingGeometry(
            planetData.distance - 0.2, 
            planetData.distance + 0.2, 
            64
        );
        const material = new THREE.MeshBasicMaterial({
            color: planetData.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = -Math.PI / 2;
        orbit.name = `${planetData.name}_orbit`;
        this.scene.add(orbit);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 90);
        
        // כפתורי בקרה
        this.setupControlButtons();
        
        // פאנל מידע
        this.setupInfoPanel();
        
        // מד ביצועים
        this.setupPerformanceMonitor();
    }

    // הגדרת כפתורי בקרה
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
                this.state.timeScale = parseFloat(event.target.value);
                const valueSpan = document.getElementById('timeScaleValue');
                if (valueSpan) {
                    valueSpan.textContent = this.state.timeScale + 'x';
                }
            });
        }
        
        // כפתורי כוכבי לכת
        const planetBtns = document.querySelectorAll('.planet-btn');
        planetBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const planetName = event.target.dataset.planet;
                this.focusOnPlanet(planetName);
            });
        });
    }

    // הגדרת פאנל מידע
    setupInfoPanel() {
        const closeBtn = document.getElementById('closeInfo');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const panel = document.getElementById('infoPanel');
                if (panel) panel.style.display = 'none';
            });
        }
    }

    // הגדרת מד ביצועים
    setupPerformanceMonitor() {
        this.fpsCounter = document.getElementById('fpsCounter');
        this.objectCounter = document.getElementById('objectCount');
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
            
            // רנדור
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אנימציות
    updateAnimations(deltaTime) {
        const scaledDelta = deltaTime * this.state.timeScale * 0.001;
        
        // סיבוב השמש
        if (this.sun) {
            this.sun.rotation.y += scaledDelta * 0.1;
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet) => {
            const userData = planet.userData;
            
            // סיבוב סביב השמש
            userData.angle += userData.orbitSpeed * scaledDelta;
            planet.position.x = Math.cos(userData.angle) * userData.distance;
            planet.position.z = Math.sin(userData.angle) * userData.distance;
            
            // סיבוב עצמי
            planet.rotation.y += scaledDelta * (1 / userData.rotationPeriod);
        });
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

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // שינוי גודל חלון
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // מקשי קיצור
        document.addEventListener('keydown', (event) => {
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
            }
        });
        
        // לחיצה על כוכבי לכת
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onPlanetClick(event);
        });
    }

    // טיפול בלחיצה על כוכב לכת
    onPlanetClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.name && this.planetsData[clickedObject.name]) {
                this.showPlanetInfo(clickedObject.name);
            }
        }
    }

    // הצגת מידע על כוכב לכת
    showPlanetInfo(planetName) {
        const planetData = this.planetsData[planetName];
        const panel = document.getElementById('infoPanel');
        const nameElement = document.getElementById('planetName');
        const infoElement = document.getElementById('planetInfo');
        
        if (panel && nameElement && infoElement && planetData) {
            nameElement.textContent = planetData.name;
            
            let infoHTML = `<p><strong>רדיוס:</strong> ${planetData.radius} יחידות</p>`;
            if (planetData.distance > 0) {
                infoHTML += `<p><strong>מרחק מהשמש:</strong> ${planetData.distance} יחידות</p>`;
                infoHTML += `<p><strong>תקופת סיבוב:</strong> ${planetData.rotationPeriod} ימים</p>`;
                infoHTML += `<p><strong>תקופת הקפה:</strong> ${planetData.orbitalPeriod} ימים</p>`;
            } else {
                infoHTML += `<p><strong>הכוכב המרכזי של מערכת השמש</strong></p>`;
                infoHTML += `<p><strong>טמפרטורת פני השטח:</strong> 5,778K</p>`;
            }
            
            infoElement.innerHTML = infoHTML;
            panel.style.display = 'block';
        }
    }

    // מיקוד על כוכב לכת
    focusOnPlanet(planetName) {
        const planet = this.planets.get(planetName) || (planetName === 'sun' ? this.sun : null);
        
        if (planet && this.controls) {
            const targetPosition = planet.position.clone();
            const distance = planetName === 'sun' ? 50 : planet.userData?.radius * 10 || 20;
            
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

    // החלפת מצב השהיה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        const btn = document.getElementById('playPause');
        if (btn) {
            btn.textContent = this.state.isPaused ? '▶️ נגן' : '⏸️ השהה';
        }
    }

    // איפוס תצוגה
    resetView() {
        this.camera.position.set(100, 50, 100);
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
        }
        this.camera.lookAt(0, 0, 0);
        
        const panel = document.getElementById('infoPanel');
        if (panel) panel.style.display = 'none';
    }

    // החלפת תצוגת מסלולים
    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        
        this.scene.children.forEach(child => {
            if (child.name && child.name.includes('_orbit')) {
                child.visible = this.state.showOrbits;
            }
        });
    }

    // החלפת תצוגת תוויות
    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        // הוספת לוגיקה לתוויות כאן
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
        console.group('🌍 Solar System App Debug Info');
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
        
        if (this.sun) {
            if (this.sun.geometry) this.sun.geometry.dispose();
            if (this.sun.material) this.sun.material.dispose();
        }
        
        // ניקוי בקרות
        if (this.controls && this.controls.dispose) {
            this.controls.dispose();
        }
        
        // ניקוי renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // ניקוי event handlers
        this.eventHandlers.clear();
        
        console.log('🧹 Solar System App disposed');
    }
}

// אתחול האפליקציה כאשר הDOM מוכן
let solarSystemApp = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM loaded, initializing Solar System PWA...');
    
    try {
        // בדיקת תמיכה בסיסית
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js library not loaded');
        }
        
        // יצירת האפליקציה
        solarSystemApp = new SolarSystemApp();
        
        // הפיכה לגלובלית לדיבוג
        window.solarSystemApp = solarSystemApp;
        
        // אתחול
        await solarSystemApp.init();
        
        // הגדרת קיצורי מקלדת
        setupKeyboardShortcuts();
        
        console.log('🎉 Solar System PWA ready!');
        
    } catch (error) {
        console.error('💥 Failed to initialize Solar System PWA:', error);
        showError('כשל באתחול האפליקציה: ' + error.message);
    }
});

// הגדרת קיצורי מקלדת גלובליים
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
                solarSystemApp.toggleOrbits();
                break;
            case 'KeyL':
                event.preventDefault();
                solarSystemApp.toggleLabels();
                break;
            case 'KeyD':
                if (event.ctrlKey) {
                    event.preventDefault();
                    solarSystemApp.debug();
                }
                break;
            case 'Escape':
                const panel = document.getElementById('infoPanel');
                if (panel) panel.style.display = 'none';
                break;
        }
    });
}

// פונקציה גלובלית להצגת שגיאות
function showError(message) {
    const existing = document.querySelector('.error-message');
    if (existing) existing.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 2000;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    errorDiv.innerHTML = `
        <h3 style="margin-top: 0;">⚠️ שגיאה באפליקציה</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            background: #fff;
            color: #d32f2f;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        ">🔄 טען מחדש</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // הסתר מסך טעינה אם קיים
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// ניקוי בעת סגירת החלון
window.addEventListener('beforeunload', () => {
    if (solarSystemApp) {
        solarSystemApp.dispose();
    }
});

// טיפול בשגיאות גלובליות
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    if (event.error.message.includes('OrbitControls')) {
        showError('שגיאה בטעינת בקרות המצלמה. האפליקציה תפעל עם בקרות בסיסיות.');
        return;
    }
    
    showError(`שגיאה לא צפויה: ${event.error.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // מניעת הצגת שגיאות של service worker
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('fetch') || event.reason.message.includes('cache'))) {
        event.preventDefault();
        return;
    }
    
    showError(`שגיאה אסינכרונית: ${event.reason}`);
});

// Export לשימוש במודולים אחרים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SolarSystemApp };
}