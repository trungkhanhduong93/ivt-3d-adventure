/**
 * UIManager.js - Central UI Lifecycle & Responsive Controller
 * IVT 3D Adventure - iPOS Warehouse & Technical RPG
 */

export class UIManager {
  constructor({ soundManager, onRoleChange, onActionTrigger, onJoystickMove, onJoystickEnd, onResetGame }) {
    this.sound = soundManager;
    this.onRoleChange = onRoleChange || (() => {});
    this.onActionTrigger = onActionTrigger || (() => {});
    this.onJoystickMove = onJoystickMove || (() => {});
    this.onJoystickEnd = onJoystickEnd || (() => {});
    this.onResetGame = onResetGame || (() => {});

    this.currentRole = 'manager'; // 'manager' | 'tech'
    this.isSoundEnabled = true;
    this.activeTicket = null;
    this.ticketAnswered = false;

    // DOM Elements Cache
    this.initDOMElements();

    // Setup Event Listeners
    this.setupStartScreenEvents();
    this.setupTopHUDEvents();
    this.setupDialogueEvents();
    this.setupTicketEvents();
    this.setupHelpModalEvents();
    this.setupVictoryEvents();
    this.setupMobileTouchControls();
    this.setupKeyboardShortcuts();

    // Initialize Minimap Canvas
    this.initMinimapCanvas();
  }

  initDOMElements() {
    // Body & Root
    this.body = document.body;

    // Start Screen
    this.startScreen = document.getElementById('start-screen');
    this.roleOptManager = document.getElementById('role-opt-manager');
    this.roleOptTech = document.getElementById('role-opt-tech');
    this.btnStartGame = document.getElementById('btn-start-game');

    // Top HUD
    this.topHUD = document.getElementById('top-hud');
    this.hudPlayerAvatar = document.getElementById('hud-player-avatar');
    this.hudRoleBadge = document.getElementById('hud-role-badge');
    this.hudLevelBadge = document.getElementById('hud-level-badge');
    this.hudPlayerTitle = document.getElementById('hud-player-title');
    this.hudExpFill = document.getElementById('hud-exp-fill');
    this.hudExpText = document.getElementById('hud-exp-text');
    this.hudBridgeCount = document.getElementById('hud-bridge-count');
    this.hudBridgeSteps = document.getElementById('hud-bridge-steps');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.iconSoundOn = this.btnToggleSound?.querySelector('.icon-sound-on');
    this.iconSoundOff = this.btnToggleSound?.querySelector('.icon-sound-off');
    this.btnSwitchRole = document.getElementById('btn-switch-role');
    this.btnOpenHelp = document.getElementById('btn-open-help');
    this.btnResetGame = document.getElementById('btn-reset-game');

    // Minimap
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // World Prompt
    this.worldPrompt = document.getElementById('world-prompt');
    this.promptKey = this.worldPrompt?.querySelector('.prompt-key');
    this.promptLabel = this.worldPrompt?.querySelector('.prompt-label');

    // Dialogue Modal
    this.dialogModal = document.getElementById('dialog-modal');
    this.dialogNpcEmoji = document.getElementById('dialog-npc-emoji');
    this.dialogNpcName = document.getElementById('dialog-npc-name');
    this.dialogNpcBadge = document.getElementById('dialog-npc-badge');
    this.dialogSpeechText = document.getElementById('dialog-speech-text');
    this.btnDialogAccept = document.getElementById('btn-dialog-accept');
    this.btnDialogClose = document.getElementById('btn-dialog-close');

    // Ticket Modal
    this.ticketModal = document.getElementById('ticket-modal');
    this.ticketIdTag = document.getElementById('ticket-id-tag');
    this.ticketCategoryBadge = document.getElementById('ticket-category-badge');
    this.ticketRoleTarget = document.getElementById('ticket-role-target');
    this.ticketScenarioText = document.getElementById('ticket-scenario-text');
    this.ticketQuestionText = document.getElementById('ticket-question-text');
    this.ticketOptionsList = document.getElementById('ticket-options-list');
    this.btnToggleHint = document.getElementById('btn-toggle-hint');
    this.ticketHintContent = document.getElementById('ticket-hint-content');
    this.ticketExplanationBox = document.getElementById('ticket-explanation-box');
    this.explanationHeader = document.getElementById('explanation-header');
    this.explanationIcon = document.getElementById('explanation-icon');
    this.explanationStatus = document.getElementById('explanation-status');
    this.explanationBodyText = document.getElementById('explanation-body-text');
    this.btnTicketContinue = document.getElementById('btn-ticket-continue');
    this.btnCloseTicket = document.getElementById('btn-close-ticket');

    // Victory Modal
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryRoleCongrats = document.getElementById('victory-role-congrats');
    this.victoryStatXp = document.getElementById('victory-stat-xp');
    this.victoryStatTickets = document.getElementById('victory-stat-tickets');
    this.victoryStatRank = document.getElementById('victory-stat-rank');
    this.btnVictorySwitch = document.getElementById('btn-victory-switch');
    this.btnVictoryReplay = document.getElementById('btn-victory-replay');

    // Help Modal
    this.helpModal = document.getElementById('help-modal');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnHelpCloseBottom = document.getElementById('btn-help-close-bottom');

    // Mobile Controls
    this.mobileControlsLayer = document.getElementById('mobile-controls');
    this.joystickZone = document.getElementById('joystick-zone');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickKnob = document.getElementById('joystick-knob');
    this.btnMobileAction = document.getElementById('btn-mobile-action');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');
  }

