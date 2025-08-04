// main.js - Fixed version with single SolarSystemApp declaration

// Ensure we only declare SolarSystemApp once
if (typeof window.SolarSystemApp === 'undefined') {
    
class SolarSystemApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.planets = [];
        this.isInitialized = false;
        this.animationId = null;
        this.textureManager = new TextureManager();
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    // Initialize the solar system application
    async init() {
        try {
            console.log('🚀 Initializing Solar System PWA...');
            
            // Initialize base systems
            await this.initializeBaseSystems();
            
            // Create scene and renderer
            await this.createScene();
            
            // Load textures
            await this.loadTextures();
            
            // Create solar system objects
            await this.createSolarSystemObjects();
            
            // Setup UI
            await this.setupUI();
            
            // Start render loop
            this.startRenderLoop();
            
            // Finish loading
            this.finishLoading();
            
            this.isInitialized = true;
            console.log('✅ Solar System PWA initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Solar System PWA:', error);
            this.showError('שגיאה באתחול האפליקציה: ' + error.message);
        }
    }

    // Initialize base systems
    async initializeBaseSystems() {
        this.updateLoadingProgress('אתחול מערכות בסיס...', 0);
        
        // Check WebGL support
        if (!this.checkWebGLSupport()) {
            throw new Error('הדפדפן שלך אינו תומך בWebGL');
        }
        
        // Register Service Worker
        await this.registerServiceWorker();
        
        this.updateLoadingProgress('מערכות בסיס מוכנות', 10);
    }

    // Check WebGL support
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!context;
        } catch (error) {
            return false;
        }
    }

    // Register Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration.installing);
                });
                
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    // Handle Service Worker update
    handleServiceWorkerUpdate(installingWorker) {
        installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            }
        });
    }

    // Show update notification
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

    // Create scene and renderer
    async createScene() {
        this.updateLoadingProgress('יוצר סצנה תלת-ממדית...', 20);
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(50, 30, 50);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add to DOM
        const container = document.getElementById('solar-system-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }
        
        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize);
        
        this.updateLoadingProgress('סצנה מוכנה', 30);
    }

    // Load textures
    async loadTextures() {
        this.updateLoadingProgress('טוען טקסטורות...', 40);
        await this.textureManager.loadAllTextures();
        this.updateLoadingProgress('טקסטורות נטענו', 60);
    }

    // Create solar system objects
    async createSolarSystemObjects() {
        this.updateLoadingProgress('יוצר כוכבי לכת...', 70);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Create Sun (placeholder)
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0xffaa00 
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(sun);
        
        this.updateLoadingProgress('מערכת השמש מוכנה', 90);
    }

    // Setup UI
    async setupUI() {
        this.updateLoadingProgress('מכין ממשק משתמש...', 95);
        // UI setup code here
    }

    // Start render loop
    startRenderLoop() {
        this.animate();
    }

    // Animation loop
    animate() {
        this.animationId = requestAnimationFrame(this.animate);
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Handle window resize
    handleResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // Update loading progress
    updateLoadingProgress(message, percentage) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        console.log(`${percentage}%: ${message}`);
    }

    // Finish loading
    finishLoading() {
        this.updateLoadingProgress('מוכן!', 100);
        
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 500);
    }

    // Show error
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>שגיאה</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()">נסה שוב</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Cleanup
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        if (this.textureManager) {
            this.textureManager.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Make SolarSystemApp globally available
window.SolarSystemApp = SolarSystemApp;

}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new window.SolarSystemApp();
    app.init();
});

// Also store reference for debugging
window.solarSystemApp = null;
document.addEventListener('DOMContentLoaded', () => {
    window.solarSystemApp = new window.SolarSystemApp();
    window.solarSystemApp.init();
});
