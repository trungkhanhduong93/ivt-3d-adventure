/**
 * GameState.js
 * Quản lý trạng thái toàn cục của IVT 3D Adventure:
 * - Role (manager / tech)
 * - Level hiện tại (1: Làng Khởi Đầu, 2: Đảo Bếp Trung Tâm, 3: Tháp Chẩn Đoán)
 * - EXP & Badges
 * - Inventory đồ vật tương tác
 * - Tiến trình xây cầu (0..6 nhịp cầu mỗi level)
 * - Tiến trình câu hỏi & nhiệm vụ
 * - Cài đặt âm thanh (BGM / SFX / Mute)
 * - Tự động lưu & tải từ localStorage ('ivt_3d_adventure_save')
 * - Event Emitter cho UI, 3D Engine và QuestEngine
 */

export class GameState {
  static STORAGE_KEY = 'ivt_3d_adventure_save';

  constructor() {
    this.listeners = new Map();

    // Default Initial State
    this.defaultState = {
      role: 'manager', // 'manager' | 'tech'
      level: 1, // 1 | 2 | 3
      exp: 0,
      badges: [],
      inventory: [],
      bridgeProgress: { 1: 0, 2: 0, 3: 0 }, // 0..6 planks per level
      unlockedLevels: [1],
      completedQuestions: [],
      activeQuest: null,
      audioSettings: {
        bgmVolume: 0.5,
        sfxVolume: 0.8,
        isMuted: false
      },
      gameCompleted: false,
      lastUpdated: Date.now()
    };

    this.state = JSON.parse(JSON.stringify(this.defaultState));
    this.load();
  }

