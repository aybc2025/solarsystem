// נתונים אסטרונומיים מדויקים ומורחבים על כוכבי הלכת - מקור: NASA JPL
const PLANETS_DATA = {
    sun: {
        name: 'השמש',
        nameEn: 'Sun',
        radius: 696340, // ק"מ
        mass: 1.989e30, // ק"ג
        temperature: { surface: 5778, core: 15000000 }, // קלווין
        rotationPeriod: 25.05, // ימים
        color: 0xFFD700,
        emissive: 0xFFAA00,
        scaledRadius: 20, // הגדלה מ-15 ל-20
        description: 'השמש היא הכוכב במרכז מערכת השמש שלנו והמקור לכל האנרגיה על כדור הארץ. היא מכילה 99.86% ממסת מערכת השמש כולה ומספקת חום ואור לכל כוכבי הלכת. השמש היא כוכב מסוג G2V, כוכב ננס צהוב, והיא בגיל של כ-4.6 מיליארד שנים.',
        facts: [
            'הטמפרטורה במרכז השמש מגיעה ל-15 מיליון מעלות צלזיוס',
            'השמש שורפת 600 מיליון טון מימן בכל שנייה',
            'האור מהשמש מגיע לכדור הארץ תוך 8 דקות ו-20 שניות',
            'השמש גדולה פי 1.3 מיליון מכדור הארץ',
            'בכל שנייה השמש הופכת 4 מיליון טון חומר לאנרגיה טהורה',
            'כוח הכבידה על השמש חזק פי 28 מכדור הארץ'
        ],
        composition: {
            hydrogen: '73.46%',
            helium: '24.85%',
            oxygen: '0.77%',
            carbon: '0.29%',
            other: '0.63%'
        },
        structure: {
            core: 'מרכז בו מתרחש היתוך גרעיני',
            radiativeZone: 'אזור הקרנה - האנרגיה נעה בצורת פוטונים',
            convectiveZone: 'אזור הסעה - תנועת חומר חם כלפי מעלה',
            photosphere: 'פוטוספירה - השכבה הנראית',
            chromosphere: 'כרומוספירה - שכבת האטמוספירה התחתונה',
            corona: 'קורונה - השכבה החיצונית החמה ביותר'
        }
    },
    mercury: {
        name: 'כוכב חמה',
        nameEn: 'Mercury',
        radius: 2439.7, // ק"מ
        mass: 3.3011e23, // ק"ג
        distance: 57.91e6, // ק"מ מהשמש
        orbitalPeriod: 87.969, // ימים
        rotationPeriod: 58.646, // ימים
        temperature: { min: -173, max: 427, day: 427, night: -173 }, // צלזיוס
        color: 0x8C7853,
        scaledRadius: 4, // הגדלה מ-2 ל-4
        scaledDistance: 25,
        moons: 0,
        eccentricity: 0.2056,
        inclination: 7.00,
        axialTilt: 0.034,
        description: 'כוכב חמה הוא הכוכב הקרוב ביותר לשמש והקטן ביותר במערכת השמש. למרות קרבתו לשמש, הוא אינו הכוכב החם ביותר. כוכב חמה חסר אטמוספירה כמעט לחלוטין, מה שגורם לשינויי טמפרטורה קיצוניים בין היום והלילה. יום אחד על כוכב חמה ארוך יותר משנה שלו!',
        facts: [
            'יום אחד על כוכב חמה (58.6 ימי כדור ארץ) ארוך יותר משנה שלו (88 ימי כדור ארץ)',
            'שינויי הטמפרטורה הקיצוניים ביותר: מ-173°C בלילה ל-427°C ביום',
            'יש לו ליבת ברזל הגדולה ביותר יחסית לגודלו מכל כוכבי הלכת',
            'המהירות הגבוהה ביותר במסלול - 48 ק"מ לשנייה',
            'הכוכב הצפוף ביותר אחרי כדור הארץ',
            'אין לו אטמוספירה משמעותית - חסר אוויר לחלוטין'
        ],
        composition: {
            core: 'ליבת ברזל גדולה (75% מהרדיוס)',
            mantle: 'מעטה סיליקטי דק',
            crust: 'קרום דק של סלע בזלתי'
        },
        exploration: [
            'מרינר 10 (1974-1975) - תמונות ראשונות',
            'מסנג\'ר (2011-2015) - מיפוי מלא',
            'BepiColombo (2025+) - משימה משותפת אירופה-יפן'
        ]
    },
    venus: {
        name: 'נוגה',
        nameEn: 'Venus',
        radius: 6051.8, // ק"מ
        mass: 4.8675e24, // ק"ג
        distance: 108.21e6, // ק"מ מהשמש
        orbitalPeriod: 224.701, // ימים
        rotationPeriod: -243.025, // ימים (סיבוב הפוך!)
        temperature: { surface: 464, clouds: -45 }, // צלזיוס
        color: 0xFFC649,
        scaledRadius: 6, // הגדלה מ-4 ל-6
        scaledDistance: 45,
        moons: 0,
        eccentricity: 0.0067,
        inclination: 3.39,
        axialTilt: 177.36,
        description: 'נוגה, הכוכב השני מהשמש, הוא הכוכב החם ביותר במערכת השמש בשל אפקט החממה הקיצוני. האטמוספירה הצפופה שלו מכילה עננים של חומצה גופרתית ולחץ פני השטח פי 90 מכדור הארץ. נוגה מסתובבת בכיוון הפוך מכל כוכבי הלכת האחרים.',
        facts: [
            'הכוכב החם ביותר במערכת השמש - 464°C, חם יותר מכוכב חמה',
            'מסתובב בכיוון הפוך (retrograde) - השמש זורחת במערב!',
            'יום אחד ארוך יותר משנה אחת (243 מול 225 ימי כדור ארץ)',
            'לחץ האטמוספירה פי 90 מכדור הארץ - כמו להיות 900 מטר מתחת לים',
            'עננים של חומצה גופרתית ברוחות של 120 מ/ש',
            'הכוכב הבהיר ביותר בשמיים אחרי השמש והירח'
        ],
        atmosphere: {
            carbonDioxide: '96.5%',
            nitrogen: '3.5%',
            pressure: '9.2 MPa (פי 92 מכדור הארץ)',
            greenhouse: 'אפקט חממה קיצוני'
        },
        exploration: [
            'ונרה (ברית המועצות) - נחתות ראשונות',
            'מגלן (נאס"א, 1990-1994) - מיפוי רדאר',
            'ביפי קולומבו (2025) - חלוף בדרך למרקורי',
            'VERITAS & DAVINCI+ (עתיד) - חקירה מפורטת'
        ]
    },
    earth: {
        name: 'כדור הארץ',
        nameEn: 'Earth',
        radius: 6371, // ק"מ  
        mass: 5.972e24, // ק"ג
        distance: 149.6e6, // ק"מ מהשמש (1 AU)
        orbitalPeriod: 365.256, // ימים
        rotationPeriod: 0.99726968, // ימים (23h 56m 4s)
        temperature: { avg: 15, min: -89, max: 58 }, // צלזיוס
        color: 0x6B93D6,
        scaledRadius: 6, // הגדלה מ-4 ל-6
        scaledDistance: 65,
        moons: 1,
        eccentricity: 0.0167,
        inclination: 0.00,
        axialTilt: 23.44,
        description: 'כדור הארץ הוא הכוכב השלישי מהשמש והיחיד הידוע שתומך בחיים. 71% מפני השטח מכוסה במים נוזליים, ולו אטמוספירה עשירה בחמצן ושדה מגנטי המגן מקרינה קוסמית. כדור הארץ בן 4.54 מיליארד שנים והוא הבית לכל הצורות הידועות של חיים.',
        facts: [
            'הכוכב היחיד הידוע שתומך בחיים',
            '71% מפני השטח מכוסה במים נוזליים',
            'שדה מגנטי חזק המגן מקרינה קוסמית מזיקה',
            'אטמוספירה עשירה בחמצן (21%) וחנקן (78%)',
            'הירח גורם לגאות ושפל ומייצב את הטיית הציר',
            'היום הולך ומתארך ב-2.3 מילישנייה כל 100 שנה'
        ],
        structure: {
            crust: 'קרום של סלע בזלתי וגרניטי (עובי ממוצע 40 ק"מ)',
            mantle: 'מעטה של סלע חם ופלסטי (2,900 ק"מ)',
            outerCore: 'ליבה חיצונית נוזלית של ברזל וניקל',
            innerCore: 'ליבה פנימית מוצקה - ברזל בלחץ עצום'
        },
        biosphere: {
            species: 'מיליוני מינים - מחיידקים ועד לווייתנים',
            ecosystems: 'יערות, מדבריות, אוקיינוסים, קוטבים',
            evolution: '3.8 מיליארד שנות אבולוציה'
        }
    },
    mars: {
        name: 'מאדים',
        nameEn: 'Mars',
        radius: 3389.5, // ק"מ
        mass: 6.4171e23, // ק"ג
        distance: 227.9e6, // ק"מ מהשמש
        orbitalPeriod: 686.971, // ימים
        rotationPeriod: 1.025957, // ימים (24h 37m)
        temperature: { avg: -65, summer: 20, winter: -125 }, // צלזיוס
        color: 0xCD5C5C,
        scaledRadius: 5, // הגדלה מ-3 ל-5
        scaledDistance: 90,
        moons: 2, // פובוס ודימוס
        eccentricity: 0.0935,
        inclination: 1.85,
        axialTilt: 25.19,
        description: 'מאדים, הכוכב האדום, הוא רביעי במרחק מהשמש ודומה במקצת לכדור הארץ. צבעו האדום נובע מחמצון הברזל בקרקע. למאדים יש עונות כמו כדור הארץ, קוטבי קרח, והר הגעש הגבוה ביותר במערכת השמש - אולימפוס מונס.',
        facts: [
            'הר הגעש הגבוה ביותר במערכת השמש - אולימפוס מונס (21 ק"מ)',
            'העמק הגדול ביותר - ואליס מארינריס (4,000 ק"מ אורך)',
            'יום במאדים דומה לכדור הארץ - 24 שעות 37 דקות',
            'יש לו עונות בזכוות הטיית הציר הדומה לכדור הארץ',
            'אטמוספירה דקה - לחץ של 1% מכדור הארץ',
            'קוטבי קרח עשויים מים וקרח יבש (CO2)'
        ],
        atmosphere: {
            carbonDioxide: '95.97%',
            argon: '1.93%',
            nitrogen: '1.89%',
            pressure: '0.636 kPa (0.6% מכדור הארץ)'
        },
        exploration: [
            'ויקינג 1 ו-2 (1976) - נחתות ראשונות',
            'מארס פת\'פיינדר (1997) - הרובר הראשון',
            'ספיריט ואופורטוניטי (2004)',
            'קיוריוסיטי (2012) - חיפוש אחר סימני חיים',
            'פרסוורנס (2021) - איסוף דגימות להחזרה לכדור הארץ'
        ]
    },
    jupiter: {
        name: 'צדק',
        nameEn: 'Jupiter',
        radius: 69911, // ק"מ
        mass: 1.8982e27, // ק"ג
        distance: 778.5e6, // ק"מ מהשמש
        orbitalPeriod: 4332.59, // ימים (11.86 שנים)
        rotationPeriod: 0.41354, // ימים (9h 56m) - הכי מהיר!
        temperature: { clouds: -110, core: 20000 }, // צלזיוס
        color: 0xD8CA9D,
        scaledRadius: 14, // הגדלה מ-12 ל-14
        scaledDistance: 200,
        moons: 95, // כולל 4 הירחים הגליליים
        rings: true, // טבעות דקות
        eccentricity: 0.0489,
        inclination: 1.30,
        axialTilt: 3.13,
        description: 'צדק הוא ענק הגז הגדול ביותר במערכת השמש ומכיל יותר מסה מכל כוכבי הלכת האחרים יחד. הוא מגן על כדור הארץ מפני אסטרואידים וקומטות בזכוות כוח הכבידה העצום שלו. צדק הוא כמו מערכת שמש קטנה עם 95 ירחים.',
        facts: [
            'הכוכב לכת הגדול ביותר במערכת השמש',
            'מסה גדולה פי 2.5 מכל הכוכבים האחרים יחד',
            'הסופה הגדולה האדומה פעילה כבר 400+ שנים',
            '95 ירחים ידועים, כולל 4 הירחים הגליליים',
            'השדה המגנטי החזק ביותר במערכת השמש',
            'מקבל רק 4% מהאור שמגיע לכדור הארץ',
            'מוקף בטבעות דקות שהתגלו ב-1979',
            'הוא כמעט הפך לכוכב - חסר לו רק מסה'
        ],
        majorMoons: ['יו (Io)', 'אירופה (Europa)', 'גנימד (Ganymede)', 'קליסטו (Callisto)'],
        features: {
            greatRedSpot: 'סופה ענקית הפעילה כבר מאות שנים - גדולה פי 2 מכדור הארץ',
            magneticField: 'השדה המגנטי החזק ביותר במערכת השמש',
            radiation: 'רמות קרינה גבוהות מסוכנות לחלליות',
            rings: 'מערכת טבעות דקה שהתגלתה ב-1979'
        },
        atmosphere: {
            hydrogen: '89.8%',
            helium: '10.2%',
            pressure: 'אין משטח מוצק - לחץ עולה בהדרגה'
        },
        exploration: [
            'פיוניר 10 ו-11 (1973-1974)',
            'ויאג\'ר 1 ו-2 (1979)',
            'גלילאו (1995-2003)',
            'ג\'ונו (2016-היום)'
        ]
    },
    saturn: {
        name: 'שבתאי',
        nameEn: 'Saturn',
        radius: 58232, // ק"מ
        mass: 5.6834e26, // ק"ג
        distance: 1432.0e6, // ק"מ מהשמש
        orbitalPeriod: 10747.0, // ימים (29.42 שנים)
        rotationPeriod: 0.43958, // ימים (10.55 שעות)
        temperature: { avg: -140, core: 11700 }, // צלזיוס
        color: 0xFAD5A5,
        scaledRadius: 12, // הגדלה מ-10 ל-12
        scaledDistance: 280,
        moons: 146, // כולל טיטאן
        rings: true,
        eccentricity: 0.0565,
        inclination: 2.49,
        axialTilt: 26.73,
        description: 'שבתאי מפורסם בזכוות מערכת הטבעות המרהיבה שלו והוא ענק הגז השני בגודלו. הוא כה קל שהיה צף במים! טיטאן, הירח הגדול ביותר שלו, הוא הגוף היחיד במערכת השמש מלבד כדור הארץ שיש לו נוזלים יציבים על פני השטח.',
        facts: [
            'מפורסם במערכת הטבעות המדהימה שלו',
            'צפיפות נמוכה מכל כוכב לכת אחר - היה צף במים!',
            'טיטאן - הירח עם אטמוספירה ואגמי מתאן',
            '146 ירחים ידועים עד כה',
            'מערכת הטבעות רחבה 282,000 ק"מ אבל עבה רק 1 ק"מ',
            'הכוכב הפחות צפוף במערכת השמש (0.687 ג/סמ"ק)'
        ],
        majorMoons: ['טיטאן (Titan)', 'אנקלדוס (Enceladus)', 'מימאס (Mimas)', 'יאפטוס (Iapetus)'],
        atmosphere: {
            hydrogen: '96.3%',
            helium: '3.25%',
            methane: '0.45%'
        },
        exploration: [
            'פיוניר 11 (1979)',
            'ויאג\'ר 1 ו-2 (1980-1981)',
            'קאסיני-הויגנס (2004-2017)'
        ]
    },
    uranus: {
        name: 'אורנוס',
        nameEn: 'Uranus',
        radius: 25362, // ק"מ
        mass: 8.6810e25, // ק"ג
        distance: 2867.0e6, // ק"מ מהשמש
        orbitalPeriod: 30588.0, // ימים (83.75 שנים)
        rotationPeriod: -0.71833, // ימים (17.2 שעות, הפוך)
        temperature: { clouds: -195, core: 5000 }, // צלזיוס
        color: 0x4FD0E7,
        scaledRadius: 9, // הגדלה מ-7 ל-9
        scaledDistance: 400,
        moons: 27,
        rings: true, // טבעות אנכיות!
        eccentricity: 0.0444,
        inclination: 0.77,
        axialTilt: 97.77, // מסתובב על הצד!
        description: 'אורנוס הוא ענק הקרח השלישי בגודלו והוא ייחודי במערכת השמש - הוא מסתובב על הצד! הטיית הציר שלו היא כמעט 98 מעלות, מה שאומר שהקטבים שלו פונים לשמש לחילופין. אורנוס עשוי בעיקר מקרח מים, מתאן ואמוניה.',
        facts: [
            'מסתובב על הצד - הטיית ציר של 98 מעלות!',
            'עשוי מקרח ומתאן, לא מגז כמו צדק ושבתאי',
            'התגלה ב-1781 על ידי וויליאם הרשל - הכוכב הראשון שהתגלה בטלסקופ',
            'טבעות אנכיות ייחודיות שהתגלו ב-1977',
            'הכוכב הקר ביותר במערכת השמש למרות שנפטון רחוק יותר',
            'יום קיץ באורנוס אורך 42 שנות כדור ארץ'
        ],
        atmosphere: {
            hydrogen: '82.5%',
            helium: '15.2%',
            methane: '2.3%',
            uniqueFeature: 'מתאן גורם לצבע הכחול'
        },
        exploration: [
            'ויאג\'ר 2 (1986) - החללית היחידה שביקרה',
            'טלסקופ הבל - תצפיות מתמשכות',
            'טלסקופ ג\'יימס ווב - תמונות חדשות באיכות גבוהה'
        ]
    },
    neptune: {
        name: 'נפטון',
        nameEn: 'Neptune',
        radius: 24622, // ק"מ
        mass: 1.02413e26, // ק"ג
        distance: 4515.0e6, // ק"מ מהשמש
        orbitalPeriod: 60182.0, // ימים (164.8 שנים)
        rotationPeriod: 0.6713, // ימים (16.1 שעות)
        temperature: { clouds: -200, core: 5200 }, // צלזיוס
        color: 0x4B70DD,
        scaledRadius: 8, // הגדלה מ-6 ל-8
        scaledDistance: 500,
        moons: 16, // כולל טריטון
        rings: true, // טבעות חלקיות
        eccentricity: 0.0113,
        inclination: 1.77,
        axialTilt: 28.32,
        description: 'נפטון הוא הכוכב הרחוק ביותר מהשמש וענק הקרח השני בגודלו. הוא מפורסם ברוחות החזקות ביותר במערכת השמש - עד 2,100 קמ"ש! נפטון התגלה באמצעות חישובים מתמטיים לפני שנצפה בטלסקופ, והוא משלים מסלול אחד סביב השמש כל 165 שנה.',
        facts: [
            'הרוחות החזקות ביותר במערכת השמש - עד 2,100 קמ"ש',
            'שנה אחת שווה ל-164.8 שנות כדור ארץ',
            'התגלה באמצעות חישובים מתמטיים לפני התצפית',
            'הצפיפות הגבוהה ביותר מבין ענקי הגז',
            'טריטון, הירח הגדול, מסתובב בכיוון הפוך',
            'הכוכב עם הגוון הכחול הכי עמוק בשל המתאן'
        ],
        atmosphere: {
            hydrogen: '80%',
            helium: '19%',
            methane: '1%',
            uniqueFeature: 'מתאן בריכוז גבוה יותר מאורנוס'
        },
        majorMoons: ['טריטון (Triton)', 'נראיד (Nereid)'],
        exploration: [
            'ויאג\'ר 2 (1989) - החללית היחידה שביקרה',
            'טלסקופ הבל - מעקב אחר סופות',
            'טלסקופ ג\'יימס ווב - מחקר אטמוספירה מתקדם'
        ]
    }
};

