// בקרות Orbit Controls מותאמות למובייל - מתוקן
// **תיקון עיקרי: הוסרה הגדרה כפולה של UIControls ושונה שם המחלקה**

class OrbitControlsHandler {
    constructor() {
        this.app = null;
        this.elements = new Map();
        this.isInitialized = false;
        this.isMobile = this.detectMobile();
        
        // מצב הממשק
        this.state = {
            isPaused: false,
            timeScale: 1,
            showOrbits: true,
            showLabels: true,
            realisticMode: false,
            selectedPlanet: null,
            menuOpen: false,
            touchStartTime: 0,
            lastTouchEnd: 0
        };
        
        // אלמנטים בממשק
        this.controls = {
            // תפריט עיקרי
            mobileToggle: null,
            controlsPanel: null,
            closeControls: null,
            
            // בקרות עיקריות
            playPause: null,
            reset: null,
            timeSpeed: null,
            speedValue: null,
            
            // בקרות תצוגה
            viewOrbits: null,
            viewLabels: null,
            viewRealistic: null,
            viewAsteroids: null,
            
            // בקרות מהירות
            quickControls: null,
            quickPlayPause: null,
            quickReset: null,
            quickInfo: null,
            
            // רשימת כוכבי הלכת
            planetList: null
        };
        
        // מאזיני אירועים
        this.eventListeners = new Map();
        
        // הגדרות מגע מתקדמות
        this.touchSettings = {
            tapThreshold: 200, // זמן מקסימלי לטאפ במילישניות
            doubleTapThreshold: 300, // זמן מקסימלי בין טאפים כפולים
            longPressThreshold: 500, // זמן מינימלי ללחיצה ארוכה
            preventZoom: false, // אל תמנע זום דפדפן
            allowPinchZoom: true, // אפשר pinch-to-zoom
            swipeThreshold: 50 // מרחק מינימלי לswipe
        };
        
        // מצבי מגע
        this.touchState = {
            startX: 0,
            startY: 0,
            startDistance: 0,
            isPress: false,
            pressTimer: null,
            lastTap: 0,
            tapCount: 0
        };
    }

    // זיהוי מכשיר נייד משופר
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // בדיקת מסך מגע
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // בדיקת רוחב מסך
        const isSmallScreen = window.innerWidth <= 768;
        
        // בדיקת user agent
        const isMobileUA = /android|iPhone|iPad|iPod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        // זיהוי PWA standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');
        
        console.log('Device detection:', {
            hasTouch,
            isSmallScreen,
            isMobileUA,
            isStandalone
        });
        
