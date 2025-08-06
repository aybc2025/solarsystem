// פאנל מידע על כוכבי הלכת - מתוקן
class InfoPanel {
    constructor() {
        this.app = null;
        this.panel = null;
        this.isVisible = false;
        this.currentPlanet = null;
        
        // אלמנטים בפאנל
        this.elements = {
            panel: null,
            planetName: null,
            planetPreview: null,
            closeButton: null,
            dataElements: new Map(),
            descriptionElement: null
        };
        
        // אנימציות
        this.animations = {
            showHide: null,
            planetRotation: {
                angle: 0,
                speed: 0.01,
                active: false
            },
            planetElement: null
        };
        
        // הגדרות
        this.settings = {
            animationDuration: 400,
            autoHide: false,
            showAdvancedData: false
        };
        
        this.isInitialized = false;
    }

    // אתחול פאנל המידע
    async init(app) {
        try {
            this.app = app;
            
            // איתור אלמנטים בDOM
            this.findDOMElements();
            
            // הגדרת מאזיני אירועים - מתוקן
            this.setupEventListeners();
            
            // הכנת אנימציות
            this.setupAnimations();
            
            this.isInitialized = true;
            console.log('✅ Info Panel initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Info Panel:', error);
            throw error;
        }
    }

    // איתור אלמנטים בDOM
    findDOMElements() {
        this.elements.panel = document.getElementById('infoPanel');
        this.elements.planetName = document.getElementById('planetName');
        this.elements.planetPreview = document.getElementById('planetPreview');
        this.elements.closeButton = document.getElementById('closeInfo');
        this.elements.descriptionElement = document.getElementById('planetDescription');
        
        // אלמנטי נתונים
        const dataIds = ['distance', 'diameter', 'mass', 'period', 'temperature'];
        dataIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.dataElements.set(id, element);
            }
        });
        
        if (!this.elements.panel) {
            console.warn('Info panel element not found - will create dynamically if needed');
        }
    }

    // **תיקון עיקרי: הגדרת מאזיני אירועים ללא app.on()**
    setupEventListeners() {
        // כפתור סגירה
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', () => {
                this.hide();
            });
        }
        
        // לחיצה מחוץ לפאנל
        if (this.elements.panel) {
            this.elements.panel.addEventListener('click', (event) => {
                if (event.target === this.elements.panel) {
                    this.hide();
                }
            });
        }
        
        // מקש Escape
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        
        // **תיקון: הוסרו שורות this.app.on() שגרמו לשגיאה**
        // במקום להסתמך על event emitter, נשתמש בפונקציות ישירות
    }

    // **הוספה: פונקציה שתיקרא כשכוכב לכת נבחר**
    onPlanetSelected(planetName) {
        this.showPlanetInfo(planetName);
    }

    // **הוספה: פונקציה שתיקרא כשכוכב לכת מבוטל**
    onPlanetDeselected() {
        this.hide();
    }

    // הכנת אנימציות
    setupAnimations() {
        // אנימציית סיבוב כוכב הלכת בתצוגה מקדימה
        if (this.elements.planetPreview) {
            this.animations.planetElement = this.elements.planetPreview;
            this.animations.planetRotation = {
                angle: 0,
                speed: 0.01,
                active: false
            };
        }
    }

    // הצגת מידע על כוכב לכת
    showPlanetInfo(planetName) {
        if (typeof PLANETS_DATA === 'undefined') {
            console.error('PLANETS_DATA not found');
            return;
        }
        
        const planetData = PLANETS_DATA[planetName];
        if (!planetData || !this.elements.panel) return;
        
        this.currentPlanet = planetName;
        
        // עדכון כותרת
        if (this.elements.planetName) {
            this.elements.planetName.textContent = planetData.name || planetName;
        }
        
        // עדכון נתונים
        this.updatePlanetData(planetData);
        
        // עדכון תיאור
        this.updateDescription(planetData);
        
        // הצגת הפאנל
        this.show();
        
        console.log(`Displaying info for: ${planetName}`);
    }

    // עדכון נתוני כוכב הלכת
    updatePlanetData(planetData) {
        // פונקציות עיצוב נתונים
        const dataFormatters = {
            distance: (dist) => this.formatDistance(dist),
            diameter: (radius) => this.formatDiameter(radius * 2),
            mass: (mass) => this.formatMass(mass),
            period: (period) => this.formatPeriod(period),
            temperature: (temp) => this.formatTemperature(temp)
        };
        
        // עדכון כל אלמנט נתונים
        this.elements.dataElements.forEach((element, dataType) => {
            let value;
            
            switch(dataType) {
                case 'distance':
                    value = planetData.distance;
                    break;
                case 'diameter':
                    value = planetData.radius ? planetData.radius * 2 : null;
                    break;
                case 'mass':
                    value = planetData.mass;
                    break;
                case 'period':
                    value = planetData.orbitalPeriod;
                    break;
                case 'temperature':
                    value = planetData.temperature;
                    break;
            }
            
            if (value !== null && value !== undefined) {
                const formatter = dataFormatters[dataType];
                element.textContent = formatter ? formatter(value) : value;
            } else {
                element.textContent = 'לא זמין';
            }
        });
        
        // נתונים מתקדמים (אם מופעלים)
        if (this.settings.showAdvancedData) {
            this.updateAdvancedData(planetData);
        }
    }

    // עדכון נתונים מתקדמים
    updateAdvancedData(planetData) {
        // יצירת קטע נתונים מתקדמים אם לא קיים
        let advancedSection = this.elements.panel.querySelector('.advanced-data');
        
        if (!advancedSection) {
            advancedSection = document.createElement('div');
            advancedSection.className = 'advanced-data';
            advancedSection.innerHTML = `
                <h4>נתונים מתקדמים</h4>
                <div class="advanced-data-grid">
                    <div class="data-item">
                        <span class="label">כבידה:</span>
                        <span class="value" id="gravity">-</span>
                    </div>
                    <div class="data-item">
                        <span class="label">מהירות בריחה:</span>
                        <span class="value" id="escapeVelocity">-</span>
                    </div>
                    <div class="data-item">
                        <span class="label">צפיפות:</span>
                        <span class="value" id="density">-</span>
                    </div>
                    <div class="data-item">
                        <span class="label">ירחים:</span>
                        <span class="value" id="moons">-</span>
                    </div>
                </div>
            `;
            
            const infoContent = this.elements.panel.querySelector('.info-content');
            if (infoContent) {
                infoContent.appendChild(advancedSection);
            }
        }
        
        // חישוב ועדכון נתונים מתקדמים
        const gravity = this.calculateSurfaceGravity(planetData);
        const escapeVel = this.calculateEscapeVelocity(planetData);
        const density = this.calculateDensity(planetData);
        
        // עדכון ערכים
        const gravityEl = advancedSection.querySelector('#gravity');
        const escapeVelEl = advancedSection.querySelector('#escapeVelocity');
        const densityEl = advancedSection.querySelector('#density');
        const moonsEl = advancedSection.querySelector('#moons');
        
        if (gravityEl) gravityEl.textContent = gravity ? `${gravity.toFixed(1)} m/s²` : 'לא זמין';
        if (escapeVelEl) escapeVelEl.textContent = escapeVel ? `${(escapeVel/1000).toFixed(1)} km/s` : 'לא זמין';
        if (densityEl) densityEl.textContent = density ? `${density.toFixed(2)} g/cm³` : 'לא זמין';
        if (moonsEl) moonsEl.textContent = planetData.moons || planetData.moonCount || '0';
    }

    // חישוב כבידת פני השטח
    calculateSurfaceGravity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const G = 6.67430e-11;
        const mass = planetData.mass;
        const radius = planetData.radius * 1000; // המרה לקילומטרים
        
        return (G * mass) / (radius * radius);
    }

    // חישוב מהירות בריחה
    calculateEscapeVelocity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const G = 6.67430e-11;
        const mass = planetData.mass;
        const radius = planetData.radius * 1000;
        
        return Math.sqrt(2 * G * mass / radius);
    }

    // חישוב צפיפות
    calculateDensity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const volume = (4/3) * Math.PI * Math.pow(planetData.radius * 1000, 3);
        return (planetData.mass / volume) / 1000; // המרה לג/סמ³
    }

    // עדכון תיאור
    updateDescription(planetData) {
        if (this.elements.descriptionElement && planetData.description) {
            this.elements.descriptionElement.textContent = planetData.description;
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

    // הוספת עובדות מעניינות
    addInterestingFacts(planetData) {
        if (!planetData.facts || !Array.isArray(planetData.facts)) return;
        
        let factsSection = this.elements.panel.querySelector('.interesting-facts');
        
        if (!factsSection) {
            factsSection = document.createElement('div');
            factsSection.className = 'interesting-facts';
            factsSection.innerHTML = '<h4>עובדות מעניינות</h4><ul class="facts-list"></ul>';
            
            const infoContent = this.elements.panel.querySelector('.info-content');
            if (infoContent) {
                infoContent.appendChild(factsSection);
            }
        }
        
        const factsList = factsSection.querySelector('.facts-list');
        factsList.innerHTML = '';
        
        planetData.facts.forEach(fact => {
            const factItem = document.createElement('li');
            factItem.textContent = fact;
            factsList.appendChild(factItem);
        });
    }

    // הוספת השוואה לכדור הארץ
    addEarthComparison(planetData) {
        if (planetData.name === 'earth') return; // לא להשוות כדור הארץ לעצמו
        
        let comparisonSection = this.elements.panel.querySelector('.earth-comparison');
        
        if (!comparisonSection) {
            comparisonSection = document.createElement('div');
            comparisonSection.className = 'earth-comparison';
            comparisonSection.innerHTML = '<h4>השוואה לכדור הארץ</h4><div class="comparison-grid"></div>';
            
            const infoContent = this.elements.panel.querySelector('.info-content');
            if (infoContent) {
                infoContent.appendChild(comparisonSection);
            }
        }
        
        const comparisonGrid = comparisonSection.querySelector('.comparison-grid');
        comparisonGrid.innerHTML = '';
        
        // נתוני כדור הארץ להשוואה
        const earthData = PLANETS_DATA.earth;
        if (!earthData) return;
        
        // חישוב יחסים
        const sizeRatio = planetData.radius / earthData.radius;
        const massRatio = planetData.mass / earthData.mass;
        const distanceRatio = planetData.distance / earthData.distance;
        
        // יצירת פריטי השוואה
        const comparisons = [
            {
                label: 'גודל יחסי:',
                value: sizeRatio > 1 ? 
                    `${sizeRatio.toFixed(1)} פעמים יותר גדול` : 
                    `${(1/sizeRatio).toFixed(1)} פעמים יותר קטן`
            },
            {
                label: 'מסה יחסית:',
                value: massRatio > 1 ? 
                    `${massRatio.toFixed(1)} פעמים יותר כבד` : 
                    `${(1/massRatio).toFixed(1)} פעמים יותר קל`
            },
            {
                label: 'מרחק יחסי:',
                value: distanceRatio > 1 ? 
                    `${distanceRatio.toFixed(1)} פעמים יותר רחוק` : 
                    `${(1/distanceRatio).toFixed(1)} פעמים יותר קרוב`
            }
        ];
        
        comparisons.forEach(comp => {
            const compItem = document.createElement('div');
            compItem.className = 'comparison-item';
            compItem.innerHTML = `<span class="label">${comp.label}</span> <span class="value">${comp.value}</span>`;
            comparisonGrid.appendChild(compItem);
        });
    }

    // הוספת מידע על ירחים
    addMoonsInfo(planetData) {
        if (!planetData.majorMoons || planetData.majorMoons.length === 0) return;
        
        let moonsSection = this.elements.panel.querySelector('.moons-info');
        
        if (!moonsSection) {
            moonsSection = document.createElement('div');
            moonsSection.className = 'moons-info';
            moonsSection.innerHTML = '<h4>ירחים עיקריים</h4><div class="moons-list"></div>';
            
            const infoContent = this.elements.panel.querySelector('.info-content');
            if (infoContent) {
                infoContent.appendChild(moonsSection);
            }
        }
        
        const moonsList = moonsSection.querySelector('.moons-list');
        moonsList.innerHTML = '';
        
        planetData.majorMoons.forEach(moonName => {
            const moonItem = document.createElement('div');
            moonItem.className = 'moon-item';
            moonItem.textContent = moonName;
            moonsList.appendChild(moonItem);
        });
    }

    // הצגת הפאנל
    show() {
        if (!this.elements.panel || this.isVisible) return;
        
        this.isVisible = true;
        this.elements.panel.classList.remove('hidden');
        
        // אנימציית כניסה
        this.animateShow();
        
        // התחלת אנימציית כוכב הלכת
        this.startPlanetAnimation();
    }

    // הסתרת הפאנל
    hide() {
        if (!this.elements.panel || !this.isVisible) return;
        
        this.isVisible = false;
        
        // אנימציית יציאה
        this.animateHide();
        
        // עצירת אנימציות
        this.stopPlanetAnimation();
        
        // ניקוי מצב
        this.currentPlanet = null;
        
        // **תיקון: הודעה ישירה לאפליקציה במקום event emitter**
        if (this.app && typeof this.app.deselectPlanet === 'function') {
            this.app.deselectPlanet();
        }
    }

    // אנימציית הצגה
    animateShow() {
        if (!this.elements.panel) return;
        
        this.elements.panel.style.opacity = '0';
        this.elements.panel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        // אנימציה עם CSS transitions
        this.elements.panel.style.transition = `all ${this.settings.animationDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        
        requestAnimationFrame(() => {
            this.elements.panel.style.opacity = '1';
            this.elements.panel.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // אנימציית הסתרה
    animateHide() {
        if (!this.elements.panel) return;
        
        this.elements.panel.style.transition = `all ${this.settings.animationDuration}ms ease-in`;
        this.elements.panel.style.opacity = '0';
        this.elements.panel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.elements.panel.classList.add('hidden');
            this.elements.panel.style.transition = '';
            this.elements.panel.style.transform = '';
        }, this.settings.animationDuration);
    }

    // התחלת אנימציית כוכב הלכת
    startPlanetAnimation() {
        if (!this.animations.planetRotation || !this.animations.planetElement) return;
        
        this.animations.planetRotation.active = true;
        this.updatePlanetAnimation();
    }

    // עצירת אנימציית כוכב הלכת
    stopPlanetAnimation() {
        if (this.animations.planetRotation) {
            this.animations.planetRotation.active = false;
        }
    }

    // עדכון אנימציית כוכב הלכת
    updatePlanetAnimation() {
        if (!this.animations.planetRotation.active || !this.animations.planetElement) return;
        
        this.animations.planetRotation.angle += this.animations.planetRotation.speed;
        
        // החלת סיבוב
        this.animations.planetElement.style.transform = `rotate(${this.animations.planetRotation.angle}rad)`;
        
        // המשך האנימציה
        requestAnimationFrame(() => this.updatePlanetAnimation());
    }

    // הגדלת/הקטנת פאנל
    toggleSize() {
        if (!this.elements.panel) return;
        
        this.elements.panel.classList.toggle('expanded');
        
        if (this.elements.panel.classList.contains('expanded')) {
            // הצגת מידע מורחב
            this.settings.showAdvancedData = true;
            this.updatePlanetContent(PLANETS_DATA[this.currentPlanet]);
            this.addInterestingFacts(PLANETS_DATA[this.currentPlanet]);
            this.addEarthComparison(PLANETS_DATA[this.currentPlanet]);
            this.addMoonsInfo(PLANETS_DATA[this.currentPlanet]);
        } else {
            // הסתרת מידע מורחב
            this.settings.showAdvancedData = false;
            const advancedSections = this.elements.panel.querySelectorAll('.advanced-data, .interesting-facts, .earth-comparison, .moons-info');
            advancedSections.forEach(section => section.remove());
        }
    }

    // עדכון תוכן כוכב הלכת
    updatePlanetContent(planetData) {
        if (!planetData) return;
        
        console.log('Updating planet content for:', planetData.name);
    }

    // עדכון מתמיד
    update(deltaTime) {
        // עדכון אנימציות אם נדרש
        if (this.isVisible && this.animations.planetRotation && this.animations.planetRotation.active) {
            // האנימציה כבר רצה ב-requestAnimationFrame
        }
    }

    // קבלת מידע על מצב הפאנל
    getState() {
        return {
            isVisible: this.isVisible,
            currentPlanet: this.currentPlanet,
            showAdvancedData: this.settings.showAdvancedData
        };
    }

    // שמירה וטעינה של הגדרות
    saveSettings() {
        return {
            showAdvancedData: this.settings.showAdvancedData,
            autoHide: this.settings.autoHide
        };
    }

    loadSettings(settings) {
        if (settings) {
            Object.assign(this.settings, settings);
        }
    }

    // ניקוי משאבים
    dispose() {
        // עצירת אנימציות
        this.stopPlanetAnimation();
        
        // הסרת מאזיני אירועים
        if (this.elements.closeButton) {
            this.elements.closeButton.removeEventListener('click', this.hide);
        }
        
        // ניקוי רפרנסים
        Object.keys(this.elements).forEach(key => {
            if (key === 'dataElements') {
                this.elements[key].clear();
            } else {
                this.elements[key] = null;
            }
        });
        
        this.currentPlanet = null;
        this.isVisible = false;
        this.isInitialized = false;
        
        console.log('Info Panel disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InfoPanel;
}

// הפוך את המחלקה זמינה גלובלית
if (typeof window !== 'undefined') {
    window.InfoPanel = InfoPanel;
}
