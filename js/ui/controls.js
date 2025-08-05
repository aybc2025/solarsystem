// מחלקת בקרות ממשק המשתמש - מתוקן עם פאנל מידע פועל
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
        this.controls.playPause = document.getElementById('playPause');
        this.controls.reset = document.getElementById('resetView');
        this.controls.timeSpeed = document.getElementById('timeSpeed');
        this.controls.speedValue = document.getElementById('timeScaleValue');
        this.controls.viewOrbits = document.getElementById('showOrbits');
        this.controls.viewLabels = document.getElementById('showLabels');
        this.controls.viewRealistic = document.getElementById('realisticMode');
        this.controls.planetList = document.querySelectorAll('.planet-btn');
        
        // בדיקת קיום אלמנטים
        const requiredElements = ['playPause', 'timeSpeed'];
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
        
        // בקרות מהירות למובייל
        this.setupMobileQuickControls();
    }

    // הגדרת בקרות מהירות למובייל
    setupMobileQuickControls() {
        const quickPause = document.getElementById('quickPause');
        const quickReset = document.getElementById('quickReset');
        
        if (quickPause) {
            quickPause.addEventListener('click', () => this.togglePlayPause());
        }
        
        if (quickReset) {
            quickReset.addEventListener('click', () => this.resetView());
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
                case 'Escape':
                    event.preventDefault();
                    this.closeInfoPanel();
                    break;
            }
        });
    }

    // יצירת רשימת כוכבי הלכת
    createPlanetList() {
        if (this.controls.planetList) {
            this.controls.planetList.forEach(button => {
                const planetName = button.dataset.planet;
                if (planetName) {
                    button.title = `לחץ לצפייה ב${this.getPlanetDisplayName(planetName)}`;
                }
            });
        }
    }

    // בחירת כוכב לכת עם פתיחת פאנל מידע מלא
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
        
        // פתיחת פאנל מידע עם תוכן מלא
        this.openInfoPanelWithContent(planetName);
        
        console.log('Selected planet:', planetName);
    }

    // פתיחת פאנל מידע עם תוכן מלא ומפורט
    openInfoPanelWithContent(planetName) {
        const infoPanel = document.getElementById('infoPanel');
        if (!infoPanel) return;
        
        // עדכון שם כוכב הלכת
        const planetNameElement = document.getElementById('planetName');
        if (planetNameElement) {
            planetNameElement.textContent = this.getPlanetDisplayName(planetName);
        }
        
        // יצירת תוכן מפורט
        this.createDetailedPlanetContent(planetName);
        
        // הצגת הפאנל
        infoPanel.classList.remove('hidden');
        
        // הוספת מאזין לסגירה
        const closeBtn = infoPanel.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeInfoPanel();
        }
        
        // סגירה בלחיצה מחוץ לפאנל
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
        }, 100);
    }

    // יצירת תוכן מפורט לכוכב הלכת
    createDetailedPlanetContent(planetName) {
        const planetData = this.getPlanetDetailedData(planetName);
        const planetPreview = document.getElementById('planetPreview');
        const planetDataDiv = document.getElementById('planetData');
        
        if (!planetData) return;
        
        // יצירת תצוגה מקדימה של כוכב הלכת
        if (planetPreview) {
            planetPreview.innerHTML = `
                <div class="planet-preview-sphere planet-${planetName}" style="
                    width: 120px; 
                    height: 120px; 
                    border-radius: 50%; 
                    margin: 0 auto 20px;
                    background: ${planetData.gradient};
                    box-shadow: 0 0 30px ${planetData.shadowColor};
                    position: relative;
                    animation: planetSpin 10s linear infinite;
                ">
                    ${planetData.hasRings ? `
                        <div style="
                            position: absolute;
                            width: 180px;
                            height: 180px;
                            border: 3px solid ${planetData.ringColor};
                            border-radius: 50%;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotateX(75deg);
                            opacity: 0.7;
                        "></div>
                    ` : ''}
                </div>
                <style>
                    @keyframes planetSpin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
        }
        
        // יצירת תוכן מידע מפורט
        if (planetDataDiv) {
            planetDataDiv.innerHTML = `
                <div class="planet-info-content">
                    <div class="basic-info">
                        <h4>מידע בסיסי</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">רדיוס:</span>
                                <span class="value">${planetData.radius.toLocaleString()} ק"מ</span>
                            </div>
                            <div class="info-item">
                                <span class="label">מרחק מהשמש:</span>
                                <span class="value">${planetData.distance.toLocaleString()} מיליון ק"מ</span>
                            </div>
                            <div class="info-item">
                                <span class="label">תקופת מסלול:</span>
                                <span class="value">${planetData.period} ${planetData.period > 365 ? 'ימים' : 'ימים'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">יום (סיבוב):</span>
                                <span class="value">${Math.abs(planetData.rotationPeriod).toFixed(1)} ${planetData.rotationPeriod < 0 ? 'ימים (הפוך)' : 'ימים'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">טמפרטורה ממוצעת:</span>
                                <span class="value">${planetData.surfaceTemp}°C</span>
                            </div>
                            <div class="info-item">
                                <span class="label">ירחים:</span>
                                <span class="value">${planetData.moonCount}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="description">
                        <h4>תיאור</h4>
                        <p>${planetData.description}</p>
                    </div>
                    
                    ${planetData.hasRings ? `
                        <div class="rings-info">
                            <h4>טבעות</h4>
                            <p>${this.getRingsDescription(planetName)}</p>
                        </div>
                    ` : ''}
                    
                    ${planetData.moonCount > 0 ? `
                        <div class="moons-info">
                            <h4>ירחים עיקריים</h4>
                            <div class="moons-list">
                                ${this.getMajorMoons(planetName).map(moon => 
                                    `<span class="moon-tag">${moon}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="fun-facts">
                        <h4>עובדות מעניינות</h4>
                        <ul>
                            ${this.getFunFacts(planetName).map(fact => 
                                `<li>${fact}</li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // קבלת נתונים מפורטים לכוכב הלכת
    getPlanetDetailedData(planetName) {
        // אם יש מחלקת כוכב לכת, נשתמש בנתונים שלה
        if (this.app && this.app.planets && this.app.planets.has(planetName)) {
            const planet = this.app.planets.get(planetName);
            if (planet.getPlanetInfo) {
                const info = planet.getPlanetInfo();
                return {
                    ...info.data,
                    gradient: this.getPlanetGradient(planetName),
                    shadowColor: this.getPlanetShadowColor(planetName),
                    ringColor: this.getRingColor(planetName)
                };
            }
        }
        
        // נתונים סטטיים מפורטים
        const detailedData = {
            sun: {
                radius: 696340,
                distance: 0,
                period: 0,
                rotationPeriod: 25,
                surfaceTemp: 5778,
                moonCount: 0,
                hasRings: false,
                description: 'הכוכב במרכז מערכת השמש, מספק אור וחום לכל הכוכבים',
                gradient: 'radial-gradient(circle at 30% 30%, #ffd700, #ff8c00)',
                shadowColor: 'rgba(255, 215, 0, 0.8)'
            },
            mercury: {
                radius: 2439.7,
                distance: 57.9,
                period: 88,
                rotationPeriod: 58.6,
                surfaceTemp: 167,
                moonCount: 0,
                hasRings: false,
                description: 'הכוכב הקרוב ביותר לשמש, עם שינויי טמפרטורה קיצוניים',
                gradient: 'radial-gradient(circle at 30% 30%, #8c7853, #6b5d42)',
                shadowColor: 'rgba(140, 120, 83, 0.6)'
            },
            venus: {
                radius: 6051.8,
                distance: 108.2,
                period: 225,
                rotationPeriod: -243,
                surfaceTemp: 464,
                moonCount: 0,
                hasRings: false,
                description: 'הכוכב החם ביותר במערכת השמש בשל אפקט החממה',
                gradient: 'radial-gradient(circle at 30% 30%, #ffc649, #ffb732)',
                shadowColor: 'rgba(255, 198, 73, 0.7)'
            },
            earth: {
                radius: 6371,
                distance: 149.6,
                period: 365.25,
                rotationPeriod: 1,
                surfaceTemp: 15,
                moonCount: 1,
                hasRings: false,
                description: 'הכוכב היחיד הידוע שתומך בחיים, עם מים נוזליים ואטמוספרה מגנה',
                gradient: 'radial-gradient(circle at 30% 30%, #6b93d6, #4682b4)',
                shadowColor: 'rgba(107, 147, 214, 0.8)'
            },
            mars: {
                radius: 3389.5,
                distance: 227.9,
                period: 687,
                rotationPeriod: 1.03,
                surfaceTemp: -65,
                moonCount: 2,
                hasRings: false,
                description: 'הכוכב האדום עם קוטבי קרח ועדויות לנוכחות מים בעבר',
                gradient: 'radial-gradient(circle at 30% 30%, #cd5c5c, #b22222)',
                shadowColor: 'rgba(205, 92, 92, 0.7)'
            },
            jupiter: {
                radius: 69911,
                distance: 778.5,
                period: 4333,
                rotationPeriod: 0.41,
                surfaceTemp: -110,
                moonCount: 95,
                hasRings: true,
                description: 'ענק הגז הגדול ביותר, מגן על כוכבי הלכת הפנימיים מאסטרואידים',
                gradient: 'linear-gradient(45deg, #d2b48c, #daa520, #b8860b)',
                shadowColor: 'rgba(210, 180, 140, 0.6)',
                ringColor: '#8b4513'
            },
            saturn: {
                radius: 58232,
                distance: 1432,
                period: 10759,
                rotationPeriod: 0.45,
                surfaceTemp: -140,
                moonCount: 146,
                hasRings: true,
                description: 'המפורסם בטבעותיו המרהיבות העשויות קרח וסלע',
                gradient: 'linear-gradient(45deg, #fad5a5, #f4a460, #deb887)',
                shadowColor: 'rgba(250, 213, 165, 0.7)',
                ringColor: '#c4b5a0'
            },
            uranus: {
                radius: 25362,
                distance: 2867,
                period: 30687,
                rotationPeriod: -0.72,
                surfaceTemp: -195,
                moonCount: 28,
                hasRings: true,
                description: 'ענק קרח המסתובב על הצד, עם טבעות אנכיות ייחודיות',
                gradient: 'radial-gradient(circle at 30% 30%, #4fd0e7, #00ced1)',
                shadowColor: 'rgba(79, 208, 231, 0.6)',
                ringColor: '#20b2aa'
            },
            neptune: {
                radius: 24622,
                distance: 4515,
                period: 60190,
                rotationPeriod: 0.67,
                surfaceTemp: -200,
                moonCount: 16,
                hasRings: true,
                description: 'הכוכב הרחוק ביותר עם הרוחות החזקות ביותר במערכת השמש',
                gradient: 'radial-gradient(circle at 30% 30%, #4169e1, #0000cd)',
                shadowColor: 'rgba(65, 105, 225, 0.7)',
                ringColor: '#191970'
            }
        };
        
        return detailedData[planetName] || null;
    }

    // קבלת גרדיאנט לכוכב הלכת
    getPlanetGradient(planetName) {
        const gradients = {
            sun: 'radial-gradient(circle at 30% 30%, #ffd700, #ff8c00)',
            mercury: 'radial-gradient(circle at 30% 30%, #8c7853, #6b5d42)',
            venus: 'radial-gradient(circle at 30% 30%, #ffc649, #ffb732)',
            earth: 'radial-gradient(circle at 30% 30%, #6b93d6, #4682b4)',
            mars: 'radial-gradient(circle at 30% 30%, #cd5c5c, #b22222)',
            jupiter: 'linear-gradient(45deg, #d2b48c, #daa520, #b8860b)',
            saturn: 'linear-gradient(45deg, #fad5a5, #f4a460, #deb887)',
            uranus: 'radial-gradient(circle at 30% 30%, #4fd0e7, #00ced1)',
            neptune: 'radial-gradient(circle at 30% 30%, #4169e1, #0000cd)'
        };
        
        return gradients[planetName] || 'radial-gradient(circle, #888888, #444444)';
    }

    // קבלת צבע צל לכוכב הלכת
    getPlanetShadowColor(planetName) {
        const shadowColors = {
            sun: 'rgba(255, 215, 0, 0.8)',
            mercury: 'rgba(140, 120, 83, 0.6)',
            venus: 'rgba(255, 198, 73, 0.7)',
            earth: 'rgba(107, 147, 214, 0.8)',
            mars: 'rgba(205, 92, 92, 0.7)',
            jupiter: 'rgba(210, 180, 140, 0.6)',
            saturn: 'rgba(250, 213, 165, 0.7)',
            uranus: 'rgba(79, 208, 231, 0.6)',
            neptune: 'rgba(65, 105, 225, 0.7)'
        };
        
        return shadowColors[planetName] || 'rgba(136, 136, 136, 0.5)';
    }

    // קבלת צבע טבעות
    getRingColor(planetName) {
        const ringColors = {
            jupiter: '#8b4513',
            saturn: '#c4b5a0',
            uranus: '#20b2aa',
            neptune: '#191970'
        };
        
        return ringColors[planetName] || '#cccccc';
    }

    // תיאורי טבעות
    getRingsDescription(planetName) {
        const descriptions = {
            jupiter: 'טבעות דקות וקשות לראיה העשויות חלקיקי אבק',
            saturn: 'הטבעות המפורסמות והמרהיבות ביותר במערכת השמש, עשויות קרח וסלע',
            uranus: 'טבעות דקות ואנכיות שהתגלו ב-1977',
            neptune: 'טבעות חלקיות וקשות לראיה'
        };
        
        return descriptions[planetName] || 'טבעות דקות';
    }

    // ירחים עיקריים
    getMajorMoons(planetName) {
        const majorMoons = {
            earth: ['הירח'],
            mars: ['פובוס', 'דימוס'],
            jupiter: ['יו', 'אירופה', 'גנימד', 'קליסטו'],
            saturn: ['טיטאן', 'אנקלדוס', 'מימאס', 'יאפטוס'],
            uranus: ['מירנדה', 'אריאל', 'אמבריאל', 'טיטניה', 'אובירון'],
            neptune: ['טריטון', 'נראיד']
        };
        
        return majorMoons[planetName] || [];
    }

    // עובדות מעניינות
    getFunFacts(planetName) {
        const facts = {
            sun: [
                'מכיל 99.86% ממסת כל מערכת השמש',
                'בכל שנייה הופך 600 מיליון טון מימן להליום',
                'אור השמש לוקח 8 דקות ו-20 שניות להגיע לכדור הארץ'
            ],
            mercury: [
                'יום אחד ארוך יותר משנה (88 ימי כדור ארץ)',
                'השינויים בטמפרטורה הגדולים ביותר: -173°C עד 427°C',
                'יש לו ליבת ברזל הגדולה ביותר יחסית לגודלו'
            ],
            venus: [
                'מסתובב בכיוון הפוך מכל כוכבי הלכת האחרים',
                'הכוכב החם ביותר למרות שנוגה קרובה יותר לשמש',
                'יום אחד ארוך יותר משנה אחת'
            ],
            earth: [
                'הכוכב היחיד הידוע עם חיים',
                '71% מפני השטח מכוסה במים',
                'יש לו שדה מגנטי שמגן מקרינה קוסמית'
            ],
            mars: [
                'הר הגעש הגבוה ביותר במערכת השמש - אולימפוס מונס',
                'יש לו עונות כמו כדור הארץ',
                'יום במאדים ארוך כמעט כמו בכדור הארץ (24.6 שעות)'
            ],
            jupiter: [
                'גדול יותר מכל שאר כוכבי הלכת ביחד',
                'הסופה הגדולה האדומה פעילה כבר 400 שנה',
                'מגן על כוכבי הלכת הפנימיים מאסטרואידים'
            ],
            saturn: [
                'פחות צפוף ממים - היה צף באוקיינוס ענק',
                'הטבעות שלו רחבות 282,000 ק"מ אבל עבות רק 1 ק"מ',
                'יש לו יותר ירחים מכל כוכב לכת אחר'
            ],
            uranus: [
                'מסתובב על הצד - הקוטב שלו פונה לשמש',
                'עשוי מקרח ומתאן, לא מגז כמו צדק ושבתאי',
                'התגלה ב-1781 על ידי וויליאם הרשל'
            ],
            neptune: [
                'הרוחות החזקות ביותר במערכת השמש - עד 2,100 קמ"ש',
                'שנה אחת שווה ל-165 שנות כדור ארץ',
                'התגלה באמצעות חישובים מתמטיים לפני התצפית'
            ]
        };
        
        return facts[planetName] || ['מידע לא זמין'];
    }

    // טיפול בלחיצה מחוץ לפאנל
    handleOutsideClick(event) {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel && !infoPanel.contains(event.target)) {
            this.closeInfoPanel();
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

    // השהיה/המשכה
    togglePlayPause() {
        if (!this.app) return;
        
        this.state.isPaused = !this.state.isPaused;
        this.app.state.isPaused = this.state.isPaused;
        
        if (this.controls.playPause) {
            this.controls.playPause.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
        
        const quickPause = document.getElementById('quickPause');
        if (quickPause) {
            quickPause.textContent = this.state.isPaused ? '▶️' : '⏸️';
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
        
        if (this.controls.viewRealistic) {
            this.controls.viewRealistic.checked = this.state.realisticMode;
        }
        
        console.log('Realistic mode:', this.state.realisticMode);
    }

    // עדכון ממשק המשתמש
    updateUI() {
        if (this.controls.playPause) {
            this.controls.playPause.textContent = this.state.isPaused ? '▶️ המשך' : '⏸️ השהה';
        }
        
        if (this.controls.timeSpeed) {
            this.controls.timeSpeed.value = this.state.timeScale;
        }
        
        if (this.controls.speedValue) {
            this.controls.speedValue.textContent = this.state.timeScale.toFixed(1) + 'x';
        }
        
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

    // עדכון מצב המשתמש
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        
        if (this.app && this.app.state) {
            Object.assign(this.app.state, newState);
        }
        
        this.updateUI();
    }

    // ניקוי משאבים
    dispose() {
        this.eventListeners.forEach((listener, event) => {
            document.removeEventListener(event, listener);
        });
        this.eventListeners.clear();
        
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