  // ==========================================
  // EVENT EMITTER
  // ==========================================

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }

  emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[GameState] Error in event listener for "${eventName}":`, err);
        }
      });
    }
  }

  // ==========================================
  // PERSISTENCE (LOCAL STORAGE)
  // ==========================================

  save() {
    try {
      this.state.lastUpdated = Date.now();
      localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(this.state));
      this.emit('STATE_SAVED', this.state);
    } catch (err) {
      console.warn('[GameState] Failed to save state to localStorage:', err);
    }
  }

  load() {
    try {
      const savedRaw = localStorage.getItem(GameState.STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        // Merge with defaults in case of new state fields
        this.state = {
          ...JSON.parse(JSON.stringify(this.defaultState)),
          ...parsed,
          bridgeProgress: {
            ...this.defaultState.bridgeProgress,
            ...(parsed.bridgeProgress || {})
          },
          audioSettings: {
            ...this.defaultState.audioSettings,
            ...(parsed.audioSettings || {})
          }
        };
        console.log('[GameState] State loaded successfully from localStorage');
        this.emit('STATE_LOADED', this.state);
        return true;
      }
    } catch (err) {
      console.warn('[GameState] Failed to load state from localStorage:', err);
    }
    return false;
  }

  resetGame() {
    try {
      localStorage.removeItem(GameState.STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    this.save();
    console.log('[GameState] Game state reset to default');
    this.emit('STATE_RESET', this.state);
  }

  // ==========================================
  // GETTERS
  // ==========================================

  getRole() {
    return this.state.role;
  }

  getLevel() {
    return this.state.level;
  }

  getExp() {
    return this.state.exp;
  }

  getBadges() {
    return [...this.state.badges];
  }

  getInventory() {
    return [...this.state.inventory];
  }

  getBridgePlanks(level = this.state.level) {
    return this.state.bridgeProgress[level] || 0;
  }

  getAllBridgeProgress() {
    return { ...this.state.bridgeProgress };
  }

  getUnlockedLevels() {
    return [...this.state.unlockedLevels];
  }

  getCompletedQuestions() {
    return [...this.state.completedQuestions];
  }

  isQuestionCompleted(questionId) {
    return this.state.completedQuestions.includes(questionId);
  }

  hasItem(itemId) {
    return this.state.inventory.some(item => (typeof item === 'string' ? item === itemId : item.id === itemId));
  }

  hasBadge(badgeId) {
    return this.state.badges.some(b => (typeof b === 'string' ? b === badgeId : b.id === badgeId));
  }

  getAudioSettings() {
    return { ...this.state.audioSettings };
  }

  // ==========================================
  // ACTIONS / MUTATORS
  // ==========================================

  setRole(role) {
    if (role !== 'manager' && role !== 'tech') {
      console.warn(`[GameState] Invalid role: ${role}`);
      return;
    }
    if (this.state.role !== role) {
      this.state.role = role;
      this.save();
      this.emit('ROLE_CHANGED', { role });
    }
  }

  setLevel(level) {
    const lvl = Number(level);
    if (![1, 2, 3].includes(lvl)) return;
    if (!this.state.unlockedLevels.includes(lvl)) {
      console.warn(`[GameState] Level ${lvl} is locked!`);
      return;
    }
    if (this.state.level !== lvl) {
      this.state.level = lvl;
      this.save();
      this.emit('LEVEL_CHANGED', { level: lvl });
    }
  }

  addExp(amount, reason = '') {
    const validAmount = Math.max(0, Number(amount) || 0);
    this.state.exp += validAmount;
    this.save();
    this.emit('EXP_GAINED', { amount: validAmount, totalExp: this.state.exp, reason });
  }

  unlockBadge(badgeId, badgeDetails = {}) {
    if (this.hasBadge(badgeId)) return;

    const badgeObj = {
      id: badgeId,
      name: badgeDetails.name || badgeId,
      description: badgeDetails.description || '',
      icon: badgeDetails.icon || '🏆',
      unlockedAt: Date.now()
    };

    this.state.badges.push(badgeObj);
    this.save();
    this.emit('BADGE_UNLOCKED', badgeObj);
  }

  addItem(item) {
    const itemObj = typeof item === 'string' ? { id: item, name: item, count: 1 } : item;
    const existing = this.state.inventory.find(i => i.id === itemObj.id);
    if (existing) {
      existing.count = (existing.count || 1) + (itemObj.count || 1);
    } else {
      this.state.inventory.push(itemObj);
    }
    this.save();
    this.emit('INVENTORY_UPDATED', { inventory: this.getInventory(), addedItem: itemObj });
  }

  removeItem(itemId) {
    const index = this.state.inventory.findIndex(i => (typeof i === 'string' ? i === itemId : i.id === itemId));
    if (index !== -1) {
      const removed = this.state.inventory.splice(index, 1)[0];
      this.save();
      this.emit('INVENTORY_UPDATED', { inventory: this.getInventory(), removedItem: removed });
      return true;
    }
    return false;
  }

  advanceBridge(level = this.state.level) {
    const current = this.state.bridgeProgress[level] || 0;
    if (current >= 6) {
      return 6;
    }

    const nextPlank = current + 1;
    this.state.bridgeProgress[level] = nextPlank;

    // Check if level bridge completed (6/6 planks)
    let levelUnlocked = null;
    if (nextPlank === 6) {
      if (level === 1 && !this.state.unlockedLevels.includes(2)) {
        this.state.unlockedLevels.push(2);
        levelUnlocked = 2;
      } else if (level === 2 && !this.state.unlockedLevels.includes(3)) {
        this.state.unlockedLevels.push(3);
        levelUnlocked = 3;
      } else if (level === 3) {
        this.state.gameCompleted = true;
        this.emit('GAME_COMPLETED', { exp: this.state.exp, badges: this.state.badges });
      }
    }

    this.save();
    this.emit('BRIDGE_ADVANCED', {
      level,
      plankIndex: nextPlank,
      totalPlanks: 6,
      isCompleted: nextPlank === 6
    });

    if (levelUnlocked) {
      this.emit('LEVEL_UNLOCKED', { unlockedLevel: levelUnlocked });
    }

    return nextPlank;
  }

  markQuestionCompleted(questionId) {
    if (!this.state.completedQuestions.includes(questionId)) {
      this.state.completedQuestions.push(questionId);
      this.save();
      this.emit('QUESTION_COMPLETED', { questionId });
    }
  }

  setActiveQuest(quest) {
    this.state.activeQuest = quest;
    this.save();
    this.emit('QUEST_UPDATED', { activeQuest: quest });
  }

  setAudioSettings(newSettings = {}) {
    this.state.audioSettings = {
      ...this.state.audioSettings,
      ...newSettings
    };
    this.save();
    this.emit('AUDIO_SETTINGS_CHANGED', this.getAudioSettings());
  }
}

// Global Singleton Instance
export const gameState = new GameState();
