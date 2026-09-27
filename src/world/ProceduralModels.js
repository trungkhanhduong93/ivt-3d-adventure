import * as THREE from 'three';

/**
 * ProceduralModels - High-quality Low-poly 3D Models for IVT 3D Adventure
 * Built purely with Three.js geometries and procedural Canvas textures.
 * Requires ZERO external assets.
 */

// --- Canvas Texture Generators ---

function createLabelTexture(title, subtitle, code) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background kraft paper color
  ctx.fillStyle = '#d4a373';
  ctx.fillRect(0, 0, 256, 256);

  // Border
  ctx.strokeStyle = '#8d5b4c';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 240);

  // White label sticker
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 24, 208, 120);

  // Brand header
  ctx.fillStyle = '#e63946';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('IVT SUPPLY CHAIN', 34, 52);

  // Product title
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.fillText(title, 34, 95);

  // Subtitle
  ctx.fillStyle = '#457b9d';
  ctx.font = '18px "Segoe UI", Arial, sans-serif';
  ctx.fillText(subtitle, 34, 128);

  // Fake Barcode lines
  ctx.fillStyle = '#000000';
  for (let x = 30; x < 226; x += 6) {
    const barW = Math.random() > 0.4 ? 4 : 2;
    ctx.fillRect(x, 160, barW, 45);
  }
  ctx.fillStyle = '#333333';
  ctx.font = '14px monospace';
  ctx.fillText(code || 'SKU-8930-IVT', 40, 225);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPOSTerminalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Screen background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 384);

  // Header Bar
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, 512, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillText('⚡ IVT POS STATION #01 - ONLINE', 20, 34);

  // Content Area
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, 65, 472, 230);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('HOÁ ĐƠN #IVT-9021', 35, 95);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '18px monospace';
  ctx.fillText('1. Cà Phê Pha Máy Special   x2   70.000đ', 35, 130);
  ctx.fillText('2. Trà Sữa Matcha Uji       x1   45.000đ', 35, 160);
  ctx.fillText('3. Bánh Croissant Bơ Pháp   x2   50.000đ', 35, 190);

  // Total bar
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 310, 472, 55);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 26px "Segoe UI", sans-serif';
  ctx.fillText('TỔNG CỘNG: 165.000 VNĐ [PAID]', 35, 347);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createScaleLEDTexture(weightText = '0.00 kg') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(weightText, 128, 75);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('IVT ACCU-WEIGH PRO', 128, 105);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createServerRackTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 512);

  // Server slots
  for (let y = 15; y < 500; y += 42) {
    ctx.fillStyle = '#27272a';
    ctx.fillRect(10, y, 236, 36);

    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, y, 236, 36);

    // Blinking LEDs
    const colors = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(25 + i * 14, y + 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cooling vent lines
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1.5;
    for (let vx = 120; vx < 230; vx += 6) {
      ctx.beginPath();
      ctx.moveTo(vx, y + 8);
      ctx.lineTo(vx, y + 28);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRadarLogTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 512, 512);

  // Radar circle
  ctx.strokeStyle = '#065f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 170, 130, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 170, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Radar sweep line
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 170);
  ctx.lineTo(350, 100);
  ctx.stroke();

  // Target dots
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(310, 140, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(220, 210, 5, 0, Math.PI * 2);
  ctx.fill();

  // Log terminal below radar
  ctx.fillStyle = '#111827';
  ctx.fillRect(20, 320, 472, 175);
  ctx.fillStyle = '#10b981';
  ctx.font = '17px monospace';
  ctx.fillText('> SYSTEM: IVT OPERATIONS CENTER', 35, 350);
  ctx.fillText('> ZONE 1 (POS): 100% HEALTHY', 35, 380);
  ctx.fillText('> ZONE 2 (KITCHEN): TEMP 88°C OPTIMAL', 35, 410);
  ctx.fillText('> ZONE 3 (DATA TOWER): RUNNING NOMINAL', 35, 440);
  ctx.fillText('> DATA BRIDGE: 6 NODES READY TO LINK', 35, 470);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createNPCBadge(name, role, color = '#2563eb') {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Rounded pill background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 364, 108, 20);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(10, 10, 364, 108, 20);
  ctx.stroke();

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 192, 58);

  // Role tag
  ctx.fillStyle = color;
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`★ ${role} ★`, 192, 94);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.2, 1.1, 1);
  return sprite;
}

