// יצירת השמש עם חומרים מתקדמים
class SolarSystemSun {
    constructor() {
        this.mesh = null;
        this.glow = null;
        this.pointLight = null;
        this.isInitialized = false;
    }

    async create() {
        const sunData = PLANETS_DATA.sun;
        const geometry = new THREE.SphereGeometry(sunData.scaledRadius, 32, 32);
        
        // שימוש ב-MeshPhongMaterial במקום MeshBasicMaterial לאפקטי זוהר
        const material = new THREE.MeshPhongMaterial({ 
            color: PLANET_COLORS.sun.primary,
            emissive: PLANET_COLORS.sun.secondary,
            emissiveIntensity: 0.8,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = 'sun';
        this.mesh.position.set(0, 0, 0);
        
        // אפקט זוהר לשמש
        const glowGeometry = new THREE.SphereGeometry(sunData.scaledRadius * 1.3, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: PLANET_COLORS.sun.glow,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
        
        // הוספת אור נקודתי בשמש
        this.pointLight = new THREE.PointLight(PLANET_COLORS.sun.primary, 1, 1000);
        this.pointLight.position.set(0, 0, 0);
        
        this.isInitialized = true;
        return this.mesh;
    }

    // עדכון אנימציה
    update(deltaTime) {
        if (!this.isInitialized || !this.mesh) return;
        
        // סיבוב השמש
        this.mesh.rotation.y += deltaTime * 0.01;
        
        // אפקט דפיקה של הזוהר
        if (this.glow) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 0.9;
            this.glow.material.opacity = 0.3 * pulse;
        }
    }

    // ניקוי משאבים
    dispose() {
        if (this.mesh && this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh && this.mesh.material) this.mesh.material.dispose();
        if (this.glow && this.glow.geometry) this.glow.geometry.dispose();
        if (this.glow && this.glow.material) this.glow.material.dispose();
        
        this.isInitialized = false;
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemSun;
}
