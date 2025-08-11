// מחלקת האפליקציה המרכזית - מתוקנת עם אנימציה פועלת ומסלולים אליפטיים
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
        
        // מצב האפליקציה - תיקון: isPaused מתחיל ב-false
        this.state = {
            isLoading: true,
            isPaused: false, // תיקון: שונה מ-true ל-false כדי שהאנימציה תרוץ
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
            lastFrame: performance.now(),
            elapsed: 0
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
        this.animationId = null;
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
            console.log('Animation state: isPaused =', this.state.isPaused, 'timeScale =', this.state.timeScale);
            
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
        this.scene.background = new THREE.Color(0x000000);
        
        // יצירת מצלמה
        this.camera = new THREE.PerspectiveCamera(
            60, // זווית ראיה
            window.innerWidth / window.innerHeight, // יחס רוחב-גובה
            0.1, // near plane
            10000 // far plane
        );
        
        // מיקום מצלמה ראשוני
        this.camera.position.set(300, 150, 300);
        this.camera.lookAt(0, 0, 0);
        
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
        const starCount = 15000;
        const starGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // התפלגות כדורית
            const radius = 3000 + Math.random() * 2000;
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
                    if (planetMesh.name !== planetName) {
                        planetMesh.name = planetName;
                    }
                    if (planetMesh.userData) {
                        planetMesh.userData.planetName = planetName;
                    } else {
                        planetMesh.userData = { planetName: planetName };
                    }
                    
                    this.scene.add(planetMesh);
                    this.planets.set(planetName, planet);
                    
                    // יצירת מסלול אליפטי
                    this.createEllipticalOrbit(planetName, planet.data);
                } else {
                    // יצירת כוכב לכת פשוט אם המחלקה לא קיימת
                    this.createSimplePlanet(planetName);
                }
                
            } catch (error) {
                console.warn(`Failed to create planet ${planetName}:`, error);
            }
        }
        
        this.updateLoadingProgress('יוצר חגורת אסטרואידים...', 75);
        
        // יצירת חגורת האסטרואידים
        await this.createAsteroidBelt();
    }

    // יצירת שמש פשוטה עם חומר מתוקן
    createSimpleSun() {
        const sunData = PLANETS_DATA.sun;
        
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 32, 32);
        
        // תיקון: שימוש ב-MeshPhongMaterial
        const material = new THREE.MeshPhongMaterial({ 
            color: sunData.color,
            emissive: sunData.emissive || sunData.color,
            emissiveIntensity: 0.3
        });
        
        const sunMesh = new THREE.Mesh(geometry, material);
        sunMesh.name = 'sun';
        sunMesh.userData = { planetName: 'sun', data: sunData };
        
        // הוספת אור נקודתי לשמש
        const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = true;
        sunMesh.add(pointLight);
        
        this.scene.add(sunMesh);
        this.sun = { mesh: sunMesh, light: pointLight };
        
        console.log('✅ Simple sun created');
    }

    // יצירת כוכב לכת פשוט
    // **תיקון: יצירת כוכב לכת פשוט עם חומר ומסלול מדויקים**
    createSimplePlanet(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return;
        
        // יצירת גיאומטריה וחומר
        const geometry = new THREE.SphereGeometry(planetData.scaledRadius, 32, 32);
        
        // **תיקון: שימוש ב-MeshLambertMaterial ללא roughness**
        const material = new THREE.MeshLambertMaterial({ 
            color: planetData.color,
            transparent: false
        });
        
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = planetName;
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        
        // **תיקון 1: מיקום ראשוני מדויק עם אקסצנטריות**
        const initialTime = 0; // התחלה בזמן 0
        const initialPosition = MathUtils.calculateOrbitalPosition(
            initialTime,
            planetData.orbitalPeriod || 365.25,
            planetData.scaledDistance,
            planetData.eccentricity || 0,
            MathUtils.degToRad(planetData.inclination || 0)
        );
        
        planetMesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        
        // פרמטרי מסלול מדויקים
        planetMesh.userData = {
            // **תיקון: שימוש בתקופה אמיתית במקום נוסחה גנרית**
            orbitalPeriod: planetData.orbitalPeriod || 365.25, // ימים
            orbitalSpeed: (2 * Math.PI) / (planetData.orbitalPeriod || 365.25), // רדיאנים ליום
            rotationSpeed: (2 * Math.PI) / (Math.abs(planetData.rotationPeriod) || 1), // רדיאנים ליום
            eccentricity: planetData.eccentricity || 0,
            inclination: MathUtils.degToRad(planetData.inclination || 0),
            distance: planetData.scaledDistance,
            time: initialTime, // זמן נוכחי במסלול
            planetName: planetName,
            data: planetData
        };
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, planetData);
        
        console.log(`✅ Planet ${planetName} created with realistic orbital mechanics`);
    }

    // יצירת מסלול אליפטי אמיתי
    createEllipticalOrbit(planetName, planetData) {
        if (!this.state.showOrbits) return;
        
        const semiMajorAxis = planetData.scaledDistance;
        const eccentricity = planetData.eccentricity || 0;
        
        // חישוב פרמטרים של האליפסה
        const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
        const focus = semiMajorAxis * eccentricity;
        
        // יצירת path אליפטי
        const curve = new THREE.EllipseCurve(
            -focus, 0,  // מרכז האליפסה (הזזה למוקד)
            semiMajorAxis, semiMinorAxis,  // רדיוסים
            0, 2 * Math.PI,  // זוויות התחלה וסיום
            false,  // כיוון השעון
            0  // סיבוב
        );
        
        const points = curve.getPoints(128);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const orbit = new THREE.Line(geometry, material);
        orbit.rotation.x = -Math.PI / 2; // מישור האקליפטיקה
        orbit.name = `${planetName}Orbit`;
        
        this.scene.add(orbit);
        this.orbits.set(planetName, orbit);
        
        console.log(`Created elliptical orbit for ${planetName} with eccentricity ${eccentricity}`);
    }

    // יצירת חגורת אסטרואידים
    async createAsteroidBelt() {
        try {
            console.log('Creating asteroid belt...');
            
            const innerRadius = 120;
            const outerRadius = 180;
            const asteroidCount = 5000;
            const thickness = 15;
            
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
                
                sizes[i] = 0.5 + Math.random() * 2.5;
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
            
            await this.createMajorAsteroids();
            
            console.log('✅ Asteroid belt created successfully');
            
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
    }

    // יצירת אסטרואידים גדולים
    async createMajorAsteroids() {
        const majorAsteroids = [
            { name: 'Ceres', radius: 3, distance: 135, angle: 0, color: 0x8b7765 },
            { name: 'Vesta', radius: 2, distance: 145, angle: Math.PI / 3, color: 0xa0522d },
            { name: 'Pallas', radius: 1.8, distance: 155, angle: Math.PI * 2/3, color: 0x696969 },
            { name: 'Hygiea', radius: 1.5, distance: 165, angle: Math.PI, color: 0x2f4f4f }
        ];
        
        majorAsteroids.forEach(asteroid => {
            const geometry = this.createIrregularAsteroidGeometry(asteroid.radius);
            
            // תיקון: MeshLambertMaterial בלי roughness
            const material = new THREE.MeshLambertMaterial({ 
                color: asteroid.color
            });
            
            const asteroidMesh = new THREE.Mesh(geometry, material);
            asteroidMesh.name = asteroid.name;
            asteroidMesh.castShadow = true;
            asteroidMesh.receiveShadow = true;
            
            asteroidMesh.position.set(
                Math.cos(asteroid.angle) * asteroid.distance,
                (Math.random() - 0.5) * 10,
                Math.sin(asteroid.angle) * asteroid.distance
            );
            
            asteroidMesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            asteroidMesh.userData = {
                orbitalSpeed: Math.sqrt(1 / asteroid.distance) * 0.0001,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                distance: asteroid.distance,
                angle: asteroid.angle,
                planetName: asteroid.name
            };
            
            this.scene.add(asteroidMesh);
        });
        
        console.log('✅ Major asteroids created');
    }

    // יצירת גיאומטריה לא סדירה לאסטרואיד
    createIrregularAsteroidGeometry(baseRadius) {
        const geometry = new THREE.SphereGeometry(baseRadius, 12, 8);
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1]; 
            const z = positions[i + 2];
            
            const noise = Math.sin(x * 2) * Math.sin(y * 2) * Math.sin(z * 2) * 0.3;
            const distortion = 1 + noise;
            
            positions[i] *= distortion;
            positions[i + 1] *= distortion;
            positions[i + 2] *= distortion;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return geometry;
    }

    // הגדרת אירועי לחיצה על כוכבי לכת
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
        
        if (this.sun && this.sun.mesh) {
            intersectableObjects.push(this.sun.mesh);
        }
        
        this.planets.forEach((planet, planetName) => {
            if (planet.mesh) {
                intersectableObjects.push(planet.mesh);
            } else if (planet.group) {
                intersectableObjects.push(planet.group);
            } else {
                intersectableObjects.push(planet);
            }
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

    // חיפוש שם כוכב לכת מאובייקט
    findPlanetName(object) {
        if (object.name && (object.name === 'sun' || ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(object.name))) {
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
        
        if (window.infoPanel && typeof window.infoPanel.showPlanetInfo === 'function') {
            window.infoPanel.showPlanetInfo(planetName);
        } else if (this.ui && typeof this.ui.showPlanetInfo === 'function') {
            this.ui.showPlanetInfo(planetName);
        } else {
            this.showSimplePlanetInfo(planetName);
        }
    }

    // הצגת מידע פשוט על כוכב לכת
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
        const planet = this.planets.get(planetName);
        if (!planet || !this.camera) return;
        
        let planetPosition;
        if (planet.mesh) {
            planetPosition = planet.mesh.position.clone();
        } else if (planet.position) {
            planetPosition = planet.position.clone();
        } else if (planet.group) {
            planetPosition = planet.group.position.clone();
        } else {
            planetPosition = planet.position ? planet.position.clone() : new THREE.Vector3();
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

    // הגדרת בקרות בסיסיות כחלופה
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

    // התחלת לולאת הרינדור - תיקון עיקרי לאנימציה
    startRenderLoop() {
        this.updateLoadingProgress('מתחיל רנדור...', 95);
        
        const animate = (currentTime) => {
            // חישוב delta time בצורה נכונה
            const deltaTime = currentTime - this.time.lastFrame;
            this.time.delta = deltaTime;
            this.time.lastFrame = currentTime;
            
            // עדכון זמן הסימולציה רק אם לא בהשהיה
            if (!this.state.isPaused) {
                this.time.current += deltaTime * this.state.timeScale;
                this.time.elapsed += deltaTime;
            }
            
            // עדכון אובייקטים תמיד (גם בהשהיה לסיבוב עצמי)
            this.updateObjects(deltaTime);
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // רינדור
            this.renderer.render(this.scene, this.camera);
            
            // עדכון ביצועים
            this.updatePerformance(currentTime);
            
            // המשך הלולאה
            this.animationId = requestAnimationFrame(animate);
        };
        
        // התחלת האנימציה
        requestAnimationFrame(animate);
        console.log('✅ Animation loop started');
    }

    // עדכון אובייקטים - תיקון התנועה האליפטית
    updateObjects(deltaTime) {
        if (!deltaTime || deltaTime > 1000) return; // מניעת קפיצות
        
        // עדכון השמש
        if (this.sun) {
            if (this.sun.update) {
                this.sun.update(deltaTime);
            } else if (this.sun.mesh) {
                // סיבוב השמש
                this.sun.mesh.rotation.y += deltaTime * 0.0001;
            }
        }
        
        // עדכון כוכבי הלכת עם תנועה אליפטית
        this.planets.forEach((planet, planetName) => {
            if (planet.update) {
                planet.update(deltaTime);
            } else if (planet.userData) {
                const data = planet.userData;
                
                // עדכון זווית במסלול רק אם לא בהשהיה
                if (!this.state.isPaused) {
                    data.angle += data.orbitalSpeed * deltaTime * this.state.timeScale;
                    
                    // חישוב מיקום אליפטי
                    const eccentricity = data.eccentricity || 0;
                    const semiMajorAxis = data.distance;
                    
                    // חישוב anomaly אקסצנטרית (פשוט)
                    const E = data.angle;
                    
                    // חישוב מרחק מהמוקד
                    const r = semiMajorAxis * (1 - eccentricity * Math.cos(E));
                    
                    // חישוב מיקום
                    const trueAnomaly = E + eccentricity * Math.sin(E);
                    planet.position.x = r * Math.cos(trueAnomaly);
                    planet.position.z = r * Math.sin(trueAnomaly);
                    planet.position.y = 0; // שמירה על מישור אקליפטיקה
                }
                
                // סיבוב עצמי תמיד (גם בהשהיה)
                if (data.rotationSpeed) {
                    planet.rotation.y += data.rotationSpeed * deltaTime;
                }
            }
        });
        
        // עדכון חגורת אסטרואידים
        if (this.asteroidBelt && this.asteroidBelt.userData && !this.state.isPaused) {
            this.asteroidBelt.rotation.y += this.asteroidBelt.userData.rotationSpeed * deltaTime * this.state.timeScale;
        }
        
        // עדכון אסטרואידים גדולים
        this.scene.traverse((object) => {
            if (object.userData && object.userData.planetName && 
                ['Ceres', 'Vesta', 'Pallas', 'Hygiea'].includes(object.userData.planetName)) {
                
                const data = object.userData;
                
                if (!this.state.isPaused) {
                    data.angle += data.orbitalSpeed * deltaTime * this.state.timeScale;
                    
                    object.position.x = Math.cos(data.angle) * data.distance;
                    object.position.z = Math.sin(data.angle) * data.distance;
                }
                
                // סיבוב עצמי
                if (data.rotationSpeed) {
                    object.rotation.x += data.rotationSpeed * deltaTime;
                    object.rotation.y += data.rotationSpeed * deltaTime * 0.7;
                }
            }
        });
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
        
        // עדכון כפתור
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(10, scale));
        console.log(`Time scale set to: ${this.state.timeScale}x`);
        
        // עדכון תצוגה
        const timeScaleElement = document.getElementById('timeScale');
        if (timeScaleElement) {
            timeScaleElement.textContent = `זמן: ${this.state.timeScale.toFixed(1)}x`;
        }
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
        
        // עדכון גדלים אם נדרש
        if (this.state.realisticMode) {
            // הקטנת כוכבי הלכת הפנימיים
            this.planets.forEach((planet, name) => {
                if (['mercury', 'venus', 'earth', 'mars'].includes(name)) {
                    if (planet.scale) {
                        planet.scale.setScalar(0.5);
                    }
                }
            });
        } else {
            // החזרה לגודל רגיל
            this.planets.forEach((planet) => {
                if (planet.scale) {
                    planet.scale.setScalar(1);
                }
            });
        }
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
            realisticMode: this.state.realisticMode,
            planetsCount: this.planets.size,
            isInitialized: this.isInitialized,
            fps: this.performance.fps
        };
    }

    // ניקוי משאבים
    dispose() {
        // עצירת אנימציה
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
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