// יחידות מידה וקונברטרים
const ASTRONOMICAL_UNITS = {
    AU: 149597870.7, // ק"מ
    LIGHT_MINUTE: 17987547.48, // ק"מ
    LIGHT_SECOND: 299792.458, // ק"מ
    EARTH_RADIUS: 6371, // ק"מ
    SUN_RADIUS: 696340, // ק"מ
    
    // המרת יחידות
    kmToAU: (km) => km / ASTRONOMICAL_UNITS.AU,
    auToKm: (au) => au * ASTRONOMICAL_UNITS.AU,
    
    // המרת זמן
    earthDaysToYears: (days) => days / 365.25,
    yearsToEarthDays: (years) => years * 365.25,
    
    // המרת טמפרטורה
    celsiusToKelvin: (celsius) => celsius + 273.15,
    kelvinToCelsius: (kelvin) => kelvin - 273.15,
    celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
    
    // המרת יחידות מסה (יחסית לכדור הארץ)
    massRelativeToEarth: (mass) => {
        return mass / PLANETS_DATA.earth.mass;
    },
    
    // המרת יחידות רדיוס (יחסית לכדור הארץ)
    radiusRelativeToEarth: (radius) => {
        return radius / PLANETS_DATA.earth.radius;
    },
    
    // חישוב הילל השפעה (Hill Sphere)
    hillSphere: (mass, distance, centralMass = PLANETS_DATA.sun.mass) => {
        return distance * Math.pow(mass / (3 * centralMass), 1/3);
    },
    
    // חישוב תקופת הסינודוס (זמן בין התנגדויות)
    synodicPeriod: (period1, period2) => {
        return Math.abs(1 / (1/period1 - 1/period2));
    }
};

