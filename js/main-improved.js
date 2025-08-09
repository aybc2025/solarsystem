// מחלקת האפליקציה המרכזית - מתוקנת עם תנועה תקינה ומידע מלא
class ImprovedSolarSystemApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.ui = null;
        
        // אובייקטים במערכת השמש
        this.sun = null;
        this.planets = new Map();
        this.asteroidBelt = null;
        this.stars = null;
        
        // מיקומים והצגה
        this.orbits = new Map();
        this.labels = new Map();
        
        // מצב האפליקציה
        this.state = {
            isLoading: true,
            isPaused: false,
            timeScale: 1,
            showOrbits: true,
            showLabels: true,
            showAsteroids: true,
            realisticMode: false,
            selectedPlanet: null,
            cameraMode: 'free'
        };
        
        // זמן ואנימציה
        this.time = {
            current: 0,
            delta: 0,
            lastFrame: performance.now()
        };
        
        // ביצועים
        this.performance = {
            fps: 0,
            frameCount: 0,
            lastTime: 0,
            lastFpsUpdate: 0
        };
        
        // Raycaster לזיהוי לחיצות
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // אתחול התחלתי
        this.isInitialized = false;
    }

    // אתחול האפליקציה
    async init() {
        try {
            this.updateLoadingProgress('מתחיל אתחול...', 0);
            
            // אתחול Three.js
            await this.initThreeJS();
            
            // יצירת הסצנה
            await this.createScene();
            
            // הגדרת ממשק המשתמש
            await this.setupUI();
            
            // הגדרת אירועי לחיצה
            this.setupClickEvents();
            
            // התחלת הלולאה
            this.startRenderLoop();
            
            // סיום
            this.finishLoading();
            
            this.isInitialized = true;
            console.log('✅ ImprovedSolarSystemApp initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize solar system:', error);
            this.showError(error.message);
        }
    }

    // אתחול Three.js
    async initThreeJS() {
        this.updateLoadingProgress('מאתחל מנוע 3D...', 10);
        
        // יצירת סצנה
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // יצירת מצלמה
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        
        // מיקום מצלמה ראשוני
        this.camera.position.set(300, 150, 300);
        
        // יצירת renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('scene'),
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // בקרות מצלמה
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.maxDistance = 2000;
            this.controls.minDistance = 10;
        }
    }

    // יצירת הסצנה
    async createScene() {
        this.updateLoadingProgress('יוצר רקע כוכבים...', 25);
        
        // יצירת רקע כוכבים
        this.createStarField();
        
        // הוספת תאורה
        this.setupLighting();
        
        // יצירת אובייקטי מערכת השמש
        await this.createSolarSystemObjects();
    }

    // יצירת שדה כוכבים
    createStarField() {
        const starCount = 8000;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // התפלגות כדורית
            const radius = 3000 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבעי כוכבים מגוונים
            const starType = Math.random();
            if (starType < 0.7) {
                // כוכבים לבנים
                colors[i3] = 1;
                colors[i3 + 1] = 1;
                colors[i3 + 2] = 1;
            } else if (starType < 0.85) {
                // כוכבים כחולים
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1;
            } else {
                // כוכבים אדומים/כתומים
                colors[i3] = 1;
                colors[i3 + 1] = 0.7;
                colors[i3 + 2] = 0.4;
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
        this.scene.add(stars);
        this.stars = stars;
    }

    // הגדרת תאורה
    setupLighting() {
        // אור שמש מרכזי
        const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 1000;
        this.scene.add(sunLight);
        
        // אור סביבה עדין
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
    }

    // יצירת אובייקטים במערכת השמש
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר השמש...', 45);
        
        // יצירת השמש
        this.createRealisticSun();
        
        this.updateLoadingProgress('יוצר כוכבי לכת...', 55);
        
        // יצירת כוכבי הלכת עם צבעים מציאותיים
        const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        for (const planetName of planetNames) {
            try {
                this.createRealisticPlanet(planetName);
            } catch (error) {
                console.warn(`Failed to create planet ${planetName}:`, error);
            }
        }
        
        this.updateLoadingProgress('יוצר חגורת אסטרואידים...', 75);
        
        // יצירת חגורת האסטרואידים
        await this.createAsteroidBelt();
    }

    // יצירת שמש מציאותית
    createRealisticSun() {
        const sunData = PLANETS_DATA.sun;
        
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 64, 64);
        
        // חומר השמש עם אפקטי זוהר
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 1
        });
        
        const sunMesh = new THREE.Mesh(geometry, material);
        sunMesh.name = 'sun';
        sunMesh.userData = { 
            planetName: 'sun', 
            data: sunData, 
            type: 'star',
            rotationSpeed: 0.005
        };
        
        // אפקט קורונה
        const coronaGeometry = new THREE.SphereGeometry(sunData.scaledRadius * 1.2, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        sunMesh.add(corona);
        
        // הוספת אור נקודתי
        const pointLight = new THREE.PointLight(0xFFFFFF, 1.5, 1000);
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = true;
        sunMesh.add(pointLight);
        
        this.scene.add(sunMesh);
        this.sun = { 
            mesh: sunMesh, 
            light: pointLight, 
            corona: corona,
            update: (deltaTime) => {
                sunMesh.rotation.y += sunMesh.userData.rotationSpeed * deltaTime * 0.001;
                corona.rotation.y += sunMesh.userData.rotationSpeed * deltaTime * 0.0008;
                
                // אפקט נשימה לקורונה
                const pulse = Math.sin(performance.now() * 0.001) * 0.05 + 0.95;
                corona.scale.setScalar(pulse);
            }
        };
        
        console.log('✅ Realistic sun created');
    }

    // יצירת כוכב לכת מציאותי
    createRealisticPlanet(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return;
        
        // גיאומטריה עם רזולוציה גבוהה
        const geometry = new THREE.SphereGeometry(planetData.scaledRadius, 64, 64);
        
        // חומרים מותאמים לכל כוכב לכת
        let material;
        
        switch(planetName) {
            case 'mercury':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0x8C7853,
                    shininess: 30
                });
                break;
                
            case 'venus':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0xFFC649,
                    transparent: true,
                    opacity: 0.9
                });
                break;
                
            case 'earth':
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x4F94CD,
                    shininess: 60,
                    specular: 0x222222
                });
                break;
                
            case 'mars':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0xCD5C5C
                });
                break;
                
            case 'jupiter':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0xD2691E
                });
                break;
                
            case 'saturn':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0xFAD5A5
                });
                break;
                
            case 'uranus':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0x4FD0E7
                });
                break;
                
            case 'neptune':
                material = new THREE.MeshLambertMaterial({ 
                    color: 0x4169E1
                });
                break;
                
            default:
                material = new THREE.MeshLambertMaterial({ 
                    color: planetData.color
                });
        }
        
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = planetName;
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        
        // הוספת אטמוספירה לכוכבי לכת מתאימים
        if (['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(planetName)) {
            this.addAtmosphere(planetMesh, planetName);
        }
        
        // הוספת טבעות לשבתאי
        if (planetName === 'saturn') {
            this.addRings(planetMesh, planetData.scaledRadius);
        }
        
        // מיקום ראשוני
        const initialAngle = INITIAL_POSITIONS[planetName]?.angle || Math.random() * Math.PI * 2;
        planetMesh.position.set(
            Math.cos(initialAngle) * planetData.scaledDistance,
            0,
            Math.sin(initialAngle) * planetData.scaledDistance
        );
        
        // פרמטרי מסלול מדויקים
        planetMesh.userData = {
            orbitalSpeed: Math.sqrt(1 / planetData.scaledDistance) * 0.001,
            rotationSpeed: (2 * Math.PI) / (Math.abs(planetData.rotationPeriod) * 60) * 0.1,
            distance: planetData.scaledDistance,
            angle: initialAngle,
            planetName: planetName,
            data: planetData,
            type: 'planet'
        };
        
        // סיבוב הפוך לוונוס ואורנוס
        if (planetName === 'venus' || planetName === 'uranus') {
            planetMesh.userData.rotationSpeed *= -1;
        }
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, planetData);
        
        console.log(`✅ Realistic planet ${planetName} created`);
    }

    // הוספת אטמוספירה
    addAtmosphere(planetMesh, planetName) {
        const atmosphereGeometry = new THREE.SphereGeometry(
            planetMesh.geometry.parameters.radius * 1.05, 
            32, 32
        );
        
        let atmosphereColor;
        switch(planetName) {
            case 'venus': atmosphereColor = 0xFFF8DC; break;
            case 'earth': atmosphereColor = 0x87CEEB; break;
            case 'mars': atmosphereColor = 0xDEB887; break;
            case 'jupiter': atmosphereColor = 0xF4A460; break;
            case 'saturn': atmosphereColor = 0xF5DEB3; break;
            case 'uranus': atmosphereColor = 0x40E0D0; break;
            case 'neptune': atmosphereColor = 0x4169E1; break;
            default: atmosphereColor = 0xCCCCCC;
        }
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: atmosphereColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planetMesh.add(atmosphere);
    }

    // הוספת טבעות לשבתאי
    addRings(planetMesh, radius) {
        const ringGeometry = new THREE.RingGeometry(radius * 1.3, radius * 2.0, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xF5F5DC,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planetMesh.add(rings);
        
        return rings;
    }

    // יצירת מסלול כוכב לכת
    createOrbit(planetName, planetData) {
        if (!this.state.showOrbits) return;
        
        const radius = planetData.scaledDistance;
        const segments = 128;
        
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.name = `${planetName}Orbit`;
        
        this.scene.add(orbit);
        this.orbits.set(planetName, orbit);
    }

    // יצירת חגורת אסטרואידים
    async createAsteroidBelt() {
        try {
            const innerRadius = 120;
            const outerRadius = 180;
            const asteroidCount = 3000;
            const thickness = 10;
            
            const asteroidGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(asteroidCount * 3);
            const colors = new Float32Array(asteroidCount * 3);
            const sizes = new Float32Array(asteroidCount);
            
            for (let i = 0; i < asteroidCount; i++) {
                const i3 = i * 3;
                
                const angle = Math.random() * Math.PI * 2;
                const radiusVariation = Math.random();
                const radius = innerRadius + (outerRadius - innerRadius) * radiusVariation;
                
                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = (Math.random() - 0.5) * thickness;
                positions[i3 + 2] = Math.sin(angle) * radius;
                
                const colorVariation = 0.3 + Math.random() * 0.4;
                colors[i3] = colorVariation;
                colors[i3 + 1] = colorVariation * 0.9;
                colors[i3 + 2] = colorVariation * 0.8;
                
                sizes[i] = 0.5 + Math.random() * 2;
            }
            
            asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            asteroidGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            const asteroidMaterial = new THREE.PointsMaterial({
                size: 1.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });
            
            this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
            this.asteroidBelt.name = 'asteroidBelt';
            this.asteroidBelt.userData = {
                rotationSpeed: 0.0001,
                originalPositions: positions.slice()
            };
            
            this.scene.add(this.asteroidBelt);
            
            console.log('✅ Asteroid belt created successfully');
            
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
    }

    // הגדרת אירועי לחיצה
    setupClickEvents() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                this.handleClick(touch);
            }
        });
    }

    // טיפול בלחיצות
    handleClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersectableObjects = [];
        
        // הוספת השמש
        if (this.sun && this.sun.mesh) {
            intersectableObjects.push(this.sun.mesh);
        }
        
        // הוספת כוכבי הלכת
        this.planets.forEach((planet) => {
            intersectableObjects.push(planet);
        });
        
        const intersects = this.raycaster.intersectObjects(intersectableObjects, true);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const planetName = this.findPlanetName(clickedObject);
            
            if (planetName) {
                this.selectPlanet(planetName);
            }
        }
    }

    // חיפוש שם כוכב לכת
    findPlanetName(object) {
        if (object.name && ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(object.name)) {
            return object.name;
        }
        
        if (object.userData && object.userData.planetName) {
            return object.userData.planetName;
        }
        
        if (object.parent && object.parent.userData && object.parent.userData.planetName) {
            return object.parent.userData.planetName;
        }
        
        let currentObject = object;
        while (currentObject.parent && currentObject.parent !== this.scene) {
            if (currentObject.parent.name && ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(currentObject.parent.name)) {
                return currentObject.parent.name;
            }
            currentObject = currentObject.parent;
        }
        
        return null;
    }

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        console.log(`Planet selected: ${planetName}`);
        
        this.state.selectedPlanet = planetName;
        
        this.focusOnPlanet(planetName);
        
        // הצגת מידע
        if (window.infoPanel && typeof window.infoPanel.showPlanetInfo === 'function') {
            window.infoPanel.showPlanetInfo(planetName);
        } else if (this.ui && typeof this.ui.showPlanetInfo === 'function') {
            this.ui.showPlanetInfo(planetName);
        } else {
            this.showSimplePlanetInfo(planetName);
        }
    }

    // הצגת מידע פשוט
    showSimplePlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (planetData) {
            const facts = planetData.facts ? planetData.facts.slice(0, 3).join('\n• ') : 'אין עובדות זמינות';
            alert(`🪐 ${planetData.name}\n\n📝 ${planetData.description}\n\n✨ עובדות מעניינות:\n• ${facts}`);
        }
    }

    // ביטול בחירת כוכב לכת
    deselectPlanet() {
        console.log('Planet deselected');
        this.state.selectedPlanet = null;
        
        if (window.infoPanel && typeof window.infoPanel.hide === 'function') {
            window.infoPanel.hide();
        } else if (this.ui && typeof this.ui.closeInfoPanel === 'function') {
            this.ui.closeInfoPanel();
        }
    }

    // התמקדות על כוכב לכת
    focusOnPlanet(planetName) {
        const planet = this.planets.get(planetName) || (planetName === 'sun' ? this.sun.mesh : null);
        if (!planet || !this.camera) return;
        
        let planetPosition;
        if (planet.position) {
            planetPosition = planet.position.clone();
        } else if (planet.mesh && planet.mesh.position) {
            planetPosition = planet.mesh.position.clone();
        } else {
            planetPosition = new THREE.Vector3();
        }
        
        const planetData = PLANETS_DATA[planetName];
        const distance = planetData ? planetData.scaledRadius * 8 : 60;
        
        const cameraPosition = planetPosition.clone();
        cameraPosition.add(new THREE.Vector3(distance, distance * 0.5, distance));
        
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(planetPosition);
        
        if (this.controls && this.controls.target) {
            this.controls.target.copy(planetPosition);
        }
        
        console.log(`Focused on ${planetName}`);
    }

    // עדכון הודעת טעינה
    updateLoadingProgress(message, percentage) {
        const loadingText = document.getElementById('loadingText');
        const progressBar = document.getElementById('progressBar');
        
        if (loadingText) loadingText.textContent = message;
        if (progressBar) progressBar.style.width = percentage + '%';
        
        console.log(`Loading: ${message} (${percentage}%)`);
    }

    // הגדרת ממשק משתמש
    async setupUI() {
        this.updateLoadingProgress('מגדיר ממשק משתמש...', 85);
        
        if (typeof UIControls !== 'undefined') {
            this.ui = new UIControls();
            await this.ui.init(this);
        } else {
            this.setupBasicControls();
        }
        
        this.setupEventListeners();
    }

    // הגדרת בקרות בסיסיות
    setupBasicControls() {
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        const resetBtn = document.getElementById('resetView');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetView());
        }
        
        const timeSpeedSlider = document.getElementById('timeSpeed');
        if (timeSpeedSlider) {
            timeSpeedSlider.addEventListener('input', (event) => {
                this.setTimeScale(parseFloat(event.target.value));
            });
        }
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
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
                case 'KeyO':
                    event.preventDefault();
                    this.toggleOrbits();
                    break;
                case 'KeyL':
                    event.preventDefault();
                    this.toggleLabels();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.deselectPlanet();
                    break;
            }
        });
    }

    // התחלת לולאת הרינדור
    startRenderLoop() {
        this.updateLoadingProgress('מתחיל רנדור...', 95);
        
        const animate = (currentTime) => {
            this.time.delta = currentTime - this.time.lastFrame;
            this.time.lastFrame = currentTime;
            
            if (!this.state.isPaused) {
                this.time.current += this.time.delta * this.state.timeScale;
            }
            
            this.updateObjects(this.time.delta);
            
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            this.renderer.render(this.scene, this.camera);
            
            this.updatePerformance(currentTime);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אובייקטים - תיקון עיקרי לתנועה
    updateObjects(deltaTime) {
        if (this.state.isPaused) return;
        
        const scaledDelta = deltaTime * this.state.timeScale * 0.001;
        
        // עדכון השמש
        if (this.sun && this.sun.update) {
            this.sun.update(scaledDelta);
        }
        
        // עדכון כוכבי הלכת - תיקון עיקרי
        this.planets.forEach((planet, planetName) => {
            if (planet && planet.userData) {
                // עדכון זווית המסלול
                planet.userData.angle += planet.userData.orbitalSpeed * scaledDelta;
                
                // חישוב מיקום חדש במסלול
                const distance = planet.userData.distance;
                const angle = planet.userData.angle;
                
                planet.position.x = Math.cos(angle) * distance;
                planet.position.z = Math.sin(angle) * distance;
                planet.position.y = 0;
                
                // סיבוב עצמי
                if (planet.userData.rotationSpeed) {
                    planet.rotation.y += planet.userData.rotationSpeed * scaledDelta;
                }
            }
        });
        
        // עדכון חגורת אסטרואידים
        if (this.asteroidBelt && this.asteroidBelt.userData) {
            this.asteroidBelt.rotation.y += this.asteroidBelt.userData.rotationSpeed * scaledDelta;
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
            const fpsElement = document.getElementById('fps');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.performance.fps}`;
            }
        }
    }

    // טיפול בשינוי גודל
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        console.log('Window resized');
    }

    // פונקציות בקרה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        console.log(`Animation ${this.state.isPaused ? 'paused' : 'resumed'}`);
        
        // עדכון UI
        if (this.ui && this.ui.updatePlayPauseButton) {
            this.ui.updatePlayPauseButton();
        }
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(10, scale));
        console.log(`Time scale set to: ${this.state.timeScale}x`);
    }

    resetView() {
        this.camera.position.set(300, 150, 300);
        this.camera.lookAt(0, 0, 0);
        
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
        
        this.deselectPlanet();
        
        console.log('View reset to default');
    }

    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        this.updateOrbitsVisibility();
        console.log(`Orbits visibility: ${this.state.showOrbits}`);
    }

    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        console.log(`Labels visibility: ${this.state.showLabels}`);
    }

    toggleAsteroids() {
        this.state.showAsteroids = !this.state.showAsteroids;
        
        if (this.asteroidBelt) {
            this.asteroidBelt.visible = this.state.showAsteroids;
        }
        
        console.log(`Asteroids visibility: ${this.state.showAsteroids}`);
    }

    toggleRealisticMode() {
        this.state.realisticMode = !this.state.realisticMode;
        console.log(`Realistic mode: ${this.state.realisticMode}`);
    }

    // עדכון מסלולים
    updateOrbitsVisibility() {
        this.orbits.forEach(orbit => {
            orbit.visible = this.state.showOrbits;
        });
    }

    // סיום טעינה
    finishLoading() {
        this.updateLoadingProgress('מוכן!', 100);
        this.state.isLoading = false;
        
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
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ שגיאה באפליקציה</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: white; color: black; border: none; border-radius: 5px; cursor: pointer;">🔄 טען מחדש</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // קבלת מצב האפליקציה
    getStatus() {
        return {
            isPaused: this.state.isPaused,
            timeScale: this.state.timeScale,
            selectedPlanet: this.state.selectedPlanet,
            showOrbits: this.state.showOrbits,
            showLabels: this.state.showLabels,
            showAsteroids: this.state.showAsteroids,
            planetsCount: this.planets.size,
            isInitialized: this.isInitialized,
            fps: this.performance.fps
        };
    }

    // ניקוי משאבים
    dispose() {
        if (this.sun && this.sun.dispose) this.sun.dispose();
        this.planets.forEach(planet => {
            if (planet.dispose) planet.dispose();
        });
        
        if (this.asteroidBelt) {
            if (this.asteroidBelt.geometry) this.asteroidBelt.geometry.dispose();
            if (this.asteroidBelt.material) this.asteroidBelt.material.dispose();
        }
        
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) object.material.dispose();
            });
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
        console.log('ImprovedSolarSystemApp disposed');
    }
}

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.ImprovedSolarSystemApp = ImprovedSolarSystemApp;
}
