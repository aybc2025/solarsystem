// textures.js - Fixed version with proper const declarations

const TEXTURE_PATHS = {
    sun: '/textures/sun.jpg',
    mercury: '/textures/mercury.jpg',
    venus: '/textures/venus.jpg',
    earth: '/textures/earth.jpg',
    mars: '/textures/mars.jpg',
    jupiter: '/textures/jupiter.jpg',
    saturn: '/textures/saturn.jpg',
    uranus: '/textures/uranus.jpg',
    neptune: '/textures/neptune.jpg',
    moon: '/textures/moon.jpg',
    stars: '/textures/stars.jpg'
};

const TEXTURE_LOADER = new THREE.TextureLoader();

// Texture loading utility
class TextureManager {
    constructor() {
        this.loadedTextures = new Map();
        this.loadingPromises = new Map();
    }

    async loadTexture(name, path) {
        // If already loaded, return cached texture
        if (this.loadedTextures.has(name)) {
            return this.loadedTextures.get(name);
        }

        // If currently loading, return existing promise
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        // Create new loading promise
        const loadingPromise = new Promise((resolve, reject) => {
            TEXTURE_LOADER.load(
                path,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    this.loadedTextures.set(name, texture);
                    this.loadingPromises.delete(name);
                    resolve(texture);
                },
                (progress) => {
                    console.log(`Loading ${name}: ${(progress.loaded / progress.total * 100)}%`);
                },
                (error) => {
                    console.error(`Failed to load texture ${name}:`, error);
                    this.loadingPromises.delete(name);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(name, loadingPromise);
        return loadingPromise;
    }

    async loadAllTextures() {
        const promises = Object.entries(TEXTURE_PATHS).map(([name, path]) => 
            this.loadTexture(name, path)
        );

        try {
            await Promise.all(promises);
            console.log('All textures loaded successfully');
        } catch (error) {
            console.error('Failed to load some textures:', error);
        }
    }

    getTexture(name) {
        return this.loadedTextures.get(name);
    }

    dispose() {
        this.loadedTextures.forEach(texture => texture.dispose());
        this.loadedTextures.clear();
        this.loadingPromises.clear();
    }
}
