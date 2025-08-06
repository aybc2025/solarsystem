// מחלקת האפליקציה המרכזית - מתוקנת עם לחיצה על כוכבי לכת ותיקוני חומרים
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
        
        // **הוספה: Raycaster לזיהוי לחיצות**
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
            
            // **הוספה: הגדרת אירועי לחיצה**
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
                    // **תיקון: וידוא שיש שם לאובייקט לזיהוי**
                    if (planetMesh.name !== planetName) {
                        planetMesh.name = planetName;
                    }
                    if (planetMesh.userData) {
                        planetMesh.userData.planetName = planetName;
                    } else {
                        planetMesh.userData = { planetName: planetName };
                    }
                    
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
        
        // יצירת חגורת האסטרואידים - עם מרחקים מתוקנים
        await this.createAsteroidBelt();
    }

    // **תיקון: יצירת שמש פשוטה עם חומר מתוקן**
    createSimpleSun() {
        const sunData = PLANETS_DATA.sun;
        
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 32, 32);
        
        // **תיקון: החלפה ל-MeshPhongMaterial במקום MeshBasicMaterial**
        const material = new THREE.MeshPhongMaterial({ 
            color: sunData.color,
            emissive: sunData.emissive || sunData.color,
            emissiveIntensity: 0.3,
            shininess: 100
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
        
        console.log('✅ Simple sun created with corrected material');
    }

    // **תיקון: יצירת כוכב לכת פשוט עם חומר מתוקן**
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
        
        // מיקום ראשוני
        const initialAngle = INITIAL_POSITIONS[planetName]?.angle || 0;
        planetMesh.position.set(
            Math.cos(initialAngle) * planetData.scaledDistance,
            0,
            Math.sin(initialAngle) * planetData.scaledDistance
        );
        
        // פרמטרי מסלול
        planetMesh.userData = {
            orbitalSpeed: Math.sqrt(1 / planetData.scaledDistance) * 0.001,
            rotationSpeed: (2 * Math.PI) / (planetData.rotationPeriod * 60),
            distance: planetData.scaledDistance,
            angle: initialAngle,
            planetName: planetName,
            data: planetData
        };
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, planetData);
        
        console.log(`✅ Simple planet ${planetName} created with corrected material`);
    }

    // יצירת מסלול כוכב לכת
    createOrbit(planetName, planetData) {
        if (!this.state.showOrbits) return;
        
        const radius = planetData.scaledDistance;
        const segments = 64;
        
        const geometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, segments);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = -Math.PI / 2; // מישור האקליפטיקה
        orbit.name = `${planetName}Orbit`;
        
        this.scene.add(orbit);
        this.orbits.set(planetName, orbit);
    }

    // **תיקון: יצירת חגורת אסטרואידים עם חומרים מתוקנים**
    async createAsteroidBelt() {
        try {
            console.log('Creating asteroid belt...');
            
            // פרמטרי חגורת האסטרואידים - תיקון מיקום
            const innerRadius = 120; // תיקון: אחרי מאדים
            const outerRadius = 180;  // תיקון: לפני צדק
            const asteroidCount = 5000;
            const thickness = 15;
            
            // יצירת מערכת חלקיקים לאסטרואידים קטנים
            const asteroidGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(asteroidCount * 3);
            const colors = new Float32Array(asteroidCount * 3);
            const sizes = new Float32Array(asteroidCount);
            
            for (let i = 0; i < asteroidCount; i++) {
                const i3 = i * 3;
                
                // התפלגות במסלול דמוי טבעת
                const angle = Math.random() * Math.PI * 2;
                const radiusVariation = Math.random();
                const radius = innerRadius + (outerRadius - innerRadius) * radiusVariation;
                
                // מיקום במרחב
                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = (Math.random() - 0.5) * thickness;
                positions[i3 + 2] = Math.sin(angle) * radius;
                
                // צבע אקראי באפור-חום
                const colorVariation = 0.3 + Math.random() * 0.4;
                colors[i3] = colorVariation;
                colors[i3 + 1] = colorVariation * 0.9;
                colors[i3 + 2] = colorVariation * 0.8;
                
                // גודל אקראי
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
            
            // יצירת כמה אסטרואידים גדולים (קרס, וסטה, פלאס) - מיקום מתוקן
            await this.createMajorAsteroids();
            
            console.log('✅ Asteroid belt created successfully');
            
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
    }

    // **תיקון: יצירת אסטרואידים גדולים עם חומרים מתוקנים**
    async createMajorAsteroids() {
        const majorAsteroids = [
            { name: 'Ceres', radius: 3, distance: 135, angle: 0, color: 0x8b7765 },
            { name: 'Vesta', radius: 2, distance: 145, angle: Math.PI / 3, color: 0xa0522d },
            { name: 'Pallas', radius: 1.8, distance: 155, angle: Math.PI * 2/3, color: 0x696969 },
            { name: 'Hygiea', radius: 1.5, distance: 165, angle: Math.PI, color: 0x2f4f4f }
        ];
        
        majorAsteroids.forEach(asteroid => {
            // יצירת גיאומטריה לא סדירה
            const geometry = this.createIrregularAsteroidGeometry(asteroid.radius);
            
            // **תיקון: הסרת roughness מ-MeshLambertMaterial**
            const material = new THREE.MeshLambertMaterial({ 
                color: asteroid.color
                // הוסרה השורה: roughness: 0.9 (לא נתמכת)
            });
            
            const asteroidMesh = new THREE.Mesh(geometry, material);
            asteroidMesh.name = asteroid.name;
            asteroidMesh.castShadow = true;
            asteroidMesh.receiveShadow = true;
            
            // מיקום במסלול
            asteroidMesh.position.set(
                Math.cos(asteroid.angle) * asteroid.distance,
                (Math.random() - 0.5) * 10,
                Math.sin(asteroid.angle) * asteroid.distance
            );
            
            // סיבוב אקראי
            asteroidMesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // פרמטרי מסלול
            asteroidMesh.userData = {
                orbitalSpeed: Math.sqrt(1 / asteroid.distance) * 0.0001,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                distance: asteroid.distance,
                angle: asteroid.angle,
                planetName: asteroid.name
            };
            
            this.scene.add(asteroidMesh);
        });
        
        console.log('✅ Major asteroids created with corrected materials');
    }

    // יצירת גיאומטריה לא סדירה לאסטרואיד
    createIrregularAsteroidGeometry(baseRadius) {
        const geometry = new THREE.SphereGeometry(baseRadius, 12, 8);
        const positions = geometry.attributes.position.array;
        
        // עיוות הקודקודים ליצירת צורה לא סדירה
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1]; 
            const z = positions[i + 2];
            
            // רעש פשוט לעיוות
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

    // **הוספה: הגדרת אירועי לחיצה על כוכבי לכת**
    setupClickEvents() {
        const canvas = this.renderer.domElement;
        
        // לחיצה עם עכבר
        canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        // מגע במובייל
        canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                this.handleClick(touch);
            }
        });
    }

    // **הוספה: טיפול בלחיצות**
    handleClick(event) {
        // חישוב מיקום העכבר ביחס לcanvas
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // raycasting לזיהוי אובייקטים
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // בדיקת חיתוך עם כוכבי לכת
        const intersectableObjects = [];
        
        // הוספת השמש
        if (this.sun && this.sun.mesh) {
            intersectableObjects.push(this.sun.mesh);
        }
        
        // הוספת כוכבי הלכת
        this.planets.forEach((planet, planetName) => {
            if (planet.mesh) {
                intersectableObjects.push(planet.mesh);
            } else if (planet.group) {
                intersectableObjects.push(planet.group);
            } else {
                intersectableObjects.push(planet); // אם זה mesh ישיר
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

    // **הוספה: חיפוש שם כוכב לכת מאובייקט**
    findPlanetName(object) {
        // בדיקה ישירה לפי שם
        if (object.name && (object.name === 'sun' || ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(object.name))) {
            return object.name;
        }
        
        // בדיקה לפי userData
        if (object.userData && object.userData.planetName) {
            return object.userData.planetName;
        }
        
        // בדיקה לפי parent
        if (object.parent && object.parent.userData && object.parent.userData.planetName) {
            return object.parent.userData.planetName;
        }
        
        // בדיקה עמוקה יותר
        let currentObject = object;
        while (currentObject.parent && currentObject.parent !== this.scene) {
            if (currentObject.parent.name && ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(currentObject.parent.name)) {
                return currentObject.parent.name;
            }
            currentObject = currentObject.parent;
        }
        
        return null;
    }

    // **הוספה: בחירת כוכב לכת**
    selectPlanet(planetName) {
        console.log(`Planet selected: ${planetName}`);
        
        // עדכון מצב
        this.state.selectedPlanet = planetName;
        
        // התמקדות על כוכב לכת
        this.focusOnPlanet(planetName);
        
        // **תיקון: הצגת מידע ישירות במקום event emitter**
        if (window.infoPanel && typeof window.infoPanel.onPlanetSelected === 'function') {
            window.infoPanel.onPlanetSelected(planetName);
        } else if (this.ui && typeof this.ui.showPlanetInfo === 'function') {
            this.ui.showPlanetInfo(planetName);
        } else {
            // fallback לחלון מידע פשוט
            this.showSimplePlanetInfo(planetName);
        }
    }

    // **הוספה: הצגת מידע פשוט על כוכב לכת**
    showSimplePlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (planetData) {
            const facts = planetData.facts ? planetData.facts.slice(0, 3).join('\n• ') : 'אין עובדות זמינות';
            alert(`🪐 ${planetData.name}\n\n📝 ${planetData.description}\n\n✨ עובדות מעניינות:\n• ${facts}`);
        }
    }

    // **תיקון: ביטול בחירת כוכב לכת**
    deselectPlanet() {
        console.log('Planet deselected');
        
        // עדכון מצב
        this.state.selectedPlanet = null;
        
        // **תיקון: הסתרת מידע ישירות במקום event emitter**
        if (window.infoPanel && typeof window.infoPanel.onPlanetDeselected === 'function') {
            window.infoPanel.onPlanetDeselected();
        } else if (this.ui && typeof this.ui.closeInfoPanel === 'function') {
            this.ui.closeInfoPanel();
        }
    }

    // התמקדות על כוכב לכת
    focusOnPlanet(planetName) {
        const planet = this.planets.get(planetName);
        if (!planet || !this.camera) return;
        
        // קבלת מיקום כוכב הלכת
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
        
        // חישוב מרחק מתאים לצפייה
        const planetData = PLANETS_DATA[planetName];
        const distance = planetData ? planetData.scaledRadius * 8 : 60;
        
        // מיקום המצלמה ליד כוכב הלכת
        const cameraPosition = planetPosition.clone();
        cameraPosition.add(new THREE.Vector3(distance, distance * 0.5, distance));
        
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(planetPosition);
        
        // עדכון orbit controls אם קיימים
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
            timeSpeedSlider.addEventListener('input', (event) => {
                this.setTimeScale(parseFloat(event.target.value));
            });
        }
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // שינוי גודל חלון
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // קיצורי מקלדת
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
            // חישוב delta time
            this.time.delta = currentTime - this.time.lastFrame;
            this.time.lastFrame = currentTime;
            
            // עדכון זמן הסימולציה
            if (!this.state.isPaused) {
                this.time.current += this.time.delta * this.state.timeScale;
            }
            
            // עדכון אובייקטים
            this.updateObjects(this.time.delta);
            
            // עדכון בקרות
            if (this.controls && this.controls.update) {
                this.controls.update();
            }
            
            // רינדור
            this.renderer.render(this.scene, this.camera);
            
            // עדכון ביצועים
            this.updatePerformance(currentTime);
            
            // המשך הלולאה
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    // עדכון אובייקטים
    updateObjects(deltaTime) {
        // עדכון השמש
        if (this.sun && this.sun.update) {
            this.sun.update(deltaTime);
        }
        
        // עדכון כוכבי הלכת
        this.planets.forEach((planet, planetName) => {
            if (planet.update) {
                planet.update(deltaTime);
            } else if (planet.userData) {
                // עדכון מסלול פשוט
                planet.userData.angle += planet.userData.orbitalSpeed * deltaTime;
                
                planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
                planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
                
                // סיבוב עצמי
                planet.rotation.y += planet.userData.rotationSpeed * deltaTime;
            }
        });
        
        // עדכון חגורת אסטרואידים
        if (this.asteroidBelt && this.asteroidBelt.userData) {
            this.asteroidBelt.rotation.y += this.asteroidBelt.userData.rotationSpeed * deltaTime;
        }
    }

    // עדכון ביצועים
    updatePerformance(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;
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
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(5, scale));
        console.log(`Time scale set to: ${this.state.timeScale}x`);
    }

    resetView() {
        // איפוס מיקום מצלמה
        this.camera.position.set(300, 150, 300);
        this.camera.lookAt(0, 0, 0);
        
        // איפוס orbit controls
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
        
        // ביטול בחירת כוכב לכת
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
        console.log('ImprovedSolarSystemApp disposed');
    }
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
if (typeof window !== 'undefined') {
    window.ImprovedSolarSystemApp = ImprovedSolarSystemApp;
}
