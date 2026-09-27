/**
 * InputController.js - Unified Input Handler
 * Merges Keyboard, Mouse and Mobile Virtual Joystick & Touch buttons.
 */

export class InputController {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      action: false
    };

    // Virtual Joystick Vector (-1 to 1)
    this.joystickVector = { x: 0, y: 0 };
    this.isJoystickActive = false;

    // Action listener
    this.actionCallbacks = [];

    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture inputs if focused on an input element (if any)
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyE':
        case 'Space':
          if (!this.keys.action) {
            this.keys.action = true;
            this.triggerAction();
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
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
        case 'KeyE':
        case 'Space':
          this.keys.action = false;
          break;
      }
    });
  }

  setJoystickInput(x, y) {
    this.joystickVector.x = x;
    this.joystickVector.y = y;
    this.isJoystickActive = (Math.abs(x) > 0.05 || Math.abs(y) > 0.05);
  }

  resetJoystickInput() {
    this.joystickVector.x = 0;
    this.joystickVector.y = 0;
    this.isJoystickActive = false;
  }

  onAction(callback) {
    this.actionCallbacks.push(callback);
  }

  triggerAction() {
    this.actionCallbacks.forEach(cb => cb());
  }

  /**
   * Returns normalized 2D movement vector { x, z, isMoving }
   */
  getMoveVector() {
    let vx = 0;
    let vz = 0;

    // Keyboard inputs
    if (this.keys.forward) vz -= 1;
    if (this.keys.backward) vz += 1;
    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;

    // Combine with Joystick
    if (this.isJoystickActive) {
      vx += this.joystickVector.x;
      vz += this.joystickVector.y;
    }

    const length = Math.sqrt(vx * vx + vz * vz);
    if (length > 0.001) {
      // Normalize if exceeding unit length
      const scale = Math.min(1, length) / length;
      return {
        x: vx * scale,
        z: vz * scale,
        isMoving: true
      };
    }

    return { x: 0, z: 0, isMoving: false };
  }
}
