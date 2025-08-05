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
            console.error('Failed to initialize Solar System Scene:', error);
            throw error;
        }
    }

    // הגדרת renderer
    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        this.renderer.shadowMap.enabled = this.settings.shadowsEnabled;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    // הגדרת סצנה
    setupScene() {
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
        
        // הוספת ערפל אופציונלי
        if (this.settings.fogEnabled) {
            this.scene.fog = new THREE.Fog(0x000000, 1000, 10000);
        }
    }

    // הוספת אובייקט לסצנה
    addObject(name, object) {
        if (!this.scene) {
            console.error('Scene not initialized');
            return false;
        }
        
        this.scene.add(object);
        this.objects.set(name, object);
        
        // הוספת לקטגוריה המתאימה
        if (name.includes('planet') || ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(name)) {
            this.planets.set(name, object);
        } else if (name.includes('orbit')) {
            this.orbits.set(name, object);
        }
        
        console.log(`Added object: ${name}`);
        return true;
    }

    // הסרת אובייקט מהסצנה
    removeObject(name) {
        const object = this.objects.get(name);
        if (object) {
            this.scene.remove(object);
            this.objects.delete(name);
            this.planets.delete(name);
            this.orbits.delete(name);
            this.labels.delete(name);
            
            // ניקוי משאבים
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
            
            console.log(`Removed object: ${name}`);
            return true;
        }
        return false;
    }

    // עדכון מצב התצוגה
    updateViewState(newState) {
        this.viewState = { ...this.viewState, ...newState };
        
        // עדכון תצוגת מסלולים
        if (newState.showOrbits !== undefined) {
            this.orbits.forEach(orbit => {
                orbit.visible = newState.showOrbits;
            });
        }
        
        // עדכון תצוגת תוויות
        if (newState.showLabels !== undefined) {
            this.labels.forEach(label => {
                label.visible = newState.showLabels;
            });
        }
        
        console.log('View state updated:', this.viewState);
    }

    // רנדור פריים יחיד
    render(camera) {
        if (!this.renderer || !this.scene || !camera) {
            console.warn('Cannot render: missing components');
            return;
        }
        
        this.renderer.render(this.scene, camera);
        this.updateStats();
    }

    // עדכון סטטיסטיקות
    updateStats() {
        this.stats.frameCount++;
        const now = performance.now();
        
        if (now - this.stats.lastFpsUpdate >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastFpsUpdate));
            this.stats.frameCount = 0;
            this.stats.lastFpsUpdate = now;
        }
    }

    // קבלת מידע על הסצנה
    getSceneInfo() {
        if (!this.scene) return null;
        
        let objectCount = 0;
        this.scene.traverse(() => objectCount++);
        
        return {
            objectCount,
            planetsCount: this.planets.size,
            orbitsCount: this.orbits.size,
            labelsCount: this.labels.size,
            isInitialized: this.isInitialized,
            viewState: { ...this.viewState },
            stats: { ...this.stats }
        };
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // התאמה לשינוי גודל חלון
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    // יצירת רקע כוכבים
    createStarfield(count = 5000, radius = 10000) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        for(let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // מיקום אקראי על כדור
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(1 - 2 * Math.random());
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(geometry, material);
        stars.name = 'starfield';
        
        this.addObject('starfield', stars);
        return stars;
    }

    // יצירת רקע עם טקסטורה
    createTexturedBackground(textureUrl) {
        const loader = new THREE.TextureLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(
                textureUrl,
                (texture) => {
                    const geometry = new THREE.SphereGeometry(8000, 32, 32);
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.BackSide
                    });
                    
                    const background = new THREE.Mesh(geometry, material);
                    background.name = 'textured_background';
                    
                    this.addObject('textured_background', background);
                    resolve(background);
                },
                undefined,
                (error) => {
                    console.error('Failed to load background texture:', error);
                    reject(error);
                }
            );
        });
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

    // ניקוי משאבים
    dispose() {
        // עצירת אנימציה
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // ניקוי אובייקטים
        this.objects.forEach((object, name) => {
            this.removeObject(name);
        });
        
        // ניקוי renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
        console.log('Solar System Scene disposed');
    }
}

// ייצוא המחלקה - תיקון קריטי
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemScene;
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
window.SolarSystemScene = SolarSystemScene;
