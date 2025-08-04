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
        scaledRadius: 15,
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
        scaledRadius: 2,
        scaledDistance: 25,
        moons: 0,
        eccentricity: 0.2056,
        inclination: 7.00,
        axialTilt: 0.034,
        description: 'כוכב חמה הוא הכוכב הקרוב ביותר לשמש והקטן ביותר במערכת השמש. למרות קרבתו לשמש, הוא אינו הכוכב החם ביותר. כוכב חמה חסר אטמוספירה כמעט לחלוטין, מה שגורם לשינויי טמפרטורה קיצוניים בין היום והלילה. יום אחד על כוכב חמה ארוך יותר משנה שלו!',
        facts: [
            'הכוכב לכת הקטן ביותר במערכת השמש',
            'יום אחד על כוכב חמה = 176 ימי כדור ארץ',
            'השנה הקצרה ביותר: 88 ימי כדור ארץ',
            'טמפרטורות קיצוניות: -173°C עד 427°C',
            'אין לו אטמוספירה כמעט',
            'יש לו מגמה של כווצות - הוא מתקרר לאט',
            'המהירות הגבוהה ביותר במסלול: 47.4 קמ/ש',
            'יש לו מרכז ברזל גדול יחסית לגודלו'
        ],
        composition: {
            core: 'ברזל מוצק גדול (75% מהקוטר)',
            mantle: 'סיליקטים דקים',
            crust: 'סיליקטים עם מכתשים רבים'
        },
        atmosphere: {
            composition: 'כמעט ואקום',
            pressure: '10^-15 בר',
            mainComponents: 'חמצן, נתרן, מימן, הליום, אשלגן'
        },
        exploration: [
            'מרינר 10 (1974-1975)',
            'MESSENGER (2011-2015)',
            'BepiColombo (2018-2025)'
        ]
    },
    venus: {
        name: 'נוגה',
        nameEn: 'Venus',
        radius: 6051.8, // ק"מ
        mass: 4.8675e24, // ק"ג
        distance: 108.21e6, // ק"מ מהשמש
        orbitalPeriod: 224.701, // ימים
        rotationPeriod: -243.025, // ימים (סיבוב לאחור)
        temperature: { avg: 464, surface: 464 }, // צלזיוס
        color: 0xFFC649,
        scaledRadius: 3.8,
        scaledDistance: 35,
        moons: 0,
        eccentricity: 0.0067,
        inclination: 3.39,
        axialTilt: 177.4,
        description: 'נוגה נקראת "כוכב הערב" או "כוכב הבוקר" והיא הכוכב הבהיר ביותר בשמי הלילה אחרי השמש והירח. האטמוספרה הצפופה שלה יוצרת אפקט חממה קיצוני שהופך אותה לכוכב הלכת החם ביותר במערכת השמש, אפילו יותר מכוכב חמה.',
        facts: [
            'הכוכב לכת החם ביותר במערכת השמש (464°C)',
            'מסתובב לכיוון ההפוך מכל הכוכבים האחרים',
            'יום אחד על נוגה = 243 ימי כדור ארץ',
            'לחץ אטמוספרי פי 90 מכדור הארץ',
            'נקראת "תאומת כדור הארץ" בגלל הגודל הדומה',
            'השמש זורחת במערב ושוקעת במזרח',
            'יש לה עננים של חומצת גופרית',
            'הכוכב הבהיר ביותר אחרי השמש והירח'
        ],
        atmosphere: {
            co2: '96.5%',
            nitrogen: '3.5%',
            pressure: '92 בר',
            clouds: 'חומצת גופרית',
            effects: 'אפקט חממה קיצוני'
        },
        surface: {
            features: 'וולקנים, הרים, מכתשים',
            volcanism: 'פעילות וולקנית אפשרית',
            terrain: 'מישורי לבה ענקיים'
        },
        exploration: [
            'ונרה (ברית המועצות, 1961-1984)',
            'מגלן (NASA, 1989-1994)',
            'ונוס אקספרס (ESA, 2005-2014)',
            'פארקר סולאר פרוב (2020-היום)'
        ]
    },
    earth: {
        name: 'כדור הארץ',
        nameEn: 'Earth',
        radius: 6371, // ק"מ
        mass: 5.9724e24, // ק"ג
        distance: 149.6e6, // ק"מ מהשמש (1 AU)
        orbitalPeriod: 365.256, // ימים
        rotationPeriod: 0.99726968, // ימים (23.93 שעות)
        temperature: { avg: 15, min: -89, max: 58 }, // צלזיוס
        color: 0x6B93D6,
        scaledRadius: 4,
        scaledDistance: 50,
        moons: 1,
        eccentricity: 0.0167,
        inclination: 0,
        axialTilt: 23.44,
        description: 'כדור הארץ הוא הכוכב לכת הידוע היחיד שתומך בחיים. 71% משטחו מכוסה במים נוזליים, והוא בעל אטמוספרה עשירה בחמצן ושכבת אוזון מגנה. הירח שלנו משפיע על הגאות והשפל ומייצב את הסיבוב של כדור הארץ, מה שמאפשר אקלים יציב.',
        facts: [
            'הכוכב לכת היחיד הידוע שתומך בחיים',
            '71% מהשטח מכוסה במים נוזליים',
            'האטמוספרה מכילה 21% חמצן',
            'יש לו ירח אחד גדול המשפיע על הגאות',
            'שכבת האוזון מגנה מקרינה מזיקה',
            'הכוכב הצפוף ביותר במערכת השמש',
            'היחיד עם טקטוניקת לוחות פעילה',
            'בית לכ-8.7 מיליון מינים של יצורים חיים'
        ],
        atmosphere: {
            nitrogen: '78.09%',
            oxygen: '20.95%',
            argon: '0.93%',
            co2: '0.04%',
            pressure: '1 בר'
        },
        oceans: {
            coverage: '71%',
            averageDepth: '3.68 קמ',
            deepestPoint: 'תעלת מריאנה - 11.03 קמ',
            volume: '1.386 מיליארד קמ³'
        },
        life: {
            ageOfLife: '3.8 מיליארד שנים',
            species: '8.7 מיליון מינים מוערכים',
            biomass: 'מרבית הביומסה חיה באוקיינוסים'
        }
    },
    mars: {
        name: 'מאדים',
        nameEn: 'Mars',
        radius: 3389.5, // ק"מ
        mass: 6.4171e23, // ק"ג
        distance: 227.92e6, // ק"מ מהשמש
        orbitalPeriod: 686.980, // ימים
        rotationPeriod: 1.025957, // ימים (24.6 שעות)
        temperature: { avg: -65, min: -125, max: 20 }, // צלזיוס
        color: 0xCD5C5C,
        scaledRadius: 3.5,
        scaledDistance: 75,
        moons: 2, // פובוס ודיימוס
        eccentricity: 0.0935,
        inclination: 1.85,
        axialTilt: 25.19,
        description: 'מאדים, הידוע כ"כוכב הלכת האדום", הוא המטרה העיקרית לחקר החלל העתידי. יש לו עונות דומות לכדור הארץ, קטבים קפואים, ועדויות רבות לכך שבעבר זרמו עליו מים נוזליים. מאדים הוא הכוכב לכת השני הקטן ביותר במערכת השמש.',
        facts: [
            'נקרא "הכוכב לכת האדום" בגלל תחמוצת הברזל',
            'יש לו שני ירחים קטנים: פובוס ודיימוס',
            'הר הגעש הגבוה ביותר במערכת השמש: אולימפוס מונס',
            'יום דומה לכדור הארץ: 24.6 שעות',
            'עונות דומות לכדור הארץ אבל פי 2 ארוכות יותר',
            'יש קרח מים בקטבים ומתחת לפני השטח',
            'הוא איבד את רוב האטמוספירה שלו בעבר',
            'בעבר כנראה היו עליו אוקיינוסים'
        ],
        features: {
            olympusMons: 'הר הגעש הגבוה ביותר במערכת השמש (21.9 ק"מ)',
            valesMarineris: 'קניון ענק באורך 4,000 ק"מ ועומק 7 ק"מ',
            polarIceCaps: 'קרח מים וקרח יבש (CO2) בקטבים',
            dust: 'סופות אבק עולמיות'
        },
        atmosphere: {
            co2: '95.32%',
            nitrogen: '2.7%',
            argon: '1.6%',
            pressure: '0.6% מכדור הארץ'
        },
        exploration: [
            'מארס פת\'פיינדר (1997)',
            'ספיריט ואופורטוניטי (2004)',
            'קיוריוסיטי (2012)',
            'פרסוורנס (2021)',
            'אינג\'נואיטי - מסוק מאדים (2021)'
        ]
    },
    jupiter: {
        name: 'צדק',
        nameEn: 'Jupiter',
        radius: 69911, // ק"מ
        mass: 1.8982e27, // ק"ג
        distance: 778.57e6, // ק"מ מהשמש
        orbitalPeriod: 4332.59, // ימים (11.86 שנים)
        rotationPeriod: 0.41354, // ימים (9.9 שעות)
        temperature: { avg: -110, core: 20000 }, // צלזיוס
        color: 0xD8CA9D,
        scaledRadius: 12,
        scaledDistance: 120,
        moons: 95, // כולל 4 הירחים הגליליים הגדולים
        eccentricity: 0.0489,
        inclination: 1.30,
        axialTilt: 3.13,
        description: 'צדק הוא ענק הגז הגדול ביותר במערכת השמש ומכיל יותר מסה מכל הכוכבים האחרים יחד. הוא מגן על כדור הארץ מפני אסטרואידים וקומטות בזכות כוח הכבידה העצום שלו. צדק הוא כמו מערכת שמש קטנה עם 95 ירחים.',
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
        scaledRadius: 10,
        scaledDistance: 180,
        moons: 146, // כולל טיטאן
        rings: true,
        eccentricity: 0.0565,
        inclination: 2.49,
        axialTilt: 26.73,
        description: 'שבתאי מפורסם בזכות מערכת הטבעות המרהיבה שלו והוא ענק הגז השני בגודלו. הוא כה קל שהיה צף במים! טיטאן, הירח הגדול ביותר שלו, הוא הגוף היחיד במערכת השמש מלבד כדור הארץ שיש לו נוזלים יציבים על פני השטח.',
        facts: [
            'מפורסם במערכת הטבעות המדהימה שלו',
            'צפיפות נמוכה מכל כוכב לכת אחר - היה צף במים!',
            '146 ירחים ידועים',
            'טיטאן הוא הירח היחיד עם אטמוספירה צפופה',
            'הטבעות עשויות בעיקר מקרח מים',
            'יש לו שישה-צדר ענק בקוטב הצפוני',
            'מוקף בשדה מגנטי חזק',
            'יש לו יותר ירחים מכל כוכב לכת אחר'
        ],
        rings: {
            mainRings: ['D', 'C', 'B', 'A', 'F', 'G', 'E'],
            composition: 'קרח מים (99%) ואבק סלעים (1%)',
            width: 'עד 282,000 ק"מ',
            thickness: 'כ-1 ק"מ בממוצע',
            discovery: 'גלילאו גליליי (1610)'
        },
        majorMoons: ['טיטאן (Titan)', 'אנקלדוס (Enceladus)', 'מימאס (Mimas)', 'איפטוס (Iapetus)', 'רהיה (Rhea)'],
        atmosphere: {
            hydrogen: '96.3%',
            helium: '3.25%',
            pressure: 'אין משטח מוצק'
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
        orbitalPeriod: 30688.5, // ימים (84.01 שנים)
        rotationPeriod: -0.71833, // ימים (17.24 שעות, סיבוב לאחור)
        temperature: { avg: -195, min: -224 }, // צלזיוס
        color: 0x4FD0E7,
        scaledRadius: 8,
        scaledDistance: 240,
        moons: 27,
        rings: true,
        eccentricity: 0.0444,
        inclination: 0.77,
        axialTilt: 97.77,
        description: 'אורנוס הוא כוכב לכת ייחודי שמסתובב על הצד - ציר הסיבוב שלו נטוי ב-98 מעלות! הוא עשוי בעיקר מקרח מים, מתאן ואמוניה, מה שנותן לו את הצבע הכחול-ירוק המיוחד. אורנוס הוא הכוכב הקר ביותר במערכת השמש.',
        facts: [
            'מסתובב על הצד - ציר סיבוב נטוי ב-98°',
            'העונות ארוכות 21 שנה כל אחת',
            'עשוי בעיקר מקרח מים, מתאן ואמוניה',
            'הכוכב לכת הקר ביותר במערכת השמש',
            'הוא הראשון שהתגלה באמצעות טלסקופ (1781)',
            'יש לו 13 טבעות דקות וכהות',
            'שדה המגנטי שלו נטוי ב-59° לציר הסיבוב',
            'כל הקטבים חווים 42 שנה של אור ו-42 שנה של חושך'
        ],
        composition: {
            water: '50% קרח מים',
            methane: '15% קרח מתאן',
            ammonia: '15% קרח אמוניה',
            rock: '20% סלע ומתכות'
        },
        rings: {
            discovered: '1977',
            rings: 13,
            composition: 'חלקיקים כהים ואבק',
            names: ['זטה, 6, 5, 4, אלפא, בטא, אטה, גמא, דלתא, למבדה, אפסילון, נו, מו']
        },
        majorMoons: ['מירנדה (Miranda)', 'אריאל (Ariel)', 'אומבריאל (Umbriel)', 'טיטניה (Titania)', 'אוברון (Oberon)'],
        atmosphere: {
            hydrogen: '82.5%',
            helium: '15.2%',
            methane: '2.3%'
        },
        exploration: [
            'ויאג\'ר 2 (1986) - החללית היחידה שביקרה'
        ]
    },
    neptune: {
        name: 'נפטון',
        nameEn: 'Neptune',
        radius: 24622, // ק"מ
        mass: 1.02413e26, // ק"ג
        distance: 4515.0e6, // ק"מ מהשמש
        orbitalPeriod: 60182.0, // ימים (164.8 שנים)
        rotationPeriod: 0.6713, // ימים (16.11 שעות)
        temperature: { avg: -200, core: 5200 }, // צלזיוס
        color: 0x4B70DD,
        scaledRadius: 7.5,
        scaledDistance: 300,
        moons: 16, // כולל טריטון
        rings: true,
        eccentricity: 0.0113,
        inclination: 1.77,
        axialTilt: 28.32,
        description: 'נפטון הוא הכוכב לכת הרחוק ביותר מהשמש ובעל הרוחות החזקות ביותר במערכת השמש - עד 2,100 קמ"ש! טריטון, הירח הגדול שלו, הוא הגוף הקר ביותר במערכת השמש והירח היחיד עם מסלול רטרוגרדי.',
        facts: [
            'הכוכב לכת הרחוק ביותר מהשמש',
            'הרוחות החזקות ביותר: עד 2,100 קמ"ש',
            'שנה אחת = 165 שנות כדור ארץ',
            'טריטון הוא הירח היחיד עם מסלול רטרוגרדי',
            'התגלה באמצעות חישובים מתמטיים (1846)',
            'הוא הכוכב הצפוף ביותר מבין ענקי הגז',
            'מקבל רק 0.1% מהאור שמגיע לכדור הארץ',
            'טמפרטורת הליבה חמה יותר מפני השמש'
        ],
        majorMoons: ['טריטון (Triton)', 'נראיד (Nereid)', 'פרוטאוס (Proteus)'],
        atmosphere: {
            hydrogen: '80%',
            helium: '19%',
            methane: '1%',
            traces: 'הידרגן דאוטריד, אתאן'
        },
        features: {
            winds: 'הרוחות החזקות ביותר במערכת השמש - עד 2,100 קמ"ש',
            triton: 'ירח גדול עם פעילות גיאולוגית וגייזרים של חנקן',
            color: 'הצבע הכחול נובע ממתאן באטמוספירה',
            storms: 'סופות גדולות כגודל כדור הארץ'
        },
        rings: {
            discovered: '1989',
            rings: 6,
            names: ['גל, לה ורייה, לאסל, אראגו, אדמס'],
            composition: 'חומר אורגני כהה'
        },
        exploration: [
            'ויאג\'ר 2 (1989) - החללית היחידה שביקרה'
        ]
    }
};

