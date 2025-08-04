// מערכת תאורה מתקדמת למערכת השמש
class SolarSystemLights {
    constructor() {
        this.lights = new Map();
        this.scene = null;
        this.isInitialized = false;
        
        // הגדרות תאורה
        this.settings = {
            sunIntensity: 1.5,
            ambientIntensity: 0.15,
            shadowsEnabled: true,
            dynamicShadows: true,
            atmosphereEnabled: true
        };
        
        // מצבי תאורה שונים
        this.lightingModes = {
            REALISTIC: 'realistic',
            ENHANCED: 'enhanced',
            EDUCATIONAL: 'educational',
            CINEMATIC: 'cinematic'
        };
        
        this.currentMode = this.lightingModes.ENHANCED;
        
        // אנימציות תאורה
        this.animations = {
            sunPulse: {
                enabled: true,
                frequency: 0.001,
                amplitude: 0.2
            },
            coronaEffect: {
                enabled: true,
                particles: null,
                geometry: null,
                material: null
            }
        };
    }

    // אתחול מערכת התאורה
    async init(scene) {
        try {
            this.scene = scene;
            
            // יצירת תאורת השמש הראשית
            await this.createSunLight();
            
            // יצירת תאורה סביבתית
            await this.createAmbientLight();
            
            // יצירת תאורה אטמוספרית
            await this.createAtmosphericLights();
            
            // יצירת אפקטי קורונה
            await this.createCoronaEffects();
            
            // יצירת תאורה דינמית
            await this.setupDynamicLighting();
            
            this.isInitialized = true;
            console.log('Solar System Lights initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize lighting system:', error);
            throw error;
        }
    }

    // יצירת תאורת השמש הראשית
    async createSunLight() {
        // DirectionalLight עיקרי - מדמה את השמש
        const sunLight = new THREE.DirectionalLight(0xffffff, this.settings.sunIntensity);
        sunLight.position.set(0, 0, 0);
        sunLight.name = 'sunDirectionalLight';
        
        // הגדרות צללים מתקדמות
        if (this.settings.shadowsEnabled) {
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 4096;
            sunLight.shadow.mapSize.height = 4096;
            sunLight.shadow.camera.near = 0.1;
            sunLight.shadow.camera.far = 2000;
            sunLight.shadow.camera.left = -500;
            sunLight.shadow.camera.right = 500;
            sunLight.shadow.camera.top = 500;
            sunLight.shadow.camera.bottom = -500;
            sunLight.shadow.bias = -0.0001;
            sunLight.shadow.normalBias = 0.02;
            
            // הגדרות צל רך
            sunLight.shadow.radius = 10;
            sunLight.shadow.blurSamples = 25;
        }
        
        this.scene.add(sunLight);
        this.lights.set('sunDirectional', sunLight);
        
        // PointLight נוסף למרכז השמש לתאורה כדורית
        const sunPointLight = new THREE.PointLight(0xffd700, 0.8, 1000, 2);
        sunPointLight.position.set(0, 0, 0);
        sunPointLight.name = 'sunPointLight';
        
        this.scene.add(sunPointLight);
        this.lights.set('sunPoint', sunPointLight);
        
        // SpotLight לאפקטים דרמטיים
        const sunSpotLight = new THREE.SpotLight(0xffaa00, 0.3, 800, Math.PI / 6, 0.1, 2);
        sunSpotLight.position.set(0, 50, 0);
        sunSpotLight.target.position.set(0, 0, 0);
        sunSpotLight.name = 'sunSpotLight';
        
        this.scene.add(sunSpotLight);
        this.scene.add(sunSpotLight.target);
        this.lights.set('sunSpot', sunSpotLight);
    }

    // יצירת תאורה סביבתית
    async createAmbientLight() {
        // תאורה סביבתית בסיסית
        const ambientLight = new THREE.AmbientLight(0x404040, this.settings.ambientIntensity);
        ambientLight.name = 'ambientLight';
        
        this.scene.add(ambientLight);
        this.lights.set('ambient', ambientLight);
        
        // HemisphereLight לגרדיאנט שמיים-קרקע
        const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.1);
        hemisphereLight.position.set(0, 500, 0);
        hemisphereLight.name = 'hemisphereLight';
        
