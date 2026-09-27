import * as THREE from 'three';

/**
 * InteractiveObject - Base Class for Interactive 3D Elements
 * Features:
 * - Pulsing holographic aura ring on ground
 * - Floating billboard action prompt ("[E] Nhặt Thùng", "[E] Kiểm Kê Cân", "[E] Máy POS", etc.)
 * - Automatic proximity detection & trigger handling
 */
export class InteractiveObject {
  /**
   * @param {Object} options
   * @param {string} options.id Unique ID
   * @param {string} options.type 'crate' | 'scale' | 'pos' | 'npc' | 'ticket'
   * @param {string} options.promptText Prompt title e.g. "Nhấc Thùng Cà Phê"
   * @param {string} options.keyHint e.g. "[E] Nhặt" or "[E] Tương Tác"
   * @param {number} options.radius Interaction distance (meters)
   * @param {THREE.Object3D} options.mesh 3D Mesh representation
   * @param {Function} options.onInteract Callback when player interacts
   */
  constructor(options = {}) {
    this.id = options.id || THREE.MathUtils.generateUUID();
    this.type = options.type || 'generic';
    this.promptText = options.promptText || 'Tương Tác';
    this.keyHint = options.keyHint || '[E]';
    this.radius = options.radius || 2.8;
    this.isPickupable = !!options.isPickupable;
    this.onInteract = options.onInteract || null;

    this.group = new THREE.Group();
    this.group.name = `Interactive_${this.type}_${this.id}`;

    // Host the provided mesh
    this.mesh = options.mesh || new THREE.Group();
    this.group.add(this.mesh);

    // Dynamic prompt & aura
    this.isNearPlayer = false;
    this._createAuraRing();
    this._createPromptSprite();

    // Pulse animation timer
    this.auraTimer = Math.random() * Math.PI * 2;
  }

  _createAuraRing() {
    // Holographic ground aura ring
    const ringGeo = new THREE.RingGeometry(this.radius * 0.45, this.radius * 0.55, 32);
    ringGeo.rotateX(-Math.PI / 2);

    const auraColor = this._getAuraColor();
    this.auraMat = new THREE.MeshBasicMaterial({
      color: auraColor,
      transparent: true,
      opacity: 0.0, // hidden until player is near
      side: THREE.DoubleSide
    });

    this.auraMesh = new THREE.Mesh(ringGeo, this.auraMat);
    this.auraMesh.position.y = 0.04; // slightly above ground to prevent z-fighting
    this.group.add(this.auraMesh);
  }

  _getAuraColor() {
    switch (this.type) {
      case 'crate': return 0xf59e0b; // Amber
      case 'scale': return 0x10b981; // Emerald Green
      case 'pos': return 0x38bdf8; // Sky Blue
      case 'npc': return 0xa855f7; // Purple
      case 'ticket': return 0xef4444; // Red
      default: return 0x06b6d4; // Cyan
    }
  }

  _createPromptSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 110;
    this.promptCanvas = canvas;
    this.promptCtx = canvas.getContext('2d');

    this._drawPromptCanvas();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.promptTexture = tex;

    this.promptMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.0
    });

    this.promptSprite = new THREE.Sprite(this.promptMat);
    this.promptSprite.scale.set(2.4, 0.7, 1);
    this.promptSprite.position.set(0, 2.2, 0);
    this.group.add(this.promptSprite);
  }

  _drawPromptCanvas() {
    const ctx = this.promptCtx;
    ctx.clearRect(0, 0, 384, 110);

    // Pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 368, 94, 20);
    ctx.fill();

    const strokeColor = '#' + new THREE.Color(this._getAuraColor()).getHexString();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Key badge [E] or [CHẠM]
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect(24, 26, 75, 58, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Segoe UI", Arial, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('E', 61, 67);

    // Prompt Action text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.promptText, 112, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Nhấn E hoặc Chạm màn hình', 112, 78);
  }

  setPromptText(newText) {
    this.promptText = newText;
    this._drawPromptCanvas();
    if (this.promptTexture) this.promptTexture.needsUpdate = true;
  }

  /**
   * Check proximity to player
   */
  checkProximity(playerPos) {
    const distSq = this.group.position.distanceToSquared(playerPos);
    const inRange = distSq <= this.radius * this.radius;

    if (inRange !== this.isNearPlayer) {
      this.isNearPlayer = inRange;
      this.onProximityChanged(inRange);
    }
    return inRange;
  }

  onProximityChanged(inRange) {
    // Can override or emit
  }

  /**
   * Execute interaction
   */
  interact(player) {
    if (this.onInteract) {
      return this.onInteract(player, this);
    }
    return null;
  }

  /**
   * Per-frame update for floating prompt and spinning aura
   */
  update(delta) {
    this.auraTimer += delta * 2.8;

    if (this.isNearPlayer) {
      // Fade in smoothly
      this.auraMat.opacity = THREE.MathUtils.lerp(this.auraMat.opacity, 0.75 + Math.sin(this.auraTimer) * 0.2, delta * 8);
      this.promptMat.opacity = THREE.MathUtils.lerp(this.promptMat.opacity, 1.0, delta * 8);

      // Rotate aura slowly
      this.auraMesh.rotation.y += delta * 1.2;

      // Bob prompt sprite
      this.promptSprite.position.y = 2.2 + Math.sin(this.auraTimer * 1.5) * 0.08;
    } else {
      // Fade out
      this.auraMat.opacity = THREE.MathUtils.lerp(this.auraMat.opacity, 0, delta * 6);
      this.promptMat.opacity = THREE.MathUtils.lerp(this.promptMat.opacity, 0, delta * 6);
    }

    // Call update on nested mesh if it has one
    if (this.mesh && this.mesh.userData && this.mesh.userData.update) {
      this.mesh.userData.update(delta);
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
}
