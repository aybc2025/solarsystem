// פאנל מידע על כוכבי הלכת - מתוקן עם שדה rotation
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
            
            // הגדרת מאזיני אירועים
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
        this.elements.closeButton = document.querySelector('#infoPanel .close-btn');
        this.elements.descriptionElement = document.getElementById('planetDescription');
        
        // אלמנטי נתונים - תיקון: הוספת rotation
        const dataIds = ['distance', 'diameter', 'mass', 'period', 'temperature', 'rotation'];
        dataIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.dataElements.set(id, element);
            } else if (id === 'rotation') {
                // יצירת אלמנט rotation אם לא קיים
                console.log('Creating missing rotation element');
                this.createRotationElement();
            }
        });
        
        if (!this.elements.panel) {
            console.warn('Info panel element not found - creating dynamically');
            this.createInfoPanel();
        }
    }

    // יצירת אלמנט rotation חסר
    createRotationElement() {
        const planetData = document.querySelector('.planet-data');
        if (planetData) {
            const rotationItem = document.createElement('div');
            rotationItem.className = 'data-item';
            rotationItem.innerHTML = `
                <span class="data-label">תקופת סיבוב:</span>
                <span id="rotation" class="data-value">-</span>
            `;
            planetData.appendChild(rotationItem);
            
            const rotationElement = document.getElementById('rotation');
            if (rotationElement) {
                this.elements.dataElements.set('rotation', rotationElement);
            }
        }
    }

    // יצירת פאנל מידע דינמי
    createInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'infoPanel';
        panel.className = 'hidden';
        panel.innerHTML = `
            <div class="info-header">
                <h3 id="planetName">מידע על כוכב הלכת</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <div id="planetPreview" class="planet-image"></div>
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
                    <div class="data-item">
                        <span class="data-label">תקופת סיבוב:</span>
                        <span id="rotation" class="data-value">-</span>
                    </div>
                </div>
                <div id="planetDescription" class="planet-description"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // עדכון הפניות
        this.elements.panel = panel;
        this.elements.planetName = panel.querySelector('#planetName');
        this.elements.planetPreview = panel.querySelector('#planetPreview');
        this.elements.closeButton = panel.querySelector('.close-btn');
        this.elements.descriptionElement = panel.querySelector('#planetDescription');
        
        // עדכון אלמנטי נתונים
        const dataIds = ['distance', 'diameter', 'mass', 'period', 'temperature', 'rotation'];
        dataIds.forEach(id => {
            const element = panel.querySelector(`#${id}`);
            if (element) {
                this.elements.dataElements.set(id, element);
            }
        });
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
    }

    // הכנת אנימציות
    setupAnimations() {
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
        
        // הוספת עובדות מעניינות
        this.addInterestingFacts(planetData);
        
        // הצגת הפאנל
        this.show();
        
        console.log(`Displaying info for: ${planetName}`);
    }

    // עדכון נתוני כוכב הלכת - תיקון
    updatePlanetData(planetData) {
        // עדכון מרחק
        const distanceEl = this.elements.dataElements.get('distance');
        if (distanceEl && planetData.distance) {
            distanceEl.textContent = this.formatDistance(planetData.distance);
        } else if (distanceEl) {
            distanceEl.textContent = 'לא זמין';
        }
        
        // עדכון קוטר
        const diameterEl = this.elements.dataElements.get('diameter');
        if (diameterEl && planetData.radius) {
            diameterEl.textContent = this.formatDiameter(planetData.radius * 2);
        } else if (diameterEl) {
            diameterEl.textContent = 'לא זמין';
        }
        
        // עדכון מסה
        const massEl = this.elements.dataElements.get('mass');
        if (massEl && planetData.mass) {
            massEl.textContent = this.formatMass(planetData.mass);
        } else if (massEl) {
            massEl.textContent = 'לא זמין';
        }
        
        // עדכון תקופת מסלול
        const periodEl = this.elements.dataElements.get('period');
        if (periodEl && planetData.orbitalPeriod) {
            periodEl.textContent = this.formatPeriod(planetData.orbitalPeriod);
        } else if (periodEl) {
            periodEl.textContent = 'לא זמין';
        }
        
        // עדכון טמפרטורה
        const tempEl = this.elements.dataElements.get('temperature');
        if (tempEl && planetData.temperature) {
            tempEl.textContent = this.formatTemperature(planetData.temperature);
        } else if (tempEl) {
            tempEl.textContent = 'לא זמין';
        }
        
        // תיקון: עדכון תקופת סיבוב
        const rotationEl = this.elements.dataElements.get('rotation');
        if (rotationEl && planetData.rotationPeriod !== undefined) {
            rotationEl.textContent = this.formatRotationPeriod(planetData.rotationPeriod);
        } else if (rotationEl) {
            rotationEl.textContent = 'לא זמין';
        }
        
        // נתונים מתקדמים (אם מופעלים)
        if (this.settings.showAdvancedData) {
            this.updateAdvancedData(planetData);
        }
    }

    // פורמט תקופת סיבוב
    formatRotationPeriod(period) {
        if (period === undefined || period === null) return 'לא זמין';
        
        const absPeriod = Math.abs(period);
        
        if (absPeriod < 1) {
            const hours = absPeriod * 24;
            return `${hours.toFixed(1)} שעות`;
        } else {
            const direction = period < 0 ? ' (הפוך)' : '';
            return `${absPeriod.toFixed(1)} ימים${direction}`;
        }
    }

    // עדכון נתונים מתקדמים
    updateAdvancedData(planetData) {
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
                    <div class="data-item">
                        <span class="label">אקסצנטריות:</span>
                        <span class="value" id="eccentricity">-</span>
                    </div>
                    <div class="data-item">
                        <span class="label">נטיית ציר:</span>
                        <span class="value" id="axialTilt">-</span>
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
        const eccentricityEl = advancedSection.querySelector('#eccentricity');
        const axialTiltEl = advancedSection.querySelector('#axialTilt');
        
        if (gravityEl) gravityEl.textContent = gravity ? `${gravity.toFixed(1)} m/s²` : 'לא זמין';
        if (escapeVelEl) escapeVelEl.textContent = escapeVel ? `${(escapeVel/1000).toFixed(1)} km/s` : 'לא זמין';
        if (densityEl) densityEl.textContent = density ? `${density.toFixed(2)} g/cm³` : 'לא זמין';
        if (moonsEl) moonsEl.textContent = planetData.moons || planetData.moonCount || '0';
        if (eccentricityEl) eccentricityEl.textContent = planetData.eccentricity ? planetData.eccentricity.toFixed(4) : 'לא זמין';
        if (axialTiltEl) axialTiltEl.textContent = planetData.axialTilt ? `${planetData.axialTilt.toFixed(1)}°` : 'לא זמין';
    }

    // חישוב כבידת פני השטח
    calculateSurfaceGravity(planetData) {
        if (!planetData.mass || !planetData.radius) return null;
        
        const G = 6.67430e-11;
        const mass = planetData.mass;
        const radius = planetData.radius * 1000;
        
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
        return (planetData.mass / volume) / 1000;
    }

    // עדכון תיאור
    updateDescription(planetData) {
        if (this.elements.descriptionElement && planetData.description) {
            this.elements.descriptionElement.innerHTML = `<p>${planetData.description}</p>`;
        }
    }

    // פונקציות עיצוב נתונים
    formatDistance(distance) {
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} אלף ק"מ`;
        } else if (distance < 100) {
            return `${distance.toFixed(1)} מיליון ק"מ`;
        } else {
            return `${(distance / 1000).toFixed(2)} מיליארד ק"מ`;
        }
    }

    formatDiameter(diameter) {
        return `${diameter.toLocaleString('he-IL')} ק"מ`;
    }

    formatMass(mass) {
        const earthMass = 5.972e24;
        const relativeToEarth = mass / earthMass;
        
        if (relativeToEarth < 0.01) {
            return `${(relativeToEarth * 100).toFixed(2)}% ממסת כדור הארץ`;
        } else if (relativeToEarth < 0.1) {
            return `${relativeToEarth.toFixed(3)} מסות כדור הארץ`;
        } else if (relativeToEarth < 10) {
            return `${relativeToEarth.toFixed(1)} מסות כדור הארץ`;
        } else {
            return `${relativeToEarth.toFixed(0)} מסות כדור הארץ`;
        }
    }

    formatPeriod(period) {
        if (period < 1) {
            return `${(period * 365.25).toFixed(0)} ימים`;
        } else if (period < 10) {
            return `${period.toFixed(2)} שנות כדור הארץ`;
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
        
        // הצגת עד 5 עובדות
        const factsToShow = planetData.facts.slice(0, 5);
        factsToShow.forEach(fact => {
            const factItem = document.createElement('li');
            factItem.textContent = fact;
            factsList.appendChild(factItem);
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
        
        if (this.app && typeof this.app.deselectPlanet === 'function') {
            this.app.deselectPlanet();
        }
    }

    // אנימציית הצגה
    animateShow() {
        if (!this.elements.panel) return;
        
        this.elements.panel.style.opacity = '0';
        this.elements.panel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
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
        
        this.animations.planetElement.style.transform = `rotate(${this.animations.planetRotation.angle}rad)`;
        
        requestAnimationFrame(() => this.updatePlanetAnimation());
    }

    // הגדלת/הקטנת פאנל
    toggleSize() {
        if (!this.elements.panel) return;
        
        this.elements.panel.classList.toggle('expanded');
        
        if (this.elements.panel.classList.contains('expanded')) {
            this.settings.showAdvancedData = true;
            this.updatePlanetContent(PLANETS_DATA[this.currentPlanet]);
        } else {
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
        // האנימציה כבר רצה ב-requestAnimationFrame
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
        this.stopPlanetAnimation();
        
        if (this.elements.closeButton) {
            this.elements.closeButton.removeEventListener('click', this.hide);
        }
        
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
