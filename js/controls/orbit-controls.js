// בקרות orbit מותאמות למערכת השמש
class SolarSystemOrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // מצב הבקרות
        this.enabled = true;
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        
        // הגדרות תנועה
        this.enableZoom = true;
        this.enableRotate = true;
        this.enablePan = true;
        
        // מהירויות
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.panSpeed = 1.0;
        
        // מגבלות
        this.minDistance = 5;
        this.maxDistance = 5000;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        
        // מטרה ומיקום
        this.target = new THREE.Vector3(0, 0, 0);
        this.position0 = this.camera.position.clone();
        this.target0 = this.target.clone();
        this.zoom0 = this.camera.zoom;
        
        // מצב פנימי
        this.state = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_PAN: 4,
            TOUCH_DOLLY_PAN: 5,
            TOUCH_DOLLY_ROTATE: 6
        };
        
        this.currentState = this.state.NONE;
        
        // עכבר ומגע
        this.mouse = {
            left: { x: 0, y: 0 },
            right: { x: 0, y: 0 },
            middle: { x: 0, y: 0 }
        };
        
        this.touches = {
            one: { x: 0, y: 0 },
            two: { x: 0, y: 0 }
        };
        
        // קואורדינטות כדוריות
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        
        // הזזה
        this.panOffset = new THREE.Vector3();
        
        // זום/dolly
        this.scale = 1;
        
        // אירועים
        this.changeEvent = { type: 'change' };
        this.startEvent = { type: 'start' };
        this.endEvent = { type: 'end' };
        this.listeners = new Map();
        
        // הגדרת מאזינים
        this.setupEventListeners();
        
        // עדכון ראשוני
        this.update();
    }

    // הגדרת מאזיני אירועים
    setupEventListeners() {
        // אירועי עכבר
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
        
        // אירועי מגע
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        
        // אירועי מקלדת
        this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
        
        // מנע context menu
        this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
        
        // מאזינים גלובליים
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);
    }

    // עדכון הבקרות
    update() {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(
            this.camera.up,
            new THREE.Vector3(0, 1, 0)
        );
        const quatInverse = quat.clone().invert();
        
        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();
        
        return () => {
            const position = this.camera.position;
            
            offset.copy(position).sub(this.target);
            offset.applyQuaternion(quat);
            
            this.spherical.setFromVector3(offset);
            
            if (this.enableDamping) {
                this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
                this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
            } else {
                this.spherical.theta += this.sphericalDelta.theta;
                this.spherical.phi += this.sphericalDelta.phi;
            }
            
            // הגבלת זוויות
            let min = this.minAzimuthAngle;
            let max = this.maxAzimuthAngle;
            
            if (isFinite(min) && isFinite(max)) {
                if (min < -Math.PI) min += MathUtils.TWO_PI;
                else if (min > Math.PI) min -= MathUtils.TWO_PI;
                
                if (max < -Math.PI) max += MathUtils.TWO_PI;
                else if (max > Math.PI) max -= MathUtils.TWO_PI;
                
                if (min <= max) {
                    this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));
                } else {
                    this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
                        Math.max(min, this.spherical.theta) :
                        Math.min(max, this.spherical.theta);
                }
            }
            
            this.spherical.phi = Math.max(
                this.minPolarAngle,
                Math.min(this.maxPolarAngle, this.spherical.phi)
            );
            
            this.spherical.makeSafe();
            
            this.spherical.radius *= this.scale;
            this.spherical.radius = Math.max(
                this.minDistance,
                Math.min(this.maxDistance, this.spherical.radius)
            );
            
            // הוספת הזזה
            if (this.enableDamping) {
                this.target.addScaledVector(this.panOffset, this.dampingFactor);
            } else {
                this.target.add(this.panOffset);
            }
            
            offset.setFromSpherical(this.spherical);
            offset.applyQuaternion(quatInverse);
            
            position.copy(this.target).add(offset);
            this.camera.lookAt(this.target);
            
            if (this.enableDamping) {
                this.sphericalDelta.theta *= (1 - this.dampingFactor);
                this.sphericalDelta.phi *= (1 - this.dampingFactor);
                this.panOffset.multiplyScalar(1 - this.dampingFactor);
            } else {
                this.sphericalDelta.set(0, 0, 0);
                this.panOffset.set(0, 0, 0);
            }
            
            this.scale = 1;
            
            // בדיקת שינויים
            if (lastPosition.distanceToSquared(this.camera.position) > 1e-6 ||
                8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > 1e-6) {
                
                this.dispatchEvent(this.changeEvent);
                lastPosition.copy(this.camera.position);
                lastQuaternion.copy(this.camera.quaternion);
            }
        };
    }

    // טיפול בלחיצת עכבר
    onMouseDown(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        switch (event.button) {
            case 0: // לחצן שמאל
                if (event.ctrlKey || event.metaKey || event.shiftKey) {
                    if (!this.enablePan) return;
                    this.handleMouseDownPan(event);
                    this.currentState = this.state.PAN;
                } else {
                    if (!this.enableRotate) return;
                    this.handleMouseDownRotate(event);
                    this.currentState = this.state.ROTATE;
                }
                break;
                
            case 1: // לחצן אמצע
                if (!this.enableZoom) return;
                this.handleMouseDownDolly(event);
                this.currentState = this.state.DOLLY;
                break;
                
            case 2: // לחצן ימין
                if (!this.enablePan) return;
                this.handleMouseDownPan(event);
                this.currentState = this.state.PAN;
                break;
        }
        
        if (this.currentState !== this.state.NONE) {
            document.addEventListener('mousemove', this.boundMouseMove, false);
            document.addEventListener('mouseup', this.boundMouseUp, false);
            this.dispatchEvent(this.startEvent);
        }
    }

    // טיפול בתנועת עכבר
    onMouseMove(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        switch (this.currentState) {
            case this.state.ROTATE:
                if (!this.enableRotate) return;
                this.handleMouseMoveRotate(event);
                break;
                
            case this.state.DOLLY:
                if (!this.enableZoom) return;
                this.handleMouseMoveDolly(event);
                break;
                
            case this.state.PAN:
                if (!this.enablePan) return;
                this.handleMouseMovePan(event);
                break;
        }
    }

    // טיפול בשחרור עכבר
    onMouseUp(event) {
        if (!this.enabled) return;
        
        this.handleMouseUp(event);
        
        document.removeEventListener('mousemove', this.boundMouseMove, false);
        document.removeEventListener('mouseup', this.boundMouseUp, false);
        
        this.dispatchEvent(this.endEvent);
        this.currentState = this.state.NONE;
    }

    // טיפול בגלגל עכבר
    onMouseWheel(event) {
        if (!this.enabled || !this.enableZoom || 
            (this.currentState !== this.state.NONE && this.currentState !== this.state.ROTATE)) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        this.dispatchEvent(this.startEvent);
        this.handleMouseWheel(event);
        this.dispatchEvent(this.endEvent);
    }

    // מתודות טיפול בעכבר
    handleMouseDownRotate(event) {
        this.mouse.left.x = event.clientX;
        this.mouse.left.y = event.clientY;
    }

    handleMouseDownDolly(event) {
        this.mouse.middle.x = event.clientX;
        this.mouse.middle.y = event.clientY;
    }

    handleMouseDownPan(event) {
        this.mouse.right.x = event.clientX;
        this.mouse.right.y = event.clientY;
    }

    handleMouseMoveRotate(event) {
        const deltaX = event.clientX - this.mouse.left.x;
        const deltaY = event.clientY - this.mouse.left.y;
        
        const element = this.domElement;
        
        this.rotateLeft(2 * Math.PI * deltaX / element.clientHeight * this.rotateSpeed);
        this.rotateUp(2 * Math.PI * deltaY / element.clientHeight * this.rotateSpeed);
        
        this.mouse.left.x = event.clientX;
        this.mouse.left.y = event.clientY;
    }

    handleMouseMoveDolly(event) {
        const deltaY = event.clientY - this.mouse.middle.y;
        
        if (deltaY > 0) {
            this.dollyOut(this.getZoomScale());
        } else if (deltaY < 0) {
            this.dollyIn(this.getZoomScale());
        }
        
        this.mouse.middle.y = event.clientY;
    }

    handleMouseMovePan(event) {
        const deltaX = event.clientX - this.mouse.right.x;
        const deltaY = event.clientY - this.mouse.right.y;
        
        this.pan(deltaX, deltaY);
        
        this.mouse.right.x = event.clientX;
        this.mouse.right.y = event.clientY;
    }

    handleMouseUp(event) {
        // ניקוי מצב
    }

    handleMouseWheel(event) {
        let delta = 0;
        
        if (event.wheelDelta !== undefined) {
            delta = event.wheelDelta;
        } else if (event.detail !== undefined) {
            delta = -event.detail;
        }
        
        if (delta > 0) {
            this.dollyIn(this.getZoomScale());
        } else if (delta < 0) {
            this.dollyOut(this.getZoomScale());
        }
    }

    // טיפול במגע
    onTouchStart(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        
        switch (event.touches.length) {
            case 1:
                if (!this.enableRotate) return;
                this.handleTouchStartRotate(event);
                this.currentState = this.state.TOUCH_ROTATE;
                break;
                
            case 2:
                if (!this.enableZoom && !this.enablePan) return;
                this.handleTouchStartDollyPan(event);
                this.currentState = this.state.TOUCH_DOLLY_PAN;
                break;
                
            default:
                this.currentState = this.state.NONE;
        }
        
        if (this.currentState !== this.state.NONE) {
            this.dispatchEvent(this.startEvent);
        }
    }

    onTouchMove(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        switch (this.currentState) {
            case this.state.TOUCH_ROTATE:
                if (!this.enableRotate) return;
                this.handleTouchMoveRotate(event);
                break;
                
            case this.state.TOUCH_DOLLY_PAN:
                if (!this.enableZoom && !this.enablePan) return;
                this.handleTouchMoveDollyPan(event);
                break;
                
            default:
                this.currentState = this.state.NONE;
        }
    }

    onTouchEnd(event) {
        if (!this.enabled) return;
        
        this.handleTouchEnd(event);
        this.dispatchEvent(this.endEvent);
        this.currentState = this.state.NONE;
    }

    // מתודות טיפול במגע
    handleTouchStartRotate(event) {
        if (event.touches.length === 1) {
            this.touches.one.x = event.touches[0].pageX;
            this.touches.one.y = event.touches[0].pageY;
        } else {
            const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            
            this.touches.one.x = x;
            this.touches.one.y = y;
        }
    }

    handleTouchStartDollyPan(event) {
        if (this.enableZoom) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.touches.two.x = 0;
            this.touches.two.y = distance;
        }
        
        if (this.enablePan) {
            const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            
            this.touches.one.x = x;
            this.touches.one.y = y;
        }
    }

    handleTouchMoveRotate(event) {
        if (event.touches.length === 1) {
            const deltaX = event.touches[0].pageX - this.touches.one.x;
            const deltaY = event.touches[0].pageY - this.touches.one.y;
            
            const element = this.domElement;
            
            this.rotateLeft(2 * Math.PI * deltaX / element.clientHeight * this.rotateSpeed);
            this.rotateUp(2 * Math.PI * deltaY / element.clientHeight * this.rotateSpeed);
            
            this.touches.one.x = event.touches[0].pageX;
            this.touches.one.y = event.touches[0].pageY;
        } else {
            const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            
            const deltaX = x - this.touches.one.x;
            const deltaY = y - this.touches.one.y;
            
            const element = this.domElement;
            
            this.rotateLeft(2 * Math.PI * deltaX / element.clientHeight * this.rotateSpeed);
            this.rotateUp(2 * Math.PI * deltaY / element.clientHeight * this.rotateSpeed);
            
            this.touches.one.x = x;
            this.touches.one.y = y;
        }
    }

    handleTouchMoveDollyPan(event) {
        if (this.enableZoom) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.touches.two.y) {
                this.dollyOut(this.getZoomScale());
            } else if (distance < this.touches.two.y) {
                this.dollyIn(this.getZoomScale());
            }
            
            this.touches.two.y = distance;
        }
        
        if (this.enablePan) {
            const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            
            const deltaX = x - this.touches.one.x;
            const deltaY = y - this.touches.one.y;
            
            this.pan(deltaX, deltaY);
            
            this.touches.one.x = x;
            this.touches.one.y = y;
        }
    }

    handleTouchEnd(event) {
        // ניקוי מצב מגע
    }

    // טיפול במקלדת
    onKeyDown(event) {
        if (!this.enabled) return;
        
        switch (event.code) {
            case 'ArrowUp':
                this.pan(0, this.keyPanSpeed);
                break;
            case 'ArrowDown':
                this.pan(0, -this.keyPanSpeed);
                break;
            case 'ArrowLeft':
                this.pan(this.keyPanSpeed, 0);
                break;
            case 'ArrowRight':
                this.pan(-this.keyPanSpeed, 0);
                break;
        }
    }

    onContextMenu(event) {
        if (!this.enabled) return;
        event.preventDefault();
    }

    // פעולות בסיסיות
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }

    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }

    pan(deltaX, deltaY) {
        const element = this.domElement;
        
        if (this.camera.isPerspectiveCamera) {
            const position = this.camera.position;
            let offset = position.clone().sub(this.target);
            let targetDistance = offset.length();
            
            targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
            
            this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera.matrix);
            this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera.matrix);
            
        } else if (this.camera.isOrthographicCamera) {
            this.panLeft(deltaX * (this.camera.right - this.camera.left) / this.camera.zoom / element.clientWidth, this.camera.matrix);
            this.panUp(deltaY * (this.camera.top - this.camera.bottom) / this.camera.zoom / element.clientHeight, this.camera.matrix);
        }
    }

    panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        this.panOffset.add(v);
    }

    panUp(distance, objectMatrix) {
        const v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 1);
        v.multiplyScalar(distance);
        this.panOffset.add(v);
    }

    dollyOut(dollyScale) {
        if (this.camera.isPerspectiveCamera) {
            this.scale /= dollyScale;
        } else if (this.camera.isOrthographicCamera) {
            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
            this.camera.updateProjectionMatrix();
            this.dispatchEvent(this.changeEvent);
        }
    }

    dollyIn(dollyScale) {
        if (this.camera.isPerspectiveCamera) {
            this.scale *= dollyScale;
        } else if (this.camera.isOrthographicCamera) {
            this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom / dollyScale));
            this.camera.updateProjectionMatrix();
            this.dispatchEvent(this.changeEvent);
        }
    }

    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }

    // פונקציות כלליות
    saveState() {
        this.target0.copy(this.target);
        this.position0.copy(this.camera.position);
        this.zoom0 = this.camera.zoom;
    }

    reset() {
        this.target.copy(this.target0);
        this.camera.position.copy(this.position0);
        this.camera.zoom = this.zoom0;
        
        this.camera.updateProjectionMatrix();
        this.dispatchEvent(this.changeEvent);
        
        this.currentState = this.state.NONE;
    }

    // מערכת אירועים
    addEventListener(type, listener) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(listener);
    }

    removeEventListener(type, listener) {
        if (this.listeners.has(type)) {
            const listeners = this.listeners.get(type);
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    dispatchEvent(event) {
        if (this.listeners.has(event.type)) {
            this.listeners.get(event.type).forEach(listener => {
                listener(event);
            });
        }
    }

    // הגדרת מטרה חדשה
    setTarget(x, y, z) {
        this.target.set(x, y, z);
    }

    // מיקוד על נקודה ספציפית
    focusOn(position, distance = 100) {
        this.target.copy(position);
        
        const direction = this.camera.position.clone().sub(this.target).normalize();
        this.camera.position.copy(this.target).add(direction.multiplyScalar(distance));
        
        this.camera.lookAt(this.target);
        this.dispatchEvent(this.changeEvent);
    }

    // אנימציה חלקה למיקום חדש
    animateTo(targetPosition, cameraPosition, duration = 2000) {
        const startTarget = this.target.clone();
        const startCamera = this.camera.position.clone();
        const startTime = performance.now();
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = MathUtils.easing.easeInOutCubic(progress);
            
            this.target.lerpVectors(startTarget, targetPosition, easedProgress);
            this.camera.position.lerpVectors(startCamera, cameraPosition, easedProgress);
            
            this.camera.lookAt(this.target);
            this.dispatchEvent(this.changeEvent);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // ניקוי משאבים
    dispose() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('wheel', this.onMouseWheel, false);
        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);
        this.domElement.removeEventListener('keydown', this.onKeyDown, false);
        this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
        
        document.removeEventListener('mousemove', this.boundMouseMove, false);
        document.removeEventListener('mouseup', this.boundMouseUp, false);
        
        this.listeners.clear();
    }
}

// ייצוא המחלקה
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystemOrbitControls;
}
