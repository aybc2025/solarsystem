// אובייקט כוכב לכת גנרי במערכת השמש
class SolarSystemPlanet {
    constructor(planetName) {
        this.name = planetName;
        this.data = PLANETS_DATA[planetName];
        
        if (!this.data) {
            throw new Error(`Planet data not found for: ${planetName}`);
        }
        
        // רכיבים ויזואליים
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.group = new THREE.Group();
        
        // אפקטים נוספים
        this.effects = {
            atmosphere: null,
            clouds: null,
            rings: null,
            moons: [],
            magnetosphere: null,
            aurorae: null
        };
        
        // פרמטרי מסלול
        this.orbital = {
            radius: 0,
            speed: 0,
            angle: Math.random() * Math.PI * 2,
            inclination: 0,
            eccentricity: 0,
            rotationSpeed: 0
        };
        
        // הגדרות ויזואליות
        this.settings = {
            radius: 1,
            segments: 32,
            atmosphereEnabled: false,
            cloudsEnabled: false,
            ringsEnabled: false,
            moonsEnabled: false,
            auroraEnabled: false,
            realisticScale: false
        };
        
        // אנימציה
        this.animation = {
            time: 0,
            rotationAngle: 0,
            cloudRotation: 0,
            atmospherePulse: 0
        };
        
        // טקסטורות
        this.textures = {
            surface: null,
            normal: null,
            specular: null,
            clouds: null,
            rings: null
        };
        
        this.isInitialized = false;
    }

    // אתחול כוכב הלכת
    async init() {
        try {
            // חישוב פרמטרים פיזיקליים
            this.calculateOrbitalParameters();
            
            // יצירת גיאומטריה ראשית
            await this.createGeometry();
            
            // טעינת טקסטורות
            await this.loadTextures();
            
            // יצירת חומרים
            await this.createMaterials();
            
            // יצירת mesh ראשי
            await this.createMesh();
            
            // יצירת אפקטים מיוחדים לפי כוכב הלכת
            await this.createSpecialEffects();
            
            // הגדרת קבוצה
            this.setupGroup();
            
            this.isInitialized = true;
            console.log(`Planet ${this.name} initialized successfully`);
            
        } catch (error) {
            console.error(`Failed to initialize planet ${this.name}:`, error);
            throw error;
        }
    }

    // חישוב פרמטרים אורביטליים
    calculateOrbitalParameters() {
        // מרחק מהשמש (בקנה מידה)
        this.orbital.radius = this.data.distance * PHYSICS_CONSTANTS.SCALE_FACTOR;
        
        // מהירות מסלול (חוק שלישי של קפלר)
        this.orbital.speed = MathUtils.orbits.orbitalAngularVelocity(this.data.orbitalPeriod || 365);
        
        // נטיית מסלול
        this.orbital.inclination = MathUtils.degToRad(this.data.inclination || 0);
        
        // אקסצנטריות
        this.orbital.eccentricity = this.data.eccentricity || 0;
        
        // מהירות סיבוב עצמי
        this.orbital.rotationSpeed = this.data.rotationPeriod ? 
            MathUtils.TWO_PI / (this.data.rotationPeriod * 24 * 3600) : 0.001;
        
        // רדיוס כוכב הלכת (בקנה מידה)
        this.settings.radius = this.settings.realisticScale ? 
            this.data.radius * PHYSICS_CONSTANTS.SCALE_FACTOR * 0.001 :
            Math.max(1, Math.log(this.data.radius) * 0.5);
    }

    // יצירת גיאומטריה
    async createGeometry() {
        this.geometry = new THREE.SphereGeometry(
            this.settings.radius,
            this.settings.segments,
            this.settings.segments
        );
        
        // חישוב טנגנטים לnormal mapping
        this.geometry.computeTangents();
    }

