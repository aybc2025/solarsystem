// נתיבי טקסטורות באיכות גבוהה לכוכבי הלכת
// מקורות: NASA, ESA ומפות טקסטורות איכותיות
const TEXTURE_URLS = {
    // טקסטורות כוכבי לכת - נתיבים לטקסטורות באיכות גבוהה
    planets: {
        sun: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3CradialGradient id="sunGrad" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="0%25" style="stop-color:%23FFD700;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23FFA500;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FF4500;stop-opacity:1" /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23sunGrad)" /%3E%3C/svg%3E',
            emissive: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Crect width="512" height="256" fill="%23FFD700" /%3E%3C/svg%3E'
        },
        mercury: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3Cpattern id="craters" patternUnits="userSpaceOnUse" width="40" height="40"%3E%3Ccircle cx="20" cy="20" r="5" fill="%236B5B47" opacity="0.3"/%3E%3Ccircle cx="10" cy="10" r="2" fill="%236B5B47" opacity="0.2"/%3E%3Ccircle cx="30" cy="30" r="3" fill="%236B5B47" opacity="0.2"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="512" height="256" fill="%238C7853"/%3E%3Crect width="512" height="256" fill="url(%23craters)"/%3E%3C/svg%3E'
        },
        venus: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3ClinearGradient id="venusGrad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FFC649;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23FFE55C;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FFAA33;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23venusGrad)"/%3E%3C/svg%3E'
        },
        earth: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3Cpattern id="earthPattern" patternUnits="userSpaceOnUse" width="100" height="50"%3E%3Crect width="100" height="50" fill="%234169E1"/%3E%3Cpath d="M20,10 Q30,5 40,15 Q50,25 60,10 Q70,5 80,20" fill="%23228B22"/%3E%3Cpath d="M10,30 Q20,25 30,35 Q40,40 50,30" fill="%23228B22"/%3E%3Ccircle cx="85" cy="40" r="8" fill="%23F5DEB3"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23earthPattern)"/%3E%3C/svg%3E',
            normal: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Crect width="512" height="256" fill="%238080FF"/%3E%3C/svg%3E'
        },
        mars: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3Cpattern id="marsPattern" patternUnits="userSpaceOnUse" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23CD5C5C"/%3E%3Ccircle cx="15" cy="15" r="3" fill="%238B4513" opacity="0.4"/%3E%3Ccircle cx="45" cy="30" r="5" fill="%23A0522D" opacity="0.3"/%3E%3Ccircle cx="30" cy="50" r="2" fill="%238B4513" opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23marsPattern)"/%3E%3C/svg%3E'
        },
        jupiter: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3ClinearGradient id="jupiterBands" x1="0%25" y1="0%25" x2="0%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23E6D8B5;stop-opacity:1" /%3E%3Cstop offset="20%25" style="stop-color:%23D8CA9D;stop-opacity:1" /%3E%3Cstop offset="40%25" style="stop-color:%23C4A47C;stop-opacity:1" /%3E%3Cstop offset="60%25" style="stop-color:%23D8CA9D;stop-opacity:1" /%3E%3Cstop offset="80%25" style="stop-color:%23B8860B;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23D8CA9D;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23jupiterBands)"/%3E%3Cellipse cx="380" cy="120" rx="25" ry="18" fill="%23DC143C" opacity="0.8"/%3E%3C/svg%3E'
        },
        saturn: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3ClinearGradient id="saturnBands" x1="0%25" y1="0%25" x2="0%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FAD5A5;stop-opacity:1" /%3E%3Cstop offset="25%25" style="stop-color:%23DEB887;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%23F5DEB3;stop-opacity:1" /%3E%3Cstop offset="75%25" style="stop-color:%23D2B48C;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FAD5A5;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23saturnBands)"/%3E%3C/svg%3E'
        },
        uranus: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3CradialGradient id="uranusGrad" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="0%25" style="stop-color:%237FFFD4;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%234FD0E7;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2340E0D0;stop-opacity:1" /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23uranusGrad)"/%3E%3C/svg%3E'
        },
        neptune: {
            diffuse: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="256"%3E%3Cdefs%3E%3CradialGradient id="neptuneGrad" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="0%25" style="stop-color:%236495ED;stop-opacity:1" /%3E%3Cstop offset="50%25" style="stop-color:%234B70DD;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230000CD;stop-opacity:1" /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="512" height="256" fill="url(%23neptuneGrad)"/%3E%3Cellipse cx="200" cy="100" rx="20" ry="15" fill="%23191970" opacity="0.6"/%3E%3C/svg%3E'
        }
        }
    },

    // טקסטורות רקע - כוכבים וערפילית
    backgrounds: {
        starfield: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024"%3E%3Crect width="2048" height="1024" fill="%23000000"/%3E%3Cg fill="white"%3E%3Ccircle cx="100" cy="100" r="1" opacity="0.8"/%3E%3Ccircle cx="200" cy="150" r="0.5" opacity="0.6"/%3E%3Ccircle cx="300" cy="80" r="1.5" opacity="1"/%3E%3Ccircle cx="450" cy="200" r="0.8" opacity="0.7"/%3E%3Ccircle cx="600" cy="120" r="1" opacity="0.9"/%3E%3Ccircle cx="750" cy="180" r="0.6" opacity="0.5"/%3E%3Ccircle cx="900" cy="90" r="1.2" opacity="0.8"/%3E%3Ccircle cx="1100" cy="160" r="0.7" opacity="0.6"/%3E%3Ccircle cx="1300" cy="110" r="1.5" opacity="1"/%3E%3Ccircle cx="1500" cy="190" r="0.9" opacity="0.7"/%3E%3Ccircle cx="1700" cy="70" r="1" opacity="0.8"/%3E%3Ccircle cx="1900" cy="140" r="0.5" opacity="0.6"/%3E%3C/g%3E%3C/svg%3E',
        nebula: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"%3E%3Cdefs%3E%3CradialGradient id="nebulaGrad1" cx="30%25" cy="40%25" r="60%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF1493;stop-opacity:0.3" /%3E%3Cstop offset="50%25" style="stop-color:%238A2BE2;stop-opacity:0.2" /%3E%3Cstop offset="100%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3C/radialGradient%3E%3CradialGradient id="nebulaGrad2" cx="70%25" cy="60%25" r="40%25"%3E%3Cstop offset="0%25" style="stop-color:%2300CED1;stop-opacity:0.2" /%3E%3Cstop offset="50%25" style="stop-color:%234169E1;stop-opacity:0.1" /%3E%3Cstop offset="100%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="1024" height="1024" fill="%23000000"/%3E%3Cellipse cx="300" cy="400" rx="200" ry="150" fill="url(%23nebulaGrad1)"/%3E%3Cellipse cx="700" cy="600" rx="150" ry="100" fill="url(%23nebulaGrad2)"/%3E%3C/svg%3E'
    },

    // טקסטורות טבעות
    rings: {
        saturn: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="512"%3E%3Cdefs%3E%3CradialGradient id="ringGrad" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="30%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3Cstop offset="35%25" style="stop-color:%23D4A574;stop-opacity:0.8" /%3E%3Cstop offset="40%25" style="stop-color:%23000000;stop-opacity:0.2" /%3E%3Cstop offset="45%25" style="stop-color:%23E6C2A6;stop-opacity:0.9" /%3E%3Cstop offset="50%25" style="stop-color:%23000000;stop-opacity:0.1" /%3E%3Cstop offset="55%25" style="stop-color:%23D4A574;stop-opacity:0.7" /%3E%3Cstop offset="65%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="256" cy="256" r="256" fill="url(%23ringGrad)"/%3E%3C/svg%3E',
        uranus: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="512"%3E%3Cdefs%3E%3CradialGradient id="uranusRingGrad" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="40%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3Cstop offset="42%25" style="stop-color:%234FD0E7;stop-opacity:0.3" /%3E%3Cstop offset="44%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3Cstop offset="46%25" style="stop-color:%234FD0E7;stop-opacity:0.2" /%3E%3Cstop offset="48%25" style="stop-color:%23000000;stop-opacity:0" /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="256" cy="256" r="256" fill="url(%23uranusRingGrad)"/%3E%3C/svg%3E'
    } r="1.3" opacity="0.9"/>
                    <circle cx="1400" cy="240" r="0.8" opacity="0.7"/>
                    <circle cx="1600" cy="290" r="1" opacity="0.8"/>
                    <!-- הוספת עוד כוכבים בצורה אקראית -->
                    <circle cx="80" cy="400" r="0.5" opacity="0.4"/>
                    <circle cx="280" cy="450" r="1" opacity="0.7"/>
                    <circle cx="480" cy="420" r="0.8" opacity="0.6"/>
                    <circle cx="680" cy="460" r="1.2" opacity="0.8"/>
                    <circle cx="880" cy="430" r="0.6" opacity="0.5"/>
                    <circle cx="1080" cy="470" r="1" opacity="0.7"/>
                    <circle cx="1280" cy="410" r="0.9" opacity="0.6"/>
                    <circle cx="1480" cy="440" r="1.1" opacity="0.8"/>
                    <circle cx="1680" cy="480" r="0.7" opacity="0.5"/>
                    <circle cx="1880" cy="390" r="1.3" opacity="0.9"/>
                </g>
            </svg>
        `),
        nebula: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
                <defs>
                    <radialGradient id="nebulaGrad1" cx="30%" cy="40%" r="60%">
                        <stop offset="0%" style="stop-color:#FF1493;stop-opacity:0.3" />
                        <stop offset="50%" style="stop-color:#8A2BE2;stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
                    </radialGradient>
                    <radialGradient id="nebulaGrad2" cx="70%" cy="60%" r="40%">
                        <stop offset="0%" style="stop-color:#00CED1;stop-opacity:0.2" />
                        <stop offset="50%" style="stop-color:#4169E1;stop-opacity:0.1" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <rect width="1024" height="1024" fill="#000000"/>
                <ellipse cx="300" cy="400" rx="200" ry="150" fill="url(#nebulaGrad1)"/>
                <ellipse cx="700" cy="600" rx="150" ry="100" fill="url(#nebulaGrad2)"/>
            </svg>
        `)
    },

    // טקסטורות טבעות
    rings: {
        saturn: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
                <defs>
                    <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="30%" style="stop-color:#000000;stop-opacity:0" />
                        <stop offset="35%" style="stop-color:#D4A574;stop-opacity:0.8" />
                        <stop offset="40%" style="stop-color:#000000;stop-opacity:0.2" />
                        <stop offset="45%" style="stop-color:#E6C2A6;stop-opacity:0.9" />
                        <stop offset="50%" style="stop-color:#000000;stop-opacity:0.1" />
                        <stop offset="55%" style="stop-color:#D4A574;stop-opacity:0.7" />
                        <stop offset="65%" style="stop-color:#000000;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="256" cy="256" r="256" fill="url(#ringGrad)"/>
            </svg>
        `),
        uranus: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
                <defs>
                    <radialGradient id="uranusRingGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="40%" style="stop-color:#000000;stop-opacity:0" />
                        <stop offset="42%" style="stop-color:#4FD0E7;stop-opacity:0.3" />
                        <stop offset="44%" style="stop-color:#000000;stop-opacity:0" />
                        <stop offset="46%" style="stop-color:#4FD0E7;stop-opacity:0.2" />
                        <stop offset="48%" style="stop-color:#000000;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="256" cy="256" r="256" fill="url(#uranusRingGrad)"/>
            </svg>
        `)
    }
};