// צבעי כוכבי הלכת המדויקים
const PLANET_COLORS = {
    sun: { primary: 0xFFD700, secondary: 0xFFA500, glow: 0xFF4500 },
    mercury: { primary: 0x8C7853, secondary: 0x9C8C73, surface: 0x7C6C43 },
    venus: { primary: 0xFFC649, secondary: 0xFFD95D, clouds: 0xFFF5AA },
    earth: { primary: 0x6B93D6, secondary: 0x4F7CB8, ocean: 0x1E6BA8, land: 0x8FBC8F },
    mars: { primary: 0xCD5C5C, secondary: 0xE67C7C, polar: 0xFFFFFF },
    jupiter: { primary: 0xD8CA9D, secondary: 0xE8DAB5, bands: 0xB8A085, spot: 0xFF6B4A },
    saturn: { primary: 0xFAD5A5, secondary: 0xFFE5C5, rings: 0xF5F5DC },
    uranus: { primary: 0x4FD0E7, secondary: 0x6FDFFF, methane: 0x40B0C7 },
    neptune: { primary: 0x4B70DD, secondary: 0x6B8FFF, storms: 0x2B50BD }
};

// מיקומים ראשוניים לאנימציה
const INITIAL_POSITIONS = {
    mercury: { angle: 0 },
    venus: { angle: Math.PI * 0.3 },
    earth: { angle: Math.PI * 0.6 },
    mars: { angle: Math.PI * 0.9 },
    jupiter: { angle: Math.PI * 1.2 },
    saturn: { angle: Math.PI * 1.5 },
    uranus: { angle: Math.PI * 1.8 },
    neptune: { angle: Math.PI * 0.1 }
};

