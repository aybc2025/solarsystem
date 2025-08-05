// מחלקת בקרות ממשק המשתמש - מתוקן לשגיאות
class UIControls {
    constructor() {
        this.app = null;
        this.elements = new Map();
        this.isInitialized = false;
        
        // מצב הממשק
        this.state = {
            isPaused: false,
            timeScale: 1,
            showOrbits: true,
            showLabels: true,
            realisticMode: false,
            selectedPlanet: null
        };
        
        // אלמנטים בממשק - מותאם לindex.html החדש
        this.controls = {
            playPause: null,
            reset: null, // resetView ב-HTML
            timeSpeed: null,
            speedValue: null,
            viewOrbits: null, // showOrbits ב-HTML  
            viewLabels: null, // showLabels ב-HTML
            viewRealistic: null, // realisticMode ב-HTML
            planetList: null // planet-btn elements
        };
        
        // מאזיני אירועים
        this.eventListeners = new Map();
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
            
            // עדכון ראשוני של הממשק
            this.updateUI();
            
            this.isInitialized = true;
            console.log('UI Controls initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize UI Controls:', error);
            throw error;
        }
    }

    // איתור אלמנטים בDOM - מותאם לHTML החדש
    findDOMElements() {
        // כפתורי בקרה עיקריים
        this.controls.playPause = document.getElementById('playPause');
        this.controls.reset = document.getElementById('resetView'); // שונה מ-reset ל-resetView
        
        // בקרת מהירות זמן
        this.controls.timeSpeed = document.getElementById('timeSpeed');
        this.controls.speedValue = document.getElementById('timeScaleValue'); // שונה מ-speedValue
        
        // כפתורי תצוגה - מותאם לHTML
        this.controls.viewOrbits = document.getElementById('showOrbits');
        this.controls.viewLabels = document.getElementById('showLabels');
        this.controls.viewRealistic = document.getElementById('realisticMode');
        
        // רשימת כוכבי לכת - elements עם class planet-btn
        this.controls.planetList = document.querySelectorAll('.planet-btn');
        
        // בדיקת קיום אלמנטים חיוניים
        const requiredElements = ['playPause', 'timeSpeed'];
        for (const elementName of requiredElements) {
            if (!this.controls[elementName]) {
                console.warn(`UI element '${elementName}' not found`);
            }
        }
        
        // בדיקת planet buttons
        if (!this.controls.planetList || this.controls.planetList.length === 0) {
            console.warn(`UI element 'planetList' not found`);
        }
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // כפתור השהיה/המשכה
        if (this.controls.playPause) {
            this.controls.playPause.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        // כפתור איפוס
        if (this.controls.reset) {
            this.controls.reset.addEventListener('click', () => {
                this.resetView();
            });
        }
        
        // בקרת מהירות זמן
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.addEventListener('input', (event) => {
                this.setTimeScale(parseFloat(event.target.value));
            });
        }
        
        // בקרות תצוגה
        if (this.controls.viewOrbits) {
            this.controls.viewOrbits.addEventListener('change', (event) => {
                this.toggleOrbits(event.target.checked);
            });
        }
        
        if (this.controls.viewLabels) {
            this.controls.viewLabels.addEventListener('change', (event) => {
                this.toggleLabels(event.target.checked);
            });
        }
        
        if (this.controls.viewRealistic) {
            this.controls.viewRealistic.addEventListener('change', (event) => {
                this.toggleRealisticMode(event.target.checked);
            });
        }
        
        // כפתורי כוכבי הלכת
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                button.addEventListener('click', () => {
                    const planetName = button.dataset.planet;
                    this.selectPlanet(planetName);
                });
            });
        }
        
        // מקלדת קיצורים
        this.setupKeyboardShortcuts();
    }

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!this.app) return;
            
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
                    this.toggleOrbits();
                    break;
                case 'KeyL':
                    event.preventDefault();
                    this.toggleLabels();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.closeInfoPanel();
                    break;
            }
        });
    }

    // יצירת רשימת כוכבי הלכת
    createPlanetList() {
        // הפונקציה כבר מיושמת בHTML, אבל נוסיף פונקציונליות נוספת
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                // הוספת tooltip
                const planetName = button.dataset.planet;
                if (planetName) {
                    button.title = `לחץ לצפייה ב${planetName}`;
                }
            });
        }
    }

    // השהיה/המשכה
    togglePlayPause() {
        if (!this.app) return;
        
        this.state.isPaused = !this.state.isPaused;
        this.app.state.isPaused = this.state.isPaused;
        
        // עדכון כפתור
        if (this.controls.playPause) {
            this.controls.playPause.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
        
        console.log(this.state.isPaused ? 'Animation paused' : 'Animation resumed');
    }

    // איפוס תצוגה
    resetView() {
        if (!this.app || typeof this.app.resetView !== 'function') return;
        
        this.app.resetView();
        console.log('View reset');
    }

    // הגדרת מהירות זמן
    setTimeScale(scale) {
        this.state.timeScale = Math.max(0, Math.min(10, scale));
        
        if (this.app) {
            this.app.state.timeScale = this.state.timeScale;
        }
        
        // עדכון תצוגת הערך
        if (this.controls.speedValue) {
            this.controls.speedValue.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
        
        console.log('Time scale set to:', this.state.timeScale);
    }

    // הצגת/הסתרת מסלולים
    toggleOrbits(show = null) {
        if (show === null) {
            this.state.showOrbits = !this.state.showOrbits;
        } else {
            this.state.showOrbits = show;
        }
        
        if (this.app && this.app.orbits) {
            this.app.orbits.forEach(orbit => {
                orbit.visible = this.state.showOrbits;
            });
        }
        
        // עדכון checkbox
        if (this.controls.viewOrbits) {
            this.controls.viewOrbits.checked = this.state.showOrbits;
        }
        
        console.log('Orbits visibility:', this.state.showOrbits);
    }

    // הצגת/הסתרת תוויות
    toggleLabels(show = null) {
        if (show === null) {
            this.state.showLabels = !this.state.showLabels;
        } else {
            this.state.showLabels = show;
        }
        
        if (this.app && this.app.labels) {
            this.app.labels.forEach(label => {
                label.visible = this.state.showLabels;
            });
        }
        
        // עדכון checkbox
        if (this.controls.viewLabels) {
            this.controls.viewLabels.checked = this.state.showLabels;
        }
        
        console.log('Labels visibility:', this.state.showLabels);
    }

    // הפעלת/כיבוי מצב ריאליסטי
    toggleRealisticMode(enabled = null) {
        if (enabled === null) {
            this.state.realisticMode = !this.state.realisticMode;
        } else {
            this.state.realisticMode = enabled;
        }
        
        if (this.app && this.app.planets) {
            this.app.planets.forEach(planet => {
                if (planet.setRealisticScale) {
                    planet.setRealisticScale(this.state.realisticMode);
                }
            });
        }
        
        // עדכון checkbox
        if (this.controls.viewRealistic) {
            this.controls.viewRealistic.checked = this.state.realisticMode;
        }
        
        console.log('Realistic mode:', this.state.realisticMode);
    }

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        // התמקדות על הכוכב לכת
        if (this.app && typeof this.app.focusOnPlanet === 'function') {
            this.app.focusOnPlanet(planetName);
        }
        
        // עדכון סטייל הכפתורים
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                button.classList.remove('active');
                if (button.dataset.planet === planetName) {
                    button.classList.add('active');
                }
            });
        }
        
        // פתיחת פאנל מידע (אם קיים)
        this.openInfoPanel(planetName);
        
        console.log('Selected planet:', planetName);
    }

    // פתיחת פאנל מידע
    openInfoPanel(planetName) {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            const planetNameElement = document.getElementById('planetName');
            if (planetNameElement) {
                planetNameElement.textContent = this.getPlanetDisplayName(planetName);
            }
            
            infoPanel.classList.remove('hidden');
            
            // הוספת מאזין לסגירה
            const closeBtn = infoPanel.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.onclick = () => this.closeInfoPanel();
            }
        }
    }

    // סגירת פאנל מידע
    closeInfoPanel() {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
        
        // איפוס בחירת כוכב הלכת
        this.state.selectedPlanet = null;
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                button.classList.remove('active');
            });
        }
    }

    // קבלת שם תצוגה לכוכב לכת
    getPlanetDisplayName(planetName) {
        const displayNames = {
            sun: 'השמש',
            mercury: 'כוכב חמה',
            venus: 'נוגה',
            earth: 'כדור הארץ',
            mars: 'מאדים',
            jupiter: 'צדק',
            saturn: 'שבתאי',
            uranus: 'אורנוס',
            neptune: 'נפטון'
        };
        
        return displayNames[planetName] || planetName;
    }

    // עדכון ממשק המשתמש
    updateUI() {
        // עדכון כפתור השהיה/המשכה
        if (this.controls.playPause) {
            this.controls.playPause.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
        
        // עדכון בקרת מהירות זמן
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = this.state.timeScale;
        }
        
        if (this.controls.speedValue) {
            this.controls.speedValue.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
        
        // עדכון checkboxes
        if (this.controls.viewOrbits) {
            this.controls.viewOrbits.checked = this.state.showOrbits;
        }
        
        if (this.controls.viewLabels) {
            this.controls.viewLabels.checked = this.state.showLabels;
        }
        
        if (this.controls.viewRealistic) {
            this.controls.viewRealistic.checked = this.state.realisticMode;
        }
    }

    // הגדרת מאזיני אירועים למובייל
    setupMobileEvents() {
        // בקרות מהירות למובייל
        const quickPause = document.getElementById('quickPause');
        const quickReset = document.getElementById('quickReset');
        
        if (quickPause) {
            quickPause.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (quickReset) {
            quickReset.addEventListener('click', () => this.resetView());
        }
    }

    // טיפול באירועי מגע
    handleTouchEvents() {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        document.addEventListener('touchstart', (event) => {
            touchStartTime = Date.now();
            if (event.touches[0]) {
                touchStartPos.x = event.touches[0].clientX;
                touchStartPos.y = event.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchend', (event) => {
            const touchDuration = Date.now() - touchStartTime;
            
            // זיהוי tap מהיר (פחות מ-200ms)
            if (touchDuration < 200) {
                const target = event.target;
                
                // בדיקה אם המגע היה על כוכב לכת
                if (target && target.classList && target.classList.contains('planet-btn')) {
                    const planetName = target.dataset.planet;
                    if (planetName) {
                        this.selectPlanet(planetName);
                    }
                }
            }
        });
    }

    // עדכון מצב המשתמש
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        
        // סנכרון עם האפליקציה
        if (this.app && this.app.state) {
            Object.assign(this.app.state, newState);
        }
        
        // עדכון הממשק
        this.updateUI();
    }

    // קבלת מידע על מצב הבקרות
    getControlsInfo() {
        return {
            isInitialized: this.isInitialized,
            state: { ...this.state },
            availableElements: Object.keys(this.controls).filter(key => this.controls[key] !== null),
            missingElements: Object.keys(this.controls).filter(key => this.controls[key] === null)
        };
    }

    // הפעלת/כיבוי בקרות
    setEnabled(enabled) {
        const elements = Object.values(this.controls).filter(el => el !== null);
        
        elements.forEach(element => {
            if (element.disabled !== undefined) {
                element.disabled = !enabled;
            }
            
            if (element.style) {
                element.style.opacity = enabled ? '1' : '0.5';
                element.style.pointerEvents = enabled ? 'auto' : 'none';
            }
        });
        
        console.log('Controls enabled:', enabled);
    }

    // איפוס הגדרות לברירת מחדל
    resetToDefaults() {
        this.state = {
            isPaused: false,
            timeScale: 1,
            showOrbits: true,
            showLabels: true,
            realisticMode: false,
            selectedPlanet: null
        };
        
        // עדכון האפליקציה
        if (this.app) {
            this.app.state.isPaused = false;
            this.app.state.timeScale = 1;
            this.app.state.showOrbits = true;
            this.app.state.showLabels = true;
            this.app.state.realisticMode = false;
        }
        
        // עדכון הממשק
        this.updateUI();
        
        // יישום השינויים
        this.toggleOrbits(true);
        this.toggleLabels(true);
        this.toggleRealisticMode(false);
        
        console.log('Controls reset to defaults');
    }

    // פונקציית דיבוג
    debug() {
        console.group('UI Controls Debug Info');
        console.log('Controls Info:', this.getControlsInfo());
        console.log('App State:', this.app ? this.app.state : 'No app connected');
        console.groupEnd();
    }

    // ניקוי משאבים
    dispose() {
        // הסרת מאזיני אירועים
        this.eventListeners.forEach((listener, event) => {
            document.removeEventListener(event, listener);
        });
        this.eventListeners.clear();
        
        // איפוס מצב
        this.app = null;
        this.isInitialized = false;
        
        console.log('UI Controls disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIControls;
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
window.UIControls = UIControls;