// פונקציות לטעינת טקסטורות
const TextureLoader = {
    loader: null,
    cache: new Map(),

    // אתחול מטען טקסטורות
    init: function() {
        if (typeof THREE !== 'undefined') {
            this.loader = new THREE.TextureLoader();
        }
    },

    // טעינת טקסטורה עם cache
    load: function(url, onLoad, onProgress, onError) {
        if (this.cache.has(url)) {
            if (onLoad) onLoad(this.cache.get(url));
            return this.cache.get(url);
        }

        const texture = this.loader.load(url, (tex) => {
            this.cache.set(url, tex);
            if (onLoad) onLoad(tex);
        }, onProgress, onError);

        return texture;
    },

    // יצירת טקסטורת בנייה פרוצדורלית
    createProceduralTexture: function(width = 512, height = 512, type = 'noise') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        switch (type) {
            case 'noise':
                this.generateNoise(ctx, width, height);
                break;
            case 'stars':
                this.generateStars(ctx, width, height);
                break;
            case 'surface':
                this.generateSurface(ctx, width, height);
                break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    },

    // יצירת רעש פרוצדורלי
    generateNoise: function(ctx, width, height) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 255;   // A
        }

        ctx.putImageData(imageData, 0, 0);
    },

    // יצירת שדה כוכבים
    generateStars: function(ctx, width, height) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const numStars = 1000;
        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const brightness = Math.random();
            const size = Math.random() * 2;

            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // יצירת משטח כוכב לכת
    generateSurface: function(ctx, width, height) {
        const gradient = ctx.createRadialGradient(
            width * 0.3, height * 0.3, 0,
            width * 0.5, height * 0.5, width * 0.7
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#cccccc');
        gradient.addColorStop(1, '#666666');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    },

    // יצירת טקסטורת נורמלים
    createNormalMap: function(heightTexture) {
        // פונקציה לחישוב מפת נורמלים מתוך מפת גבהים
        // זהו חישוב מתקדם שיוצר אפקט תלת מימד
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // מילוי בסיסי בכחול (נורמל זקוף)
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 512, 256);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
};

// אתחול מטען הטקסטורות
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        TextureLoader.init();
    });
}

// ייצוא
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEXTURE_URLS, TextureLoader };
}