// קבועים פיזיקליים מדויקים
const PHYSICS_CONSTANTS = {
    AU: 149597870.7, // קילומטר - יחידה אסטרונומית
    G: 6.67430e-11, // קבוע הכבידה הניוטוני
    EARTH_RADIUS: 6371, // ק"מ
    SUN_RADIUS: 696340, // ק"מ
    LIGHT_SPEED: 299792458, // מ/ש
    SCALE_FACTOR: 0.0001, // קנה מידה לתצוגה
    TIME_SCALE: 1, // קנה מידה זמן
    REALISTIC_SCALE_FACTOR: 0.000001 // קנה מידה ריאליסטי
};

// נתוני חגורת האסטרואידים
const ASTEROID_BELT_DATA = {
    name: 'חגורת האסטרואידים',
    nameEn: 'Asteroid Belt',
    innerRadius: 2.2, // AU
    outerRadius: 3.2, // AU
    scaledInnerRadius: 85,
    scaledOuterRadius: 130,
    totalMass: 3.0e21, // ק"ג (4% ממסת הירח)
    largestAsteroid: 'קרס (Ceres)',
    description: 'חגורת האסטרואידים היא אזור במערכת השמש הממוקם בין מאדים לצדק, המכיל מיליוני גופים סלעיים. למרות שבסרטים היא נראית צפופה ומסוכנת, במציאות המרחקים בין האסטרואידים עצומים.',
    facts: [
        'מכילה מיליוני אסטרואידים',
        'המסה הכוללת היא רק 4% ממסת הירח',
        'הממוצע בין האסטרואידים הוא מיליוני קילומטרים',
        'קרס הוא הגוף הגדול ביותר - כוכב לכת ננס',
        'רוב האסטרואידים עשויים סלע ומתכת',
        'נוצרה ככל הנראה מחומר שלא הצליח להתחבר לכוכב לכת'
    ],
    majorAsteroids: [
        { name: 'קרס (Ceres)', diameter: 939, type: 'כוכב לכת ננס', composition: 'סלע וקרח' },
        { name: 'וסטה (Vesta)', diameter: 525, type: 'אסטרואיד', composition: 'בזלת' },
        { name: 'פלס (Pallas)', diameter: 512, type: 'אסטרואיד', composition: 'סלע' },
        { name: 'יונו (Juno)', diameter: 246, type: 'אסטרואיד', composition: 'סלע ומתכת' }
    ]
};

