// מחלקת בקרות ממשק המשתמש - מתוקנת עם פונקציות מידע
class UIControls {
    constructor() {
        this.app = null;
        this.infoPanel = null; // **הוספה: רפרנס לפאנל מידע**
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
            infoVisible: false
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
            planetList: null,
            
            // פאנל מידע
            infoPanel: null,
            infoPanelName: null,
            infoPanelContent: null,
            infoPanelClose: null
        };
        
        // מאזיני אירועים
        this.eventListeners = new Map();
    }

    // זיהוי מובייל
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    // אתחול הבקרות
    async init(app) {
        try {
            this.app = app;
            
            // איתור אלמנטים
            this.findElements();
            
            // הגדרת מאזיני אירועים
            this.setupEventListeners();
            
            // אתחול פאנל מידע
            this.initInfoPanel();
            
            this.isInitialized = true;
            console.log('✅ UI Controls initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize UI Controls:', error);
            throw error;
        }
    }

    // איתור אלמנטים בDOM
    findElements() {
        // תפריט נייד
        this.controls.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.controls.controlsPanel = document.querySelector('.controls-panel');
        this.controls.closeControls = document.querySelector('.close-controls');
        
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
        this.controls.quickPlayPause = document.getElementById('quickPlayPause');
        this.controls.quickReset = document.getElementById('quickReset');
        this.controls.quickInfo = document.getElementById('quickInfo');
        
        // רשימת כוכבי הלכת
        this.controls.planetList = document.querySelectorAll('.planet-btn');
        
        // פאנל מידע
        this.controls.infoPanel = document.getElementById('infoPanel');
        this.controls.infoPanelName = document.getElementById('planetName');
        this.controls.infoPanelContent = document.querySelector('.info-content');
        this.controls.infoPanelClose = document.querySelector('.close-btn');
    }

    // אתחול פאנל מידע
    initInfoPanel() {
        // יצירת פאנל מידע אם לא קיים
        if (!this.controls.infoPanel) {
            this.createInfoPanel();
        }
        
        // הגדרת מאזיני אירועים לפאנל המידע
        this.setupInfoPanelEvents();
    }

    // יצירת פאנל מידע
    createInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'infoPanel';
        infoPanel.className = 'hidden';
        infoPanel.innerHTML = `
            <div class="info-header">
                <h3 id="planetName">מידע על כוכב הלכת</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <div id="planetPreview"></div>
                <div class="planet-data">
                    <div class="data-item">
                        <span class="data-label">מרחק מהשמש:</span>
                        <span id="distance" class="data-value">-</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">קוטר:</span>
                        <span id="diameter" class="data-value">-</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">מסה:</span>
                        <span id="mass" class="data-value">-</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">תקופת מסלול:</span>
                        <span id="period" class="data-value">-</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">טמפרטורה:</span>
                        <span id="temperature" class="data-value">-</span>
                    </div>
                </div>
                <div id="planetDescription" class="planet-description"></div>
            </div>
        `;
        
        document.body.appendChild(infoPanel);
        
        // עדכון הפניות
        this.controls.infoPanel = infoPanel;
        this.controls.infoPanelName = infoPanel.querySelector('#planetName');
        this.controls.infoPanelContent = infoPanel.querySelector('.info-content');
        this.controls.infoPanelClose = infoPanel.querySelector('.close-btn');
    }

    // הגדרת אירועי פאנל מידע
    setupInfoPanelEvents() {
        // כפתור סגירה
        if (this.controls.infoPanelClose) {
            this.addEventListenerSafe(this.controls.infoPanelClose, 'click', () => {
                this.closeInfoPanel();
            });
        }
        
        // לחיצה מחוץ לפאנל
        if (this.controls.infoPanel) {
            this.addEventListenerSafe(this.controls.infoPanel, 'click', (event) => {
                if (event.target === this.controls.infoPanel) {
                    this.closeInfoPanel();
                }
            });
        }
        
        // מקש Escape
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.state.infoVisible) {
                this.closeInfoPanel();
            }
        });
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // תפריט נייד
        this.setupMobileMenu();
        
        // בקרות עיקריות
        this.setupMainControls();
        
        // בקרות תצוגה
        this.setupViewControls();
        
        // כפתורי כוכבי הלכת
        this.setupPlanetButtons();
        
        // בקרות מהירות
        this.setupQuickControls();
        
        // קיצורי מקלדת
        this.setupKeyboardShortcuts();
        
        // אירועי חלון
        this.setupWindowEvents();
    }

    // הגדרת תפריט נייד
    setupMobileMenu() {
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
        
        // סגירה בלחיצה מחוץ לתפריט
        document.addEventListener('click', (event) => {
            if (this.state.menuOpen && 
                this.controls.controlsPanel && 
                !this.controls.controlsPanel.contains(event.target) &&
                !this.controls.mobileToggle.contains(event.target)) {
                this.closeMobileMenu();
            }
        });
    }

    // הגדרת בקרות עיקריות
    setupMainControls() {
        // השהיה/המשכה
        if (this.controls.playPause) {
            this.addEventListenerSafe(this.controls.playPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
        // איפוס תצוגה
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
    }

    // הגדרת בקרות תצוגה
    setupViewControls() {
        // הצגת מסלולים
        if (this.controls.viewOrbits) {
            this.addEventListenerSafe(this.controls.viewOrbits, 'change', () => {
                this.toggleOrbits();
            });
        }
        
        // הצגת תוויות
        if (this.controls.viewLabels) {
            this.addEventListenerSafe(this.controls.viewLabels, 'change', () => {
                this.toggleLabels();
            });
        }
        
        // מצב ריאליסטי
        if (this.controls.viewRealistic) {
            this.addEventListenerSafe(this.controls.viewRealistic, 'change', () => {
                this.toggleRealisticMode();
            });
        }
        
        // הצגת אסטרואידים
        if (this.controls.viewAsteroids) {
            this.addEventListenerSafe(this.controls.viewAsteroids, 'change', () => {
                this.toggleAsteroids();
            });
        }
    }

    // הגדרת כפתורי כוכבי הלכת
    setupPlanetButtons() {
        this.controls.planetList.forEach(button => {
            const planetName = button.getAttribute('data-planet');
            
            this.addEventListenerSafe(button, 'click', () => {
                this.selectPlanet(planetName);
            });
        });
    }

    // הגדרת בקרות מהירות
    setupQuickControls() {
        // השהיה/המשכה מהירה
        if (this.controls.quickPlayPause) {
            this.addEventListenerSafe(this.controls.quickPlayPause, 'click', () => {
                this.togglePlayPause();
            });
        }
        
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

    // הגדרת קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
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
                case 'KeyI':
                    event.preventDefault();
                    this.toggleInfoPanel();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.closeInfoPanel();
                    break;
            }
        });
    }

    // הגדרת אירועי חלון
    setupWindowEvents() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    // הוספת מאזין אירוע עם הגנה
    addEventListenerSafe(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
            
            // שמירה למטרות ניקוי
            const key = `${element.id || 'unknown'}_${event}`;
            if (!this.eventListeners.has(key)) {
                this.eventListeners.set(key, []);
            }
            this.eventListeners.get(key).push({ element, event, handler });
        }
    }

    // **תיקון: הצגת מידע על כוכב לכת**
    showPlanetInfo(planetName) {
        if (!planetName || typeof PLANETS_DATA === 'undefined') return;
        
        this.state.selectedPlanet = planetName;
        this.state.infoVisible = true;
        
        // שימוש בפאנל המידע המתוקן
        if (this.infoPanel && typeof this.infoPanel.onPlanetSelected === 'function') {
            this.infoPanel.onPlanetSelected(planetName);
        } else if (this.controls.infoPanel) {
            // חלופה: עדכון ישיר של פאנל HTML
            this.updateInfoPanelHTML(planetName);
            this.controls.infoPanel.classList.remove('hidden');
        }
        
        // עדכון כפתורי כוכבי הלכת
        this.updatePlanetButtons(planetName);
        
        console.log(`Showing info for: ${planetName}`);
    }

    // עדכון ישיר של פאנל HTML
    updateInfoPanelHTML(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return;
        
        // עדכון שם
        if (this.controls.infoPanelName) {
            this.controls.infoPanelName.textContent = planetData.name || planetName;
        }
        
        // עדכון נתונים בסיסיים
        const distanceEl = document.getElementById('distance');
        const diameterEl = document.getElementById('diameter');
        const massEl = document.getElementById('mass');
        const periodEl = document.getElementById('period');
        const tempEl = document.getElementById('temperature');
        
        if (distanceEl && planetData.distance) {
            distanceEl.textContent = this.formatDistance(planetData.distance);
        }
        
        if (diameterEl && planetData.radius) {
            diameterEl.textContent = this.formatDiameter(planetData.radius * 2);
        }
        
        if (massEl && planetData.mass) {
            massEl.textContent = this.formatMass(planetData.mass);
        }
        
        if (periodEl && planetData.orbitalPeriod) {
            periodEl.textContent = this.formatPeriod(planetData.orbitalPeriod);
        }
        
        if (tempEl && planetData.temperature) {
            tempEl.textContent = this.formatTemperature(planetData.temperature);
        }
        
        // עדכון תיאור
        const descEl = document.getElementById('planetDescription');
        if (descEl && planetData.description) {
            descEl.textContent = planetData.description;
        }
    }

    // פונקציות עיצוב נתונים
    formatDistance(distance) {
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} אלף ק"מ`;
        } else {
            return `${distance.toFixed(1)} מיליון ק"מ`;
        }
    }

    formatDiameter(diameter) {
        return `${diameter.toLocaleString()} ק"מ`;
    }

    formatMass(mass) {
        const earthMass = 5.972e24;
        const relativeToEarth = mass / earthMass;
        
        if (relativeToEarth < 0.1) {
            return `${relativeToEarth.toFixed(3)} מסות כדור הארץ`;
        } else {
            return `${relativeToEarth.toFixed(1)} מסות כדור הארץ`;
        }
    }

    formatPeriod(period) {
        if (period < 1) {
            return `${(period * 365).toFixed(0)} ימים`;
        } else {
            return `${period.toFixed(1)} שנות כדור הארץ`;
        }
    }

    formatTemperature(temp) {
        if (typeof temp === 'number') {
            return `${temp}°C`;
        } else if (typeof temp === 'object') {
            if (temp.avg !== undefined) return `${temp.avg}°C ממוצע`;
            if (temp.surface !== undefined) return `${temp.surface}°C פני השטח`;
            if (temp.min !== undefined && temp.max !== undefined) {
                return `${temp.min}°C עד ${temp.max}°C`;
            }
        }
        return 'לא ידוע';
    }

    // סגירת פאנל מידע
    closeInfoPanel() {
        this.state.infoVisible = false;
        this.state.selectedPlanet = null;
        
        // שימוש בפאנל המידע המתוקן
        if (this.infoPanel && typeof this.infoPanel.onPlanetDeselected === 'function') {
            this.infoPanel.onPlanetDeselected();
        } else if (this.controls.infoPanel) {
            this.controls.infoPanel.classList.add('hidden');
        }
        
        // איפוס בחירת כוכב לכת בכפתורים
        this.updatePlanetButtons(null);
        
        console.log('Info panel closed');
    }

    // החלפת toggle ל-show
    toggleInfoPanel() {
        if (this.state.infoVisible) {
            this.closeInfoPanel();
        } else {
            // הצגת מידע על השמש כברירת מחדל
            this.showPlanetInfo('sun');
        }
    }

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        // התמקדות על הכוכב לכת
        if (this.app && typeof this.app.focusOnPlanet === 'function') {
            this.app.focusOnPlanet(planetName);
        } else if (this.app && typeof this.app.selectPlanet === 'function') {
            this.app.selectPlanet(planetName);
        }
        
        // הצגת מידע
        this.showPlanetInfo(planetName);
        
        console.log(`Selected planet: ${planetName}`);
    }

    // עדכון כפתורי כוכבי הלכת
    updatePlanetButtons(selectedPlanet) {
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                const planetName = button.dataset.planet;
                if (planetName === selectedPlanet) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    }

    // פונקציות בקרה
    togglePlayPause() {
        if (this.app && typeof this.app.togglePause === 'function') {
            this.app.togglePause();
            this.state.isPaused = this.app.state.isPaused;
            this.updatePlayPauseButton();
        }
    }

    resetView() {
        if (this.app && typeof this.app.resetView === 'function') {
            this.app.resetView();
        }
    }

    setTimeScale(scale) {
        if (this.app && typeof this.app.setTimeScale === 'function') {
            this.app.setTimeScale(scale);
            this.state.timeScale = scale;
        }
    }

    toggleOrbits() {
        if (this.app && typeof this.app.toggleOrbits === 'function') {
            this.app.toggleOrbits();
            this.state.showOrbits = this.app.state.showOrbits;
        }
    }

    toggleLabels() {
        if (this.app && typeof this.app.toggleLabels === 'function') {
            this.app.toggleLabels();
            this.state.showLabels = this.app.state.showLabels;
        }
    }

    toggleAsteroids() {
        if (this.app && typeof this.app.toggleAsteroids === 'function') {
            this.app.toggleAsteroids();
            this.state.showAsteroids = this.app.state.showAsteroids;
        }
    }

    toggleRealisticMode() {
        if (this.app && typeof this.app.toggleRealisticMode === 'function') {
            this.app.toggleRealisticMode();
            this.state.realisticMode = this.app.state.realisticMode;
        }
    }

    // עדכון כפתור השהיה/המשכה
    updatePlayPauseButton() {
        const text = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        const quickText = this.state.isPaused ? '▶️' : '⏸️';
        
        if (this.controls.playPause) {
            this.controls.playPause.textContent = text;
            this.controls.playPause.title = this.state.isPaused ? 'המשך' : 'השהה';
        }
        
        if (this.controls.quickPlayPause) {
            this.controls.quickPlayPause.textContent = quickText;
            this.controls.quickPlayPause.title = this.state.isPaused ? 'המשך' : 'השהה';
        }
    }

    // פתיחה/סגירה של תפריט נייד
    toggleMobileMenu() {
        this.state.menuOpen = !this.state.menuOpen;
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.toggle('active', this.state.menuOpen);
        }
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.toggle('open', this.state.menuOpen);
        }
        
        // מניעת/החזרת scroll
        document.body.style.overflow = this.state.menuOpen ? 'hidden' : '';
        
        console.log('Mobile menu:', this.state.menuOpen ? 'opened' : 'closed');
    }

    closeMobileMenu() {
        this.state.menuOpen = false;
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.remove('active');
        }
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.remove('open');
        }
        
        // החזרת scroll
        document.body.style.overflow = '';
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

    // עדכון ממשק
    updateUI() {
        this.updatePlayPauseButton();
        
        // עדכון checkboxes
        if (this.controls.viewOrbits && this.app) {
            this.controls.viewOrbits.checked = this.app.state.showOrbits;
        }
        
        if (this.controls.viewLabels && this.app) {
            this.controls.viewLabels.checked = this.app.state.showLabels;
        }
        
        if (this.controls.viewAsteroids && this.app) {
            this.controls.viewAsteroids.checked = this.app.state.showAsteroids;
        }
        
        if (this.controls.viewRealistic && this.app) {
            this.controls.viewRealistic.checked = this.app.state.realisticMode;
        }
        
        // עדכון מהירות זמן
        if (this.controls.timeSpeed && this.app) {
            this.controls.timeSpeed.value = this.app.state.timeScale;
            
            if (this.controls.speedValue) {
                this.controls.speedValue.textContent = this.app.state.timeScale.toFixed(1) + 'x';
            }
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

    // איפוס מצב
    resetState() {
        this.state = {
            isPaused: false,
            timeScale: 1,
            showOrbits: true,
            showLabels: true,
            realisticMode: false,
            selectedPlanet: null,
            menuOpen: false,
            infoVisible: false
        };
        
        this.isInitialized = false;
        this.app = null;
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
        
        // החזרת scroll
        document.body.style.overflow = '';
        
        console.log('UI Controls destroyed');
    }
}

// נתונים לצורכי הצגה במידע המהיר
const QUICK_PLANET_DATA = {
    sun: {
        emoji: '☀️',
        color: '#FFD700',
        quickFacts: ['מקור כל האנרגיה במערכת השמש', 'טמפרטורה: 5,778K על פני השטח', 'מכיל 99.86% ממסת מערכת השמש']
    },
    mercury: {
        emoji: '☿️',
        color: '#8C7853',
        quickFacts: ['הכוכב הקרוב ביותר לשמש', 'יום ארוך יותר משנה', 'שינויי טמפרטורה קיצוניים']
    },
    venus: {
        emoji: '♀️',
        color: '#FFC649',
        quickFacts: ['הכוכב החם ביותר', 'מסתובב בכיוון הפוך', 'עננים של חומצה גופרתית']
    },
    earth: {
        emoji: '🌍',
        color: '#6B93D6',
        quickFacts: ['הכוכב היחיד עם חיים', '71% מכוסה במים', 'שדה מגנטי מגן']
    },
    mars: {
        emoji: '♂️',
        color: '#CD5C5C',
        quickFacts: ['הכוכב האדום', 'קוטבי קרח', 'הר הגעש הגבוה ביותר']
    },
    jupiter: {
        emoji: '♃',
        color: '#D8CA9D',
        quickFacts: ['הכוכב הגדול ביותר', 'מגן על כדור הארץ', 'הסופה הגדולה האדומה']
    },
    saturn: {
        emoji: '♄',
        color: '#FAD5A5',
        quickFacts: ['מפורסם בטבעות', 'צף במים', 'טיטאן עם אטמוספירה']
    },
    uranus: {
        emoji: '♅',
        color: '#4FD0E7',
        quickFacts: ['מסתובב על הצד', 'ענק קרח', 'טבעות אנכיות']
    },
    neptune: {
        emoji: '♆',
        color: '#4B70DD',
        quickFacts: ['הרוחות החזקות ביותר', 'שנה = 165 שנות כדור ארץ', 'התגלה בחישובים']
    }
};

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.UIControls = UIControls;
    window.QUICK_PLANET_DATA = QUICK_PLANET_DATA;
}
