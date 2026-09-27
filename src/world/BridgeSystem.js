import * as THREE from 'three';

/**
 * BridgeSystem - The "Cây Cầu Dữ Liệu" (Data Bridge) System
 * Connects West Bank (Zone 1: POS & Warehouse) to East Bank (Zone 2: Central Kitchen Island).
 * Consists of 6 modular data planks that materialize dynamically as the player completes quests.
 */
export class BridgeSystem {
  constructor(scene, audioSynth) {
    this.scene = scene;
    this.audioSynth = audioSynth;

    this.group = new THREE.Group();
    this.group.name = 'Data_Bridge_System';

    this.totalPlanks = 6;
    this.completedPlanks = 0;
    this.isCompleted = false;

    this.planks = [];
    this.animatingPlanks = [];

    // Invisible Barrier to block player crossing until 6/6
    this.barrier = null;

    // Callbacks
    this.onPlankBuilt = null;
    this.onBridgeCompleted = null;

    // Configuration
    this.bridgeStartX = -10.0;
    this.bridgeEndX = 10.0;
    this.bridgeZ = 0;
    this.bridgeWidth = 4.2;
    this.bridgeHeight = 0.25;

    this._initBridgeStructure();
    this._initBarrier();
    this.scene.add(this.group);
  }

  _initBridgeStructure() {
    // 1. Data Terminals / Gateway Pillars on West and East Banks
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.5, 3.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    const terminalPositions = [
      { x: this.bridgeStartX - 0.5, z: -this.bridgeWidth / 2 - 0.4 },
      { x: this.bridgeStartX - 0.5, z: this.bridgeWidth / 2 + 0.4 },
      { x: this.bridgeEndX + 0.5, z: -this.bridgeWidth / 2 - 0.4 },
      { x: this.bridgeEndX + 0.5, z: this.bridgeWidth / 2 + 0.4 }
    ];

    terminalPositions.forEach((pos, idx) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pos.x, 1.6, pos.z);
      pillar.castShadow = true;
      this.group.add(pillar);

      // Glowing Data Orb on top of pillar
      const orbGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.5,
        roughness: 0.1
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(pos.x, 3.4, pos.z);
      this.group.add(orb);

      // Point Light
      const orbLight = new THREE.PointLight(0x38bdf8, 1.5, 6);
      orbLight.position.set(pos.x, 3.5, pos.z);
      this.group.add(orbLight);
    });

    // 2. Continuous Energy Guide Rails along the bridge flanks
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7
    });

    [-this.bridgeWidth / 2 - 0.15, this.bridgeWidth / 2 + 0.15].forEach(z => {
      const railGeo = new THREE.BoxGeometry(this.bridgeEndX - this.bridgeStartX + 2, 0.15, 0.15);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, 0.85, z);
      this.group.add(rail);

      // Rail Support Posts
      for (let x = this.bridgeStartX; x <= this.bridgeEndX; x += 3.5) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8),
          ProceduralModels.materials.stainlessSteel
        );
        post.position.set(x, 0.45, z);
        this.group.add(post);
      }
    });

    // 3. Floating 3D Holographic Status Billboard above bridge
    this.statusBillboard = this._createStatusBillboard();
    this.statusBillboard.position.set(0, 4.2, 0);
    this.group.add(this.statusBillboard);

    // 4. Generate the 6 Bridge Planks
    const totalLength = this.bridgeEndX - this.bridgeStartX;
    const plankLength = totalLength / this.totalPlanks;

    for (let i = 0; i < this.totalPlanks; i++) {
      const plankCenter = this.bridgeStartX + plankLength * (i + 0.5);
      const plankGroup = this._createPlankMesh(plankLength * 0.96, this.bridgeWidth, i + 1);

      // Stored target position
      plankGroup.userData = {
        index: i,
        targetPos: new THREE.Vector3(plankCenter, this.bridgeHeight / 2, this.bridgeZ),
        isBuilt: false,
        plankLength: plankLength
      };

      // Initially set invisible / parked high in the cyber sky
      plankGroup.visible = false;
      plankGroup.position.set(plankCenter, 14.0, this.bridgeZ);

      // Also create a faint "Hologram Ghost" where the plank will go
      const ghostGeo = new THREE.BoxGeometry(plankLength * 0.92, 0.05, this.bridgeWidth * 0.95);
      const ghostMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const ghost = new THREE.Mesh(ghostGeo, ghostMat);
      ghost.position.set(plankCenter, 0.02, this.bridgeZ);
      this.group.add(ghost);

      this.group.add(plankGroup);
      this.planks.push(plankGroup);
    }
  }

  _createPlankMesh(length, width, number) {
    const group = new THREE.Group();
    group.name = `Bridge_Plank_${number}`;

    // Wooden Tech Base
    const baseGeo = new THREE.BoxGeometry(length, 0.2, width);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.4,
      roughness: 0.5
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Top Wooden Inlay Slats
    const slatMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.75
    });
    for (let z = -width / 2 + 0.4; z <= width / 2 - 0.4; z += 0.7) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(length * 0.95, 0.04, 0.55), slatMat);
      slat.position.set(0, 0.11, z);
      slat.castShadow = true;
      slat.receiveShadow = true;
      group.add(slat);
    }

    // Glowing Central Data Conduit Line
    const conduitGeo = new THREE.BoxGeometry(length, 0.02, 0.25);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2
    });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.position.set(0, 0.12, 0);
    group.add(conduit);

    // Glowing Node Diamond at center
    const diamondGeo = new THREE.OctahedronGeometry(0.18, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.5
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.set(0, 0.22, 0);
    group.add(diamond);

    return group;
  }

  _createStatusBillboard() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    this.billboardCanvas = canvas;
    this.billboardCtx = canvas.getContext('2d');

    this._updateBillboardCanvas();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.billboardTexture = tex;

    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(5.5, 1.7, 1);
    return sprite;
  }

  _updateBillboardCanvas() {
    const ctx = this.billboardCtx;
    ctx.clearRect(0, 0, 512, 160);

    // Dark cyber capsule background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 140, 24);
    ctx.fill();

    const isDone = this.completedPlanks >= this.totalPlanks;
    ctx.strokeStyle = isDone ? '#22c55e' : '#38bdf8';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ CÂY CẦU DỮ LIỆU F&B ⚡', 256, 52);

    // Progress Bar Background
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(50, 75, 412, 28, 14);
    ctx.fill();

    // Progress Bar Fill
    const fillW = Math.max(10, (this.completedPlanks / this.totalPlanks) * 412);
    ctx.fillStyle = isDone ? '#22c55e' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(50, 75, fillW, 28, 14);
    ctx.fill();

    // Status Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    if (isDone) {
      ctx.fillText('ĐÃ MỞ KHÓA HOÀN TOÀN! HÃY VƯỢT SÔNG!', 256, 134);
    } else {
      ctx.fillText(`TIẾN ĐỘ: ${this.completedPlanks}/${this.totalPlanks} NHỊP CẦU (LÀM QUEST ĐỂ MỞ)`, 256, 134);
    }
  }

  _initBarrier() {
    // Invisible barrier cylinder or box preventing crossing before 6/6
    const barrierGeo = new THREE.BoxGeometry(1.0, 5.0, this.bridgeWidth + 4);
    const barrierMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.0, // Invisible to eye, checked in collision
      wireframe: true
    });
    this.barrier = new THREE.Mesh(barrierGeo, barrierMat);
    // Placed at middle of the river (x = 0)
    this.barrier.position.set(0, 2.5, this.bridgeZ);
    this.barrier.name = 'Bridge_Collision_Barrier';
    this.group.add(this.barrier);
  }

  /**
   * Activate next plank in sequence (e.g. called after answering a quest question correctly)
   */
  buildNextPlank() {
    if (this.completedPlanks >= this.totalPlanks) {
      return false;
    }
    return this.buildPlank(this.completedPlanks);
  }

  /**
   * Activate a specific plank index (0 to 5) with high-speed cyber fly-in animation
   */
  buildPlank(index) {
    if (index < 0 || index >= this.totalPlanks) return false;
    const plank = this.planks[index];
    if (plank.userData.isBuilt) return false;

    plank.userData.isBuilt = true;
    plank.visible = true;

    // Fly-in animation parameters
    plank.position.set(
      plank.userData.targetPos.x,
      12.0,
      plank.userData.targetPos.z + (Math.random() - 0.5) * 4
    );
    plank.rotation.x = Math.random() * 0.8 - 0.4;
    plank.rotation.z = Math.random() * 0.8 - 0.4;

    this.animatingPlanks.push({
      mesh: plank,
      targetY: plank.userData.targetPos.y,
      targetZ: plank.userData.targetPos.z,
      elapsed: 0,
      duration: 0.8,
      soundPlayed: false
    });

    this.completedPlanks++;
    this._updateBillboardCanvas();
    if (this.billboardTexture) this.billboardTexture.needsUpdate = true;

    if (this.onPlankBuilt) {
      this.onPlankBuilt(index, this.completedPlanks, this.totalPlanks);
    }

    if (this.completedPlanks >= this.totalPlanks) {
      this._completeBridge();
    }

    return true;
  }

  _completeBridge() {
    this.isCompleted = true;
    // Remove collision barrier!
    if (this.barrier) {
      this.group.remove(this.barrier);
      this.barrier = null;
    }

    // Play victory fanfare
    if (this.audioSynth) {
      setTimeout(() => {
        this.audioSynth.bridgeCompletedFanfare();
      }, 700);
    }

    if (this.onBridgeCompleted) {
      this.onBridgeCompleted();
    }
  }

  /**
   * Check if player collides with bridge barrier (if not yet completed)
   * @param {THREE.Vector3} playerPos
   * @param {number} playerRadius
   * @returns {boolean} True if blocked
   */
  checkBarrierCollision(playerPos, playerRadius = 0.5) {
    if (this.isCompleted || !this.barrier) return false;

    // Check if player tries to walk across river where planks are missing
    // Allowed x-distance is determined by completedPlanks
    const totalLength = this.bridgeEndX - this.bridgeStartX;
    const allowedMaxX = this.bridgeStartX + (totalLength / this.totalPlanks) * this.completedPlanks;

    if (playerPos.z > -this.bridgeWidth / 2 && playerPos.z < this.bridgeWidth / 2) {
      if (playerPos.x + playerRadius > allowedMaxX && playerPos.x - playerRadius < this.bridgeEndX) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update fly-in animations and status billboard bobbing
   */
  update(delta) {
    // 1. Animate planks landing into place
    for (let i = this.animatingPlanks.length - 1; i >= 0; i--) {
      const anim = this.animatingPlanks[i];
      anim.elapsed += delta;
      const progress = Math.min(anim.elapsed / anim.duration, 1.0);

      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      anim.mesh.position.y = THREE.MathUtils.lerp(12.0, anim.targetY, ease);
      anim.mesh.position.z = THREE.MathUtils.lerp(anim.mesh.position.z, anim.targetZ, ease);
      anim.mesh.rotation.x = THREE.MathUtils.lerp(anim.mesh.rotation.x, 0, ease);
      anim.mesh.rotation.z = THREE.MathUtils.lerp(anim.mesh.rotation.z, 0, ease);

      if (progress >= 0.75 && !anim.soundPlayed) {
        anim.soundPlayed = true;
        if (this.audioSynth) {
          this.audioSynth.bridgePlank();
        }
      }

      if (progress >= 1.0) {
        anim.mesh.position.y = anim.targetY;
        anim.mesh.position.z = anim.targetZ;
        anim.mesh.rotation.set(0, 0, 0);
        this.animatingPlanks.splice(i, 1);
      }
    }

    // 2. Status billboard gentle bobbing
    if (this.statusBillboard) {
      this.statusBillboard.position.y = 4.2 + Math.sin(Date.now() * 0.003) * 0.12;
    }
  }
}