        return hasTouch && (isSmallScreen || isMobileUA);
    }

    // אתחול בקרות הממשק
    async init(app) {
        try {
            this.app = app;
            
            // איתור אלמנטים בDOM
            this.findDOMElements();
            
            // הגדרת מאזיני אירועים
            this.setupEventListeners();
            
            // יצירת רשימת כוכבי הלכת
            this.createPlanetList();
            
            // הגדרת תפריט נייד
            if (this.isMobile) {
                this.setupMobileMenu();
            }
            
            // הגדרת בקרות מגע משופרות
            this.setupAdvancedTouchControls();
            
            // עדכון ראשוני של הממשק
            this.updateUI();
            
            // טעינת הגדרות שמורות
            this.loadSettings();
            
            this.isInitialized = true;
            console.log('OrbitControlsHandler initialized successfully (Mobile:', this.isMobile, ')');
            
        } catch (error) {
            console.error('Failed to initialize OrbitControlsHandler:', error);
            throw error;
        }
    }

    // איתור אלמנטים בDOM
    findDOMElements() {
        // תפריט נייד
        this.controls.mobileToggle = document.getElementById('mobileMenuToggle');
        this.controls.controlsPanel = document.getElementById('controls');
        this.controls.closeControls = document.getElementById('closeControls');
        
        // בקרות עיקריות
        this.controls.playPause = document.getElementById('playPause');
        this.controls.reset = document.getElementById('resetView');
        this.controls.timeSpeed = document.getElementById('timeSpeed');
        this.controls.speedValue = document.getElementById('timeScaleValue');
        
        // בקרות תצוגה
        this.controls.viewOrbits = document.getElementById('showOrbits');
        this.controls.viewLabels = document.getElementById('showLabels');
        this.controls.viewRealistic = document.getElementById('realisticMode');
        this.controls.viewAsteroids = document.getElementById('showAsteroids');
        
        // בקרות מהירות
        this.controls.quickControls = document.getElementById('quickControls');
        this.controls.quickPlayPause = document.getElementById('quickPlayPause');
        this.controls.quickReset = document.getElementById('quickReset');
        this.controls.quickInfo = document.getElementById('quickInfo');
        
        // רשימת כוכבי הלכת
        this.controls.planetList = document.querySelectorAll('.planet-btn');
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // בקרות זמן
        if (this.controls.playPause) {
            this.addEventListenerSafe(this.controls.playPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
        if (this.controls.reset) {
            this.addEventListenerSafe(this.controls.reset, 'click', () => {
                this.resetView();
            });
        }
        
        // מהירות זמן
        if (this.controls.timeSpeed) {
            this.addEventListenerSafe(this.controls.timeSpeed, 'input', (event) => {
                const value = parseFloat(event.target.value);
                this.setTimeScale(value);
                
                if (this.controls.speedValue) {
                    this.controls.speedValue.textContent = value.toFixed(1) + 'x';
                }
            });
        }
        
        // בקרות תצוגה
        if (this.controls.viewOrbits) {
            this.addEventListenerSafe(this.controls.viewOrbits, 'change', () => {
                this.toggleOrbits();
            });
        }
        
        if (this.controls.viewLabels) {
            this.addEventListenerSafe(this.controls.viewLabels, 'change', () => {
                this.toggleLabels();
            });
        }
        
        if (this.controls.viewRealistic) {
            this.addEventListenerSafe(this.controls.viewRealistic, 'change', () => {
                this.toggleRealisticMode();
            });
        }
        
        if (this.controls.viewAsteroids) {
            this.addEventListenerSafe(this.controls.viewAsteroids, 'change', () => {
                this.toggleAsteroids();
            });
        }
        
        // תפריט נייד
        if (this.controls.mobileToggle) {
            this.addEventListenerSafe(this.controls.mobileToggle, 'click', () => {
                this.toggleMobileMenu();
            });
        }
        
        if (this.controls.closeControls) {
            this.addEventListenerSafe(this.controls.closeControls, 'click', () => {
                this.closeMobileMenu();
            });
        }
        
        // בקרות מהירות
        if (this.controls.quickPlayPause) {
            this.addEventListenerSafe(this.controls.quickPlayPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
        if (this.controls.quickReset) {
            this.addEventListenerSafe(this.controls.quickReset, 'click', () => {
                this.resetView();
            });
        }
        
        // מידע מהיר
        if (this.controls.quickInfo) {
            this.addEventListenerSafe(this.controls.quickInfo, 'click', () => {
                this.toggleInfoPanel();
            });
        }
        
        // אירועי חלון
        this.setupWindowEventListeners();
    }

    // הוספת מאזין אירועים בטוח
    addEventListenerSafe(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // שמירה לניקוי עתידי
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event, handler });
    }

    // הגדרת אירועי חלון
    setupWindowEventListeners() {
        // שינוי orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // שינוי גודל חלון
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // יצירת רשימת כוכבי הלכת
    createPlanetList() {
        this.controls.planetList.forEach(button => {
            const planetName = button.getAttribute('data-planet');
            
            this.addEventListenerSafe(button, 'click', () => {
                this.selectPlanet(planetName);
            });
        });
    }

    // הגדרת תפריט נייד
    setupMobileMenu() {
        if (!this.isMobile) return;
        
        // הצגת כפתור תפריט נייד
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.style.display = 'block';
        }
        
        // התאמת פאנל הבקרות למובייל
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.add('mobile-mode');
        }
    }

    // הגדרת בקרות מגע משופרות
    setupAdvancedTouchControls() {
        if (!this.isMobile) return;
        
        const canvas = this.app?.renderer?.domElement;
        if (!canvas) return;
        
        // מניעת התנהגויות ברירת מחדל
        canvas.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });
        
        console.log('Advanced touch controls setup complete');
    }

    // טיפול בתחילת מגע
    handleTouchStart(event) {
        const touch = event.touches[0];
        
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
        this.touchState.isPress = true;
        
        // זיהוי לחיצה ארוכה
        this.touchState.pressTimer = setTimeout(() => {
            if (this.touchState.isPress) {
                this.handleLongPress(touch);
            }
        }, this.touchSettings.longPressThreshold);
        
        // זיהוי טאפ כפול
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - this.touchState.lastTap;
        
        if (timeSinceLastTap < this.touchSettings.doubleTapThreshold) {
            this.touchState.tapCount++;
            if (this.touchState.tapCount === 2) {
                this.handleDoubleTap(touch);
                this.touchState.tapCount = 0;
            }
        } else {
            this.touchState.tapCount = 1;
        }
        
        this.touchState.lastTap = currentTime;
    }

    // טיפול בתנועת מגע
    handleTouchMove(event) {
        if (event.touches.length === 1) {
            // מגע יחיד - סיבוב
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.touchState.startX;
            const deltaY = touch.clientY - this.touchState.startY;
            
            // בדיקה אם זה swipe
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > this.touchSettings.swipeThreshold) {
                this.touchState.isPress = false; // לא לחיצה רגילה
                
                // מניעת scroll רק עבור swipe
                event.preventDefault();
                
                this.touchState.startX = touch.clientX;
                this.touchState.startY = touch.clientY;
            }
        } else if (event.touches.length === 2) {
            // מגע כפול - זום
            event.preventDefault(); // מונע זום של הדפדפן
            
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const currentDistance = Math.sqrt(
                Math.pow(touch1.clientX - touch2.clientX, 2) +
                Math.pow(touch1.clientY - touch2.clientY, 2)
            );
            
            if (this.touchState.startDistance) {
                const zoomDelta = (currentDistance - this.touchState.startDistance) * 0.01;
                // כאן אפשר להוסיף זום למצלמה
            }
            
            this.touchState.startDistance = currentDistance;
            this.touchState.isPress = false;
        }
    }

    // טיפול בסיום מגע
    handleTouchEnd(event) {
        // ניקוי timer של לחיצה ארוכה
        if (this.touchState.pressTimer) {
            clearTimeout(this.touchState.pressTimer);
            this.touchState.pressTimer = null;
        }
        
        // בדיקה אם זה היה טאפ קצר
        if (this.touchState.isPress && event.touches.length === 0) {
            // זה היה טאפ - בדוק אם יש צורך לטפל בלחיצה
            this.handleTap(event.changedTouches[0]);
        }
        
        this.touchState.isPress = false;
        this.touchState.startDistance = 0;
    }

    // טיפול בטאפ רגיל
    handleTap(touch) {
        // כאן אפשר להוסיף לוגיקה לבחירת כוכבי לכת על ידי מגע
        console.log('Tap detected at:', touch.clientX, touch.clientY);
    }

    // טיפול בטאפ כפול
    handleDoubleTap(touch) {
        console.log('Double tap detected - resetting view');
        if (this.app && typeof this.app.resetView === 'function') {
            this.app.resetView();
        }
    }

    // טיפול בלחיצה ארוכה
    handleLongPress(touch) {
        console.log('Long press detected - showing context menu');
        // כאן אפשר להוסיף תפריט הקשר או פעולות מיוחדות
    }

    // פונקציות פעולה
    togglePlayPause() {
        if (this.app) {
            this.app.togglePause();
            this.updatePlayPauseButton();
        }
    }

    resetView() {
        if (this.app) {
            this.app.resetView();
        }
    }

    setTimeScale(scale) {
        if (this.app) {
            this.app.setTimeScale(scale);
        }
    }

    toggleOrbits() {
        if (this.app) {
            this.app.toggleOrbits();
        }
    }

    toggleLabels() {
        if (this.app) {
            this.app.toggleLabels();
        }
    }

    toggleAsteroids() {
        if (this.app) {
            this.app.toggleAsteroids();
        }
    }

    toggleRealisticMode() {
        if (this.app) {
            this.app.toggleRealisticMode();
        }
    }

    selectPlanet(planetName) {
        if (this.app) {
            this.app.selectPlanet(planetName);
        }
        
        // סגירת תפריט במובייל אחרי בחירה
        if (this.isMobile) {
            this.closeMobileMenu();
        }
    }

    // פונקציות ממשק
    toggleMobileMenu() {
        if (this.state.menuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.state.menuOpen = true;
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.add('open');
        }
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.add('active');
        }
        
        // מניעת scroll של הגוף
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.state.menuOpen = false;
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.remove('open');
        }
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.remove('active');
        }
        
        // החזרת scroll
        document.body.style.overflow = '';
    }

    toggleInfoPanel() {
        if (this.app && this.app.infoPanel) {
            if (this.app.infoPanel.isVisible) {
                this.app.infoPanel.hide();
            } else {
                this.app.infoPanel.show();
            }
        }
    }

    // עדכון ממשק
    updateUI() {
        this.updatePlayPauseButton();
        this.syncPlayPauseButtons();
    }

    updatePlayPauseButton() {
        if (!this.app) return;
        
        const isPaused = this.app.state.isPaused;
        
        if (this.controls.playPause) {
            this.controls.playPause.textContent = isPaused ? '▶️ המשך' : '⏸️ השהה';
            this.controls.playPause.title = isPaused ? 'המשך' : 'השהה';
        }
    }

    syncPlayPauseButtons() {
        if (!this.app) return;
        
        const isPaused = this.app.state.isPaused;
        
        if (this.controls.quickPlayPause) {
            this.controls.quickPlayPause.textContent = isPaused ? '▶️' : '⏸️';
            this.controls.quickPlayPause.title = isPaused ? 'המשך' : 'השהה';
        }
    }

    // טיפול בשינוי orientation
    handleOrientationChange() {
        if (this.app && this.app.handleResize) {
            this.app.handleResize();
        }
        
        // סגירת תפריט במעבר ל-landscape
        if (window.orientation === 90 || window.orientation === -90) {
            this.closeMobileMenu();
        }
    }

    // טיפול בשינוי גודל
    handleResize() {
        // עדכון זיהוי מובייל
        this.isMobile = this.detectMobile();
        
        // התאמת ממשק
        if (this.isMobile) {
            this.setupMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    // שמירת הגדרות
    saveSettings() {
        if (!this.app) return;
        
        const settings = {
            timeScale: this.app.state.timeScale,
            showOrbits: this.app.state.showOrbits,
            showLabels: this.app.state.showLabels,
            showAsteroids: this.app.state.showAsteroids,
            realisticMode: this.app.state.realisticMode
        };
        
        try {
            localStorage.setItem('solarSystemSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Could not save settings:', error);
        }
    }

    // טעינת הגדרות
    loadSettings() {
        try {
            const saved = localStorage.getItem('solarSystemSettings');
            if (saved && this.app) {
                const settings = JSON.parse(saved);
                
                if (settings.timeScale) {
                    this.app.setTimeScale(settings.timeScale);
                }
                
                // עדכון מצבי תצוגה
                this.updateUI();
            }
        } catch (error) {
            console.warn('Could not load settings:', error);
        }
    }

    // ניקוי resources
    destroy() {
        // ניקוי מאזיני אירועים
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        this.eventListeners.clear();
        
        // ניקוי timers
        if (this.touchState.pressTimer) {
            clearTimeout(this.touchState.pressTimer);
        }
        
        // החזרת scroll
        document.body.style.overflow = '';
        
        console.log('OrbitControlsHandler destroyed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrbitControlsHandler;
}

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.OrbitControlsHandler = OrbitControlsHandler;
}
