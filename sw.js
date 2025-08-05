// Service Worker for Solar System PWA - Fixed Version
// מספק פונקציונליות offline וcaching מתקדמת עם טיפול שגיאות משופר

const CACHE_NAME = 'solar-system-v1.3.0';
const RUNTIME_CACHE = 'solar-system-runtime';

// קבצים חיוניים לcache (רק קבצים שבטוח קיימים)
const ESSENTIAL_URLS = [
    '/',
    '/index.html'
];

// קבצים אופציונליים - ינוסה לטעון אבל לא יכשיל את הinstall
const OPTIONAL_URLS = [
    '/manifest.json',
    '/styles/main.css',
    '/styles/controls.css', 
    '/styles/info-panel.css',
    '/js/main-improved.js',
    '/js/data/planets-improved.js',
    '/js/data/textures.js',
    '/js/utils/math.js',
    '/js/core/scene.js',
    '/js/core/camera.js',
    '/js/core/lights.js',
    '/js/objects/sun.js',
    '/js/objects/planet.js',
    '/js/objects/asteroid-belt.js',
    '/js/controls/orbit-controls.js',
    '/js/ui/controls.js',
    '/js/ui/info-panel.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// External libraries that should always be cached
const EXTERNAL_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js'
];

console.log('Solar System Service Worker loaded successfully');
console.log('Cache Name:', CACHE_NAME);
console.log('Essential URLs:', ESSENTIAL_URLS.length, 'files');
console.log('Optional URLs:', OPTIONAL_URLS.length, 'files');

// Helper function to check if URL exists
async function urlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

// Helper function to cache URLs with error handling
async function cacheUrlsWithFallback(cache, urls, isEssential = false) {
    const results = [];
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                results.push({ url, success: true });
                console.log(`✅ Cached: ${url}`);
            } else {
                results.push({ url, success: false, error: `HTTP ${response.status}` });
                if (isEssential) {
                    console.error(`❌ Essential file failed to cache: ${url}`);
                } else {
                    console.warn(`⚠️ Optional file not found: ${url}`);
                }
            }
        } catch (error) {
            results.push({ url, success: false, error: error.message });
            if (isEssential) {
                console.error(`❌ Essential file cache error: ${url}`, error);
                throw error; // Fail installation for essential files
            } else {
                console.warn(`⚠️ Optional file cache error: ${url}`, error.message);
            }
        }
    }
    
    return results;
}

// Install event
self.addEventListener('install', (event) => {
    console.log('Solar System SW: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('Solar System SW: Caching app shell');
                
                // Cache essential files first - these must succeed
                await cacheUrlsWithFallback(cache, ESSENTIAL_URLS, true);
                
                // Cache external libraries - these are important but not critical
                try {
                    await cacheUrlsWithFallback(cache, EXTERNAL_URLS, false);
                } catch (error) {
                    console.warn('External libraries cache failed, but continuing:', error);
                }
                
                // Cache optional files - best effort
                await cacheUrlsWithFallback(cache, OPTIONAL_URLS, false);
                
                console.log('Solar System SW: Installation completed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Solar System SW: Installation failed:', error);
                throw error;
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Solar System SW: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Solar System SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Solar System SW: Activated successfully');
            return self.clients.claim();
        })
    );
});

// Fetch event with robust caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other special schemes
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Different strategies for different types of resources
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i)) {
        // Images: Cache first with fallback
        event.respondWith(handleImageRequest(request));
    } else if (url.hostname === 'cdnjs.cloudflare.com') {
        // External libraries: Stale while revalidate
        event.respondWith(handleExternalLibrary(request));
    } else if (url.pathname.match(/\.(js|css)$/)) {
        // Local JS/CSS: Network first with cache fallback
        event.respondWith(handleAssetRequest(request));
    } else {
        // HTML and other resources: Network first
        event.respondWith(handlePageRequest(request));
    }
});

// Image handling with graceful fallback
async function handleImageRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Image fallback for:', request.url);
        // Return a minimal SVG placeholder for missing images
        return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#333"/>
                <text x="50" y="55" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle">404</text>
            </svg>`,
            { 
                headers: { 
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=86400'
                } 
            }
        );
    }
}

// External library handling
async function handleExternalLibrary(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('Network failed for external library, trying cache:', request.url);
    }
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    throw new Error(`External library not available: ${request.url}`);
}

// Asset handling (JS/CSS)
async function handleAssetRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('Network failed for asset, trying cache:', request.url);
    }
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        console.log('Serving from cache:', request.url);
        return cachedResponse;
    }
    
    // For missing JS files, return empty module to prevent errors
    if (request.url.endsWith('.js')) {
        return new Response('console.log("Module not found:", "' + request.url + '");', {
            headers: { 'Content-Type': 'application/javascript' }
        });
    }
    
    // For missing CSS files, return empty stylesheet
    if (request.url.endsWith('.css')) {
        return new Response('/* Stylesheet not found */', {
            headers: { 'Content-Type': 'text/css' }
        });
    }
    
    throw new Error(`Asset not available: ${request.url}`);
}

// Page handling
async function handlePageRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('Network failed for page, trying cache:', request.url);
    }
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) {
        return indexResponse;
    }
    
    throw new Error(`Page not available: ${request.url}`);
}