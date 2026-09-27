import * as THREE from 'three';

/**
 * InputController - Multi-platform Input Handling for IVT 3D Adventure
 * Supports:
 * - Keyboard (WASD, Arrow keys, Space jump, E interact)
 * - Mouse Drag Orbit & Scroll Zoom for 3rd-person Camera
 * - Click-to-move / Tap-to-move (Ground Raycasting)
 * - Touch Virtual Joystick & Mobile Action Buttons
 */
export class InputController {
  constructor(domElement, camera, groundMeshes = []) {
    this.domElement = domElement || document.body;
    this.camera = camera;
    this.groundMeshes = groundMeshes;

    // Keyboard state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      interact: false
    };

    // Single-trigger actions (consumed on read)
    this.actionInteract = false;
    this.actionJump = false;

    // Mobile virtual joystick input (-1.0 to 1.0)
    this.joystick = { x: 0, y: 0, active: false };

    // Click-to-move navigation
    this.raycaster = new THREE.Raycaster();
    this.mouseCoords = new THREE.Vector2();
    this.navTarget = null; // THREE.Vector3 or null
    this.isClickMoving = false;
    this.clickMoveTolerance = 0.5;

    // Camera 3rd-person Orbit Control State
    this.orbit = {
      yaw: 0, // horizontal rotation angle in radians
      pitch: 0.35, // vertical pitch angle in radians
      minPitch: 0.05,
      maxPitch: 1.3,
      distance: 14,
      targetDistance: 14,
      minDistance: 5,
      maxDistance: 28,
      sensitivity: 0.005,
      zoomSpeed: 1.2
    };

    // Mouse drag state
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.hasDragged = false;

    // Touch orbit state
    this.activeTouches = new Map();
    this.touchPinchDist = 0;

    // Bind event listeners
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this.attach();
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.domElement.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    this.domElement.addEventListener('wheel', this._onWheel, { passive: false });

    // Touch events for mobile camera rotation & tap
    this.domElement.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('touchcancel', this._onTouchEnd);
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.domElement.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this.domElement.removeEventListener('wheel', this._onWheel);

