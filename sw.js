// Service Worker for Solar System PWA
// מספק פונקציונליות offline וcaching מתקדמת

const CACHE_NAME = 'solar-system-v1.2.0';
const RUNTIME_CACHE = 'solar-system-runtime';

// קבצים לcache בהתקנה ראשונית
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // CSS Files
    '/styles/main.css',
    '/styles/controls.css',
    '/styles/info-panel.css',
    
    // JavaScript Files
    '/js/main.js',
    '/js/data/planets.js',
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
    
    // External Libraries
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    
    // Offline fallback page
    '/offline.html'
];

// אסטרטגיות cache שונות
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// הגדרות routing
const ROUTE_CONFIGS = [
    {
        pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: 'images-cache',
        expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 ימים
        }
    },
    {
        pattern: /\.(?:js|css)$/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cacheName: 'static-resources',
        expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 ימים
        }
    },
    {
        pattern: /^https:\/\/cdnjs\.cloudflare\.com/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cacheName: 'cdn-cache',
        expiration: {
            maxEntries: 20,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 ימים
        }
    }
];

// התקנת Service Worker
self.addEventListener('install', event => {
    console.log('Solar System SW: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Solar System SW: Caching app shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('Solar System SW: Installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Solar System SW: Installation failed:', error);
            })
    );
});

// הפעלת Service Worker
self.addEventListener('activate', event => {
    console.log('Solar System SW: Activating...');
    
    event.waitUntil(
        Promise.all([
            // ניקוי cache ישנים
            cleanupOldCaches(),
            // השתלטות על כל הclients
            self.clients.claim()
        ]).then(() => {
            console.log('Solar System SW: Activated successfully');
        })
    );
});

// ניקוי cache ישנים
async function cleanupOldCaches() {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE, 'images-cache', 'static-resources', 'cdn-cache'];
    const cacheNames = await caches.keys();
    
    return Promise.all(
        cacheNames
            .filter(cacheName => !currentCaches.includes(cacheName))
            .map(cacheName => {
                console.log('Solar System SW: Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            })
    );
}

// טיפול בבקשות רשת
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // דילוג על בקשות שאינן HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // דילוג על בקשות POST/PUT/DELETE
    if (request.method !== 'GET') {
        return;
    }
    
    // טיפול מיוחד בעמוד הראשי
    if (url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(handleMainPage(request));
        return;
    }
    
    // מציאת אסטרטגיה מתאימה
    const routeConfig = findMatchingRoute(url);
    if (routeConfig) {
        event.respondWith(handleRequest(request, routeConfig));
    }
});

// מציאת route מתאים
function findMatchingRoute(url) {
    return ROUTE_CONFIGS.find(config => config.pattern.test(url.pathname));
}

// טיפול בבקשה לפי אסטרטגיה
async function handleRequest(request, routeConfig) {
    const { strategy, cacheName } = routeConfig;
    
    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request, cacheName);
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request, cacheName);
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request, cacheName);
        default:
            return fetch(request);
    }
}

// אסטרטגיית Cache First
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Network error', { status: 408 });
    }
}

// אסטרטגיית Network First
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        return cachedResponse || new Response('Offline', { status: 408 });
    }
}

// אסטרטגיית Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// טיפול בעמוד הראשי
async function handleMainPage(request) {
    try {
        return await networkFirst(request, CACHE_NAME);
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match('/offline.html');
    }
}

// האזנה להודעות מהאפליקציה
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
    }
});

// קבלת סטטוס cache
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        status[cacheName] = keys.length;
    }
    
    return status;
}

// ניקוי כל ה-cache
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map(name => caches.delete(name)));
}

// מנהל offline
class OfflineManager {
    static async handleOfflineRequest(request) {
        const cache = await caches.open(CACHE_NAME);
        
        // נסה למצוא את הבקשה ב-cache
        let response = await cache.match(request);
        
        if (!response) {
            // אם זה HTML, החזר עמוד offline
            if (request.headers.get('Accept').includes('text/html')) {
                response = await cache.match('/offline.html');
            } else {
                // עבור משאבים אחרים, החזר תגובת שגיאה
                response = new Response('Resource not available offline', {
                    status: 408,
                    statusText: 'Request Timeout'
                });
            }
        }
        
        return response;
    }
}

// מנהל עדכונים
class UpdateManager {
    static async checkForUpdates() {
        try {
            const response = await fetch('/version.json', { cache: 'no-cache' });
            if (response.ok) {
                const versionInfo = await response.json();
                const currentVersion = CACHE_NAME.split('-v')[1];
                
                if (versionInfo.version !== currentVersion) {
                    return {
                        hasUpdate: true,
                        newVersion: versionInfo.version,
                        currentVersion: currentVersion,
                        updateDetails: versionInfo.changes || []
                    };
                }
            }
        } catch (error) {
            console.warn('Solar System SW: Update check failed:', error);
        }
        
        return { hasUpdate: false };
    }
    
    static async performUpdate() {
        try {
            // מחיקת cache ישן
            await clearAllCaches();
            
            // הורדת קבצים חדשים
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(PRECACHE_URLS);
            
            // הפעלה מחדש של כל הclientים
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_COMPLETE',
                    action: 'reload'
                });
            });
            
            return { success: true };
        } catch (error) {
            console.error('Solar System SW: Update failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// פונקציות תחזוקה
async function optimizeCache() {
    // ניקוי cache שפג תוקפם
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const cacheDate = response.headers.get('date');
            
            if (cacheDate) {
                const ageInDays = (Date.now() - new Date(cacheDate).getTime()) / (1000 * 60 * 60 * 24);
                
                // מחק קבצים ישנים מ-30 ימים
                if (ageInDays > 30) {
                    await cache.delete(request);
                }
            }
        }
    }
}

async function saveUsageStats() {
    // שמירת סטטיסטיקות שימוש (אופציונלי)
    const stats = {
        timestamp: Date.now(),
        cacheSize: await getCacheSize(),
        activeClients: (await self.clients.matchAll()).length
    };
    
    // ניתן לשמור ב-IndexedDB אם נדרש
    console.log('Usage stats:', stats);
}

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
    }
    
    return totalSize;
}

// הרצת משימות תחזוקה כל שעה
setInterval(() => {
    optimizeCache();
    saveUsageStats();
}, 60 * 60 * 1000); // שעה

// בדיקת עדכונים כל 6 שעות
setInterval(async () => {
    const updateInfo = await UpdateManager.checkForUpdates();
    if (updateInfo.hasUpdate) {
        // שליחת הודעה לאפליקציה על עדכון זמין
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE',
                updateInfo: updateInfo
            });
        });
    }
}, 6 * 60 * 60 * 1000); // 6 שעות

// לוג התחלת Service Worker
console.log('Solar System Service Worker loaded successfully');
console.log('Cache Name:', CACHE_NAME);
console.log('Precache URLs:', PRECACHE_URLS.length, 'files');