// הגדרות מסלולים מדויקות
const ORBITAL_ELEMENTS = {
    mercury: { e: 0.2056, i: 7.00, omega: 29.12, w: 77.46 },
    venus: { e: 0.0067, i: 3.39, omega: 76.68, w: 131.60 },
    earth: { e: 0.0167, i: 0.00, omega: -11.26, w: 102.94 },
    mars: { e: 0.0935, i: 1.85, omega: 49.58, w: 336.04 },
    jupiter: { e: 0.0489, i: 1.30, omega: 100.46, w: 14.33 },
    saturn: { e: 0.0565, i: 2.49, omega: 113.66, w: 93.06 },
    uranus: { e: 0.0444, i: 0.77, omega: 74.01, w: 173.01 },
    neptune: { e: 0.0113, i: 1.77, omega: 131.78, w: 48.12 }
};

// קבוצות כוכבי לכת
const PLANET_GROUPS = {
    terrestrial: ['mercury', 'venus', 'earth', 'mars'], // כוכבי לכת סלעיים
    gasGiants: ['jupiter', 'saturn'], // ענקי גז
    iceGiants: ['uranus', 'neptune'], // ענקי קרח
    inner: ['mercury', 'venus', 'earth', 'mars'], // כוכבי הלכת הפנימיים
    outer: ['jupiter', 'saturn', 'uranus', 'neptune'] // כוכבי הלכת החיצוניים
};

