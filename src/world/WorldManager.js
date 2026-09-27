import * as THREE from 'three';
import { ProceduralModels } from './ProceduralModels.js';
import { InteractiveObject } from '../entities/InteractiveObject.js';
import { BridgeSystem } from './BridgeSystem.js';

/**
 * WorldManager - World Architecture & Zone Coordinator for IVT 3D Adventure
 * Organizes the 3 F&B adventure zones:
 * - Zone 1: Làng Khởi Đầu / Cửa Hàng POS & Kho Nguyên Liệu
 * - River & Cây Cầu Dữ Liệu (Data Bridge)
 * - Zone 2: Đảo Bếp Trung Tâm (Central Kitchen Island)
 * - Zone 3: Tháp Điều Hành & Chẩn Đoán Sự Cố (Tech Ops Tower)
 * Handles physics collisions, interactive objects, and zone transitions.
 */
export class WorldManager {
  constructor(scene, audioSynth) {
    this.scene = scene;
    this.audioSynth = audioSynth;

    this.group = new THREE.Group();
    this.group.name = 'IVT_World';

    this.interactiveObjects = [];
    this.collisionObstacles = []; // { x, z, radius } or { minX, maxX, minZ, maxZ }
    this.currentZone = 'zone1';

    // Bridge System
    this.bridgeSystem = new BridgeSystem(this.scene, this.audioSynth);

    // Dynamic updatables (river, steam, leds)
    this.animatedMeshes = [];

    // Callbacks
    this.onZoneChanged = null;
    this.onQuestEvent = null;

    this._buildEnvironment();
    this._buildZone1();
    this._buildRiver();
    this._buildZone2();
    this._buildZone3();

    this.scene.add(this.group);
  }

  // --- ENVIRONMENT & TERRAIN ---

