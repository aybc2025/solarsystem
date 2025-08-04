// מחלקת בקרות ממשק המשתמש
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
        
        // אלמנטים בממשק
        this.controls = {
            playPause: null,
            reset: null,
            timeSpeed: null,
            speedValue: null,
            viewOrbits: null,
            viewLabels: null,
            viewRealistic: null,
            planetList: null
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

    // איתור אלמנטים בDOM
    findDOMElements() {
        // כפתורי בקרה עיקריים
        this.controls.playPause = document.getElementById('playPause');
        this.controls.reset = document.getElementById('reset');
        
        // בקרת מהירות זמן
        this.controls.timeSpeed = document.getElementById('timeSpeed');
        this.controls.speedValue = document.getElementById('speedValue');
        
        // כפתורי תצוגה
        this.controls.viewOrbits = document.getElementById('viewOrbits');
        this.controls.viewLabels = document.getElementById('viewLabels');
        this.controls.viewRealistic = document.getElementById('viewRealistic');
        
        // רשימת כוכבי לכת
        this.controls.planetList = document.getElementById('planetList');
        
        // בדיקת קיום אלמנטים חיוניים
        const requiredElements = ['playPause', 'reset', 'timeSpeed', 'planetList'];
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
        
        // אירועי אפליקציה
        this.setupAppEventListeners();
    }

    // הגדרת כפתורי תצוגה
    setupViewButtons() {
        const viewButtons = [
            { element: this.controls.viewOrbits, setting: 'showOrbits' },
            { element: this.controls.viewLabels, setting: 'showLabels' },
            { element: this.controls.viewRealistic, setting: 'realisticMode' }
        ];
        
        viewButtons.forEach(({ element, setting }) => {
            if (element) {
                element.addEventListener('click', () => {
                    this.toggleViewSetting(setting);
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
                    
                case 'Escape':
                    event.preventDefault();
                    this.deselectPlanet();
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
        this.app.on('stateChanged', (data) => {
            this.updateUIFromState(data);
        });
        
        // מאזין לבחירת כוכב לכת
        this.app.on('planetSelected', (data) => {
            this.updatePlanetSelection(data.planet);
        });
        
        // מאזין לביטול בחירה
        this.app.on('planetDeselected', () => {
            this.updatePlanetSelection(null);
        });
        
        // מאזין לעדכון FPS
        this.app.on('fpsUpdate', (data) => {
            this.updateFPSDisplay(data.fps);
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
        const planetItem = document.createElement('div');
        planetItem.className = 'planet-item';
        planetItem.dataset.planet = planetName;
        planetItem.dataset.index = index;
        
        // צבע כוכב הלכת
        const planetColor = document.createElement('div');
        planetColor.className = 'planet-color';
        planetColor.style.backgroundColor = `#${planetData.color.toString(16).padStart(6, '0')}`;
        
        // שם כוכב הלכת
        const planetNameElement = document.createElement('span');
        planetNameElement.className = 'planet-name';
        planetNameElement.textContent = planetData.name;
        
        // מרחק מהשמש
        const planetDistance = document.createElement('span');
        planetDistance.className = 'planet-distance';
        const distanceInMillion = Math.round(planetData.distance / 1e6);
        planetDistance.textContent = `${distanceInMillion} מיליון ק"מ`;
        
        // קיצור מקלדת
        const keyboardShortcut = document.createElement('span');
        keyboardShortcut.className = 'keyboard-shortcut';
        keyboardShortcut.textContent = `${index + 1}`;
        
        // הרכבת האלמנט
        planetItem.appendChild(planetColor);
        planetItem.appendChild(planetNameElement);
        planetItem.appendChild(planetDistance);
        planetItem.appendChild(keyboardShortcut);
        
        // הוספת מאזין לחיצה
        planetItem.addEventListener('click', () => {
            this.selectPlanet(planetName);
        });
        
        // הוספת hover effects
        planetItem.addEventListener('mouseenter', () => {
            this.highlightPlanet(planetName, true);
        });
        
        planetItem.addEventListener('mouseleave', () => {
            this.highlightPlanet(planetName, false);
        });
        
        return planetItem;
    }

    // פעולות בקרה עיקריות
    togglePlayPause() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.app) {
            this.app.togglePause();
        }
        
        this.updatePlayPauseButton();
        this.emitEvent('playPauseToggled', { isPaused: this.state.isPaused });
    }

    resetView() {
        if (this.app) {
            this.app.resetView();
        }
        
        // איפוס הגדרות ממשק
        this.state.selectedPlanet = null;
        this.state.timeScale = 1;
        
        this.updateUI();
        this.emitEvent('viewReset');
    }

    setTimeScale(scale) {
        this.state.timeScale = MathUtils.clamp(scale, 0, 1000);
        
        if (this.app) {
            this.app.setTimeScale(this.state.timeScale);
        }
        
        this.updateSpeedDisplay();
        this.emitEvent('timeScaleChanged', { scale: this.state.timeScale });
    }

    adjustTimeScale(multiplier) {
        const currentScale = this.state.timeScale;
        const newScale = MathUtils.clamp(currentScale * multiplier, 0, 1000);
        
        this.setTimeScale(newScale);
        
        // עדכון slider
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = newScale;
        }
    }

    toggleViewSetting(setting) {
        this.state[setting] = !this.state[setting];
        
        if (this.app) {
            this.app.setViewMode(setting, this.state[setting]);
        }
        
        this.updateViewButtons();
        this.emitEvent('viewSettingChanged', { setting, value: this.state[setting] });
    }

    selectPlanet(planetName) {
        this.state.selectedPlanet = planetName;
        
        if (this.app) {
            this.app.focusOnPlanet(planetName);
        }
        
        this.updatePlanetSelection(planetName);
        this.emitEvent('planetSelected', { planet: planetName });
    }

    selectPlanetByIndex(index) {
        const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        if (index >= 0 && index < planets.length) {
            this.selectPlanet(planets[index]);
        }
    }

    deselectPlanet() {
        this.state.selectedPlanet = null;
        
        if (this.app) {
            this.app.deselectPlanet();
        }
        
        this.updatePlanetSelection(null);
        this.emitEvent('planetDeselected');
    }

    highlightPlanet(planetName, highlight) {
        // הדגשת כוכב לכת בסצנה (אם מוגדר)
        if (this.app && this.app.scene) {
            // כאן אפשר להוסיף לוגיקה להדגשה ויזואלית
        }
        
        this.emitEvent('planetHighlighted', { planet: planetName, highlighted: highlight });
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
        } else {
            button.innerHTML = '⏸️ השהה';
            button.classList.remove('paused');
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
            { element: this.controls.viewRealistic, setting: 'realisticMode' }
        ];
        
        buttons.forEach(({ element, setting }) => {
            if (element) {
                if (this.state[setting]) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            }
        });
    }

    updatePlanetSelection(planetName) {
        // עדכון רשימת כוכבי הלכת
        const planetItems = this.controls.planetList?.querySelectorAll('.planet-item');
        
        if (planetItems) {
            planetItems.forEach(item => {
                item.classList.remove('active');
                
                if (planetName && item.dataset.planet === planetName) {
                    item.classList.add('active');
                    
                    // גלילה לכוכב הלכת הנבחר
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        const fpsElement = document.getElementById('fpsDisplay');
        if (fpsElement) {
            fpsElement.textContent = `${fps} FPS`;
            
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

    // הצגת הודעות למשתמש
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">✕</button>
            </div>
        `;
        
        // הוספה לDOM
        document.body.appendChild(notification);
        
        // אנימציה כניסה
        setTimeout(() => {
            notification.classList.add('notification-visible');
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
        notification.classList.remove('notification-visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // הצגת טיפים ועזרה
    showTip(tip, element = null) {
        const tipElement = document.createElement('div');
        tipElement.className = 'tooltip';
        tipElement.textContent = tip;
        
        if (element) {
            // מיקום יחסית לאלמנט
            const rect = element.getBoundingClientRect();
            tipElement.style.position = 'fixed';
            tipElement.style.left = `${rect.left + rect.width / 2}px`;
            tipElement.style.top = `${rect.bottom + 10}px`;
            tipElement.style.transform = 'translateX(-50%)';
        } else {
            // מיקום במרכז המסך
            tipElement.style.position = 'fixed';
            tipElement.style.top = '50%';
            tipElement.style.left = '50%';
            tipElement.style.transform = 'translate(-50%, -50%)';
        }
        
        document.body.appendChild(tipElement);
        
        // הסרה אוטומטית
        setTimeout(() => {
            if (tipElement.parentNode) {
                tipElement.parentNode.removeChild(tipElement);
            }
        }, 2000);
    }

    // הגדרות מתקדמות
    showAdvancedSettings() {
        // פתיחת חלון הגדרות מתקדמות
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'advanced-settings-panel';
        settingsPanel.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h3>הגדרות מתקדמות</h3>
                    <button class="close-settings">✕</button>
                </div>
                <div class="settings-body">
                    <div class="setting-group">
                        <label>איכות רנדור:</label>
                        <select id="renderQuality">
                            <option value="low">נמוכה</option>
                            <option value="medium" selected>בינונית</option>
                            <option value="high">גבוהה</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>צפיפות אסטרואידים:</label>
                        <input type="range" id="asteroidDensity" min="0.1" max="2" step="0.1" value="1">
                    </div>
                    <div class="setting-group">
                        <label>הצגת FPS:</label>
                        <input type="checkbox" id="showFPS">
                    </div>
                </div>
                <div class="settings-footer">
                    <button class="btn" id="resetToDefaults">איפוס לברירת מחדל</button>
                    <button class="btn primary" id="applySettings">החל</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsPanel);
        
        // הוספת מאזינים
        const closeButton = settingsPanel.querySelector('.close-settings');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(settingsPanel);
        });
        
        const applyButton = settingsPanel.querySelector('#applySettings');
        applyButton.addEventListener('click', () => {
            this.applyAdvancedSettings(settingsPanel);
            document.body.removeChild(settingsPanel);
        });
    }

    applyAdvancedSettings(settingsPanel) {
        const renderQuality = settingsPanel.querySelector('#renderQuality').value;
        const asteroidDensity = parseFloat(settingsPanel.querySelector('#asteroidDensity').value);
        const showFPS = settingsPanel.querySelector('#showFPS').checked;
        
        // החלת ההגדרות
        if (this.app) {
            if (this.app.scene && this.app.scene.setRenderQuality) {
                this.app.scene.setRenderQuality(renderQuality);
            }
            
            if (this.app.asteroidBelt && this.app.asteroidBelt.setDensity) {
                this.app.asteroidBelt.setDensity(asteroidDensity);
            }
        }
        
        // הצגת/הסתרת FPS
        const fpsElement = document.getElementById('fpsDisplay');
        if (fpsElement) {
            fpsElement.style.display = showFPS ? 'block' : 'none';
        }
        
        this.showNotification('הגדרות נשמרו בהצלחה!', 'success');
    }

    // מערכת אירועים פנימית
    emitEvent(eventType, data = {}) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
        
        // שליחה גם למאזינים פנימיים
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).forEach(callback => {
                callback(data);
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
            version: '1.0'
        };
        
        try {
            const settingsData = JSON.stringify(settings);
            document.cookie = `solarSystemSettings=${settingsData}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
            return true;
        } catch (error) {
            console.warn('Failed to save settings:', error);
            return false;
        }
    }

    loadSettings() {
        try {
            const cookies = document.cookie.split(';');
            const settingsCookie = cookies.find(cookie => cookie.trim().startsWith('solarSystemSettings='));
            
            if (settingsCookie) {
                const settingsData = settingsCookie.split('=')[1];
                const settings = JSON.parse(decodeURIComponent(settingsData));
                
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
        // (כרגע אין צורך באף עדכון)
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
