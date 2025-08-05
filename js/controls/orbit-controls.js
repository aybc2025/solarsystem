// מחלקת בקרות ממשק המשתמש - עם תמיכה מלאה במובייל
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
        
        // הגדרות מגע
        this.touchSettings = {
            tapThreshold: 200, // זמן מקסימלי לטאפ במילישניות
            doubleTapThreshold: 300, // זמן מקסימלי בין טאפים כפולים
            longPressThreshold: 500, // זמן מינימלי ללחיצה ארוכה
            preventZoom: true
        };
    }

    // זיהוי מכשיר נייד
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // בדיקת מסך מגע
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // בדיקת רוחב מסך
        const isSmallScreen = window.innerWidth <= 768;
        
        // בדיקת user agent
        const isMobileUA = /android|iPhone|iPad|iPod|blackberry|iemobile|opera mini/i.test(userAgent);
        
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
            
            // הגדרת בקרות מגע
            this.setupTouchControls();
            
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
        this.controls.reset = document.getElementById('reset');
        this.controls.timeSpeed = document.getElementById('timeScale');
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
        
        // רשימת כוכבי לכת
        this.controls.planetList = document.querySelector('.planet-buttons');
        
        // בדיקת קיום אלמנטים חיוניים
        const requiredElements = ['playPause', 'reset', 'timeSpeed'];
        for (const elementName of requiredElements) {
            if (!this.controls[elementName]) {
                console.warn(`UI element '${elementName}' not found`);
            }
        }
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // כפתור השהיה/המשכה
        if (this.controls.playPause) {
            this.addEventListenerSafe(this.controls.playPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
        // כפתור איפוס
        if (this.controls.reset) {
            this.addEventListenerSafe(this.controls.reset, 'click', () => {
                this.resetView();
            });
        }
        
        // בקרת מהירות זמן
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
        document.addEventListener('click', (event) => {
            if (this.state.menuOpen && 
                this.controls.controlsPanel && 
                !this.controls.controlsPanel.contains(event.target) &&
                !this.controls.mobileToggle.contains(event.target)) {
                this.closeMobileMenu();
            }
        });
        
        // מניעת סגירה בלחיצה בתוך התפריט
        if (this.controls.controlsPanel) {
            this.addEventListenerSafe(this.controls.controlsPanel, 'click', (e) => {
                e.stopPropagation();
            });
        }
        
        // הגדרת בקרות מהירות
        this.setupQuickControls();
    }

    // הגדרת בקרות מהירות
    setupQuickControls() {
        // סנכרון עם כפתור עיקרי
        if (this.controls.quickPlayPause && this.controls.playPause) {
            this.addEventListenerSafe(this.controls.quickPlayPause, 'click', () => {
                this.controls.playPause.click();
            });
        }
        
        if (this.controls.quickReset && this.controls.reset) {
            this.addEventListenerSafe(this.controls.quickReset, 'click', () => {
                this.controls.reset.click();
            });
        }
        
        // כפתור מידע מהיר
        if (this.controls.quickInfo) {
            this.addEventListenerSafe(this.controls.quickInfo, 'click', () => {
                this.toggleInfoPanel();
            });
        }
        
        // סנכרון טקסט הכפתורים
        this.syncQuickControlsText();
    }

    // סנכרון טקסט כפתורי המהירות
    syncQuickControlsText() {
        if (!this.controls.playPause || !this.controls.quickPlayPause) return;
        
        const observer = new MutationObserver(() => {
            const isPaused = this.controls.playPause.textContent.includes('המשך');
            this.controls.quickPlayPause.textContent = isPaused ? '▶️' : '⏸️';
            this.controls.quickPlayPause.title = isPaused ? 'המשך' : 'השהה';
        });
        
        observer.observe(this.controls.playPause, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // הגדרת בקרות מגע
    setupTouchControls() {
        if (!this.isMobile) return;
        
        // מניעת זום לא רצוי
        if (this.touchSettings.preventZoom) {
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            document.addEventListener('gesturestart', (e) => {
                e.preventDefault();
            });
        }
        
        // טיפול בלחיצות כפולות
        this.setupDoubleTapHandler();
        
        // טיפול בלחיצות ארוכות
        this.setupLongPressHandler();
    }

    // טיפול בלחיצות כפולות
    setupDoubleTapHandler() {
        let lastTap = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < this.touchSettings.doubleTapThreshold && tapLength > 0) {
                // לחיצה כפולה - איפוס תצוגה
                this.resetView();
                e.preventDefault();
            }
            
            lastTap = currentTime;
        });
    }

    // טיפול בלחיצות ארוכות
    setupLongPressHandler() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            this.state.touchStartTime = new Date().getTime();
            
            pressTimer = setTimeout(() => {
                // לחיצה ארוכה - פתיחת תפריט מידע
                this.toggleInfoPanel();
                navigator.vibrate && navigator.vibrate(50); // רטט קצר
            }, this.touchSettings.longPressThreshold);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }

    // הגדרת כפתורי תצוגה
    setupViewButtons() {
        const viewButtons = [
            { element: this.controls.viewOrbits, setting: 'showOrbits' },
            { element: this.controls.viewLabels, setting: 'showLabels' },
            { element: this.controls.viewRealistic, setting: 'realisticMode' },
            { element: this.controls.viewAsteroids, setting: 'showAsteroids' }
        ];
        
        viewButtons.forEach(({ element, setting }) => {
            if (element) {
                this.addEventListenerSafe(element, 'click', () => {
                    this.toggleViewSetting(setting);
                });
            }
        });
    }

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // התעלמות אם יש אלמנט input פעיל או תפריט פתוח
            if (document.activeElement && 
                (document.activeElement.tagName === 'INPUT' || 
                 document.activeElement.tagName === 'TEXTAREA') ||
                this.state.menuOpen) {
                return;
            }
            
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePlayPause();
                    break;
                    
                case 'KeyR':
                    event.preventDefault();
                    this.resetView();
                    break;
                    
                case 'KeyO':
                    event.preventDefault();
                    this.toggleViewSetting('showOrbits');
                    break;
                    
                case 'KeyL':
                    event.preventDefault();
                    this.toggleViewSetting('showLabels');
                    break;
                    
                case 'KeyM':
                    event.preventDefault();
                    this.toggleViewSetting('realisticMode');
                    break;
                    
                case 'KeyA':
                    event.preventDefault();
                    this.toggleViewSetting('showAsteroids');
                    break;
                    
                case 'Escape':
                    event.preventDefault();
                    if (this.state.menuOpen) {
                        this.closeMobileMenu();
                    } else {
                        this.deselectPlanet();
                    }
                    break;
                    
                case 'KeyI':
                    event.preventDefault();
                    this.toggleInfoPanel();
                    break;
                    
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                    event.preventDefault();
                    const planetIndex = parseInt(event.code.slice(-1)) - 1;
                    this.selectPlanetByIndex(planetIndex);
                    break;
                    
                case 'Equal':
                case 'NumpadAdd':
                    event.preventDefault();
                    this.adjustTimeScale(1.5);
                    break;
                    
                case 'Minus':
                case 'NumpadSubtract':
                    event.preventDefault();
                    this.adjustTimeScale(1 / 1.5);
                    break;
            }
        });
    }

    // הגדרת מאזיני אירועי אפליקציה
    setupAppEventListeners() {
        if (!this.app) return;
        
        // מאזין לשינויי מצב
        this.app.on && this.app.on('stateChanged', (data) => {
            this.updateUIFromState(data);
        });
        
        // מאזין לבחירת כוכב לכת
        this.app.on && this.app.on('planetSelected', (data) => {
            this.updatePlanetSelection(data.planet);
        });
        
        // מאזין לביטול בחירה
        this.app.on && this.app.on('planetDeselected', () => {
            this.updatePlanetSelection(null);
        });
        
        // מאזין לעדכון FPS
        this.app.on && this.app.on('fpsUpdate', (data) => {
            this.updateFPSDisplay(data.fps);
        });
    }

    // הגדרת מאזיני אירועי חלון
    setupWindowEventListeners() {
        // שינוי גודל מסך
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // שינוי כיוון מסך
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // מעבר למצב רקע/חזרה
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    // יצירת רשימת כוכבי הלכת
    createPlanetList() {
        if (!this.controls.planetList) return;
        
        // רשימת כוכבי הלכת בסדר
        const planets = [
            'mercury', 'venus', 'earth', 'mars', 
            'jupiter', 'saturn', 'uranus', 'neptune'
        ];
        
        // ניקוי תוכן קיים
        this.controls.planetList.innerHTML = '';
        
        planets.forEach((planetName, index) => {
            const planetData = PLANETS_DATA[planetName];
            if (!planetData) return;
            
            const planetItem = this.createPlanetListItem(planetName, planetData, index);
            this.controls.planetList.appendChild(planetItem);
        });
    }

    // יצירת פריט ברשימת כוכבי הלכת
    createPlanetListItem(planetName, planetData, index) {
        const planetItem = document.createElement('button');
        planetItem.className = 'planet-btn';
        planetItem.dataset.planet = planetName;
        planetItem.dataset.index = index;
        planetItem.setAttribute('aria-label', `בחר ${planetData.name}`);
        
        // צבע כוכב הלכת
        const planetIcon = this.getPlanetIcon(planetName);
        
        // תוכן הכפתור
        planetItem.innerHTML = `
            <span class="planet-icon">${planetIcon}</span>
            <span class="planet-name">${planetData.name}</span>
            ${!this.isMobile ? `<span class="keyboard-shortcut">${index + 1}</span>` : ''}
        `;
        
        // הוספת מאזין לחיצה
        this.addEventListenerSafe(planetItem, 'click', () => {
            this.selectPlanet(planetName);
            if (this.isMobile) {
                this.closeMobileMenu();
            }
        });
        
        // הוספת אפקטי מגע למובייל
        if (this.isMobile) {
            this.addTouchEffects(planetItem);
        }
        
        return planetItem;
    }

    // קבלת אייקון כוכב לכת
    getPlanetIcon(planetName) {
        const icons = {
            mercury: '☿',
            venus: '♀',
            earth: '🌍',
            mars: '♂',
            jupiter: '♃',
            saturn: '♄',
            uranus: '♅',
            neptune: '♆'
        };
        return icons[planetName] || '●';
    }

    // הוספת אפקטי מגע
    addTouchEffects(element) {
        this.addEventListenerSafe(element, 'touchstart', () => {
            element.style.transform = 'scale(0.95)';
            element.style.opacity = '0.8';
        });
        
        this.addEventListenerSafe(element, 'touchend', () => {
            setTimeout(() => {
                element.style.transform = '';
                element.style.opacity = '';
            }, 150);
        });
        
        this.addEventListenerSafe(element, 'touchcancel', () => {
            element.style.transform = '';
            element.style.opacity = '';
        });
    }

    // פעולות בקרה עיקריות
    togglePlayPause() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.app && this.app.togglePause) {
            this.app.togglePause();
        }
        
        this.updatePlayPauseButton();
        this.emitEvent('playPauseToggled', { isPaused: this.state.isPaused });
        
        // רטט קצר במובייל
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    resetView() {
        if (this.app && this.app.resetView) {
            this.app.resetView();
        }
        
        // איפוס הגדרות ממשק
        this.state.selectedPlanet = null;
        this.state.timeScale = 1;
        
        this.updateUI();
        this.emitEvent('viewReset');
        
        // רטט קצר במובייל
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // סגירת תפריט במובייל
        if (this.isMobile) {
            this.closeMobileMenu();
        }
    }

    setTimeScale(scale) {
        const newScale = Math.max(0.1, Math.min(10, scale));
        this.state.timeScale = newScale;
        
        if (this.app && this.app.setTimeScale) {
            this.app.setTimeScale(newScale);
        }
        
        this.updateSpeedDisplay();
        this.emitEvent('timeScaleChanged', { scale: newScale });
    }

    adjustTimeScale(multiplier) {
        const currentScale = this.state.timeScale;
        const newScale = Math.max(0.1, Math.min(10, currentScale * multiplier));
        
        this.setTimeScale(newScale);
        
        // עדכון slider
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = newScale;
        }
        
        // הצגת הודעה זמנית
        this.showTemporaryMessage(`מהירות: ${newScale.toFixed(1)}x`);
    }

    toggleViewSetting(setting) {
        this.state[setting] = !this.state[setting];
        
        if (this.app && this.app.setViewMode) {
            this.app.setViewMode(setting, this.state[setting]);
        }
        
        this.updateViewButtons();
        this.emitEvent('viewSettingChanged', { setting, value: this.state[setting] });
        
        // רטט קצר במובייל
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(20);
        }
    }

    // ניהול תפריט נייד
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
        
        document.body.classList.add('menu-open');
        
        // מניעת גלילה ברקע
        document.body.style.overflow = 'hidden';
        
        this.emitEvent('mobileMenuOpened');
    }

    closeMobileMenu() {
        this.state.menuOpen = false;
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.remove('open');
        }
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.remove('active');
        }
        
        document.body.classList.remove('menu-open');
        
        // החזרת גלילה
        document.body.style.overflow = '';
        
        this.emitEvent('mobileMenuClosed');
    }

    // בחירת כוכבי לכת
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        if (this.app && this.app.focusOnPlanet) {
            this.app.focusOnPlanet(planetName);
        }
        
        this.updatePlanetSelection(planetName);
        this.emitEvent('planetSelected', { planet: planetName });
        
        // רטט במובייל
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(40);
        }
    }

    selectPlanetByIndex(index) {
        const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        if (index >= 0 && index < planets.length) {
            this.selectPlanet(planets[index]);
        }
    }

    deselectPlanet() {
        this.state.selectedPlanet = null;
        
        if (this.app && this.app.deselectPlanet) {
            this.app.deselectPlanet();
        }
        
        this.updatePlanetSelection(null);
        this.emitEvent('planetDeselected');
    }

    // ניהול פאנל מידע
    toggleInfoPanel() {
        const infoPanel = document.getElementById('infoPanel');
        
        if (infoPanel && !infoPanel.classList.contains('hidden')) {
            infoPanel.classList.add('hidden');
        } else {
            // הצגת מידע כללי אם אין כוכב לכת נבחר
            const planetToShow = this.state.selectedPlanet || 'sun';
            if (this.app && this.app.showPlanetInfo) {
                this.app.showPlanetInfo(planetToShow);
            }
        }
    }

    // עדכוני ממשק
    updateUI() {
        this.updatePlayPauseButton();
        this.updateSpeedDisplay();
        this.updateViewButtons();
        this.updatePlanetSelection(this.state.selectedPlanet);
    }

    updatePlayPauseButton() {
        if (!this.controls.playPause) return;
        
        const button = this.controls.playPause;
        
        if (this.state.isPaused) {
            button.innerHTML = '▶️ המשך';
            button.classList.add('paused');
            button.setAttribute('aria-label', 'המשך סימולציה');
        } else {
            button.innerHTML = '⏸️ השהה';
            button.classList.remove('paused');
            button.setAttribute('aria-label', 'השהה סימולציה');
        }
        
        // עדכון כפתור מהיר
        if (this.controls.quickPlayPause) {
            this.controls.quickPlayPause.textContent = this.state.isPaused ? '▶️' : '⏸️';
            this.controls.quickPlayPause.title = this.state.isPaused ? 'המשך' : 'השהה';
        }
    }

    updateSpeedDisplay() {
        if (!this.controls.speedValue) return;
        
        const scale = this.state.timeScale;
        let displayText;
        
        if (scale === 0) {
            displayText = 'מושהה';
        } else if (scale < 1) {
            displayText = `${(scale * 100).toFixed(0)}%`;
        } else if (scale === 1) {
            displayText = '1x';
        } else if (scale < 10) {
            displayText = `${scale.toFixed(1)}x`;
        } else {
            displayText = `${Math.round(scale)}x`;
        }
        
        this.controls.speedValue.textContent = displayText;
        
        // עדכון slider
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = scale;
        }
    }

    updateViewButtons() {
        const buttons = [
            { element: this.controls.viewOrbits, setting: 'showOrbits' },
            { element: this.controls.viewLabels, setting: 'showLabels' },
            { element: this.controls.viewRealistic, setting: 'realisticMode' },
            { element: this.controls.viewAsteroids, setting: 'showAsteroids' }
        ];
        
        buttons.forEach(({ element, setting }) => {
            if (element) {
                if (this.state[setting]) {
                    element.classList.add('active');
                    element.setAttribute('aria-pressed', 'true');
                } else {
                    element.classList.remove('active');
                    element.setAttribute('aria-pressed', 'false');
                }
            }
        });
    }

    updatePlanetSelection(planetName) {
        // עדכון רשימת כוכבי הלכת
        const planetButtons = this.controls.planetList?.querySelectorAll('.planet-btn');
        
        if (planetButtons) {
            planetButtons.forEach(button => {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
                
                if (planetName && button.dataset.planet === planetName) {
                    button.classList.add('active');
                    button.setAttribute('aria-pressed', 'true');
                    
                    // גלילה לכוכב הלכת הנבחר במובייל
                    if (this.isMobile) {
                        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        }
        
        this.state.selectedPlanet = planetName;
    }

    updateUIFromState(data) {
        // עדכון מהמידע שמגיע מהאפליקציה
        Object.assign(this.state, data);
        this.updateUI();
    }

    updateFPSDisplay(fps) {
        // הצגת FPS (אם יש אלמנט מתאים)
        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement) {
            fpsElement.textContent = fps;
            
            // צביעה לפי ביצועים
            if (fps >= 50) {
                fpsElement.className = 'fps-good';
            } else if (fps >= 30) {
                fpsElement.className = 'fps-medium';
            } else {
                fpsElement.className = 'fps-poor';
            }
        }
    }

    // טיפול באירועי מערכת
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        // אם המצב השתנה, עדכן הגדרות
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.setupMobileMenu();
                this.setupTouchControls();
            } else {
                this.closeMobileMenu();
            }
        }
        
        this.emitEvent('screenResized', { 
            isMobile: this.isMobile, 
            width: window.innerWidth, 
            height: window.innerHeight 
        });
    }

    handleOrientationChange() {
        // סגירת תפריט במעבר לרוחב במובייל
        if (this.isMobile && window.innerHeight < window.innerWidth) {
            this.closeMobileMenu();
        }
        
        this.emitEvent('orientationChanged', { 
            orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape' 
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // מעבר לרקע - השהיה אוטומטית
            if (!this.state.isPaused && this.app && this.app.togglePause) {
                this.togglePlayPause();
                this.wasAutoPaused = true;
            }
        } else {
            // חזרה לחזית - המשכה אוטומטית
            if (this.wasAutoPaused && this.state.isPaused) {
                this.togglePlayPause();
                this.wasAutoPaused = false;
            }
        }
    }

    // הצגת הודעות למשתמש
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="סגור הודעה">✕</button>
            </div>
        `;
        
        // עיצוב בסיסי
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #ffd700;
            z-index: 2000;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        
        if (type === 'error') {
            notification.style.borderColor = '#ff5252';
            notification.style.background = 'rgba(211, 47, 47, 0.9)';
        } else if (type === 'success') {
            notification.style.borderColor = '#4caf50';
            notification.style.background = 'rgba(76, 175, 80, 0.9)';
        }
        
        // התאמה למובייל
        if (this.isMobile) {
            notification.style.cssText += `
                top: auto;
                bottom: 100px;
                right: 15px;
                left: 15px;
                max-width: none;
                transform: translateY(100%);
            `;
        }
        
        // הוספה לDOM
        document.body.appendChild(notification);
        
        // אנימציה כניסה
        setTimeout(() => {
            if (this.isMobile) {
                notification.style.transform = 'translateY(0)';
            } else {
                notification.style.transform = 'translateX(0)';
            }
        }, 10);
        
        // כפתור סגירה
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // סגירה אוטומטית
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
        
        return notification;
    }

    hideNotification(notification) {
        if (this.isMobile) {
            notification.style.transform = 'translateY(100%)';
        } else {
            notification.style.transform = 'translateX(100%)';
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showTemporaryMessage(message, duration = 1500) {
        // הצגת הודעה זמנית במרכז המסך
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffd700;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 2001;
            pointer-events: none;
            font-weight: bold;
            border: 1px solid #ffd700;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, duration);
    }

    // מערכת אירועים פנימית
    emitEvent(eventType, data = {}) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
        
        // שליחה גם למאזינים פנימיים
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn('Event listener error:', error);
                }
            });
        }
    }

    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }

    removeEventListener(eventType, callback) {
        if (this.eventListeners.has(eventType)) {
            const listeners = this.eventListeners.get(eventType);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // שמירה וטעינה של הגדרות
    saveSettings() {
        const settings = {
            timeScale: this.state.timeScale,
            showOrbits: this.state.showOrbits,
            showLabels: this.state.showLabels,
            realisticMode: this.state.realisticMode,
            showAsteroids: this.state.showAsteroids,
            version: '2.0'
        };
        
        try {
            localStorage.setItem('solarSystemSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.warn('Failed to save settings:', error);
            
            // fallback לcookies
            try {
                const settingsData = JSON.stringify(settings);
                document.cookie = `solarSystemSettings=${settingsData}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
                return true;
            } catch (cookieError) {
                console.warn('Failed to save settings to cookies:', cookieError);
                return false;
            }
        }
    }

    loadSettings() {
        try {
            // נסה localStorage תחילה
            let settingsData = localStorage.getItem('solarSystemSettings');
            
            if (!settingsData) {
                // fallback לcookies
                const cookies = document.cookie.split(';');
                const settingsCookie = cookies.find(cookie => cookie.trim().startsWith('solarSystemSettings='));
                
                if (settingsCookie) {
                    settingsData = settingsCookie.split('=')[1];
                }
            }
            
            if (settingsData) {
                const settings = JSON.parse(settingsData);
                
                // החלת ההגדרות
                Object.assign(this.state, settings);
                this.updateUI();
                
                return true;
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        
        return false;
    }

    // עדכון מתמיד
    update(deltaTime) {
        // עדכונים שצריכים להתבצע בכל פריים
        if (this.isInitialized) {
            // שמירה מדי פעם
            if (Math.random() < 0.001) { // אחת למאה פריימים בקירוב
                this.saveSettings();
            }
        }
    }

    // קבלת מידע על מצב הממשק
    getState() {
        return {
            ...this.state,
            isInitialized: this.isInitialized,
            isMobile: this.isMobile
        };
    }

    // ניקוי משאבים
    dispose() {
        // הסרת מאזיני אירועים
        this.eventListeners.forEach(listeners => {
            listeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
        });
        this.eventListeners.clear();
        
        // ניקוי אלמנטים
        Object.keys(this.controls).forEach(key => {
            this.controls[key] = null;
        });
        
        // שמירה אחרונה
        this.saveSettings();
        
        this.isInitialized = false;
        console.log('UI Controls disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIControls;
}