// מידע על חקירה חללית
const SPACE_EXPLORATION = {
    past: [
        { mission: 'Apollo 11', year: 1969, target: 'earth', achievement: 'נחיתה ראשונה על הירח' },
        { mission: 'Viking 1 & 2', year: 1976, target: 'mars', achievement: 'נחתות ראשונות על מאדים' },
        { mission: 'Voyager 1 & 2', year: 1977, target: 'multiple', achievement: 'Grand Tour של כוכבי הלכת החיצוניים' }
    ],
    current: [
        { mission: 'Perseverance', year: 2021, target: 'mars', status: 'פעיל' },
        { mission: 'Juno', year: 2016, target: 'jupiter', status: 'פעיל' },
        { mission: 'Parker Solar Probe', year: 2018, target: 'sun', status: 'פעיל' }
    ],
    future: [
        { mission: 'Artemis', year: 2026, target: 'earth', goal: 'חזרה לירח' },
        { mission: 'Europa Clipper', year: 2030, target: 'jupiter', goal: 'חקירת אירופה' },
        { mission: 'Dragonfly', year: 2034, target: 'saturn', goal: 'נחתת על טיטאן' }
    ]
};

// הפוך את הנתונים זמינים גלובלית
if (typeof window !== 'undefined') {
    window.PLANETS_DATA = PLANETS_DATA;
    window.ASTRONOMICAL_UNITS = ASTRONOMICAL_UNITS;
    window.PLANET_COLORS = PLANET_COLORS;
    window.INITIAL_POSITIONS = INITIAL_POSITIONS;
    window.ORBITAL_ELEMENTS = ORBITAL_ELEMENTS;
    window.PLANET_GROUPS = PLANET_GROUPS;
    window.SPACE_EXPLORATION = SPACE_EXPLORATION;
}
