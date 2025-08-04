// אובייקט השמש - הכוכב במרכז מערכת השמש
class SolarSystemSun {
    constructor() {
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.data = PLANETS_DATA.sun;
        
        // קבוצות אפקטים
        this.effects = {
            corona: null,
            flares: [],
            prominences: [],
            magneticField: null
        };
        
        // הגדרות ויזואליות
        this.settings = {
            radius: 10,
            segments: 64,
            emissiveIntensity: 0.8,
            coronaEnabled: true,
            flaresEnabled: true,
            prominencesEnabled: true,
            pulsationEnabled: true,
            rotationSpeed: 0.001
        };
        
        // פרמטרים לאנימציה
        this.animation = {
            time: 0,
            rotationAngle: 0,
            pulsationPhase: 0,
            coronaRotation: 0,
            flareTimer: 0
        };
        
        // טקסטורות
        this.textures = {
            surface: null,
            corona: null,
            flare: null
        };
        
        this.isInitialized = false;
    }

    // אתחול השמש
    async init() {
        try {
            // יצירת הגיאומטריה הראשית
            await this.createGeometry();
            
            // יצירת החומרים
            await this.createMaterials();
            
            // יצירת הmesh הראשי
            await this.createMesh();
            
            // יצירת אפקטי הקורונה
            await this.createCoronaEffect();
            
            // יצירת התלקחויות סולאריות
            await this.createSolarFlares();
            
            // יצירת פרומיננטים
            await this.createProminences();
            
            // יצירת אפקט שדה מגנטי
            await this.createMagneticField();
            
            this.isInitialized = true;
            console.log('Solar System Sun initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Sun:', error);
            throw error;
        }
    }

    // יצירת גיאומטריה
    async createGeometry() {
        this.geometry = new THREE.SphereGeometry(
            this.settings.radius,
            this.settings.segments,
            this.settings.segments
        );
        
        // הוספת UV coordinates מותאמים לטקסטורת השמש
        const uvAttribute = this.geometry.attributes.uv;
        const positions = this.geometry.attributes.position;
        
        for (let i = 0; i < uvAttribute.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // חישוב UV על בסיס כדור
            const phi = Math.atan2(z, x);
            const theta = Math.acos(y / this.settings.radius);
            
            uvAttribute.setXY(i, 
                (phi + Math.PI) / (2 * Math.PI),
                theta / Math.PI
            );
        }
        
        uvAttribute.needsUpdate = true;
    }

