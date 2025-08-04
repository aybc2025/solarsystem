// פאנל מידע על כוכבי הלכת
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
            planetRotation: null
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
            
            // הגדרת מאזיני אירועים
            this.setupEventListeners();
            
            // הכנת אנימציות
            this.setupAnimations();
            
            this.isInitialized = true;
            console.log('Info Panel initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Info Panel:', error);
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
            throw new Error('Info panel element not found');
        }
    }

    // הגדרת מאזיני אירועים
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
        
        // אירועי אפליקציה
        if (this.app) {
            this.app.on('planetSelected', (data) => {
                this.showPlanetInfo(data.planet);
            });
            
            this.app.on('planetDeselected', () => {
                this.hide();
            });
        }
    }

    // הכנת אנימציות
    setupAnimations() {
        // אנימציית סיבוב כוכב הלכת בתצוגה מקדימה
        if (this.elements.planetPreview) {
            this.animations.planetRotation = {
                angle: 0,
                speed: 0.01,
                active: false
            };
        }
    }

    // הצגת מידע על כוכב לכת
    showPlanetInfo(planetName) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData || !this.elements.panel) return;
        
        this.currentPlanet = planetName;
        
        // עדכון תוכן הפאנל
        this.updatePlanetContent(planetData);
        
        // הצגת הפאנל
        this.show();
        
        // התחלת אנימציה
        this.startPlanetAnimation();
    }

    // עדכון תוכן הפאנל
    updatePlanetContent(planetData) {
        // שם כוכב הלכת
        if (this.elements.planetName) {
            this.elements.planetName.textContent = planetData.name;
        }
        
        // תצוגה מקדימה של כוכב הלכת
        this.updatePlanetPreview(planetData);
        
        // נתונים מספריים
        this.updatePlanetData(planetData);
        
        // תיאור
        if (this.elements.descriptionElement) {
            this.elements.descriptionElement.textContent = planetData.description;
        }
        
        // הוספת מחלקת CSS לעיצוב ספציפי לכוכב הלכת
        if (this.elements.panel) {
            // הסרת מחלקות קודמות
            this.elements.panel.className = this.elements.panel.className.replace(/planet-\w+/g, '');
            this.elements.panel.classList.add(`planet-${this.currentPlanet}`);
        }
    }

    // עדכון תצוגה מקדימה
    updatePlanetPreview(planetData) {
        if (!this.elements.planetPreview) return;
        
        // ניקוי תוכן קיים
        this.elements.planetPreview.innerHTML = '';
        
        // יצירת אלמנט כוכב הלכת
        const planetElement = document.createElement('div');
        planetElement.className = 'planet-sphere';
        
        // צבע רקע
        const color = `#${planetData.color.toString(16).padStart(6, '0')}`;
        planetElement.style.background = `radial-gradient(circle at 30% 30%, ${color}dd, ${color}88, ${color}44)`;
        
        // אפקטים מיוחדים לכוכבי לכת ספציפיים
        this.addSpecialEffects(planetElement, this.currentPlanet);
        
        this.elements.planetPreview.appendChild(planetElement);
        
        // שמירת רפרנס לאנימציה
        this.animations.planetElement = planetElement;
    }

    // הוספת אפקטים מיוחדים
    addSpecialEffects(planetElement, planetName) {
        switch (planetName) {
            case 'saturn':
                // טבעות שבתאי
                const rings = document.createElement('div');
                rings.className = 'saturn-rings';
                planetElement.appendChild(rings);
                break;
                
            case 'earth':
                // עננים כדור הארץ
                const clouds = document.createElement('div');
                clouds.className = 'earth-clouds';
                planetElement.appendChild(clouds);
                break;
                
            case 'jupiter':
                // רצועות צדק
                const bands = document.createElement('div');
                bands.className = 'jupiter-bands';
                planetElement.appendChild(bands);
                break;
                
            case 'sun':
                // קורונה השמש
                const corona = document.createElement('div');
                corona.className = 'sun-corona';
                planetElement.appendChild(corona);
                break;
        }
    }

    // עדכון נתונים מספריים
    updatePlanetData(planetData) {
        const dataFormatters = {
            distance: (value) => this.formatDistance(value),
            diameter: (value) => this.formatDiameter(value),
            mass: (value) => this.formatMass(value),
            period: (value) => this.formatPeriod(value),
            temperature: (value) => this.formatTemperature(value)
        };
        
        // עדכון כל שדה נתונים
        this.elements.dataElements.forEach((element, dataType) => {
            let value;
            
            switch (dataType) {
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
        
        if (gravityEl) gravityEl.textContent = gravity ? `${gravity.toFixed(1)} מ/ש²` : 'לא זמין';
        if (escapeVelEl) escapeVelEl.textContent = escapeVel ? `${(escapeVel/1000).toFixed(1)} קמ/ש` : 'לא זמין';
        if (densityEl) densityEl.textContent = density ? `${density.toFixed(2)} ג/סמ³` : 'לא זמין';
        if (moonsEl) moonsEl.textContent = planetData.moons || '0';
    }

    // פונקציות עיצוב נתונים
    formatDistance(distance) {
        if (!distance) return 'לא זמין';
        const distanceInMillion = distance / 1e6;
        return `${distanceInMillion.toFixed(1)} מיליון ק"מ`;
    }

    formatDiameter(diameter) {
        if (!diameter) return 'לא זמין';
        if (diameter >= 1000) {
            return `${(diameter / 1000).toFixed(1)} אלף ק"מ`;
        }
        return `${diameter.toLocaleString()} ק"מ`;
    }

    formatMass(mass) {
        if (!mass) return 'לא זמין';
        const earthMass = 5.972e24;
        const ratio = mass / earthMass;
        
        if (ratio > 1) {
            return `${ratio.toFixed(2)} × מסת כדור הארץ`;
        } else {
            return `${(ratio * 100).toFixed(1)}% ממסת כדור הארץ`;
        }
    }

    formatPeriod(period) {
        if (!period) return 'לא זמין';
        
        if (period < 1) {
            const hours = period * 24;
            return `${hours.toFixed(1)} שעות`;
        } else if (period < 365) {
            return `${Math.round(period)} ימים`;
        } else {
            const years = period / 365.25;
            return `${years.toFixed(1)} שנים`;
        }
    }

    formatTemperature(temp) {
        if (!temp) return 'לא זמין';
        
        if (typeof temp === 'object') {
            if (temp.avg) {
                return `${temp.avg}°C`;
            } else if (temp.min !== undefined && temp.max !== undefined) {
                return `${temp.min}°C עד ${temp.max}°C`;
            }
        }
        
        return `${temp}°C`;
    }

    // חישובים מתקדמים
    calculateSurfaceGravity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const G = 6.67430e-11;
        const mass = planetData.mass;
        const radius = planetData.radius * 1000; // המרה לקילומטרים
        
        return (G * mass) / (radius * radius);
    }

    calculateEscapeVelocity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const G = 6.67430e-11;
        const mass = planetData.mass;
        const radius = planetData.radius * 1000;
        
        return Math.sqrt(2 * G * mass / radius);
    }

    calculateDensity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const volume = (4/3) * Math.PI * Math.pow(planetData.radius * 1000, 3);
        return (planetData.mass / volume) / 1000; // המרה לג/סמ³
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
        
        // הודעה לאפליקציה
        if (this.app) {
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
        if (this.currentPlanet === 'earth') return; // לא להשוות כדור הארץ לעצמו
        
        const earthData = PLANETS_DATA.earth;
        if (!earthData) return;
        
        let comparisonSection = this.elements.panel.querySelector('.earth-comparison');
        
        if (!comparisonSection) {
            comparisonSection = document.createElement('div');
            comparisonSection.className = 'earth-comparison';
            comparisonSection.innerHTML = `
                <h4>השוואה לכדור הארץ</h4>
                <div class="comparison-grid">
                    <div class="comparison-item">
                        <span class="label">גודל:</span>
                        <span class="value" id="sizeComparison">-</span>
                    </div>
                    <div class="comparison-item">
                        <span class="label">מסה:</span>
                        <span class="value" id="massComparison">-</span>
                    </div>
                    <div class="comparison-item">
                        <span class="label">מרחק מהשמש:</span>
                        <span class="value" id="distanceComparison">-</span>
                    </div>
                </div>
            `;
            
            const infoContent = this.elements.panel.querySelector('.info-content');
            if (infoContent) {
                infoContent.appendChild(comparisonSection);
            }
        }
        
        // חישוב השוואות
        const sizeRatio = planetData.radius / earthData.radius;
        const massRatio = planetData.mass / earthData.mass;
        const distanceRatio = planetData.distance / earthData.distance;
        
        // עדכון ערכים
        const sizeEl = comparisonSection.querySelector('#sizeComparison');
        const massEl = comparisonSection.querySelector('#massComparison');
        const distanceEl = comparisonSection.querySelector('#distanceComparison');
        
        if (sizeEl) {
            sizeEl.textContent = sizeRatio > 1 ? 
                `${sizeRatio.toFixed(1)} פעמים יותר גדול` : 
                `${(1/sizeRatio).toFixed(1)} פעמים יותר קטן`;
        }
        
        if (massEl) {
            massEl.textContent = massRatio > 1 ? 
                `${massRatio.toFixed(1)} פעמים יותר כבד` : 
                `${(1/massRatio).toFixed(1)} פעמים יותר קל`;
        }
        
        if (distanceEl) {
            distanceEl.textContent = distanceRatio > 1 ? 
                `${distanceRatio.toFixed(1)} פעמים יותר רחוק` : 
                `${(1/distanceRatio).toFixed(1)} פעמים יותר קרוב`;
        }
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

    // עדכון מתמיד
    update(deltaTime) {
        // עדכון אנימציות אם נדרש
        if (this.isVisible && this.animations.planetRotation.active) {
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
