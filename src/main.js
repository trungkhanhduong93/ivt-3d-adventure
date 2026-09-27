/**
 * main.js - Master Game Orchestrator
 * Integrates UIManager, Engine3D, GameState, SoundManager and InputController.
 */

import { SoundManager } from './core/SoundManager.js';
import { GameState } from './core/GameState.js';
import { InputController } from './engine/InputController.js';
import { Engine3D } from './engine/Engine3D.js';
import { UIManager } from './ui/UIManager.js';
import { QUESTS_DATA, NPC_DATA, COLLECTIBLE_ITEMS } from './data/QuestsData.js';

class GameApp {
  constructor() {
    this.sound = new SoundManager();
    this.state = new GameState();
    this.input = new InputController();

    // Active quests pointer
    this.currentQuestIndex = 0;

    this.initUI();
    this.initEngine();
    this.bindEvents();
    this.startGameLoop();
  }

  initUI() {
    this.ui = new UIManager({
      soundManager: this.sound,
      onRoleChange: (role) => this.handleRoleChange(role),
      onActionTrigger: () => this.handleActionTrigger(),
      onJoystickMove: (vec) => this.input.setJoystickInput(vec.x, vec.y),
      onJoystickEnd: () => this.input.resetJoystickInput(),
      onResetGame: () => this.resetGame()
    });

    // Subscribe UI to GameState changes
    this.state.subscribe((snapshot) => {
      this.ui.updateHUD({
        level: snapshot.level,
        exp: snapshot.exp,
        maxExp: snapshot.maxExp,
        title: snapshot.title,
        bridgePlanks: snapshot.bridgePlanks,
        totalPlanks: snapshot.totalPlanks,
        role: snapshot.role
      });

      if (snapshot.leveledUp) {
        this.sound.playLevelUp();
        this.ui.showToast('Lên Cấp Mới!', `Chúc mừng bạn đã đạt: ${snapshot.title} (Cấp ${snapshot.level})`, 'success', '⭐');
      }

      if (snapshot.plankAdded) {
        this.engine?.setBridgePlanks(snapshot.bridgePlanks);
        this.ui.showToast('Nhịp Cầu Hoàn Thành!', `Đã kết nối nhịp cầu số ${snapshot.bridgePlanks}/6`, 'success', '🌉');
      }

      if (snapshot.isComplete && snapshot.plankAdded === 6) {
        setTimeout(() => {
          this.ui.showVictoryModal({
            score: snapshot.exp + snapshot.level * 100,
            ticketsSolved: snapshot.totalPlanks,
            rank: snapshot.title
          });
        }, 1200);
      }
    });
  }

  initEngine() {
    const canvas = document.getElementById('game-canvas');
    this.engine = new Engine3D({
      canvas,
      soundManager: this.sound,
      onProximityChange: (interactable) => {
        if (interactable) {
          this.ui.showWorldPrompt(interactable.prompt, 'E');
        } else {
          this.ui.hideWorldPrompt();
        }
      },
      onTriggerInteract: () => this.handleActionTrigger()
    });

    this.input.onAction(() => this.handleActionTrigger());
  }

  bindEvents() {
    // Sync initial state
    this.engine.setPlayerRole(this.state.role);
  }

  handleRoleChange(role) {
    this.state.setRole(role);
    this.engine.setPlayerRole(role);
  }

  handleActionTrigger() {
    const interactable = this.engine.getActiveInteractable();
    if (!interactable) return;

    if (interactable.type === 'collectible') {
      const itemDef = COLLECTIBLE_ITEMS.find(it => it.id === interactable.id);
      if (itemDef) {
        this.engine.collectItem(interactable.id);
        this.state.collectItem(interactable.id, itemDef.xp || 20);
        this.ui.showToast('Đã Nhặt Vật Phẩm!', `${itemDef.name} (+${itemDef.xp || 20} EXP)`, 'info', itemDef.icon || '📦');
      }
    } else if (interactable.type === 'npc') {
      const npcDef = NPC_DATA.find(n => n.id === interactable.id);
      if (!npcDef) return;

      this.ui.showDialogue({
        npcName: npcDef.name,
        npcBadge: npcDef.badge,
        emoji: npcDef.emoji,
        text: npcDef.greeting,
        onAccept: () => this.launchTicketForNPC(npcDef)
      });
    }
  }

  launchTicketForNPC(npc) {
    const roleQuests = QUESTS_DATA[this.state.role] || QUESTS_DATA.manager;
    // Find next unsolved ticket for this role
    let quest = roleQuests.find(q => !this.state.solvedTickets.has(q.id));

    // If all solved for this role, allow reviewing or repeat
    if (!quest) {
      quest = roleQuests[Math.floor(Math.random() * roleQuests.length)];
    }

    this.ui.showTicketModal({
      ticketId: quest.id,
      category: quest.category,
      roleTarget: quest.roleTarget,
      scenario: quest.scenario,
      question: quest.question,
      options: quest.options,
      hint: quest.hint,
      explanation: quest.explanation,
      onAnswer: (isCorrect) => {
        if (isCorrect) {
          this.state.completeTicket(quest.id);
        }
      },
      onContinue: () => {
        this.ui.hideTicketModal();
      }
    });
  }

  resetGame() {
    this.state.reset();
    this.engine.setBridgePlanks(0);
    COLLECTIBLE_ITEMS.forEach(it => {
      it.collected = false;
      const colObj = this.engine.collectibles.find(c => c.id === it.id);
      if (colObj) {
        colObj.collected = false;
        colObj.group.visible = true;
        colObj.group.scale.set(1, 1, 1);
      }
    });
    this.ui.showToast('Làm Mới Trò Chơi', 'Chào mừng bạn quay lại vạch xuất phát!', 'info', '🔄');
  }

  startGameLoop() {
    let lastMinimapUpdate = 0;

    const loop = (timestamp) => {
      requestAnimationFrame(loop);

      // 1. Fetch input vector
      const moveVec = this.input.getMoveVector();

      // 2. Update 3D world
      this.engine.update(moveVec);

      // 3. Update Minimap every 60ms (approx 15fps for performance)
      if (timestamp - lastMinimapUpdate > 60) {
        lastMinimapUpdate = timestamp;
        const coords = this.engine.getPlayerCoordinates();

        this.ui.updateMinimap({
          playerPos: { x: coords.x, z: coords.z },
          playerYaw: coords.yaw,
          npcs: this.engine.npcs,
          bridgePlanks: this.state.bridgePlanks,
          collectibles: this.engine.collectibles
        });
      }
    };

    requestAnimationFrame(loop);
  }
}

// Instantiate application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