  // =================================================================
  // START SCREEN & ROLE MANAGEMENT
  // =================================================================
  setupStartScreenEvents() {
    if (!this.roleOptManager || !this.roleOptTech || !this.btnStartGame) return;

    this.roleOptManager.addEventListener('click', () => {
      this.sound?.playClick();
      this.selectRole('manager');
    });

    this.roleOptTech.addEventListener('click', () => {
      this.sound?.playClick();
      this.selectRole('tech');
    });

    this.btnStartGame.addEventListener('click', () => {
      this.sound?.playLevelUp();
      this.hideStartScreen();
      this.showToast('Chào mừng bạn đến với IVT 3D Adventure!', `Bạn đang đóng vai: ${this.currentRole === 'manager' ? 'Chủ Quán / Thủ Kho' : 'Kỹ Thuật Viên iPOS'}`, 'success', '🚀');
    });
  }

  selectRole(role) {
    this.currentRole = role;
    if (role === 'manager') {
      this.body.classList.remove('role-tech');
      this.body.classList.add('role-manager');
      this.roleOptManager?.classList.add('active');
      this.roleOptTech?.classList.remove('active');
      if (this.roleOptManager) this.roleOptManager.querySelector('.role-select-indicator').textContent = 'ĐÃ CHỌN';
      if (this.roleOptTech) this.roleOptTech.querySelector('.role-select-indicator').textContent = 'CHỌN VAI NÀY';
    } else {
      this.body.classList.remove('role-manager');
      this.body.classList.add('role-tech');
      this.roleOptTech?.classList.add('active');
      this.roleOptManager?.classList.remove('active');
      if (this.roleOptTech) this.roleOptTech.querySelector('.role-select-indicator').textContent = 'ĐÃ CHỌN';
      if (this.roleOptManager) this.roleOptManager.querySelector('.role-select-indicator').textContent = 'CHỌN VAI NÀY';
    }
    this.onRoleChange(this.currentRole);
  }

  showStartScreen() {
    this.startScreen?.classList.remove('hud-hidden');
    this.topHUD?.classList.add('hud-hidden');
  }

  hideStartScreen() {
    this.startScreen?.classList.add('hud-hidden');
    this.topHUD?.classList.remove('hud-hidden');
  }

