// ניהול המצלמה והניווט במערכת השמש
class SolarSystemCamera {
    constructor() {
        this.camera = null;
        this.controls = null;
        this.isInitialized = false;
        
        // הגדרות מצלמה
        this.settings = {
            fov: 75,
            near: 0.1,
            far: 10000,
            position: { x: 100, y: 50, z: 100 },
            target: { x: 0, y: 0, z: 0 }
        };
        
        // מצבי תצוגה שונים
        this.viewModes = {
            FREE: 'free',           // תצוגה חופשית
            FOLLOW: 'follow',       // מעקב אחר כוכב לכת
            ORBIT: 'orbit',         // הקפה סביב כוכב לכת
            COCKPIT: 'cockpit',     // תצוגה מכוכב לכת
            SOLAR_SYSTEM: 'system'  // תצוגה כללית של המערכת
        };
        
        this.currentMode = this.viewModes.FREE;
        this.targetPlanet = null;
        
        // הגדרות אנימציה
        this.animation = {
            isAnimating: false,
            duration: 2000,
            startTime: 0,
            startPosition: new THREE.Vector3(),
            startTarget: new THREE.Vector3(),
            endPosition: new THREE.Vector3(),
            endTarget: new THREE.Vector3(),
            easingFunction: null
        };
        
        // מגבלות תנועה
        this.limits = {
            minDistance: 5,
            maxDistance: 5000,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            enablePan: true,
            enableZoom: true,
            enableRotate: true
        };
        
        // רגישות בקרות
        this.sensitivity = {
            mouse: 1.0,
            wheel: 1.0,
            touch: 1.0,
            keyboard: 1.0
        };
        
        // מצבים מוגדרים מראש
        this.presets = {
            overview: {
                position: { x: 0, y: 200, z: 300 },
                target: { x: 0, y: 0, z: 0 }
            },
            inner: {
                position: { x: 50, y: 20, z: 50 },
                target: { x: 0, y: 0, z: 0 }
            },
            outer: {
                position: { x: 500, y: 100, z: 500 },
                target: { x: 0, y: 0, z: 0 }
            }
        };
    }

