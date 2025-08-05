// יצירת השמש עם חומרים מתקדמים
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
            
            // שימוש ב-MeshPhongMaterial במקום MeshBasicMaterial לאפקטי זוהר
            const material = new THREE.MeshPhongMaterial({ 
                color: colors.primary,
                emissive: colors.secondary,
                emissiveIntensity: 0.8,
                shininess: 100
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.name = 'sun';
            this.mesh.position.set(0, 0, 0);
            
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
            console.log('✅ Sun created successfully');
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

    // קבלת מידע על השמש
    getSunInfo() {
        return {
            name: 'sun',
            isInitialized: this.isInitialized,
            settings: { ...this.settings },
            colors: { ...this.colors },
            animation: { ...this.animation },
            position: this.mesh ? this.mesh.position.clone() : null
        };
    }

    // ניקוי משאבים
    dispose() {
        if (this.mesh && this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh && this.mesh.material) this.mesh.material.dispose();
        if (this.glow && this.glow.geometry) this.glow.geometry.dispose();
        if (this.glow && this.glow.material) this.glow.material.dispose();
        
        this.isInitialized = false;
        console.log('Sun disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemSun;
}

// הפוך את המחלקה זמינה גלובלית - תיקון עיקרי
window.SolarSystemSun = SolarSystemSun;
