// Service Worker for Solar System PWA - Fixed Version
// מספק פונקציונליות offline וcaching מתקדמת עם טיפול שגיאות משופר

const CACHE_NAME = 'solar-system-v1.4.0'; // עדכון גרסה
const RUNTIME_CACHE = 'solar-system-runtime';

// קבצים חיוניים לcache - רק קבצים שבטוח קיימים
const ESSENTIAL_URLS = [
    './', // שונה מ-'/' ל-'./' לתמיכה טובה יותר
    './index.html'
];

// קבצים קיימים בלבד - הוסרו קבצים חסרים
const EXISTING_URLS = [
    './js/main-improved.js',
    './js/data/planets-improved.js',
    './js/controls/OrbitControls.js',
    './js/utils/math.js',
    './js/objects/sun.js',
    './js/objects/planet.js',
    './js/ui/controls.js',
    './styles/controls.css',
    './styles/info-panel.css'
];

// קבצים אופציונליים - קבצים שעלולים להיות חסרים
const OPTIONAL_URLS = [
    './manifest.json',
    './styles/main.css',
    './js/core/scene.js',
    './js/core/camera.js',
    './js/core/lights.js',
    './js/data/textures.js',
    './js/objects/asteroid-belt.js',
    './js/controls/orbit-controls.js',
    './js/ui/info-panel.js',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './offline.html'
];

// External libraries with fallback handling
const EXTERNAL_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    // הוסר OrbitControls מכאן בגלל בעיות CORS
];

console.log('Solar System Service Worker loaded successfully');
console.log('Cache Name:', CACHE_NAME);
console.log('Essential URLs:', ESSENTIAL_URLS.length, 'files');
console.log('Existing URLs:', EXISTING_URLS.length, 'files');
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

// Helper function to cache URLs with better error handling
async function cacheUrlsWithFallback(cache, urls, isEssential = false) {
    const results = {
        success: [],
        failed: []
    };
    
    for (const url of urls) {
        try {
            // בדיקה אם הURL קיים לפני הcaching
            if (await urlExists(url)) {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    results.success.push(url);
                    console.log(`✅ Cached: ${url}`);
                } else {
                    results.failed.push(url);
                    console.warn(`❌ HTTP error for ${url}: ${response.status}`);
                }
            } else {
                results.failed.push(url);
                if (isEssential) {
                    console.error(`❌ Essential file failed to cache: ${url}`);
                } else {
                    console.log(`⚠️ Optional file not found: ${url}`);
                }
            }
        } catch (error) {
            results.failed.push(url);
            if (isEssential) {
                console.error(`❌ Essential file cache error: ${url}`, error);
            } else {
                console.log(`⚠️ Optional file cache error: ${url}`, error.message);
            }
        }
    }
    
    return results;
}

// Install event - improved error handling
self.addEventListener('install', (event) => {
    console.log('Solar System SW: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('Solar System SW: Caching app shell');
                
                // Cache essential files first - must succeed
                const essentialResults = await cacheUrlsWithFallback(cache, ESSENTIAL_URLS, true);
                
                // המשך גם אם קבצים חיוניים נכשלו (PWA יעבוד עם fallbacks)
                if (essentialResults.failed.length > 0) {
                    console.warn('Some essential files failed to cache, but continuing...');
                }
                
                // Cache existing files - best effort
                try {
                    await cacheUrlsWithFallback(cache, EXISTING_URLS, false);
                } catch (error) {
                    console.warn('Some existing files failed to cache:', error);
                }
                
                // Cache external libraries - best effort
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
                // לא לזרוק שגיאה - אפשר למשתמש להמשיך
                return self.skipWaiting();
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
        // External libraries: Special handling for CDN issues
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

// External library handling - improved for CDN issues
async function handleExternalLibrary(request) {
    // First try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        console.log('Serving external library from cache:', request.url);
        return cachedResponse;
    }
    
    // Then try network with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const networkResponse = await fetch(request, { 
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            console.log('External library cached:', request.url);
            return networkResponse;
        }
    } catch (error) {
        console.warn('Network failed for external library:', request.url, error.message);
    }
    
    // For OrbitControls specifically, return empty fallback
    if (request.url.includes('OrbitControls.js')) {
        return new Response(`
            console.warn('OrbitControls not available from CDN, using fallback');
            // Empty response - fallback will be used
        `, {
            headers: { 'Content-Type': 'application/javascript' }
        });
    }
    
    throw new Error(`External library not available: ${request.url}`);
}

// Asset handling (JS/CSS) - improved fallback
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
    
    // For missing JS files, return empty module with logging
    if (request.url.endsWith('.js')) {
        const filename = request.url.split('/').pop();
        return new Response(`console.warn("Module not found: ${filename}"); // ${request.url}`, {
            headers: { 'Content-Type': 'application/javascript' }
        });
    }
    
    // For missing CSS files, return empty stylesheet with comment
    if (request.url.endsWith('.css')) {
        const filename = request.url.split('/').pop();
        return new Response(`/* Stylesheet not found: ${filename} */`, {
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
    const indexResponse = await caches.match('./index.html') || await caches.match('/index.html');
    if (indexResponse) {
        console.log('Serving index.html fallback for:', request.url);
        return indexResponse;
    }
    
    // Final fallback - minimal HTML page
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Solar System PWA - Offline</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #000428;">
            <h1 style="color: #ffd700;">מערכת השמש</h1>
            <p style="color: white;">האפליקציה לא זמינה כרגע</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #ffd700; border: none; border-radius: 5px; cursor: pointer;">🔄 נסה שוב</button>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Message handling for debugging
self.addEventListener('message', (event) => {
    console.log('SW received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.keys().then(cacheNames => {
            event.ports[0].postMessage({
                cacheNames,
                currentCache: CACHE_NAME
            });
        });
    }
});

// Periodic cleanup of old caches
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('solar-system-') && name !== CACHE_NAME && name !== RUNTIME_CACHE
    );
    
    return Promise.all(oldCaches.map(name => {
        console.log('Cleaning up old cache:', name);
        return caches.delete(name);
    }));
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
    event.preventDefault();
});
