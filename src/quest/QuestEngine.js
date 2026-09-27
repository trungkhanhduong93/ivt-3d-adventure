/**
 * QuestEngine.js
 * Quản lý cỗ máy nhiệm vụ phiêu lưu (Quest State Machine):
 * - Chia thành 3 Level (Làng Khởi Đầu, Đảo Bếp Trung Tâm, Tháp Chẩn Đoán).
 * - Mỗi Level gồm 6 chặng tương ứng 6 nhịp cầu (Planks 1..6).
 * - Mỗi chặng gồm 4 Objectives tương tác:
 *   1. Khám phá & kiểm tra khu vực (Quầy POS, Trạm kỹ thuật, Bàn cân...)
 *   2. Thử thách tương tác vật lý (Nhặt nguyên liệu, mang đến điểm chế biến/cân)
 *   3. Giải cứu sự cố / Ticket nghiệp vụ với NPC Milo / Chuyên gia
 *   4. Lắp ráp nhịp cầu mọc sang hòn đảo tiếp theo
 * - Kết nối chặt chẽ với GameState và Ngân hàng câu hỏi questions-ivt.json.
 */

import questionsData from '../data/questions-ivt.json' with { type: 'json' };
import { gameState } from '../state/GameState.js';

export class QuestEngine {
  constructor(state = gameState) {
    this.state = state;
    this.questions = questionsData;
    this.currentPlankIndex = 1; // 1..6
    this.currentObjectiveIndex = 0; // 0..3 (bước 1 đến bước 4)
    this.activeQuest = null;

    // Badges definitions
    this.badgesConfig = {
      // Level 1
      FIRST_PLANK: { id: 'FIRST_PLANK', name: 'Nhịp Cầu Đầu Tiên', icon: '🪵', description: 'Đặt viên gạch tri thức đầu tiên tại Làng Khởi Đầu' },
      BOM_APPRENTICE: { id: 'BOM_APPRENTICE', name: 'Tập Sự Định Lượng', icon: '⚖️', description: 'Nắm vững quy tắc ĐVT chính và BOM món ăn' },
      VILLAGE_HERO: { id: 'VILLAGE_HERO', name: 'Anh Hùng Làng Khởi Đầu', icon: '🏅', description: 'Hoàn thành 6/6 nhịp cầu kết nối POS & Kho IVT' },
      
      // Level 2
      PRODUCTION_CHEF: { id: 'PRODUCTION_CHEF', name: 'Bậc Thầy Chế Biến', icon: '🍳', description: 'Thấu hiểu phân biệt sơ chế tách ra và chế biến gộp vào' },
      BOM_2TIER_MASTER: { id: 'BOM_2TIER_MASTER', name: 'Ninja Trừ Kho 2 Cấp', icon: '⚡', description: 'Chinh phục bài toán Bán thành phẩm không cần theo dõi chế biến' },
      KITCHEN_CONQUEROR: { id: 'KITCHEN_CONQUEROR', name: 'Bá Chủ Bếp Trung Tâm', icon: '👑', description: 'Thông thạo điều phối cung ứng chuỗi và báo cáo hao hụt A08' },

      // Level 3
      AUDIT_SAVIOR: { id: 'AUDIT_SAVIOR', name: 'Cứu Tinh Kiểm Kê', icon: '🛡️', description: 'Hoá giải bẫy huỷ phiếu kiểm kê và lệch số hệ thống' },
      COST_WARRIOR: { id: 'COST_WARRIOR', name: 'Chiến Thần Giá Vốn', icon: '💰', description: 'Chữa trị triệt để bệnh bán âm trước nhập sau và giá vốn bằng 0' },
      GRAND_MASTER_IVT: { id: 'GRAND_MASTER_IVT', name: 'Bậc Thầy Tối Cao IVT Pro', icon: '🌟', description: 'Chinh phục toàn bộ 3 cấp độ Tháp Chẩn Đoán Ticket' }
    };

    // Metadata nhiệm vụ cho từng nhịp cầu (1..6) ở 3 Level
    this.questMetadata = {
      1: [ // Level 1: Làng Khởi Đầu
        {
          plank: 1,
          questionId: { manager: 'M1_01', tech: 'T1_01' },
          title: 'Nhịp Cầu 1: Thiết Lập Căn Bản POS & Kho',
          npcName: 'Milo Chú Ong Tinh Nghịch',
          lore: 'Cánh cổng kết nối Làng Khởi Đầu và Bờ Vực Cổ Xưa đang bị đứt đoạn. Hãy kích hoạt trạm POS đầu tiên!',
          objectives: [
            { text: 'Chạy đến Quầy Thu Ngân POS kiểm tra màn hình đồng bộ', targetId: 'pos_counter', action: 'inspect' },
            { text: 'Nhặt bao Cà phê Robusta mang đến Bàn cân quy đổi ĐVT', targetId: 'coffee_bag', dropZone: 'scale_table', action: 'pickup_and_drop' },
            { text: 'Trao đổi với Milo để giải quyết câu hỏi thiết lập đơn vị tính & kết nối', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 1 mọc qua hẻm núi', action: 'build_bridge' }
          ]
        },
        {
          plank: 2,
          questionId: { manager: 'M1_02', tech: 'T1_02' },
          title: 'Nhịp Cầu 2: Bí Quyết Theo Dõi Tồn Kho',
          npcName: 'Bác Ba Quản Kho Thảo Nguyên',
          lore: 'Kho nguyên liệu đang rối loạn vì món thành phẩm bị kẹt không trừ được nguyên liệu.',
          objectives: [
            { text: 'Kiểm tra Kệ Hàng Nguyên Liệu Khô trong nhà kho', targetId: 'shelf_dry_goods', action: 'inspect' },
            { text: 'Nhặt Hộp Đào Ngâm Kronos mang ra Quầy Pha Chế', targetId: 'peach_can', dropZone: 'bar_counter', action: 'pickup_and_drop' },
            { text: 'Tư vấn cho Bác Ba quy tắc bật/tắt Theo dõi tồn kho chuẩn IVT Pro', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 2 vươn xa', action: 'build_bridge' }
          ]
        },
        {
          plank: 3,
          questionId: { manager: 'M1_03', tech: 'T1_03' },
          title: 'Nhịp Cầu 3: Nhập Mua & Xử Lý Ghi Chú',
          npcName: 'Chị Lan Giao Nhận Cửa Khẩu',
          lore: 'Xe hàng sữa tươi vừa cập bến nhưng nhà cung cấp chỉ giao một phần số lượng.',
          objectives: [
            { text: 'Kiểm tra Phiếu Giao Nhận PO-001 tại Cửa Khẩu', targetId: 'dock_manifest', action: 'inspect' },
            { text: 'Khuân Thùng Sữa Tươi Vinamilk xếp ngay ngắn vào Kho Lạnh', targetId: 'milk_crate', dropZone: 'cold_room', action: 'pickup_and_drop' },
            { text: 'Cùng Chị Lan xử lý phiếu nhập giao nhiều đợt và phân loại món ghi chú', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 3 chắc chắn', action: 'build_bridge' }
          ]
        },
        {
          plank: 4,
          questionId: { manager: 'M1_04', tech: 'T1_04' },
          title: 'Nhịp Cầu 4: Dòng Chảy BOM & Hiệu Lực Thời Gian',
          npcName: 'Alex Kỹ Sư Triển Khai',
          lore: 'Món mới bán ra tại POS rơi vào tab Chưa đồng bộ do hiệu lực ngày áp dụng công thức.',
          objectives: [
            { text: 'Kiểm tra Máy In Hoá Đơn tại Trạm Pha Chế', targetId: 'printer_station', action: 'inspect' },
            { text: 'Nhặt Cuộn Giấy In Hoá Đơn thay vào máy POS', targetId: 'paper_roll', dropZone: 'pos_counter', action: 'pickup_and_drop' },
            { text: 'Hội ý với Alex về 3 loại khai báo cấm sửa xoá và hiệu lực ngày BOM', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 4 rực sáng', action: 'build_bridge' }
          ]
        },
        {
          plank: 5,
          questionId: { manager: 'M1_05', tech: 'T1_05' },
          title: 'Nhịp Cầu 5: Kiểm Kê Thực Tế & Lớp Thành Phẩm',
          npcName: 'Milo Chú Ong Tinh Nghịch',
          lore: 'Ca làm việc sắp kết thúc, thùng Bột Matcha đã cạn sạch và cần chốt số kiểm kê chính xác.',
          objectives: [
            { text: 'Xem Bảng Kiểm Kê Cuối Ca treo trên tường kho', targetId: 'audit_clipboard', action: 'inspect' },
            { text: 'Lấy Hộp Bột Matcha rỗng mang vào Thùng Rác Tiêu Chuẩn', targetId: 'matcha_box', dropZone: 'waste_bin', action: 'pickup_and_drop' },
            { text: 'Giúp Milo phân biệt nhập số 0 vs bỏ dòng khi kiểm kê kho', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 5 kiên cố', action: 'build_bridge' }
          ]
        },
        {
          plank: 6,
          questionId: { manager: 'M1_06', tech: 'T1_06' },
          title: 'Nhịp Cầu 6: Thấu Suốt Thẻ Kho & Mở Cổng Sang Đảo Bếp',
          npcName: 'Trưởng Làng IVT Cổ Đại',
          lore: 'Nhịp cầu cuối cùng của Làng Khởi Đầu! Hãy làm chủ Báo cáo A06 và Thẻ kho để mở Cổng Dịch Chuyển.',
          objectives: [
            { text: 'Tiến lên Vọng Lầu Báo Cáo trên đỉnh vách đá', targetId: 'viewpoint_tower', action: 'inspect' },
            { text: 'Nhặt Sách Thần Báo Cáo A06 đặt lên Bục Quang Học', targetId: 'a06_ledger', dropZone: 'optical_podium', action: 'pickup_and_drop' },
            { text: 'Giải mã câu hỏi then chốt về Thẻ kho và Kho theo dõi tồn cùng Trưởng Làng', action: 'dialogue' },
            { text: 'Lắp Nhịp Cầu Số 6 - Kích hoạt Cổng Sang Đảo Bếp Trung Tâm!', action: 'build_bridge' }
          ]
        }
      ],

      2: [ // Level 2: Đảo Bếp Trung Tâm
        {
          plank: 1,
          questionId: { manager: 'M2_01', tech: 'T2_01' },
          title: 'Nhịp Cầu 1: Phân Ranh Sơ Chế vs Chế Biến',
          npcName: 'Chef Tuấn Bếp Trưởng Chuỗi',
          lore: 'Chào mừng đến Đảo Bếp Trung Tâm! Khói bếp nghi ngút và dây chuyền sản xuất đang chờ bạn kích hoạt.',
          objectives: [
            { text: 'Khảo sát Bàn Chặt Thịt và Nồi Nấu Sốt khổng lồ', targetId: 'chef_workbench', action: 'inspect' },
            { text: 'Bê Khay Gà Sơ Chế giao cho Đội Pha Lóc', targetId: 'raw_chicken_tray', dropZone: 'butcher_station', action: 'pickup_and_drop' },
            { text: 'Giải thích cho Chef Tuấn về sơ chế tách ra và chế biến gộp vào', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 1 Bếp Trung Tâm', action: 'build_bridge' }
          ]
        },
        {
          plank: 2,
          questionId: { manager: 'M2_02', tech: 'T2_02' },
          title: 'Nhịp Cầu 2: Tự Động Định Tuyến Cung Ứng & Biến Thiên',
          npcName: 'Chị Mai Điều Phối Đơn Hàng',
          lore: 'Hàng chục chi nhánh đang đặt bánh mì và sốt dồn dập về kho tổng.',
          objectives: [
            { text: 'Kiểm tra Màn hình Điều Phối Cung Ứng Hàng Hoá', targetId: 'dispatch_screen', action: 'inspect' },
            { text: 'Xếp Thùng Nước Sốt Đóng Chai lên Xe Đẩy Hàng', targetId: 'sauce_crate', dropZone: 'delivery_cart', action: 'pickup_and_drop' },
            { text: 'Thảo luận với Chị Mai cách cấu hình cung ứng tự động và định mức biến thiên', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 2 Bếp Trung Tâm', action: 'build_bridge' }
          ]
        },
        {
          plank: 3,
          questionId: { manager: 'M2_03', tech: 'T2_03' },
          title: 'Nhịp Cầu 3: Điều Chuyển Hàng Hoá & Kỷ Luật Date/Lô',
          npcName: 'Tài Xế Hùng Giao Vận Lạnh',
          lore: 'Thịt bò giao đến chi nhánh bị hao hụt số lượng, và khách hàng muốn thử nghiệm quản lý Date.',
          objectives: [
            { text: 'Kiểm tra Cầu Cân Xe Tải Giao Nhận', targetId: 'truck_scale', action: 'inspect' },
            { text: 'Cầm Máy Đo Nhiệt Độ & Quét Mã Lô Hạn Sử Dụng đến Thùng Hàng', targetId: 'temp_scanner', dropZone: 'meat_box', action: 'pickup_and_drop' },
            { text: 'Phân tích ràng buộc một đi không trở lại của cấu hình Lô/Date với Tài Xế Hùng', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 3 vững chãi', action: 'build_bridge' }
          ]
        },
        {
          plank: 4,
          questionId: { manager: 'M2_04', tech: 'T2_04' },
          title: 'Nhịp Cầu 4: Tuyệt Chiêu Trừ Kho 2 Cấp & Nhượng Quyền',
          npcName: 'Milo Chú Ong Tinh Nghịch',
          lore: 'Bếp trưởng không muốn bấm phiếu nấu cốt trà mỗi ngày. Cần kích hoạt trừ kho 2 cấp thần thánh!',
          objectives: [
            { text: 'Quan sát Bình Ủ Nước Cốt Trà Đen tại Xưởng Pha Chế', targetId: 'tea_dispenser', action: 'inspect' },
            { text: 'Nhặt Bình Đo Định Lượng Cốt Trà đặt cạnh Máy Đóng Nắp Ly', targetId: 'measuring_cup', dropZone: 'sealing_machine', action: 'pickup_and_drop' },
            { text: 'Cùng Milo giải mã 3 điều kiện trừ kho 2 cấp và cấp độ nhượng quyền', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 4 phát sáng xanh biếc', action: 'build_bridge' }
          ]
        },
        {
          plank: 5,
          questionId: { manager: 'M2_05', tech: 'T2_05' },
          title: 'Nhịp Cầu 5: Bán Nội Bộ vs Điều Chuyển Tự Động',
          npcName: 'Anh Long Kế Toán Chuỗi',
          lore: 'Chi nhánh nhượng quyền thắc mắc vì sao chuyển hàng sang không phát sinh công nợ phải thu.',
          objectives: [
            { text: 'Kiểm tra Bàn Sổ Sách Công Nợ Nội Bộ', targetId: 'internal_ledger_desk', action: 'inspect' },
            { text: 'Nhặt Con Dấu Ký Duyệt Chứng Từ đặt lên Phiếu Xuất Điều Chuyển', targetId: 'approval_stamp', dropZone: 'transfer_doc_pile', action: 'pickup_and_drop' },
            { text: 'Tư vấn cho Anh Long chọn đúng hình thức Bán nội bộ để hạch toán công nợ', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 5 Bếp Trung Tâm', action: 'build_bridge' }
          ]
        },
        {
          plank: 6,
          questionId: { manager: 'M2_06', tech: 'T2_06' },
          title: 'Nhịp Cầu 6: Thống Trị Hao Hụt A08 & Cổng Sang Tháp Chẩn Đoán',
          npcName: 'Đại Sứ F&B Vương Quốc IVT',
          lore: 'Báo cáo A08 báo động đỏ! Khắc chế thất thoát thịt bò để mở khóa Cổng Dịch Chuyển đến Tháp Chẩn Đoán.',
          objectives: [
            { text: 'Tiến lên Đỉnh Đảo Bếp Trung Tâm quan sát toàn cảnh chuỗi', targetId: 'kitchen_rooftop', action: 'inspect' },
            { text: 'Nhặt Huân Chương Kiểm Soát Cost A08 đặt vào Bệ Khởi Động Cổng', targetId: 'a08_medal', dropZone: 'portal_pillar', action: 'pickup_and_drop' },
            { text: 'Làm chủ công thức tỷ lệ hao hụt A08 và nguyên tắc chuyển tuyến hotline 1900 4766', action: 'dialogue' },
            { text: 'Lắp Nhịp Cầu Số 6 - Mở Cổng Bước Vào Tháp Chẩn Đoán!', action: 'build_bridge' }
          ]
        }
      ],

      3: [ // Level 3: Tháp Chẩn Đoán Ticket
        {
          plank: 1,
          questionId: { manager: 'M3_01', tech: 'T3_01' },
          title: 'Nhịp Cầu 1: Hoá Giải Bẫy Huỷ Phiếu Kiểm Kê & Bán Âm Kho',
          npcName: 'Trưởng Ban Cứu Hộ Dữ Liệu IVT',
          lore: 'Chào mừng đến Tháp Chẩn Đoán Ticket! Nơi quy tụ những ca sự cố hóc búa nhất của toàn hệ thống F&B.',
          objectives: [
            { text: 'Tiến vào Sảnh Tầng 1 Tháp Chẩn Đoán ngắm màn hình radar ticket', targetId: 'tower_lobby_radar', action: 'inspect' },
            { text: 'Nhặt Ổ Cứng Khắc Phục Dữ Liệu Tồn cắm vào Máy Chủ Phân Tích', targetId: 'data_repair_disk', dropZone: 'server_terminal', action: 'pickup_and_drop' },
            { text: 'Hóa giải bẫy huỷ phiếu kiểm kê sai thứ tự và lỗi giá vốn âm do bán âm', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 1 Tháp Chẩn Đoán', action: 'build_bridge' }
          ]
        },
        {
          plank: 2,
          questionId: { manager: 'M3_02', tech: 'T3_02' },
          title: 'Nhịp Cầu 2: 23h59 Quá Khứ & Điều Chỉnh Tồn Kho Thép',
          npcName: 'Chuyên Gia Cố Vấn Triển Khai',
          lore: 'Số liệu kiểm kê quá khứ và giá vốn lệch lũy kế cần công cụ Điều chỉnh giá trị tồn kho.',
          objectives: [
            { text: 'Quan sát Đồng Hồ Thời Gian Kiểm Kê hiển thị mốc 23h59', targetId: 'time_freeze_clock', action: 'inspect' },
            { text: 'Cầm Chìa Khóa Khoá Sổ Kỳ Quá Khứ vặn vào Ổ Khoá Bảo Mật', targetId: 'security_key', dropZone: 'lock_panel', action: 'pickup_and_drop' },
            { text: 'Nắm vững 4 ràng buộc thép khi điều chỉnh giá trị tồn kho', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 2 Tháp Chẩn Đoán', action: 'build_bridge' }
          ]
        },
        {
          plank: 3,
          questionId: { manager: 'M3_03', tech: 'T3_03' },
          title: 'Nhịp Cầu 3: Thanh Toán Vo FIFO & Chuyển Đổi V1 Lên Pro',
          npcName: 'Milo Chú Ong Tinh Nghịch',
          lore: 'Khách hàng vừa nâng cấp từ V1 lên Pro ngỡ ngàng vì giá vốn bình quân thay đổi so với giá gần nhất.',
          objectives: [
            { text: 'Kiểm tra Cân Bằng Công Nợ Nhà Cung Cấp trên bàn tài chính', targetId: 'debt_balance_scale', action: 'inspect' },
            { text: 'Bê Hộp Tài Liệu Migration V1 Lên Pro giao cho Bàn Hỗ Trợ Khách Hàng', targetId: 'v1_migration_box', dropZone: 'support_counter', action: 'pickup_and_drop' },
            { text: 'Cùng Milo phân biệt cơ chế thanh toán vo ưu tiên nợ cũ và giải thích logic giá V2', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 3 Tháp Chẩn Đoán', action: 'build_bridge' }
          ]
        },
        {
          plank: 4,
          questionId: { manager: 'M3_04', tech: 'T3_04' },
          title: 'Nhịp Cầu 4: Quản Trị CCDC & Tích Hợp Kế Toán AMIS',
          npcName: 'Kỹ Sư Cầu Nối API Hệ Thống',
          lore: 'Máy tính bảng order hỏng cần ghi nhận tình trạng hàng hoá, và API đồng bộ sang AMIS Kế toán đang chờ kết nối.',
          objectives: [
            { text: 'Kiểm tra Tủ Chứa Công Cụ Dụng Cụ (CCDC) tại Trạm Bảo Dưỡng', targetId: 'tool_cabinet', action: 'inspect' },
            { text: 'Nhặt Chiếc Tablet Đang Chờ Thanh Lý xếp vào Ngăn Hỏng Hóc', targetId: 'broken_tablet', dropZone: 'repair_bay', action: 'pickup_and_drop' },
            { text: 'Khớp nối quy tắc mapping mã vật tư 1-1 giữa IVT Pro và AMIS Kế toán', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 4 vươn lên tầng thượng', action: 'build_bridge' }
          ]
        },
        {
          plank: 5,
          questionId: { manager: 'M3_05', tech: 'T3_05' },
          title: 'Nhịp Cầu 5: Nhịp Chuẩn Cuối Kỳ & Cấu Hình Tính Giá Mặc Định',
          npcName: 'Kiểm Toán Trưởng Vương Quốc F&B',
          lore: 'Quy trình đóng sổ cuối tháng nghiêm ngặt: Nhập xuất -> Kiểm kê -> Tính giá vốn.',
          objectives: [
            { text: 'Kiểm tra Bảng Quy Trình 3 Bước Đóng Kỳ Kế Toán Kho', targetId: 'month_end_flowchart', action: 'inspect' },
            { text: 'Lấy Con Dấu Hoàn Tất Đóng Sổ Kỳ đóng dấu vào Báo Cáo', targetId: 'close_book_seal', dropZone: 'final_report_tray', action: 'pickup_and_drop' },
            { text: 'Bảo vệ nguyên tắc giữ mặc định danh sách chứng từ loại trừ khi tính giá vốn', action: 'dialogue' },
            { text: 'Lắp ráp Nhịp Cầu Số 5 Tháp Chẩn Đoán', action: 'build_bridge' }
          ]
        },
        {
          plank: 6,
          questionId: { manager: 'M3_06', tech: 'T3_06' },
          title: 'Nhịp Cầu 6: Đỉnh Cao Chẩn Đoán - Tôn Vinh Grand Master',
          npcName: 'Hội Đồng Tối Cao iPOS IVT Pro',
          lore: 'Nhịp cầu định mệnh số 6 dẫn tới Đỉnh Tháp Ánh Sáng! Kết tinh toàn bộ tri thức cứu hộ hệ thống và tối ưu hoá chi phí F&B.',
          objectives: [
            { text: 'Bước lên Bục Vinh Quang Đỉnh Tháp Chẩn Đoán', targetId: 'grand_altar', action: 'inspect' },
            { text: 'Đặt Viên Pha Lê Tri Thức Toàn Năng IVT vào Trọng Tâm Đài Danh Dự', targetId: 'master_crystal', dropZone: 'altar_core', action: 'pickup_and_drop' },
            { text: 'Vượt qua bài sát hạch 4 bước tư duy chẩn đoán hệ thống đỉnh cao cùng Hội Đồng Tối Cao', action: 'dialogue' },
            { text: 'Lắp Nhịp Cầu Cuối Cùng Số 6 - Thắp Sáng Vương Quốc IVT Pro!', action: 'build_bridge' }
          ]
        }
      ]
    };

    this.init();
  }

  init() {
    this.syncWithState();

    // Listen to role changes
    this.state.on('ROLE_CHANGED', () => {
      this.syncWithState();
      this.state.emit('QUEST_UPDATED', this.getCurrentQuest());
    });

    // Listen to level changes
    this.state.on('LEVEL_CHANGED', () => {
      this.syncWithState();
      this.state.emit('QUEST_UPDATED', this.getCurrentQuest());
    });

    // Listen to state resets
    this.state.on('STATE_RESET', () => {
      this.syncWithState();
      this.state.emit('QUEST_UPDATED', this.getCurrentQuest());
    });
  }

  syncWithState() {
    const level = this.state.getLevel();
    const currentPlanks = this.state.getBridgePlanks(level);
    // If planks is 6 and not completed next level, plankIndex is 6
    this.currentPlankIndex = Math.min(6, currentPlanks + 1);
    this.currentObjectiveIndex = 0;
  }

  getCurrentLevel() {
    return this.state.getLevel();
  }

  getCurrentRole() {
    return this.state.getRole();
  }

  getCurrentPlankIndex() {
    const level = this.state.getLevel();
    const builtPlanks = this.state.getBridgePlanks(level);
    return Math.min(6, builtPlanks + 1);
  }

  getCurrentQuest() {
    const level = this.getCurrentLevel();
    const role = this.getCurrentRole();
    const plankIdx = this.getCurrentPlankIndex();
    const levelQuests = this.questMetadata[level] || [];
    const questMeta = levelQuests.find(q => q.plank === plankIdx) || levelQuests[0];

    const questionId = questMeta.questionId[role];
    const question = this.questions.find(q => q.id === questionId) || null;

    const objectives = questMeta.objectives.map((obj, idx) => {
      let status = 'locked';
      if (idx < this.currentObjectiveIndex) {
        status = 'completed';
      } else if (idx === this.currentObjectiveIndex) {
        status = 'in_progress';
      }
      return {
        ...obj,
        index: idx,
        status
      };
    });

    return {
      level,
      role,
      plankIndex: plankIdx,
      title: questMeta.title,
      npcName: questMeta.npcName,
      lore: questMeta.lore,
      currentObjectiveIndex: this.currentObjectiveIndex,
      objectives,
      currentObjective: objectives[this.currentObjectiveIndex],
      question,
      isPlankCompleted: this.state.getBridgePlanks(level) >= plankIdx
    };
  }

  // Chuyển sang objective tiếp theo (bước 1 -> bước 2, bước 2 -> bước 3)
  advanceObjective() {
    if (this.currentObjectiveIndex < 3) {
      this.currentObjectiveIndex += 1;
      const quest = this.getCurrentQuest();
      this.state.setActiveQuest(quest);
      this.state.emit('OBJECTIVE_ADVANCED', {
        objectiveIndex: this.currentObjectiveIndex,
        quest
      });
      return true;
    }
    return false;
  }

  // Tương tác vật lý hoặc kiểm tra khu vực
  interactObject(targetId) {
    const quest = this.getCurrentQuest();
    const currentObj = quest.currentObjective;

    if (!currentObj) return false;

    // Check Objective 1 (inspect)
    if (currentObj.index === 0 && currentObj.targetId === targetId) {
      this.state.addExp(25, `Khám phá khu vực ${targetId}`);
      this.advanceObjective();
      return { success: true, message: `Đã hoàn thành bước khám phá: ${currentObj.text}` };
    }

    // Check Objective 2 pickup
    if (currentObj.index === 1 && currentObj.targetId === targetId && !this.state.hasItem(targetId)) {
      this.state.addItem({ id: targetId, name: targetId, count: 1 });
      this.state.emit('ITEM_COLLECTED', { itemId: targetId });
      return { success: true, message: `Đã nhặt vật phẩm: ${targetId}. Hãy mang tới vị trí chỉ định!` };
    }

    return { success: false, message: 'Chưa thể tương tác với vật thể này lúc này.' };
  }

  // Đặt vật phẩm tại DropZone (Objective 2 hoàn thành)
  dropObject(dropZoneId) {
    const quest = this.getCurrentQuest();
    const currentObj = quest.currentObjective;

    if (!currentObj) return false;

    if (currentObj.index === 1 && currentObj.dropZone === dropZoneId) {
      if (this.state.hasItem(currentObj.targetId)) {
        this.state.removeItem(currentObj.targetId);
        this.state.addExp(50, `Vận chuyển thành công ${currentObj.targetId} đến ${dropZoneId}`);
        this.advanceObjective();
        return { success: true, message: `Tuyệt vời! Đã hoàn thành thử thách tương tác vật lý. Hãy trao đổi với ${quest.npcName}!` };
      } else {
        return { success: false, message: `Bạn chưa nhặt vật phẩm ${currentObj.targetId}!` };
      }
    }

    return { success: false, message: 'Sai điểm bàn giao hoặc chưa đúng nhiệm vụ.' };
  }

  // Trả lời câu hỏi nghiệp vụ tại Objective 3
  submitAnswer(selectedOptionId) {
    const quest = this.getCurrentQuest();
    if (quest.currentObjectiveIndex !== 2) {
      return {
        success: false,
        message: 'Bạn chưa hoàn thành các bước chuẩn bị trước khi trả lời câu hỏi!'
      };
    }

    const question = quest.question;
    if (!question) {
      return { success: false, message: 'Không tìm thấy câu hỏi nghiệp vụ!' };
    }

    const option = question.options.find(opt => opt.id === selectedOptionId);
    if (!option) {
      return { success: false, message: 'Lựa chọn không hợp lệ!' };
    }

    if (option.isCorrect) {
      // Đánh dấu hoàn thành câu hỏi trong GameState
      this.state.markQuestionCompleted(question.id);
      
      // Thưởng EXP cho câu trả lời đúng
      const expReward = 100 * quest.level;
      this.state.addExp(expReward, `Trả lời đúng câu hỏi ${question.id} (${question.title})`);

      // Chuyển sang bước 4: Lắp ráp cầu
      this.advanceObjective();

      return {
        success: true,
        isCorrect: true,
        expGained: expReward,
        explanation: question.explanation,
        message: 'Chính xác 100%! Nghiệp vụ quá xuất sắc. Giờ hãy kích hoạt lắp ráp nhịp cầu!'
      };
    } else {
      return {
        success: true,
        isCorrect: false,
        hint: question.hint,
        explanation: question.explanation,
        message: 'Chưa chính xác! Hãy đọc kỹ gợi ý nghiệp vụ và phân tích lại tình huống.'
      };
    }
  }

  // Lắp ráp nhịp cầu (Objective 4)
  buildPlank() {
    const quest = this.getCurrentQuest();
    if (quest.currentObjectiveIndex !== 3) {
      return {
        success: false,
        message: 'Bạn phải giải quyết xong câu hỏi nghiệp vụ trước khi lắp ráp nhịp cầu!'
      };
    }

    const level = this.getCurrentLevel();
    const plankBuilt = this.state.advanceBridge(level);
    const expReward = 150 * level;
    this.state.addExp(expReward, `Hoàn thành xây dựng Nhịp Cầu Số ${plankBuilt} Level ${level}`);

    // Kiểm tra trao huy hiệu danh dự
    this.checkAndAwardBadges(level, plankBuilt);

    // Chuẩn bị cho nhịp cầu tiếp theo nếu chưa đạt 6
    if (plankBuilt < 6) {
      this.currentPlankIndex = plankBuilt + 1;
      this.currentObjectiveIndex = 0;
    } else {
      // Hoàn thành cả 6 nhịp cầu của Level này!
      this.currentObjectiveIndex = 3;
    }

    const updatedQuest = this.getCurrentQuest();
    this.state.setActiveQuest(updatedQuest);

    return {
      success: true,
      plankIndex: plankBuilt,
      isLevelCompleted: plankBuilt === 6,
      message: plankBuilt === 6 
        ? `CHÚC MỪNG! Bạn đã hoàn thành toàn bộ 6 nhịp cầu của Level ${level}! Cổng dịch chuyển đã được khai mở!` 
        : `Tuyệt vời! Nhịp Cầu Số ${plankBuilt} đã vươn qua vực sâu thành công!`
    };
  }

  // Trao huy hiệu theo các mốc thành tựu
  checkAndAwardBadges(level, plankBuilt) {
    if (level === 1) {
      if (plankBuilt === 1) {
        this.state.unlockBadge('FIRST_PLANK', this.badgesConfig.FIRST_PLANK);
      }
      if (plankBuilt === 4) {
        this.state.unlockBadge('BOM_APPRENTICE', this.badgesConfig.BOM_APPRENTICE);
      }
      if (plankBuilt === 6) {
        this.state.unlockBadge('VILLAGE_HERO', this.badgesConfig.VILLAGE_HERO);
      }
    } else if (level === 2) {
      if (plankBuilt === 1) {
        this.state.unlockBadge('PRODUCTION_CHEF', this.badgesConfig.PRODUCTION_CHEF);
      }
      if (plankBuilt === 4) {
        this.state.unlockBadge('BOM_2TIER_MASTER', this.badgesConfig.BOM_2TIER_MASTER);
      }
      if (plankBuilt === 6) {
        this.state.unlockBadge('KITCHEN_CONQUEROR', this.badgesConfig.KITCHEN_CONQUEROR);
      }
    } else if (level === 3) {
      if (plankBuilt === 1) {
        this.state.unlockBadge('AUDIT_SAVIOR', this.badgesConfig.AUDIT_SAVIOR);
      }
      if (plankBuilt === 2) {
        this.state.unlockBadge('COST_WARRIOR', this.badgesConfig.COST_WARRIOR);
      }
      if (plankBuilt === 6) {
        this.state.unlockBadge('GRAND_MASTER_IVT', this.badgesConfig.GRAND_MASTER_IVT);
      }
    }
  }

  // Chuyển sang Level tiếp theo sau khi mở khóa cổng
  teleportToLevel(targetLevel) {
    const lvl = Number(targetLevel);
    if (!this.state.getUnlockedLevels().includes(lvl)) {
      return { success: false, message: `Cổng sang Level ${lvl} đang bị khoá! Hãy hoàn thành 6 nhịp cầu trước.` };
    }

    this.state.setLevel(lvl);
    this.syncWithState();
    return { success: true, message: `Chào mừng bạn đặt chân tới Level ${lvl}!` };
  }
}

// Global Singleton Instance
export const questEngine = new QuestEngine();
