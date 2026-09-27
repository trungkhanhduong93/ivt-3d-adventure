/**
 * GameState.js - Central State Container for Player Progress
 */

export class GameState {
  constructor() {
    this.listeners = [];
    this.reset();
  }

  reset() {
    this.role = 'manager'; // 'manager' | 'tech'
    this.level = 1;
    this.exp = 0;
    this.maxExp = 100;
    this.bridgePlanks = 0;
    this.totalPlanks = 6;
    this.solvedTickets = new Set();
    this.collectedItems = new Set();
    this.updateTitle();
    this.notify();
  }

  setRole(newRole) {
    if (newRole !== this.role) {
      this.role = newRole;
      this.updateTitle();
      this.notify();
    }
  }

  updateTitle() {
    if (this.role === 'manager') {
      if (this.level === 1) this.title = 'Thủ Kho Tập Sự';
      else if (this.level === 2) this.title = 'Quản Lý Kho F&B Chuyên Nghiệp';
      else if (this.level === 3) this.title = 'Bậc Thầy Kiểm Soát Hao Hụt';
      else this.title = 'Giám Đốc Chuỗi Cung Ứng F&B';
    } else {
      if (this.level === 1) this.title = 'Kỹ Thuật Viên Tập Sự';
      else if (this.level === 2) this.title = 'Chuyên Viên Triển Khai iPOS';
      else if (this.level === 3) this.title = 'Kiến Trúc Sư Hệ Thống F&B';
      else this.title = 'Bậc Thầy Chẩn Đoán iPOS Pro';
    }
  }

  addExp(amount) {
    this.exp += amount;
    let leveledUp = false;

    while (this.exp >= this.maxExp) {
      this.exp -= this.maxExp;
      this.level += 1;
      this.maxExp = Math.round(this.maxExp * 1.5);
      leveledUp = true;
    }

    if (leveledUp) {
      this.updateTitle();
    }

    this.notify({ leveledUp });
    return leveledUp;
  }

  completeTicket(ticketId) {
    if (!this.solvedTickets.has(ticketId)) {
      this.solvedTickets.add(ticketId);
      this.bridgePlanks = Math.min(this.totalPlanks, this.bridgePlanks + 1);
      this.addExp(50);
      this.notify({ ticketCompleted: ticketId, plankAdded: this.bridgePlanks });
      return true;
    }
    return false;
  }

  collectItem(itemId, xp = 20) {
    if (!this.collectedItems.has(itemId)) {
      this.collectedItems.add(itemId);
      this.addExp(xp);
      this.notify({ itemCollected: itemId });
      return true;
    }
    return false;
  }

  isBridgeComplete() {
    return this.bridgePlanks >= this.totalPlanks;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Initial call
    listener(this.getStateSnapshot());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(extraData = {}) {
    const snapshot = { ...this.getStateSnapshot(), ...extraData };
    this.listeners.forEach(fn => fn(snapshot));
  }

  getStateSnapshot() {
    return {
      role: this.role,
      level: this.level,
      exp: this.exp,
      maxExp: this.maxExp,
      title: this.title,
      bridgePlanks: this.bridgePlanks,
      totalPlanks: this.totalPlanks,
      solvedCount: this.solvedTickets.size,
      itemsCount: this.collectedItems.size,
      isComplete: this.isBridgeComplete()
    };
  }
}