    // אתחול המצלמה
    init(aspect = window.innerWidth / window.innerHeight) {
        try {
            // יצירת מצלמה פרספקטיבית
            this.camera = new THREE.PerspectiveCamera(
                this.settings.fov,
                aspect,
                this.settings.near,
                this.settings.far
            );
            
            // הגדרת מיקום ראשוני
            this.camera.position.set(
                this.settings.position.x,
                this.settings.position.y,
                this.settings.position.z
            );
            
            this.camera.lookAt(
                this.settings.target.x,
                this.settings.target.y,
                this.settings.target.z
            );
            
            this.isInitialized = true;
            console.log('Solar System Camera initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            return false;
        }
    }

    // הגדרת בקרות מצלמה
    setupControls(domElement, controlsType = 'orbit') {
        if (!this.camera) {
            console.error('Camera must be initialized before setting up controls');
            return false;
        }

        try {
            switch(controlsType) {
                case 'orbit':
                    this.setupOrbitControls(domElement);
                    break;
                case 'fly':
                    this.setupFlyControls(domElement);
                    break;
                case 'first-person':
                    this.setupFirstPersonControls(domElement);
                    break;
                default:
                    this.setupOrbitControls(domElement);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to setup camera controls:', error);
            return false;
        }
    }

    // הגדרת בקרות orbit
    setupOrbitControls(domElement) {
        // מימוש פשוט של orbit controls
        this.controls = {
            enabled: true,
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: this.limits.enableZoom,
            enableRotate: this.limits.enableRotate,
            enablePan: this.limits.enablePan,
            
            mouseButtons: {
                LEFT: 'rotate',
                MIDDLE: 'dolly',
                RIGHT: 'pan'
            },
            
            // מצב עכבר
            mouse: { x: 0, y: 0 },
            mouseDown: false,
            mouseButton: null,
            
            // מצב מגע
            touches: [],
            
            update: () => {
                if (this.controls.enableDamping) {
                    // דעיכת תנועה עדינה
                    this.camera.updateProjectionMatrix();
                }
            }
        };
        
        this.attachControlEvents(domElement);
    }

    // חיבור אירועי בקרה
    attachControlEvents(domElement) {
        // אירועי עכבר
        domElement.addEventListener('mousedown', (event) => {
            this.onMouseDown(event);
        });
        
        domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        domElement.addEventListener('mouseup', (event) => {
            this.onMouseUp(event);
        });
        
        domElement.addEventListener('wheel', (event) => {
            this.onMouseWheel(event);
        });
        
        // אירועי מגע
        domElement.addEventListener('touchstart', (event) => {
            this.onTouchStart(event);
        });
        
        domElement.addEventListener('touchmove', (event) => {
            this.onTouchMove(event);
        });
        
        domElement.addEventListener('touchend', (event) => {
            this.onTouchEnd(event);
        });
        
        // אירועי מקלדת
        document.addEventListener('keydown', (event) => {
            this.onKeyDown(event);
        });
    }

    // טיפול באירועי עכבר
    onMouseDown(event) {
        if (!this.controls || !this.controls.enabled) return;
        
        this.controls.mouseDown = true;
        this.controls.mouse.x = event.clientX;
        this.controls.mouse.y = event.clientY;
        
        switch(event.button) {
            case 0: // לחצן שמאל
                this.controls.mouseButton = this.controls.mouseButtons.LEFT;
                break;
            case 1: // לחצן אמצע
                this.controls.mouseButton = this.controls.mouseButtons.MIDDLE;
                break;
            case 2: // לחצן ימין
                this.controls.mouseButton = this.controls.mouseButtons.RIGHT;
                break;
        }
        
        event.preventDefault();
    }

    onMouseMove(event) {
        if (!this.controls || !this.controls.enabled || !this.controls.mouseDown) return;
        
        const deltaX = event.clientX - this.controls.mouse.x;
        const deltaY = event.clientY - this.controls.mouse.y;
        
        switch(this.controls.mouseButton) {
            case 'rotate':
                this.rotateCamera(deltaX, deltaY);
                break;
            case 'pan':
                this.panCamera(deltaX, deltaY);
                break;
            case 'dolly':
                this.dollyCamera(deltaY);
                break;
        }
        
        this.controls.mouse.x = event.clientX;
        this.controls.mouse.y = event.clientY;
        
        event.preventDefault();
    }

    onMouseUp(event) {
        if (!this.controls) return;
        
        this.controls.mouseDown = false;
        this.controls.mouseButton = null;
        
        event.preventDefault();
    }

    onMouseWheel(event) {
        if (!this.controls || !this.controls.enabled || !this.controls.enableZoom) return;
        
        const delta = event.deltaY > 0 ? 1 : -1;
        this.zoomCamera(delta * this.sensitivity.wheel);
        
        event.preventDefault();
    }

    // סיבוב מצלמה
    rotateCamera(deltaX, deltaY) {
        if (!this.controls.enableRotate) return;
        
        const rotateSpeed = 0.005 * this.sensitivity.mouse;
        
        // חישוב זוויות סיבוב
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        offset.copy(this.camera.position).sub(new THREE.Vector3(0, 0, 0));
        spherical.setFromVector3(offset);
        
        spherical.theta -= deltaX * rotateSpeed;
        spherical.phi += deltaY * rotateSpeed;
        
        // הגבלת זווית אנכית
        spherical.phi = Math.max(this.limits.minPolarAngle, 
                                Math.min(this.limits.maxPolarAngle, spherical.phi));
        
        offset.setFromSpherical(spherical);
        this.camera.position.copy(offset);
        this.camera.lookAt(0, 0, 0);
    }

    // הזזת מצלמה
    panCamera(deltaX, deltaY) {
        if (!this.limits.enablePan) return;
        
        const panSpeed = 0.5 * this.sensitivity.mouse;
        const offset = new THREE.Vector3();
        
        // חישוב כיוון ההזזה
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        const right = new THREE.Vector3();
        right.crossVectors(cameraDirection, this.camera.up).normalize();
        
        const up = new THREE.Vector3();
        up.crossVectors(right, cameraDirection).normalize();
        
        offset.addScaledVector(right, -deltaX * panSpeed);
        offset.addScaledVector(up, deltaY * panSpeed);
        
        this.camera.position.add(offset);
    }

    // זום מצלמה
    zoomCamera(delta) {
        this.dollyCamera(delta * 10);
    }

    dollyCamera(delta) {
        if (!this.limits.enableZoom) return;
        
        const dollySpeed = 0.1;
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const distance = this.camera.position.length();
        const newDistance = Math.max(this.limits.minDistance, 
                                   Math.min(this.limits.maxDistance, 
                                          distance + delta * dollySpeed));
        
        const scale = newDistance / distance;
        this.camera.position.multiplyScalar(scale);
    }

    // טיפול באירועי מקלדת
    onKeyDown(event) {
        if (!this.controls || !this.controls.enabled) return;
        
        const moveSpeed = 5 * this.sensitivity.keyboard;
        const offset = new THREE.Vector3();
        
        switch(event.code) {
            case 'KeyW':
                this.camera.getWorldDirection(offset);
                offset.multiplyScalar(moveSpeed);
                break;
            case 'KeyS':
                this.camera.getWorldDirection(offset);
                offset.multiplyScalar(-moveSpeed);
                break;
            case 'KeyA':
                offset.crossVectors(this.camera.up, new THREE.Vector3());
                this.camera.getWorldDirection(offset);
                offset.normalize().multiplyScalar(moveSpeed);
                break;
            case 'KeyD':
                offset.crossVectors(new THREE.Vector3(), this.camera.up);
                this.camera.getWorldDirection(offset);
                offset.normalize().multiplyScalar(moveSpeed);
                break;
            case 'KeyQ':
                offset.copy(this.camera.up).multiplyScalar(moveSpeed);
                break;
            case 'KeyE':
                offset.copy(this.camera.up).multiplyScalar(-moveSpeed);
                break;
            case 'Space':
                this.resetView();
                break;
        }
        
        if (offset.length() > 0) {
            this.camera.position.add(offset);
        }
    }

    // מעבר למצב תצוגה
    setViewMode(mode, targetPlanet = null) {
        this.currentMode = mode;
        this.targetPlanet = targetPlanet;
        
        switch(mode) {
            case this.viewModes.FREE:
                this.setFreeMode();
                break;
            case this.viewModes.FOLLOW:
                this.setFollowMode(targetPlanet);
                break;
            case this.viewModes.ORBIT:
                this.setOrbitMode(targetPlanet);
                break;
            case this.viewModes.COCKPIT:
                this.setCockpitMode(targetPlanet);
                break;
            case this.viewModes.SOLAR_SYSTEM:
                this.setSolarSystemMode();
                break;
        }
    }

    // מצב תצוגה חופשית
    setFreeMode() {
        if (this.controls) {
            this.controls.enabled = true;
        }
    }

    // מצב מעקב
    setFollowMode(planetName) {
        if (this.controls) {
            this.controls.enabled = false;
        }
        // המעקב יתבצע בפונקציית update
    }

    // מצב הקפה
    setOrbitMode(planetName) {
        if (this.controls) {
            this.controls.enabled = true;
        }
        // מרכז ההקפה יוגדר לכוכב הלכת
    }

    // אנימציה למיקום חדש
    animateToPosition(targetPosition, targetLookAt, duration = 2000, easing = null) {
        this.animation.isAnimating = true;
        this.animation.duration = duration;
        this.animation.startTime = performance.now();
        this.animation.easingFunction = easing || MathUtils.easing.easeInOutCubic;
        
        this.animation.startPosition.copy(this.camera.position);
        this.animation.endPosition.copy(targetPosition);
        
        // חישוב target
        const currentTarget = new THREE.Vector3();
        this.camera.getWorldDirection(currentTarget);
        currentTarget.multiplyScalar(100).add(this.camera.position);
        
        this.animation.startTarget.copy(currentTarget);
        this.animation.endTarget.copy(targetLookAt);
    }

    // מעבר לכוכב לכת
    focusOnPlanet(planetName, distance = 50) {
        const planetData = PLANETS_DATA[planetName];
        if (!planetData) return;
        
        // חישוב מיקום יעד
        const planetPosition = this.getPlanetPosition(planetName);
        const targetPosition = planetPosition.clone();
        targetPosition.add(new THREE.Vector3(distance, distance * 0.5, distance));
        
        this.animateToPosition(targetPosition, planetPosition);
    }

    // קבלת מיקום כוכב לכת
    getPlanetPosition(planetName) {
        // זה יתחבר למערכת הכוכבים העיקרית
        if (window.solarSystemScene && window.solarSystemScene.planets) {
            const planet = window.solarSystemScene.planets.get(planetName);
            return planet ? planet.position.clone() : new THREE.Vector3();
        }
        return new THREE.Vector3();
    }

    // איפוס תצוגה
    resetView() {
        const preset = this.presets.overview;
        this.animateToPosition(
            new THREE.Vector3(preset.position.x, preset.position.y, preset.position.z),
            new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z)
        );
    }

    // הגדרת preset
    setPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        this.animateToPosition(
            new THREE.Vector3(preset.position.x, preset.position.y, preset.position.z),
            new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z)
        );
    }

    // עדכון המצלמה
    update(deltaTime) {
        if (!this.camera) return;
        
        // עדכון אנימציה
        if (this.animation.isAnimating) {
            this.updateAnimation();
        }
        
        // עדכון בקרות
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        
        // עדכון מצבי תצוגה מיוחדים
        this.updateViewMode(deltaTime);
    }

    // עדכון אנימציה
    updateAnimation() {
        const now = performance.now();
        const elapsed = now - this.animation.startTime;
        const progress = Math.min(elapsed / this.animation.duration, 1);
        
        const easedProgress = this.animation.easingFunction(progress);
        
        // אינטרפולציה של מיקום
        this.camera.position.lerpVectors(
            this.animation.startPosition,
            this.animation.endPosition,
            easedProgress
        );
        
        // אינטרפולציה של מבט
        const currentTarget = new THREE.Vector3();
        currentTarget.lerpVectors(
            this.animation.startTarget,
            this.animation.endTarget,
            easedProgress
        );
        
        this.camera.lookAt(currentTarget);
        
        if (progress >= 1) {
            this.animation.isAnimating = false;
        }
    }

    // עדכון מצבי תצוגה
    updateViewMode(deltaTime) {
        switch(this.currentMode) {
            case this.viewModes.FOLLOW:
                this.updateFollowMode();
                break;
            case this.viewModes.ORBIT:
                this.updateOrbitMode(deltaTime);
                break;
            case this.viewModes.COCKPIT:
                this.updateCockpitMode();
                break;
        }
    }

    // עדכון מצב מעקב
    updateFollowMode() {
        if (!this.targetPlanet) return;
        
        const planetPosition = this.getPlanetPosition(this.targetPlanet);
        const offset = new THREE.Vector3(50, 25, 50);
        
        this.camera.position.copy(planetPosition).add(offset);
        this.camera.lookAt(planetPosition);
    }

    // עדכון מצב הקפה
    updateOrbitMode(deltaTime) {
        if (!this.targetPlanet) return;
        
        const planetPosition = this.getPlanetPosition(this.targetPlanet);
        const radius = 50;
        const speed = 0.001;
        
        const angle = performance.now() * speed;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        this.camera.position.set(
            planetPosition.x + x,
            planetPosition.y + 25,
            planetPosition.z + z
        );
        
        this.camera.lookAt(planetPosition);
    }

    // טיפול בשינוי גודל מסך
    handleResize(width, height) {
        if (!this.camera) return;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    // הגדרת מגבלות תנועה
    setLimits(limits) {
        Object.assign(this.limits, limits);
        
        if (this.controls) {
            this.controls.enableZoom = this.limits.enableZoom;
            this.controls.enableRotate = this.limits.enableRotate;
            this.controls.enablePan = this.limits.enablePan;
        }
    }

    // הגדרת רגישות
    setSensitivity(type, value) {
        if (this.sensitivity.hasOwnProperty(type)) {
            this.sensitivity[type] = Math.max(0.1, Math.min(5.0, value));
        }
    }

    // קבלת מידע על המצלמה
    getCameraInfo() {
        if (!this.camera) return null;
        
        return {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            fov: this.camera.fov,
            aspect: this.camera.aspect,
            near: this.camera.near,
            far: this.camera.far,
            mode: this.currentMode,
            targetPlanet: this.targetPlanet,
            isAnimating: this.animation.isAnimating
        };
    }

    // שמירת מצב המצלמה
    saveState() {
        if (!this.camera) return null;
        
        return {
            position: this.camera.position.toArray(),
            rotation: this.camera.rotation.toArray(),
            fov: this.camera.fov,
            mode: this.currentMode,
            targetPlanet: this.targetPlanet,
            timestamp: Date.now()
        };
    }

    // טעינת מצב המצלמה
    loadState(state) {
        if (!this.camera || !state) return false;
        
        try {
            this.camera.position.fromArray(state.position);
            this.camera.rotation.fromArray(state.rotation);
            this.camera.fov = state.fov;
            this.camera.updateProjectionMatrix();
            
            if (state.mode) {
                this.setViewMode(state.mode, state.targetPlanet);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load camera state:', error);
            return false;
        }
    }

    // יצירת raycast ממיקום מסך
    createRayFromScreen(screenX, screenY, canvasWidth, canvasHeight) {
        if (!this.camera) return null;
        
        const mouse = new THREE.Vector2();
        mouse.x = (screenX / canvasWidth) * 2 - 1;
        mouse.y = -(screenY / canvasHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        return raycaster;
    }

    // בדיקת חיתוך עם אובייקטים
    intersectObjects(screenX, screenY, objects, canvasWidth, canvasHeight) {
        const raycaster = this.createRayFromScreen(screenX, screenY, canvasWidth, canvasHeight);
        if (!raycaster) return [];
        
        return raycaster.intersectObjects(objects, true);
    }

    // חישוב מרחק מנקודה
    distanceToPoint(point) {
        if (!this.camera) return Infinity;
        return this.camera.position.distanceTo(point);
    }

    // בדיקה אם נקודה בתוך frustum
    isPointVisible(point) {
        if (!this.camera) return false;
        
        const frustum = new THREE.Frustum();
        const cameraMatrix = new THREE.Matrix4();
        
        cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(cameraMatrix);
        
        return frustum.containsPoint(point);
    }

    // חישוב גודל אובייקט על המסך
    getScreenSize(objectSize, distance) {
        if (!this.camera) return 0;
        
        const fovRadians = (this.camera.fov * Math.PI) / 180;
        const angularSize = 2 * Math.atan(objectSize / (2 * distance));
        
        return angularSize / fovRadians;
    }

    // המרת מיקום עולם למיקום מסך
    worldToScreen(worldPosition, canvasWidth, canvasHeight) {
        if (!this.camera) return null;
        
        const vector = worldPosition.clone();
        vector.project(this.camera);
        
        return {
            x: (vector.x * 0.5 + 0.5) * canvasWidth,
            y: (vector.y * -0.5 + 0.5) * canvasHeight,
            z: vector.z
        };
    }

    // המרת מיקום מסך למיקום עולם
    screenToWorld(screenX, screenY, depth, canvasWidth, canvasHeight) {
        if (!this.camera) return null;
        
        const mouse = new THREE.Vector2();
        mouse.x = (screenX / canvasWidth) * 2 - 1;
        mouse.y = -(screenY / canvasHeight) * 2 + 1;
        
        const vector = new THREE.Vector3(mouse.x, mouse.y, depth);
        vector.unproject(this.camera);
        
        return vector;
    }

    // יצירת מסלול אנימציה מותאם אישית
    createCustomPath(waypoints, duration = 5000) {
        if (!waypoints || waypoints.length < 2) return;
        
        const path = new THREE.CatmullRomCurve3(waypoints);
        
        const animateAlongPath = (startTime) => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const position = path.getPointAt(progress);
            const tangent = path.getTangentAt(progress);
            
            this.camera.position.copy(position);
            this.camera.lookAt(position.clone().add(tangent));
            
            if (progress < 1) {
                requestAnimationFrame(() => animateAlongPath(startTime));
            }
        };
        
        animateAlongPath(performance.now());
    }

    // הקלטת מסלול מצלמה
    startRecording() {
        this.recording = {
            isRecording: true,
            startTime: performance.now(),
            keyframes: []
        };
    }

    // עצירת הקלטה
    stopRecording() {
        if (!this.recording || !this.recording.isRecording) return null;
        
        this.recording.isRecording = false;
        const recordingData = { ...this.recording };
        this.recording = null;
        
        return recordingData;
    }

    // שמירת keyframe במהלך הקלטה
    recordKeyframe() {
        if (!this.recording || !this.recording.isRecording || !this.camera) return;
        
        const timestamp = performance.now() - this.recording.startTime;
        const keyframe = {
            timestamp,
            position: this.camera.position.toArray(),
            rotation: this.camera.rotation.toArray(),
            fov: this.camera.fov
        };
        
        this.recording.keyframes.push(keyframe);
    }

    // השמעת הקלטה
    playRecording(recordingData) {
        if (!recordingData || !recordingData.keyframes.length) return;
        
        const startTime = performance.now();
        const keyframes = recordingData.keyframes;
        let currentIndex = 0;
        
        const playFrame = () => {
            const elapsed = performance.now() - startTime;
            
            // מציאת keyframe הנוכחי והבא
            while (currentIndex < keyframes.length - 1 && 
                   keyframes[currentIndex + 1].timestamp <= elapsed) {
                currentIndex++;
            }
            
            if (currentIndex >= keyframes.length - 1) {
                // סיום השמעה
                return;
            }
            
            const current = keyframes[currentIndex];
            const next = keyframes[currentIndex + 1];
            
            // אינטרפולציה בין keyframes
            const progress = (elapsed - current.timestamp) / 
                           (next.timestamp - current.timestamp);
            
            const currentPos = new THREE.Vector3().fromArray(current.position);
            const nextPos = new THREE.Vector3().fromArray(next.position);
            const currentRot = new THREE.Euler().fromArray(current.rotation);
            const nextRot = new THREE.Euler().fromArray(next.rotation);
            
            this.camera.position.lerpVectors(currentPos, nextPos, progress);
            this.camera.rotation.set(
                THREE.MathUtils.lerp(currentRot.x, nextRot.x, progress),
                THREE.MathUtils.lerp(currentRot.y, nextRot.y, progress),
                THREE.MathUtils.lerp(currentRot.z, nextRot.z, progress)
            );
            this.camera.fov = THREE.MathUtils.lerp(current.fov, next.fov, progress);
            this.camera.updateProjectionMatrix();
            
            requestAnimationFrame(playFrame);
        };
        
        playFrame();
    }

    // פונקציות עזר לניבוט מהיר
    quickNavigation = {
        // זום לכוכב לכת הקרוב ביותר
        zoomToNearestPlanet: () => {
            if (!window.solarSystemScene) return;
            
            let nearestPlanet = null;
            let nearestDistance = Infinity;
            
            window.solarSystemScene.planets.forEach((planet, name) => {
                const distance = this.camera.position.distanceTo(planet.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPlanet = name;
                }
            });
            
            if (nearestPlanet) {
                this.focusOnPlanet(nearestPlanet);
            }
        },
        
        // סיבוב 360 מעלות סביב המערכת
        orbitSolarSystem: (duration = 10000) => {
            const radius = this.camera.position.length();
            const center = new THREE.Vector3(0, 0, 0);
            
            const waypoints = [];
            for (let i = 0; i <= 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                waypoints.push(new THREE.Vector3(x, this.camera.position.y, z));
            }
            
            this.createCustomPath(waypoints, duration);
        },
        
        // מעבר בין כוכבי הלכת
        tourPlanets: (duration = 20000) => {
            if (!window.solarSystemScene) return;
            
            const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
            const waypoints = [];
            
            planetNames.forEach(name => {
                const planet = window.solarSystemScene.planets.get(name);
                if (planet) {
                    const position = planet.position.clone();
                    position.add(new THREE.Vector3(30, 15, 30));
                    waypoints.push(position);
                }
            });
            
            if (waypoints.length > 0) {
                this.createCustomPath(waypoints, duration);
            }
        }
    };

    // פונקציית דיבוג
    debug() {
        if (!this.camera) {
            console.log('Camera not initialized');
            return;
        }
        
        console.group('Solar System Camera Debug');
        console.log('Position:', this.camera.position);
        console.log('Rotation:', this.camera.rotation);
        console.log('FOV:', this.camera.fov);
        console.log('Mode:', this.currentMode);
        console.log('Target Planet:', this.targetPlanet);
        console.log('Is Animating:', this.animation.isAnimating);
        console.log('Controls Enabled:', this.controls ? this.controls.enabled : 'No controls');
        console.groupEnd();
    }

    // ניקוי משאבים
    dispose() {
        if (this.controls) {
            // הסרת מאזינים
            if (this.controls.domElement) {
                this.controls.domElement.removeEventListener('mousedown', this.onMouseDown);
                this.controls.domElement.removeEventListener('mousemove', this.onMouseMove);
                this.controls.domElement.removeEventListener('mouseup', this.onMouseUp);
                this.controls.domElement.removeEventListener('wheel', this.onMouseWheel);
            }
        }
        
        this.camera = null;
        this.controls = null;
        this.isInitialized = false;
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemCamera;
}