  // =================================================================
  // TOP HUD CONTROLS
  // =================================================================
  setupTopHUDEvents() {
    // Sound Toggle
    this.btnToggleSound?.addEventListener('click', () => {
      this.isSoundEnabled = !this.isSoundEnabled;
      this.sound?.toggleSound(this.isSoundEnabled);

      if (this.isSoundEnabled) {
        this.iconSoundOn?.classList.remove('hud-hidden');
        this.iconSoundOff?.classList.add('hud-hidden');
        this.sound?.playClick();
        this.showToast('Âm thanh: BẬT', 'Hiệu ứng âm thanh chân thực đã kích hoạt', 'info', '🔊');
      } else {
        this.iconSoundOn?.classList.add('hud-hidden');
        this.iconSoundOff?.classList.remove('hud-hidden');
        this.showToast('Âm thanh: TẮT', 'Đã tắt âm thanh', 'info', '🔇');
      }
    });

    // Switch Role Button
    this.btnSwitchRole?.addEventListener('click', () => {
      this.sound?.playClick();
      const nextRole = this.currentRole === 'manager' ? 'tech' : 'manager';
      this.selectRole(nextRole);
      const roleName = nextRole === 'manager' ? 'Chủ Quán / Thủ Kho' : 'Kỹ Thuật Viên iPOS';
      this.showToast('Đã đổi góc nhìn!', `Chuyển sang vai trò: ${roleName}`, 'info', '🔄');
    });

    this.hudPlayerAvatar?.addEventListener('click', () => {
      this.btnSwitchRole?.click();
    });

    // Help Button
    this.btnOpenHelp?.addEventListener('click', () => {
      this.sound?.playClick();
      this.showHelpModal();
    });

    // Reset Button
    this.btnResetGame?.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn khởi động lại hành trình từ đầu không?')) {
        this.sound?.playClick();
        this.onResetGame();
        this.showToast('Khởi động lại', 'Dữ liệu trò chơi đã được thiết lập lại!', 'warning', '🔄');
      }
    });
  }

  updateHUD({ level = 1, exp = 0, maxExp = 100, title = 'Thủ Kho Tập Sự', bridgePlanks = 0, totalPlanks = 6, role = 'manager' }) {
    if (this.hudLevelBadge) this.hudLevelBadge.textContent = `Cấp ${level}`;
    if (this.hudPlayerTitle) this.hudPlayerTitle.textContent = title;

    if (this.hudRoleBadge) {
      this.hudRoleBadge.textContent = role === 'manager' ? 'Chủ Quán / Thủ Kho' : 'Kỹ Thuật Viên iPOS';
    }

    const avatarIcon = this.hudPlayerAvatar?.querySelector('.avatar-icon');
    if (avatarIcon) {
      avatarIcon.textContent = role === 'manager' ? '📦' : '💻';
    }

    // EXP Bar calculation
    const expPercent = Math.min(100, Math.max(0, Math.round((exp / maxExp) * 100)));
    if (this.hudExpFill) {
      this.hudExpFill.style.width = `${expPercent}%`;
    }
    if (this.hudExpText) {
      this.hudExpText.textContent = `${exp} / ${maxExp} EXP`;
    }

    // Bridge objective dots
    if (this.hudBridgeCount) {
      this.hudBridgeCount.textContent = `${bridgePlanks} / ${totalPlanks} Nhịp`;
    }

    if (this.hudBridgeSteps) {
      const stepDots = this.hudBridgeSteps.querySelectorAll('.step-dot');
      stepDots.forEach((dot, index) => {
        if (index < bridgePlanks) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  // =================================================================
  // WORLD PROMPT
  // =================================================================
  showWorldPrompt(label, key = 'E') {
    if (!this.worldPrompt) return;
    if (this.promptKey) this.promptKey.textContent = key;
    if (this.promptLabel) this.promptLabel.textContent = label;
    this.worldPrompt.classList.remove('hud-hidden');
  }

  hideWorldPrompt() {
    this.worldPrompt?.classList.add('hud-hidden');
  }

  // =================================================================
  // RPG DIALOGUE SYSTEM
  // =================================================================
  setupDialogueEvents() {
    this.btnDialogClose?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideDialogue();
    });
  }

  showDialogue({ npcName, npcBadge, emoji = '👨‍🍳', text, onAccept, onDecline }) {
    if (!this.dialogModal) return;

    if (this.dialogNpcEmoji) this.dialogNpcEmoji.textContent = emoji;
    if (this.dialogNpcName) this.dialogNpcName.textContent = npcName || 'NPC';
    if (this.dialogNpcBadge) this.dialogNpcBadge.textContent = npcBadge || 'Đối tác';
    if (this.dialogSpeechText) this.dialogSpeechText.textContent = text || '';

    // Action buttons replacement
    const newAcceptBtn = this.btnDialogAccept.cloneNode(true);
    const newCloseBtn = this.btnDialogClose.cloneNode(true);

    this.btnDialogAccept.parentNode.replaceChild(newAcceptBtn, this.btnDialogAccept);
    this.btnDialogClose.parentNode.replaceChild(newCloseBtn, this.btnDialogClose);

    this.btnDialogAccept = newAcceptBtn;
    this.btnDialogClose = newCloseBtn;

    this.btnDialogAccept.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideDialogue();
      if (onAccept) onAccept();
    });

    this.btnDialogClose.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideDialogue();
      if (onDecline) onDecline();
    });

    this.dialogModal.classList.remove('hud-hidden');
  }

  hideDialogue() {
    this.dialogModal?.classList.add('hud-hidden');
  }

  // =================================================================
  // TICKET CHALLENGE MODAL (THẺ BÀI NGHIỆP VỤ)
  // =================================================================
  setupTicketEvents() {
    this.btnCloseTicket?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideTicketModal();
    });

    // Hint toggle
    this.btnToggleHint?.addEventListener('click', () => {
      this.sound?.playClick();
      const isHidden = this.ticketHintContent?.classList.contains('hud-hidden');
      if (isHidden) {
        this.ticketHintContent?.classList.remove('hud-hidden');
        this.btnToggleHint?.classList.add('open');
      } else {
        this.ticketHintContent?.classList.add('hud-hidden');
        this.btnToggleHint?.classList.remove('open');
      }
    });
  }

  showTicketModal({ ticketId, category, roleTarget, scenario, question, options, hint, explanation, onAnswer, onContinue }) {
    this.activeTicket = { ticketId, category, roleTarget, scenario, question, options, hint, explanation, onAnswer, onContinue };
    this.ticketAnswered = false;

    if (this.ticketIdTag) this.ticketIdTag.textContent = ticketId || '#TK-0000';
    if (this.ticketCategoryBadge) this.ticketCategoryBadge.textContent = category || '[NGHIỆP VỤ]';
    if (this.ticketRoleTarget) this.ticketRoleTarget.textContent = roleTarget || 'Toàn bộ';
    if (this.ticketScenarioText) this.ticketScenarioText.textContent = scenario || 'Tình huống tại nhà hàng:';
    if (this.ticketQuestionText) this.ticketQuestionText.textContent = question || '';

    // Reset Hint
    if (this.ticketHintContent) {
      this.ticketHintContent.textContent = hint || 'Đọc kỹ yêu cầu đề xuất và quy tắc trừ kho IVT.';
      this.ticketHintContent.classList.add('hud-hidden');
    }
    this.btnToggleHint?.classList.remove('open');

    // Reset Explanation & Continue Button
    this.ticketExplanationBox?.classList.add('hud-hidden');
    this.btnTicketContinue?.classList.add('hud-hidden');

    // Render Options
    if (this.ticketOptionsList) {
      this.ticketOptionsList.innerHTML = '';

      options.forEach((opt, idx) => {
        const optBtn = document.createElement('button');
        optBtn.className = 'ticket-option-btn';
        optBtn.dataset.index = idx;

        const badge = document.createElement('span');
        badge.className = 'opt-index-badge';
        badge.textContent = idx + 1;

        const textSpan = document.createElement('span');
        textSpan.className = 'opt-text';
        textSpan.textContent = opt.text;

        optBtn.appendChild(badge);
        optBtn.appendChild(textSpan);

        optBtn.addEventListener('click', () => {
          this.handleAnswerSelection(idx, opt.isCorrect, optBtn);
        });

        this.ticketOptionsList.appendChild(optBtn);
      });
    }

    // Setup Continue Action
    const newContinueBtn = this.btnTicketContinue.cloneNode(true);
    this.btnTicketContinue.parentNode.replaceChild(newContinueBtn, this.btnTicketContinue);
    this.btnTicketContinue = newContinueBtn;

    this.btnTicketContinue.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideTicketModal();
      if (onContinue) onContinue();
    });

    this.ticketModal?.classList.remove('hud-hidden');
  }

  handleAnswerSelection(selectedIndex, isCorrect, clickedBtn) {
    if (this.ticketAnswered) return;
    this.ticketAnswered = true;

    // Highlight options
    const optionBtns = this.ticketOptionsList.querySelectorAll('.ticket-option-btn');
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      const optData = this.activeTicket?.options[idx];
      if (optData && optData.isCorrect) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      this.sound?.playCorrect();
      if (this.explanationStatus) this.explanationStatus.textContent = 'Đáp án chính xác! (+50 EXP)';
      if (this.explanationIcon) this.explanationIcon.textContent = '✅';
      this.showToast('Chính xác!', '+50 EXP & Nhịp cầu dữ liệu được hoàn thành!', 'success', '🎯');
    } else {
      clickedBtn.classList.add('wrong');
      this.sound?.playError();
      if (this.explanationStatus) this.explanationStatus.textContent = 'Chưa chính xác! Cùng xem giải thích để học hỏi:';
      if (this.explanationIcon) this.explanationIcon.textContent = '💡';
      this.showToast('Chưa đúng', 'Hãy xem phân tích giải thích để nắm vững kiến thức!', 'warning', '⚠️');
    }

    // Show Explanation
    if (this.explanationBodyText) {
      this.explanationBodyText.textContent = this.activeTicket?.explanation || '';
    }
    this.ticketExplanationBox?.classList.remove('hud-hidden');
    this.btnTicketContinue?.classList.remove('hud-hidden');

    if (this.activeTicket?.onAnswer) {
      this.activeTicket.onAnswer(isCorrect, selectedIndex);
    }
  }

  hideTicketModal() {
    this.ticketModal?.classList.add('hud-hidden');
    this.activeTicket = null;
    this.ticketAnswered = false;
  }

  // =================================================================
  // KEYBOARD SHORTCUTS
  // =================================================================
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // If Ticket Modal is open and not answered yet, 1-4 triggers option
      if (this.ticketModal && !this.ticketModal.classList.contains('hud-hidden') && !this.ticketAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          const btns = this.ticketOptionsList?.querySelectorAll('.ticket-option-btn');
          if (btns && btns[idx]) {
            btns[idx].click();
          }
          return;
        }
      }

      // Enter / Space when continue button is visible
      if (this.ticketModal && !this.ticketModal.classList.contains('hud-hidden') && this.ticketAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          this.btnTicketContinue?.click();
          return;
        }
      }

      // Quick Sound Toggle (M)
      if (e.key === 'm' || e.key === 'M') {
        this.btnToggleSound?.click();
        return;
      }

      // Quick Help (H)
      if (e.key === 'h' || e.key === 'H') {
        if (this.helpModal?.classList.contains('hud-hidden')) {
          this.showHelpModal();
        } else {
          this.hideHelpModal();
        }
        return;
      }

      // Switch Role (Tab)
      if (e.key === 'Tab') {
        e.preventDefault();
        this.btnSwitchRole?.click();
        return;
      }

      // Escape closes open modals
      if (e.key === 'Escape') {
        if (!this.helpModal?.classList.contains('hud-hidden')) {
          this.hideHelpModal();
        } else if (!this.dialogModal?.classList.contains('hud-hidden')) {
          this.hideDialogue();
        } else if (!this.ticketModal?.classList.contains('hud-hidden')) {
          this.hideTicketModal();
        }
      }
    });
  }

  // =================================================================
  // VICTORY POPUP MODAL
  // =================================================================
  setupVictoryEvents() {
    this.btnVictorySwitch?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideVictoryModal();
      const nextRole = this.currentRole === 'manager' ? 'tech' : 'manager';
      this.selectRole(nextRole);
      this.onResetGame();
      this.showToast('Bắt đầu thử thách mới', `Khám phá các tình huống với vai trò: ${nextRole === 'manager' ? 'Chủ Quán / Thủ Kho' : 'Kỹ Thuật Viên iPOS'}`, 'info', '🚀');
    });

    this.btnVictoryReplay?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideVictoryModal();
      this.showToast('Tự do khám phá', 'Bạn có thể tự do chạy nhảy và ngắm nhìn cây cầu đã hoàn thiện!', 'success', '🌉');
    });
  }

  showVictoryModal({ score = 350, ticketsSolved = 6, rank = 'BẬC THẦY IVT PRO' }) {
    if (this.victoryStatXp) this.victoryStatXp.textContent = `${score}`;
    if (this.victoryStatTickets) this.victoryStatTickets.textContent = `${ticketsSolved}/6`;
    if (this.victoryStatRank) this.victoryStatRank.textContent = rank;
    if (this.victoryRoleCongrats) {
      this.victoryRoleCongrats.textContent = this.currentRole === 'manager'
        ? 'Xuất sắc! Bạn đã thiết lập hoàn hảo định lượng, kiểm kê và kiểm soát triệt để tỷ lệ hao hụt F&B!'
        : 'Tuyệt đỉnh! Toàn bộ Service đồng bộ iPOS, CSDL SQL và API Delivery đã thông suốt 100%!';
    }
    this.sound?.playVictory();
    this.victoryModal?.classList.remove('hud-hidden');
  }

  hideVictoryModal() {
    this.victoryModal?.classList.add('hud-hidden');
  }

  // =================================================================
  // HELP MODAL
  // =================================================================
  setupHelpModalEvents() {
    this.btnCloseHelp?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideHelpModal();
    });

    this.btnHelpCloseBottom?.addEventListener('click', () => {
      this.sound?.playClick();
      this.hideHelpModal();
    });
  }

  showHelpModal() {
    this.helpModal?.classList.remove('hud-hidden');
  }

  hideHelpModal() {
    this.helpModal?.classList.add('hud-hidden');
  }

  // =================================================================
  // MOBILE TOUCH CONTROLS (VIRTUAL JOYSTICK & ACTION BUTTON)
  // =================================================================
  setupMobileTouchControls() {
    if (!this.joystickZone || !this.joystickKnob) return;

    let isTouching = false;
    let touchId = null;
    let baseRect = null;
    const maxRadius = 40; // Max movement radius in px

    const handleTouchStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (!isTouching) {
          isTouching = true;
          touchId = touch.identifier;
          baseRect = this.joystickBase.getBoundingClientRect();
          updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!isTouching) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (!isTouching) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          resetJoystick();
          break;
        }
      }
    };

    const updateJoystick = (clientX, clientY) => {
      if (!baseRect) baseRect = this.joystickBase.getBoundingClientRect();
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

      // Smooth translation of knob
      this.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

      // Normalized vector (-1 to 1)
      const normX = dx / maxRadius;
      const normY = dy / maxRadius;

      this.onJoystickMove({ x: normX, y: normY, distance: distance / maxRadius });
    };

    const resetJoystick = () => {
      isTouching = false;
      touchId = null;
      baseRect = null;
      this.joystickKnob.style.transform = 'translate(0px, 0px)';
      this.onJoystickEnd();
    };

    this.joystickZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Action button touch & click
    if (this.btnMobileAction) {
      const triggerAction = (e) => {
        e.preventDefault();
        this.sound?.playClick();
        this.onActionTrigger();
      };
      this.btnMobileAction.addEventListener('pointerdown', triggerAction);
    }
  }

  // =================================================================
  // MINIMAP CANVAS RENDERER
  // =================================================================
  initMinimapCanvas() {
    if (!this.minimapCanvas) return;
    this.minimapCanvas.width = 96;
    this.minimapCanvas.height = 96;
  }

  updateMinimap({ playerPos = { x: 0, z: 0 }, playerYaw = 0, npcs = [], bridgePlanks = 0, collectibles = [] }) {
    if (!this.minimapCtx || !this.minimapCanvas) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const mapScale = 1.1; // 1 meter in 3D = 1.1 pixels on minimap

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Draw concentric distance circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.stroke();

    // Transform world to minimap relative to player
    const toMapCoord = (wx, wz) => {
      const relX = (wx - playerPos.x) * mapScale;
      const relZ = (wz - playerPos.z) * mapScale;
      return {
        x: cx + relX,
        y: cy + relZ
      };
    };

    // Draw Collectible Crates (Gold dots)
    collectibles.forEach(item => {
      if (!item.collected) {
        const pt = toMapCoord(item.x, item.z);
        if (pt.x >= 0 && pt.x <= w && pt.y >= 0 && pt.y <= h) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw Bridge Markers
    for (let i = 0; i < 6; i++) {
      const bz = -12 - i * 4;
      const pt = toMapCoord(0, bz);
      if (pt.x >= 0 && pt.x <= w && pt.y >= 0 && pt.y <= h) {
        ctx.fillStyle = i < bridgePlanks ? '#10b981' : 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(pt.x - 2, pt.y - 1, 4, 3);
      }
    }

    // Draw NPCs (Cyan / Orange dots with label)
    npcs.forEach(npc => {
      const pt = toMapCoord(npc.x, npc.z);
      if (pt.x >= 0 && pt.x <= w && pt.y >= 0 && pt.y <= h) {
        ctx.fillStyle = npc.role === 'tech' ? '#06b6d4' : '#10b981';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw Player Arrow at Center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(playerYaw);

    ctx.fillStyle = this.currentRole === 'manager' ? '#34d399' : '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // =================================================================
  // TOAST NOTIFICATIONS
  // =================================================================
  showToast(title, message, type = 'info', icon = '✨', duration = 3200) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'toast-icon';
    iconDiv.textContent = icon;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'toast-body';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'toast-title';
    titleDiv.textContent = title;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'toast-msg';
    msgDiv.textContent = message;

    bodyDiv.appendChild(titleDiv);
    bodyDiv.appendChild(msgDiv);

    toast.appendChild(iconDiv);
    toast.appendChild(bodyDiv);

    this.toastContainer.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }
}
