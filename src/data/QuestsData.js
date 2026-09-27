/**
 * QuestsData.js - Comprehensive Real-World Quests & Tickets
 * Covers iPOS IVT Pro F&B Operations and Technical Deployment.
 */

export const QUESTS_DATA = {
  manager: [
    {
      id: 'TK-101',
      npcId: 'milo',
      category: '[BOM ĐỊNH LƯỢNG]',
      roleTarget: 'Chủ Quán & Quản Lý Kho',
      scenario: 'Quán trà sữa ra mắt món "Trà Sữa Oolong Trân Châu". Khi thu ngân bán trên máy POS, kho bị trừ âm trân châu hoặc không trừ được cốt trà.',
      question: 'Để hệ thống iPOS IVT Pro tự động trừ kho nguyên liệu chính xác khi bán món có topping và bán thành phẩm, quy trình cấu hình chuẩn là gì?',
      options: [
        {
          text: 'Khai báo "Nước cốt trà" & "Trân châu nấu" là Bán thành phẩm có BOM riêng; Món "Trà Sữa Oolong" có BOM gồm Cốt trà + Trân châu + Sữa tươi.',
          isCorrect: true
        },
        {
          text: 'Khai báo trực tiếp 100g trà khô và 1kg hạt trân châu sống vào món Trà Sữa Oolong trên máy POS thu ngân.',
          isCorrect: false
        },
        {
          text: 'Chỉ cần tích chọn "Mặt hàng dịch vụ không quản lý tồn kho" trên phần mềm IVT Pro.',
          isCorrect: false
        },
        {
          text: 'Không cần tạo định lượng, cuối tháng nhân viên kiểm kê đếm thủ công rồi trừ một lần.',
          isCorrect: false
        }
      ],
      hint: 'IVT Pro hỗ trợ BOM đa tầng: Bán thành phẩm (sản xuất sơ chế trước) được lồng ghép vào BOM của Món thành phẩm bán ra.',
      explanation: 'Chuẩn nghiệp vụ F&B: Phải tạo Bán thành phẩm (Cốt trà sơ chế, Trân châu luộc) có định mức từ nguyên liệu thô (Trà khô, Trân châu sống). Khi bán món chính, hệ thống sẽ tự động trừ kho bán thành phẩm hoặc phân rã trừ nguyên vật liệu thô theo cấu hình kho.'
    },
    {
      id: 'TK-102',
      npcId: 'chef_john',
      category: '[GIÁ VỐN]',
      roleTarget: 'Kế Toán Kho F&B',
      scenario: 'Giá nhập Thịt bò Úc tuần trước là 220.000đ/kg, tuần này tăng lên 260.000đ/kg. Chủ quán cần biết giá vốn món Bít tết được tính như thế nào.',
      question: 'Phần mềm iPOS IVT Pro mặc định áp dụng phương pháp tính giá vốn nào để phản ánh trung thực chi phí nguyên vật liệu trong kỳ?',
      options: [
        {
          text: 'Giá đích danh do bếp trưởng tự nhập tay sau mỗi ca nấu nướng.',
          isCorrect: false
        },
        {
          text: 'Bình quân gia quyền tức thời (hoặc Bình quân cuối kỳ): Giá vốn = (Giá trị tồn đầu + Giá trị nhập) / (Số lượng tồn đầu + Số lượng nhập).',
          isCorrect: true
        },
        {
          text: 'Luôn lấy giá của lần nhập khẩu đắt nhất để trừ hao hụt tối đa.',
          isCorrect: false
        },
        {
          text: 'FIFO cố định không cho phép sửa đổi hoặc tính lại khi có chứng từ lùi ngày.',
          isCorrect: false
        }
      ],
      hint: 'Công thức cân bằng giá trị tồn đầu kỳ kết hợp với các đợt nhập phát sinh trong kỳ chia cho tổng số lượng.',
      explanation: 'Trong iPOS IVT Pro, phương pháp Bình quân gia quyền liên hoàn (tức thời) hoặc cuối kỳ giúp doanh nghiệp F&B làm mịn các biến động giá nguyên liệu thực phẩm tươi sống, tính chính xác giá thành đĩa ăn (Food Cost).'
    },
    {
      id: 'TK-103',
      npcId: 'milo',
      category: '[KIỂM KÊ KHO]',
      roleTarget: 'Thủ Kho F&B',
      scenario: 'Cuối ngày kiểm kê tại Quầy Bar: Sổ sách IVT ghi nhận còn 10 hộp Sữa tươi Ba Vì, nhưng đếm thực tế trong tủ lạnh chỉ còn 7 hộp (Lệch âm 3 hộp).',
      question: 'Thủ kho cần thực hiện thao tác nào trên iPOS IVT Pro để xử lý chênh lệch kiểm kê đúng quy trình?',
      options: [
        {
          text: 'Tự động tạo phiếu nhập khống 3 hộp để số liệu khớp sổ sách mà không báo cáo quản lý.',
          isCorrect: false
        },
        {
          text: 'Lập Phiếu Kiểm Kê -> Điền số lượng thực tế là 7 -> Hệ thống sinh Phiếu Xử Lý Chênh Lệch Thiếu (Xuất hao hụt/đền bù) kèm lý do.',
          isCorrect: true
        },
        {
          text: 'Xóa bớt hóa đơn bán hàng trên POS để hệ thống không trừ kho sữa nữa.',
          isCorrect: false
        },
        {
          text: 'Để nguyên số 10 trên phần mềm, hôm sau xuất bù sau.',
          isCorrect: false
        }
      ],
      hint: 'Quy trình chuẩn: Nhập đúng số thực tế kiểm đếm, phần mềm sẽ tự tạo phiếu xử lý chênh lệch (thừa/thiếu) để truy cứu trách nhiệm.',
      explanation: 'Trên IVT Pro, khi xác nhận Phiếu kiểm kê có chênh lệch, hệ thống yêu cầu chọn giải pháp xử lý: Sinh phiếu xuất kho hao hụt / trừ lương nhân viên hoặc sinh phiếu nhập kho nếu thừa, bảo toàn tính toàn vẹn của sổ sách kế toán.'
    },
    {
      id: 'TK-104',
      npcId: 'chef_john',
      category: '[ĐỊNH MỨC HAO HỤT]',
      roleTarget: 'Bếp Trưởng',
      scenario: 'Nhập 10kg Cá Hồi nguyên con về Bếp. Sau khi đánh vảy, bỏ đầu, phi lê thì thu được 6.8kg thịt cá hồi phi lê đưa vào bảo quản.',
      question: 'Để cấu hình quy trình sơ chế hao hụt này trên IVT Pro nhằm tính đúng giá thành 1kg cá hồi phi lê, cần làm gì?',
      options: [
        {
          text: 'Tạo Lệnh Sản Xuất / Sơ chế: Đầu vào 10kg Cá Hồi nguyên con -> Đầu ra 6.8kg Cá Hồi phi lê (Hao hụt 32% được kết chuyển vào giá vốn thịt thành phẩm).',
          isCorrect: true
        },
        {
          text: 'Chỉ ghi nhận nhập kho 6.8kg, vứt bỏ hóa đơn 10kg ban đầu của nhà cung cấp.',
          isCorrect: false
        },
        {
          text: 'Coi 3.2kg hao hụt là hàng bị nhân viên đánh cắp và lập biên bản phạt tiền.',
          isCorrect: false
        },
        {
          text: 'Khai báo cá hồi phi lê có giá nhập bằng 0đ để bù đắp phần hao hụt.',
          isCorrect: false
        }
      ],
      hint: 'Quy trình sản xuất - chế biến trong IVT Pro tự động phân bổ toàn bộ chi phí nguyên liệu thô vào sản phẩm sau sơ chế.',
      explanation: 'Sơ chế nguyên liệu tươi sống luôn có tỷ lệ hao hụt tự nhiên (Yield rate). Phiếu Sản Xuất/Sơ Chế trong IVT Pro giúp quy đổi 10kg nguyên con thành 6.8kg phi lê, đồng thời tự động nâng đơn giá/kg phi lê lên tương ứng để Food Cost không bị méo mó.'
    },
    {
      id: 'TK-105',
      npcId: 'milo',
      category: '[ĐIỀU CHUYỂN KHO]',
      roleTarget: 'Quản Lý Chuỗi',
      scenario: 'Kho Tổng (Central Kitchen) xuất chuyển 50kg Hạt Cà Phê sang Quầy Bar Chi nhánh Quận 1. Hàng đang trên đường vận chuyển.',
      question: 'Thao tác điều chuyển 2 bước trên iPOS IVT Pro để tránh tình trạng mất hàng hoặc hàng chưa tới mà Bar đã bán trừ kho là gì?',
      options: [
        {
          text: 'Bước 1: Kho Tổng lập Phiếu Xuất Điều Chuyển -> Hàng vào trạng thái "Đang chuyển" -> Bước 2: Quầy Bar kiểm nhận và ấn "Xác Nhận Nhập Điều Chuyển".',
          isCorrect: true
        },
        {
          text: 'Kho Tổng chỉ cần gọi điện thoại cho Bar, không cần lập chứng từ trên phần mềm.',
          isCorrect: false
        },
        {
          text: 'Quầy Bar tự tạo phiếu Nhập Mua Ngoài từ Nhà Cung Cấp thay vì nhận điều chuyển.',
          isCorrect: false
        },
        {
          text: 'Kho Tổng xóa tồn kho của mình, Bar tự cộng số tồn vào sổ tay.',
          isCorrect: false
        }
      ],
      hint: 'Điều chuyển kho 2 bước đảm bảo trách nhiệm minh bạch: Kho xuất trừ kho ngay, kho nhận chỉ tăng tồn khi thực tế đã ký nhận.',
      explanation: 'iPOS IVT Pro hỗ trợ quy trình Luân chuyển kho 2 bước (Xuất điều chuyển -> Nhập điều chuyển). Hàng trong thời gian vận chuyển sẽ nằm ở trạng thái trung gian, giúp đối soát hao hụt vận chuyển giữa lái xe và các điểm bán.'
    },
    {
      id: 'TK-106',
      npcId: 'chef_john',
      category: '[BÁO CÁO F&B]',
      roleTarget: 'Chủ Quán / GM Nhà Hàng',
      scenario: 'Báo cáo tháng cho thấy tỷ lệ Food Cost toàn quán tăng vọt lên 38% (vượt mức tiêu chuẩn 30-32%). Doanh thu không đổi.',
      question: 'Báo cáo nào trong iPOS IVT Pro là công cụ sắc bén nhất để truy vết nguyên nhân gây thất thoát giá vốn?',
      options: [
        {
          text: 'Báo cáo Phân Tích Chênh Lệch Định Lượng Lý Thuyết vs Tiêu Hao Thực Tế (Variance Analysis).',
          isCorrect: true
        },
        {
          text: 'Báo cáo Danh sách nhân viên đi làm muộn trong tháng.',
          isCorrect: false
        },
        {
          text: 'Báo cáo Số lượng like trên trang Fanpage Facebook quán.',
          isCorrect: false
        },
        {
          text: 'Báo cáo Lịch bảo dưỡng điều hòa không khí nhà bếp.',
          isCorrect: false
        }
      ],
      hint: 'So sánh giữa số lượng nguyên liệu đáng lẽ phải dùng (theo món bán x BOM) với số lượng thực tế đã xuất khỏi kho.',
      explanation: 'Báo cáo Variance Report (Lý thuyết vs Thực tế) trong IVT Pro chỉ rõ chính xác mặt hàng nào bị dùng dôi dư (lãng phí do nấu hỏng, nhân viên đong quá tay, hoặc thất thoát tuồn hàng ra ngoài).'
    }
  ],

  tech: [
    {
      id: 'TK-201',
      npcId: 'support_master',
      category: '[ĐỒNG BỘ SERVICE]',
      roleTarget: 'Kỹ Thuật Viên Triển Khai iPOS',
      scenario: 'Thu ngân tại nhà hàng thanh toán hóa đơn bình thường nhưng trên phần mềm IVT Pro tại văn phòng quản lý không thấy phát sinh dữ liệu trừ kho cả ngày nay.',
      question: 'Bước kiểm tra và khắc phục kỹ thuật đầu tiên cần thực hiện là gì?',
      options: [
        {
          text: 'Kiểm tra trạng thái iPOS Sync Service (Services.msc) trên máy chủ POS và kiểm tra đường dẫn API/Database Connection String.',
          isCorrect: true
        },
        {
          text: 'Cài lại hệ điều hành Windows trên toàn bộ 10 máy tính của nhà hàng.',
          isCorrect: false
        },
        {
          text: 'Yêu cầu thu ngân nhập lại bằng tay toàn bộ 500 hóa đơn vào phần mềm kế toán.',
          isCorrect: false
        },
        {
          text: 'Xóa CSDL SQL Server của nhà hàng và tạo mới từ đầu.',
          isCorrect: false
        }
      ],
      hint: 'Phần mềm iPOS kết nối sang kho thông qua một Windows Service chạy ngầm chuyên đồng bộ hóa giao dịch bán hàng.',
      explanation: 'iPOS Sync Service có thể bị Stopped do khởi động lại máy chủ hoặc do tường lửa/antivirus chặn port kết nối. Kỹ thuật viên cần start lại service, kiểm tra file log `iPOS_Sync.log` để xem lỗi cụ thể (sai chuỗi kết nối hoặc mất mạng LAN).'
    },
    {
      id: 'TK-202',
      npcId: 'support_master',
      category: '[CSDL SQL SERVER]',
      roleTarget: 'Chuyên Viên Hệ Thống',
      scenario: 'Vào giờ cao điểm 21h00, đồng thời 4 máy POS gửi lệnh chốt ca và kế toán chạy tính giá vốn trên IVT Pro, gây hiện tượng quay tròn và treo ứng dụng.',
      question: 'Hiện tượng này trong CSDL SQL Server được gọi là gì và cách cấu hình tối ưu của iPOS là gì?',
      options: [
        {
          text: 'Hiện tượng Deadlock / Block khóa bảng; Cần cấu hình READ_COMMITTED_SNAPSHOT ON (RCSI) và bổ sung Index cho các cột khóa ngoại.',
          isCorrect: true
        },
        {
          text: 'Lỗi do màn hình máy tính có độ phân giải quá cao, cần giảm xuống 800x600.',
          isCorrect: false
        },
        {
          text: 'Hiện tượng virus ăn RAM, chỉ cần tắt màn hình đi ngủ sáng hôm sau sẽ hết.',
          isCorrect: false
        },
        {
          text: 'Do bàn phím của thu ngân bị kẹt phím Enter.',
          isCorrect: false
        }
      ],
      hint: 'Kỹ thuật khóa phiên bản hàng (Row Versioning) trong SQL Server giúp các truy vấn SELECT đọc dữ liệu không bị chặn bởi các lệnh UPDATE/INSERT.',
      explanation: 'Bật RCSI (`ALTER DATABASE [iPOS_IVT] SET READ_COMMITTED_SNAPSHOT ON;`) là khuyến nghị chuẩn của iPOS giúp ngăn chặn Deadlock giữa tiến trình bán hàng tức thời và tiến trình tính giá vốn kho chuyên sâu.'
    },
    {
      id: 'TK-203',
      npcId: 'support_master',
      category: '[TÍNH LẠI GIÁ VỐN]',
      roleTarget: 'Kỹ Thuật Hỗ Trợ Ứng Dụng',
      scenario: 'Do nhà cung cấp gửi hóa đơn muộn, kế toán nhập phiếu nhập kho ngày 01/09 nhưng thực tế nhập liệu vào ngày 05/09 (sau khi đã xuất bán 4 ngày). Báo cáo hiển thị giá vốn một số mặt hàng bị âm hoặc bất thường.',
      question: 'Tính năng kỹ thuật nào trên iPOS IVT Pro giải quyết triệt để vấn đề nhập lùi ngày này?',
      options: [
        {
          text: 'Chức năng "Tính Lại Giá Vốn" (Recalculate Cost) theo khoảng thời gian từ ngày 01/09 đến hiện tại để sắp xếp lại chuỗi chứng từ theo mốc thời gian.',
          isCorrect: true
        },
        {
          text: 'Chức năng sửa trực tiếp file code nguồn của phần mềm iPOS bằng Notepad.',
          isCorrect: false
        },
        {
          text: 'Ép kế toán xóa bỏ toàn bộ phiếu xuất kho của 4 ngày trước.',
          isCorrect: false
        },
        {
          text: 'Đổi ngày hệ thống của máy tính về quá khứ mỗi khi bán hàng.',
          isCorrect: false
        }
      ],
      hint: 'Tính năng tự động chạy lại thuật toán phân bổ giá trị nhập xuất theo đúng thứ tự thời gian của chứng từ.',
      explanation: 'Khi phát sinh chứng từ nhập lùi ngày, chuỗi tính giá bình quân liên hoàn bị đứt đoạn. Thao tác chạy "Tính Lại Giá Vốn" trên IVT Pro sẽ quét lại toàn bộ nhật ký giao dịch theo trình tự `NgayChungTu` chuẩn xác.'
    },
    {
      id: 'TK-204',
      npcId: 'support_master',
      category: '[PHÂN QUYỀN TÀI KHOẢN]',
      roleTarget: 'Quản Trị Viên Hệ Thống',
      scenario: 'Chủ nhà hàng yêu cầu: Nhân viên quầy bar chỉ được phép tạo phiếu "Đề nghị xuất kho" gửi lên, tuyệt đối không được tự ý duyệt phiếu "Xuất kho thực tế".',
      question: 'Cách thiết lập Matrix phân quyền Role-Based trong danh mục Quản trị người dùng iPOS IVT Pro là gì?',
      options: [
        {
          text: 'Tạo Nhóm quyền "Quầy Bar": Bật quyền Thêm/Sửa tại màn hình "Phiếu Đề Nghị Xuất Kho"; Tắt hoàn toàn quyền Xem/Duyệt tại màn hình "Phiếu Xuất Kho".',
          isCorrect: true
        },
        {
          text: 'Cho tất cả nhân viên dùng chung tài khoản Quản Trị Tối Cao (SA/Admin).',
          isCorrect: false
        },
        {
          text: 'Rút dây mạng của máy tính quầy Bar mỗi khi họ gõ xong phiếu đề nghị.',
          isCorrect: false
        },
        {
          text: 'Cài mật khẩu cho bàn phím máy tính.',
          isCorrect: false
        }
      ],
      hint: 'Phân quyền theo chức năng (Role-based access control) tách biệt giữa người lập đề xuất và người có thẩm quyền phê duyệt.',
      explanation: 'Kiểm soát nội bộ F&B yêu cầu phân lập trách nhiệm (Segregation of Duties). IVT Pro cho phép phân quyền chi tiết đến từng hành động (Thêm, Sửa, Xóa, Duyệt, In) trên từng phân hệ chứng từ.'
    },
    {
      id: 'TK-205',
      npcId: 'support_master',
      category: '[API DELIVERY]',
      roleTarget: 'Chuyên Viên Tích Hợp',
      scenario: 'Nhà hàng mở bán trên GrabFood và ShopeeFood qua iPOS Delivery API. Đơn hàng về máy in bếp bình thường nhưng kho không trừ nguyên liệu món "Cà phê sữa đá size L".',
      question: 'Lỗi thường gặp nhất trong bảng ánh xạ dữ liệu (Mapping Table) là gì?',
      options: [
        {
          text: 'Mã món (Item Code / SKU) trên hệ thống Delivery chưa được map khớp với Mã Món có BOM tương ứng trên iPOS IVT Pro.',
          isCorrect: true
        },
        {
          text: 'Do tài xế GrabFood không bấm nhận hàng trên ứng dụng của họ.',
          isCorrect: false
        },
        {
          text: 'Do khách hàng thanh toán bằng mã giảm giá khuyến mãi.',
          isCorrect: false
        },
        {
          text: 'Do máy in hóa đơn bị hết giấy in nhiệt.',
          isCorrect: false
        }
      ],
      hint: 'Mỗi kênh online có thể đặt tên hiển thị khác nhau, hệ thống cần một bảng đối soát SKU 1-1 giữa Delivery và iPOS IVT.',
      explanation: 'Trong cấu hình tích hợp iPOS Delivery Hub, mỗi kênh đối tác phải được cấu hình bảng Mapping SKU. Nếu món bán trên Grab có mã `CF-SUA-L` nhưng IVT chỉ nhận `CF_SUA_LON`, hệ thống sẽ ghi nhận doanh thu nhưng bỏ qua trừ kho định lượng.'
    },
    {
      id: 'TK-206',
      npcId: 'support_master',
      category: '[SAO LƯU DỰ PHÒNG]',
      roleTarget: 'Kỹ Sư Hạ Tầng & Bảo Mật',
      scenario: 'Để phòng ngừa rủi ro ổ cứng máy chủ hỏng hoặc nhiễm mã độc Ransomware mã hóa dữ liệu kho của chuỗi 15 nhà hàng.',
      question: 'Chính sách Backup chuẩn iPOS khuyến nghị thiết lập trên SQL Server Agent là gì?',
      options: [
        {
          text: 'Full Backup hàng ngày lúc 02:00 sáng -> Tự động nén và đẩy bản sao lên Cloud Storage (Google Drive / S3 / NAS riêng) và kiểm tra restore định kỳ.',
          isCorrect: true
        },
        {
          text: 'Chỉ cần chụp ảnh màn hình bảng dữ liệu rồi gửi qua Zalo mỗi tuần.',
          isCorrect: false
        },
        {
          text: 'Không cần backup vì máy tính mua mới sẽ không bao giờ hỏng.',
          isCorrect: false
        },
        {
          text: 'Mỗi năm mới copy database ra một chiếc USB để trong ngăn kéo bàn làm việc.',
          isCorrect: false
        }
      ],
      hint: 'Chiến lược sao lưu 3-2-1: 3 bản sao, trên 2 loại phương tiện lưu trữ khác nhau, và ít nhất 1 bản nằm ở vị trí offsite.',
      explanation: 'Thiết lập SQL Server Maintenance Plan tự động Full Backup lúc 02:00 sáng kèm script đẩy file `.bak` lên Cloud an toàn là tiêu chuẩn bắt buộc trong quy trình bàn giao nghiệm thu phần mềm của kỹ thuật viên iPOS.'
    }
  ]
};

