import * as THREE from 'three';

/**
 * Player - 3D F&B Warehouse Explorer Character for IVT 3D Adventure
 * Features:
 * - Low-poly humanoid with F&B Apron and Warehouse Inventory Backpack
 * - Procedural skeletal animations: Idle breathing, Walking cycle, Jumping, Crate Carrying pose
 * - Dynamic item holding & placing mechanics
 * - Audio-synchronized footstep sounds
 */
export class Player {
  constructor(scene, audioSynth) {
    this.scene = scene;
    this.audioSynth = audioSynth;

    this.group = new THREE.Group();
    this.group.name = 'Player';

    // Character State
    this.speed = 7.5;
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.gravity = -26.0;
    this.jumpForce = 8.8;
    this.isGrounded = true;
    this.groundY = 0;

    // Carrying state
    this.isCarrying = false;
    this.heldItem = null;
    this.heldItemMesh = null;

    // Animation variables
    this.walkCycle = 0;
    this.footstepTimer = 0;
    this.footstepInterval = 0.32; // seconds between steps

    // Build the 3D model
    this._buildCharacterModel();
    this.scene.add(this.group);
  }

  _buildCharacterModel() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.75 }); // Royal Blue
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Amber F&B Apron
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }); // Dark Navy Pants
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

    // 1. Torso & Apron
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.75, 0.42), shirtMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Front Apron
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.06), apronMat);
    apron.position.set(0, 0, 0.22);
    this.torso.add(apron);

    // IVT Brand Pocket on Apron
    const pocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xb45309 })
    );
    pocket.position.set(0, -0.1, 0.25);
    this.torso.add(pocket);

    // 2. Warehouse Backpack (Ba Lô Thủ Kho)
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    this.backpack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.3), backpackMat);
    this.backpack.position.set(0, 0.05, -0.32);
    this.backpack.castShadow = true;
    this.torso.add(this.backpack);

    // Antenna on backpack
    const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.set(0.2, 0.4, -0.1);
    this.backpack.add(antenna);

    // Flashing green telemetry light on antenna tip
    const antTipGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const antTipMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const antTip = new THREE.Mesh(antTipGeo, antTipMat);
    antTip.position.y = 0.23;
    antenna.add(antTip);

    // 3. Head & Explorer Cap
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), skinMat);
    this.head.position.y = 2.05;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), hairMat);
    hair.position.y = 0.22;
    this.head.add(hair);

    // Explorer Visor Cap
    const capGeo = new THREE.BoxGeometry(0.52, 0.12, 0.52);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.26;
    this.head.add(cap);

    const visorGeo = new THREE.BoxGeometry(0.54, 0.04, 0.25);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.position.set(0, 0.22, 0.32);
    this.head.add(visor);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.11, 0.11].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.03), eyeMat);
      eye.position.set(x, 0.02, 0.25);
      this.head.add(eye);
    });

    // 4. Arms (Pivoted from Shoulder)
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);

    // Left Arm Pivot
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.44, 1.65, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.group.add(this.leftArmPivot);

    // Right Arm Pivot
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.44, 1.65, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.group.add(this.rightArmPivot);

    // Hands
    const handGeo = new THREE.BoxGeometry(0.16, 0.15, 0.16);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.68;
    this.leftArmPivot.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.68;
    this.rightArmPivot.add(rightHand);

    // 5. Legs (Pivoted from Hip)
    const legGeo = new THREE.BoxGeometry(0.22, 0.72, 0.24);

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.18, 0.95, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.36;
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.32), shoeMat);
    leftShoe.position.set(0, -0.74, 0.04);
    leftShoe.castShadow = true;
    this.leftLegPivot.add(leftShoe);
    this.group.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.18, 0.95, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.36;
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.32), shoeMat);
    rightShoe.position.set(0, -0.74, 0.04);
    rightShoe.castShadow = true;
    this.rightLegPivot.add(rightShoe);
    this.group.add(this.rightLegPivot);

    // 6. Carried Item Hold Socket (Attached in front of chest)
    this.itemSocket = new THREE.Group();
    this.itemSocket.position.set(0, 1.25, 0.65);
    this.group.add(this.itemSocket);
  }

  /**
   * Jump Action
   */
  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
      if (this.audioSynth) {
        this.audioSynth.footstep();
      }
    }
  }

  /**
   * Pick up an interactive item (crate)
   */
  pickUp(item) {
    if (this.isCarrying) return false;

    this.isCarrying = true;
    this.heldItem = item;

    // Clone or reparent mesh to player socket
    if (item.mesh) {
      item.mesh.position.set(0, 0, 0);
      item.mesh.rotation.set(0, 0, 0);
      this.itemSocket.add(item.mesh);
      this.heldItemMesh = item.mesh;
    }

    if (this.audioSynth) {
      this.audioSynth.pickup();
    }
    return true;
  }

  /**
   * Drop currently held item in front of player
   */
  dropItem() {
    if (!this.isCarrying || !this.heldItem) return null;

    const item = this.heldItem;
    const dropPosition = new THREE.Vector3();
    // Drop 1.5 units forward from player
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    dropPosition.copy(this.group.position).add(forward.multiplyScalar(1.4));
    dropPosition.y = 0.35; // ground level for crate

    if (this.heldItemMesh) {
      this.itemSocket.remove(this.heldItemMesh);
      this.scene.add(this.heldItemMesh);
      this.heldItemMesh.position.copy(dropPosition);
    }

    if (item.onDropped) {
      item.onDropped(dropPosition);
    }

    this.isCarrying = false;
    this.heldItem = null;
    this.heldItemMesh = null;

    if (this.audioSynth) {
      this.audioSynth.placeItem();
    }
    return item;
  }

  /**
   * Main player physics & animation update
   */
  update(delta, moveDir, isJumpPressed) {
    const isMoving = moveDir.lengthSq() > 0.001;

    // 1. Horizontal Movement & Rotation
    if (isMoving) {
      this.velocity.x = moveDir.x * this.speed;
      this.velocity.z = moveDir.z * this.speed;

      // Smoothly rotate character toward movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      let angleDiff = targetRotation - this.group.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.group.rotation.y += angleDiff * Math.min(delta * 14, 1.0);
    } else {
      // Damping
      this.velocity.x *= 0.7;
      this.velocity.z *= 0.7;
      if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
    }

    // 2. Jump & Vertical Gravity
    if (isJumpPressed && this.isGrounded) {
      this.jump();
    }

    if (!this.isGrounded) {
      this.verticalVelocity += this.gravity * delta;
      this.group.position.y += this.verticalVelocity * delta;

      if (this.group.position.y <= this.groundY) {
        this.group.position.y = this.groundY;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // Apply horizontal translation
    this.group.position.x += this.velocity.x * delta;
    this.group.position.z += this.velocity.z * delta;

    // 3. Procedural Limb Animation
    if (this.isGrounded) {
      if (isMoving) {
        this.walkCycle += delta * 12;

        // Legs swing in opposition
        const legAngle = Math.sin(this.walkCycle) * 0.65;
        this.leftLegPivot.rotation.x = legAngle;
        this.rightLegPivot.rotation.x = -legAngle;

        // Torso slight bobbing
        this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
        this.head.position.y = 2.05 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;

        // Arms swing (or carry pose if holding crate)
        if (this.isCarrying) {
          // Both arms held forward in front to hold crate
          this.leftArmPivot.rotation.x = -Math.PI / 2.2;
          this.rightArmPivot.rotation.x = -Math.PI / 2.2;
          this.leftArmPivot.rotation.z = -0.15;
          this.rightArmPivot.rotation.z = 0.15;
        } else {
          const armAngle = Math.sin(this.walkCycle) * 0.55;
          this.leftArmPivot.rotation.x = -armAngle;
          this.rightArmPivot.rotation.x = armAngle;
          this.leftArmPivot.rotation.z = 0;
          this.rightArmPivot.rotation.z = 0;
        }

        // Footsteps Audio Trigger
        this.footstepTimer += delta;
        if (this.footstepTimer >= this.footstepInterval) {
          this.footstepTimer = 0;
          if (this.audioSynth) {
            this.audioSynth.footstep();
          }
        }
      } else {
        // Idle Animation: gentle breathing
        const idleTime = Date.now() * 0.003;
        const breath = Math.sin(idleTime) * 0.02;

        this.leftLegPivot.rotation.x = 0;
        this.rightLegPivot.rotation.x = 0;
        this.torso.position.y = 1.35 + breath;
        this.head.position.y = 2.05 + breath;

        if (this.isCarrying) {
          this.leftArmPivot.rotation.x = -Math.PI / 2.2 + breath;
          this.rightArmPivot.rotation.x = -Math.PI / 2.2 + breath;
          this.leftArmPivot.rotation.z = -0.15;
          this.rightArmPivot.rotation.z = 0.15;
        } else {
          this.leftArmPivot.rotation.x = Math.sin(idleTime) * 0.08;
          this.rightArmPivot.rotation.x = -Math.sin(idleTime) * 0.08;
          this.leftArmPivot.rotation.z = 0;
          this.rightArmPivot.rotation.z = 0;
        }
      }
    } else {
      // In Air (Jumping): Legs tuck slightly, arms raise
      this.leftLegPivot.rotation.x = 0.35;
      this.rightLegPivot.rotation.x = 0.35;
      if (!this.isCarrying) {
        this.leftArmPivot.rotation.x = -1.1;
        this.rightArmPivot.rotation.x = -1.1;
      }
    }
  }

  getPosition() {
    return this.group.position;
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
    this.groundY = y;
  }
}
