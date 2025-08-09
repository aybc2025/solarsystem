// פאנל מידע על כוכבי הלכת - מתוקן עם הצגת מידע מלאה
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
            planetData: null,
            descriptionElement: null
        };
        
        // אנימציות
        this.animations = {
            showHide: null,
            planetRotation: {
                angle: 0,
                speed: 0.01,
                active: false
            }
        };
        
        // הגדרות
        this.settings = {
            animationDuration: 400,
            autoHide: false,
            showAdvancedData: true
        };
        
        this.isInitialized = false;
    }

    // אתחול פאנל המידע
    async init(app) {
        try {
            this.app = app;
            
            // איתור או יצירת אלמנטים בDOM
            this.findOrCreateDOMElements();
            
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

    // איתור או יצירת אלמנטים בDOM
    findOrCreateDOMElements() {
        // חיפוש אלמנט קיים
        this.elements.panel = document.getElementById('infoPanel');
        
        // אם לא קיים, צור אחד חדש
        if (!this.elements.panel) {
            this.createInfoPanel();
        }
        
        // איתור אלמנטים פנימיים
        this.elements.planetName = this.elements.panel.querySelector('#planetName') || 
                                  this.elements.panel.querySelector('.planet-name') ||
                                  this.elements.panel.querySelector('h3');
        
        this.elements.planetPreview = this.elements.panel.querySelector('#planetPreview') || 
                                     this.elements.panel.querySelector('.planet-image');
        
        this.elements.closeButton = this.elements.panel.querySelector('.close-btn') || 
                                   this.elements.panel.querySelector('.close-button');
        
        this.elements.planetData = this.elements.panel.querySelector('.planet-data') || 
                                  this.elements.panel.querySelector('.info-content');
        
        this.elements.descriptionElement = this.elements.panel.querySelector('#planetDescription') || 
                                          this.elements.panel.querySelector('.planet-description');
        
        console.log('DOM elements found/created:', {
            panel: !!this.elements.panel,
            name: !!this.elements.planetName,
            preview: !!this.elements.planetPreview,
            close: !!this.elements.closeButton,
            data: !!this.elements.planetData,
            description: !!this.elements.descriptionElement
        });
    }

    // יצירת פאנל מידע חדש
    createInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'infoPanel';
        infoPanel.className = 'info-panel hidden';
        infoPanel.innerHTML = `
            <div class="info-header">
                <h3 id="planetName" class="planet-name">מידע על כוכב הלכת</h3>
                <button class="close-btn" aria-label="סגור">&times;</button>
            </div>
            <div class="info-content">
                <div id="planetPreview" class="planet-image">
                    <div class="planet-sphere"></div>
                </div>
                <div class="planet-data">
                    <div class="data-section basic-data">
                        <h4>נתונים בסיסיים</h4>
                        <div class="data-grid">
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
                                <span class="data-label">יום (סיבוב):</span>
                                <span id="rotation" class="data-value">-</span>
                            </div>
                            <div class="data-item">
                                <span class="data-label">טמפרטורה:</span>
                                <span id="temperature" class="data-value">-</span>
                            </div>
                        </div>
                    </div>
                    <div id="planetDescription" class="planet-description">
                        <h4>תיאור</h4>
                        <p></p>
                    </div>
                    <div id="planetFacts" class="planet-facts">
                        <h4>עובדות מעניינות</h4>
                        <ul class="facts-list"></ul>
                    </div>
                </div>
            </div>
        `;
        
        // הוספה לbody
        document.body.appendChild(infoPanel);
        this.elements.panel = infoPanel;
        
        // הוספת סגנונות בסיסיים אם לא קיימים
        this.addBasicStyles();
        
        console.log('✅ Info panel created dynamically');
    }

    // הוספת סגנונות בסיסיים
    addBasicStyles() {
        const existingStyle = document.getElementById('info-panel-styles');
        if (existingStyle) return;
        
        const style = document.createElement('style');
        style.id = 'info-panel-styles';
        style.textContent = `
            .info-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                max-width: 90vw;
                max-height: 85vh;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #ffd700;
                border-radius: 15px;
                z-index: 1500;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                overflow: hidden;
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Arial, sans-serif;
                direction: rtl;
                text-align: right;
            }
            
            .info-panel.hidden {
                display: none;
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            
            .info-header {
                background: linear-gradient(135deg, #1a1a2e, #0a0a0a);
                padding: 20px;
                border-bottom: 2px solid #ffd700;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .planet-name {
                margin: 0;
                color: #ffd700;
                font-size: 24px;
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            .close-btn {
                background: none;
                border: 2px solid #ffd700;
                color: #ffd700;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                background: rgba(255, 215, 0, 0.2);
                transform: rotate(90deg) scale(1.1);
            }
            
            .info-content {
                padding: 20px;
                max-height: calc(85vh - 100px);
                overflow-y: auto;
                color: white;
            }
            
            .planet-image {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .planet-sphere {
                width: 100px;
                height: 100px;
                margin: 0 auto;
                border-radius: 50%;
                background: linear-gradient(45deg, #333, #666);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                animation: planetRotate 20s linear infinite;
            }
            
            @keyframes planetRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .data-section {
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                border: 1px solid rgba(255, 215, 0, 0.2);
            }
            
            .data-section h4 {
                color: #ffd700;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: bold;
            }
            
            .data-grid {
                display: grid;
                gap: 10px;
            }
            
            .data-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .data-item:last-child {
                border-bottom: none;
            }
            
            .data-label {
                font-weight: bold;
                color: #ffd700;
                flex: 1;
            }
            
            .data-value {
                color: #ffffff;
                flex: 1;
                text-align: left;
                direction: ltr;
            }
            
            .planet-description {
                margin-bottom: 20px;
            }
            
            .planet-description h4 {
                color: #ffd700;
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: bold;
            }
            
            .planet-description p {
                line-height: 1.6;
                color: #e0e0e0;
                font-size: 14px;
                text-align: justify;
                margin: 0;
            }
            
            .planet-facts {
                background: rgba(255, 215, 0, 0.1);
                border-radius: 10px;
                padding: 15px;
            }
            
            .planet-facts h4 {
                color: #ffd700;
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: bold;
            }
            
            .facts-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .facts-list li {
                padding: 8px 0;
                position: relative;
                padding-right: 20px;
                color: #e0e0e0;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .facts-list li::before {
                content: '★';
                position: absolute;
                right: 0;
                color: #ffd700;
                font-size: 12px;
            }
            
            @media (max-width: 768px) {
                .info-panel {
                    width: 95vw;
                    max-height: 90vh;
                    top: 5vh;
                    transform: translateX(-50%);
                }
                
                .info-header {
                    padding: 15px;
                }
                
                .planet-name {
                    font-size: 20px;
                }
                
                .info-content {
                    padding: 15px;
                    max-height: calc(90vh - 80px);
                }
                
                .planet-sphere {
                    width: 80px;
                    height: 80px;
                }
            }
        `;
        
        document.head.appendChild(style);
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
            this.animations.planetRotation = {
                angle: 0,
                speed: 0.01,
                active: false
            };
        }
    }

    // הצגת מידע על כוכב לכת - תיקון עיקרי
    showPlanetInfo(planetName) {
        if (!planetName || typeof PLANETS_DATA === 'undefined') {
            console.warn('Cannot show planet info: missing data');
            return;
        }
        
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) {
            console.warn(`Planet data not found for: ${planetName}`);
            return;
        }
        
        this.currentPlanet = planetName;
        
        console.log(`Showing info for: ${planetName}`, planetData);
        
        // עדכון כותרת
        if (this.elements.planetName) {
            this.elements.planetName.textContent = planetData.name || planetName;
        }
        
        // עדכון תצוגה מקדימה
        this.updatePlanetPreview(planetName, planetData);
        
        // עדכון נתונים בסיסיים
        this.updateBasicData(planetData);
        
        // עדכון תיאור
        this.updateDescription(planetData);
        
        // עדכון עובדות מעניינות
        this.updateFacts(planetData);
        
        // הצגת הפאנל
        this.show();
    }

    // עדכון תצוגה מקדימה של כוכב הלכת
    updatePlanetPreview(planetName, planetData) {
        if (!this.elements.planetPreview) return;
        
        const sphere = this.elements.planetPreview.querySelector('.planet-sphere');
        if (sphere) {
            // צבע לפי כוכב הלכת
            const colors = {
                sun: 'radial-gradient(circle at 30% 30%, #FFD700, #FF8C00)',
                mercury: 'radial-gradient(circle at 30% 30%, #8C7853, #6C5833)',
                venus: 'radial-gradient(circle at 30% 30%, #FFC649, #E6A629)',
                earth: 'radial-gradient(circle at 30% 30%, #4F94CD, #1E6BA8)',
                mars: 'radial-gradient(circle at 30% 30%, #CD5C5C, #AD3C3C)',
                jupiter: 'radial-gradient(circle at 30% 30%, #D2691E, #B24905)',
                saturn: 'radial-gradient(circle at 30% 30%, #FAD5A5, #DAB585)',
                uranus: 'radial-gradient(circle at 30% 30%, #4FD0E7, #2FB0C7)',
                neptune: 'radial-gradient(circle at 30% 30%, #4169E1, #2149C1)'
            };
            
            sphere.style.background = colors[planetName] || colors.earth;
            sphere.style.boxShadow = `0 0 20px ${planetData.color || '#ffd700'}33`;
        }
    }

    // עדכון נתונים בסיסיים - תיקון עיקרי
    updateBasicData(planetData) {
        const dataElements = {
            distance: this.formatDistance(planetData.distance),
            diameter: this.formatDiameter(planetData.radius ? planetData.radius * 2 : null),
            mass: this.formatMass(planetData.mass),
            period: this.formatPeriod(planetData.orbitalPeriod),
            rotation: this.formatRotation(planetData.rotationPeriod),
            temperature: this.formatTemperature(planetData.temperature)
        };
        
        // עדכון כל שדה
        Object.entries(dataElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 'לא זמין';
            } else {
                console.warn(`Element not found: ${id}`);
            }
        });
        
        console.log('Updated basic data:', dataElements);
    }

    // עדכון תיאור
    updateDescription(planetData) {
        const descElement = this.elements.descriptionElement;
        if (descElement && planetData.description) {
            const p = descElement.querySelector('p');
            if (p) {
                p.textContent = planetData.description;
            } else {
                descElement.innerHTML = `<h4>תיאור</h4><p>${planetData.description}</p>`;
            }
        }
    }

    // עדכון עובדות מעניינות
    updateFacts(planetData) {
        const factsElement = document.getElementById('planetFacts');
        if (factsElement && planetData.facts && Array.isArray(planetData.facts)) {
            const factsList = factsElement.querySelector('.facts-list');
            if (factsList) {
                factsList.innerHTML = '';
                
                planetData.facts.forEach(fact => {
                    const listItem = document.createElement('li');
                    listItem.textContent = fact;
                    factsList.appendChild(listItem);
                });
            }
        }
    }

    // פונקציות עיצוב נתונים - משופרות
    formatDistance(distance) {
        if (!distance) return 'לא זמין';
        
        if (distance < 1) {
            return `${(distance * 1000).toFixed(0)} אלף ק"מ`;
        } else if (distance < 1000) {
            return `${distance.toFixed(1)} מיליון ק"מ`;
        } else {
            return `${(distance / 1000).toFixed(2)} מיליארד ק"מ`;
        }
    }

    formatDiameter(diameter) {
        if (!diameter) return 'לא זמין';
        return `${diameter.toLocaleString()} ק"מ`;
    }

    formatMass(mass) {
        if (!mass) return 'לא זמין';
        
        const earthMass = 5.972e24;
        const relativeToEarth = mass / earthMass;
        
        if (relativeToEarth < 0.01) {
            return `${(relativeToEarth * 1000).toFixed(2)} אלפיות ממסת כדור הארץ`;
        } else if (relativeToEarth < 0.1) {
            return `${relativeToEarth.toFixed(3)} ממסת כדור הארץ`;
        } else if (relativeToEarth < 10) {
            return `${relativeToEarth.toFixed(1)} מסות כדור הארץ`;
        } else {
            return `${relativeToEarth.toFixed(0)} מסות כדור הארץ`;
        }
    }

    formatPeriod(period) {
        if (!period) return 'לא זמין';
        
        if (period < 1) {
            return `${(period * 365).toFixed(0)} ימים`;
        } else if (period < 2) {
            return `${period.toFixed(2)} שנות כדור הארץ`;
        } else {
            return `${period.toFixed(1)} שנות כדור הארץ`;
        }
    }

    formatRotation(rotationPeriod) {
        if (!rotationPeriod) return 'לא זמין';
        
        const absPeriod = Math.abs(rotationPeriod);
        const direction = rotationPeriod < 0 ? ' (הפוך)' : '';
        
        if (absPeriod < 1) {
            const hours = absPeriod * 24;
            return `${hours.toFixed(1)} שעות${direction}`;
        } else if (absPeriod < 7) {
            return `${absPeriod.toFixed(1)} ימים${direction}`;
        } else {
            return `${absPeriod.toFixed(0)} ימים${direction}`;
        }
    }

    formatTemperature(temp) {
        if (!temp) return 'לא זמין';
        
        if (typeof temp === 'number') {
            return `${temp}°C`;
        } else if (typeof temp === 'object') {
            if (temp.avg !== undefined) return `${temp.avg}°C ממוצע`;
            if (temp.surface !== undefined) return `${temp.surface}°C פני השטח`;
            if (temp.day !== undefined && temp.night !== undefined) {
                return `${temp.day}°C ביום, ${temp.night}°C בלילה`;
            }
            if (temp.min !== undefined && temp.max !== undefined) {
                return `${temp.min}°C עד ${temp.max}°C`;
            }
        }
        return 'לא ידוע';
    }

    // הצגת הפאנל
    show() {
        if (!this.elements.panel) {
            console.error('Cannot show panel: element not found');
            return;
        }
        
        this.isVisible = true;
        this.elements.panel.classList.remove('hidden');
        
        // אנימציית כניסה
        this.animateShow();
        
        console.log('Info panel shown');
    }

    // הסתרת הפאנל
    hide() {
        if (!this.elements.panel || !this.isVisible) return;
        
        this.isVisible = false;
        
        // אנימציית יציאה
        this.animateHide();
        
        // ניקוי מצב
        this.currentPlanet = null;
        
        // הודעה לאפליקציה
        if (this.app && typeof this.app.deselectPlanet === 'function') {
            this.app.deselectPlanet();
        }
        
        console.log('Info panel hidden');
    }

    // אנימציית הצגה
    animateShow() {
        if (!this.elements.panel) return;
        
        this.elements.panel.style.opacity = '0';
        this.elements.panel.style.transform = 'translate(-50%, -60%) scale(0.8)';
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
        this.elements.panel.style.transform = 'translate(-50%, -60%) scale(0.8)';
        
        setTimeout(() => {
            this.elements.panel.classList.add('hidden');
            this.elements.panel.style.transition = '';
            this.elements.panel.style.transform = '';
        }, this.settings.animationDuration);
    }

    // עדכון מתמיד
    update(deltaTime) {
        // כאן ניתן להוסיף אנימציות נוספות
    }

    // פונקציות נוספות לתאימות
    onPlanetSelected(planetName) {
        this.showPlanetInfo(planetName);
    }

    onPlanetDeselected() {
        this.hide();
    }

    // קבלת מידע על מצב הפאנל
    getState() {
        return {
            isVisible: this.isVisible,
            currentPlanet: this.currentPlanet,
            showAdvancedData: this.settings.showAdvancedData
        };
    }

    // ניקוי משאבים
    dispose() {
        // הסרת מאזיני אירועים
        if (this.elements.closeButton) {
            this.elements.closeButton.removeEventListener('click', this.hide);
        }
        
        // ניקוי רפרנסים
        Object.keys(this.elements).forEach(key => {
            this.elements[key] = null;
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