export const NPC_DATA = [
  {
    id: 'milo',
    name: 'Milo Thủ Kho',
    role: 'manager',
    badge: 'Quản Lý Kho F&B',
    emoji: '👨‍🍳',
    x: 0,
    z: -4,
    greeting: 'Chào bạn! Tôi đang kiểm tra các kiện hàng nguyên liệu mới về kho. Cây cầu dữ liệu sang Cloud Server đang đứt gãy, bạn hãy giúp giải quyết các Ticket xuất nhập tồn nhé!'
  },
  {
    id: 'chef_john',
    name: 'Chef John',
    role: 'manager',
    badge: 'Bếp Trưởng Điều Hành',
    emoji: '🧑‍🍳',
    x: -8,
    z: -3,
    greeting: 'Bếp đang chuẩn bị thực đơn cho tiệc tối! Tỷ lệ hao hụt sơ chế và định mức BOM đồ ăn thức uống cần được tinh chỉnh chuẩn xác trên iPOS IVT Pro.'
  },
  {
    id: 'support_master',
    name: 'Support Master',
    role: 'tech',
    badge: 'Kỹ Sư Triển Khai iPOS',
    emoji: '💻',
    x: 8,
    z: -3,
    greeting: 'Xin chào! Hệ thống đồng bộ Service iPOS và CSDL SQL Server của nhà hàng cần được tối ưu cấu hình và xử lý các lỗi Deadlock, Mapping API.'
  }
];

export const COLLECTIBLE_ITEMS = [
  { id: 'item_milk', name: 'Thùng Sữa Tươi Ba Vì', icon: '🥛', x: -5, z: 4, collected: false, xp: 20 },
  { id: 'item_coffee', name: 'Bao Hạt Cafe Cầu Đất', icon: '☕', x: 5, z: 5, collected: false, xp: 20 },
  { id: 'item_cable', name: 'Cuộn Cáp Mạng Cat6', icon: '🔌', x: -6, z: -8, collected: false, xp: 20 },
  { id: 'item_rfid', name: 'Thẻ Chip RFID Quản Lý Kho', icon: '🏷️', x: 6, z: -8, collected: false, xp: 20 },
  { id: 'item_dongle', name: 'USB Dongle Bản Quyền iPOS', icon: '💾', x: 0, z: 7, collected: false, xp: 20 },
  { id: 'item_manual', name: 'Sổ Tay Định Mức BOM F&B', icon: '📘', x: -3, z: 9, collected: false, xp: 20 }
];