    // טעינת טקסטורות
    async loadTextures() {
        // טקסטורת פני השטח
        if (TEXTURE_URLS.planets[this.name]?.diffuse) {
            this.textures.surface = await this.loadTextureFromUrl(TEXTURE_URLS.planets[this.name].diffuse);
        } else {
            this.textures.surface = await this.createProceduralTexture();
        }
        
        // טקסטורת נורמלים
        if (TEXTURE_URLS.planets[this.name]?.normal) {
            this.textures.normal = await this.loadTextureFromUrl(TEXTURE_URLS.planets[this.name].normal);
        }
        
        // טקסטורת ספקולר (עבור כוכבי לכת עם מים/קרח)
        if (['earth', 'mars'].includes(this.name)) {
            this.textures.specular = await this.createSpecularMap();
        }
        
        // טקסטורת עננים (עבור כוכבי לכת עם אטמוספרה)
        if (['earth', 'venus', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
            this.textures.clouds = await this.createCloudTexture();
            this.settings.cloudsEnabled = true;
        }
        
        // טקסטורת טבעות (עבור שבתאי ואורנוס)
        if (['saturn', 'uranus'].includes(this.name)) {
            this.textures.rings = await this.createRingsTexture();
            this.settings.ringsEnabled = true;
        }
    }

    // טעינת טקסטורה מURL
    async loadTextureFromUrl(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(url, resolve, undefined, reject);
        });
    }

    // יצירת טקסטורה פרוצדורלית
    async createProceduralTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // צבע בסיס על פי כוכב הלכת
        const baseColor = `#${this.data.color.toString(16).padStart(6, '0')}`;
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 256);
        
        // הוספת וריאציות צבע ורעש
        const imageData = ctx.getImageData(0, 0, 512, 256);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = MathUtils.noise.perlin(
                (i / 4) % 512 * 0.01,
                Math.floor((i / 4) / 512) * 0.01
            ) * 0.2;
            
            data[i] = Math.max(0, Math.min(255, data[i] + noise * 100));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 80));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 60));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }

    // יצירת מפת ספקולר
    async createSpecularMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // בסיס שחור
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 256);
        
        if (this.name === 'earth') {
            // אזורי מים - בהירים יותר
            ctx.fillStyle = '#666666';
            
            // דמיית אוקיינוסים פשוטה
            const oceanAreas = [
                { x: 100, y: 80, w: 150, h: 60 },  // אטלנטי
                { x: 300, y: 70, w: 120, h: 80 },  // פסיפי
                { x: 50, y: 160, w: 100, h: 40 },  // הודי
            ];
            
            oceanAreas.forEach(area => {
                ctx.fillRect(area.x, area.y, area.w, area.h);
            });
        }
        
        return new THREE.CanvasTexture(canvas);
    }

    // יצירת טקסטורת עננים
    async createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // רקע שקוף
        ctx.clearRect(0, 0, 512, 256);
        
        // יצירת עננים עם רעש פרלין
        const imageData = ctx.createImageData(512, 256);
        const data = imageData.data;
        
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 256; y++) {
                const index = (y * 512 + x) * 4;
                
                // רעש פרקטלי לעננים
                let cloudDensity = 0;
                cloudDensity += MathUtils.noise.perlin(x * 0.01, y * 0.01) * 0.5;
                cloudDensity += MathUtils.noise.perlin(x * 0.02, y * 0.02) * 0.3;
                cloudDensity += MathUtils.noise.perlin(x * 0.04, y * 0.04) * 0.2;
                
                // התאמה לכוכב לכת ספציפי
                if (this.name === 'venus') {
                    cloudDensity = Math.max(0.3, cloudDensity + 0.4); // עננים צפופים
                } else if (this.name === 'earth') {
                    cloudDensity = Math.max(0, cloudDensity); // עננים חלקיים
                } else {
                    cloudDensity = Math.max(0, cloudDensity + 0.2); // עננים של ענקי גז
                }
                
                const alpha = Math.min(255, cloudDensity * 255);
                
                data[index] = 255;     // R
                data[index + 1] = 255; // G
                data[index + 2] = 255; // B
                data[index + 3] = alpha; // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }

    // יצירת טקסטורת טבעות
    async createRingsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const centerX = 256;
        const centerY = 256;
        
        // יצירת דפוס טבעות
        const imageData = ctx.createImageData(512, 512);
        const data = imageData.data;
        
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 512; y++) {
                const index = (y * 512 + x) * 4;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const normalizedDistance = distance / 256;
                
                let alpha = 0;
                
                if (this.name === 'saturn') {
                    // טבעות שבתאי - מורכבות
                    if (normalizedDistance > 0.4 && normalizedDistance < 0.9) {
                        const ringPattern = Math.sin(normalizedDistance * 50) * 0.3 + 0.7;
                        const gapPattern = normalizedDistance < 0.6 || normalizedDistance > 0.65 ? 1 : 0.3;
                        alpha = ringPattern * gapPattern * 255;
                        
                        // צבעים של טבעות שבתאי
                        data[index] = 200 + Math.sin(normalizedDistance * 20) * 20;     // R
                        data[index + 1] = 180 + Math.cos(normalizedDistance * 15) * 15; // G
                        data[index + 2] = 120 + Math.sin(normalizedDistance * 10) * 10; // B
                    }
                } else if (this.name === 'uranus') {
                    // טבעות אורנוס - דקות ולא רציפות
                    const ringDistances = [0.5, 0.52, 0.55, 0.6, 0.65];
                    
                    for (const ringDist of ringDistances) {
                        if (Math.abs(normalizedDistance - ringDist) < 0.01) {
                            alpha = 150;
                            data[index] = 100;     // R
                            data[index + 1] = 150; // G
                            data[index + 2] = 200; // B
                            break;
                        }
                    }
                }
                
                data[index + 3] = alpha;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        return new THREE.CanvasTexture(canvas);
    }

    // יצירת חומרים
    async createMaterials() {
        // חומר בסיסי
        const materialParams = {
            map: this.textures.surface,
            color: 0xffffff
        };
        
        // הוספת מפת נורמלים
        if (this.textures.normal) {
            materialParams.normalMap = this.textures.normal;
            materialParams.normalScale = new THREE.Vector2(1, 1);
        }
        
        // הוספת מפת ספקולר
        if (this.textures.specular) {
            materialParams.specularMap = this.textures.specular;
            materialParams.shininess = 100;
        }
        
        // בחירת סוג החומר לפי כוכב הלכת
        if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(this.name)) {
            // ענקי גז - חומר עם תאורה מיוחדת
            this.material = new THREE.MeshPhongMaterial(materialParams);
        } else if (this.name === 'earth') {
            // כדור הארץ - חומר מתקדם עם השתקפויות
            this.material = new THREE.MeshPhongMaterial({
                ...materialParams,
                specular: 0x222222,
                shininess: 25
            });
        } else {
            // כוכבי לכת סלעיים - חומר למברטי
            this.material = new THREE.MeshLambertMaterial(materialParams);
        }
    }

    // יצירת mesh ראשי
    async createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.group.add(this.mesh);
    }

    // יצירת אפקטים מיוחדים
    async createSpecialEffects() {
        // אטמוספרה
        if (this.shouldHaveAtmosphere()) {
            await this.createAtmosphere();
        }
        
        // עננים
        if (this.settings.cloudsEnabled && this.textures.clouds) {
            await this.createClouds();
        }
        
        // טבעות
        if (this.settings.ringsEnabled && this.textures.rings) {
            await this.createRings();
        }
        
        // ירחים
        if (this.data.moons > 0) {
            await this.createMoons();
        }
        
        // אורורה (עבור כוכבי לכת עם שדה מגנטי)
        if (['earth', 'jupiter', 'saturn'].includes(this.name)) {
            await this.createAurora();
        }
    }

    // בדיקה אם כוכב הלכת צריך אטמוספרה
    shouldHaveAtmosphere() {
        const atmosphericPlanets = ['venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        return atmosphericPlanets.includes(this.name);
    }

    // יצירת אטמוספרה
    async createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.settings.radius * 1.05,
            32,
            32
        );
        
        let atmosphereColor;
        switch (this.name) {
            case 'earth':
                atmosphereColor = 0x87ceeb; // כחול שמיים
                break;
            case 'mars':
                atmosphereColor = 0xffa500; // כתום
                break;
            case 'venus':
                atmosphereColor = 0xffd700; // צהוב
                break;
            default:
                atmosphereColor = 0x666666; // אפור
        }
        
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                color: { value: new THREE.Color(atmosphereColor) },
                opacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float opacity;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
                    fresnel = pow(fresnel, 2.0);
                    
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    
                    gl_FragColor = vec4(color, fresnel * opacity * pulse);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.effects.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.effects.atmosphere);
    }

    // יצירת עננים
    async createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(
            this.settings.radius * 1.01,
            32,
            32
        );
        
        const cloudMaterial = new THREE.MeshLambertMaterial({
            map: this.textures.clouds,
            transparent: true,
            opacity: 0.6,
            alphaTest: 0.1
        });
        
        this.effects.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.group.add(this.effects.clouds);
    }

    // יצירת טבעות
    async createRings() {
        const ringInnerRadius = this.settings.radius * 1.5;
        const ringOuterRadius = this.settings.radius * 2.5;
        
        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 64);
        
        // סיבוب UV coordinates לטקסטורה רדיאלית
        const uvs = ringGeometry.attributes.uv.array;
        for (let i = 0; i < uvs.length; i += 2) {
            const u = uvs[i];
            const v = uvs[i + 1];
            
            const angle = Math.atan2(v - 0.5, u - 0.5);
            const radius = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) * 2;
            
            uvs[i] = (angle + Math.PI) / (2 * Math.PI);
            uvs[i + 1] = radius;
        }
        
        const ringMaterial = new THREE.MeshLambertMaterial({
            map: this.textures.rings,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.1
        });
        
        this.effects.rings = new THREE.Mesh(ringGeometry, ringMaterial);
        this.effects.rings.rotation.x = -Math.PI / 2;
        
        // נטיית טבעות (בעצם נטיית כוכב הלכת)
        if (this.name === 'saturn') {
            this.effects.rings.rotation.z = MathUtils.degToRad(27);
        } else if (this.name === 'uranus') {
            this.effects.rings.rotation.z = MathUtils.degToRad(98);
        }
        
        this.group.add(this.effects.rings);
    }

    // יצירת ירחים
    async createMoons() {
        const moonCount = Math.min(this.data.moons, 4); // מקסימום 4 ירחים לתצוגה
        
        for (let i = 0; i < moonCount; i++) {
            const moonRadius = this.settings.radius * (0.1 + Math.random() * 0.15);
            const moonDistance = this.settings.radius * (2 + i * 0.5);
            
            const moonGeometry = new THREE.SphereGeometry(moonRadius, 16, 16);
            const moonMaterial = new THREE.MeshLambertMaterial({
                color: 0x888888
            });
            
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(moonDistance, 0, 0);
            moon.castShadow = true;
            moon.receiveShadow = true;
            
            // קבוצה לירח עם מסלול
            const moonGroup = new THREE.Group();
            moonGroup.add(moon);
            
            // פרמטרי מסלול ירח
            moonGroup.userData = {
                distance: moonDistance,
                speed: 0.001 / (i + 1), // ירחים פנימיים מהירים יותר
                angle: Math.random() * Math.PI * 2
            };
            
            this.effects.moons.push(moonGroup);
            this.group.add(moonGroup);
        }
    }

    // יצירת אורורה
    async createAurora() {
        const auroraGeometry = new THREE.RingGeometry(
            this.settings.radius * 0.8,
            this.settings.radius * 1.2,
            32
        );
        
        let auroraColor;
        switch (this.name) {
            case 'earth':
                auroraColor = 0x00ff88; // ירוק
                break;
            case 'jupiter':
                auroraColor = 0x8888ff; // כחול
                break;
            case 'saturn':
                auroraColor = 0xff88ff; // סגול
                break;
        }
        
        const auroraMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                color: { value: new THREE.Color(auroraColor) }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    
                    vec3 pos = position;
                    float wave = sin(time * 3.0 + pos.x * 0.1) * 0.1;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    float alpha = sin(time * 2.0 + vUv.x * 10.0) * 0.3 + 0.4;
                    alpha *= (1.0 - abs(vUv.y - 0.5) * 2.0);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.effects.aurorae = new THREE.Mesh(auroraGeometry, auroraMaterial);
        this.effects.aurorae.rotation.x = Math.PI / 2;
        this.effects.aurorae.position.y = this.settings.radius * 0.8;
        
        this.group.add(this.effects.aurorae);
    }

    // הגדרת קבוצה
    setupGroup() {
        this.group.name = `${this.name}Group`;
        
        // מיקום ראשוני במסלול
        this.updateOrbitalPosition();
    }

    // עדכון מיקום במסלול
    updateOrbitalPosition() {
        const position = MathUtils.calculateOrbitalPosition(
            this.animation.time,
            this.data.orbitalPeriod || 365,
            this.orbital.radius,
            this.orbital.eccentricity,
            this.orbital.inclination
        );
        
        this.group.position.set(position.x, position.y, position.z);
    }

    // עדכון האנימציות
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון מסלול
        this.orbital.angle += this.orbital.speed * deltaTime * 0.1;
        this.updateOrbitalPosition();
        
        // סיבוב עצמי
        this.animation.rotationAngle += this.orbital.rotationSpeed * deltaTime;
        if (this.mesh) {
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
        
        // עדכון אטמוספרה
        if (this.effects.atmosphere && this.effects.atmosphere.material.uniforms) {
            this.effects.atmosphere.material.uniforms.time.value = this.animation.time * 0.001;
        }
        
        // עדכון עננים
        if (this.effects.clouds) {
            this.animation.cloudRotation += deltaTime * 0.0002;
            this.effects.clouds.rotation.y = this.animation.cloudRotation;
        }
        
        // עדכון ירחים
        this.effects.moons.forEach(moonGroup => {
            const userData = moonGroup.userData;
            userData.angle += userData.speed * deltaTime;
            
            const x = Math.cos(userData.angle) * userData.distance;
            const z = Math.sin(userData.angle) * userData.distance;
            
            moonGroup.rotation.y = userData.angle;
            moonGroup.children[0].position.set(x, 0, z);
        });
        
        // עדכון אורורה
        if (this.effects.aurorae && this.effects.aurorae.material.uniforms) {
            this.effects.aurorae.material.uniforms.time.value = this.animation.time * 0.001;
        }
    }

    // החזרת האובייקט הראשי
    getMesh() {
        return this.group;
    }

    // הגדרת מצב ריאליסטי
    setRealisticScale(enabled) {
        this.settings.realisticScale = enabled;
        this.calculateOrbitalParameters();
        
        // עדכון גיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = new THREE.SphereGeometry(
                this.settings.radius,
                this.settings.segments,
                this.settings.segments
            );
            this.mesh.geometry = this.geometry;
        }
    }

    // הצגת/הסתרת אפקטים
    toggleEffect(effectName, visible) {
        if (this.effects[effectName]) {
            this.effects[effectName].visible = visible;
        }
    }

    // קבלת מידע על כוכב הלכת
    getPlanetInfo() {
        return {
            name: this.name,
            data: this.data,
            settings: { ...this.settings },
            orbital: { ...this.orbital },
            animation: { ...this.animation },
            effects: {
                atmosphere: !!this.effects.atmosphere,
                clouds: !!this.effects.clouds,
                rings: !!this.effects.rings,
                moons: this.effects.moons.length,
                aurorae: !!this.effects.aurorae
            }
        };
    }

    // ניקוי משאבים
    dispose() {
        // ניקוי גיאומטריה
        if (this.geometry) {
            this.geometry.dispose();
        }
        
        // ניקוי חומרים
        if (this.material) {
            this.material.dispose();
        }
        
        // ניקוי טקסטורות
        Object.values(this.textures).forEach(texture => {
            if (texture) texture.dispose();
        });
        
        // ניקוי אפקטים
        Object.values(this.effects).forEach(effect => {
            if (Array.isArray(effect)) {
                effect.forEach(item => {
                    if (item.geometry) item.geometry.dispose();
                    if (item.material) item.material.dispose();
                });
            } else if (effect) {
                if (effect.geometry) effect.geometry.dispose();
                if (effect.material) effect.material.dispose();
            }
        });
        
        this.isInitialized = false;
        console.log(`Planet ${this.name} disposed`);
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemPlanet;
}