// פונקציות עזר לחישובים אסטרונומיים
const AstronomicalUtils = {
    // המרת AU לקילומטרים
    auToKm: (au) => au * PHYSICS_CONSTANTS.AU,
    
    // חישוב מהירות מסלול (חוק שלישי של קפלר)
    orbitalVelocity: (distance, mass = PLANETS_DATA.sun.mass) => {
        return Math.sqrt(PHYSICS_CONSTANTS.G * mass / (distance * 1000));
    },
    
    // חישוב כבידה על פני השטח
    surfaceGravity: (mass, radius) => {
        return PHYSICS_CONSTANTS.G * mass / Math.pow(radius * 1000, 2);
    },
    
    // חישוב מהירות בריחה
    escapeVelocity: (mass, radius) => {
        return Math.sqrt(2 * PHYSICS_CONSTANTS.G * mass / (radius * 1000));
    },
    
    // המרת מעלות צלזיוס לקלווין
    celsiusToKelvin: (celsius) => celsius + 273.15,
    
    // חישוב זמן הגעת אור
    lightTravelTime: (distance) => {
        return (distance * 1000) / PHYSICS_CONSTANTS.LIGHT_SPEED; // שניות
    },
    
    // חישוב כוח הכבידה בין שני גופים
    gravitationalForce: (mass1, mass2, distance) => {
        return PHYSICS_CONSTANTS.G * mass1 * mass2 / Math.pow(distance * 1000, 2);
    },
    
    // חישוב אנרגיה קינטית אורביטלית
    orbitalKineticEnergy: (mass, velocity) => {
        return 0.5 * mass * Math.pow(velocity, 2);
    },
    
    // חישוב אנרגיה פוטנציאלית גרוויטציונית
    gravitationalPotentialEnergy: (mass1, mass2, distance) => {
        return -PHYSICS_CONSTANTS.G * mass1 * mass2 / (distance * 1000);
    },
    
    // חישוב צפיפות
    density: (mass, radius) => {
        const volume = (4/3) * Math.PI * Math.pow(radius * 1000, 3);
        return mass / volume; // ק"ג/מ"ק
    },
    
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
    terrestrial: ['mercury', 'venus', 'earth', 'mars'],
    gasGiants: ['jupiter', 'saturn', 'uranus', 'neptune'],
    inner: ['mercury', 'venus', 'earth', 'mars'],
    outer: ['jupiter', 'saturn', 'uranus', 'neptune'],
    withMoons: ['earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    withRings: ['jupiter', 'saturn', 'uranus', 'neptune'],
    withAtmosphere: ['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']
};

// מידע על ירחים עיקריים
const MAJOR_MOONS = {
    earth: {
        moon: {
            name: 'הירח',
            nameEn: 'Moon',
            radius: 1737.4,
            distance: 384400, // ק"מ מכדור הארץ
            period: 27.32,
            description: 'הירח הוא הלוויין הטבעי היחיד של כדור הארץ והחמישי בגודלו במערכת השמש'
        }
    },
    mars: {
        phobos: { name: 'פובוס', radius: 11.3, distance: 9376, period: 0.32, description: 'הירח הפנימי והגדול יותר של מאדים' },
        deimos: { name: 'דיימוס', radius: 6.2, distance: 23463, period: 1.26, description: 'הירח החיצוני והקטן יותר של מאדים' }
    },
    jupiter: {
        io: { name: 'יו', radius: 1821.6, distance: 421700, period: 1.77, description: 'הירח הוולקני ביותר במערכת השמש' },
        europa: { name: 'אירופה', radius: 1560.8, distance: 671034, period: 3.55, description: 'ירח עם אוקיינוס תת-קרקעי וחיים אפשריים' },
        ganymede: { name: 'גנימד', radius: 2634.1, distance: 1070412, period: 7.15, description: 'הירח הגדול ביותר במערכת השמש' },
        callisto: { name: 'קליסטו', radius: 2410.3, distance: 1882709, period: 16.69, description: 'ירח עתיק עם מכתשים רבים' }
    },
    saturn: {
        titan: { name: 'טיטאן', radius: 2574, distance: 1221830, period: 15.95, description: 'הירח היחיד עם אטמוספירה צפופה ואגמי מתאן' },
        enceladus: { name: 'אנקלדוס', radius: 252.1, distance: 238020, period: 1.37, description: 'ירח קטן עם גייזרים של מים מהקוטב הדרומי' }
    },
    uranus: {
        titania: { name: 'טיטניה', radius: 788.4, distance: 436300, period: 8.71, description: 'הירח הגדול ביותר של אורנוס' },
        oberon: { name: 'אוברון', radius: 761.4, distance: 583520, period: 13.46, description: 'הירח החיצוני והשני בגודלו של אורנוס' }
    },
    neptune: {
        triton: { name: 'טריטון', radius: 1353.4, distance: 354760, period: -5.88, description: 'הירח היחיד עם מסלול רטרוגרדי ופעילות גיאולוגית' }
    }
};

// מידע על מחקר החלל
const SPACE_EXPLORATION = {
    mercury: [
        { mission: 'מרינר 10', years: '1974-1975', country: 'ארה"ב', achievement: 'תמונות ראשונות מקרוב' },
        { mission: 'MESSENGER', years: '2011-2015', country: 'ארה"ב', achievement: 'מיפוי מפורט ותגלית קרח בקטבים' },
        { mission: 'BepiColombo', years: '2018-2025', country: 'אירופה/יפן', achievement: 'משימה פעילה - מחקר מפורט' }
    ],
    venus: [
        { mission: 'ונרה', years: '1961-1984', country: 'ברית המועצות', achievement: 'נחיתות ראשונות על פני השטח' },
        { mission: 'מגלן', years: '1989-1994', country: 'ארה"ב', achievement: 'מיפוי רדאר של פני השטח' },
        { mission: 'ונוס אקספרס', years: '2005-2014', country: 'אירופה', achievement: 'מחקר אטמוספירה מפורט' }
    ],
    mars: [
        { mission: 'ויקינג', years: '1976-1982', country: 'ארה"ב', achievement: 'נחיתות ראשונות מוצלחות' },
        { mission: 'מארס פת\'פיינדר', years: '1997', country: 'ארה"ב', achievement: 'רובר ראשון' },
        { mission: 'ספיריט ואופורטוניטי', years: '2004-2018', country: 'ארה"ב', achievement: 'עדויות למים בעבר' },
        { mission: 'קיוריוסיטי', years: '2012-היום', country: 'ארה"ב', achievement: 'מחקר אפשרות חיים' },
        { mission: 'פרסוורנס', years: '2021-היום', country: 'ארה"ב', achievement: 'איסוף דגימות לחזרה לארץ' }
    ],
    jupiter: [
        { mission: 'פיוניר 10/11', years: '1973-1974', country: 'ארה"ב', achievement: 'חלפו ראשונים ליד צדק' },
        { mission: 'ויאג\'ר 1/2', years: '1979', country: 'ארה"ב', achievement: 'תגלית ירחים וטבעות' },
        { mission: 'גלילאו', years: '1995-2003', country: 'ארה"ב', achievement: 'מחקר מפורט של המערכת' },
        { mission: 'ג\'ונו', years: '2016-היום', country: 'ארה"ב', achievement: 'מחקר פנים צדק והקטבים' }
    ],
    saturn: [
        { mission: 'פיוניר 11', years: '1979', country: 'ארה"ב', achievement: 'חלף ראשון ליד שבתאי' },
        { mission: 'ויאג\'ר 1/2', years: '1980-1981', country: 'ארה"ב', achievement: 'תגלית טבעות וירחים חדשים' },
        { mission: 'קאסיני-הויגנס', years: '2004-2017', country: 'ארה"ב/אירופה', achievement: 'נחיתה על טיטאן ומחקר מפורט' }
    ],
    uranus: [
        { mission: 'ויאג\'ר 2', years: '1986', country: 'ארה"ב', achievement: 'החללית היחידה שביקרה באורנוס' }
    ],
    neptune: [
        { mission: 'ויאג\'ר 2', years: '1989', country: 'ארה"ב', achievement: 'החללית היחידה שביקרה בנפטון' }
    ]
};

// פונקציות עזר להצגת מידע
const InfoUtils = {
    formatDistance: (km) => {
        if (km >= 1e9) return `${(km / 1e9).toFixed(1)} מיליארד ק"מ`;
        if (km >= 1e6) return `${(km / 1e6).toFixed(1)} מיליון ק"מ`;
        if (km >= 1e3) return `${(km / 1e3).toFixed(0)} אלף ק"מ`;
        return `${km.toLocaleString()} ק"מ`;
    },
    
    formatMass: (kg) => {
        const earthMass = PLANETS_DATA.earth.mass;
        const ratio = kg / earthMass;
        if (ratio > 1000) return `${(ratio / 1000).toFixed(1)} אלף פעמים ממסת כדור הארץ`;
        if (ratio > 1) return `${ratio.toFixed(2)} פעמים ממסת כדור הארץ`;
        return `${(ratio * 100).toFixed(1)}% ממסת כדור הארץ`;
    },
    
    formatTemperature: (temp) => {
        if (typeof temp === 'object') {
            if (temp.avg) return `${temp.avg}°C בממוצע`;
            if (temp.min !== undefined && temp.max !== undefined) {
                return `${temp.min}°C עד ${temp.max}°C`;
            }
            if (temp.surface) return `${temp.surface}°C על פני השטח`;
        }
        return `${temp}°C`;
    },
    
    formatPeriod: (days) => {
        if (days < 1) return `${(days * 24).toFixed(1)} שעות`;
        if (days < 365) return `${Math.round(days)} ימים`;
        return `${(days / 365.25).toFixed(1)} שנות כדור ארץ`;
    },
    
    formatGravity: (ms2) => {
        const earthGravity = 9.81;
        const ratio = ms2 / earthGravity;
        return `${ms2.toFixed(1)} מ/ש² (${ratio.toFixed(2)} × כדור הארץ)`;
    },
    
    formatVelocity: (ms) => {
        const kms = ms / 1000;
        if (kms > 10) return `${kms.toFixed(1)} קמ/ש`;
        return `${ms.toFixed(0)} מ/ש`;
    }
};

// ייצוא למודולים אחרים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PLANETS_DATA, 
        PHYSICS_CONSTANTS, 
        ASTEROID_BELT_DATA,
        PLANET_COLORS,
        INITIAL_POSITIONS,
        ORBITAL_ELEMENTS,
        PLANET_GROUPS,
        MAJOR_MOONS,
        SPACE_EXPLORATION,
        AstronomicalUtils,
        InfoUtils
    };
}
