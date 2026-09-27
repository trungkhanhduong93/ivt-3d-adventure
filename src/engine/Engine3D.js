/**
 * Engine3D.js - Three.js 3D World Engine
 * Renders the Warehouse Island, River, Data Bridge, Cloud Hub, NPCs and Animated Player.
 */

import * as THREE from 'three';

export class Engine3D {
  constructor({ canvas, onProximityChange, onTriggerInteract, soundManager }) {
    this.canvas = canvas;
    this.onProximityChange = onProximityChange || (() => {});
    this.onTriggerInteract = onTriggerInteract || (() => {});
    this.sound = soundManager;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Objects & Groups
    this.player = null;
    this.playerVisuals = null;
    this.npcs = [];
    this.collectibles = [];
    this.bridgeSegments = [];
    this.waterMesh = null;
    this.cloudHologram = null;

    // Animation & State
    this.clock = new THREE.Clock();
    this.walkCycle = 0;
    this.cameraOffset = new THREE.Vector3(0, 5, 8);
    this.currentRole = 'manager';
    this.activeInteractable = null;

    // Camera Orbit Mouse Drag
    this.cameraYaw = 0;
    this.cameraPitch = 0.35;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };

    this.init();
  }

  init() {
    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070e17');
    this.scene.fog = new THREE.FogExp2('#070e17', 0.018);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 6, 10);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting
    this.setupLighting();

    // 5. Build Environment
    this.buildWarehouseIsland();
    this.buildRiverAndBridge();
    this.buildCloudHubIsland();

    // 6. Build Characters & Collectibles
    this.buildPlayer();
    this.buildNPCs();
    this.buildCollectibles();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.setupCameraControls();

    // 8. Start Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.85);
    this.scene.add(ambientLight);

    // Directional Sunlight (Warm Dusk)
    const sunLight = new THREE.DirectionalLight('#fed7aa', 1.8);
    sunLight.position.set(25, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Neon Accent Lights
    const warehouseLight = new THREE.PointLight('#38bdf8', 2, 18);
    warehouseLight.position.set(0, 4, -4);
    this.scene.add(warehouseLight);

    const dockLantern = new THREE.PointLight('#f59e0b', 2.5, 14);
    dockLantern.position.set(0, 3, -10);
    this.scene.add(dockLantern);
  }

  // =================================================================
  // ENVIRONMENT: WAREHOUSE ISLAND
  // =================================================================
  buildWarehouseIsland() {
    const islandGroup = new THREE.Group();

    // Main Ground (Stylized Low Poly Island)
    const groundGeo = new THREE.CylinderGeometry(20, 22, 4, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#132337',
      roughness: 0.8,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -2;
    ground.receiveShadow = true;
    islandGroup.add(ground);

    // Warehouse Floor Tiles / Pavement
    const pavementGeo = new THREE.BoxGeometry(26, 0.1, 22);
    const pavementMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.7
    });
    const pavement = new THREE.Mesh(pavementGeo, pavementMat);
    pavement.position.set(0, 0.05, 0);
    pavement.receiveShadow = true;
    islandGroup.add(pavement);

    // Warehouse Building (North Side)
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(0, 0, -8);

    // Back & Side Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.6), wallMat);
    backWall.position.set(0, 3, -4);
    backWall.castShadow = true;
    buildingGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 8), wallMat);
    leftWall.position.set(-10, 3, 0);
    leftWall.castShadow = true;
    buildingGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 8), wallMat);
    rightWall.position.set(10, 3, 0);
    rightWall.castShadow = true;
    buildingGroup.add(rightWall);

    // Corrugated Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.4, metalness: 0.3 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(21, 0.5, 9), roofMat);
    roof.position.set(0, 6.2, 0);
    buildingGroup.add(roof);

    // Warehouse Neon Sign "iPOS IVT PRO"
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(9, 1.2, 0.2),
      new THREE.MeshStandardMaterial({ color: '#0284c7', emissive: '#0284c7', emissiveIntensity: 0.6 })
    );
    signBoard.position.set(0, 5.2, 3.9);
    buildingGroup.add(signBoard);

    // Storage Racks & Pallets
    this.createStorageRack(buildingGroup, -6, 0, -1);
    this.createStorageRack(buildingGroup, 6, 0, -1);

    // iPOS POS Checkout Counter (Inside warehouse)
    const counterGeo = new THREE.BoxGeometry(4, 1.1, 1.2);
    const counterMat = new THREE.MeshStandardMaterial({ color: '#334155' });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 0.55, -2);
    counter.castShadow = true;
    buildingGroup.add(counter);

    // Touchscreen Terminal on Counter
    const posScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.08),
      new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 0.8 })
    );
    posScreen.position.set(0, 1.4, -2);
    posScreen.rotation.x = -0.2;
    buildingGroup.add(posScreen);

    islandGroup.add(buildingGroup);

    // Decorative Crates & Barrels on Ground
    this.createCrate(islandGroup, -3, 0.4, 3, '#d97706');
    this.createCrate(islandGroup, -3.8, 0.4, 3.2, '#b45309');
    this.createCrate(islandGroup, -3.4, 1.1, 3.1, '#f59e0b');

    this.createCrate(islandGroup, 4, 0.4, 2, '#059669');
    this.createCrate(islandGroup, 4.8, 0.4, 2.3, '#10b981');

    this.scene.add(islandGroup);
  }

  createStorageRack(parent, x, y, z) {
    const rack = new THREE.Group();
    rack.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
    // Upright posts
    for (let px of [-1.5, 1.5]) {
      for (let pz of [-0.6, 0.6]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4), metalMat);
        post.position.set(px, 2, pz);
        rack.add(post);
      }
    }
    // Shelves
    for (let sy of [0.8, 2.0, 3.2]) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 1.4), metalMat);
      shelf.position.set(0, sy, 0);
      rack.add(shelf);

      // Crates on shelf
      const boxMat = new THREE.MeshStandardMaterial({ color: '#0284c7' });
      const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), boxMat);
      box1.position.set(-0.8, sy + 0.34, 0);
      rack.add(box1);

      const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.8), new THREE.MeshStandardMaterial({ color: '#ea580c' }));
      box2.position.set(0.6, sy + 0.29, 0);
      rack.add(box2);
    }
    parent.add(rack);
  }

  createCrate(parent, x, y, z, colorHex) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6 })
    );
    crate.position.set(x, y, z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    parent.add(crate);
  }

  // =================================================================
  // ENVIRONMENT: RIVER & DATA BRIDGE
  // =================================================================
  buildRiverAndBridge() {
    // Water Mesh
    const waterGeo = new THREE.PlaneGeometry(120, 120, 24, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#082f49',
      emissive: '#0369a1',
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = -1.2;
    this.scene.add(this.waterMesh);

    // Bridge Construction (6 Segments crossing from z = -12 to z = -32)
    const bridgeGroup = new THREE.Group();
    const segmentLength = 3.6;
    const startZ = -12;

    for (let i = 0; i < 6; i++) {
      const segGroup = new THREE.Group();
      const zPos = startZ - i * segmentLength;
      segGroup.position.set(0, 0, zPos);

      // Holographic Outline (Unbuilt state)
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const plankGhost = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, segmentLength - 0.2), wireframeMat);
      plankGhost.position.y = 0;
      segGroup.add(plankGhost);

      // Solid Built Mesh (Initially hidden)
      const solidGroup = new THREE.Group();
      solidGroup.visible = false;

      // Wooden / Cyber Plank
      const plankMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        emissive: '#0369a1',
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.5
      });
      const plankMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, segmentLength - 0.2), plankMat);
      solidGroup.add(plankMesh);

      // Glowing Neon Handrails
      const railMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#38bdf8',
        emissiveIntensity: 1.0
      });
      const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, segmentLength), railMat);
      leftRail.position.set(-1.6, 0.4, 0);
      solidGroup.add(leftRail);

      const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, segmentLength), railMat);
      rightRail.position.set(1.6, 0.4, 0);
      solidGroup.add(rightRail);

      // Data Stream Particle Glow
      const beamGlow = new THREE.PointLight('#38bdf8', 1.2, 6);
      beamGlow.position.set(0, 0.8, 0);
      solidGroup.add(beamGlow);

      segGroup.add(solidGroup);

      this.bridgeSegments.push({
        index: i,
        group: segGroup,
        solidMesh: solidGroup,
        built: false
      });

      bridgeGroup.add(segGroup);
    }

    this.scene.add(bridgeGroup);
  }

  setBridgePlanks(count) {
    this.bridgeSegments.forEach((seg, idx) => {
      if (idx < count) {
        if (!seg.built) {
          seg.built = true;
          seg.solidMesh.visible = true;
          this.sound?.playPlankPlace();
          // Pop animation
          seg.solidMesh.scale.set(0.1, 0.1, 0.1);
          let scale = 0.1;
          const popAnim = () => {
            scale += 0.15;
            if (scale < 1) {
              seg.solidMesh.scale.set(scale, scale, scale);
              requestAnimationFrame(popAnim);
            } else {
              seg.solidMesh.scale.set(1, 1, 1);
            }
          };
          popAnim();
        }
      } else {
        seg.built = false;
        seg.solidMesh.visible = false;
      }
    });
  }

  // =================================================================
  // ENVIRONMENT: CLOUD SERVER HUB ISLAND
  // =================================================================
  buildCloudHubIsland() {
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, -42);

    // Destination Island Ground
    const groundGeo = new THREE.CylinderGeometry(14, 16, 4, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.6,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -2;
    hubGroup.add(ground);

    // Cloud Server Towers
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const tx = Math.cos(angle) * 7;
      const tz = Math.sin(angle) * 7;

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 6, 1.6),
        new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.2, metalness: 0.8 })
      );
      tower.position.set(tx, 3, tz);

      // Server Lights
      const ledStripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#10b981', emissiveIntensity: 1.2 })
      );
      ledStripe.position.set(tx, 4, tz + 0.85);
      hubGroup.add(ledStripe);
      hubGroup.add(tower);
    }

    // Floating Central Cloud Crystal Hologram
    const crystalGeo = new THREE.OctahedronGeometry(2.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      emissive: '#06b6d4',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.9
    });
    this.cloudHologram = new THREE.Mesh(crystalGeo, crystalMat);
    this.cloudHologram.position.set(0, 4.5, 0);
    hubGroup.add(this.cloudHologram);

    // Hologram Beacon Light
    const beaconLight = new THREE.PointLight('#06b6d4', 3, 20);
    beaconLight.position.set(0, 5, 0);
    hubGroup.add(beaconLight);

    this.scene.add(hubGroup);
  }

  // =================================================================
  // CHARACTERS: PLAYER AVATAR
  // =================================================================
  buildPlayer() {
    this.player = new THREE.Group();
    this.player.position.set(0, 0, 4);

    this.playerVisuals = new THREE.Group();

    // Body / Torso
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.5 });
    this.playerBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), bodyMat);
    this.playerBodyMesh.position.y = 1.1;
    this.playerBodyMesh.castShadow = true;
    this.playerVisuals.add(this.playerBodyMesh);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: '#fde047', roughness: 0.6 });
    this.playerHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), headMat);
    this.playerHeadMesh.position.y = 1.85;
    this.playerHeadMesh.castShadow = true;
    this.playerVisuals.add(this.playerHeadMesh);

    // Hat / Visor
    const hatMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.4 });
    this.playerHatMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.15, 16), hatMat);
    this.playerHatMesh.position.y = 2.05;
    this.playerVisuals.add(this.playerHatMesh);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), legMat);
    this.leftLeg.position.set(-0.2, 0.35, 0);
    this.leftLeg.castShadow = true;
    this.playerVisuals.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), legMat);
    this.rightLeg.position.set(0.2, 0.35, 0);
    this.rightLeg.castShadow = true;
    this.playerVisuals.add(this.rightLeg);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: '#10b981' });
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), armMat);
    this.leftArm.position.set(-0.46, 1.05, 0);
    this.playerVisuals.add(this.leftArm);

    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), armMat);
    this.rightArm.position.set(0.46, 1.05, 0);
    this.playerVisuals.add(this.rightArm);

    this.player.add(this.playerVisuals);
    this.scene.add(this.player);
  }

  setPlayerRole(role) {
    this.currentRole = role;
    if (role === 'manager') {
      // Emerald / Warm Cafe Palette
      this.playerBodyMesh.material.color.set('#10b981');
      this.playerHatMesh.material.color.set('#047857');
      this.leftArm.material.color.set('#10b981');
      this.rightArm.material.color.set('#10b981');
    } else {
      // Cyber Navy / Neon Cyan Palette
      this.playerBodyMesh.material.color.set('#06b6d4');
      this.playerHatMesh.material.color.set('#0e7490');
      this.leftArm.material.color.set('#06b6d4');
      this.rightArm.material.color.set('#06b6d4');
    }
  }

  // =================================================================
  // CHARACTERS: NPCS
  // =================================================================
  buildNPCs() {
    const npcConfigs = [
      { id: 'milo', name: 'Milo', x: 0, z: -4, color: '#10b981', hatColor: '#f59e0b', role: 'manager' },
      { id: 'chef_john', name: 'Chef John', x: -8, z: -3, color: '#ef4444', hatColor: '#ffffff', role: 'manager' },
      { id: 'support_master', name: 'Support Master', x: 8, z: -3, color: '#06b6d4', hatColor: '#8b5cf6', role: 'tech' }
    ];

    npcConfigs.forEach(cfg => {
      const npcGroup = new THREE.Group();
      npcGroup.position.set(cfg.x, 0, cfg.z);

      // Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.4),
        new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.5 })
      );
      body.position.y = 1.1;
      body.castShadow = true;
      npcGroup.add(body);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#fde047', roughness: 0.6 })
      );
      head.position.y = 1.85;
      head.castShadow = true;
      npcGroup.add(head);

      // Distinctive Hat
      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16),
        new THREE.MeshStandardMaterial({ color: cfg.hatColor })
      );
      hat.position.y = 2.1;
      npcGroup.add(hat);

      // Floating Interaction Beacon overhead
      const beaconGeo = new THREE.OctahedronGeometry(0.25, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#fbbf24',
        emissiveIntensity: 0.8
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.7;
      npcGroup.add(beacon);

      this.scene.add(npcGroup);

      this.npcs.push({
        id: cfg.id,
        name: cfg.name,
        role: cfg.role,
        group: npcGroup,
        beacon: beacon,
        x: cfg.x,
        z: cfg.z
      });
    });
  }

  // =================================================================
  // COLLECTIBLE ITEMS
  // =================================================================
  buildCollectibles() {
    const itemDefs = [
      { id: 'item_milk', name: 'Thùng Sữa Tươi Ba Vì', x: -5, z: 4, color: '#38bdf8' },
      { id: 'item_coffee', name: 'Bao Hạt Cafe Cầu Đất', x: 5, z: 5, color: '#d97706' },
      { id: 'item_cable', name: 'Cuộn Cáp Mạng Cat6', x: -6, z: -8, color: '#3b82f6' },
      { id: 'item_rfid', name: 'Thẻ Chip RFID Quản Lý Kho', x: 6, z: -8, color: '#10b981' },
      { id: 'item_dongle', name: 'USB Dongle Bản Quyền iPOS', x: 0, z: 7, color: '#a855f7' },
      { id: 'item_manual', name: 'Sổ Tay Định Mức BOM F&B', x: -3, z: 9, color: '#eab308' }
    ];

    itemDefs.forEach(def => {
      const group = new THREE.Group();
      group.position.set(def.x, 0.8, def.z);

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshStandardMaterial({
          color: def.color,
          emissive: def.color,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.4
        })
      );
      box.castShadow = true;
      group.add(box);

      // Light glow aura
      const aura = new THREE.PointLight(def.color, 1, 3);
      aura.position.set(0, 0, 0);
      group.add(aura);

      this.scene.add(group);

      this.collectibles.push({
        id: def.id,
        name: def.name,
        group: group,
        box: box,
        x: def.x,
        z: def.z,
        collected: false
      });
    });
  }

  collectItem(itemId) {
    const item = this.collectibles.find(c => c.id === itemId);
    if (item && !item.collected) {
      item.collected = true;
      this.sound?.playPickup();
      // Disappear animation
      let scale = 1;
      const shrink = () => {
        scale -= 0.15;
        if (scale > 0) {
          item.group.scale.set(scale, scale, scale);
          item.group.position.y += 0.1;
          requestAnimationFrame(shrink);
        } else {
          item.group.visible = false;
        }
      };
      shrink();
    }
  }

  // =================================================================
  // CAMERA CONTROLS & RESIZE
  // =================================================================
  setupCameraControls() {
    let pointerDown = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (e) => {
      // Ignore if clicking on UI buttons
      if (e.target !== this.canvas) return;
      pointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!pointerDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;

      this.cameraYaw -= dx * 0.006;
      this.cameraPitch = Math.max(0.1, Math.min(1.1, this.cameraPitch + dy * 0.004));
    };

    const onPointerUp = () => {
      pointerDown = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // =================================================================
  // GAME LOOP & MOVEMENT
  // =================================================================
  update(inputVector) {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Move Player
    if (inputVector.isMoving) {
      const speed = 7.5 * delta;

      // Camera-relative movement
      const moveAngle = Math.atan2(inputVector.x, inputVector.z) + this.cameraYaw;
      const mx = Math.sin(moveAngle) * speed;
      const mz = Math.cos(moveAngle) * speed;

      this.player.position.x += mx;
      this.player.position.z += mz;

      // Rotate player to face movement direction
      const targetRotation = moveAngle;
      let rotDiff = targetRotation - this.player.rotation.y;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      this.player.rotation.y += rotDiff * 14 * delta;

      // Walking Leg/Arm Animation
      this.walkCycle += delta * 14;
      const swing = Math.sin(this.walkCycle) * 0.55;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.7;
      this.rightArm.rotation.x = swing * 0.7;
      this.playerHeadMesh.position.y = 1.85 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
    } else {
      // Idle pose smooth return
      this.leftLeg.rotation.x *= 0.85;
      this.rightLeg.rotation.x *= 0.85;
      this.leftArm.rotation.x *= 0.85;
      this.rightArm.rotation.x *= 0.85;
      this.playerHeadMesh.position.y = 1.85 + Math.sin(time * 2.5) * 0.02;
    }

    // 2. Animate Water Ripples
    if (this.waterMesh) {
      this.waterMesh.position.y = -1.2 + Math.sin(time * 1.5) * 0.06;
    }

    // 3. Animate Cloud Crystal
    if (this.cloudHologram) {
      this.cloudHologram.rotation.y = time * 0.8;
      this.cloudHologram.rotation.x = Math.sin(time * 0.5) * 0.2;
      this.cloudHologram.position.y = 4.5 + Math.sin(time * 2) * 0.3;
    }

    // 4. Animate NPCs & Collectibles
    this.npcs.forEach(npc => {
      if (npc.beacon) {
        npc.beacon.rotation.y = time * 2;
        npc.beacon.position.y = 2.7 + Math.sin(time * 3) * 0.1;
      }
    });

    this.collectibles.forEach(col => {
      if (!col.collected && col.box) {
        col.box.rotation.y = time * 2.2;
        col.box.rotation.x = Math.sin(time * 1.2) * 0.2;
        col.group.position.y = 0.8 + Math.sin(time * 3 + col.x) * 0.15;
      }
    });

    // 5. Check Proximity to interactables
    this.checkProximity();

    // 6. Smooth Third-person Camera Follow
    const camDist = 9.0;
    const camHeight = Math.sin(this.cameraPitch) * camDist;
    const camRadius = Math.cos(this.cameraPitch) * camDist;

    const targetCamX = this.player.position.x + Math.sin(this.cameraYaw) * camRadius;
    const targetCamZ = this.player.position.z + Math.cos(this.cameraYaw) * camRadius;
    const targetCamY = this.player.position.y + Math.max(2.5, camHeight);

    this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.4, this.player.position.z);
  }

  checkProximity() {
    const px = this.player.position.x;
    const pz = this.player.position.z;
    let closest = null;
    let minDistance = Infinity;

    // Check Collectibles (1.8m range)
    for (let col of this.collectibles) {
      if (col.collected) continue;
      const dist = Math.hypot(px - col.x, pz - col.z);
      if (dist < 1.8 && dist < minDistance) {
        minDistance = dist;
        closest = {
          type: 'collectible',
          id: col.id,
          name: col.name,
          prompt: `Nhặt ${col.name}`
        };
      }
    }

    // Check NPCs (2.6m range)
    for (let npc of this.npcs) {
      const dist = Math.hypot(px - npc.x, pz - npc.z);
      if (dist < 2.6 && dist < minDistance) {
        minDistance = dist;
        closest = {
          type: 'npc',
          id: npc.id,
          name: npc.name,
          role: npc.role,
          prompt: `Nói chuyện với ${npc.name}`
        };
      }
    }

    if (closest !== this.activeInteractable) {
      this.activeInteractable = closest;
      this.onProximityChange(this.activeInteractable);
    }
  }

  getActiveInteractable() {
    return this.activeInteractable;
  }

  getPlayerCoordinates() {
    return {
      x: this.player ? this.player.position.x : 0,
      z: this.player ? this.player.position.z : 0,
      yaw: this.player ? this.player.rotation.y : 0
    };
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
