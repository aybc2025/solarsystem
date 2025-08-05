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
            
            // עדכון בזמן אמת
            this.controls.timeSpeed.addEventListener('mousemove', (event) => {
                if (event.buttons === 1) { // לחצן שמאל לחוץ
                    this.setTimeScale(parseFloat(event.target.value));
                }
            });
        }
        
        // כפתורי תצוגה
        this.setupViewButtons();
        
        // קיצורי מקלדת
        this.setupKeyboardShortcuts();
        
        // אירועי אפליקציה - מותאם ללא app.on
        this.setupAppEventListeners();
    }

    // הגדרת כפתורי תצוגה
    setupViewButtons() {
        const viewButtons = [
            { element: this.controls.viewOrbits, setting: 'showOrbits', method: 'toggleOrbits' },
            { element: this.controls.viewLabels, setting: 'showLabels', method: 'toggleLabels' },
            { element: this.controls.viewRealistic, setting: 'realisticMode', method: 'toggleRealisticMode' }
        ];
        
        viewButtons.forEach(({ element, setting, method }) => {
            if (element) {
                element.addEventListener('click', () => {
                    this.toggleViewSetting(setting, method);
                });
            }
        });
    }

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // התעלמות אם יש אלמנט input פעיל
            if (document.activeElement && 
                (document.activeElement.tagName === 'INPUT' || 
                 document.activeElement.tagName === 'TEXTAREA')) {
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
                    
                case 'KeyO':
                    event.preventDefault();
                    this.toggleViewSetting('showOrbits', 'toggleOrbits');
                    break;
                    
                case 'KeyL':
                    event.preventDefault();
                    this.toggleViewSetting('showLabels', 'toggleLabels');
                    break;
                    
                case 'KeyM':
                    event.preventDefault();
                    this.toggleViewSetting('realisticMode', 'toggleRealisticMode');
                    break;
                    
                case 'Escape':
                    event.preventDefault();
                    this.deselectPlanet();
                    break;
            }
        });
    }

    // הגדרת מאזיני אירועי אפליקציה - ללא app.on
    setupAppEventListeners() {
        if (!this.app) return;
        
        // במקום app.on, נשתמש בחיפוש מידע ישיר מהapp
        // זה יקרה ב-update loop
    }

    // יצירת רשימת כוכבי הלכת
    createPlanetList() {
        if (!this.controls.planetList || this.controls.planetList.length === 0) {
            return;
        }

        // הוספת מאזיני קליק לכל כפתור כוכב לכת
        this.controls.planetList.forEach(button => {
            const planetName = button.getAttribute('data-planet');
            if (planetName) {
                button.addEventListener('click', () => {
                    this.selectPlanet(planetName);
                });
            }
        });
    }

    // פונקציות פעולה
    togglePlayPause() {
        if (this.app && typeof this.app.togglePause === 'function') {
            this.app.togglePause();
            this.updatePlayPauseButton();
        }
    }

    resetView() {
        if (this.app && typeof this.app.resetView === 'function') {
            this.app.resetView();
        }
    }

    setTimeScale(scale) {
        this.state.timeScale = scale;
        if (this.app && typeof this.app.setTimeScale === 'function') {
            this.app.setTimeScale(scale);
        }
        
        // עדכון תצוגה
        if (this.controls.speedValue) {
            this.controls.speedValue.textContent = scale.toFixed(1) + 'x';
        }
    }

    toggleViewSetting(setting, method) {
        this.state[setting] = !this.state[setting];
        
        // קריאה למתודה באפליקציה
        if (this.app && typeof this.app[method] === 'function') {
            this.app[method]();
        }
        
        // עדכון כפתור
        this.updateToggleButton(setting);
    }

    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        if (this.app && typeof this.app.selectPlanet === 'function') {
            this.app.selectPlanet(planetName);
        }
        
        this.updatePlanetSelection(planetName);
    }

    deselectPlanet() {
        this.state.selectedPlanet = null;
        
        if (this.app && typeof this.app.deselectPlanet === 'function') {
            this.app.deselectPlanet();
        }
        
        this.updatePlanetSelection(null);
    }

    // עדכון ממשק
    updateUI() {
        this.updatePlayPauseButton();
        this.updateToggleButtons();
        this.updateTimeScale();
    }

    updatePlayPauseButton() {
        if (!this.controls.playPause || !this.app) return;
        
        const isPaused = this.app.state ? this.app.state.isPaused : false;
        this.controls.playPause.textContent = isPaused ? '▶️ המשך' : '⏸️ השהה';
        this.controls.playPause.title = isPaused ? 'המשך' : 'השהה';
    }

    updateToggleButtons() {
        const toggleButtons = [
            { element: this.controls.viewOrbits, state: 'showOrbits' },
            { element: this.controls.viewLabels, state: 'showLabels' },
            { element: this.controls.viewRealistic, state: 'realisticMode' }
        ];
        
        toggleButtons.forEach(({ element, state }) => {
            this.updateToggleButton(state);
        });
    }

    updateToggleButton(stateName) {
        const buttonMap = {
            'showOrbits': this.controls.viewOrbits,
            'showLabels': this.controls.viewLabels,
            'realisticMode': this.controls.viewRealistic
        };
        
        const button = buttonMap[stateName];
        if (button) {
            const isActive = this.state[stateName];
            button.classList.toggle('active', isActive);
        }
    }

    updateTimeScale() {
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = this.state.timeScale;
        }
        
        if (this.controls.speedValue) {
            this.controls.speedValue.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
    }

    updatePlanetSelection(planetName) {
        // עדכון כפתורי כוכבי הלכת
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                const buttonPlanet = button.getAttribute('data-planet');
                button.classList.toggle('selected', buttonPlanet === planetName);
            });
        }
    }

    // עדכון מתמיד - קריאה מlucky render loop
    update(deltaTime) {
        // סנכרון מצב עם האפליקציה
        if (this.app && this.app.state) {
            const appState = this.app.state;
            
            // בדיקה אם צריך לעדכן UI
            if (this.state.isPaused !== appState.isPaused) {
                this.state.isPaused = appState.isPaused;
                this.updatePlayPauseButton();
            }
            
            if (this.state.selectedPlanet !== appState.selectedPlanet) {
                this.state.selectedPlanet = appState.selectedPlanet;
                this.updatePlanetSelection(appState.selectedPlanet);
            }
        }
    }

    // שמירת הגדרות
    saveSettings() {
        try {
            const settings = {
                timeScale: this.state.timeScale,
                showOrbits: this.state.showOrbits,
                showLabels: this.state.showLabels,
                realisticMode: this.state.realisticMode
            };
            
            localStorage.setItem('solarSystemSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.warn('Failed to save settings:', error);
            return false;
        }
    }

    // טעינת הגדרות
    loadSettings() {
        try {
            const saved = localStorage.getItem('solarSystemSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
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

    // קבלת מידע על מצב הממשק
    getState() {
        return {
            ...this.state,
            isInitialized: this.isInitialized
        };
    }

    // ניקוי משאבים
    dispose() {
        // הסרת מאזיני אירועים
        this.eventListeners.clear();
        
        // ניקוי אלמנטים
        Object.keys(this.controls).forEach(key => {
            this.controls[key] = null;
        });
        
        this.isInitialized = false;
        console.log('UI Controls disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIControls;
}
