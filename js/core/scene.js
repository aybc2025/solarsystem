// ניהול הסצנה התלת ממדית של מערכת השמש
class SolarSystemScene {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.canvas = null;
        this.isInitialized = false;
        this.animationId = null;
        
        // הגדרות סצנה
        this.settings = {
            backgroundColor: 0x000000,
            fogEnabled: false,
            shadowsEnabled: true,
            antialiasing: true,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        };
        
        // אובייקטים בסצנה
        this.objects = new Map();
        this.planets = new Map();
        this.orbits = new Map();
        this.labels = new Map();
        
        // מצב התצוגה
        this.viewState = {
            showOrbits: true,
            showLabels: true,
            realisticMode: false,
            timeScale: 1,
            isPaused: false,
            selectedPlanet: null
        };
        
        // זמן סימולציה
        this.time = {
            current: 0,
            delta: 0,
            lastFrame: 0,
            speed: 1
        };
        
        // סטטיסטיקות ביצועים
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0
        };
    }

    // אתחול הסצנה
    async init(canvasId = 'scene') {
        try {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                throw new Error(`Canvas element with id '${canvasId}' not found`);
            }

            // יצירת renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: this.settings.antialiasing,
                alpha: false,
                powerPreference: "high-performance"
            });
            
            this.setupRenderer();
            
            // יצירת סצנה
            this.scene = new THREE.Scene();
            this.setupScene();
            
            // הוספת מאזינים לאירועים
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Solar System Scene initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize scene:', error);
            return false;
        }
    }

    // הגדרת renderer
    setupRenderer() {
        const { innerWidth, innerHeight } = window;
        
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        this.renderer.setClearColor(this.settings.backgroundColor, 1);
        
        // הפעלת shadows
        if (this.settings.shadowsEnabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // הגדרות נוספות
        this.renderer.gammaOutput = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    // הגדרת סצנה
    setupScene() {
        // רקע כוכבים
        this.createStarfield();
        
        // ערפילית (אופציונלי)
        if (!this.viewState.realisticMode) {
            this.createNebula();
        }
        
        // קבוצות אובייקטים
        this.createObjectGroups();
    }

    // יצירת שדה כוכבים
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for(let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // מיקום אקראי על כדור
            const radius = 5000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבע וגודל אקראיים
            const colorIntensity = Math.random() * 0.5 + 0.5;
            colors[i3] = colorIntensity;
            colors[i3 + 1] = colorIntensity;
            colors[i3 + 2] = colorIntensity;
            
            sizes[i] = Math.random() * 2 + 1;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - distance * 2.0;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'starfield';
        this.scene.add(stars);
        this.objects.set('starfield', stars);
    }

    // יצירת ערפילית
    createNebula() {
        const nebulaGroup = new THREE.Group();
        nebulaGroup.name = 'nebula';
        
        // יצירת מספר שכבות ערפילית
        for(let i = 0; i < 3; i++) {
            const geometry = new THREE.PlaneGeometry(8000, 8000);
            const material = new THREE.MeshBasicMaterial({
                map: this.createNebulaTexture(i),
                transparent: true,
                opacity: 0.1 + i * 0.05,
                blending: THREE.AdditiveBlending
            });
            
            const nebula = new THREE.Mesh(geometry, material);
            nebula.position.set(
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000
            );
            nebula.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            nebulaGroup.add(nebula);
        }
        
        this.scene.add(nebulaGroup);
        this.objects.set('nebula', nebulaGroup);
    }

    // יצירת טקסטורת ערפילית
    createNebulaTexture(variant = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const colors = [
            ['#FF1493', '#8A2BE2', '#4B0082'],
            ['#00CED1', '#4169E1', '#0000CD'],
            ['#FFD700', '#FFA500', '#FF4500']
        ];
        
        const colorSet = colors[variant] || colors[0];
        
        // יצירת gradient רדיאלי
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, colorSet[0] + '80');
        gradient.addColorStop(0.5, colorSet[1] + '40');
        gradient.addColorStop(1, colorSet[2] + '00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // הוספת רעש
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        
        for(let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 50;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }

    // יצירת קבוצות אובייקטים
    createObjectGroups() {
        // קבוצת כוכבי לכת
        const planetsGroup = new THREE.Group();
        planetsGroup.name = 'planets';
        this.scene.add(planetsGroup);
        this.objects.set('planetsGroup', planetsGroup);
        
        // קבוצת מסלולים
        const orbitsGroup = new THREE.Group();
        orbitsGroup.name = 'orbits';
        this.scene.add(orbitsGroup);
        this.objects.set('orbitsGroup', orbitsGroup);
        
        // קבוצת תוויות
        const labelsGroup = new THREE.Group();
        labelsGroup.name = 'labels';
        this.scene.add(labelsGroup);
        this.objects.set('labelsGroup', labelsGroup);
    }

    // הוספת כוכב לכת לסצנה
    addPlanet(name, planetObject) {
        const planetsGroup = this.objects.get('planetsGroup');
        if (planetsGroup && planetObject) {
            planetsGroup.add(planetObject);
            this.planets.set(name, planetObject);
            
            // יצירת מסלול
            if (name !== 'sun') {
                this.createOrbit(name, planetObject);
            }
            
            // יצירת תווית
            this.createLabel(name, planetObject);
        }
    }

    // יצירת מסלול כוכב לכת
    createOrbit(planetName, planetObject) {
        const data = PLANETS_DATA[planetName];
        if (!data || !data.distance) return;
        
        const orbitRadius = data.distance * PHYSICS_CONSTANTS.SCALE_FACTOR;
        const segments = 128;
        
        const geometry = new THREE.RingGeometry(orbitRadius - 0.5, orbitRadius + 0.5, segments);
        const material = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = -Math.PI / 2;
        orbit.name = `${planetName}_orbit`;
        
        const orbitsGroup = this.objects.get('orbitsGroup');
        if (orbitsGroup) {
            orbitsGroup.add(orbit);
            this.orbits.set(planetName, orbit);
        }
    }

    // יצירת תווית לכוכב לכת
    createLabel(planetName, planetObject) {
        const data = PLANETS_DATA[planetName];
        if (!data) return;
        
        // יצירת canvas לטקסט
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // סגנון הטקסט
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.name, 128, 32);
        
        // יצירת טקסטורה מהcanvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        
        const label = new THREE.Sprite(material);
        label.scale.set(20, 5, 1);
        label.name = `${planetName}_label`;
        
        const labelsGroup = this.objects.get('labelsGroup');
        if (labelsGroup) {
            labelsGroup.add(label);
            this.labels.set(planetName, label);
        }
    }

    // עדכון תוויות
    updateLabels(camera) {
        this.labels.forEach((label, planetName) => {
            const planet = this.planets.get(planetName);
            if (planet && label) {
                label.position.copy(planet.position);
                label.position.y += planet.scale.x * 3;
                label.lookAt(camera.position);
            }
        });
    }

    // הגדרת מצב תצוגה
    setViewMode(mode, enabled) {
        this.viewState[mode] = enabled;
        
        switch(mode) {
            case 'showOrbits':
                const orbitsGroup = this.objects.get('orbitsGroup');
                if (orbitsGroup) {
                    orbitsGroup.visible = enabled;
                }
                break;
                
            case 'showLabels':
                const labelsGroup = this.objects.get('labelsGroup');
                if (labelsGroup) {
                    labelsGroup.visible = enabled;
                }
                break;
                
            case 'realisticMode':
                this.toggleRealisticMode(enabled);
                break;
        }
    }

    // מעבר למצב ריאליסטי
    toggleRealisticMode(enabled) {
        const nebula = this.objects.get('nebula');
        if (nebula) {
            nebula.visible = !enabled;
        }
        
        // שינוי קנה מידה של כוכבי לכת
        this.planets.forEach((planet, name) => {
            if (name === 'sun') return;
            
            const data = PLANETS_DATA[name];
            const baseScale = enabled ? 
                data.radius * PHYSICS_CONSTANTS.SCALE_FACTOR * 0.001 : 
                Math.max(2, data.radius * PHYSICS_CONSTANTS.SCALE_FACTOR * 0.1);
            
            planet.scale.setScalar(baseScale);
        });
    }

    // עדכון זמן
    updateTime(deltaTime) {
        if (this.viewState.isPaused) return;
        
        this.time.delta = deltaTime;
        this.time.current += deltaTime * this.time.speed * this.viewState.timeScale;
        
        // עדכון שדה הכוכבים
        const starfield = this.objects.get('starfield');
        if (starfield && starfield.material.uniforms) {
            starfield.material.uniforms.time.value = this.time.current * 0.001;
        }
    }

    // עדכון סטטיסטיקות ביצועים
    updateStats() {
        this.stats.frameCount++;
        const now = performance.now();
        
        if (now - this.stats.lastFpsUpdate >= 1000) {
            this.stats.fps = this.stats.frameCount;
            this.stats.frameCount = 0;
            this.stats.lastFpsUpdate = now;
        }
    }

    // הגדרת מאזינים לאירועים
    setupEventListeners() {
        // שינוי גודל חלון
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // טיפול בשינוי מצב הדף
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    // טיפול בשינוי גודל
    handleResize() {
        if (!this.renderer) return;
        
        const { innerWidth, innerHeight } = window;
        this.renderer.setSize(innerWidth, innerHeight);
        
        // עדכון המצלמה יטופל במחלקת Camera
        if (window.solarSystemCamera) {
            window.solarSystemCamera.handleResize(innerWidth, innerHeight);
        }
    }

    // השהיה
    pause() {
        this.viewState.isPaused = true;
    }

    // המשכה
    resume() {
        this.viewState.isPaused = false;
    }

    // ניקוי משאבים
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // ניקוי אובייקטים
        this.objects.forEach(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
            if (object.texture) object.texture.dispose();
        });
        
        this.objects.clear();
        this.planets.clear();
        this.orbits.clear();
        this.labels.clear();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // הסרת מאזינים
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.pause);
        
        this.isInitialized = false;
    }

    // קבלת מידע על הסצנה
    getSceneInfo() {
        return {
            isInitialized: this.isInitialized,
            planetsCount: this.planets.size,
            objectsCount: this.objects.size,
            viewState: { ...this.viewState },
            time: { ...this.time },
            stats: { ...this.stats }
        };
    }

    // חיפוש אובייקט בסצנה
    findObject(name) {
        return this.objects.get(name) || this.planets.get(name) || null;
    }

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        // ביטול בחירה קודמת
        if (this.viewState.selectedPlanet) {
            const prevPlanet = this.planets.get(this.viewState.selectedPlanet);
            if (prevPlanet && prevPlanet.userData.originalEmissive !== undefined) {
                prevPlanet.material.emissive.setHex(prevPlanet.userData.originalEmissive);
            }
        }

        this.viewState.selectedPlanet = planetName;

        // הדגשת הכוכב הנבחר
        if (planetName) {
            const planet = this.planets.get(planetName);
            if (planet) {
                if (planet.userData.originalEmissive === undefined) {
                    planet.userData.originalEmissive = planet.material.emissive.getHex();
                }
                planet.material.emissive.setHex(0x444444);
            }
        }
    }

    // עדכון עיקרי של הסצנה
    update(deltaTime, camera) {
        if (!this.isInitialized) return;

        this.updateTime(deltaTime);
        this.updateLabels(camera);
        this.updateStats();

        // עדכון אנימציות
        this.planets.forEach((planet, name) => {
            if (planet.userData && planet.userData.update) {
                planet.userData.update(this.time.current);
            }
        });

        // עדכון שדה הכוכבים
        const starfield = this.objects.get('starfield');
        if (starfield && starfield.material.uniforms) {
            starfield.material.uniforms.time.value = this.time.current * 0.0001;
        }
    }

    // רנדור הסצנה
    render(camera) {
        if (!this.isInitialized || !this.renderer || !this.scene) return;
        
        this.renderer.render(this.scene, camera);
    }

    // הגדרת איכות רנדור
    setRenderQuality(quality) {
        if (!this.renderer) return;

        switch(quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'high':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
    }

    // יצירת צילום מסך
    takeScreenshot(width = 1920, height = 1080) {
        if (!this.renderer) return null;

        const originalSize = this.renderer.getSize(new THREE.Vector2());
        this.renderer.setSize(width, height);
        this.renderer.render(this.scene, camera);
        
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        this.renderer.setSize(originalSize.x, originalSize.y);
        
        return dataURL;
    }

    // הגדרת רקע מותאם אישית
    setCustomBackground(type, options = {}) {
        // הסרת רקע קיים
        const existingBg = this.objects.get('customBackground');
        if (existingBg) {
            this.scene.remove(existingBg);
            this.objects.delete('customBackground');
        }

        let background;
        
        switch(type) {
            case 'gradient':
                background = this.createGradientBackground(options);
                break;
            case 'image':
                background = this.createImageBackground(options);
                break;
            case 'procedural':
                background = this.createProceduralBackground(options);
                break;
            default:
                return;
        }

        if (background) {
            this.scene.add(background);
            this.objects.set('customBackground', background);
        }
    }

    // יצירת רקע בגרדיאנט
    createGradientBackground(options) {
        const { topColor = '#1a1a2e', bottomColor = '#0a0a0a' } = options;
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.SphereGeometry(4000, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        
        return new THREE.Mesh(geometry, material);
    }

    // יצירת רקע מתמונה
    createImageBackground(options) {
        const { imageUrl } = options;
        if (!imageUrl) return null;
        
        const loader = new THREE.TextureLoader();
        const texture = loader.load(imageUrl);
        
        const geometry = new THREE.SphereGeometry(4000, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        
        return new THREE.Mesh(geometry, material);
    }

    // יצירת רקע פרוצדורלי
    createProceduralBackground(options) {
        const { 
            pattern = 'stars',
            density = 1000,
            colors = ['#ffffff']
        } = options;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(density * 3);
        const colorsArray = new Float32Array(density * 3);
        
        for(let i = 0; i < density; i++) {
            const i3 = i * 3;
            
            // מיקום על כדור
            const radius = 4000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבע אקראי מהרשימה
            const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
            colorsArray[i3] = color.r;
            colorsArray[i3 + 1] = color.g;
            colorsArray[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true
        });
        
        return new THREE.Points(geometry, material);
    }

    // פונקציה לדיבוג
    debug() {
        console.group('Solar System Scene Debug Info');
        console.log('Scene Info:', this.getSceneInfo());
        console.log('Planets:', Array.from(this.planets.keys()));
        console.log('Objects:', Array.from(this.objects.keys()));
        console.log('View State:', this.viewState);
        console.log('Performance:', this.stats);
        console.groupEnd();
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemScene;
}
