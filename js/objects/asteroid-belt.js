// יצירת אסטרואיד בודד גדול - מתוקן מ-asteroid-belt.js
async createMajorAsteroid(data) {
    // גיאומטריה לא סדירה לאסטרואיד
    const geometry = this.createIrregularAsteroidGeometry(data.radius);
    
    // **תיקון: הסרת roughness ו-metalness מ-MeshLambertMaterial**
    const material = new THREE.MeshLambertMaterial({
        color: data.color
        // הוסרו השורות הבאות (לא נתמכות):
        // roughness: 0.9,
        // metalness: 0.1
    });
    
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.name = data.name;
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    
    // מיקום במסלול - מתוקן
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * data.distance;
    const z = Math.sin(angle) * data.distance;
    const y = (Math.random() - 0.5) * this.settings.thickness;
    
    asteroid.position.set(x, y, z);
    
    // סיבוב אקראי
    asteroid.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
    );
    
    // מידע מסלול
    asteroid.userData = {
        orbitalRadius: data.distance,
        orbitalSpeed: Math.sqrt(1 / data.distance) * 0.0001,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        angle: angle,
        name: data.name,
        planetName: data.name, // לזיהוי לחיצה
        type: 'asteroid'
    };
    
    return asteroid;
}

// יצירת גיאומטריה לא סדירה לאסטרואיד - מתוקן
createIrregularAsteroidGeometry(radius) {
    // התחלה עם כדור בסיסי
    const geometry = new THREE.SphereGeometry(radius, 12, 8);
    const positions = geometry.attributes.position.array;
    
    // עיוות הקודקודים ליצירת צורה לא סדירה
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // רעש פרוצדורלי לעיוות
        const noise1 = Math.sin(x * 3) * Math.sin(y * 3) * Math.sin(z * 3) * 0.2;
        const noise2 = Math.sin(x * 7) * Math.sin(y * 7) * Math.sin(z * 7) * 0.1;
        const noise3 = Math.sin(x * 13) * Math.sin(y * 13) * Math.sin(z * 13) * 0.05;
        
        const distortion = 1 + noise1 + noise2 + noise3;
        
        positions[i] *= distortion;
        positions[i + 1] *= distortion;
        positions[i + 2] *= distortion;
    }
    
    // עדכון גיאומטריה
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
}

// הצגה/הסתרה של חגורת האסטרואידים - מתוקן
setVisibility(visible) {
    this.settings.enabled = visible;
    
    if (this.mesh) {
        this.mesh.visible = visible;
    }
    
    // הצגה/הסתרה של אסטרואידים גדולים
    this.majorAsteroids.forEach(asteroid => {
        asteroid.visible = visible;
    });
    
    console.log(`Asteroid belt visibility: ${visible}`);
}

// קבלת מבט כללי על חגורת האסטרואידים
getOverview() {
    return {
        name: 'חגורת האסטרואידים',
        englishName: 'Asteroid Belt',
        location: 'בין מאדים לצדק (2.2-3.2 AU)',
        description: 'אזור המכיל מיליוני גרמי שמיים סלעיים הנעים במסלול סביב השמש',
        majorBodies: [
            'קרס - כוכב לכת ננסי, הגדול ביותר בחגורה',
            'וסטה - אסטרואיד בהיר עם משטח מגוון',
            'פלאס - אסטרואיד גדול עם מסלול נטוי',
            'יונו - אחד הראשונים שהתגלו'
        ],
        interestingFacts: [
            'מסה כוללת קטנה מ-4% ממסת הירח',
            'המרחק הממוצע בין אסטרואידים הוא כמיליון ק"מ',
            'רוב האסטרואידים קטנים מ-1 ק"מ',
            'התגלתה כשהחיפוש אחר "כוכב הלכת החסר" נכשל'
        ],
        statistics: this.getStatistics()
    };
}

// עדכון החגורה - מתוקן
update(deltaTime) {
    if (!this.isInitialized || !this.settings.enabled) return;
    
    this.animation.time += deltaTime;
    
    // עדכון שיידר של מערכת החלקיקים
    if (this.material && this.material.uniforms) {
        this.material.uniforms.time.value = this.animation.time * 0.001;
    }
    
    // עדכון אסטרואידים גדולים
    this.majorAsteroids.forEach(asteroid => {
        const userData = asteroid.userData;
        
        // עדכון מסלול
        userData.angle += userData.orbitalSpeed * deltaTime;
        
        const x = Math.cos(userData.angle) * userData.orbitalRadius;
        const z = Math.sin(userData.angle) * userData.orbitalRadius;
        
        asteroid.position.x = x;
        asteroid.position.z = z;
        
        // סיבוב עצמי
        asteroid.rotation.x += userData.rotationSpeed * deltaTime;
        asteroid.rotation.y += userData.rotationSpeed * deltaTime * 0.7;
        asteroid.rotation.z += userData.rotationSpeed * deltaTime * 0.3;
    });
    
    // סיבוב איטי של כל החגורה
    this.animation.rotationAngle += this.settings.rotationSpeed * deltaTime;
    if (this.mesh) {
        this.mesh.rotation.y = this.animation.rotationAngle;
    }
}
