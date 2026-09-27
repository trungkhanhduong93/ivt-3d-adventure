/**
 * test-quest-system.js
 * Kiểm thử toàn diện hệ thống dữ liệu câu hỏi, GameState và QuestEngine.
 */

// Mock localStorage in Node.js
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}
globalThis.localStorage = new MockLocalStorage();

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ HỆ THỐNG QUEST & DATA IVT 3D ADVENTURE ===\n');

  // 1. Test Data JSON
  console.log('[1] Kiểm tra file questions-ivt.json...');
  const { default: questions } = await import('../src/data/questions-ivt.json', { with: { type: 'json' } });
  console.log(`- Tổng số câu hỏi: ${questions.length}`);
  if (questions.length !== 36) throw new Error('Số lượng câu hỏi phải là 36!');

  const roles = { manager: 0, tech: 0 };
  const levels = { 1: 0, 2: 0, 3: 0 };
  questions.forEach(q => {
    roles[q.role] += 1;
    levels[q.level] += 1;
    if (!q.id || !q.ticketCode || !q.prompt || !q.explanation) {
      throw new Error(`Câu hỏi ${q.id} thiếu trường bắt buộc!`);
    }
    const correctOptions = q.options.filter(o => o.isCorrect);
    if (correctOptions.length !== 1) {
      throw new Error(`Câu hỏi ${q.id} phải có đúng 1 đáp án đúng, hiện có: ${correctOptions.length}`);
    }
  });
  console.log('- Phân bổ Role:', roles);
  console.log('- Phân bổ Level:', levels);
  console.log('=> questions-ivt.json đạt chuẩn 100%!\n');

  // 2. Test GameState
  console.log('[2] Kiểm tra GameState.js...');
  const { GameState } = await import('../src/state/GameState.js');
  const testState = new GameState();

  testState.resetGame();
  console.log('- Default Role:', testState.getRole());
  console.log('- Default Level:', testState.getLevel());
  console.log('- Default Bridge Progress:', testState.getAllBridgeProgress());

  // Test Events
  let eventFired = false;
  testState.on('ROLE_CHANGED', ({ role }) => {
    eventFired = true;
    console.log(`  [Event] ROLE_CHANGED fired -> ${role}`);
  });
  testState.setRole('tech');
  if (!eventFired || testState.getRole() !== 'tech') throw new Error('setRole failed!');

  // Test EXP & Inventory
  testState.addExp(200, 'Test EXP');
  testState.addItem({ id: 'test_item', name: 'Vật phẩm mẫu', count: 1 });
  if (!testState.hasItem('test_item')) throw new Error('addItem failed!');
  console.log(`- EXP hiện tại: ${testState.getExp()}, Items:`, testState.getInventory().length);

  // Test Persistence (Save/Load)
  testState.save();
  const loadedState = new GameState();
  if (loadedState.getExp() !== 200 || loadedState.getRole() !== 'tech') {
    throw new Error('Persistence save/load failed!');
  }
  console.log('=> GameState persistence & events hoạt động hoàn hảo!\n');

  // 3. Test QuestEngine Flow
  console.log('[3] Kiểm tra QuestEngine.js...');
  const { QuestEngine } = await import('../src/quest/QuestEngine.js');
  const engine = new QuestEngine(testState);

  // Switch to manager role to test full Level 1 bridge flow
  testState.setRole('manager');
  testState.setLevel(1);
  engine.syncWithState();

  console.log('- Bắt đầu mô phỏng hoàn thành 6 nhịp cầu của Level 1 (Manager role):');

  for (let plank = 1; plank <= 6; plank++) {
    const q = engine.getCurrentQuest();
    console.log(`\n  --- ĐANG LÀM NHỊP CẦU ${q.plankIndex}: ${q.title} ---`);
    console.log(`  + Lore: ${q.lore}`);
    console.log(`  + NPC: ${q.npcName}`);
    console.log(`  + Câu hỏi liên kết: ${q.question.id} (${q.question.ticketCode})`);

    // Step 1: Inspect
    const step1 = engine.interactObject(q.currentObjective.targetId);
    console.log(`  [Bước 1/4] Inspect: ${step1.message}`);

    // Step 2: Pickup & Drop
    const pickupObj = q.objectives[1];
    const step2Pick = engine.interactObject(pickupObj.targetId);
    console.log(`  [Bước 2/4] Pickup: ${step2Pick.message}`);
    const step2Drop = engine.dropObject(pickupObj.dropZone);
    console.log(`  [Bước 2/4] Drop: ${step2Drop.message}`);

    // Step 3: Answer Question
    const correctOpt = q.question.options.find(o => o.isCorrect);
    const ansRes = engine.submitAnswer(correctOpt.id);
    console.log(`  [Bước 3/4] Trả lời câu hỏi: ${ansRes.message} (+${ansRes.expGained} EXP)`);

    // Step 4: Build Plank
    const buildRes = engine.buildPlank();
    console.log(`  [Bước 4/4] Lắp cầu: ${buildRes.message}`);
  }

  console.log('\n- Kiểm tra trạng thái sau khi hoàn thành 6 nhịp cầu Level 1:');
  console.log(`  + Số ván cầu Level 1: ${testState.getBridgePlanks(1)}/6`);
  console.log(`  + Danh sách Level đã mở khóa:`, testState.getUnlockedLevels());
  console.log(`  + Huy hiệu đạt được:`, testState.getBadges().map(b => b.name));
  console.log(`  + Tổng EXP tích lũy: ${testState.getExp()}`);

  if (testState.getBridgePlanks(1) !== 6) throw new Error('Level 1 chưa đủ 6 nhịp cầu!');
  if (!testState.getUnlockedLevels().includes(2)) throw new Error('Chưa mở khóa Level 2!');

  // Test Teleport to Level 2
  const teleportRes = engine.teleportToLevel(2);
  console.log(`\n[4] Dịch chuyển sang Level 2: ${teleportRes.message}`);
  console.log(`- Level hiện tại: ${testState.getLevel()}`);
  if (testState.getLevel() !== 2) throw new Error('Chuyển level 2 thất bại!');

  console.log('\n======================================================');
  console.log('TẤT CẢ KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ 100%! HỆ THỐNG SẴN SÀNG CHO 3D ENGINE & UI!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
