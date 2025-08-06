// מחלקת בקרות ממשק המשתמש - מתוקנת עם פונקציות מידע
class UIControls {
    constructor() {
        this.app = null;
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
            infoVisible: false // **הוספה: מעקב אחר פאנל מידע**
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
            
            // **הוספה: פאנל מידע**
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
            
            // **הוספה: אתחול פאנל מידע**
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
        this.controls.quickPlayPause = document.getElementById('quickPause');
        this.controls.quickReset = document.getElementById('quickReset');
        this.controls.quickInfo = document.getElementById('quickInfo');
        
        // רשימת כוכבי הלכת
        this.controls.planetList = document.querySelectorAll('.planet-btn');
        
        // **הוספה: פאנל מידע**
        this.controls.infoPanel = document.getElementById('infoPanel');
        this.controls.infoPanelName = document.getElementById('planetName');
        this.controls.infoPanelContent = document.querySelector('.info-content');
        this.controls.infoPanelClose = document.querySelector('.close-btn');
    }

    // **הוספה: אתחול פאנל מידע**
    initInfoPanel() {
        // יצירת פאנל מידע אם לא קיים
        if (!this.controls.infoPanel) {
            this.createInfoPanel();
        }
        
        // הגדרת מאזיני אירועים לפאנל המידע
        this.setupInfoPanelEvents();
    }

    // **הוספה: יצירת פאנל מידע**
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
                <div id="planetData"></div>
            </div>
        `;
        
        document.body.appendChild(infoPanel);
        
        // עדכון הפניות
        this.controls.infoPanel = infoPanel;
        this.controls.infoPanelName = infoPanel.querySelector('#planetName');
        this.controls.infoPanelContent = infoPanel.querySelector('.info-content');
        this.controls.infoPanelClose = infoPanel.querySelector('.close-btn');
    }

    // **הוספה: הגדרת אירועי פאנל מידע**
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
                this.setTimeScale(parseFloat(event.target.value));
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

    // **תיקון: הגדרת כפתורי כוכבי הלכת עם פאנל מידע**
    setupPlanetButtons() {
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                const planetName = button.dataset.planet;
                if (planetName) {
                    // **תיקון: הוספת פתיחת מידע בנוסף להתמקדות**
                    this.addEventListenerSafe(button, 'click', () => {
                        this.selectPlanet(planetName);
                        this.showPlanetInfo(planetName); // **הוספה: פתיחת מידע**
                    });
                    
                    button.title = `לחץ לצפייה ב${this.getPlanetDisplayName(planetName)}`;
                }
            });
        }
    }

    // הגדרת בקרות מהירות
    setupQuickControls() {
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
        
        // **הוספה: כפתור מידע מהיר**
        if (this.controls.quickInfo) {
            this.addEventListenerSafe(this.controls.quickInfo, 'click', () => {
                if (this.state.selectedPlanet) {
                    this.showPlanetInfo(this.state.selectedPlanet);
                } else {
                    this.showPlanetInfo('sun'); // ברירת מחדל - השמש
                }
            });
        }
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
                case 'KeyI': // **הוספה: קיצור דרך למידע**
                    event.preventDefault();
                    if (this.state.selectedPlanet) {
                        this.showPlanetInfo(this.state.selectedPlanet);
                    }
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

    // פתיחה/סגירה של תפריט נייד
    toggleMobileMenu() {
        this.state.menuOpen = !this.state.menuOpen;
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.toggle('active', this.state.menuOpen);
        }
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.toggle('open', this.state.menuOpen);
        }
        
        console.log('Mobile menu:', this.state.menuOpen ? 'opened' : 'closed');
    }

    // סגירת תפריט נייד
    closeMobileMenu() {
        this.state.menuOpen = false;
        
        if (this.controls.mobileToggle) {
            this.controls.mobileToggle.classList.remove('active');
        }
        
        if (this.controls.controlsPanel) {
            this.controls.controlsPanel.classList.remove('open');
        }
    }

    // **הוספה: הצגת מידע על כוכב לכת**
    showPlanetInfo(planetName) {
        if (!planetName || !PLANETS_DATA[planetName]) {
            console.warn('Invalid planet name:', planetName);
            return;
        }
        
        const planetData = PLANETS_DATA[planetName];
        this.state.selectedPlanet = planetName;
        this.state.infoVisible = true;
        
        // עדכון תוכן הפאנל
        if (this.controls.infoPanelName) {
            this.controls.infoPanelName.textContent = planetData.name;
        }
        
        // יצירת תוכן מפורט
        this.updatePlanetContent(planetName, planetData);
        
        // הצגת הפאנל
        if (this.controls.infoPanel) {
            this.controls.infoPanel.classList.remove('hidden');
            this.controls.infoPanel.className = `planet-${planetName}`; // הוספת מחלקת צבע
        }
        
        // עדכון כפתורי כוכבי הלכת
        this.updatePlanetButtons(planetName);
        
        console.log(`Showing info for: ${planetData.name}`);
    }

    // **הוספה: עדכון תוכן כוכב הלכת**
    updatePlanetContent(planetName, planetData) {
        const planetDataDiv = document.getElementById('planetData');
        if (!planetDataDiv) return;
        
        // תצוגה מקדימה של כוכב הלכת
        const previewDiv = document.getElementById('planetPreview');
        if (previewDiv) {
            previewDiv.innerHTML = this.createPlanetPreview(planetName, planetData);
        }
        
        // נתונים מפורטים
        planetDataDiv.innerHTML = `
            <div class="planet-description">
                <p>${planetData.description}</p>
            </div>
            