    // יצירת חומרים
    async createMaterials() {
        // טעינת טקסטורות
        await this.loadTextures();
        
        // שיידר מותאם אישית לשמש
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                surface: { value: this.textures.surface },
                emissiveIntensity: { value: this.settings.emissiveIntensity },
                pulsation: { value: 1.0 },
                coronaOpacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                uniform float time;
                uniform float pulsation;
                
                // רעש פרוצדורלי לתנועת פני השטח
                float noise(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                }
                
                float turbulence(vec3 p) {
                    float value = 0.0;
                    float amplitude = 1.0;
                    float frequency = 1.0;
                    
                    for(int i = 0; i < 4; i++) {
                        value += amplitude * noise(p * frequency);
                        amplitude *= 0.5;
                        frequency *= 2.0;
                    }
                    
                    return value;
                }
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    // תנועת פני השטח עם רעש
                    vec3 pos = position;
                    float displacement = turbulence(pos * 0.1 + time * 0.1) * 0.3;
                    pos += normal * displacement * pulsation;
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform sampler2D surface;
                uniform float emissiveIntensity;
                uniform float pulsation;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                // פונקציות רעש נוספות
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                
                float noise2D(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));
                    
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    
                    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }
                
                void main() {
                    vec2 animatedUv = vUv + time * 0.02;
                    
                    // צבע בסיס מהטקסטורה
                    vec4 surfaceColor = texture2D(surface, animatedUv);
                    
                    // הוספת רעש לטקסטורה
                    float noise = noise2D(vUv * 10.0 + time * 0.5);
                    float noise2 = noise2D(vUv * 20.0 - time * 0.3);
                    
                    // צבעי השמש - מצהוב לכתום לאדום
                    vec3 sunColor1 = vec3(1.0, 0.9, 0.3);  // צהוב
                    vec3 sunColor2 = vec3(1.0, 0.5, 0.1);  // כתום
                    vec3 sunColor3 = vec3(1.0, 0.2, 0.0);  // אדום
                    
                    // מיקסטורה של צבעים על בסיס רעש
                    vec3 finalColor = mix(sunColor1, sunColor2, noise);
                    finalColor = mix(finalColor, sunColor3, noise2 * 0.5);
                    
                    // אפקט פולסציה
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    finalColor *= pulse * pulsation;
                    
                    // הוספת ברק במרכז
                    float centerGlow = 1.0 - length(vUv - 0.5) * 2.0;
                    centerGlow = pow(centerGlow, 3.0);
                    finalColor += centerGlow * vec3(1.0, 1.0, 0.5) * 0.5;
                    
                    // אפקט אמיסיבי חזק
                    gl_FragColor = vec4(finalColor * emissiveIntensity, 1.0);
                }
            `,
            transparent: false,
            side: THREE.FrontSide
        });
    }

    // טעינת טקסטורות
    async loadTextures() {
        // טקסטורת פני השמש
        this.textures.surface = await this.createProceduralSunTexture();
        
        // טקסטורת קורונה
        this.textures.corona = await this.createCoronaTexture();
        
        // טקסטורת התלקחות
        this.textures.flare = await this.createFlareTexture();
    }

    // יצירת טקסטורת שמש פרוצדורלית
    async createProceduralSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // יצירת gradient רדיאלי
        const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.3, '#FFA500');
        gradient.addColorStop(0.6, '#FF6347');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);
        
        // הוספת רעש לטקסטורה
        const imageData = ctx.getImageData(0, 0, 512, 256);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 60;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.7));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.3));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }

    // יצירת טקסטורת קורונה
    async createCoronaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        return new THREE.CanvasTexture(canvas);
    }

    // יצירת טקסטורת התלקחות
    async createFlareTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 100, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    }

    // יצירת mesh ראשי
    async createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = 'sun';
        this.mesh.position.set(0, 0, 0);
        
        // השמש לא מטילה צל על עצמה אבל מאירה אחרים
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        // קבוצה לכל האפקטים
        this.sunGroup = new THREE.Group();
        this.sunGroup.add(this.mesh);
        this.sunGroup.name = 'sunGroup';
    }

    // יצירת אפקט קורונה
    async createCoronaEffect() {
        if (!this.settings.coronaEnabled) return;
        
        // קורונה פנימית
        const innerCoronaGeometry = new THREE.SphereGeometry(this.settings.radius * 1.1, 32, 32);
        const innerCoronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    
                    vec3 pos = position;
                    float wave = sin(pos.y * 0.5 + time * 2.0) * 0.1;
                    pos += normal * wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                uniform float opacity;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
                    fresnel = pow(fresnel, 2.0);
                    
                    vec3 color = vec3(1.0, 0.8, 0.3);
                    float pulse = sin(time * 3.0) * 0.2 + 0.8;
                    
                    gl_FragColor = vec4(color, fresnel * opacity * pulse);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.effects.corona = new THREE.Mesh(innerCoronaGeometry, innerCoronaMaterial);
        this.sunGroup.add(this.effects.corona);
        
        // קורונה חיצונית
        const outerCoronaGeometry = new THREE.SphereGeometry(this.settings.radius * 1.3, 24, 24);
        const outerCoronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                uniform float opacity;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
                    fresnel = pow(fresnel, 1.5);
                    
                    vec3 color = vec3(1.0, 0.6, 0.2);
                    float wave = sin(time * 1.5) * 0.3 + 0.7;
                    
                    gl_FragColor = vec4(color, fresnel * opacity * wave);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const outerCorona = new THREE.Mesh(outerCoronaGeometry, outerCoronaMaterial);
        this.sunGroup.add(outerCorona);
    }

    // יצירת התלקחויות סולאריות
    async createSolarFlares() {
        if (!this.settings.flaresEnabled) return;
        
        const flareCount = 8;
        
        for (let i = 0; i < flareCount; i++) {
            const flareGeometry = new THREE.ConeGeometry(0.5, 15, 6);
            const flareMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const flare = new THREE.Mesh(flareGeometry, flareMaterial);
            
            // מיקום אקראי על פני השמש
            const phi = (i / flareCount) * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            const x = Math.sin(theta) * Math.cos(phi) * this.settings.radius;
            const y = Math.sin(theta) * Math.sin(phi) * this.settings.radius;
            const z = Math.cos(theta) * this.settings.radius;
            
            flare.position.set(x, y, z);
            flare.lookAt(x * 2, y * 2, z * 2);
            
            flare.visible = false; // נתחיל עם התלקחויות בלתי נראות
            
            this.effects.flares.push(flare);
            this.sunGroup.add(flare);
        }
    }

    // יצירת פרומיננטים
    async createProminences() {
        if (!this.settings.prominencesEnabled) return;
        
        const prominenceCount = 12;
        
        for (let i = 0; i < prominenceCount; i++) {
            // יצירת גיאומטריה מותאמת לפרומיננט
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(5, 15, 0),
                new THREE.Vector3(10, 8, 0)
            );
            
            const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.3, 6, false);
            const prominenceMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    intensity: { value: 0.8 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    uniform float time;
                    
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        
                        // אנימציית תנועה
                        pos.y += sin(time * 2.0 + position.x * 0.1) * 0.5;
                        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    uniform float time;
                    uniform float intensity;
                    
                    void main() {
                        float alpha = 1.0 - vUv.y;
                        alpha *= sin(time * 3.0 + vUv.x * 10.0) * 0.3 + 0.7;
                        
                        vec3 color = vec3(1.0, 0.4, 0.1);
                        gl_FragColor = vec4(color, alpha * intensity);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            
            const prominence = new THREE.Mesh(tubeGeometry, prominenceMaterial);
            
            // מיקום אקראי על פני השמש
            const angle = (i / prominenceCount) * Math.PI * 2;
            const height = (Math.random() - 0.5) * Math.PI;
            
            prominence.position.set(
                Math.cos(angle) * this.settings.radius,
                Math.sin(height) * this.settings.radius,
                Math.sin(angle) * this.settings.radius
            );
            
            prominence.lookAt(0, 0, 0);
            prominence.rotateX(Math.PI / 2);
            
            this.effects.prominences.push(prominence);
            this.sunGroup.add(prominence);
        }
    }

    // יצירת אפקט שדה מגנטי
    async createMagneticField() {
        const fieldGeometry = new THREE.BufferGeometry();
        const fieldCount = 200;
        const positions = new Float32Array(fieldCount * 6); // קווים
        
        for (let i = 0; i < fieldCount; i++) {
            const i6 = i * 6;
            
            // קו מגנטי מהקוטב הצפוני לדרומי
            const angle = Math.random() * Math.PI * 2;
            const radius = this.settings.radius * (1.2 + Math.random() * 0.8);
            
            // נקודת התחלה
            positions[i6] = Math.cos(angle) * radius * 0.3;
            positions[i6 + 1] = radius;
            positions[i6 + 2] = Math.sin(angle) * radius * 0.3;
            
            // נקודת סיום
            positions[i6 + 3] = Math.cos(angle + Math.PI) * radius * 0.3;
            positions[i6 + 4] = -radius;
            positions[i6 + 5] = Math.sin(angle + Math.PI) * radius * 0.3;
        }
        
        fieldGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const fieldMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        this.effects.magneticField = new THREE.LineSegments(fieldGeometry, fieldMaterial);
        this.effects.magneticField.visible = false; // בלתי נראה כברירת מחדל
        this.sunGroup.add(this.effects.magneticField);
    }

    // הפעלת התלקחות סולארית
    triggerSolarFlare(intensity = 1.0, duration = 2000) {
        const availableFlares = this.effects.flares.filter(flare => !flare.visible);
        if (availableFlares.length === 0) return;
        
        const flare = availableFlares[Math.floor(Math.random() * availableFlares.length)];
        flare.visible = true;
        flare.scale.setScalar(0.1);
        
        // אנימציית התלקחות
        const startTime = performance.now();
        
        const animateFlare = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 0.3) {
                // צמיחה מהירה
                const scale = MathUtils.easing.easeOutCubic(progress / 0.3) * intensity;
                flare.scale.setScalar(scale);
                flare.material.opacity = scale * 0.8;
            } else if (progress < 1.0) {
                // דעיכה
                const fadeProgress = (progress - 0.3) / 0.7;
                const scale = intensity * (1 - MathUtils.easing.easeInQuad(fadeProgress));
                flare.scale.setScalar(scale);
                flare.material.opacity = scale * 0.8;
            } else {
                // סיום
                flare.visible = false;
                flare.scale.setScalar(0.1);
                return;
            }
            
            requestAnimationFrame(animateFlare);
        };
        
        animateFlare();
    }

    // הגדרת הגדרות
    setSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            
            // עדכון מיידי של הגדרות רלוונטיות
            switch (key) {
                case 'emissiveIntensity':
                    if (this.material && this.material.uniforms) {
                        this.material.uniforms.emissiveIntensity.value = value;
                    }
                    break;
                    
                case 'coronaEnabled':
                    if (this.effects.corona) {
                        this.effects.corona.visible = value;
                    }
                    break;
                    
                case 'flaresEnabled':
                    this.effects.flares.forEach(flare => {
                        if (!value) flare.visible = false;
                    });
                    break;
                    
                case 'prominencesEnabled':
                    this.effects.prominences.forEach(prominence => {
                        prominence.visible = value;
                    });
                    break;
            }
        }
    }

    // החזרת האובייקט הראשי לסצנה
    getMesh() {
        return this.sunGroup || this.mesh;
    }

    // עדכון האנימציות
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.animation.time += deltaTime;
        
        // עדכון שיידרים
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = this.animation.time * 0.001;
            
            if (this.settings.pulsationEnabled) {
                const pulsation = Math.sin(this.animation.time * 0.002) * 0.1 + 0.9;
                this.material.uniforms.pulsation.value = pulsation;
            }
        }
        
        // סיבוב השמש
        if (this.mesh) {
            this.animation.rotationAngle += this.settings.rotationSpeed * deltaTime;
            this.mesh.rotation.y = this.animation.rotationAngle;
        }
        
        // עדכון קורונה
        if (this.effects.corona) {
            this.animation.coronaRotation += deltaTime * 0.0005;
            this.effects.corona.rotation.y = this.animation.coronaRotation;
            
            if (this.effects.corona.material.uniforms) {
                this.effects.corona.material.uniforms.time.value = this.animation.time * 0.001;
            }
        }
        
        // עדכון פרומיננטים
        this.effects.prominences.forEach((prominence, index) => {
            if (prominence.material.uniforms) {
                prominence.material.uniforms.time.value = this.animation.time * 0.001 + index;
            }
        });
        
        // התלקחויות אקראיות
        this.animation.flareTimer += deltaTime;
        if (this.animation.flareTimer > 10000 && Math.random() < 0.001) {
            this.triggerSolarFlare(0.5 + Math.random() * 0.5);
            this.animation.flareTimer = 0;
        }
    }

    // הצגת/הסתרת שדה מגנטי
    toggleMagneticField(visible) {
        if (this.effects.magneticField) {
            this.effects.magneticField.visible = visible;
        }
    }

    // קבלת מידע על השמש
    getSunInfo() {
        return {
            data: this.data,
            settings: { ...this.settings },
            animation: { ...this.animation },
            effects: {
                corona: !!this.effects.corona,
                flares: this.effects.flares.length,
                prominences: this.effects.prominences.length,
                magneticField: !!this.effects.magneticField
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
        console.log('Solar System Sun disposed');
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemSun;
}
