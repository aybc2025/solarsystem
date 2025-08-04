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
    
    // Icons (would be actual paths in production)
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    
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
    
    // מציאת אסטרטגיית cache מתאימה
    const routeConfig = findMatchingRoute(request.url);
    
    if (routeConfig) {
        event.respondWith(
            handleCacheStrategy(request, routeConfig)
        );
    } else {
        // אסטרטגיה ברירת מחדל
        event.respondWith(
            handleDefaultStrategy(request)
        );
    }
});

// טיפול בעמוד הראשי
async function handleMainPage(request) {
    try {
        // ניסיון לטעון מהרשת
        const networkResponse = await fetch(request);
        
        // עדכון cache עם התוכן החדש
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        // אם הרשת לא זמינה, טעינה מcache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // אם אין cache, החזרת עמוד offline
        return caches.match('/offline.html');
    }
}

// מציאת route מתאים
function findMatchingRoute(url) {
    return ROUTE_CONFIGS.find(config => config.pattern.test(url));
}

// טיפול באסטרטגיות cache
async function handleCacheStrategy(request, config) {
    const { strategy, cacheName = RUNTIME_CACHE } = config;
    
    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return handleCacheFirst(request, cacheName, config);
            
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return handleNetworkFirst(request, cacheName, config);
            
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return handleStaleWhileRevalidate(request, cacheName, config);
            
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);
            
        case CACHE_STRATEGIES.CACHE_ONLY:
            return caches.match(request);
            
        default:
            return handleDefaultStrategy(request);
    }
}

// Cache First Strategy
async function handleCacheFirst(request, cacheName, config) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // בדיקת תוקף cache
        if (config.expiration && isCacheExpired(cachedResponse, config.expiration)) {
            // Cache פג תוקף - ניסיון לעדכן ברקע
            updateCacheInBackground(request, cacheName);
        }
        return cachedResponse;
    }
    
    // אין cache - טעינה מהרשת וCache
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            
            // ניהול הגבלות cache
            if (config.expiration) {
                manageCacheSize(cacheName, config.expiration);
            }
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('Solar System SW: Network request failed:', error);
        return new Response('Network Error', { status: 408 });
    }
}

// Network First Strategy
async function handleNetworkFirst(request, cacheName, config) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            
            if (config.expiration) {
                manageCacheSize(cacheName, config.expiration);
            }
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Network Error and no cache available', { status: 408 });
    }
}

// Stale While Revalidate Strategy
async function handleStaleWhileRevalidate(request, cacheName, config) {
    const cachedResponse = await caches.match(request);
    
    // טעינה מהרשת ברקע לעדכון cache
    const networkResponsePromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                const cache = caches.open(cacheName);
                cache.then(c => c.put(request, networkResponse.clone()));
                
                if (config.expiration) {
                    manageCacheSize(cacheName, config.expiration);
                }
            }
            return networkResponse;
        })
        .catch(error => {
            console.warn('Solar System SW: Background update failed:', error);
        });
    
    // החזרת cache אם קיים, אחרת המתנה לרשת
    return cachedResponse || networkResponsePromise;
}

// אסטרטגיה ברירת מחדל
async function handleDefaultStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache רק תגובות מוצלחות
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 408 });
    }
}

// עדכון cache ברקע
function updateCacheInBackground(request, cacheName) {
    fetch(request)
        .then(response => {
            if (response.ok) {
                return caches.open(cacheName)
                    .then(cache => cache.put(request, response));
            }
        })
        .catch(error => {
            console.warn('Solar System SW: Background cache update failed:', error);
        });
}

// בדיקת תוקף cache
function isCacheExpired(response, expiration) {
    if (!expiration.maxAgeSeconds) return false;
    
    const cacheDate = response.headers.get('sw-cache-date');
    if (!cacheDate) return false;
    
    const age = Date.now() - new Date(cacheDate).getTime();
    return age > (expiration.maxAgeSeconds * 1000);
}

// ניהול גודל cache
async function manageCacheSize(cacheName, expiration) {
    if (!expiration.maxEntries) return;
    
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > expiration.maxEntries) {
        // מחיקת הכניסות הישנות ביותר
        const entriesToDelete = keys.length - expiration.maxEntries;
        const keysToDelete = keys.slice(0, entriesToDelete);
        
        await Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
        
        console.log(`Solar System SW: Cleaned ${entriesToDelete} entries from ${cacheName}`);
    }
}

// טיפול בהודעות מהאפליקציה העיקרית
self.addEventListener('message', event => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                type: 'VERSION',
                version: CACHE_NAME
            });
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(
                cacheUrls(data.urls)
                    .then(() => {
                        event.ports[0].postMessage({
                            type: 'CACHE_COMPLETE',
                            success: true
                        });
                    })
                    .catch(error => {
                        event.ports[0].postMessage({
                            type: 'CACHE_COMPLETE',
                            success: false,
                            error: error.message
                        });
                    })
            );
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(
                clearAllCaches()
                    .then(() => {
                        event.ports[0].postMessage({
                            type: 'CACHE_CLEARED',
                            success: true
                        });
                    })
                    .catch(error => {
                        event.ports[0].postMessage({
                            type: 'CACHE_CLEARED',
                            success: false,
                            error: error.message
                        });
                    })
            );
            break;
    }
});