            <div class="planet-data">
                <div class="data-item">
                    <span class="label">רדיוס:</span>
                    <span class="value">${planetData.radius?.toLocaleString() || 'לא ידוע'} ק"מ</span>
                </div>
                ${planetData.distance ? `
                    <div class="data-item">
                        <span class="label">מרחק מהשמש:</span>
                        <span class="value">${(planetData.distance / 1e6).toFixed(1)} מיליון ק"מ</span>
                    </div>
                ` : ''}
                ${planetData.orbitalPeriod ? `
                    <div class="data-item">
                        <span class="label">שנה:</span>
                        <span class="value">${planetData.orbitalPeriod.toFixed(1)} ימי כדור ארץ</span>
                    </div>
                ` : ''}
                ${planetData.rotationPeriod ? `
                    <div class="data-item">
                        <span class="label">יום:</span>
                        <span class="value">${Math.abs(planetData.rotationPeriod).toFixed(2)} ימי כדור ארץ</span>
                    </div>
                ` : ''}
                ${planetData.temperature ? `
                    <div class="data-item">
                        <span class="label">טמפרטורה:</span>
                        <span class="value">${this.formatTemperature(planetData.temperature)}</span>
                    </div>
                ` : ''}
                ${planetData.moons !== undefined ? `
                    <div class="data-item">
                        <span class="label">ירחים:</span>
                        <span class="value">${planetData.moons}</span>
                    </div>
                ` : ''}
            </div>
            