    this.domElement.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('touchend', this._onTouchEnd);
    window.removeEventListener('touchcancel', this._onTouchEnd);
  }

  setGroundMeshes(meshes) {
    this.groundMeshes = meshes;
  }

  // --- KEYBOARD HANDLING ---

  _onKeyDown(e) {
    // Avoid interfering when typing in input fields
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        this.cancelClickMove();
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        this.cancelClickMove();
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        this.cancelClickMove();
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        this.cancelClickMove();
        break;
      case 'Space':
        if (!this.keys.jump) {
          this.actionJump = true;
        }
        this.keys.jump = true;
        break;
      case 'KeyE':
        if (!this.keys.interact) {
          this.actionInteract = true;
        }
        this.keys.interact = true;
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      case 'KeyE':
        this.keys.interact = false;
        break;
    }
  }

  // --- MOUSE ORBIT & CLICK-TO-MOVE ---

  _onMouseDown(e) {
    // Left or right button
    this.isDragging = true;
    this.hasDragged = false;
    this.dragStart.x = e.clientX;
    this.dragStart.y = e.clientY;
  }

  _onMouseMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.dragStart.x;
    const deltaY = e.clientY - this.dragStart.y;

    if (Math.hypot(deltaX, deltaY) > 5) {
      this.hasDragged = true;
    }

    this.orbit.yaw -= deltaX * this.orbit.sensitivity;
    this.orbit.pitch += deltaY * this.orbit.sensitivity;

    // Clamp pitch
    this.orbit.pitch = Math.max(this.orbit.minPitch, Math.min(this.orbit.maxPitch, this.orbit.pitch));

    this.dragStart.x = e.clientX;
    this.dragStart.y = e.clientY;
  }

  _onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // If mouse was clicked without significant dragging -> Raycast click-to-move
    if (!this.hasDragged && e.button === 0) {
      this._performClickToMove(e.clientX, e.clientY);
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const zoomDelta = Math.sign(e.deltaY) * this.orbit.zoomSpeed;
    this.orbit.targetDistance = THREE.MathUtils.clamp(
      this.orbit.targetDistance + zoomDelta,
      this.orbit.minDistance,
      this.orbit.maxDistance
    );
  }

  // --- TOUCH SUPPORT FOR MOBILE ---

  _onTouchStart(e) {
    // If touch target is an interactive UI button / joystick container, ignore
    if (e.target.closest && (e.target.closest('.joystick-zone') || e.target.closest('.ui-interactive'))) {
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isDragging = true;
      this.hasDragged = false;
      this.dragStart.x = touch.clientX;
      this.dragStart.y = touch.clientY;
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      this.isDragging = false;
      this.touchPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  _onTouchMove(e) {
    if (e.target.closest && (e.target.closest('.joystick-zone') || e.target.closest('.ui-interactive'))) {
      return;
    }

    if (e.touches.length === 1 && this.isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.dragStart.x;
      const deltaY = touch.clientY - this.dragStart.y;

      if (Math.hypot(deltaX, deltaY) > 8) {
        this.hasDragged = true;
      }

      this.orbit.yaw -= deltaX * this.orbit.sensitivity * 1.2;
      this.orbit.pitch += deltaY * this.orbit.sensitivity * 1.2;
      this.orbit.pitch = Math.max(this.orbit.minPitch, Math.min(this.orbit.maxPitch, this.orbit.pitch));

      this.dragStart.x = touch.clientX;
      this.dragStart.y = touch.clientY;
      e.preventDefault();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = this.touchPinchDist - dist;
      this.orbit.targetDistance = THREE.MathUtils.clamp(
        this.orbit.targetDistance + diff * 0.05,
        this.orbit.minDistance,
        this.orbit.maxDistance
      );
      this.touchPinchDist = dist;
      e.preventDefault();
    }
  }

  _onTouchEnd(e) {
    if (this.isDragging && !this.hasDragged && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      this._performClickToMove(touch.clientX, touch.clientY);
    }
    this.isDragging = false;
  }

  // --- CLICK TO MOVE RAYCASTING ---

  _performClickToMove(clientX, clientY) {
    if (!this.camera) return;

    const rect = this.domElement.getBoundingClientRect();
    this.mouseCoords.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseCoords.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseCoords, this.camera);

    let hitPoint = null;
    if (this.groundMeshes.length > 0) {
      const intersects = this.raycaster.intersectObjects(this.groundMeshes, true);
      if (intersects.length > 0) {
        hitPoint = intersects[0].point;
      }
    }

    // Fallback: Intersect with y = 0 infinite ground plane
    if (!hitPoint) {
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      hitPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(groundPlane, hitPoint);
    }

    if (hitPoint) {
      this.navTarget = new THREE.Vector3(hitPoint.x, 0, hitPoint.z);
      this.isClickMoving = true;
    }
  }

  cancelClickMove() {
    this.isClickMoving = false;
    this.navTarget = null;
  }

  // --- MOBILE VIRTUAL JOYSTICK & BUTTON API ---

  setJoystickVector(x, y) {
    this.joystick.x = THREE.MathUtils.clamp(x, -1, 1);
    this.joystick.y = THREE.MathUtils.clamp(y, -1, 1);
    this.joystick.active = Math.hypot(x, y) > 0.08;
    if (this.joystick.active) {
      this.cancelClickMove();
    }
  }

  triggerInteract() {
    this.actionInteract = true;
    this.keys.interact = true;
    setTimeout(() => { this.keys.interact = false; }, 100);
  }

  triggerJump() {
    this.actionJump = true;
    this.keys.jump = true;
    setTimeout(() => { this.keys.jump = false; }, 100);
  }

  consumeInteract() {
    const val = this.actionInteract;
    this.actionInteract = false;
    return val;
  }

  consumeJump() {
    const val = this.actionJump;
    this.actionJump = false;
    return val;
  }

  // --- COMPUTED MOVEMENT VECTOR ---

  /**
   * Computes the normalized movement vector in world space, aligned with camera yaw.
   * @param {THREE.Vector3} playerPosition Current player position for click-to-move check
   * @returns {THREE.Vector3} Normalized direction vector (x, 0, z) or (0,0,0)
   */
  getMovementVector(playerPosition) {
    const dir = new THREE.Vector3(0, 0, 0);

    // 1. Virtual Joystick input (overrides keyboard if active)
    if (this.joystick.active) {
      const forward = -this.joystick.y;
      const right = this.joystick.x;

      const sin = Math.sin(this.orbit.yaw);
      const cos = Math.cos(this.orbit.yaw);

      dir.x = right * cos - forward * sin;
      dir.z = right * sin + forward * cos;
      return dir.normalize();
    }

    // 2. Keyboard input
    let forward = 0;
    let right = 0;

    if (this.keys.forward) forward += 1;
    if (this.keys.backward) forward -= 1;
    if (this.keys.left) right -= 1;
    if (this.keys.right) right += 1;

    if (forward !== 0 || right !== 0) {
      const sin = Math.sin(this.orbit.yaw);
      const cos = Math.cos(this.orbit.yaw);

      dir.x = right * cos - forward * sin;
      dir.z = right * sin + forward * cos;
      return dir.normalize();
    }

    // 3. Click-to-move navigation
    if (this.isClickMoving && this.navTarget && playerPosition) {
      const toTarget = new THREE.Vector3()
        .copy(this.navTarget)
        .sub(playerPosition);
      toTarget.y = 0;

      const dist = toTarget.length();
      if (dist < this.clickMoveTolerance) {
        this.cancelClickMove();
        return dir;
      }
      return toTarget.normalize();
    }

    return dir;
  }

  /**
   * Update camera smooth zoom distance
   */
  update(delta) {
    // Smooth lerp distance
    this.orbit.distance = THREE.MathUtils.lerp(
      this.orbit.distance,
      this.orbit.targetDistance,
      Math.min(delta * 10, 1.0)
    );
  }
}