  _buildEnvironment() {
    // 1. West Bank Grass Terrain (Zone 1)
    const westGroundGeo = new THREE.PlaneGeometry(60, 90);
    westGroundGeo.rotateX(-Math.PI / 2);
    const westGroundMat = new THREE.MeshStandardMaterial({
      color: 0x3d7a46, // Fresh green grass
      roughness: 0.9,
      metalness: 0.05
    });
    this.westGround = new THREE.Mesh(westGroundGeo, westGroundMat);
    this.westGround.position.set(-35, 0, 0);
    this.westGround.receiveShadow = true;
    this.group.add(this.westGround);

    // Stone pathway in Zone 1 leading to the bridge
    const pathGeo = new THREE.PlaneGeometry(30, 4.5);
    pathGeo.rotateX(-Math.PI / 2);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xa8a29e,
      roughness: 0.8
    });
    const westPath = new THREE.Mesh(pathGeo, pathMat);
    westPath.position.set(-25, 0.02, 0);
    westPath.receiveShadow = true;
    this.group.add(westPath);

    // 2. East Bank Grass & Kitchen Tile Terrain (Zone 2)
    const eastGroundGeo = new THREE.PlaneGeometry(50, 90);
    eastGroundGeo.rotateX(-Math.PI / 2);
    const eastGroundMat = new THREE.MeshStandardMaterial({
      color: 0x476a38,
      roughness: 0.85
    });
    this.eastGround = new THREE.Mesh(eastGroundGeo, eastGroundMat);
    this.eastGround.position.set(35, 0, 0);
    this.eastGround.receiveShadow = true;
    this.group.add(this.eastGround);

    // Kitchen Tiled Floor Platform in Zone 2
    const tileGeo = new THREE.BoxGeometry(26, 0.15, 26);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.15
    });
    const kitchenFloor = new THREE.Mesh(tileGeo, tileMat);
    kitchenFloor.position.set(32, 0.08, 0);
    kitchenFloor.receiveShadow = true;
    this.group.add(kitchenFloor);

    // 3. Elevated Operations Tech Hub Platform (Zone 3)
    const towerPlatGeo = new THREE.BoxGeometry(28, 1.2, 28);
    const towerPlatMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });
    const towerPlatform = new THREE.Mesh(towerPlatGeo, towerPlatMat);
    towerPlatform.position.set(32, 0.6, -55);
    towerPlatform.receiveShadow = true;
    towerPlatform.castShadow = true;
    this.group.add(towerPlatform);

    // Gentle ramp connecting Zone 2 to Zone 3
    const rampGeo = new THREE.BoxGeometry(6, 0.15, 16);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(32, 0.4, -34);
    ramp.rotation.x = 0.08;
    ramp.receiveShadow = true;
    this.group.add(ramp);

    // World Boundaries Collision Obstacles
    this._addWorldBoundaryObstacles();
  }

  _addWorldBoundaryObstacles() {
    // Outer boundaries
    this.collisionObstacles.push(
      { type: 'wall', minX: -65, maxX: -60, minZ: -50, maxZ: 50 }, // Far west
      { type: 'wall', minX: 58, maxX: 65, minZ: -75, maxZ: 50 }, // Far east
      { type: 'wall', minX: -65, maxX: 65, minZ: 42, maxZ: 50 }, // South wall
      { type: 'wall', minX: -65, maxX: 65, minZ: -78, maxZ: -72 } // North wall
    );
  }

  // --- ZONE 1: LÀNG KHỞI ĐẦU / CỬA HÀNG POS & KHO NGUYÊN LIỆU ---

  _buildZone1() {
    // 1. POS Counter & Cashier Terminal
    const posCounter = ProceduralModels.createPOSCounter();
    posCounter.position.set(-24, 0, -8);
    posCounter.rotation.y = Math.PI / 4;
    this.group.add(posCounter);

    this.collisionObstacles.push({
      type: 'circle',
      x: -24,
      z: -8,
      radius: 1.8
    });

    const posItem = new InteractiveObject({
      id: 'pos_counter_01',
      type: 'pos',
      promptText: 'Kiểm Tra Doanh Thu POS',
      radius: 3.2,
      mesh: posCounter,
      onInteract: (player) => {
        if (this.audioSynth) this.audioSynth.posBeep();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'POS_CHECK', target: 'pos_counter_01' });
        }
      }
    });
    this.interactiveObjects.push(posItem);

    // 2. Pallet 1: Cà Phê Hạt (Cafe Beans)
    const cafePallet = ProceduralModels.createPalletWithCrates('CAFE');
    cafePallet.position.set(-34, 0, -12);
    this.group.add(cafePallet);

    this.collisionObstacles.push({
      type: 'circle',
      x: -34,
      z: -12,
      radius: 1.6
    });

    // 3. Pallet 2: Sữa Tươi Thanh Trùng (Fresh Milk)
    const milkPallet = ProceduralModels.createPalletWithCrates('MILK 1L');
    milkPallet.position.set(-34, 0, 10);
    this.group.add(milkPallet);

    this.collisionObstacles.push({
      type: 'circle',
      x: -34,
      z: 10,
      radius: 1.6
    });

    // 4. Loose Pickupable Crates
    const looseCrates = [
      { id: 'crate_cafe_01', type: 'CAFE', subtitle: 'Arabica 10kg', pos: [-28, 0.35, -4] },
      { id: 'crate_milk_01', type: 'MILK 1L', subtitle: 'Sữa Thanh Trùng', pos: [-30, 0.35, 6] },
      { id: 'crate_matcha_01', type: 'MATCHA', subtitle: 'Bột Uji Matcha', pos: [-36, 0.35, -2] }
    ];

    looseCrates.forEach(cfg => {
      const crateMesh = ProceduralModels.createSingleCrate(cfg.type, cfg.subtitle);
      crateMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

      const crateItem = new InteractiveObject({
        id: cfg.id,
        type: 'crate',
        promptText: `Nhấc Thùng ${cfg.type}`,
        radius: 2.2,
        isPickupable: true,
        mesh: crateMesh,
        onInteract: (player, obj) => {
          if (!player.isCarrying) {
            player.pickUp({
              id: cfg.id,
              type: cfg.type,
              mesh: crateMesh,
              onDropped: (pos) => {
                obj.group.position.copy(pos);
                obj.mesh.position.set(0, 0, 0);
                this.scene.add(obj.group);
              }
            });
            this.scene.remove(obj.group);
            if (this.onQuestEvent) {
              this.onQuestEvent({ type: 'PICKUP_CRATE', item: cfg });
            }
          }
        }
      });
      crateItem.setPosition(cfg.pos[0], 0, cfg.pos[2]);
      crateMesh.position.set(0, cfg.pos[1], 0);
      this.interactiveObjects.push(crateItem);
      this.group.add(crateItem.group);
    });

    // 5. Electronic Weighing Scale Table (Bàn cân kiểm kê)
    const scaleTable = ProceduralModels.createWeighingScaleTable();
    scaleTable.position.set(-22, 0, 8);
    scaleTable.rotation.y = -Math.PI / 6;
    this.group.add(scaleTable);

    this.collisionObstacles.push({
      type: 'circle',
      x: -22,
      z: 8,
      radius: 1.7
    });

    const scaleItem = new InteractiveObject({
      id: 'scale_table_01',
      type: 'scale',
      promptText: 'Cân Đếm Tồn Kho',
      radius: 2.8,
      mesh: scaleTable,
      onInteract: (player) => {
        if (player.isCarrying) {
          const item = player.heldItem;
          if (scaleTable.userData.updateDisplay) {
            const weights = { 'CAFE': '10.25 kg', 'MILK 1L': '12.00 kg', 'MATCHA': '5.50 kg' };
            const disp = weights[item.type] || '8.40 kg';
            scaleTable.userData.updateDisplay(disp);
          }
          if (this.audioSynth) this.audioSynth.scaleSuccess();
          if (this.onQuestEvent) {
            this.onQuestEvent({ type: 'WEIGH_CRATE', item: item });
          }
        } else {
          if (this.audioSynth) this.audioSynth.posBeep();
          if (this.onQuestEvent) {
            this.onQuestEvent({ type: 'INSPECT_SCALE' });
          }
        }
      }
    });
    this.interactiveObjects.push(scaleItem);

    // 6. NPC Milo (Storekeeper)
    const milo = ProceduralModels.createNPCMilo();
    milo.position.set(-20, 0, -2);
    milo.rotation.y = -Math.PI / 2;
    this.group.add(milo);
    this.animatedMeshes.push(milo);

    this.collisionObstacles.push({
      type: 'circle',
      x: -20,
      z: -2,
      radius: 1.0
    });

    const miloItem = new InteractiveObject({
      id: 'npc_milo',
      type: 'npc',
      promptText: 'Trò Chuyện Với Milo',
      radius: 3.2,
      mesh: milo,
      onInteract: () => {
        if (this.audioSynth) this.audioSynth.correctChord();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'TALK_NPC', npc: 'milo' });
        }
      }
    });
    this.interactiveObjects.push(miloItem);

    // Scenery: Trees and rocks in Zone 1
    const treePositionsZ1 = [
      [-42, -18], [-44, -5], [-45, 12], [-40, 22], [-28, 24],
      [-16, -22], [-14, 20], [-30, -25]
    ];
    treePositionsZ1.forEach(p => {
      const tree = ProceduralModels.createTree();
      tree.position.set(p[0], 0, p[1]);
      const scale = 0.8 + Math.random() * 0.4;
      tree.scale.set(scale, scale, scale);
      this.group.add(tree);

      this.collisionObstacles.push({
        type: 'circle',
        x: p[0],
        z: p[1],
        radius: 0.8
      });
    });

    const rockPositionsZ1 = [[-18, -14], [-38, 5], [-24, 18]];
    rockPositionsZ1.forEach(p => {
      const rock = ProceduralModels.createRock();
      rock.position.set(p[0], 0, p[1]);
      this.group.add(rock);
    });
  }

  // --- RIVER & BRIDGE SYSTEM ---

  _buildRiver() {
    // Flowing River Plane between West and East Banks
    this.river = ProceduralModels.createRiverMesh(18, 120);
    this.river.position.set(0, -0.2, 0);
    this.group.add(this.river);
    this.animatedMeshes.push(this.river);

    // River Bank Collisions (prevent jumping into water outside bridge)
    // River spans from x: -9 to +9
    this.collisionObstacles.push(
      // North water barrier
      { type: 'water_north', minX: -9, maxX: 9, minZ: -60, maxZ: -2.5 },
      // South water barrier
      { type: 'water_south', minX: -9, maxX: 9, minZ: 2.5, maxZ: 60 }
    );
  }

  // --- ZONE 2: ĐẢO BẾP TRUNG TÂM (CENTRAL KITCHEN ISLAND) ---

  _buildZone2() {
    // 1. Giant Cooking Pot (Nồi nấu khổng lồ)
    const giantPot = ProceduralModels.createCentralKitchenCooker();
    giantPot.position.set(34, 0, 0);
    this.group.add(giantPot);
    this.animatedMeshes.push(giantPot);

    this.collisionObstacles.push({
      type: 'circle',
      x: 34,
      z: 0,
      radius: 2.2
    });

    const potItem = new InteractiveObject({
      id: 'central_kitchen_pot',
      type: 'pos',
      promptText: 'Kiểm Tra Nồi Nấu Nước Cốt',
      radius: 3.5,
      mesh: giantPot,
      onInteract: () => {
        if (this.audioSynth) this.audioSynth.correctChord();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'INSPECT_POT' });
        }
      }
    });
    this.interactiveObjects.push(potItem);

    // 2. Prep Table 1 (Bàn sơ chế Inox)
    const prepTable1 = ProceduralModels.createPrepTable();
    prepTable1.position.set(24, 0, -8);
    this.group.add(prepTable1);

    this.collisionObstacles.push({
      type: 'circle',
      x: 24,
      z: -8,
      radius: 1.8
    });

    // 3. Prep Table 2
    const prepTable2 = ProceduralModels.createPrepTable();
    prepTable2.position.set(24, 0, 8);
    this.group.add(prepTable2);

    this.collisionObstacles.push({
      type: 'circle',
      x: 24,
      z: 8,
      radius: 1.8
    });

    // 4. NPC Chef John
    const chefJohn = ProceduralModels.createNPCChefJohn();
    chefJohn.position.set(30, 0, -3);
    chefJohn.rotation.y = Math.PI / 4;
    this.group.add(chefJohn);
    this.animatedMeshes.push(chefJohn);

    this.collisionObstacles.push({
      type: 'circle',
      x: 30,
      z: -3,
      radius: 1.0
    });

    const chefItem = new InteractiveObject({
      id: 'npc_chef_john',
      type: 'npc',
      promptText: 'Nhận Nhiệm Vụ Bếp Trưởng',
      radius: 3.2,
      mesh: chefJohn,
      onInteract: () => {
        if (this.audioSynth) this.audioSynth.correctChord();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'TALK_NPC', npc: 'chef_john' });
        }
      }
    });
    this.interactiveObjects.push(chefItem);

    // Trees and flora surrounding Zone 2
    const treePositionsZ2 = [
      [44, -14], [46, 5], [42, 18], [20, 20], [18, -20]
    ];
    treePositionsZ2.forEach(p => {
      const tree = ProceduralModels.createTree();
      tree.position.set(p[0], 0, p[1]);
      this.group.add(tree);
      this.collisionObstacles.push({
        type: 'circle',
        x: p[0],
        z: p[1],
        radius: 0.8
      });
    });
  }

  // --- ZONE 3: THÁP ĐIỀU HÀNH & CHẨN ĐOÁN SỰ CỐ ---

  _buildZone3() {
    // 1. Bank of Server Racks
    const rack1 = ProceduralModels.createOperationServerRack();
    rack1.position.set(26, 1.2, -62);
    this.group.add(rack1);
    this.animatedMeshes.push(rack1);

    const rack2 = ProceduralModels.createOperationServerRack();
    rack2.position.set(28, 1.2, -62);
    this.group.add(rack2);
    this.animatedMeshes.push(rack2);

    const rack3 = ProceduralModels.createOperationServerRack();
    rack3.position.set(38, 1.2, -62);
    this.group.add(rack3);
    this.animatedMeshes.push(rack3);

    this.collisionObstacles.push(
      { type: 'circle', x: 27, z: -62, radius: 1.8 },
      { type: 'circle', x: 38, z: -62, radius: 1.5 }
    );

    // 2. Ticket & Radar Ops Console (Trạm cấp cứu ticket)
    const ticketConsole = ProceduralModels.createTicketConsole();
    ticketConsole.position.set(33, 1.2, -54);
    this.group.add(ticketConsole);
    this.animatedMeshes.push(ticketConsole);

    this.collisionObstacles.push({
      type: 'circle',
      x: 33,
      z: -54,
      radius: 1.6
    });

    const ticketItem = new InteractiveObject({
      id: 'ticket_console_01',
      type: 'ticket',
      promptText: 'Chẩn Đoán Ticket Khẩn Cấp',
      radius: 3.2,
      mesh: ticketConsole,
      onInteract: () => {
        if (this.audioSynth) this.audioSynth.posBeep();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'DIAGNOSE_TICKETS' });
        }
      }
    });
    this.interactiveObjects.push(ticketItem);

    // 3. NPC Support Specialist
    const supportNPC = ProceduralModels.createNPCSupport();
    supportNPC.position.set(33, 1.2, -49);
    supportNPC.rotation.y = Math.PI;
    this.group.add(supportNPC);
    this.animatedMeshes.push(supportNPC);

    this.collisionObstacles.push({
      type: 'circle',
      x: 33,
      z: -49,
      radius: 1.0
    });

    const supportItem = new InteractiveObject({
      id: 'npc_support',
      type: 'npc',
      promptText: 'Báo Cáo Sự Cố Cho Support',
      radius: 3.2,
      mesh: supportNPC,
      onInteract: () => {
        if (this.audioSynth) this.audioSynth.correctChord();
        if (this.onQuestEvent) {
          this.onQuestEvent({ type: 'TALK_NPC', npc: 'support' });
        }
      }
    });
    this.interactiveObjects.push(supportItem);
  }

  // --- COLLISION RESOLUTION ---

  /**
   * Resolves player position collisions against static obstacles and the bridge barrier
   * @param {THREE.Vector3} playerPos Modifies in place or clamps
   * @param {number} playerRadius Default 0.5
   */
  resolveCollisions(playerPos, playerRadius = 0.5) {
    // 1. Bridge barrier check
    if (this.bridgeSystem && this.bridgeSystem.checkBarrierCollision(playerPos, playerRadius)) {
      // Push back to west side of current plank boundary
      const totalLength = this.bridgeSystem.bridgeEndX - this.bridgeSystem.bridgeStartX;
      const allowedMaxX = this.bridgeSystem.bridgeStartX + (totalLength / this.bridgeSystem.totalPlanks) * this.bridgeSystem.completedPlanks;
      if (playerPos.x > allowedMaxX - playerRadius) {
        playerPos.x = allowedMaxX - playerRadius;
      }
    }

    // 2. Static Obstacles
    for (let obs of this.collisionObstacles) {
      if (obs.type === 'circle') {
        const dx = playerPos.x - obs.x;
        const dz = playerPos.z - obs.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.radius + playerRadius;

        if (dist < minDist && dist > 0.0001) {
          const push = (minDist - dist) / dist;
          playerPos.x += dx * push;
          playerPos.z += dz * push;
        }
      } else if (obs.type === 'wall' || obs.type.startsWith('water_')) {
        // AABB check
        const nearX = Math.max(obs.minX, Math.min(playerPos.x, obs.maxX));
        const nearZ = Math.max(obs.minZ, Math.min(playerPos.z, obs.maxZ));
        const dx = playerPos.x - nearX;
        const dz = playerPos.z - nearZ;
        const dist = Math.hypot(dx, dz);

        if (dist < playerRadius) {
          // Push out along smallest penetration axis
          const penX = playerRadius - Math.abs(dx);
          const penZ = playerRadius - Math.abs(dz);

          if (penX < penZ) {
            playerPos.x += Math.sign(dx || 1) * penX;
          } else {
            playerPos.z += Math.sign(dz || 1) * penZ;
          }
        }
      }
    }

    // 3. Map boundary limits
    playerPos.x = THREE.MathUtils.clamp(playerPos.x, -58, 55);
    playerPos.z = THREE.MathUtils.clamp(playerPos.z, -74, 40);
  }

  // --- ZONE DETECTION ---

  checkCurrentZone(playerPos) {
    let zone = 'zone1';

    if (playerPos.x > 10) {
      if (playerPos.z < -38) {
        zone = 'zone3';
      } else {
        zone = 'zone2';
      }
    } else if (playerPos.x >= -10 && playerPos.x <= 10) {
      zone = 'bridge';
    } else {
      zone = 'zone1';
    }

    if (zone !== this.currentZone) {
      const oldZone = this.currentZone;
      this.currentZone = zone;
      if (this.onZoneChanged) {
        this.onZoneChanged(zone, oldZone);
      }
    }
    return zone;
  }

  // --- INTERACTION HANDLING ---

  /**
   * Find nearest interactive object within its interaction radius
   */
  getNearestInteractive(playerPos) {
    let nearest = null;
    let minDistance = Infinity;

    for (const obj of this.interactiveObjects) {
      const dist = obj.group.position.distanceTo(playerPos);
      if (dist <= obj.radius && dist < minDistance) {
        minDistance = dist;
        nearest = obj;
      }
    }
    return nearest;
  }

  /**
   * Trigger interaction on closest object
   */
  interactNearest(player) {
    const nearest = this.getNearestInteractive(player.getPosition());
    if (nearest) {
      nearest.interact(player);
      return nearest;
    }
    // If player is carrying item and no nearest object -> drop item
    if (player.isCarrying) {
      player.dropItem();
    }
    return null;
  }

  // --- UPDATE LOOP ---

  update(delta, playerPos) {
    // 1. Update animated scenery (river waves, pot steam, server lights, NPC bobs)
    for (let mesh of this.animatedMeshes) {
      if (mesh.userData && mesh.userData.update) {
        mesh.userData.update(delta);
      }
    }

    // 2. Update bridge system (planks animations)
    if (this.bridgeSystem) {
      this.bridgeSystem.update(delta);
    }

    // 3. Update interactive objects proximity & aura animations
    for (let obj of this.interactiveObjects) {
      obj.checkProximity(playerPos);
      obj.update(delta);
    }

    // 4. Update current zone
    this.checkCurrentZone(playerPos);
  }
}
