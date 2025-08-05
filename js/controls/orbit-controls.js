// מחלקת בקרות ממשק המשתמש - עם תמיכה מלאה במובייל ותיקוני PWA
class UIControls {
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
            console.log('UI Controls initialized successfully (Mobile:', this.isMobile, ')');
            
        } catch (error) {
            console.error('Failed to initialize UI Controls:', error);
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
                this.setTimeScale(parseFloat(event.target.value));
            });
            
            // עדכון בזמן אמת למגע
            this.addEventListenerSafe(this.controls.timeSpeed, 'touchmove', (event) => {
                this.setTimeScale(parseFloat(event.target.value));
            });
        }
        
        // כפתורי תצוגה
        this.setupViewButtons();
        
        // קיצורי מקלדת
        this.setupKeyboardShortcuts();
        
        // אירועי אפליקציה
        this.setupAppEventListeners();
        
        // אירועי חלון
        this.setupWindowEventListeners();
    }

    // הוספת מאזין אירוע עם הגנה
    addEventListenerSafe(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            
            // שמירה למטרות ניקוי
            const key = `${element.id || 'unknown'}_${event}`;
            if (!this.eventListeners.has(key)) {
                this.eventListeners.set(key, []);
            }
            this.eventListeners.get(key).push({ element, event, handler });
        }
    }

    // הגדרת תפריט נייד
    setupMobileMenu() {
        // כפתור פתיחת תפריט
        if (this.controls.mobileToggle) {
            this.addEventListenerSafe(this.controls.mobileToggle, 'click', () => {
                this.toggleMobileMenu();
            });
            
            // מניעת propagation
            this.addEventListenerSafe(this.controls.mobileToggle, 'touchstart', (e) => {
                e.stopPropagation();
            });
        }
        
        // כפתור סגירת תפריט
        if (this.controls.closeControls) {
            this.addEventListenerSafe(this.controls.closeControls, 'click', () => {
                this.closeMobileMenu();
            });
        }
        
        // סגירה בלחיצה מחוץ לתפריט
        document.addEventListener('click', (e) => {
            if (this.state.menuOpen && 
                this.controls.controlsPanel && 
                !this.controls.controlsPanel.contains(e.target) &&
                !this.controls.mobileToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // מניעת סגירה בלחיצה בתוך התפריט
        if (this.controls.controlsPanel) {
            this.addEventListenerSafe(this.controls.controlsPanel, 'click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // הגדרת בקרות מגע מתקדמות
    setupAdvancedTouchControls() {
        if (!this.isMobile) return;
        
        const canvas = this.app.renderer.domElement;
        
        // מניעת זום לא רצוי רק בהקשרים מסוימים
        if (this.touchSettings.preventZoom) {
            document.addEventListener('touchstart', (e) => {
                // אפשר pinch-to-zoom למרות הכל
                if (e.touches.length === 2 && this.touchSettings.allowPinchZoom) {
                    return; // אל תמנע
                }
                
                if (e.touches.length > 2) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('gesturestart', (e) => {
                // אפשר gesture zoom בתנאים מסוימים
                if (this.touchSettings.allowPinchZoom) {
                    return;
                }
                e.preventDefault();
            }, { passive: false });
        }
        
        // טיפול בלחיצות כפולות משופר
        this.setupAdvancedDoubleTapHandler(canvas);
        
        // טיפול בלחיצות ארוכות
        this.setupLongPressHandler(canvas);
        
        // טיפול בswipe gestures
        this.setupSwipeHandler(canvas);
        
        // טיפול בpinch-to-zoom משופר
        this.setupPinchZoomHandler(canvas);
    }

    // טיפול בלחיצות כפולות משופר
    setupAdvancedDoubleTapHandler(canvas) {
        canvas.addEventListener('touchend', (e) => {
            const currentTime = Date.now();
            const touch = e.changedTouches[0];
            
            // בדיקת מיקום הטאפ
            const rect = canvas.getBoundingClientRect();
            const tapX = touch.clientX - rect.left;
            const tapY = touch.clientY - rect.top;
            
            if (this.touchState.lastTap && 
                (currentTime - this.touchState.lastTap) < this.touchSettings.doubleTapThreshold) {
                
                // לחיצה כפולה - זום חכם או איפוס
                this.handleDoubleTap(tapX, tapY);
                e.preventDefault();
                
                // איפוס מספר הטאפים
                this.touchState.tapCount = 0;
                this.touchState.lastTap = 0;
            } else {
                this.touchState.tapCount = 1;
                this.touchState.lastTap = currentTime;
            }
        }, { passive: false });
    }

    // טיפול בלחיצה כפולה
    handleDoubleTap(x, y) {
        // ניסיון לזהות אובייקט במיקום הטאפ
        const mouse = new THREE.Vector2();
        const rect = this.app.renderer.domElement.getBoundingClientRect();
        
        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -(y / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.app.camera);
        
        // בדיקה אם פגענו בכוכב לכת
        const selectableObjects = [];
        if (this.app.sun) selectableObjects.push(this.app.sun);
        this.app.planets.forEach(planet => selectableObjects.push(planet));
        
        const intersects = raycaster.intersectObjects(selectableObjects, true);
        
        if (intersects.length > 0) {
            // זום על האובייקט שנבחר
            this.zoomToObject(intersects[0].object);
        } else {
            // איפוס תצוגה
            this.resetView();
        }
    }

    // זום על אובייקט
    zoomToObject(object) {
        if (this.app && this.app.controls) {
            const targetPosition = object.position.clone();
            const distance = object.userData.data ? 
                object.userData.data.scaledRadius * 6 : 100;
            
            const newCameraPosition = targetPosition.clone().add(
                new THREE.Vector3(distance, distance * 0.5, distance)
            );
            
            // אנימציה חלקה
            this.animateCamera(newCameraPosition, targetPosition);
        }
    }

    // אנימציית מצלמה חלקה
    animateCamera(targetPosition, lookAtPosition) {
        if (!this.app || !this.app.camera || !this.app.controls) return;
        
        const startPosition = this.app.camera.position.clone();
        const startLookAt = this.app.controls.target.clone();
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.app.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.app.controls.target.lerpVectors(startLookAt, lookAtPosition, easeProgress);
            this.app.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // טיפול בלחיצות ארוכות
    setupLongPressHandler(canvas) {
        canvas.addEventListener('touchstart', (e) => {
            this.touchState.startX = e.touches[0].clientX;
            this.touchState.startY = e.touches[0].clientY;
            this.touchState.isPress = true;
            
            this.touchState.pressTimer = setTimeout(() => {
                if (this.touchState.isPress) {
                    // לחיצה ארוכה - פתיחת תפריט מידע או הקשרים
                    this.handleLongPress(this.touchState.startX, this.touchState.startY);
                    
                    // רטט קצר אם זמין
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, this.touchSettings.longPressThreshold);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (this.touchState.isPress) {
                const moveX = e.touches[0].clientX - this.touchState.startX;
                const moveY = e.touches[0].clientY - this.touchState.startY;
                const distance = Math.sqrt(moveX * moveX + moveY * moveY);
                
                // אם זז יותר מדי, זה לא לחיצה ארוכה
                if (distance > this.touchSettings.swipeThreshold) {
                    this.touchState.isPress = false;
                    clearTimeout(this.touchState.pressTimer);
                }
            }
        });
        
        canvas.addEventListener('touchend', () => {
            this.touchState.isPress = false;
            clearTimeout(this.touchState.pressTimer);
        });
    }

    // טיפול בלחיצה ארוכה
    handleLongPress(x, y) {
        // פתיחת תפריט מידע או הצגת אפשרויות נוספות
        this.toggleInfoPanel();
    }

    // טיפול בswipe gestures
    setupSwipeHandler(canvas) {
        let startX, startY, startTime;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const endTime = Date.now();
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;
                
                // בדיקה אם זה swipe מהיר
                if (deltaTime < 300 && Math.abs(deltaX) > this.touchSettings.swipeThreshold) {
                    if (deltaX > 0) {
                        this.handleSwipeRight();
                    } else {
                        this.handleSwipeLeft();
                    }
                }
            }
        });
    }

    // טיפול בswipe ימינה
    handleSwipeRight() {
        // פתיחת תפריט נייד
        if (this.isMobile && !this.state.menuOpen) {
            this.openMobileMenu();
        }
    }

    // טיפול בswipe שמאלה  
    handleSwipeLeft() {
        // סגירת תפריט נייד
        if (this.isMobile && this.state.menuOpen) {
            this.closeMobileMenu();
        }
    }

    // טיפול בpinch-to-zoom משופר
    setupPinchZoomHandler(canvas) {
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.touchState.startDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.touchState.startDistance > 0) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                const scale = currentDistance / this.touchState.startDistance;
                
                // אפשר זום של Three.js אבל גם של הדפדפן
                if (this.app && this.app.controls && this.app.controls.enabled) {
                    // זום של Three.js
                    if (scale !== 1) {
                        const camera = this.app.camera;
                        const zoomScale = scale > 1 ? 0.95 : 1.05;
                        
                        camera.position.multiplyScalar(zoomScale);
                        
                        // הגבלות זום
                        const distance = camera.position.length();
                        if (distance < 50) {
                            camera.position.normalize().multiplyScalar(50);
                        } else if (distance > 3000) {
                            camera.position.normalize().multiplyScalar(3000);
                        }
                    }
                }
                
                this.touchState.startDistance = currentDistance;
            }
        }, { passive: true }); // passive כדי לא לחסום זום דפדפן
    }

    // הגדרת כפתורי תצוגה
    setupViewButtons() {
        // מסלולים
        if (this.controls.viewOrbits) {
            this.addEventListenerSafe(this.controls.viewOrbits, 'click', () => {
                this.toggleOrbits();
            });
        }
        
        // תוויות
        if (this.controls.viewLabels) {
            this.addEventListenerSafe(this.controls.viewLabels, 'click', () => {
                this.toggleLabels();
            });
        }
        
        // מצב ריאליסטי
        if (this.controls.viewRealistic) {
            this.addEventListenerSafe(this.controls.viewRealistic, 'click', () => {
                this.toggleRealisticMode();
            });
        }
        
        // אסטרואידים
        if (this.controls.viewAsteroids) {
            this.addEventListenerSafe(this.controls.viewAsteroids, 'click', () => {
                this.toggleAsteroids();
            });
        }
    }

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // התעלמות אם המיקוד על שדה קלט
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.resetView();
                    break;
                case 'KeyM':
                    event.preventDefault();
                    this.toggleMobileMenu();
                    break;
                case 'KeyI':
                    event.preventDefault();
                    this.toggleInfoPanel();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.closeMobileMenu();
                    break;
            }
        });
    }

    // הגדרת אירועי אפליקציה
    setupAppEventListeners() {
        // סנכרון כפתורי play/pause
        this.setupPlayPauseSync();
        
        // בקרות מהירות למובייל
        this.setupQuickControls();
    }

    // סנכרון כפתורי play/pause
    setupPlayPauseSync() {
        // סנכרון בין הכפתור הראשי והמהיר
        if (this.controls.quickPlayPause) {
            this.addEventListenerSafe(this.controls.quickPlayPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
        // צפייה בשינויים בכפתור הראשי
        if (this.controls.playPause) {
            const observer = new MutationObserver(() => {
                this.syncPlayPauseButtons();
            });
            
            observer.observe(this.controls.playPause, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    // הגדרת בקרות מהירות
    setupQuickControls() {
        // איפוס מהיר
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
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
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
        
        console.log('UI Controls destroyed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIControls;
}