        this.scene.add(hemisphereLight);
        this.lights.set('hemisphere', hemisphereLight);
    }

    // יצירת תאורה אטמוספרית
    async createAtmosphericLights() {
        if (!this.settings.atmosphereEnabled) return;
        
        // אורות כחולים לדמיית אטמוספרה של כדור הארץ
        const earthAtmosphereLight = new THREE.DirectionalLight(0x87ceeb, 0.2);
        earthAtmosphereLight.position.set(-100, 50, 100);
        earthAtmosphereLight.name = 'earthAtmosphereLight';
        
        this.scene.add(earthAtmosphereLight);
        this.lights.set('earthAtmosphere', earthAtmosphereLight);
        
        // אור אדום לדמיית אטמוספרה של מאדים
        const marsAtmosphereLight = new THREE.DirectionalLight(0xff6b4a, 0.15);
        marsAtmosphereLight.position.set(200, 30, -150);
        marsAtmosphereLight.name = 'marsAtmosphereLight';
        
        this.scene.add(marsAtmosphereLight);
        this.lights.set('marsAtmosphere', marsAtmosphereLight);
    }

    // יצירת אפקטי קורונה
    async createCoronaEffects() {
        if (!this.animations.coronaEffect.enabled) return;
        
        // גיאומטריה לחלקיקי קורונה
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // יצירת חלקיקים סביב השמש
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // מיקום אקראי סביב השמש
            const radius = 15 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבעי קורונה - מזהב לכתום לאדום
            const intensity = 0.5 + Math.random() * 0.5;
            colors[i3] = 1.0 * intensity;     // R
            colors[i3 + 1] = 0.6 * intensity; // G
            colors[i3 + 2] = 0.2 * intensity; // B
            
            sizes[i] = 2 + Math.random() * 3;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // שיידר מותאם לקורונה
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.6 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float time;
                
                void main() {
                    vColor = color;
                    
                    // אנימציית פולסציה
                    float pulse = sin(time * 2.0 + position.x * 0.1) * 0.3 + 0.7;
                    vAlpha = pulse;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pulse * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                uniform float opacity;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = (1.0 - distance * 2.0) * vAlpha * opacity;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthTest: false
        });
        
        const corona = new THREE.Points(geometry, material);
        corona.name = 'sunCorona';
        
        this.scene.add(corona);
        this.animations.coronaEffect.particles = corona;
        this.animations.coronaEffect.geometry = geometry;
        this.animations.coronaEffect.material = material;
    }

    // הגדרת תאורה דינמית
    async setupDynamicLighting() {
        // יצירת מערכת תאורה המגיבה לתנועת כוכבי הלכת
        this.dynamicLights = {
            planetaryLights: new Map(),
            reflectionLights: new Map()
        };
        
        // תאורה עדינה לכל כוכב לכת גדול
        const majorPlanets = ['jupiter', 'saturn', 'uranus', 'neptune'];
        
        majorPlanets.forEach(planetName => {
            const planetLight = new THREE.PointLight(0x444444, 0.1, 100, 2);
            planetLight.name = `${planetName}Light`;
            
            this.scene.add(planetLight);
            this.dynamicLights.planetaryLights.set(planetName, planetLight);
        });
    }

    // עדכון מיקום השמש
    setSunPosition(position) {
        const sunDirectional = this.lights.get('sunDirectional');
        const sunPoint = this.lights.get('sunPoint');
        const sunSpot = this.lights.get('sunSpot');
        
        if (sunDirectional) {
            sunDirectional.position.copy(position);
        }
        
        if (sunPoint) {
            sunPoint.position.copy(position);
        }
        
        if (sunSpot) {
            sunSpot.position.copy(position);
            sunSpot.target.position.copy(position);
        }
        
        // עדכון קורונה
        if (this.animations.coronaEffect.particles) {
            this.animations.coronaEffect.particles.position.copy(position);
        }
    }

    // עדכון מיקום כוכב לכת
    updatePlanetPosition(planetName, position) {
        const planetLight = this.dynamicLights?.planetaryLights?.get(planetName);
        if (planetLight) {
            planetLight.position.copy(position);
        }
    }

    // שינוי מצב תאורה
    setLightingMode(mode) {
        this.currentMode = mode;
        
        switch (mode) {
            case this.lightingModes.REALISTIC:
                this.setRealisticLighting();
                break;
            case this.lightingModes.ENHANCED:
                this.setEnhancedLighting();
                break;
            case this.lightingModes.EDUCATIONAL:
                this.setEducationalLighting();
                break;
            case this.lightingModes.CINEMATIC:
                this.setCinematicLighting();
                break;
        }
    }

    // מצב תאורה ריאליסטי
    setRealisticLighting() {
        const sunDirectional = this.lights.get('sunDirectional');
        const ambient = this.lights.get('ambient');
        
        if (sunDirectional) {
            sunDirectional.intensity = 2.0;
            sunDirectional.color.setHex(0xffffff);
        }
        
        if (ambient) {
            ambient.intensity = 0.05; // תאורה סביבתית מינימלית
        }
        
        // הסתרת אפקטים לא ריאליסטיים
        if (this.animations.coronaEffect.particles) {
            this.animations.coronaEffect.particles.visible = false;
        }
    }

    // מצב תאורה משופר
    setEnhancedLighting() {
        const sunDirectional = this.lights.get('sunDirectional');
        const ambient = this.lights.get('ambient');
        
        if (sunDirectional) {
            sunDirectional.intensity = 1.5;
            sunDirectional.color.setHex(0xffffff);
        }
        
        if (ambient) {
            ambient.intensity = 0.15;
        }
        
        // הצגת אפקטים
        if (this.animations.coronaEffect.particles) {
            this.animations.coronaEffect.particles.visible = true;
        }
    }

    // מצב תאורה חינוכי
    setEducationalLighting() {
        const sunDirectional = this.lights.get('sunDirectional');
        const ambient = this.lights.get('ambient');
        
        if (sunDirectional) {
            sunDirectional.intensity = 1.2;
        }
        
        if (ambient) {
            ambient.intensity = 0.3; // תאורה גבוהה יותר לראות הכל
        }
        
        // הדגשת כוכבי לכת
        this.dynamicLights?.planetaryLights?.forEach(light => {
            light.intensity = 0.2;
        });
    }

    // מצב תאורה קולנועי
    setCinematicLighting() {
        const sunDirectional = this.lights.get('sunDirectional');
        const ambient = this.lights.get('ambient');
        
        if (sunDirectional) {
            sunDirectional.intensity = 2.5;
            sunDirectional.color.setHex(0xffa500); // כתום דרמטי
        }
        
        if (ambient) {
            ambient.intensity = 0.1;
        }
        
        // אפקטים דרמטיים
        const sunSpot = this.lights.get('sunSpot');
        if (sunSpot) {
            sunSpot.intensity = 0.8;
        }
    }

    // הגדרת עוצמת תאורה
    setIntensity(lightName, intensity) {
        const light = this.lights.get(lightName);
        if (light) {
            light.intensity = Math.max(0, Math.min(5, intensity));
        }
    }

    // הגדרת צבע תאורה
    setColor(lightName, color) {
        const light = this.lights.get(lightName);
        if (light) {
            light.color.setHex(color);
        }
    }

    // הפעלה/כיבוי צללים
    setShadowsEnabled(enabled) {
        this.settings.shadowsEnabled = enabled;
        
        this.lights.forEach(light => {
            if (light.castShadow !== undefined) {
                light.castShadow = enabled;
            }
        });
    }

    // עדכון האנימציות
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        const currentTime = performance.now() * 0.001;
        
        // אנימציית פולסציה של השמש
        if (this.animations.sunPulse.enabled) {
            this.updateSunPulse(currentTime);
        }
        
        // אנימציית קורונה
        if (this.animations.coronaEffect.enabled && this.animations.coronaEffect.material) {
            this.animations.coronaEffect.material.uniforms.time.value = currentTime;
        }
        
        // עדכון תאורה דינמית
        this.updateDynamicLighting(deltaTime);
    }

    // עדכון פולסציית השמש
    updateSunPulse(time) {
        const sunPoint = this.lights.get('sunPoint');
        const baseIntensity = 0.8;
        const pulseIntensity = Math.sin(time * this.animations.sunPulse.frequency) * 
                              this.animations.sunPulse.amplitude + 1;
        
        if (sunPoint) {
            sunPoint.intensity = baseIntensity * pulseIntensity;
        }
    }

    // עדכון תאורה דינמית
    updateDynamicLighting(deltaTime) {
        // התאמת תאורה בהתאם למרחק מהשמש
        if (this.dynamicLights) {
            this.dynamicLights.planetaryLights.forEach((light, planetName) => {
                // חישוב מרחק מהשמש
                const sunPosition = new THREE.Vector3(0, 0, 0);
                const distance = light.position.distanceTo(sunPosition);
                
                // התאמת עוצמה לפי מרחק (חוק הריבוע ההפוך)
                const baseIntensity = 0.1;
                const adjustedIntensity = baseIntensity * (100 / (distance + 1));
                light.intensity = Math.min(adjustedIntensity, 0.3);
            });
        }
    }

    // יצירת אפקט ליקוי
    createEclipseEffect(duration = 5000) {
        const originalIntensity = this.lights.get('sunDirectional')?.intensity || 1.5;
        const targetIntensity = 0.1;
        
        const startTime = performance.now();
        
        const animateEclipse = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let intensity;
            if (progress < 0.5) {
                // כהייה
                intensity = MathUtils.lerp(originalIntensity, targetIntensity, progress * 2);
            } else {
                // הארה חזרה
                intensity = MathUtils.lerp(targetIntensity, originalIntensity, (progress - 0.5) * 2);
            }
            
            const sunLight = this.lights.get('sunDirectional');
            if (sunLight) {
                sunLight.intensity = intensity;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateEclipse);
            }
        };
        
        animateEclipse();
    }

    // יצירת אפקט זריחה/שקיעה על כוכב לכת
    createSunriseEffect(planetPosition, duration = 3000) {
        const sunriseLight = new THREE.DirectionalLight(0xffa500, 0);
        sunriseLight.position.copy(planetPosition);
        sunriseLight.position.y += 20;
        
        this.scene.add(sunriseLight);
        
        const startTime = performance.now();
        const maxIntensity = 0.8;
        
        const animateSunrise = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const intensity = Math.sin(progress * Math.PI) * maxIntensity;
            sunriseLight.intensity = intensity;
            
            // שינוי צבע מכתום לצהוב
            const hue = MathUtils.lerp(0.08, 0.16, progress); // HSL
            sunriseLight.color.setHSL(hue, 1, 0.7);
            
            if (progress >= 1) {
                this.scene.remove(sunriseLight);
            } else {
                requestAnimationFrame(animateSunrise);
            }
        };
        
        animateSunrise();
    }

    // קבלת מידע על התאורה
    getLightingInfo() {
        const lightInfo = {};
        
        this.lights.forEach((light, name) => {
            lightInfo[name] = {
                type: light.type,
                intensity: light.intensity,
                color: light.color.getHex(),
                position: light.position.toArray(),
                visible: light.visible
            };
        });
        
        return {
            mode: this.currentMode,
            settings: { ...this.settings },
            lights: lightInfo,
            animations: {
                sunPulse: this.animations.sunPulse.enabled,
                corona: this.animations.coronaEffect.enabled
            }
        };
    }

    // שמירת הגדרות תאורה
    saveSettings() {
        return {
            mode: this.currentMode,
            settings: { ...this.settings },
            animations: {
                sunPulse: { ...this.animations.sunPulse },
                coronaEffect: { 
                    enabled: this.animations.coronaEffect.enabled 
                }
            }
        };
    }

    // טעינת הגדרות תאורה
    loadSettings(savedSettings) {
        if (savedSettings.mode) {
            this.setLightingMode(savedSettings.mode);
        }
        
        if (savedSettings.settings) {
            Object.assign(this.settings, savedSettings.settings);
        }
        
        if (savedSettings.animations) {
            if (savedSettings.animations.sunPulse) {
                Object.assign(this.animations.sunPulse, savedSettings.animations.sunPulse);
            }
            
            if (savedSettings.animations.coronaEffect) {
                this.animations.coronaEffect.enabled = savedSettings.animations.coronaEffect.enabled;
            }
        }
    }

    // ניקוי משאבים
    dispose() {
        // הסרת כל האורות מהסצנה
        this.lights.forEach(light => {
            if (light.parent) {
                light.parent.remove(light);
            }
            if (light.dispose) {
                light.dispose();
            }
        });
        
        // ניקוי אפקטי קורונה
        if (this.animations.coronaEffect.particles) {
            this.scene.remove(this.animations.coronaEffect.particles);
            if (this.animations.coronaEffect.geometry) {
                this.animations.coronaEffect.geometry.dispose();
            }
            if (this.animations.coronaEffect.material) {
                this.animations.coronaEffect.material.dispose();
            }
        }
        
        // ניקוי תאורה דינמית
        if (this.dynamicLights) {
            this.dynamicLights.planetaryLights.forEach(light => {
                if (light.parent) light.parent.remove(light);
            });
            this.dynamicLights.reflectionLights.forEach(light => {
                if (light.parent) light.parent.remove(light);
            });
        }
        
        this.lights.clear();
        this.isInitialized = false;
        
        console.log('Solar System Lights disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemLights;
}
