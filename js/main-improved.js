// מחלקת האפליקציה המרכזית - מתוקנת עם לחיצה על כוכבי לכת
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

    // **הוספה: הגדרת אירועי לחיצה על כוכבי לכת**
    setupClickEvents() {
        const canvas = this.renderer.domElement;
        
        // לחיצה עם עכבר
        canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        // מגע על מסכי מגע
        canvas.addEventListener('touchend', (event) => {
            // רק אם זה מגע יחיד וקצר
            if (event.changedTouches.length === 1) {
                const touch = event.changedTouches[0];
                this.handleClick(touch);
            }
        });
    }

    // **הוספה: טיפול בלחיצה**
    handleClick(event) {
        // קבלת מיקום הלחיצה
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // הגדרת raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // איסוף אובייקטים לבדיקה
        const selectableObjects = [];
        
        // הוספת השמש
        if (this.sun && this.sun.mesh) {
            selectableObjects.push(this.sun.mesh);
        }
        
        // הוספת כוכבי הלכת
        this.planets.forEach((planet) => {
            if (planet && planet.mesh) {
                selectableObjects.push(planet.mesh);
            } else if (planet) {
                // כוכב לכת פשוט
                selectableObjects.push(planet);
            }
        });
        
        // בדיקת חיתוכים
        const intersects = this.raycaster.intersectObjects(selectableObjects, true);
        
        if (intersects.length > 0) {
            // מציאת כוכב הלכת שנלחץ
            const clickedObject = intersects[0].object;
            const planetName = this.findPlanetName(clickedObject);
            
            if (planetName) {
                this.selectPlanet(planetName);
            }
        }
    }

    // **הוספה: מציאת שם כוכב הלכת מהאובייקט**
    findPlanetName(object) {
        // בדיקה לפי שם האובייקט
        if (object.name) {
            const name = object.name.toLowerCase();
            if (name.includes('sun') || name === 'sun') return 'sun';
            if (name.includes('mercury') || name === 'mercury') return 'mercury';
            if (name.includes('venus') || name === 'venus') return 'venus';
            if (name.includes('earth') || name === 'earth') return 'earth';
            if (name.includes('mars') || name === 'mars') return 'mars';
            if (name.includes('jupiter') || name === 'jupiter') return 'jupiter';
            if (name.includes('saturn') || name === 'saturn') return 'saturn';
            if (name.includes('uranus') || name === 'uranus') return 'uranus';
            if (name.includes('neptune') || name === 'neptune') return 'neptune';
        }
        
        // בדיקה לפי parent
        if (object.parent && object.parent.name) {
            return this.findPlanetName(object.parent);
        }
        
        // בדיקה לפי userData
        if (object.userData && object.userData.planetName) {
            return object.userData.planetName;
        }
        
        return null;
    }

    // **הוספה: בחירת כוכב לכת ופתיחת מידע**
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        // התמקדות על הכוכב
        this.focusOnPlanet(planetName);
        
        // פתיחת פאנל המידע
        this.showPlanetInfo(planetName);
        
        console.log(`Selected planet: ${planetName}`);
    }

    // **הוספה: הצגת מידע על כוכב לכת**
    showPlanetInfo(planetName) {
        // אם יש InfoPanel, השתמש בו
        if (typeof InfoPanel !== 'undefined' && window.infoPanel) {
            window.infoPanel.showPlanetInfo(planetName);
            return;
        }
        
        // אחרת, הצג באלרט פשוט
        const planetData = PLANETS_DATA[planetName];
        if (planetData) {
            alert(`${planetData.name}\n\n${planetData.description}\n\nעובדות מעניינות:\n${planetData.facts.slice(0, 3).join('\n')}`);
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

    // יצירת חגורת אסטרואידים פשוטה ויעילה - מתוקנת
    async createAsteroidBelt() {
        try {
            console.log('Creating asteroid belt...');
            
            // פרמטרי חגורת האסטרואידים - תיקון מיקום
            const innerRadius = 120; // תיקון: אחרי מאדים
            const outerRadius = 180;  // תיקון: לפני צדק
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
                const height = (Math.random() - 0.5) * 15; // הקטנה מ-20 ל-15
                
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
            
            // יצירת כמה אסטרואידים גדולים (קרס, וסטה, פלאס) - מיקום מתוקן
            await this.createMajorAsteroids();
            
            console.log('✅ Asteroid belt created successfully');
            
        } catch (error) {
            console.warn('Failed to create asteroid belt:', error);
        }
    }

    // יצירת אסטרואידים גדולים ומפורסמים - מיקום מתוקן
    async createMajorAsteroids() {
        const majorAsteroids = [
            { name: 'Ceres', radius: 3, distance: 135, angle: 0, color: 0x8b7765 },           // במרכז החגורה
            { name: 'Vesta', radius: 2, distance: 145, angle: Math.PI / 3, color: 0xa0522d },  // מעט רחוק יותר
            { name: 'Pallas', radius: 1.8, distance: 155, angle: Math.PI * 2/3, color: 0x696969 }, // עוד יותר רחוק
            { name: 'Hygiea', radius: 1.5, distance: 165, angle: Math.PI, color: 0x2f4f4f }    // בחלק החיצוני
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
            
            // מיקום במסלול - מתוקן
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
            
            // פרמטרי מסלול
            asteroidMesh.userData = {
                orbitalSpeed: Math.sqrt(1 / asteroid.distance) * 0.0001,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                distance: asteroid.distance,
                angle: asteroid.angle,
                planetName: asteroid.name // לזיהוי לחיצה
            };
            
            this.scene.add(asteroidMesh);
        });
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

    // יצירת כוכב לכת פשוט
    createSimplePlanet(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return;
        
        // יצירת גיאומטריה וחומר
        const geometry = new THREE.SphereGeometry(planetData.scaledRadius, 32, 32);
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
            rotationSpeed: (2 * Math.PI) / (planetData.rotationPeriod * 60), // מהירות סיבוב
            distance: planetData.scaledDistance,
            angle: initialAngle,
            planetName: planetName, // **הוספה: לזיהוי לחיצה**
            data: planetData
        };
        
        this.scene.add(planetMesh);
        this.planets.set(planetName, planetMesh);
        
        // יצירת מסלול
        this.createOrbit(planetName, planetData);
    }

    // יצירת שמש פשוטה
    createSimpleSun() {
        const sunData = PLANETS_DATA.sun;
        
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: sunData.color,
            emissive: sunData.emissive || sunData.color,
            emissiveIntensity: 0.3
        });
        
        const sunMesh = new THREE.Mesh(geometry, material);
        sunMesh.name = 'sun';
        sunMesh.userData = { planetName: 'sun', data: sunData }; // **הוספה: לזיהוי לחיצה**
        
        this.scene.add(sunMesh);
        this.sun = { mesh: sunMesh };
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

    // עדכון מסלולים
    updateOrbitsVisibility() {
        this.orbits.forEach(orbit => {
            orbit.visible = this.state.showOrbits;
        });
    }

    // התמקדות על כוכב לכת
    focusOnPlanet(planetName) {
        const planet = this.planets.get(planetName);
        if (!planet || !this.camera || !this.controls) return;
        
        // קבלת מיקום כוכב הלכת
        let planetPosition;
        if (planet.mesh) {
            planetPosition = planet.mesh.position.clone();
        } else {
            planetPosition = planet.position.clone();
        }
        
        // חישוב מרחק מתאים לצפייה
        const planetData = PLANETS_DATA[planetName];
        const distance = planetData ? planetData.scaledRadius * 8 : 60;
        
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
                this.selectPlanet(planetName); // **שימוש בפונקציה החדשה**
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

    // התאמה לשינוי גודל חלון
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
                    child.userData.angle += child.userData.orbitalSpeed * scaledDelta;
                    
                    const x = Math.cos(child.userData.angle) * child.userData.distance;
                    const z = Math.sin(child.userData.angle) * child.userData.distance;
                    child.position.x = x;
                    child.position.z = z;
                    
                    // סיבוב עצמי
                    child.rotation.x += child.userData.rotationSpeed * scaledDelta;
                    child.rotation.y += child.userData.rotationSpeed * scaledDelta * 0.7;
                }
            }
        });
    }

    // עדכון FPS
    updateFPS(currentTime) {
        this.performance.frameCount++;
        
        if (currentTime - this.performance.lastFpsUpdate > 1000) {
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

    // פונקציות בקרה
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        console.log(this.state.isPaused ? 'Paused' : 'Resumed');
    }

    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(10, scale));
        console.log(`Time scale: ${this.state.timeScale}x`);
    }

    toggleOrbits() {
        this.state.showOrbits = !this.state.showOrbits;
        this.updateOrbitsVisibility();
        console.log('Orbits visibility:', this.state.showOrbits);
    }

    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        // TODO: עדכון תוויות
        console.log('Labels visibility:', this.state.showLabels);
    }

    resetView() {
        if (this.camera && this.controls) {
            this.camera.position.set(300, 150, 300);
            if (this.controls.target) {
                this.controls.target.set(0, 0, 0);
            }
            this.state.selectedPlanet = null;
        }
        console.log('View reset');
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