// Cache של URLs נוספים
async function cacheUrls(urls) {
    const cache = await caches.open(RUNTIME_CACHE);
    return cache.addAll(urls);
}

// ניקוי כל הcaches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// טיפול בשגיאות לא מטופלות
self.addEventListener('error', event => {
    console.error('Solar System SW: Unhandled error:', event.error);
});

// טיפול בהודעות push (עבור עדכונים עתידיים)
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: data.data,
        actions: data.actions || []
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// טיפול בלחיצה על התראה
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
// טיפול בלחיצה על התראה
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // חיפוש חלון פתוח עם האפליקציה
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // פתיחת חלון חדש אם לא נמצא
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// עדכונים אוטומטיים
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            performBackgroundSync()
        );
    }
});

// סנכרון ברקע
async function performBackgroundSync() {
    try {
        // בדיקת עדכונים לנתונים אסטרונומיים
        const response = await fetch('/api/planetary-data');
        if (response.ok) {
            const data = await response.json();
            
            // עדכון cache עם נתונים חדשים
            const cache = await caches.open('astronomical-data');
            await cache.put('/api/planetary-data', new Response(JSON.stringify(data)));
            
            console.log('Solar System SW: Astronomical data updated');
        }
    } catch (error) {
        console.warn('Solar System SW: Background sync failed:', error);
    }
}

// מעקב אחר שימוש באפליקציה לאופטימיזציה
let usageStats = {
    pageViews: 0,
    planetViews: {},
    featureUsage: {},
    sessionStart: Date.now()
};

// עדכון סטטיסטיקות שימוש
function updateUsageStats(type, data) {
    switch (type) {
        case 'page-view':
            usageStats.pageViews++;
            break;
        case 'planet-view':
            usageStats.planetViews[data.planet] = (usageStats.planetViews[data.planet] || 0) + 1;
            break;
        case 'feature-use':
            usageStats.featureUsage[data.feature] = (usageStats.featureUsage[data.feature] || 0) + 1;
            break;
    }
}

// שמירת סטטיסטיקות ב-IndexedDB (לצורך אנליטיקה עתידית)
async function saveUsageStats() {
    try {
        // פתיחת IndexedDB
        const request = indexedDB.open('SolarSystemStats', 1);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('usage')) {
                db.createObjectStore('usage', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['usage'], 'readwrite');
            const store = transaction.objectStore('usage');
            
            const statsRecord = {
                timestamp: Date.now(),
                sessionDuration: Date.now() - usageStats.sessionStart,
                ...usageStats
            };
            
            store.add(statsRecord);
        };
    } catch (error) {
        console.warn('Solar System SW: Failed to save usage stats:', error);
    }
}

// ניטור ביצועים
let performanceMetrics = {
    renderTimes: [],
    loadTimes: [],
    memoryUsage: []
};

// רישום מדדי ביצועים
function recordPerformanceMetric(type, value) {
    if (performanceMetrics[type]) {
        performanceMetrics[type].push({
            value,
            timestamp: Date.now()
        });
        
        // שמירה על מקסימום 100 מדידות
        if (performanceMetrics[type].length > 100) {
            performanceMetrics[type].shift();
        }
    }
}

// אופטימיזציית cache על בסיס שימוש
async function optimizeCache() {
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const keys = await cache.keys();
        
        // מיון לפי תדירות שימוש (יש לממש מעקב)
        const sortedKeys = keys.sort((a, b) => {
            // השוואה על בסיס נתוני שימוש
            return 0; // מימוש פשוט - יש להרחיב
        });
        
        // מחיקת 20% מהקבצים הפחות בשימוש אם Cache מלא
        if (keys.length > 200) {
            const keysToDelete = sortedKeys.slice(-Math.floor(keys.length * 0.2));
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
            
            console.log(`Solar System SW: Optimized cache - removed ${keysToDelete.length} items`);
        }
    } catch (error) {
        console.warn('Solar System SW: Cache optimization failed:', error);
    }
}

// ניהול מצב offline מתקדם
class OfflineManager {
    static async isOnline() {
        try {
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    static async getOfflineCapabilities() {
        const capabilities = {
            coreApp: false,
            planetaryData: false,
            textures: false,
            educational: false
        };
        
        try {
            // בדיקת זמינות קבצי ליבה
            const coreCache = await caches.open(CACHE_NAME);
            const coreFiles = await coreCache.keys();
            capabilities.coreApp = coreFiles.length > 0;
            
            // בדיקת זמינות נתונים
            const dataCache = await caches.open('astronomical-data');
            const dataFiles = await dataCache.keys();
            capabilities.planetaryData = dataFiles.length > 0;
            
            // בדיקת זמינות טקסטורות
            const imageCache = await caches.open('images-cache');
            const imageFiles = await imageCache.keys();
            capabilities.textures = imageFiles.length > 0;
            
        } catch (error) {
            console.warn('Solar System SW: Failed to check offline capabilities:', error);
        }
        
        return capabilities;
    }
}

// עדכון אוטומטי של האפליקציה
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

// ייצוא פונקציות לבדיקות (אם נדרש)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        PRECACHE_URLS,
        OfflineManager,
        UpdateManager
    };
}
