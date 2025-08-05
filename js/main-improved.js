// מערכת השמש - אפליקציה משופרת עם תיקוני PWA
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
        
        // תיקוני PWA - מצב input
        this.inputState = {
            lastTouchTime: 0,
            lastClickTime: 0,
            touchThreshold: 300,
            isTouch: false,
            preventNextClick: false
        };
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
            
            // סיום אתחול
            this.finishInitialization();
            
        } catch (error) {
            console.error('Failed to initialize Solar System App:', error);
            this.showError(error.message);
        }
    }

    // אתחול מערכות בסיס
    async initializeBaseSystems() {
        this.updateLoadingProgress('אתחול מערכות בסיס...', 10);
        
        // בדיקת תמיכה בWebGL
        if (!this.checkWebGLSupport()) {
            throw new Error('WebGL is not supported');
        }
        
        // אתחול מנוע פיזיקה
        this.initPhysicsEngine();
        
        this.updateLoadingProgress('מערכות בסיס מוכנות', 20);
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
        this.updateLoadingProgress('יוצר סצנה תלת ממדית...', 30);
        
        // יצירת סצנה
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // יצירת מצלמה
        this.createCamera();
        
        // יצירת רנדרר
        this.createRenderer();
        
        // יצירת בקרות - תיקון PWA
        this.createControlsFixed();
        
        // יצירת תאורה
        this.createLights();
        
        this.updateLoadingProgress('סצנה תלת ממדית מוכנה', 40);
    }

    // יצירת מצלמה
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        this.camera.position.set(500, 300, 500);
        this.camera.lookAt(0, 0, 0);
    }

    // יצירת רנדרר
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // הוספה ל-DOM
        const sceneContainer = document.getElementById('scene') || document.getElementById('container');
        if (sceneContainer) {
            sceneContainer.appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
        }
    }

    // יצירת בקרות מתוקנות לPWA
    createControlsFixed() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.setupOrbitControlsFixed();
        } else {
            this.createFallbackControls();
        }
    }

    // הגדרת OrbitControls מתוקנות
    setupOrbitControlsFixed() {
        // הגדרות בסיסיות
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        
        // הגבלות זום
        this.controls.minDistance = 50;
        this.controls.maxDistance = 3000;
        
        // הגבלות זווית
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minPolarAngle = 0;
        
        // תיקון PWA - הוספת event listeners מותאמים
        this.setupFixedEventListeners();
    }

    // הגדרת event listeners מתוקנים לPWA
    setupFixedEventListeners() {
        const canvas = this.renderer.domElement;
        
        // תיקון wheel zoom - אפשר זום דפדפן
        canvas.addEventListener('wheel', (event) => {
            // בדיקה אם זה זום של דפדפן או של Three.js
            if (event.ctrlKey || event.metaKey) {
                // זה זום דפדפן - אל תחסום
                return;
            }
            
            // רק אז חסום לזום של Three.js
            event.preventDefault();
            
            if (!this.controls.enableZoom) return;
            
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            const distance = this.camera.position.length() * scale;
            
            // הגבלות זום
            if (distance >= this.controls.minDistance && distance <= this.controls.maxDistance) {
                this.camera.position.multiplyScalar(scale);
            }
        }, { passive: false });

        // תיקון touch events - אפשר זום pinch
        this.setupFixedTouchEvents(canvas);
        
        // תיקון click detection לPWA
        this.setupFixedClickDetection(canvas);
    }

    // הגדרת touch events מתוקנים
    setupFixedTouchEvents(canvas) {
        let touchStartPos = null;
        let touchStartDistance = null;
        
        canvas.addEventListener('touchstart', (event) => {
            this.inputState.isTouch = true;
            this.inputState.lastTouchTime = Date.now();
            
            if (event.touches.length === 1) {
                // מגע יחיד - סיבוב
                touchStartPos = { 
                    x: event.touches[0].clientX, 
                    y: event.touches[0].clientY 
                };
                // אל תחסום - אפשר gesture zoom במקביל
            } else if (event.touches.length === 2) {
                // שני מגעים - זום
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                touchStartDistance = Math.sqrt(dx * dx + dy * dy);
                
                // תיקון PWA - אל תחסום pinch-to-zoom
                this.inputState.preventNextClick = true;
            } else {
                // יותר מ-2 מגעים - חסום
                event.preventDefault();
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (event) => {
            if (event.touches.length === 1 && touchStartPos && this.controls.enableRotate) {
                // סיבוב - חסום רק כשמסובבים
                const deltaMove = {
                    x: event.touches[0].clientX - touchStartPos.x,
                    y: event.touches[0].clientY - touchStartPos.y
                };
                
                // אם זה תנועה גדולה, זה סיבוב
                const distance = Math.sqrt(deltaMove.x * deltaMove.x + deltaMove.y * deltaMove.y);
                if (distance > 10) {
                    event.preventDefault();
                    this.rotateCameraTouch(deltaMove);
                }
                
                touchStartPos = { 
                    x: event.touches[0].clientX, 
                    y: event.touches[0].clientY 
                };
                
            } else if (event.touches.length === 2 && touchStartDistance && this.controls.enableZoom) {
                // זום pinch - עבוד במקביל לזום דפדפן
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const scale = distance / touchStartDistance;
                
                if (Math.abs(scale - 1) > 0.05) { // threshold לזום
                    this.zoomCameraTouch(scale);
                    touchStartDistance = distance;
                }
            } else if (event.touches.length > 2) {
                event.preventDefault();
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (event) => {
            const touchDuration = Date.now() - this.inputState.lastTouchTime;
            
            // איפוס דגלים אחרי delay
            setTimeout(() => {
                this.inputState.preventNextClick = false;
                this.inputState.isTouch = false;
            }, 100);
            
            touchStartPos = null;
            touchStartDistance = null;
        }, { passive: true });
    }

    // סיבוב מצלמה במגע
    rotateCameraTouch(deltaMove) {
        if (!this.controls) return;
        
        const rotateSpeed = 0.005;
        
        // עדכון position של מצלמה
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        offset.copy(this.camera.position).sub(this.controls.target || new THREE.Vector3(0, 0, 0));
        spherical.setFromVector3(offset);
        
        spherical.theta -= deltaMove.x * rotateSpeed;
        spherical.phi += deltaMove.y * rotateSpeed;
        
        // הגבלות
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        offset.setFromSpherical(spherical);
        this.camera.position.copy(this.controls.target || new THREE.Vector3(0, 0, 0)).add(offset);
        this.camera.lookAt(this.controls.target || new THREE.Vector3(0, 0, 0));
    }

    // זום מצלמה במגע
    zoomCameraTouch(scale) {
        if (!this.controls) return;
        
        const zoomScale = scale > 1 ? 0.95 : 1.05;
        const newDistance = this.camera.position.length() * zoomScale;
        
        if (newDistance >= this.controls.minDistance && newDistance <= this.controls.maxDistance) {
            this.camera.position.multiplyScalar(zoomScale);
        }
    }

    // הגדרת זיהוי קליקים מתוקן לPWA
    setupFixedClickDetection(canvas) {
        // רכיב מגע
        canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length === 1 && 
                !this.inputState.preventNextClick) {
                
                const touchDuration = Date.now() - this.inputState.lastTouchTime;
                
                // אם זה טאפ קצר
                if (touchDuration < this.inputState.touchThreshold) {
                    const touch = event.changedTouches[0];
                    setTimeout(() => {
                        this.handlePlanetSelection(touch.clientX, touch.clientY);
                    }, 50); // delay קטן להבטחה
                }
            }
        }, { passive: true });
        
        // רכיב עכבר
        canvas.addEventListener('click', (event) => {
            // אם זה בא מיד אחרי touch, דלג
            if (this.inputState.isTouch || 
                (Date.now() - this.inputState.lastTouchTime < 500)) {
                return;
            }
            
            this.handlePlanetSelection(event.clientX, event.clientY);
        });
        
        // מניעת context menu
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    // טיפול בבחירת כוכב לכת - מתוקן
    handlePlanetSelection(clientX, clientY) {
        try {
            const rect = this.renderer.domElement.getBoundingClientRect();
            
            const mouse = new THREE.Vector2();
            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            // רשימת אובייקטים לבדיקה
            const selectableObjects = [];
            
            if (this.sun) {
                selectableObjects.push(this.sun);
            }
            
            this.planets.forEach((planet) => {
                selectableObjects.push(planet);
            });
            
            const intersects = raycaster.intersectObjects(selectableObjects, true);
            
            if (intersects.length > 0) {
                const selectedObject = intersects[0].object;
                let planetName = null;
                
                // זיהוי שם הכוכב
                if (selectedObject === this.sun) {
                    planetName = 'sun';
                } else {
                    for (let [name, planet] of this.planets) {
                        if (planet === selectedObject || planet.children.includes(selectedObject)) {
                            planetName = name;
                            break;
                        }
                    }
                }
                
                if (planetName) {
                    console.log('Planet selected:', planetName);
                    this.selectPlanet(planetName);
                }
            } else {
                this.deselectPlanet();
            }
            
        } catch (error) {
            console.error('Error in planet selection:', error);
        }
    }

    // יצירת בקרות חלופיות
    createFallbackControls() {
        console.log('Using fallback camera controls');
        
        const canvas = this.renderer.domElement;
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            this.rotateCameraTouch({ x: deltaX, y: deltaY });
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        // זום בגלגלת - מתוקן
        canvas.addEventListener('wheel', (event) => {
            if (event.ctrlKey || event.metaKey) {
                return; // אל תחסום זום דפדפן
            }
            
            event.preventDefault();
            
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
            
            const distance = this.camera.position.length();
            if (distance < 50) {
                this.camera.position.normalize().multiplyScalar(50);
            } else if (distance > 3000) {
                this.camera.position.normalize().multiplyScalar(3000);
            }
        }, { passive: false });
    }

    // יצירת תאורה
    createLights() {
        // אור השמש
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // אור סביבה
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
    }

    // יצירת אובייקטים במערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר אובייקטי מערכת השמש...', 50);
        
        // יצירת השמש
        await this.createSun();
        this.updateLoadingProgress('השמש נוצרה', 60);
        
        // יצירת כוכבי הלכת
        await this.createPlanets();
        this.updateLoadingProgress('כוכבי הלכת נוצרו', 70);
        
        // יצירת מסלולים
        await this.createOrbits();
        this.updateLoadingProgress('מסלולים נוצרו', 80);
        
        // יצירת חגורת אסטרואידים
        await this.createAsteroidBelt();
        this.updateLoadingProgress('חגורת אסטרואידים נוצרה', 90);
    }

    // יצירת השמש
    async createSun() {
        const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            emissive: 0xff8800,
            emissiveIntensity: 0.3
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.name = 'sun';
        this.scene.add(this.sun);
    }

    // יצירת כוכבי הלכת
    async createPlanets() {
        if (typeof PLANETS_DATA === 'undefined') {
            console.warn('PLANETS_DATA not loaded, using fallback');
            return;
        }

        Object.entries(PLANETS_DATA).forEach(([name, data]) => {
            if (name === 'sun') return;
            
            const planet = this.createPlanet(name, data);
            this.planets.set(name, planet);
            this.scene.add(planet);
        });
    }

    // יצירת כוכב לכת יחיד
    createPlanet(name, data) {
        const geometry = new THREE.SphereGeometry(data.scaledRadius || 5, 32, 32);
        const material = new THREE.MeshLambertMaterial({
            color: data.color || 0x888888
        });
        
        const planet = new THREE.Mesh(geometry, material);
        planet.name = name;
        planet.userData = {
            ...data,
            angle: Math.random() * Math.PI * 2,
            rotationAngle: 0
        };
        
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        return planet;
    }

    // יצירת מסלולים
    async createOrbits() {
        if (typeof PLANETS_DATA === 'undefined') return;

        Object.entries(PLANETS_DATA).forEach(([name, data]) => {
            if (name === 'sun' || !data.distance) return;
            
            const curve = new THREE.EllipseCurve(
                0, 0,
                data.distance, data.distance,
                0, 2 * Math.PI,
                false, 0
            );
            
            const points = curve.getPoints(100);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: data.color || 0x888888,
                opacity: 0.3,
                transparent: true
            });
            
            const orbit = new THREE.Line(geometry, material);
            orbit.rotation.x = Math.PI / 2;
            orbit.visible = this.state.showOrbits;
            
            this.orbits.set(name, orbit);
            this.scene.add(orbit);
        });
    }

    // יצירת חגורת אסטרואידים
    async createAsteroidBelt() {
        const asteroidGeometry = new THREE.BufferGeometry();
        const asteroidCount = 2000;
        const positions = new Float32Array(asteroidCount * 3);
        
        for (let i = 0; i < asteroidCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 250 + Math.random() * 100;
            const height = (Math.random() - 0.5) * 20;
            
            positions[i * 3] = Math.cos(angle) * distance;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * distance;
        }
        
        asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const asteroidMaterial = new THREE.PointsMaterial({
            color: 0x888888,
            size: 2,
            sizeAttenuation: true
        });
        
        this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
        this.asteroidBelt.visible = this.state.showAsteroids;
        this.scene.add(this.asteroidBelt);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 95);
        
        // אתחול בקרות UI
        if (typeof UIControls !== 'undefined') {
            this.ui = new UIControls();
            await this.ui.init(this);
        }
        
        // אתחול פאנל מידע
        if (typeof ImprovedInfoPanel !== 'undefined') {
            this.infoPanel = new ImprovedInfoPanel();
            await this.infoPanel.init(this);
        }
        
        // הגדרת מקשי קיצור
        this.setupKeyboardShortcuts();
        
        // הגדרת אירועי חלון
        this.setupWindowEvents();
    }

    // התחלת לולאת רנדור
    startRenderLoop() {
        const animate = (currentTime) => {
            if (!this.isInitialized) return;
            
            // עדכון ביצועים
            this.updatePerformance(currentTime);
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // עדכון אנימציות
            if (!this.state.isPaused) {
                this.updateAnimations(currentTime);
            }
            
            // רנדור
            this.renderer.render(this.scene, this.camera);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אנימציות
    updateAnimations(currentTime) {
        const deltaTime = currentTime - this.performance.lastTime;
        this.performance.lastTime = currentTime;
        
        // סיבוב השמש
        if (this.sun) {
            this.sun.rotation.y += this.state.timeScale * 0.002;
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet, name) => {
            const data = planet.userData;
            if (!data || !data.distance) return;
            
            // עדכון זווית מסלול
            data.angle += (this.state.timeScale * 0.01) / (data.period || 1);
            
            // חישוב מיקום חדש
            const x = Math.cos(data.angle) * data.distance;
            const z = Math.sin(data.angle) * data.distance;
            
            planet.position.set(x, 0, z);
            
            // סיבוב עצמי
            data.rotationAngle += (this.state.timeScale * 0.1) / (data.rotationPeriod || 1);
            planet.rotation.y = data.rotationAngle;
        });
        
        // סיבוב חגורת אסטרואידים
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += this.state.timeScale * 0.0005;
        }
    }

    // עדכון ביצועים
    updatePerformance(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
            
            // עדכון תצוגת FPS
            const fpsElement = document.getElementById('fpsCounter');
            if (fpsElement) {
                fpsElement.textContent = this.performance.fps;
            }
            
            // עדכון מספר אובייקטים
            const objectElement = document.getElementById('objectCount');
            if (objectElement) {
                objectElement.textContent = this.scene.children.length;
            }
        }
    }

    // פונקציות בקרה
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        if (this.infoPanel) {
            this.infoPanel.showPlanetInfo(planetName);
        }
        
        this.focusOnPlanet(planetName);
    }

    deselectPlanet() {
        this.state.selectedPlanet = null;
        
        if (this.infoPanel) {
            this.infoPanel.hide();
        }
    }

    focusOnPlanet(planetName) {
        let targetObject = null;

        if (planetName === 'sun') {
            targetObject = this.sun;
        } else {
            targetObject = this.planets.get(planetName);
        }

        if (targetObject && this.controls) {
            const targetPosition = targetObject.position.clone();
            const distance = planetName === 'sun' ? 100 : 50;
            
            const newCameraPosition = targetPosition.clone().add(
                new THREE.Vector3(distance, distance * 0.5, distance)
            );
            
            this.animateCamera(newCameraPosition, targetPosition);
        }
    }

    animateCamera(targetPosition, lookAtPosition) {
        if (!this.camera) return;
        
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls ? 
            (this.controls.target || new THREE.Vector3(0, 0, 0)) : 
            new THREE.Vector3(0, 0, 0);
        
        const duration = 2000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            
            if (this.controls && this.controls.target) {
                this.controls.target.lerpVectors(startLookAt, lookAtPosition, easeProgress);
                this.controls.update();
            } else {
                this.camera.lookAt(lookAtPosition);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // פונקציות בקרה נוספות
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        if (this.ui) {
            this.ui.updatePlayPauseButton();
        }
    }

    pause() {
        this.state.isPaused = true;
    }

    resume() {
        this.state.isPaused = false;
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0.1, Math.min(10, scale));
        const valueSpan = document.getElementById('timeScaleValue');
        if (valueSpan) {
            valueSpan.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
    }

    resetView() {
        this.camera.position.set(500, 300, 500);
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
        }
        this.camera.lookAt(0, 0, 0);
        
        this.deselectPlanet();
    }

    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        this.orbits.forEach(orbit => {
            orbit.visible = this.state.showOrbits;
        });
        
        const btn = document.getElementById('showOrbits');
        if (btn) btn.classList.toggle('active', this.state.showOrbits);
    }

    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        this.labels.forEach(label => {
            label.visible = this.state.showLabels;
        });
        
        const btn = document.getElementById('showLabels');
        if (btn) btn.classList.toggle('active', this.state.showLabels);
    }

    toggleAsteroids() {
        this.state.showAsteroids = !this.state.showAsteroids;
        if (this.asteroidBelt) {
            this.asteroidBelt.visible = this.state.showAsteroids;
        }
        
        const btn = document.getElementById('showAsteroids');
        if (btn) btn.classList.toggle('active', this.state.showAsteroids);
    }

    toggleRealisticMode() {
        this.state.realisticMode = !this.state.realisticMode;
        // הוספת לוגיקה למצב ריאליסטי
        const btn = document.getElementById('realisticMode');
        if (btn) btn.classList.toggle('active', this.state.realisticMode);
    }

    // הגדרת מקשי קיצור
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (event.code) {
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
                case 'Escape':
                    event.preventDefault();
                    this.deselectPlanet();
                    break;
            }
        });
    }

    // הגדרת אירועי חלון
    setupWindowEvents() {
        window.addEventListener('resize', () => this.handleResize());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    // טיפול בשינוי גודל חלון
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    // עדכון התקדמות טעינה
    updateLoadingProgress(text, percentage) {
        const loadingText = document.getElementById('loadingText');
        const loadingProgress = document.getElementById('loadingProgress');
        
        if (loadingText) loadingText.textContent = text;
        if (loadingProgress) loadingProgress.style.width = percentage + '%';
        
        this.loadingProgress.current = text;
        this.loadingProgress.loaded = percentage;
    }

    // סיום אתחול
    finishInitialization() {
        this.updateLoadingProgress('מוכן לשימוש!', 100);
        
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
            this.isInitialized = true;
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
        
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    // אתחול מנוע פיזיקה
    initPhysicsEngine() {
        // placeholder לעתיד
    }

    // פונקציות debug
    getState() {
        return {
            ...this.state,
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
            performance: { ...this.performance },
            loadingProgress: { ...this.loadingProgress }
        };
    }

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
        
        if (this.controls && this.controls.dispose) {
            this.controls.dispose();
        }
        
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
        this.app = null;
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

        if (this.panel) {
            this.panel.addEventListener('click', (event) => {
                if (event.target === this.panel) {
                    this.hide();
                }
            });
        }

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
        const nameElement = document.getElementById('planetName');
        if (nameElement) {
            nameElement.textContent = planetData.hebrewName || planetData.name;
        }

        const descElement = document.getElementById('planetDescription');
        if (descElement) {
            descElement.textContent = planetData.description || 'מידע לא זמין';
        }

        this.updatePlanetData(planetData);
        this.updateInterestingFacts(planetData);
    }

    updatePlanetData(planetData) {
        const dataContainer = document.getElementById('planetData');
        if (!dataContainer) return;

        dataContainer.innerHTML = '';

        const dataItems = [
            { label: 'מרחק מהשמש', value: this.formatDistance(planetData.distance) },
            { label: 'רדיוס', value: this.formatRadius(planetData.radius) },
            { label: 'מסה', value: this.formatMass(planetData.mass) },
            { label: 'תקופת מסלול', value: this.formatPeriod(planetData.period) },
            { label: 'תקופת סיבוב', value: this.formatRotation(planetData.rotationPeriod) },
            { label: 'טמפרטורה', value: this.formatTemperature(planetData.temperature) }
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
        return `${(distance * 149.6).toFixed(1)} מיליון ק"מ`;
    }

    formatRadius(radius) {
        if (!radius) return 'לא זמין';
        return `${radius.toLocaleString()} ק"מ`;
    }

    formatMass(mass) {
        if (!mass) return 'לא זמין';
        return `${mass.toExponential(2)} ק"ג`;
    }

    formatPeriod(period) {
        if (!period) return 'לא זמין';
        if (period < 1) return `${(period * 365).toFixed(0)} ימים`;
        return `${period.toFixed(1)} שנים`;
    }

    formatRotation(rotation) {
        if (!rotation) return 'לא זמין';
        if (rotation < 0) return `${Math.abs(rotation).toFixed(1)} שעות (לאחור)`;
        if (rotation < 1) return `${(rotation * 24).toFixed(1)} שעות`;
        return `${rotation.toFixed(1)} ימים`;
    }

    formatTemperature(temp) {
        if (!temp) return 'לא זמין';
        return `${temp}°C`;
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

// ייצוא לשימוש במודולים אחרים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImprovedSolarSystemApp, ImprovedInfoPanel };
}
