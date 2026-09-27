import * as THREE from 'three';
import { AudioSynth } from './AudioSynth.js';
import { InputController } from './InputController.js';
import { Player } from '../entities/Player.js';
import { WorldManager } from '../world/WorldManager.js';

/**
 * Engine3D - Main 3D Engine & Game Loop for IVT 3D Adventure
 * Orchestrates Three.js rendering, lighting, camera orbit, player physics,
 * input dispatching, world updates, and audio feedback.
 */
export class Engine3D {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] HTML container element for canvas
   * @param {boolean} [options.autoStart=true] Automatically start render loop
   */
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.autoStart = options.autoStart !== false;

    this.isRunning = false;
    this.clock = new THREE.Clock();

    // Event listeners map
    this.events = new Map();

    // 1. Initialize Core Systems
    this._initAudio();
    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initLighting();

    // 2. Initialize World & Entities
    this._initWorld();
    this._initPlayer();
    this._initInput();

    // 3. Setup Window Resize & Visibility Listeners
    this._bindEvents();

    if (this.autoStart) {
      this.start();
    }
  }

  // --- INITIALIZATION ---

  _initAudio() {
    this.audioSynth = new AudioSynth();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    const skyColor = 0xcde9fe; // Fresh energetic morning sky
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.012);
  }

  _initCamera() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    this.cameraTarget = new THREE.Vector3(0, 1.4, 0);
    this.cameraSmoothPos = new THREE.Vector3(-25, 10, 14);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Attach to DOM
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.outline = 'none';
    this.container.appendChild(this.renderer.domElement);
  }

  _initLighting() {
    // 1. Soft Ambient Sky Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Light (Sky cool blue / Ground warm grass bounce)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x3d7a46, 0.45);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 3. Main Sunlight with directional soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    this.sunLight.position.set(35, 60, 45);
    this.sunLight.castShadow = true;

    // Shadow camera bounds covering the interactive gameplay area
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 180;

    const d = 45;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  _initWorld() {
    this.worldManager = new WorldManager(this.scene, this.audioSynth);

    // Forward bridge and quest events
    this.worldManager.bridgeSystem.onPlankBuilt = (index, current, total) => {
      this.emit('plankBuilt', { index, current, total });
    };

    this.worldManager.bridgeSystem.onBridgeCompleted = () => {
      this.emit('bridgeCompleted');
    };

    this.worldManager.onZoneChanged = (newZone, oldZone) => {
      this.emit('zoneChanged', { newZone, oldZone });
    };

    this.worldManager.onQuestEvent = (event) => {
      this.emit('questEvent', event);
    };
  }

  _initPlayer() {
    this.player = new Player(this.scene, this.audioSynth);
    // Start player in Zone 1 (Làng Khởi Đầu / Trước quầy POS)
    this.player.setPosition(-25, 0, 0);
  }

  _initInput() {
    // Collect walkable meshes for click-to-move raycasting
    const groundMeshes = [
      this.worldManager.westGround,
      this.worldManager.eastGround
    ].filter(Boolean);

    this.input = new InputController(this.renderer.domElement, this.camera, groundMeshes);
  }

  _bindEvents() {
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Handle tab visibility to pause clock delta spikes
    this._onVisibilityChange = () => {
      if (document.hidden) {
        this.clock.stop();
      } else {
        this.clock.start();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  _onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  // --- EVENT SYSTEM ---

  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (!this.events.has(eventName)) return;
    const list = this.events.get(eventName).filter(cb => cb !== callback);
    this.events.set(eventName, list);
  }

  emit(eventName, data) {
    if (!this.events.has(eventName)) return;
    for (const cb of this.events.get(eventName)) {
      try {
        cb(data);
      } catch (err) {
        console.error(`[Engine3D] Error in event listener for ${eventName}:`, err);
      }
    }
  }

  // --- GAME LOOP & CAMERA FOLLOW ---

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this._loop();
  }

  pause() {
    this.isRunning = false;
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.clock.start();
      this._loop();
    }
  }

  _loop = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this._loop);

    // Clamp delta time to avoid large physics steps on tab lag
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this._update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  _update(delta) {
    // 1. Update Input system
    this.input.update(delta);

    // 2. Consume interaction trigger
    if (this.input.consumeInteract()) {
      const interacted = this.worldManager.interactNearest(this.player);
      if (interacted) {
        this.emit('interaction', { object: interacted });
      }
    }

    // 3. Calculate movement direction relative to camera yaw
    const playerPos = this.player.getPosition();
    const moveDir = this.input.getMovementVector(playerPos);
    const isJumpPressed = this.input.consumeJump();

    // 4. Update Player movement & procedural animations
    this.player.update(delta, moveDir, isJumpPressed);

    // 5. Resolve world obstacles & bridge barrier collisions
    this.worldManager.resolveCollisions(playerPos, 0.45);

    // 6. Update world environment (river waves, pot steam, NPCs, bridge)
    this.worldManager.update(delta, playerPos);

    // 7. Update 3rd-Person Orbit Camera Follow
    this._updateCamera(delta);
  }

  _updateCamera(delta) {
    const playerPos = this.player.getPosition();

    // Target look-at point: player's upper chest / head
    this.cameraTarget.lerp(
      new THREE.Vector3(playerPos.x, playerPos.y + 1.4, playerPos.z),
      Math.min(delta * 10, 1.0)
    );

    // Calculate ideal camera position using spherical coordinates from InputController orbit
    const orbit = this.input.orbit;
    const sinPitch = Math.sin(orbit.pitch);
    const cosPitch = Math.cos(orbit.pitch);
    const sinYaw = Math.sin(orbit.yaw);
    const cosYaw = Math.cos(orbit.yaw);

    const idealX = this.cameraTarget.x + orbit.distance * sinPitch * sinYaw;
    const idealY = this.cameraTarget.y + orbit.distance * cosPitch;
    const idealZ = this.cameraTarget.z + orbit.distance * sinPitch * cosYaw;

    // Smooth lerp camera translation
    this.cameraSmoothPos.x = THREE.MathUtils.lerp(this.cameraSmoothPos.x, idealX, Math.min(delta * 12, 1.0));
    this.cameraSmoothPos.y = THREE.MathUtils.lerp(this.cameraSmoothPos.y, idealY, Math.min(delta * 12, 1.0));
    this.cameraSmoothPos.z = THREE.MathUtils.lerp(this.cameraSmoothPos.z, idealZ, Math.min(delta * 12, 1.0));

    // Clamp camera min height above ground so it doesn't clip into terrain
    this.cameraSmoothPos.y = Math.max(this.cameraSmoothPos.y, 0.8);

    this.camera.position.copy(this.cameraSmoothPos);
    this.camera.lookAt(this.cameraTarget);

    // Update sunlight shadow camera follow target
    this.sunLight.target.position.set(playerPos.x, 0, playerPos.z);
  }

  // --- PUBLIC CONTROL APIS ---

  /**
   * Build the next bridge plank (called by QuestEngine)
   */
  buildNextPlank() {
    return this.worldManager.bridgeSystem.buildNextPlank();
  }

  /**
   * Build a specific bridge plank index (0 - 5)
   */
  buildPlank(index) {
    return this.worldManager.bridgeSystem.buildPlank(index);
  }

  /**
   * Virtual Joystick hook for Mobile UI overlay
   */
  setJoystickVector(x, y) {
    this.input.setJoystickVector(x, y);
  }

  /**
   * Action button triggers for Mobile UI overlay
   */
  triggerInteract() {
    this.input.triggerInteract();
  }

  triggerJump() {
    this.input.triggerJump();
  }

  /**
   * Sound controls
   */
  toggleMute() {
    return this.audioSynth.toggleMute();
  }

  toggleBGM() {
    return this.audioSynth.toggleBGM();
  }

  /**
   * Clean up and dispose resources
   */
  dispose() {
    this.pause();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);

    this.input.detach();
    this.audioSynth.stopBGM();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
