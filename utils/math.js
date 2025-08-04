// פונקציות מתמטיות לחישובים אסטרונומיים ואנימציות
const MathUtils = {
    // קבועים מתמטיים
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI * 0.5,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,

    // פונקציות בסיסיות
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    smoothstep: function(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    },

    // המרות זוויות
    degToRad: function(degrees) {
        return degrees * this.DEG_TO_RAD;
    },

    radToDeg: function(radians) {
        return radians * this.RAD_TO_DEG;
    },

    // נרמול זווית ל-0-2π
    normalizeAngle: function(angle) {
        while (angle < 0) angle += this.TWO_PI;
        while (angle >= this.TWO_PI) angle -= this.TWO_PI;
        return angle;
    },

    // חישובים אסטרונומיים
    // חישוב מיקום כוכב לכת במסלול אליפטי
    calculateOrbitalPosition: function(time, period, distance, eccentricity = 0, inclination = 0) {
        const meanAnomaly = (time / period) * this.TWO_PI;
        const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, eccentricity);
        const trueAnomaly = this.eccentricToTrueAnomaly(eccentricAnomaly, eccentricity);
        
        // מרחק מהמוקד
        const radius = distance * (1 - eccentricity * Math.cos(eccentricAnomaly));
        
        // מיקום במישור המסלול
        const x = radius * Math.cos(trueAnomaly);
        const y = radius * Math.sin(trueAnomaly) * Math.cos(inclination);
        const z = radius * Math.sin(trueAnomaly) * Math.sin(inclination);
        
        return { x, y, z, radius };
    },

    // פתרון משוואת קפלר (איטרטיבי)
    solveKeplerEquation: function(meanAnomaly, eccentricity, tolerance = 1e-6) {
        let E = meanAnomaly; // התחלה ראשונית
        let delta = tolerance + 1;
        let iterations = 0;
        const maxIterations = 50;

        while (Math.abs(delta) > tolerance && iterations < maxIterations) {
            const f = E - eccentricity * Math.sin(E) - meanAnomaly;
            const fp = 1 - eccentricity * Math.cos(E);
            delta = f / fp;
            E -= delta;
            iterations++;
        }

        return E;
    },

    // המרה מאנומליה אקסצנטרית לאנומליה אמיתית
    eccentricToTrueAnomaly: function(E, eccentricity) {
        const cosE = Math.cos(E);
        const sinE = Math.sin(E);
        const beta = eccentricity / (1 + Math.sqrt(1 - eccentricity * eccentricity));
        
        return E + 2 * Math.atan2(beta * sinE, 1 - beta * cosE);
    },

    // חישוב מהירות זוויתית של כוכב לכת
    orbitalAngularVelocity: function(period) {
        return this.TWO_PI / period;
    },

    // חישוב כבידה בין שני גופים
    gravitationalForce: function(mass1, mass2, distance) {
        const G = 6.67430e-11; // קבוע הכבידה
        return (G * mass1 * mass2) / (distance * distance);
    },

    // חישוב מהירות הבריחה
    escapeVelocity: function(mass, radius) {
        const G = 6.67430e-11;
        return Math.sqrt(2 * G * mass / radius);
    },

    // פונקציות אנימציה
    // easing functions לאנימציות חלקות
    easing: {
        linear: function(t) {
            return t;
        },

        easeInQuad: function(t) {
            return t * t;
        },

        easeOutQuad: function(t) {
            return t * (2 - t);
        },

        easeInOutQuad: function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },

        easeInCubic: function(t) {
            return t * t * t;
        },

        easeOutCubic: function(t) {
            return (--t) * t * t + 1;
        },

        easeInOutCubic: function(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },

        easeInSine: function(t) {
            return 1 - Math.cos(t * MathUtils.HALF_PI);
        },

        easeOutSine: function(t) {
            return Math.sin(t * MathUtils.HALF_PI);
        },

        easeInOutSine: function(t) {
            return 0.5 * (1 - Math.cos(MathUtils.PI * t));
        },

        easeInExpo: function(t) {
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        },

        easeOutExpo: function(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        },

        easeInOutExpo: function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
            return 0.5 * (2 - Math.pow(2, -20 * t + 10));
        },

        easeInCirc: function(t) {
            return 1 - Math.sqrt(1 - t * t);
        },

        easeOutCirc: function(t) {
            return Math.sqrt(1 - (--t) * t);
        },

        easeInOutCirc: function(t) {
            return t < 0.5 
                ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
                : 0.5 * (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1);
        },

        easeInBack: function(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },

        easeOutBack: function(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },

        easeInOutBack: function(t) {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },

        easeInElastic: function(t) {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },

        easeOutElastic: function(t) {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },

        easeInOutElastic: function(t) {
            const c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        },

        easeInBounce: function(t) {
            return 1 - MathUtils.easing.easeOutBounce(1 - t);
        },

        easeOutBounce: function(t) {
            const n1 = 7.5625;
            const d1 = 2.75;

            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },

        easeInOutBounce: function(t) {
            return t < 0.5
                ? (1 - MathUtils.easing.easeOutBounce(1 - 2 * t)) / 2
                : (1 + MathUtils.easing.easeOutBounce(2 * t - 1)) / 2;
        }
    },

    // פונקציות וקטור
    vector3: {
        create: function(x = 0, y = 0, z = 0) {
            return { x, y, z };
        },

        add: function(a, b) {
            return {
                x: a.x + b.x,
                y: a.y + b.y,
                z: a.z + b.z
            };
        },

        subtract: function(a, b) {
            return {
                x: a.x - b.x,
                y: a.y - b.y,
                z: a.z - b.z
            };
        },

        multiply: function(v, scalar) {
            return {
                x: v.x * scalar,
                y: v.y * scalar,
                z: v.z * scalar
            };
        },

        divide: function(v, scalar) {
            if (scalar === 0) return { x: 0, y: 0, z: 0 };
            return {
                x: v.x / scalar,
                y: v.y / scalar,
                z: v.z / scalar
            };
        },

        dot: function(a, b) {
            return a.x * b.x + a.y * b.y + a.z * b.z;
        },

        cross: function(a, b) {
            return {
                x: a.y * b.z - a.z * b.y,
                y: a.z * b.x - a.x * b.z,
                z: a.x * b.y - a.y * b.x
            };
        },

        length: function(v) {
            return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        },

        lengthSquared: function(v) {
            return v.x * v.x + v.y * v.y + v.z * v.z;
        },

        normalize: function(v) {
            const length = this.length(v);
            if (length === 0) return { x: 0, y: 0, z: 0 };
            return {
                x: v.x / length,
                y: v.y / length,
                z: v.z / length
            };
        },

        distance: function(a, b) {
            const diff = this.subtract(a, b);
            return this.length(diff);
        },

        distanceSquared: function(a, b) {
            const diff = this.subtract(a, b);
            return this.lengthSquared(diff);
        },

        lerp: function(a, b, t) {
            return {
                x: MathUtils.lerp(a.x, b.x, t),
                y: MathUtils.lerp(a.y, b.y, t),
                z: MathUtils.lerp(a.z, b.z, t)
            };
        },

        slerp: function(a, b, t) {
            // Spherical linear interpolation
            const dot = Math.max(-1, Math.min(1, this.dot(this.normalize(a), this.normalize(b))));
            const theta = Math.acos(dot) * t;
            
            const relativeVec = this.normalize(this.subtract(b, this.multiply(a, dot)));
            
            return this.add(
                this.multiply(a, Math.cos(theta)),
                this.multiply(relativeVec, Math.sin(theta))
            );
        },

        reflect: function(v, normal) {
            const dot = this.dot(v, normal);
            return this.subtract(v, this.multiply(normal, 2 * dot));
        },

        project: function(a, b) {
            const dot = this.dot(a, b);
            const lengthSq = this.lengthSquared(b);
            if (lengthSq === 0) return { x: 0, y: 0, z: 0 };
            return this.multiply(b, dot / lengthSq);
        },

        reject: function(a, b) {
            return this.subtract(a, this.project(a, b));
        }
    },

    // פונקציות רעש (Noise) לטקסטורות פרוצדורליות
    noise: {
        // טבלת permutation לרעש פרלין
        permutation: [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
            140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
            247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
            57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
            74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
            60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
            65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
            200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
            52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
            207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
            119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
            218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
            81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
            184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
            222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ],

        // רעש פרלין פשוט
        perlin: function(x, y, z = 0) {
            const p = [...this.permutation, ...this.permutation];
            
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            const Z = Math.floor(z) & 255;
            
            x -= Math.floor(x);
            y -= Math.floor(y);
            z -= Math.floor(z);
            
            const u = this.fade(x);
            const v = this.fade(y);
            const w = this.fade(z);
            
            const A = p[X] + Y;
            const AA = p[A] + Z;
            const AB = p[A + 1] + Z;
            const B = p[X + 1] + Y;
            const BA = p[B] + Z;
            const BB = p[B + 1] + Z;
            
            return MathUtils.lerp(
                MathUtils.lerp(
                    MathUtils.lerp(this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z), u),
                    MathUtils.lerp(this.grad(p[AB], x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z), u),
                    v
                ),
                MathUtils.lerp(
                    MathUtils.lerp(this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1), u),
                    MathUtils.lerp(this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1), u),
                    v
                ),
                w
            );
        },

        fade: function(t) {
            return t * t * t * (t * (t * 6 - 15) + 10);
        },

        grad: function(hash, x, y, z) {
            const h = hash & 15;
            const u = h < 8 ? x : y;
            const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        },

        // רעש פרקטלי (מרובה אוקטבות)
        fractalNoise: function(x, y, z = 0, octaves = 4, persistence = 0.5, scale = 0.1) {
            let value = 0;
            let amplitude = 1;
            let frequency = scale;
            let maxValue = 0;

            for (let i = 0; i < octaves; i++) {
                value += this.perlin(x * frequency, y * frequency, z * frequency) * amplitude;
                maxValue += amplitude;
                amplitude *= persistence;
                frequency *= 2;
            }

            return value / maxValue;
        },

        // רעש Simplex (אלטרנטיבה מהירה יותר לפרלין)
        simplex: function(x, y) {
            const F2 = 0.5 * (Math.sqrt(3) - 1);
            const G2 = (3 - Math.sqrt(3)) / 6;

            const s = (x + y) * F2;
            const i = Math.floor(x + s);
            const j = Math.floor(y + s);

            const t = (i + j) * G2;
            const X0 = i - t;
            const Y0 = j - t;
            const x0 = x - X0;
            const y0 = y - Y0;

            let i1, j1;
            if (x0 > y0) {
                i1 = 1;
                j1 = 0;
            } else {
                i1 = 0;
                j1 = 1;
            }

            const x1 = x0 - i1 + G2;
            const y1 = y0 - j1 + G2;
            const x2 = x0 - 1 + 2 * G2;
            const y2 = y0 - 1 + 2 * G2;

            const ii = i & 255;
            const jj = j & 255;
            const gi0 = this.permutation[ii + this.permutation[jj]] % 12;
            const gi1 = this.permutation[ii + i1 + this.permutation[jj + j1]] % 12;
            const gi2 = this.permutation[ii + 1 + this.permutation[jj + 1]] % 12;

            let t0 = 0.5 - x0 * x0 - y0 * y0;
            let n0 = 0;
            if (t0 >= 0) {
                t0 *= t0;
                n0 = t0 * t0 * this.dot2(this.grad3[gi0], x0, y0);
            }

            let t1 = 0.5 - x1 * x1 - y1 * y1;
            let n1 = 0;
            if (t1 >= 0) {
                t1 *= t1;
                n1 = t1 * t1 * this.dot2(this.grad3[gi1], x1, y1);
            }

            let t2 = 0.5 - x2 * x2 - y2 * y2;
            let n2 = 0;
            if (t2 >= 0) {
                t2 *= t2;
                n2 = t2 * t2 * this.dot2(this.grad3[gi2], x2, y2);
            }

            return 70 * (n0 + n1 + n2);
        },

        grad3: [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ],

        dot2: function(g, x, y) {
            return g[0] * x + g[1] * y;
        },

        // רעש Worley (Voronoi noise)
        worley: function(x, y, numPoints = 10, distance = 'euclidean') {
            let minDist = Infinity;
            let secondMinDist = Infinity;

            for (let i = 0; i < numPoints; i++) {
                const px = Math.random();
                const py = Math.random();
                
                let dist;
                switch (distance) {
                    case 'euclidean':
                        dist = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
                        break;
                    case 'manhattan':
                        dist = Math.abs(x - px) + Math.abs(y - py);
                        break;
                    case 'chebyshev':
                        dist = Math.max(Math.abs(x - px), Math.abs(y - py));
                        break;
                    default:
                        dist = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
                }

                if (dist < minDist) {
                    secondMinDist = minDist;
                    minDist = dist;
                } else if (dist < secondMinDist) {
                    secondMinDist = dist;
                }
            }

            return { F1: minDist, F2: secondMinDist, difference: secondMinDist - minDist };
        }
    },

    // פונקציות לחישוב זמנים אסטרונומיים
    time: {
        // המרת ימי יוליאני לתאריך
        julianToDate: function(julianDay) {
            const a = Math.floor(julianDay + 0.5);
            const b = a + 1537;
            const c = Math.floor((b - 122.1) / 365.25);
            const d = Math.floor(365.25 * c);
            const e = Math.floor((b - d) / 30.6001);
            
            const day = b - d - Math.floor(30.6001 * e);
            const month = e < 14 ? e - 1 : e - 13;
            const year = month > 2 ? c - 4716 : c - 4715;
            
            return new Date(year, month - 1, day);
        },

        // המרת תאריך לימי יוליאני
        dateToJulian: function(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            const a = Math.floor((14 - month) / 12);
            const y = year + 4800 - a;
            const m = month + 12 * a - 3;
            
            return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
                   Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        },

        // חישוב זמן סידרי
        siderealTime: function(julianDay, longitude = 0) {
            const T = (julianDay - 2451545.0) / 36525;
            let theta = 280.46061837 + 360.98564736629 * (julianDay - 2451545) + 
                       0.000387933 * T * T - T * T * T / 38710000;
            
            theta = MathUtils.normalizeAngle(MathUtils.degToRad(theta));
            return theta + MathUtils.degToRad(longitude);
        },

        // חישוב זמן עלות השמש
        sunriseTime: function(latitude, longitude, date) {
            const julianDay = this.dateToJulian(date);
            const solarDeclination = this.solarDeclination(julianDay);
            
            const hourAngle = Math.acos(-Math.tan(MathUtils.degToRad(latitude)) * 
                                       Math.tan(solarDeclination));
            
            return 12 - MathUtils.radToDeg(hourAngle) / 15;
        },

        // חישוב נטיית השמש
        solarDeclination: function(julianDay) {
            const n = julianDay - 2451545.0;
            const L = MathUtils.degToRad(280.460 + 0.9856474 * n);
            const g = MathUtils.degToRad(357.528 + 0.9856003 * n);
            const lambda = L + MathUtils.degToRad(1.915) * Math.sin(g) + 
                          MathUtils.degToRad(0.020) * Math.sin(2 * g);
            
            return Math.asin(Math.sin(MathUtils.degToRad(23.439)) * Math.sin(lambda));
        },

        // חישוב equation of time
        equationOfTime: function(julianDay) {
            const n = julianDay - 2451545.0;
            const L = MathUtils.degToRad(280.460 + 0.9856474 * n);
            const g = MathUtils.degToRad(357.528 + 0.9856003 * n);
            const lambda = L + MathUtils.degToRad(1.915) * Math.sin(g) + 
                          MathUtils.degToRad(0.020) * Math.sin(2 * g);
            
            const alpha = Math.atan2(Math.cos(MathUtils.degToRad(23.439)) * Math.sin(lambda), Math.cos(lambda));
            const E = L - alpha;
            
            return MathUtils.radToDeg(E) * 4; // בדקות
        },

        // חישוב זמן שקיעת השמש
        sunsetTime: function(latitude, longitude, date) {
            const sunrise = this.sunriseTime(latitude, longitude, date);
            return 24 - sunrise;
        },

        // חישוב אורך היום
        dayLength: function(latitude, date) {
            const julianDay = this.dateToJulian(date);
            const solarDeclination = this.solarDeclination(julianDay);
            
            const hourAngle = Math.acos(-Math.tan(MathUtils.degToRad(latitude)) * 
                                       Math.tan(solarDeclination));
            
            return 2 * MathUtils.radToDeg(hourAngle) / 15; // בשעות
        }
    },

    // פונקציות לחישוב מסלולים
    orbits: {
        // חישוב אלמנטים אורביטליים קפלריים
        keplerianElements: function(planet, time) {
            const data = PLANETS_DATA[planet];
            if (!data) return null;

            const period = data.orbitalPeriod || 365.25;
            const distance = data.distance || 149.6e6;
            const eccentricity = data.eccentricity || 0;
            const inclination = MathUtils.degToRad(data.inclination || 0);
            
            return {
                semiMajorAxis: distance,
                eccentricity: eccentricity,
                inclination: inclination,
                meanAnomaly: (time / period) * MathUtils.TWO_PI,
                period: period,
                argumentOfPeriapsis: MathUtils.degToRad(data.argumentOfPeriapsis || 0),
                longitudeOfAscendingNode: MathUtils.degToRad(data.longitudeOfAscendingNode || 0)
            };
        },

        // חישוב מיקום תלת ממדי
        calculate3DPosition: function(elements, scale = 1) {
            const E = MathUtils.solveKeplerEquation(elements.meanAnomaly, elements.eccentricity);
            const nu = MathUtils.eccentricToTrueAnomaly(E, elements.eccentricity);
            
            const r = elements.semiMajorAxis * (1 - elements.eccentricity * Math.cos(E));
            
            // מיקום במישור המסלול
            const xOrbit = r * Math.cos(nu);
            const yOrbit = r * Math.sin(nu);
            
            // סיבובים לקואורדינטות אקליפטיות
            const cosOmega = Math.cos(elements.longitudeOfAscendingNode);
            const sinOmega = Math.sin(elements.longitudeOfAscendingNode);
            const cosI = Math.cos(elements.inclination);
            const sinI = Math.sin(elements.inclination);
            const cosW = Math.cos(elements.argumentOfPeriapsis);
            const sinW = Math.sin(elements.argumentOfPeriapsis);
            
            const P11 = cosOmega * cosW - sinOmega * sinW * cosI;
            const P12 = -cosOmega * sinW - sinOmega * cosW * cosI;
            const P21 = sinOmega * cosW + cosOmega * sinW * cosI;
            const P22 = -sinOmega * sinW + cosOmega * cosW * cosI;
            const P31 = sinW * sinI;
            const P32 = cosW * sinI;
            
            const x = (P11 * xOrbit + P12 * yOrbit) * scale;
            const y = (P31 * xOrbit + P32 * yOrbit) * scale;
            const z = (P21 * xOrbit + P22 * yOrbit) * scale;
            
            return { x, y, z };
        },

        // חישוב מהירות אורביטלית
        orbitalVelocity: function(distance, centralMass = 1.989e30) {
            const G = 6.67430e-11;
            return Math.sqrt(G * centralMass / (distance * 1000));
        },

        // חישוב תקופת מסלול (חוק שלישי של קפלר)
        orbitalPeriod: function(semiMajorAxis, centralMass = 1.989e30) {
            const G = 6.67430e-11;
            return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis * 1000, 3) / (G * centralMass));
        },

        // חישוב אנרגיה אורביטלית
        orbitalEnergy: function(mass, semiMajorAxis, centralMass = 1.989e30) {
            const G = 6.67430e-11;
            return -G * centralMass * mass / (2 * semiMajorAxis * 1000);
        },

        // חישוב מהירות הבריחה ממסלול
        escapeVelocityFromOrbit: function(orbitalVelocity) {
            return orbitalVelocity * Math.sqrt(2);
        }
    },

    // פונקציות עזר לאנימציה
    animation: {
        // יצירת tweener פשוט
        createTween: function(from, to, duration, easingFunction = MathUtils.easing.linear) {
            return {
                from: from,
                to: to,
                duration: duration,
                easing: easingFunction,
                startTime: null,
                
                update: function(currentTime) {
                    if (this.startTime === null) {
                        this.startTime = currentTime;
                    }
                    
                    const elapsed = currentTime - this.startTime;
                    const progress = MathUtils.clamp(elapsed / this.duration, 0, 1);
                    const easedProgress = this.easing(progress);
                    
                    return MathUtils.lerp(this.from, this.to, easedProgress);
                },
                
                isComplete: function(currentTime) {
                    if (this.startTime === null) return false;
                    return (currentTime - this.startTime) >= this.duration;
                }
            };
        },

        // spring animation (אנימציית קפיץ)
        spring: function(current, target, velocity, stiffness = 0.1, damping = 0.8) {
            const force = (target - current) * stiffness;
            velocity = (velocity + force) * damping;
            const newValue = current + velocity;
            
            return {
                value: newValue,
                velocity: velocity,
                isAtRest: Math.abs(velocity) < 0.01 && Math.abs(target - newValue) < 0.01
            };
        },

        // אנימציית bezier curve
        bezierCurve: function(t, p0, p1, p2, p3) {
            const oneMinusT = 1 - t;
            const oneMinusTSquared = oneMinusT * oneMinusT;
            const oneMinusTCubed = oneMinusTSquared * oneMinusT;
            const tSquared = t * t;
            const tCubed = tSquared * t;
            
            return oneMinusTCubed * p0 + 
                   3 * oneMinusTSquared * t * p1 + 
                   3 * oneMinusT * tSquared * p2 + 
                   tCubed * p3;
        },

        // catmull-rom spline
        catmullRom: function(t, p0, p1, p2, p3) {
            const t2 = t * t;
            const t3 = t2 * t;
            
            return 0.5 * (
                (2 * p1) +
                (-p0 + p2) * t +
                (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                (-p0 + 3 * p1 - 3 * p2 + p3) * t3
            );
        }
    },

    // פונקציות למיפוי ונרמליזציה
    mapping: {
        // מיפוי ערך מטווח אחד לטווח אחר
        map: function(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },

        // נרמליזציה לטווח 0-1
        normalize: function(value, min, max) {
            return (value - min) / (max - min);
        },

        // חזרה מנרמליזציה
        denormalize: function(normalizedValue, min, max) {
            return normalizedValue * (max - min) + min;
        },

        // מיפוי עם clamping
        mapClamped: function(value, inMin, inMax, outMin, outMax) {
            const mapped = this.map(value, inMin, inMax, outMin, outMax);
            return MathUtils.clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax));
        },

        // מיפוי עם easing
        mapEased: function(value, inMin, inMax, outMin, outMax, easingFunction = MathUtils.easing.linear) {
            const normalized = this.normalize(value, inMin, inMax);
            const eased = easingFunction(MathUtils.clamp(normalized, 0, 1));
            return this.denormalize(eased, outMin, outMax);
        }
    },

    // פונקציות טריגונומטריות מתקדמות
    trigonometry: {
        // חישוב זווית בין שני וקטורים
        angleBetweenVectors: function(v1, v2) {
            const dot = MathUtils.vector3.dot(v1, v2);
            const mag1 = MathUtils.vector3.length(v1);
            const mag2 = MathUtils.vector3.length(v2);
            
            return Math.acos(MathUtils.clamp(dot / (mag1 * mag2), -1, 1));
        },

        // רוטציה של נקודה סביב ציר
        rotatePointAroundAxis: function(point, axis, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const oneMinusCos = 1 - cos;
            
            const x = point.x;
            const y = point.y;
            const z = point.z;
            
            const ax = axis.x;
            const ay = axis.y;
            const az = axis.z;
            
            return {
                x: (cos + ax * ax * oneMinusCos) * x + 
                   (ax * ay * oneMinusCos - az * sin) * y + 
                   (ax * az * oneMinusCos + ay * sin) * z,
                   
                y: (ay * ax * oneMinusCos + az * sin) * x + 
                   (cos + ay * ay * oneMinusCos) * y + 
                   (ay * az * oneMinusCos - ax * sin) * z,
                   
                z: (az * ax * oneMinusCos - ay * sin) * x + 
                   (az * ay * oneMinusCos + ax * sin) * y + 
                   (cos + az * az * oneMinusCos) * z
            };
        },

        // יצירת מטריצת רוטציה
        rotationMatrix: function(axis, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const oneMinusCos = 1 - cos;
            
            const x = axis.x;
            const y = axis.y;
            const z = axis.z;
            
            return [
                [cos + x*x*oneMinusCos, x*y*oneMinusCos - z*sin, x*z*oneMinusCos + y*sin],
                [y*x*oneMinusCos + z*sin, cos + y*y*oneMinusCos, y*z*oneMinusCos - x*sin],
                [z*x*oneMinusCos - y*sin, z*y*oneMinusCos + x*sin, cos + z*z*oneMinusCos]
            ];
        },

        // חישוב Euler angles מקווטרניון
        quaternionToEuler: function(qx, qy, qz, qw) {
            const test = qx*qy + qz*qw;
            
            if (test > 0.499) { // סינגולריות בקוטב הצפוני
                return {
                    x: 2 * Math.atan2(qx, qw),
                    y: Math.PI / 2,
                    z: 0
                };
            }
            
            if (test < -0.499) { // סינגולריות בקוטב הדרומי
                return {
                    x: -2 * Math.atan2(qx, qw),
                    y: -Math.PI / 2,
                    z: 0
                };
            }
            
            const sqx = qx * qx;
            const sqy = qy * qy;
            const sqz = qz * qz;
            
            return {
                x: Math.atan2(2*qy*qw - 2*qx*qz, 1 - 2*sqy - 2*sqz),
                y: Math.asin(2*test),
                z: Math.atan2(2*qx*qw - 2*qy*qz, 1 - 2*sqx - 2*sqz)
            };
        },

        // המרת Euler angles לקווטרניון
        eulerToQuaternion: function(x, y, z) {
            const cx = Math.cos(x * 0.5);
            const cy = Math.cos(y * 0.5);
            const cz = Math.cos(z * 0.5);
            const sx = Math.sin(x * 0.5);
            const sy = Math.sin(y * 0.5);
            const sz = Math.sin(z * 0.5);
            
            return {
                w: cx * cy * cz + sx * sy * sz,
                x: sx * cy * cz - cx * sy * sz,
                y: cx * sy * cz + sx * cy * sz,
                z: cx * cy * sz - sx * sy * cz
            };
        }
    },

    // פונקציות סטטיסטיות
    statistics: {
        average: function(values) {
            return values.reduce((sum, value) => sum + value, 0) / values.length;
        },

        median: function(values) {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0 ? 
                   (sorted[mid - 1] + sorted[mid]) / 2 : 
                   sorted[mid];
        },

        mode: function(values) {
            const frequency = {};
            let maxFreq = 0;
            let mode = values[0];
            
            for (const value of values) {
                frequency[value] = (frequency[value] || 0) + 1;
                if (frequency[value] > maxFreq) {
                    maxFreq = frequency[value];
                    mode = value;
                }
            }
            
            return mode;
        },

        standardDeviation: function(values) {
            const avg = this.average(values);
            const squaredDifferences = values.map(value => Math.pow(value - avg, 2));
            const avgSquaredDiff = this.average(squaredDifferences);
            return Math.sqrt(avgSquaredDiff);
        },

        variance: function(values) {
            const avg = this.average(values);
            const squaredDifferences = values.map(value => Math.pow(value - avg, 2));
            return this.average(squaredDifferences);
        },

        range: function(values) {
            return Math.max(...values) - Math.min(...values);
        },

        percentile: function(values, percentile) {
            const sorted = [...values].sort((a, b) => a - b);
            const index = (percentile / 100) * (sorted.length - 1);
            
            if (Math.floor(index) === index) {
                return sorted[index];
            }
            
            const lower = sorted[Math.floor(index)];
            const upper = sorted[Math.ceil(index)];
            const weight = index - Math.floor(index);
            
            return lower + (upper - lower) * weight;
        },

        correlation: function(x, y) {
            if (x.length !== y.length) return 0;
            
            const n = x.length;
            const avgX = this.average(x);
            const avgY = this.average(y);
            
            let numerator = 0;
            let denomX = 0;
            let denomY = 0;
            
            for (let i = 0; i < n; i++) {
                const deltaX = x[i] - avgX;
                const deltaY = y[i] - avgY;
                
                numerator += deltaX * deltaY;
                denomX += deltaX * deltaX;
                denomY += deltaY * deltaY;
            }
            
            const denominator = Math.sqrt(denomX * denomY);
            return denominator === 0 ? 0 : numerator / denominator;
        }
    },

    // פונקציות אקראיות מתקדמות
    random: {
        // מספר אקראי בטווח
        range: function(min, max) {
            return Math.random() * (max - min) + min;
        },

        // מספר שלם אקראי בטווח
        int: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        // בחירה אקראית מערך
        choice: function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },

        // ערבוב מערך (Fisher-Yates shuffle)
        shuffle: function(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // וקטור אקראי על כדור יחידה
        onUnitSphere: function() {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            return {
                x: Math.sin(phi) * Math.cos(theta),
                y: Math.sin(phi) * Math.sin(theta),
                z: Math.cos(phi)
            };
        },

        // נקודה אקראית בתוך עיגול
        insideCircle: function(radius = 1) {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random()) * radius;
            
            return {
                x: r * Math.cos(angle),
                y: r * Math.sin(angle)
            };
        },

        // התפלגות גאוסיאנית (נורמלית)
        gaussian: function(mean = 0, standardDeviation = 1) {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            
            const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
            return z * standardDeviation + mean;
        },

        // התפלגות מעריכית
        exponential: function(lambda = 1) {
            return -Math.log(1 - Math.random()) / lambda;
        },

        // התפלגות פרטו
        pareto: function(alpha = 1, xm = 1) {
            return xm / Math.pow(Math.random(), 1 / alpha);
        },

        // רעש Perlin מהיר
        noise1D: function(x, seed = 0) {
            let n = Math.sin(x + seed) * 43758.5453;
            return n - Math.floor(n);
        },

        // מחולל מספרים פסבדו-אקראיים עם seed
        seededRandom: function(seed) {
            let s = seed;
            return function() {
                s = Math.sin(s) * 10000;
                return s - Math.floor(s);
            };
        },

        // בחירה משוקללת
        weightedChoice: function(items, weights) {
            if (items.length !== weights.length) {
                throw new Error('Items and weights arrays must have the same length');
            }
            
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < items.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    return items[i];
                }
            }
            
            return items[items.length - 1];
        }
    },

    // פונקציות גיאומטריות
    geometry: {
        // בדיקת חיתוך בין שני מעגלים
        circleIntersection: function(c1x, c1y, r1, c2x, c2y, r2) {
            const dx = c2x - c1x;
            const dy = c2y - c1y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // אין חיתוך אם המעגלים רחוקים מדי או אחד בתוך השני
            if (distance > r1 + r2 || distance < Math.abs(r1 - r2) || distance === 0) {
                return null;
            }
            
            const a = (r1 * r1 - r2 * r2 + distance * distance) / (2 * distance);
            const h = Math.sqrt(r1 * r1 - a * a);
            
            const px = c1x + a * dx / distance;
            const py = c1y + a * dy / distance;
            
            return [
                { x: px + h * dy / distance, y: py - h * dx / distance },
                { x: px - h * dy / distance, y: py + h * dx / distance }
            ];
        },

        // בדיקת נקודה בתוך מעגל
        pointInCircle: function(px, py, cx, cy, radius) {
            const dx = px - cx;
            const dy = py - cy;
            return dx * dx + dy * dy <= radius * radius;
        },

        // בדיקת נקודה בתוך מלבן
        pointInRectangle: function(px, py, rx, ry, width, height) {
            return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
        },

        // חישוב שטח משולש
        triangleArea: function(x1, y1, x2, y2, x3, y3) {
            return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
        },

        // בדיקת נקודה בתוך משולש
        pointInTriangle: function(px, py, x1, y1, x2, y2, x3, y3) {
            const area = this.triangleArea(x1, y1, x2, y2, x3, y3);
            const area1 = this.triangleArea(px, py, x2, y2, x3, y3);
            const area2 = this.triangleArea(x1, y1, px, py, x3, y3);
            const area3 = this.triangleArea(x1, y1, x2, y2, px, py);
            
            return Math.abs(area - (area1 + area2 + area3)) < 1e-10;
        },

        // חישוב מרחק מנקודה לקו
        pointToLineDistance: function(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            
            if (lenSq === 0) return Math.sqrt(A * A + B * B);
            
            const param = dot / lenSq;
            
            let xx, yy;
            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
            
            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // חישוב היקף מעגל
        circleCircumference: function(radius) {
            return 2 * Math.PI * radius;
        },

        // חישוב שטח מעגל
        circleArea: function(radius) {
            return Math.PI * radius * radius;
        },

        // חישוב נפח כדור
        sphereVolume: function(radius) {
            return (4 / 3) * Math.PI * radius * radius * radius;
        },

        // חישוב שטח פני כדור
        sphereSurfaceArea: function(radius) {
            return 4 * Math.PI * radius * radius;
        }
    }
};

// ייצוא למודולים אחרים
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
}