            ${planetData.facts ? `
                <div class="interesting-facts">
                    <h4>עובדות מעניינות</h4>
                    <ul>
                        ${planetData.facts.slice(0, 4).map(fact => `<li>${fact}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    // **הוספה: יצירת תצוגה מקדימה של כוכב הלכת**
    createPlanetPreview(planetName, planetData) {
        const color = planetData.color ? `#${planetData.color.toString(16).padStart(6, '0')}` : '#888888';
        
        let preview = `
            <div class="planet-sphere" style="background: radial-gradient(circle at 30% 30%, ${color}, ${this.darkenColor(color, 0.3)});">
        `;
        
        // הוספת טבעות לשבתאי
        if (planetName === 'saturn') {
            preview += '<div class="saturn-rings"></div>';
        }
        
        preview += '</div>';
        return preview;
    }

    // **הוספה: החשכת צבע**
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor)));
        const g = Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor)));
        const b = Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor)));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // **הוספה: פורמט טמפרטורה**
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

    // **הוספה: סגירת פאנל מידע**
    closeInfoPanel() {
        this.state.infoVisible = false;
        
        if (this.controls.infoPanel) {
            this.controls.infoPanel.classList.add('hidden');
        }
        
        // איפוס בחירת כוכב לכת בכפתורים
        this.updatePlanetButtons(null);
        
        console.log('Info panel closed');
    }

    // **הוספה: עדכון כפתורי כוכבי הלכת**
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

    // בחירת כוכב לכת
    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        // התמקדות על הכוכב לכת
        if (this.app && typeof this.app.focusOnPlanet === 'function') {
            this.app.focusOnPlanet(planetName);
        } else if (this.app && typeof this.app.selectPlanet === 'function') {
            this.app.selectPlanet(planetName);
        }
        
        // עדכון כפתורים
        this.updatePlanetButtons(planetName);
        
        console.log(`Selected planet: ${planetName}`);
    }

    // קבלת שם תצוגה לכוכב לכת
    getPlanetDisplayName(planetName) {
        const planetData = PLANETS_DATA[planetName];
        return planetData ? planetData.name : planetName;
    }

    // פונקציות בקרה
    togglePlayPause() {
        if (this.app && typeof this.app.togglePause === 'function') {
            this.app.togglePause();
            this.state.isPaused = this.app.state.isPaused;
            this.updatePlayPauseButton();
        }
    }

    // עדכון כפתור השהיה/המשכה
    updatePlayPauseButton() {
        const text = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        const quickText = this.state.isPaused ? '▶️' : '⏸️';
        
        if (this.controls.playPause) {
            this.controls.playPause.textContent = text;
        }
        
        if (this.controls.quickPlayPause) {
            this.controls.quickPlayPause.textContent = quickText;
        }
    }

    resetView() {
        if (this.app && typeof this.app.resetView === 'function') {
            this.app.resetView();
        }
        
        // איפוס בחירת כוכב לכת
        this.state.selectedPlanet = null;
        this.updatePlanetButtons(null);
        this.closeInfoPanel();
    }

    setTimeScale(scale) {
        if (this.app && typeof this.app.setTimeScale === 'function') {
            this.app.setTimeScale(scale);
            this.state.timeScale = scale;
            
            // עדכון תצוגת הערך
            if (this.controls.speedValue) {
                this.controls.speedValue.textContent = scale.toFixed(1) + 'x';
            }
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
        if (this.app && typeof this.app.toggleAsteroidBelt === 'function') {
            this.app.toggleAsteroidBelt();
            this.state.showAsteroids = this.app.state.showAsteroids;
        }
    }

    toggleRealisticMode() {
        if (this.app && typeof this.app.toggleRealisticMode === 'function') {
            this.app.toggleRealisticMode();
            this.state.realisticMode = this.app.state.realisticMode;
        }
    }

    // טיפול בשינוי גודל חלון
    handleResize() {
        // סגירת תפריט נייד בשינוי גודל
        if (this.state.menuOpen && window.innerWidth > 768) {
            this.closeMobileMenu();
        }
        
        // התאמת פאנל מידע
        if (this.state.infoVisible && this.controls.infoPanel) {
            // ודוא שהפאנל נשאר במרכז
            // הCSS כבר מטפל בזה, אבל נוודא
        }
    }

    // טיפול בשינוי orientation
    handleOrientationChange() {
        // המתנה קצרה לסיום השינוי
        setTimeout(() => {
            this.handleResize();
        }, 200);
    }

    // **הוספה: פתיחה/סגירה של פאנל מידע**
    toggleInfoPanel() {
        if (this.state.infoVisible) {
            this.closeInfoPanel();
        } else {
            // פתיחת מידע על כוכב הלכת הנבחר או השמש
            const planetToShow = this.state.selectedPlanet || 'sun';
            this.showPlanetInfo(planetToShow);
        }
    }

    // קבלת מידע מהיר על כוכב לכת
    getQuickPlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return 'מידע לא זמין';
        
        const facts = planetData.facts || [];
        return `${planetData.name}\n\n${planetData.description}\n\nעובדות מעניינות:\n${facts.slice(0, 3).join('\n')}`;
    }

    // טיפול בלחיצה מחוץ לפאנל
    handleOutsideClick(event) {
        // סגירת פאנל מידע
        if (this.state.infoVisible && 
            this.controls.infoPanel && 
            !this.controls.infoPanel.contains(event.target)) {
            this.closeInfoPanel();
        }
    }

    // **הוספה: פונקציות עזר לטמפרטורה**
    formatTemperatureRange(temp) {
        if (typeof temp === 'object') {
            if (temp.min !== undefined && temp.max !== undefined) {
                return `${temp.min}°C - ${temp.max}°C`;
            }
            if (temp.day !== undefined && temp.night !== undefined) {
                return `יום: ${temp.day}°C, לילה: ${temp.night}°C`;
            }
            if (temp.avg !== undefined) {
                return `${temp.avg}°C ממוצע`;
            }
        }
        return typeof temp === 'number' ? `${temp}°C` : 'לא ידוע';
    }

    // **הוספה: חישוב השוואה לכדור הארץ**
    getEarthComparison(planetName) {
        const planetData = PLANETS_DATA[planetName];
        const earthData = PLANETS_DATA.earth;
        
        if (!planetData || planetName === 'earth') return null;
        
        const comparisons = [];
        
        // השוואת גודל
        if (planetData.radius && earthData.radius) {
            const ratio = planetData.radius / earthData.radius;
            if (ratio > 1) {
                comparisons.push(`גדול פי ${ratio.toFixed(1)} מכדור הארץ`);
            } else {
                comparisons.push(`קטן פי ${(1/ratio).toFixed(1)} מכדור הארץ`);
            }
        }
        
        // השוואת מסה
        if (planetData.mass && earthData.mass) {
            const massRatio = planetData.mass / earthData.mass;
            if (massRatio > 1) {
                comparisons.push(`כבד פי ${massRatio.toFixed(1)} מכדור הארץ`);
            } else {
                comparisons.push(`קל פי ${(1/massRatio).toFixed(1)} מכדור הארץ`);
            }
        }
        
        return comparisons;
    }

    // סנכרון מצב עם האפליקציה
    syncWithApp() {
        if (!this.app) return;
        
        // עדכון מצב האפליקציה
        if (this.app.state) {
            this.state.isPaused = this.app.state.isPaused || false;
            this.state.timeScale = this.app.state.timeScale || 1;
            this.state.showOrbits = this.app.state.showOrbits !== false;
            this.state.showLabels = this.app.state.showLabels !== false;
            this.state.showAsteroids = this.app.state.showAsteroids !== false;
            this.state.realisticMode = this.app.state.realisticMode || false;
        }
        
        // עדכון ממשק
        this.updateControls();
    }

    // עדכון בקרות לפי המצב
    updateControls() {
        // עדכון checkbox-ים
        if (this.controls.viewOrbits) {
            this.controls.viewOrbits.checked = this.state.showOrbits;
        }
        
        if (this.controls.viewLabels) {
            this.controls.viewLabels.checked = this.state.showLabels;
        }
        
        if (this.controls.viewRealistic) {
            this.controls.viewRealistic.checked = this.state.realisticMode;
        }
        
        if (this.controls.viewAsteroids) {
            this.controls.viewAsteroids.checked = this.state.showAsteroids;
        }
        
        // עדכון סליידר זמן
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = this.state.timeScale;
        }
        
        // עדכון כפתור השהיה
        this.updatePlayPauseButton();
    }

    // קבלת מצב הממשק
    getState() {
        return {
            ...this.state,
            timestamp: Date.now()
        };
    }

    // טעינת מצב הממשק
    setState(newState) {
        if (!newState) return;
        
        Object.assign(this.state, newState);
        this.updateControls();
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי מאזיני אירועים
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
        });
        this.eventListeners.clear();
        
        // איפוס מצב
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
}

// **הוספה: נתונים לצורכי הצגה במידע המהיר**
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
