// יצירת השמש עם חומרים מתקדמים - מתוקן
class SolarSystemSun {
    constructor() {
        this.mesh = null;
        this.glow = null;
        this.pointLight = null;
        this.isInitialized = false;
        this.group = new THREE.Group();
        
        // הגדרות שמש
        this.settings = {
            radius: 20,
            glowRadius: 26,
            lightIntensity: 1,
            glowOpacity: 0.3
        };
        
        // צבעים
        this.colors = {
            primary: 0xffd700,
            secondary: 0xff8800,
            glow: 0xffaa00,
            light: 0xffffff
        };
        
        // אנימציה
        this.animation = {
            rotationSpeed: 0.01,
            pulseSpeed: 0.003,
            time: 0
        };
    }

    async create() {
        try {
            // נתוני השמש (עם fallback אם PLANETS_DATA לא קיים)
            let sunData = { scaledRadius: 20 };
            if (typeof PLANETS_DATA !== 'undefined' && PLANETS_DATA.sun) {
                sunData = PLANETS_DATA.sun;
            }
            
            // נתוני צבעים (עם fallback אם PLANET_COLORS לא קיים)
            let colors = this.colors;
            if (typeof PLANET_COLORS !== 'undefined' && PLANET_COLORS.sun) {
                colors = {
                    primary: PLANET_COLORS.sun.primary,
                    secondary: PLANET_COLORS.sun.secondary,
                    glow: PLANET_COLORS.sun.glow,
                    light: PLANET_COLORS.sun.primary
                };
            }
            
            const geometry = new THREE.SphereGeometry(sunData.scaledRadius || this.settings.radius, 32, 32);
            
            // **תיקון: שימוש ב-MeshPhongMaterial במקום MeshBasicMaterial לאפקטי זוהר**
            const material = new THREE.MeshPhongMaterial({ 
                color: colors.primary,
                emissive: colors.secondary,
                emissiveIntensity: 0.8,
                shininess: 100
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.name = 'sun';
            this.mesh.position.set(0, 0, 0);
            
            // **תיקון: userData לזיהוי לחיצות**
            this.mesh.userData = {
                planetName: 'sun',
                data: sunData,
                type: 'star'
            };
            
            // אפקט זוהר לשמש
            const glowGeometry = new THREE.SphereGeometry(this.settings.glowRadius, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: colors.glow,
                transparent: true,
                opacity: this.settings.glowOpacity,
                side: THREE.BackSide
            });
            this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.mesh.add(this.glow);
            
            // הוספת אור נקודתי בשמש
            this.pointLight = new THREE.PointLight(colors.light, this.settings.lightIntensity, 1000);
            this.pointLight.position.set(0, 0, 0);
            this.pointLight.castShadow = true;
            this.pointLight.shadow.mapSize.width = 2048;
            this.pointLight.shadow.mapSize.height = 2048;
            this.mesh.add(this.pointLight);
            
            // הוספת השמש לקבוצה
            this.group.add(this.mesh);
            
            this.isInitialized = true;
            console.log('✅ Sun created successfully with corrected materials');
            return this.group;
            
        } catch (error) {
            console.error('Failed to create sun:', error);
            throw error;
        }
    }

    // עדכון אנימציה
    update(deltaTime) {
        if (!this.isInitialized || !this.mesh) return;
        
        this.animation.time += deltaTime;
        
        // סיבוב השמש
        this.mesh.rotation.y += deltaTime * this.animation.rotationSpeed;
        
        // אפקט דפיקה של הזוהר
        if (this.glow) {
            const pulse = Math.sin(this.animation.time * this.animation.pulseSpeed) * 0.1 + 0.9;
            this.glow.material.opacity = this.settings.glowOpacity * pulse;
            
            // שינוי קל בגודל הזוהר
            const scale = 1 + Math.sin(this.animation.time * this.animation.pulseSpeed * 0.5) * 0.05;
            this.glow.scale.setScalar(scale);
        }
        
        // עדכון עוצמת האור
        if (this.pointLight) {
            const lightPulse = Math.sin(this.animation.time * this.animation.pulseSpeed * 0.3) * 0.1 + 0.9;
            this.pointLight.intensity = this.settings.lightIntensity * lightPulse;
        }
    }

    // קבלת mesh השמש
    getMesh() {
        return this.group;
    }

    // קבלת אור השמש
    getLight() {
        return this.pointLight;
    }

    // שינוי גודל השמש
    setScale(scale) {
        if (this.mesh) {
            this.mesh.scale.setScalar(scale);
        }
    }

    // הפעלה/כיבוי זוהר
    setGlowEnabled(enabled) {
        if (this.glow) {
            this.glow.visible = enabled;
        }
    }

    // הפעלה/כיבוי אור
    setLightEnabled(enabled) {
        if (this.pointLight) {
            this.pointLight.visible = enabled;
        }
    }

    // שינוי עוצמת האור
    setLightIntensity(intensity) {
        this.settings.lightIntensity = Math.max(0, Math.min(3, intensity));
        if (this.pointLight) {
            this.pointLight.intensity = this.settings.lightIntensity;
        }
    }

    // שינוי עוצמת הזוהר
    setGlowIntensity(intensity) {
        this.settings.glowOpacity = Math.max(0, Math.min(1, intensity));
        if (this.glow) {
            this.glow.material.opacity = this.settings.glowOpacity;
        }
    }

    // שינוי צבע השמש
    setSunColor(color) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(color);
        }
        if (this.pointLight) {
            this.pointLight.color.setHex(color);
        }
    }

    // קבלת מידע על השמש
    getSunInfo() {
        return {
            name: 'sun',
            isInitialized: this.isInitialized,
            settings: { ...this.settings },
            colors: { ...this.colors },
            animation: { ...this.animation },
            position: this.mesh ? this.mesh.position.clone() : null,
            realData: {
                radius: '696,340 ק"מ',
                mass: '1.989 × 10³⁰ ק"ג',
                temperature: '5,778 K (פני השטח)',
                age: '4.6 מיליארד שנים',
                composition: '73% מימן, 25% הליום, 2% יסודות כבדים'
            }
        };
    }

    // יצירת אפקטי קורונה מתקדמים
    createCoronaEffect() {
        if (!this.isInitialized) return;
        
        // יצירת חלקיקים לקורונה
        const particleCount = 2000;
        const coronaGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // התפלגות סביב השמש
            const radius = this.settings.radius + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // צבעי קורונה
            const intensity = 0.5 + Math.random() * 0.5;
            colors[i3] = intensity; // אדום
            colors[i3 + 1] = intensity * 0.8; // ירוק
            colors[i3 + 2] = intensity * 0.3; // כחול
            
            sizes[i] = 1 + Math.random() * 3;
        }
        
        coronaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        coronaGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        coronaGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const coronaMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const corona = new THREE.Points(coronaGeometry, coronaMaterial);
        corona.name = 'sunCorona';
        this.group.add(corona);
        
        this.effects.corona = corona;
    }

    // הפעלה/כיבוי קורונה
    setCoronaEnabled(enabled) {
        if (this.effects.corona) {
            this.effects.corona.visible = enabled;
        }
    }

    // ניקוי משאבים
    dispose() {
        if (this.mesh && this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh && this.mesh.material) this.mesh.material.dispose();
        if (this.glow && this.glow.geometry) this.glow.geometry.dispose();
        if (this.glow && this.glow.material) this.glow.material.dispose();
        
        // ניקוי אפקטי קורונה
        if (this.effects.corona) {
            if (this.effects.corona.geometry) this.effects.corona.geometry.dispose();
            if (this.effects.corona.material) this.effects.corona.material.dispose();
        }
        
        this.isInitialized = false;
        console.log('Sun disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemSun;
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
if (typeof window !== 'undefined') {
    window.SolarSystemSun = SolarSystemSun;
}