// --- Procedural 3D Models ---

export class ProceduralModels {
  // Shared materials for memory efficiency
  static materials = {
    woodPlank: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 }),
    stainlessSteel: new THREE.MeshStandardMaterial({ color: 0xd9e2ec, metalness: 0.85, roughness: 0.25 }),
    blackPlastic: new THREE.MeshStandardMaterial({ color: 0x222225, roughness: 0.5 }),
    screenGlow: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    copperPot: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.6, roughness: 0.35 }),
    soupLiquid: new THREE.MeshStandardMaterial({ color: 0xc25916, roughness: 0.1, metalness: 0.1 }),
    grassGreen: new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.9 }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x276749, roughness: 0.85 }),
    rockGrey: new THREE.MeshStandardMaterial({ color: 0x718096, roughness: 0.95, flatShading: true }),
    fenceWood: new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.85 }),
    lanternGlass: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 })
  };

  /**
   * Cashier POS Counter & Terminal with dynamic glowing screen
   */
  static createPOSCounter() {
    const group = new THREE.Group();
    group.name = 'POS_Counter';

    // Main Wooden Counter Base
    const baseGeo = new THREE.BoxGeometry(3.6, 1.2, 1.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Marble/White Countertop Top Slab
    const topGeo = new THREE.BoxGeometry(3.8, 0.1, 1.55);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 1.25;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // POS Terminal Stand
    const standGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.35, 12);
    const stand = new THREE.Mesh(standGeo, ProceduralModels.materials.blackPlastic);
    stand.position.set(-0.6, 1.45, 0.1);
    group.add(stand);

    // POS Screen Body (Bezel)
    const screenBodyGeo = new THREE.BoxGeometry(0.85, 0.65, 0.08);
    const screenBody = new THREE.Mesh(screenBodyGeo, ProceduralModels.materials.blackPlastic);
    screenBody.position.set(-0.6, 1.72, 0.1);
    screenBody.rotation.x = -0.22;
    screenBody.castShadow = true;
    group.add(screenBody);

    // Glowing POS Touchscreen Display with Canvas Texture
    const screenTex = createPOSTerminalTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenFaceGeo = new THREE.PlaneGeometry(0.8, 0.58);
    const screenFace = new THREE.Mesh(screenFaceGeo, screenMat);
    screenFace.position.set(-0.6, 1.72, 0.145);
    screenFace.rotation.x = -0.22;
    group.add(screenFace);

    // Barcode Scanner Gun & Base
    const gunBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8), ProceduralModels.materials.blackPlastic);
    gunBase.position.set(0.2, 1.35, 0.2);
    group.add(gunBase);

    const gunHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.08), ProceduralModels.materials.blackPlastic);
    gunHandle.position.set(0.2, 1.5, 0.2);
    gunHandle.rotation.z = 0.3;
    group.add(gunHandle);

    // Receipt printer
    const printerGeo = new THREE.BoxGeometry(0.35, 0.25, 0.35);
    const printer = new THREE.Mesh(printerGeo, ProceduralModels.materials.blackPlastic);
    printer.position.set(0.7, 1.42, 0.15);
    group.add(printer);

    // Little paper slip coming out
    const slipGeo = new THREE.PlaneGeometry(0.18, 0.12);
    const slipMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const slip = new THREE.Mesh(slipGeo, slipMat);
    slip.position.set(0.7, 1.56, 0.2);
    slip.rotation.x = -Math.PI / 4;
    group.add(slip);

    // Subtle blue point light simulating screen glow
    const posLight = new THREE.PointLight(0x38bdf8, 1.2, 3);
    posLight.position.set(-0.6, 1.8, 0.5);
    group.add(posLight);

    return group;
  }

  /**
   * Warehouse Pallet with stacked crates
   */
  static createPalletWithCrates(type = 'CAFE') {
    const group = new THREE.Group();
    group.name = `Pallet_${type}`;

    // Wooden Pallet Base
    const plankMat = ProceduralModels.materials.woodPlank;
    for (let i = -0.7; i <= 0.7; i += 0.35) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.25), plankMat);
      plank.position.set(0, 0.15, i);
      plank.castShadow = true;
      group.add(plank);
    }
    // Cross beams
    for (let x = -0.7; x <= 0.7; x += 0.7) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.7), ProceduralModels.materials.woodDark);
      beam.position.set(x, 0.06, 0);
      beam.castShadow = true;
      group.add(beam);
    }

    // Crates on pallet
    const crateConfigs = [
      { pos: [-0.42, 0.55, -0.42], rot: 0.02 },
      { pos: [0.42, 0.55, -0.42], rot: -0.05 },
      { pos: [-0.42, 0.55, 0.42], rot: -0.03 },
      { pos: [0.42, 0.55, 0.42], rot: 0.04 },
      // Top layer
      { pos: [0, 1.35, 0], rot: 0.08 }
    ];

    crateConfigs.forEach((cfg, idx) => {
      const crate = ProceduralModels.createSingleCrate(type, `${type} #${idx + 1}`);
      crate.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      crate.rotation.y = cfg.rot;
      group.add(crate);
    });

    return group;
  }

  /**
   * Single Pickupable Carton Crate with canvas label
   */
  static createSingleCrate(type = 'CAFE', subtitle = 'Arabica Beans 10kg') {
    const group = new THREE.Group();
    group.name = `Crate_${type}`;

    const labelTex = createLabelTexture(type, subtitle, `IVT-${type}-2026`);

    // Box Materials: sides have label, top/bottom brown cardboard
    const brownMat = new THREE.MeshStandardMaterial({ color: 0xc89666, roughness: 0.85 });
    const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.8 });

    const mats = [
      labelMat, // right
      labelMat, // left
      brownMat, // top
      brownMat, // bottom
      labelMat, // front
      labelMat  // back
    ];

    const boxGeo = new THREE.BoxGeometry(0.75, 0.65, 0.75);
    const boxMesh = new THREE.Mesh(boxGeo, mats);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    group.add(boxMesh);

    // Packing tape across top
    const tapeGeo = new THREE.BoxGeometry(0.18, 0.01, 0.76);
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.4 });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.y = 0.33;
    group.add(tape);

    return group;
  }

  /**
   * Electronic Weighing Scale Table with digital LED screen
   */
  static createWeighingScaleTable() {
    const group = new THREE.Group();
    group.name = 'WeighingScaleTable';

    // Stainless steel table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.12, 1.4),
      ProceduralModels.materials.stainlessSteel
    );
    tableTop.position.y = 1.1;
    tableTop.castShadow = true;
    group.add(tableTop);

    // 4 Table Legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 10);
    const legPositions = [
      [-1.05, 0.55, -0.55],
      [1.05, 0.55, -0.55],
      [-1.05, 0.55, 0.55],
      [1.05, 0.55, 0.55]
    ];
    legPositions.forEach(p => {
      const leg = new THREE.Mesh(legGeo, ProceduralModels.materials.stainlessSteel);
      leg.position.set(...p);
      leg.castShadow = true;
      group.add(leg);
    });

    // Scale Heavy Base Plate
    const scaleBaseGeo = new THREE.BoxGeometry(1.0, 0.08, 0.8);
    const scaleBase = new THREE.Mesh(scaleBaseGeo, ProceduralModels.materials.blackPlastic);
    scaleBase.position.set(0, 1.2, 0);
    group.add(scaleBase);

    // Weighing Platform (Slightly raised metal plate)
    const platformGeo = new THREE.BoxGeometry(0.9, 0.04, 0.72);
    const platform = new THREE.Mesh(platformGeo, ProceduralModels.materials.stainlessSteel);
    platform.position.set(0, 1.25, 0);
    group.add(platform);

    // Indicator Column
    const colGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
    const col = new THREE.Mesh(colGeo, ProceduralModels.materials.stainlessSteel);
    col.position.set(0.65, 1.45, -0.4);
    group.add(col);

    // LED Display Head
    const ledHeadGeo = new THREE.BoxGeometry(0.45, 0.28, 0.1);
    const ledHead = new THREE.Mesh(ledHeadGeo, ProceduralModels.materials.blackPlastic);
    ledHead.position.set(0.65, 1.78, -0.4);
    ledHead.rotation.x = -0.2;
    group.add(ledHead);

    // Glowing LED Screen texture
    const ledTex = createScaleLEDTexture('0.00 kg');
    const ledScreenGeo = new THREE.PlaneGeometry(0.42, 0.24);
    const ledScreenMat = new THREE.MeshBasicMaterial({ map: ledTex });
    const ledScreen = new THREE.Mesh(ledScreenGeo, ledScreenMat);
    ledScreen.position.set(0.65, 1.78, -0.34);
    ledScreen.rotation.x = -0.2;
    group.add(ledScreen);

    // Save reference for dynamic updates
    group.userData.screenMesh = ledScreen;
    group.userData.updateDisplay = (text) => {
      ledScreen.material.map = createScaleLEDTexture(text);
      ledScreen.material.map.needsUpdate = true;
    };

    return group;
  }

  /**
   * Central Kitchen: Giant Cooking Pot with bubbling soup and steam particles
   */
  static createCentralKitchenCooker() {
    const group = new THREE.Group();
    group.name = 'Central_Kitchen_Pot';

    // Industrial Furnace Base
    const furnaceGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.0, 24);
    const furnaceMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const furnace = new THREE.Mesh(furnaceGeo, furnaceMat);
    furnace.position.y = 0.5;
    furnace.castShadow = true;
    group.add(furnace);

    // Heating Ring with warm orange glow
    const ringGeo = new THREE.TorusGeometry(1.4, 0.08, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.02;
    group.add(ring);

    // Giant Copper/Stainless Pot Body
    const potGeo = new THREE.CylinderGeometry(1.4, 1.2, 1.6, 24, 1, true);
    const potMat = ProceduralModels.materials.copperPot;
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 1.85;
    pot.castShadow = true;
    group.add(pot);

    // Pot Lip / Top Rim
    const lipGeo = new THREE.TorusGeometry(1.42, 0.08, 12, 32);
    const lip = new THREE.Mesh(lipGeo, potMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 2.65;
    group.add(lip);

    // Pot Handles
    for (let sign of [-1, 1]) {
      const handleGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
      const handle = new THREE.Mesh(handleGeo, ProceduralModels.materials.stainlessSteel);
      handle.position.set(sign * 1.5, 2.3, 0);
      handle.rotation.y = Math.PI / 2;
      group.add(handle);
    }

    // Inside Liquid Surface
    const liquidGeo = new THREE.CircleGeometry(1.36, 24);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      roughness: 0.15,
      metalness: 0.2
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.rotation.x = -Math.PI / 2;
    liquid.position.y = 2.45;
    group.add(liquid);

    // Steam particle system (mesh spheres that drift up)
    const steamGroup = new THREE.Group();
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28
    });
    const steamGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const steamParticles = [];

    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(steamGeo, steamMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 1.6,
        2.5 + Math.random() * 2.5,
        (Math.random() - 0.5) * 1.6
      );
      p.userData = {
        speedY: 0.015 + Math.random() * 0.02,
        driftX: (Math.random() - 0.5) * 0.008,
        baseY: 2.5,
        maxY: 5.5,
        scaleSpeed: 0.008
      };
      steamGroup.add(p);
      steamParticles.push(p);
    }
    group.add(steamGroup);

    // Warm fire light underneath pot
    const fireLight = new THREE.PointLight(0xf97316, 1.8, 6);
    fireLight.position.set(0, 1.1, 0);
    group.add(fireLight);

    // Animation hook for steam
    group.userData.update = (delta) => {
      steamParticles.forEach(p => {
        p.position.y += p.userData.speedY;
        p.position.x += p.userData.driftX;
        p.scale.addScalar(p.userData.scaleSpeed);
        p.material.opacity = Math.max(0, 0.35 * (1 - (p.position.y - p.userData.baseY) / (p.userData.maxY - p.userData.baseY)));

        if (p.position.y > p.userData.maxY) {
          p.position.y = p.userData.baseY;
          p.position.x = (Math.random() - 0.5) * 1.4;
          p.position.z = (Math.random() - 0.5) * 1.4;
          p.scale.set(1, 1, 1);
        }
      });
    };

    return group;
  }

  /**
   * Stainless Steel Kitchen Prep Table with chopping board & bowls
   */
  static createPrepTable() {
    const group = new THREE.Group();
    group.name = 'KitchenPrepTable';

    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.12, 1.3),
      ProceduralModels.materials.stainlessSteel
    );
    tableTop.position.y = 1.1;
    tableTop.castShadow = true;
    group.add(tableTop);

    // Bottom Shelf
    const bottomShelf = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.05, 1.1),
      ProceduralModels.materials.stainlessSteel
    );
    bottomShelf.position.y = 0.3;
    group.add(bottomShelf);

    // 4 Stainless Legs
    const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.1, 8);
    [[-1.35, 0.55, -0.52], [1.35, 0.55, -0.52], [-1.35, 0.55, 0.52], [1.35, 0.55, 0.52]].forEach(p => {
      const leg = new THREE.Mesh(legGeo, ProceduralModels.materials.stainlessSteel);
      leg.position.set(...p);
      leg.castShadow = true;
      group.add(leg);
    });

    // Wooden Chopping Board
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.06, 0.6),
      ProceduralModels.materials.woodPlank
    );
    board.position.set(-0.6, 1.19, 0);
    group.add(board);

    // Stainless Mixing Bowls
    const bowlGeo = new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bowlMat = ProceduralModels.materials.stainlessSteel;
    const bowl1 = new THREE.Mesh(bowlGeo, bowlMat);
    bowl1.rotation.x = Math.PI;
    bowl1.position.set(0.6, 1.25, -0.2);
    group.add(bowl1);

    const bowl2 = new THREE.Mesh(bowlGeo, bowlMat);
    bowl2.rotation.x = Math.PI;
    bowl2.scale.set(0.8, 0.8, 0.8);
    bowl2.position.set(0.7, 1.23, 0.25);
    group.add(bowl2);

    return group;
  }

  /**
   * Operation Server Rack with blinking LED server units
   */
  static createOperationServerRack() {
    const group = new THREE.Group();
    group.name = 'Server_Rack';

    // Metal Frame Cabinet
    const frameGeo = new THREE.BoxGeometry(1.4, 3.2, 1.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.8 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1.6;
    frame.castShadow = true;
    group.add(frame);

    // Front Rack Face with procedural LED Texture
    const rackTex = createServerRackTexture();
    const rackFaceGeo = new THREE.PlaneGeometry(1.2, 3.0);
    const rackFaceMat = new THREE.MeshBasicMaterial({ map: rackTex });
    const rackFace = new THREE.Mesh(rackFaceGeo, rackFaceMat);
    rackFace.position.set(0, 1.6, 0.56);
    group.add(rackFace);

    // Top exhaust fans / mesh grill
    const grillGeo = new THREE.BoxGeometry(1.1, 0.08, 0.8);
    const grill = new THREE.Mesh(grillGeo, ProceduralModels.materials.blackPlastic);
    grill.position.set(0, 3.24, 0);
    group.add(grill);

    // Blinking point light representing server activity
    const rackLight = new THREE.PointLight(0x22c55e, 1.0, 4);
    rackLight.position.set(0, 1.8, 0.9);
    group.add(rackLight);

    let blinkTimer = 0;
    group.userData.update = (delta) => {
      blinkTimer += delta;
      if (blinkTimer > 0.4) {
        blinkTimer = 0;
        rackLight.color.setHex(Math.random() > 0.3 ? 0x22c55e : (Math.random() > 0.5 ? 0x3b82f6 : 0xef4444));
        rackLight.intensity = 0.6 + Math.random() * 0.8;
      }
    };

    return group;
  }

  /**
   * Diagnostic Ticket & Radar Ops Console
   */
  static createTicketConsole() {
    const group = new THREE.Group();
    group.name = 'RadarTicketConsole';

    // Base pedestal
    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.2, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
    );
    pedestal.position.y = 0.6;
    pedestal.castShadow = true;
    group.add(pedestal);

    // Curved High-Tech Screen
    const screenGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.3, 16, 1, true, -Math.PI / 5, (2 * Math.PI) / 5);
    const radarTex = createRadarLogTexture();
    const screenMat = new THREE.MeshBasicMaterial({ map: radarTex, side: THREE.DoubleSide });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.8, 0.3);
    screen.rotation.y = Math.PI;
    group.add(screen);

    // Emergency flashing beacon on top
    const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.1, 12), ProceduralModels.materials.blackPlastic);
    beaconBase.position.set(0, 2.5, 0);
    group.add(beaconBase);

    const beaconGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 12);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.64, 0);
    group.add(beacon);

    const beaconLight = new THREE.PointLight(0xef4444, 2.0, 5);
    beaconLight.position.set(0, 2.8, 0);
    group.add(beaconLight);

    let beaconTime = 0;
    group.userData.update = (delta) => {
      beaconTime += delta * 6;
      beaconLight.intensity = Math.sin(beaconTime) > 0 ? 2.5 : 0.2;
      beaconMat.emissiveIntensity = Math.sin(beaconTime) > 0 ? 2.0 : 0.4;
    };

    return group;
  }

  /**
   * Environmental Trees
   */
  static createTree() {
    const group = new THREE.Group();
    group.name = 'Tree';

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, ProceduralModels.materials.woodDark);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    // Stylized foliage cones
    const layerConfigs = [
      { y: 2.2, r: 1.6, h: 2.0, color: 0x2d6a4f },
      { y: 3.3, r: 1.25, h: 1.8, color: 0x40916c },
      { y: 4.3, r: 0.85, h: 1.5, color: 0x52b788 }
    ];

    layerConfigs.forEach(cfg => {
      const folGeo = new THREE.ConeGeometry(cfg.r, cfg.h, 8);
      const folMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.85, flatShading: true });
      const fol = new THREE.Mesh(folGeo, folMat);
      fol.position.y = cfg.y;
      fol.castShadow = true;
      group.add(fol);
    });

    return group;
  }

  /**
   * Environmental Mossy Rock
   */
  static createRock() {
    const rockGeo = new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.5, 1);
    // Displace vertices slightly for organic faceted look
    const pos = rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      v.multiplyScalar(0.9 + Math.random() * 0.2);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    rockGeo.computeVertexNormals();

    const rock = new THREE.Mesh(rockGeo, ProceduralModels.materials.rockGrey);
    rock.position.y = 0.5;
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  /**
   * River Surface with gentle water wave animation
   */
  static createRiverMesh(width = 16, length = 140) {
    const riverGeo = new THREE.PlaneGeometry(width, length, 32, 64);
    riverGeo.rotateX(-Math.PI / 2);

    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });

    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.y = -0.3; // below bank surface
    river.name = 'River';

    // Wave animation hook
    const origPos = riverGeo.attributes.position.clone();
    let waveTime = 0;
    river.userData.update = (delta) => {
      waveTime += delta * 2.2;
      const currentPos = riverGeo.attributes.position;
      for (let i = 0; i < currentPos.count; i++) {
        const x = origPos.getX(i);
        const z = origPos.getZ(i);
        const waveY = Math.sin(x * 0.5 + waveTime) * 0.08 + Math.cos(z * 0.4 + waveTime * 1.3) * 0.06;
        currentPos.setY(i, waveY);
      }
      currentPos.needsUpdate = true;
    };

    return river;
  }

  // --- NPCs (Milo, Chef John, Support Specialist) ---

  /**
   * Helper to build a humanoid base
   */
  static _createHumanoidBase(skinColor = 0xffdfba, shirtColor = 0x2563eb, pantsColor = 0x1e293b) {
    const group = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.8, 0.45),
      new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 })
    );
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 })
    );
    head.position.y = 2.05;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    [-0.12, 0.12].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eyeMat);
      eye.position.set(x, 2.08, 0.25);
      group.add(eye);
    });

    // Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.85, 0.3);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, 0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.25);
    const armMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.48, 1.32, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.48, 1.32, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    group.userData.leftArm = leftArm;
    group.userData.rightArm = rightArm;
    group.userData.head = head;
    group.userData.torso = torso;

    return group;
  }

  /**
   * NPC 1: Milo - Quản Lý Kho & Thu Ngân (Store Manager)
   */
  static createNPCMilo() {
    const npc = ProceduralModels._createHumanoidBase(0xffdfba, 0x16a34a, 0x1e3a8a);
    npc.name = 'NPC_Milo';

    // Storekeeper Cap (Green)
    const capVisor = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x15803d })
    );
    capVisor.position.set(0, 2.25, 0.2);
    npc.add(capVisor);

    const capTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.18, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x166534 })
    );
    capTop.position.set(0, 2.38, 0);
    npc.add(capTop);

    // F&B Apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.75, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
    );
    apron.position.set(0, 1.25, 0.22);
    npc.add(apron);

    // Clipboard in left hand
    const clipboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.04),
      ProceduralModels.materials.woodPlank
    );
    clipboard.position.set(-0.48, 1.0, 0.25);
    clipboard.rotation.x = -Math.PI / 4;
    npc.add(clipboard);

    // Floating name badge
    const badge = createNPCBadge('Milo', 'Quản Lý Kho POS', '#16a34a');
    badge.position.set(0, 2.85, 0);
    npc.add(badge);

    // Idle animation: gentle breathing bob
    let t = 0;
    npc.userData.update = (delta) => {
      t += delta * 2.5;
      npc.position.y = Math.sin(t) * 0.04;
      npc.userData.leftArm.rotation.x = Math.sin(t) * 0.1;
      npc.userData.rightArm.rotation.x = -Math.sin(t) * 0.1;
    };

    return npc;
  }

  /**
   * NPC 2: Chef John - Bếp Trưởng (Central Kitchen Island)
   */
  static createNPCChefJohn() {
    const npc = ProceduralModels._createHumanoidBase(0xfce7f3, 0xffffff, 0x1f2937);
    npc.name = 'NPC_ChefJohn';

    // Tall Chef Toque Hat
    const hatBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    hatBase.position.set(0, 2.38, 0);
    npc.add(hatBase);

    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.28, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
    );
    hatCrown.position.set(0, 2.68, 0);
    npc.add(hatCrown);

    // Red Neckerchief
    const neckerchief = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.05, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    neckerchief.position.set(0, 1.76, 0);
    neckerchief.rotation.x = Math.PI / 2;
    npc.add(neckerchief);

    // Double-breasted black buttons
    const btnMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    [-0.1, 0.1].forEach(x => {
      [1.5, 1.35, 1.2].forEach(y => {
        const btn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.03), btnMat);
        btn.position.set(x, y, 0.24);
        npc.add(btn);
      });
    });

    // Big Wooden Spoon in right hand
    const spoonHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
      ProceduralModels.materials.woodPlank
    );
    spoonHandle.position.set(0.48, 1.2, 0.25);
    spoonHandle.rotation.x = -Math.PI / 3;
    npc.add(spoonHandle);

    const spoonHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      ProceduralModels.materials.woodPlank
    );
    spoonHead.position.set(0.48, 1.5, 0.45);
    spoonHead.scale.set(1.4, 0.6, 1.2);
    npc.add(spoonHead);

    // Floating name badge
    const badge = createNPCBadge('Chef John', 'Bếp Trưởng Khổng Lồ', '#ea580c');
    badge.position.set(0, 3.25, 0);
    npc.add(badge);

    let t = 0;
    npc.userData.update = (delta) => {
      t += delta * 2.8;
      npc.position.y = Math.sin(t) * 0.04;
      spoonHandle.rotation.z = Math.sin(t) * 0.15;
    };

    return npc;
  }

  /**
   * NPC 3: Support Specialist - Chuyên Viên Vận Hành & Ticket (Tech Ops)
   */
  static createNPCSupport() {
    const npc = ProceduralModels._createHumanoidBase(0xfef08a, 0x0284c7, 0x334155);
    npc.name = 'NPC_Support';

    // Headset with Microphone
    const headsetBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.03, 8, 16, Math.PI),
      ProceduralModels.materials.blackPlastic
    );
    headsetBand.position.set(0, 2.25, 0);
    npc.add(headsetBand);

    // Earpieces
    [-0.28, 0.28].forEach(x => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), ProceduralModels.materials.blackPlastic);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(x, 2.15, 0);
      npc.add(ear);
    });

    // Mic boom
    const mic = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
      ProceduralModels.materials.blackPlastic
    );
    mic.position.set(0.18, 2.05, 0.2);
    mic.rotation.x = Math.PI / 3;
    npc.add(mic);

    // Glowing Tech Tablet in hand
    const tabletGeo = new THREE.BoxGeometry(0.4, 0.04, 0.55);
    const tablet = new THREE.Mesh(tabletGeo, ProceduralModels.materials.blackPlastic);
    tablet.position.set(0, 1.15, 0.35);
    tablet.rotation.x = -Math.PI / 6;
    npc.add(tablet);

    const tabScreenGeo = new THREE.PlaneGeometry(0.36, 0.5);
    const tabScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tabScreen = new THREE.Mesh(tabScreenGeo, tabScreenMat);
    tabScreen.position.set(0, 1.18, 0.35);
    tabScreen.rotation.x = -Math.PI / 6;
    npc.add(tabScreen);

    // Floating name badge
    const badge = createNPCBadge('Support Specialist', 'Chẩn Đoán Ticket Sự Cố', '#0284c7');
    badge.position.set(0, 2.85, 0);
    npc.add(badge);

    let t = 0;
    npc.userData.update = (delta) => {
      t += delta * 2.2;
      npc.position.y = Math.sin(t) * 0.03;
      tabScreenMat.color.setHex(Math.sin(t * 3) > 0 ? 0x38bdf8 : 0x818cf8);
    };

    return npc;
  }
}
