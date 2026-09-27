const fs = require('fs');
const path = require('path');

const questions = [
  // =========================================================================
  // LEVEL 1: LÀNG KHỞI ĐẦU - ROLE: MANAGER (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'M1_01',
    role: 'manager',
    level: 1,
    zone: 'Cổng Chào Làng Khởi Đầu - Quầy Thu Ngân POS',
    ticketCode: 'MGR-L1-01',
    category: 'Đơn vị tính cơ bản',
    title: 'Thiết lập Đơn Vị Tính Chính cho Cà Phê Hạt',
    prompt: 'Khi tạo mới mặt hàng "Cà phê hạt Robusta" trong Danh mục hàng hóa để vừa nhập theo bao 25kg, vừa pha chế espresso (theo gram), chủ quán nên thiết lập Đơn vị tính chính là gì để thuận tiện nhất cho việc lập công thức chế biến (BOM) và theo dõi tồn kho?',
    options: [
      { id: 'A', text: 'Bao (25kg) để dễ kiểm đếm số bao trong kho', isCorrect: false },
      { id: 'B', text: 'Kilogram (Kg) theo đơn vị đo lường phổ thông', isCorrect: false },
      { id: 'C', text: 'Gram (g) - đơn vị nhỏ nhất đo lường được sử dụng trực tiếp trong công thức chế biến', isCorrect: true },
      { id: 'D', text: 'Ly pha chế theo số lượng thành phẩm bán ra', isCorrect: false }
    ],
    hint: 'Chuyên đề 015 & 016 cẩm nang đề xuất chọn ĐVT chính là đơn vị nhỏ nhất đo lường được sử dụng trực tiếp trong công thức chế biến món ăn/đồ uống.',
    explanation: 'Cẩm nang IVT khuyên nên khai báo Đơn vị tính chính là đơn vị đo lường nhỏ nhất được dùng trực tiếp trong công thức chế biến (ở đây là Gram). Sau đó thiết lập Hệ số quy đổi: 1 Kg = 1000g, 1 Bao = 25000g. Làm như vậy khi nhập hàng bằng Bao hay Kg hệ thống sẽ tự quy đổi chính xác về Gram, và khi bán ly cà phê (tiêu hao 18g - 20g), hệ thống sẽ trừ trực tiếp mà không bị sai số làm tròn thập phân. Lưu ý: Đơn vị tính chính đã phát sinh giao dịch thì KHÔNG THỂ thay đổi.'
  },
  {
    id: 'M1_02',
    role: 'manager',
    level: 1,
    zone: 'Kho Nguyên Liệu Khô Làng Khởi Đầu',
    ticketCode: 'MGR-L1-02',
    category: 'Theo dõi tồn kho',
    title: 'Quy tắc bật/tắt Theo dõi tồn kho cho Thành phẩm vs Nguyên liệu',
    prompt: 'Cửa hàng mới mở bán món "Trà Đào Cam Sả" và nhập nguyên liệu "Đào hộp Kronos". Trong Danh mục hàng hóa IVT Pro, bạn cần thiết lập thuộc tính "Theo dõi tồn kho" cho 2 mặt hàng này như thế nào?',
    options: [
      { id: 'A', text: 'Bật theo dõi tồn kho cho cả Trà Đào Cam Sả và Đào hộp Kronos', isCorrect: false },
      { id: 'B', text: 'Tắt theo dõi tồn kho cho Trà Đào Cam Sả; Bật theo dõi tồn kho cho Đào hộp Kronos', isCorrect: true },
      { id: 'C', text: 'Bật theo dõi tồn kho cho Trà Đào Cam Sả; Tắt theo dõi tồn kho cho Đào hộp Kronos', isCorrect: false },
      { id: 'D', text: 'Tắt theo dõi tồn kho cho cả 2 mặt hàng vì đã có POS quản lý', isCorrect: false }
    ],
    hint: 'Món menu bán ra tại POS được chế biến tại chỗ, còn đào hộp là nguyên vật liệu nhập mua tích trữ trong kho.',
    explanation: 'Theo quy tắc sống còn của IVT Pro: Món thành phẩm bán qua POS phải TẮT "Theo dõi tồn kho". Nếu bật theo dõi tồn kho cho thành phẩm, khi bán tại POS hệ thống sẽ dừng lại ở mã món và đòi trừ tồn kho thành phẩm, không phân rã xuống trừ các nguyên vật liệu cấu thành (đào hộp, trà, sả). Ngược lại, nguyên vật liệu (như Đào hộp) phải BẬT "Theo dõi tồn kho" để theo dõi số lượng nhập - xuất - tồn.'
  },
  {
    id: 'M1_03',
    role: 'manager',
    level: 1,
    zone: 'Bàn Giao Nhận Hàng Cửa Khẩu',
    ticketCode: 'MGR-L1-03',
    category: 'Nhập kho mua hàng',
    title: 'Xử lý đơn Đặt hàng Nhà Cung Cấp giao nhiều đợt',
    prompt: 'Nhà cung cấp sữa Vinamilk giao đợt 1 gồm 10 thùng sữa tươi trên tổng số 30 thùng đã đặt trong đơn mua hàng PO-001. Thủ kho cần thao tác như thế nào trên phần mềm IVT Pro để ghi nhận chính xác công nợ và số lượng thực nhận?',
    options: [
      { id: 'A', text: 'Huỷ đơn đặt hàng cũ và tạo đơn đặt hàng mới chỉ gồm 10 thùng', isCorrect: false },
      { id: 'B', text: 'Tạo phiếu Nhập mua hàng từ đơn PO-001, sửa số lượng thực nhận thành 10 thùng; hệ thống lưu vết còn thiếu 20 thùng để nhận tiếp đợt sau', isCorrect: true },
      { id: 'C', text: 'Xác nhận hoàn thành toàn bộ 30 thùng để nhà cung cấp xuất hoá đơn một lần', isCorrect: false },
      { id: 'D', text: 'Không tạo phiếu nhập trên phần mềm, đợi khi nào giao đủ 30 thùng mới tạo phiếu nhập một thể', isCorrect: false }
    ],
    hint: 'IVT Pro hỗ trợ tính năng "Nhập hàng từ đơn mua hàng (giao một hoặc nhiều lần)" theo Chuyên đề 037.',
    explanation: 'IVT Pro hỗ trợ quy trình giao hàng nhiều lần cho một đơn mua hàng (PO). Khi nhận đợt 1, thủ kho vào Nhập mua hàng -> Chọn đơn mua hàng PO-001 -> Nhập số lượng thực nhận là 10 thùng. Phần mềm sẽ trừ số lượng còn lại của PO (còn 20 thùng) và chỉ ghi nhận công nợ cùng tồn kho cho đúng 10 thùng thực nhập. Khi đợt 2 giao tiếp, tiếp tục chọn đơn PO-001 để nhập nốt.'
  },
  {
    id: 'M1_04',
    role: 'manager',
    level: 1,
    zone: 'Quầy Bar Pha Chế Thử Nghiệm',
    ticketCode: 'MGR-L1-04',
    category: 'Định lượng BOM',
    title: 'Hiệu lực ngày áp dụng của Công Thức Chế Biến',
    prompt: 'Ngày 15/09 quán bắt đầu bán món mới "Trà Sữa Oolong Nướng" trên máy POS. Tuy nhiên đến ngày 18/09 quản lý mới lên IVT Pro tạo Công thức chế biến (BOM) và để "Ngày áp dụng" mặc định là ngày tạo phiếu (18/09). Hiện tượng gì sẽ xảy ra với các order đã bán từ ngày 15 đến 17/09?',
    options: [
      { id: 'A', text: 'Hệ thống tự động trừ kho hồi tố từ ngày 15/09 mà không cần thao tác gì', isCorrect: false },
      { id: 'B', text: 'Các hoá đơn bán từ 15 đến 17/09 rơi vào tab "Chưa đồng bộ" với lỗi "Không tìm thấy công thức chế biến"', isCorrect: true },
      { id: 'C', text: 'Máy POS báo lỗi không cho in hoá đơn bán hàng từ ngày 15/09', isCorrect: false },
      { id: 'D', text: 'Toàn bộ kho bị khoá và không cho thực hiện kiểm kê cuối tháng', isCorrect: false }
    ],
    hint: 'Món bán ở POS chỉ trừ kho khi có công thức chế biến CÒN HIỆU LỰC tại chính thời điểm bán.',
    explanation: 'Điều kiện tiên quyết để trừ kho là ngày hiệu lực của BOM phải nhỏ hơn hoặc bằng ngày giờ hoá đơn phát sinh tại POS. Vì BOM khai ngày áp dụng 18/09 nên các hoá đơn từ 15-17/09 bị coi là "chưa có công thức tại thời điểm bán" và dạt vào tab "Chưa đồng bộ". Cách khắc phục: Sửa ngày áp dụng của BOM lùi về ngày 15/09 (hoặc sớm hơn), sau đó dùng tiện ích "Đồng bộ lại hoá đơn".'
  },
  {
    id: 'M1_05',
    role: 'manager',
    level: 1,
    zone: 'Trạm Kiểm Kê Cuối Ca Làng Khởi Đầu',
    ticketCode: 'MGR-L1-05',
    category: 'Kiểm kê hàng hoá',
    title: 'Phân biệt Nhập số 0 vs Xoá dòng khi kiểm kê kho',
    prompt: 'Cuối ngày, thủ kho kiểm kê nguyên vật liệu: Hộp "Bột Matcha" trong kho đã cạn sạch hoàn toàn, còn nguyên liệu "Hạt Chia" thì hôm nay không nằm trong danh sách cần kiểm đếm. Thao tác đúng trên phiếu Kiểm kê IVT Pro là gì?',
    options: [
      { id: 'A', text: 'Bột Matcha để trống ô số lượng; Hạt Chia gõ số lượng 0', isCorrect: false },
      { id: 'B', text: 'Bột Matcha gõ số lượng bằng 0; Hạt Chia click chuột phải chọn "Bỏ dòng" (xoá khỏi phiếu kiểm kê)', isCorrect: true },
      { id: 'C', text: 'Cả hai nguyên liệu đều xoá dòng để không làm biến động kho', isCorrect: false },
      { id: 'D', text: 'Cả hai nguyên liệu đều điền số 0', isCorrect: false }
    ],
    hint: 'Nhập 0 nghĩa là kiểm kê thực tế đã hết sạch; còn không kiểm kê đến thì phải bỏ dòng để hệ thống giữ nguyên tồn hiện tại.',
    explanation: 'Đây là quy tắc kiểm kê cốt tử được nêu rõ trong Chuyên đề 053 & 101: Nếu hàng hóa thực tế đã hết, BẮT BUỘC phải gõ số 0 (hệ thống sẽ tạo phiếu Xuất điều chỉnh hao hụt để đưa tồn về 0). Nếu mặt hàng không kiểm đếm trong đợt này, BẮT BUỘC phải Bỏ dòng (xoá dòng). Nếu để số 0 cho hàng không kiểm kê, hệ thống sẽ hiểu là đã mất sạch và xuất sạch kho!'
  },
  {
    id: 'M1_06',
    role: 'manager',
    level: 1,
    zone: 'Vọng Lầu Báo Cáo - Bờ Vực Làng Khởi Đầu',
    ticketCode: 'MGR-L1-06',
    category: 'Báo cáo A06 Thẻ kho',
    title: 'Truy vết sai lệch tồn bằng Báo cáo A06 và Thẻ Kho',
    prompt: 'Cuối tháng xem Báo cáo A06 (Xuất Nhập Tồn), chủ quán thấy mặt hàng "Siro Bạc Hà" hiển thị tồn cuối kỳ bị lệch nghiêm trọng so với thực tế và số tiền giá trị tồn rất lớn. Để truy tìm nguồn gốc sai sót, thao tác chuẩn xác nhất trên IVT Pro là gì?',
    options: [
      { id: 'A', text: 'Bấm trực tiếp vào mã hàng Siro Bạc Hà trên báo cáo A06 để mở "Thẻ kho", kiểm tra từng phiếu nhập xuất xem có phiếu nào nhập nhầm ĐVT hoặc sai đơn giá', isCorrect: true },
      { id: 'B', text: 'Tạo ngay một phiếu Kiểm kê điều chỉnh cưỡng bức mà không cần kiểm tra nguyên nhân', isCorrect: false },
      { id: 'C', text: 'Xoá mặt hàng Siro Bạc Hà khỏi danh mục rồi tạo mã hàng mới', isCorrect: false },
      { id: 'D', text: 'Chạy lại Tiện ích tính giá vốn 5 lần liên tiếp', isCorrect: false }
    ],
    hint: 'Báo cáo A06 là báo cáo trung tâm; bấm vào mã hàng sẽ bung Thẻ kho xem toàn bộ lịch sử biến động.',
    explanation: 'Báo cáo A06 là trung tâm của mọi đối soát kho. Nhấp chuột vào mã hàng trên A06 sẽ mở ra Thẻ kho chi tiết, hiển thị từng dòng nhập, xuất, điều chuyển, kèm mã chứng từ, đơn vị tính và đơn giá. Tại đây sẽ phát hiện ngay các lỗi kinh điển như: nhập 10 thùng nhưng quên quy đổi nên ghi 10 chai, hoặc gõ nhầm đơn giá từ 150,000đ thành 1,500,000đ. Sau khi sửa/huỷ phiếu sai và tạo lại, chạy lại tính giá vốn thì số liệu sẽ chuẩn xác.'
  },

  // =========================================================================
  // LEVEL 1: LÀNG KHỞI ĐẦU - ROLE: TECH (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'T1_01',
    role: 'tech',
    level: 1,
    zone: 'Trạm Kỹ Thuật Server POS Làng Khởi Đầu',
    ticketCode: 'TCK-L1-01',
    category: 'Xuất bán POS',
    title: 'Quy tắc vàng 1st Action khi khách báo Bán hàng không trừ kho',
    prompt: 'Khách hàng gọi hotline báo: "Hôm nay quán em bán cả trăm ly cà phê trên máy POS mà vào IVT Pro thấy kho không suy suyển gì cả!". Là một kỹ thuật viên iPOS Pro, hành động đầu tiên bạn PHẢI thực hiện trước khi đoán bất kỳ điều gì là gì?',
    options: [
      { id: 'A', text: 'Vào cấu hình Cài đặt hệ thống để khởi động lại dịch vụ đồng bộ Cloud', isCorrect: false },
      { id: 'B', text: 'Mở "Menu -> Xuất kho -> Xuất bán POS", chọn ngày và kho tương ứng, chuyển sang tab "Chưa đồng bộ" và đọc cột "Lý do lỗi"', isCorrect: true },
      { id: 'C', text: 'Hướng dẫn khách huỷ toàn bộ hoá đơn trong ngày trên máy POS rồi in lại', isCorrect: false },
      { id: 'D', text: 'Kết nối TeamViewer vào máy tính tiền POS để cài lại SQL Server', isCorrect: false }
    ],
    hint: 'Đừng bao giờ đoán mò khi phần mềm đã có màn hình tự nói ra nguyên nhân lỗi cụ thể.',
    explanation: 'Nguyên tắc số 1 của support IVT Pro: Truy cập ngay `Xuất kho -> Xuất bán POS -> tab Chưa đồng bộ` và đọc cột "Lý do lỗi". Hệ thống đã chỉ rõ nguyên nhân tại đây (Hết hạn bản quyền, Chưa có công thức chế biến, Món chưa đồng bộ từ POS, Sai ĐVT chính...). Đọc đúng lý do lỗi sẽ giải quyết ticket trong 1 phút thay vì đoán mò mất hàng giờ.'
  },
  {
    id: 'T1_02',
    role: 'tech',
    level: 1,
    zone: 'Bàn Cấu Hình Menu POS-IVT',
    ticketCode: 'TCK-L1-02',
    category: 'Đồng bộ danh mục POS',
    title: 'Món mới tạo trên POS không hiển thị trong danh mục IVT',
    prompt: 'Quán vừa tạo món mới trên POS nhưng quản lý không tìm thấy trong Danh mục hàng hoá IVT. Khi kiểm tra cấu hình "Tự động đồng bộ danh mục hàng hoá từ POS", bạn thấy cấu hình này đang BẬT. Vậy món mới thực chất đang nằm ở đâu trong IVT?',
    options: [
      { id: 'A', text: 'Nằm ở tab "Chưa phân loại" trong Danh mục hàng hoá', isCorrect: true },
      { id: 'B', text: 'Nằm ở tab "Chưa đồng bộ" trong Danh mục hàng hoá', isCorrect: false },
      { id: 'C', text: 'Đã bị xóa do trùng mã hàng trên máy chủ POS', isCorrect: false },
      { id: 'D', text: 'Nằm ở thùng rác của hệ thống chờ quản trị viên phê duyệt', isCorrect: false }
    ],
    hint: 'Hãy nhớ sự khác biệt giữa Bật và Tắt cấu hình "Tự động đồng bộ danh mục hàng hoá từ POS".',
    explanation: 'Khi cấu hình "Tự động đồng bộ danh mục hàng hoá từ POS" được BẬT, món mới tạo từ POS sẽ tự động được kéo về và nằm tại tab "Chưa phân loại" của Danh mục hàng hoá. Khách hàng thường chỉ tìm ở tab danh mục chính nên tưởng món bị mất. Nếu cấu hình này TẮT, món sẽ nằm ở tab "Chưa đồng bộ" và cần bấm nút "Đồng bộ" thủ công.'
  },
  {
    id: 'T1_03',
    role: 'tech',
    level: 1,
    zone: 'Trạm Barcode & Cân Điện Tử',
    ticketCode: 'TCK-L1-03',
    category: 'Phân loại món Ghi chú',
    title: 'Món phụ/Ghi chú báo lỗi liên tục Chưa có công thức chế biến',
    prompt: 'Màn hình Xuất bán POS tab "Chưa đồng bộ" ngập tràn hàng trăm dòng lỗi "Không tìm thấy công thức chế biến" cho các món như: "30% Đường", "Ít đá", "Không hành", "Mang về". Giải pháp chuẩn kỹ thuật để giải quyết triệt để vấn đề này là gì?',
    options: [
      { id: 'A', text: 'Tạo công thức chế biến rỗng (0 gram) cho từng món ghi chú này', isCorrect: false },
      { id: 'B', text: 'Vào Danh mục hàng hoá, sửa Loại hàng hoá của các mã này thành Loại "Ghi chú"', isCorrect: true },
      { id: 'C', text: 'Bật tuỳ chọn "Bỏ qua kiểm tra công thức" trong Cài đặt hệ thống', isCorrect: false },
      { id: 'D', text: 'Xoá toàn bộ các nút ghi chú trên giao diện máy POS bán hàng', isCorrect: false }
    ],
    hint: 'IVT Pro có một Loại hàng hoá chuyên dụng dành riêng cho các lệnh pha chế/bếp mà không cần quản lý định lượng.',
    explanation: 'Trong IVT Pro, Loại hàng hoá "Ghi chú" (ví dụ % đường đá, độ cay, ghi chú bếp) mặc định không theo dõi tồn kho và ĐẶC BIỆT là hệ thống sẽ KHÔNG quét lỗi "Chưa có công thức chế biến" trên màn hình Xuất bán POS nữa. Việc tạo BOM rỗng là sai quy chuẩn và làm phình to dữ liệu không cần thiết.'
  },
  {
    id: 'T1_04',
    role: 'tech',
    level: 1,
    zone: 'Tháp Lưu Vết Dữ Liệu Làng Khởi Đầu',
    ticketCode: 'TCK-L1-04',
    category: 'Ràng buộc hệ thống',
    title: '3 Loại khai báo CẤM sửa/xoá để bảo toàn tính toàn vẹn',
    prompt: 'Khách hàng yêu cầu KTV xoá một Hệ số quy đổi ĐVT bị khai sai tháng trước và xoá một Mã hàng hoá đã từng phát sinh nhập kho để tạo lại cho đẹp mã. Phản hồi kỹ thuật nào sau đây là CHUẨN XÁC theo kiến trúc IVT Pro?',
    options: [
      { id: 'A', text: 'Có thể dùng tài khoản Admin can thiệp cơ sở dữ liệu để xoá hoàn toàn', isCorrect: false },
      { id: 'B', text: 'Hệ thống thiết kế lưu vết lịch sử: Hệ số quy đổi, Bảng giá và Mã hàng đã phát sinh KHÔNG ĐƯỢC sửa/xoá; chỉ có thể tắt trạng thái "Hoạt động" và tạo khai báo mới', isCorrect: true },
      { id: 'C', text: 'Sửa trực tiếp số quy đổi cũ vì hệ thống sẽ tự cập nhật hồi tố lại tất cả các phiếu cũ', isCorrect: false },
      { id: 'D', text: 'Phải cài đặt lại phần mềm từ đầu mới xoá được các khai báo này', isCorrect: false }
    ],
    hint: '3 đối tượng không bao giờ sửa/xoá được: Hệ số quy đổi ĐVT, Bảng giá, Mã hàng đã phát sinh. Hệ thống sẽ luôn lấy bản ghi mới nhất.',
    explanation: 'Theo thiết kế kiến trúc bảo toàn lịch sử dữ liệu của IVT Pro: 3 loại khai báo tuyệt đối không sửa và không xoá được gồm: (1) Hệ số quy đổi ĐVT, (2) Bảng giá, (3) Mã hàng đã có phát sinh. Xử lý chuẩn: Tắt trạng thái Hoạt động (Inactive) của bản ghi cũ, sau đó tạo bản ghi mới. Đối với ĐVT, hệ thống sẽ luôn lấy khai báo active mới nhất để áp dụng cho các giao dịch mới.'
  },
  {
    id: 'T1_05',
    role: 'tech',
    level: 1,
    zone: 'Đài Quan Sát Nhập Xuất Làng Khởi Đầu',
    ticketCode: 'TCK-L1-05',
    category: 'Lỗi Thành phẩm bật tồn kho',
    title: 'Món đã nằm tab Đã đồng bộ nhưng nguyên liệu vẫn không bị trừ',
    prompt: 'Khách hàng mở tab "Đã đồng bộ" trên Xuất bán POS thấy hoá đơn bán "Cà phê nâu sữa" đã chuyển sang trạng thái thành công, nhưng mở Thẻ kho của Sữa đặc và Cà phê hạt thì không hề thấy phát sinh dòng xuất kho nào. Đâu là nguyên nhân cốt lõi?',
    options: [
      { id: 'A', text: 'Do máy POS bị mất mạng trong lúc in hoá đơn', isCorrect: false },
      { id: 'B', text: 'Mã món thành phẩm "Cà phê nâu sữa" đang bị BẬT "Theo dõi tồn kho" trong Danh mục hàng hoá', isCorrect: true },
      { id: 'C', text: 'Do chưa chạy tiện ích khoá sổ kỳ kế toán', isCorrect: false },
      { id: 'D', text: 'Do ngày bán rơi vào ngày nghỉ cuối tuần', isCorrect: false }
    ],
    hint: 'Xem Chẩn đoán A1 Bước 3 trong tài liệu 10: Nếu thành phẩm bật theo dõi tồn kho, hệ thống dừng lại ở lớp thành phẩm.',
    explanation: 'Đây là "bẫy" kỹ thuật rất phổ biến: Khi món Thành phẩm được bật "Theo dõi tồn kho", cơ chế xử lý của IVT sẽ coi món đó là hàng có sẵn và dừng lại ở lớp thành phẩm, không kích hoạt cơ chế phân rã BOM xuống nguyên liệu gốc. Cách khắc phục: Vào Danh mục hàng hoá -> Tìm món thành phẩm -> Tắt "Theo dõi tồn kho" -> Vào Xuất bán POS dùng tiện ích "Đồng bộ lại hoá đơn".'
  },
  {
    id: 'T1_06',
    role: 'tech',
    level: 1,
    zone: 'Nhịp Cầu Số 6 Làng Khởi Đầu',
    ticketCode: 'TCK-L1-06',
    category: 'Kho theo dõi tồn',
    title: 'Bẫy cấu hình Kho theo dõi tồn trong Danh mục hàng hoá',
    prompt: 'Một chuỗi có 3 chi nhánh (Kho 1, Kho 2, Kho 3). Nhân viên tạo mã nguyên liệu "Trà Đen" và tại trường "Kho theo dõi tồn" đã chọn đích danh "Kho 1". Khi Kho 2 nhập mua và bán Trà Đen thì trên Báo cáo A06 của Kho 2 hoàn toàn không hiển thị mặt hàng này. Lời khuyên chuẩn từ cẩm nang triển khai IVT Pro là gì?',
    options: [
      { id: 'A', text: 'Phải tạo thêm 2 mã hàng Trà Đen riêng biệt cho Kho 2 và Kho 3', isCorrect: false },
      { id: 'B', text: 'Để TRỐNG trường "Kho theo dõi tồn" trong Danh mục hàng hoá để mặt hàng được theo dõi ở tất cả các kho', isCorrect: true },
      { id: 'C', text: 'Kho 2 phải làm phiếu mượn hàng từ Kho 1 mỗi ngày', isCorrect: false },
      { id: 'D', text: 'Tắt tính năng quản trị đa kho trong Cài đặt hệ thống', isCorrect: false }
    ],
    hint: 'Chuyên đề 015 & Cẩm nang kiến trúc khuyến nghị cách điền trường "Kho theo dõi tồn".',
    explanation: 'Cẩm nang IVT Pro ghi rõ: Nếu điền mã kho cụ thể vào trường "Kho theo dõi tồn", mặt hàng CHỈ ĐƯỢC theo dõi tồn tại đúng kho đó, các kho khác sẽ không thấy tồn hoặc không thể xem báo cáo. Để thuận tiện nhất trong vận hành chuỗi và kho, cẩm nang ĐỀ XUẤT ĐỂ TRỐNG trường này, khi đó mặt hàng sẽ tự động áp dụng theo dõi cho tất cả các kho hiện tại và tương lai.'
  },

  // =========================================================================
  // LEVEL 2: ĐẢO BẾP TRUNG TÂM - ROLE: MANAGER (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'M2_01',
    role: 'manager',
    level: 2,
    zone: 'Bến Tàu Bếp Trung Tâm',
    ticketCode: 'MGR-L2-01',
    category: 'Sơ chế vs Chế biến',
    title: 'Phân biệt Quy trình Sơ chế vs Quy trình Chế biến BTP',
    prompt: 'Bếp trung tâm nhập 50 con gà sống nguyên con về pha lóc thành đùi gà, ức gà, cánh gà; đồng thời dùng chanh dây và đường để nấu thành 20 lít "Sốt chanh dây". Quản lý kho cần áp dụng 2 quy trình nào trên phân hệ Sản xuất IVT Pro?',
    options: [
      { id: 'A', text: 'Gà: Quy trình Sơ chế (1 vào nhiều ra); Sốt chanh dây: Quy trình Chế biến BTP (nhiều vào 1 ra)', isCorrect: true },
      { id: 'B', text: 'Gà: Quy trình Chế biến BTP; Sốt chanh dây: Quy trình Sơ chế', isCorrect: false },
      { id: 'C', text: 'Cả 2 đều dùng phiếu Xuất Huỷ và Nhập Mua Khác', isCorrect: false },
      { id: 'D', text: 'Cả 2 đều dùng tính năng Định mức biến thiên', isCorrect: false }
    ],
    hint: 'Sơ chế là "Tách ra" (1 đầu vào -> nhiều đầu ra). Chế biến là "Gộp vào" (nhiều đầu vào -> 1 thành phẩm/BTP).',
    explanation: 'Nguyên lý thiết kế phân hệ Sản xuất trong IVT Pro phân định rất rõ ràng: Quy trình Sơ chế dùng cho nghiệp vụ "1 vào nhiều ra" (Ví dụ: 1 con gà/con bò tách ra nhiều phần thịt với tỉ lệ % thu hồi). Quy trình Chế biến Bán thành phẩm dùng cho nghiệp vụ "Nhiều vào 1 ra" (Ví dụ: đường, chanh dây, phụ gia kết hợp nấu ra Sốt chanh dây lưu kho).'
  },
  {
    id: 'M2_02',
    role: 'manager',
    level: 2,
    zone: 'Trạm Điều Phối Đơn Cung Ứng',
    ticketCode: 'MGR-L2-02',
    category: 'Cung ứng hàng hoá',
    title: 'Đặt hàng nội bộ khi cửa hàng không có người duyệt yêu cầu mua',
    prompt: 'Các cửa hàng chi nhánh cần đặt bánh mì và sốt từ Bếp Trung Tâm mỗi sáng. Quán không bố trí người duyệt đơn mua hàng mà muốn cửa hàng đặt là đơn tự động điều hướng về Bếp. Người quản lý chuỗi cần khai báo danh mục nào trên IVT Pro?',
    options: [
      { id: 'A', text: 'Khai báo Danh mục Bảng giá nội bộ', isCorrect: false },
      { id: 'B', text: 'Khai báo "Danh mục -> Cung ứng hàng hoá", chọn hàng hoá nào được cung ứng từ Bếp Trung Tâm', isCorrect: true },
      { id: 'C', text: 'Thiết lập tài khoản nhân viên chi nhánh có quyền Admin tối cao', isCorrect: false },
      { id: 'D', text: 'Bật tính năng Nhượng quyền vận hành tách biệt', isCorrect: false }
    ],
    hint: 'Chuyên đề 025 & Chẩn đoán D1: Khi không có người duyệt PO, danh mục nào giúp hệ thống tự định tuyến đích đến của đơn đặt hàng?',
    explanation: 'Tại `Danh mục -> Cung ứng hàng hoá`, hệ thống cho phép chỉ định rõ mặt hàng nào do Kho tổng / Bếp trung tâm nào cung ứng. Khi cửa hàng tạo yêu cầu đặt hàng, nếu không dùng luồng xét duyệt thì IVT Pro sẽ dựa vào bảng Cung ứng hàng hoá này để tự động sinh phiếu đặt hàng nội bộ chuyển thẳng đến kho bếp trung tâm tương ứng.'
  },
  {
    id: 'M2_03',
    role: 'manager',
    level: 2,
    zone: 'Cầu Cân Xe Tải Giao Nhận',
    ticketCode: 'MGR-L2-03',
    category: 'Điều chuyển hàng hoá',
    title: 'Sự cố chênh lệch số lượng thực nhận khi nhập điều chuyển',
    prompt: 'Bếp trung tâm xuất điều chuyển 50 kg thịt bò tới Chi nhánh Quận 1, nhưng khi mở thùng cân thực tế tại chi nhánh thì chỉ có 47 kg (hao hụt hoặc thất thoát 3 kg dọc đường). Để thủ kho chi nhánh có thể sửa số lượng thực nhận trên phiếu nhập điều chuyển, cấu hình nào phải được bật trước đó?',
    options: [
      { id: 'A', text: 'Cho phép bán âm kho không giới hạn', isCorrect: false },
      { id: 'B', text: 'Cấu hình "Cho phép sửa số lượng thực nhận khi nhập điều chuyển" trong Cài đặt hệ thống', isCorrect: true },
      { id: 'C', text: 'Tự động huỷ phiếu xuất điều chuyển nếu thiếu hàng', isCorrect: false },
      { id: 'D', text: 'Bật cấu hình Định mức biến thiên', isCorrect: false }
    ],
    hint: 'Cấu hình hệ thống mục Vận hành kho hàng cho phép bên nhận chỉnh sửa số lượng thực nhận (nhỏ hơn số xuất).',
    explanation: 'Trong `Thiết lập -> Hệ thống`, có tuỳ chọn "Cho phép sửa số lượng thực nhận khi nhập điều chuyển". Khi bật tuỳ chọn này, bên nhận được quyền nhập số thực tế (47 kg, nhỏ hơn số trên phiếu xuất 50 kg). Phần chênh lệch 3 kg sẽ được ghi nhận rõ ràng để quản lý đối soát quy trách nhiệm vận chuyển.'
  },
  {
    id: 'M2_04',
    role: 'manager',
    level: 2,
    zone: 'Xưởng Pha Chế Siêu Cấp Đảo Bếp',
    ticketCode: 'MGR-L2-04',
    category: 'Trừ kho 2 cấp',
    title: 'Vận hành Bán thành phẩm không muốn theo dõi quy trình nấu nướng',
    prompt: 'Quầy bar nấu "Nước cốt trà đen" mỗi sáng từ trà khô và nước sôi. Bar không muốn làm phiếu xuất nhập chế biến rườm rà mỗi ngày nhưng khi bán ly "Trà đào" (dùng 100ml cốt trà) ở POS thì kho vẫn phải tự trừ ra đúng số gam Trà khô ban đầu. Quản lý cần đề xuất giải pháp nghiệp vụ nào?',
    options: [
      { id: 'A', text: 'Hàng ngày cuối ca làm phiếu xuất hao hụt trà khô bằng tay', isCorrect: false },
      { id: 'B', text: 'Kích hoạt giải pháp "Trừ kho 2 cấp (định lượng 2 cấp)" và tắt theo dõi tồn kho cho Nước cốt trà đen', isCorrect: true },
      { id: 'C', text: 'Khai báo Nước cốt trà đen là hàng bán thẳng', isCorrect: false },
      { id: 'D', text: 'Đổi đơn vị tính của trà khô thành Mililit', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 007 & Chẩn đoán A4: Dùng khi có BTP nhưng không muốn quản lý quy trình chế biến của BTP đó.',
    explanation: 'Giải pháp "Trừ kho 2 cấp" là cứu tinh cho các mô hình quầy bar/bếp: Quán có BTP trung gian nhưng không muốn nhân viên phải mất công bấm phiếu chế biến hàng ngày. Khi bật Trừ kho 2 cấp, khai BOM cho Cốt trà (từ trà khô) và BOM cho Trà đào (từ Cốt trà), đồng thời TẮT theo dõi tồn kho của Cốt trà -> Khi bán Trà đào, IVT tự động phân rã xuyên qua 2 tầng BOM để trừ thẳng vào Trà khô gốc.'
  },
  {
    id: 'M2_05',
    role: 'manager',
    level: 2,
    zone: 'Phòng Kế Toán Bếp Chuỗi',
    ticketCode: 'MGR-L2-05',
    category: 'Hình thức điều chuyển & Công nợ',
    title: 'Điều chuyển nội bộ vs Bán nội bộ giữa các chi nhánh',
    prompt: 'Công ty mẹ có mô hình chuỗi gồm các chi nhánh hạch toán độc lập (nhượng quyền hoặc góp vốn riêng). Khi Bếp trung tâm xuất nguyên liệu cho các chi nhánh này, loại phiếu nào PHẢI được chọn để hệ thống tự động ghi nhận công nợ nội bộ phải thu?',
    options: [
      { id: 'A', text: 'Phiếu Xuất điều chuyển nội bộ thông thường', isCorrect: false },
      { id: 'B', text: 'Phiếu Xuất điều chuyển với hình thức "Bán nội bộ"', isCorrect: true },
      { id: 'C', text: 'Phiếu Xuất huỷ hàng hết hạn', isCorrect: false },
      { id: 'D', text: 'Phiếu Xuất trả lại nhà cung cấp', isCorrect: false }
    ],
    hint: 'Xem bảng so sánh 3 hình thức điều chuyển trong Chuyên đề 048 & Chẩn đoán D3.',
    explanation: 'IVT Pro phân biệt 3 hình thức điều chuyển: (1) Điều chuyển nội bộ: chỉ chuyển hàng, không ghi nhận công nợ (dùng cho các chi nhánh cùng hạch toán phụ thuộc); (2) Bán nội bộ: vừa chuyển hàng vừa tự động hạch toán công nợ nội bộ phải thu/phải trả (dùng cho chi nhánh độc lập, nhượng quyền); (3) Trả hàng nội bộ: điều chỉnh giảm công nợ khi trả lại hàng.'
  },
  {
    id: 'M2_06',
    role: 'manager',
    level: 2,
    zone: 'Trạm Giám Sát Hao Hụt - Đỉnh Đảo Bếp',
    ticketCode: 'MGR-L2-06',
    category: 'Báo cáo A08',
    title: 'Đọc và kiểm soát Tỷ lệ hao hụt trên Báo cáo A08',
    prompt: 'Khi xem Báo cáo A08 (Hao hụt nguyên vật liệu), quản lý thấy dòng nguyên liệu "Thịt thăn bò" hiển thị chênh lệch tỷ lệ màu đỏ (vượt hạn mức báo động). Bản chất công thức tính tỷ lệ hao hụt trên A08 lấy những số liệu nào?',
    options: [
      { id: 'A', text: 'Tử số là Tổng giá trị xuất kho mọi loại; Mẫu số là Giá trị hàng tồn đầu kỳ', isCorrect: false },
      { id: 'B', text: 'Tử số là Tổng giá trị hao hụt (chỉ gồm Xuất điều chỉnh kiểm kê thiếu và Xuất huỷ); Mẫu số là Tổng giá trị xuất kho mọi loại', isCorrect: true },
      { id: 'C', text: 'Tử số là Tổng tiền nhập mua; Mẫu số là Doanh thu bán hàng tại POS', isCorrect: false },
      { id: 'D', text: 'Tử số là Số lượng hàng lỗi; Mẫu số là Hạn mức hao hụt danh mục kho', isCorrect: false }
    ],
    hint: 'Chuyên đề 058 & Tài liệu 09 mục 10: Tử số chỉ gồm 2 loại chứng từ hao hụt thực sự, mẫu số là tổng xuất.',
    explanation: 'Công thức chuẩn của Báo cáo A08: Tỷ lệ hao hụt thực tế = (Tổng giá trị hao hụt / Tổng giá trị xuất kho) * 100%. Trong đó: Tử số CHỈ GỒM phiếu Xuất điều chỉnh kiểm kê (do kiểm kê thiếu) và phiếu Xuất huỷ bỏ; Mẫu số là Tổng giá trị của TẤT CẢ các phiếu xuất kho trong kỳ. Nếu tỷ lệ thực tế lớn hơn Hạn mức hao hụt khai trong Danh mục kho, hệ thống sẽ hiện cảnh báo Chênh lệch dương màu đỏ!'
  },

  // =========================================================================
  // LEVEL 2: ĐẢO BẾP TRUNG TÂM - ROLE: TECH (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'T2_01',
    role: 'tech',
    level: 2,
    zone: 'Trạm Kỹ Thuật Định Lượng Nâng Cao',
    ticketCode: 'TCK-L2-01',
    category: 'Cấu hình trừ kho 2 cấp',
    title: '3 Điều kiện bắt buộc để Trừ kho 2 cấp vận hành thành công',
    prompt: 'Một khách hàng chuỗi trà sữa phàn nàn: "Tôi đã nhờ tổng đài bật tính năng Trừ kho 2 cấp rồi, và đã khai công thức cho cả Cốt trà lẫn Trà sữa, nhưng khi bán Trà sữa trên POS thì Trà khô vẫn không hề suy giảm!". KTV kiểm tra ngay điều kiện thứ 3 còn thiếu là gì?',
    options: [
      { id: 'A', text: 'Chưa bật tính năng in hoá đơn VAT tại quầy thu ngân', isCorrect: false },
      { id: 'B', text: 'Mã hàng Bán thành phẩm (Cốt trà) vẫn đang BẬT "Theo dõi tồn kho" trong Danh mục hàng hoá', isCorrect: true },
      { id: 'C', text: 'Chưa tạo bảng giá bán sỉ cho chi nhánh', isCorrect: false },
      { id: 'D', text: 'Chưa cắm thẻ nhớ mở rộng vào máy POS', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 007 & Chẩn đoán A4: 3 điều kiện: Bật cấu hình -> Khai 2 BOM -> TẮT theo dõi tồn kho cho BTP.',
    explanation: '3 điều kiện bắt buộc của Trừ kho 2 cấp: (1) Bật cấu hình "Có sử dụng định lượng 2 cấp"; (2) Khai BOM đầy đủ cho cả BTP và món menu; (3) TẮT "Theo dõi tồn kho" cho BTP. Nếu BTP vẫn bật theo dõi tồn kho, hệ thống sẽ hiểu là khách muốn quản lý tồn kho BTP bằng quy trình chế biến thực tế, nên nó dừng lại ở lớp BTP và không tự động trừ nguyên liệu thô bên dưới.'
  },
  {
    id: 'T2_02',
    role: 'tech',
    level: 2,
    zone: 'Trạm Topping & Option Biến Thiên',
    ticketCode: 'TCK-L2-02',
    category: 'Định mức biến thiên',
    title: 'Quy tắc khai báo Số lượng biến thiên (Tăng/Giảm)',
    prompt: 'Khi cấu hình "Định mức biến thiên" cho món Trà Sữa khi khách chọn "Size L" (tăng thêm 10g bột sữa và giảm 5g đường cát so với Size M chuẩn), KTV phải nhập giá trị vào cột "Số lượng biến thiên" như thế nào?',
    options: [
      { id: 'A', text: 'Bột sữa nhập 10, Đường cát nhập 5', isCorrect: false },
      { id: 'B', text: 'Bột sữa nhập +10, Đường cát nhập -5 (tăng là số dương, giảm là số âm)', isCorrect: true },
      { id: 'C', text: 'Bột sữa nhập tổng lượng mới (ví dụ 40g), Đường cát nhập tổng lượng mới (15g)', isCorrect: false },
      { id: 'D', text: 'Không thể nhập số âm trên hệ thống IVT Pro', isCorrect: false }
    ],
    hint: 'Chuyên đề 008 & Chẩn đoán A5: Cột "Số lượng gốc" là cố định không sửa được; cột "Số lượng biến thiên" là phần chênh lệch tăng (+) hoặc giảm (-).',
    explanation: 'Trong màn hình Định mức biến thiên: Cột "Số lượng gốc" hiển thị định mức theo BOM chuẩn và bị khoá không sửa. Cột "Số lượng biến thiên" là phần tuỳ chỉnh delta: phần nguyên liệu tiêu hao thêm phải nhập số DƯƠNG (+), phần nguyên liệu giảm bớt đi bắt buộc phải nhập số ÂM (-). Nếu nhập nhầm dấu âm/dương sẽ làm sai lệch toàn bộ tồn kho thực tế khi khách order size/topping.'
  },
  {
    id: 'T2_03',
    role: 'tech',
    level: 2,
    zone: 'Phòng An Ninh Quản Lý Date & Lô',
    ticketCode: 'TCK-L2-03',
    category: 'Quản lý Lô & Hạn sử dụng',
    title: 'Ràng buộc Một đi không trở lại của Cấu hình Lô / Date',
    prompt: 'Chủ nhà hàng yêu cầu: "Bật cấu hình Quản lý theo Lô / Hạn sử dụng cho mặt hàng Sữa chua thử nghiệm vài hôm xem thế nào, nếu nhân viên lười nhập date thì tắt đi". Cảnh báo tối quan trọng nào KTV PHẢI thông báo rõ trước khi bật?',
    options: [
      { id: 'A', text: 'Khi bật cấu hình lô/date sẽ bị tính thêm phí bản quyền hàng tháng', isCorrect: false },
      { id: 'B', text: 'Một khi mặt hàng đã phát sinh tồn kho thì TUYỆT ĐỐI KHÔNG THỂ TẮT LẠI cấu hình Lô/Hạn sử dụng cho mặt hàng đó', isCorrect: true },
      { id: 'C', text: 'Phần mềm sẽ tự động xoá toàn bộ hoá đơn bán hàng cũ', isCorrect: false },
      { id: 'D', text: 'Chỉ áp dụng được cho các mặt hàng bán mang về', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 005 & Chẩn đoán F2: Ràng buộc sắt đá không thể hoàn tác của tính năng Lô/Hạn sử dụng.',
    explanation: 'Cẩm nang IVT Pro quy định rõ 3 ràng buộc sắt đá: (1) Chỉ khai báo được lô/date cho mặt hàng CHƯA PHÁT SINH tồn kho; (2) Mặt hàng ĐÃ PHÁT SINH TỒN KHO thì KHÔNG THỂ TẮT LẠI cấu hình này; (3) Mọi thao tác nhập - xuất - kiểm kê mặt hàng này sau đó đều BẮT BUỘC phải điền số lô và hạn sử dụng. Do đó KTV phải cảnh báo rất kỹ để tránh khách hàng bị kẹt quy trình.'
  },
  {
    id: 'T2_04',
    role: 'tech',
    level: 2,
    zone: 'Trạm Quản Trị Nhượng Quyền Chuỗi',
    ticketCode: 'TCK-L2-04',
    category: 'Cấu hình Nhượng quyền',
    title: 'Phân biệt 2 cấp độ Cấu hình Nhượng Quyền',
    prompt: 'Khách hàng là chủ thương hiệu phàn nàn: "Tại sao trên tài khoản công ty mẹ tôi hoàn toàn không xem được số liệu nguyên vật liệu và công nợ của các cơ sở nhượng quyền?". KTV cần kiểm tra cấu hình nhượng quyền đang ở mức nào?',
    options: [
      { id: 'A', text: 'Khách hàng đang ở mức "Có nhượng quyền thương hiệu" thông thường', isCorrect: false },
      { id: 'B', text: 'Khách hàng đang bị bật mức "Nhượng quyền vận hành tách biệt"', isCorrect: true },
      { id: 'C', text: 'Chi nhánh nhượng quyền chưa kết nối mạng internet', isCorrect: false },
      { id: 'D', text: 'Do máy chủ cloud iPOS bị quá tải vào giờ cao điểm', isCorrect: false }
    ],
    hint: 'Xem Tài liệu 09 mục 5.4: Nhượng quyền vận hành tách biệt khiến công ty không kiểm soát được kho và công nợ.',
    explanation: 'IVT Pro có 2 mức nhượng quyền: (1) "Có nhượng quyền thương hiệu": Công ty mẹ và điểm nhượng quyền vận hành chung cơ sở dữ liệu, công ty kiểm soát được tồn kho, mức dùng nguyên liệu và công nợ; (2) "Nhượng quyền vận hành tách biệt": Vận hành cô lập hoàn toàn, công ty mẹ KHÔNG THỂ xem hay kiểm soát nguyên vật liệu và công nợ của bên nhượng quyền. Ticket xảy ra do khách bị bật nhầm sang mức tách biệt.'
  },
  {
    id: 'T2_05',
    role: 'tech',
    level: 2,
    zone: 'Trạm Điều Phối Phiếu Nhập Xuất Chuỗi',
    ticketCode: 'TCK-L2-05',
    category: 'Cơ chế sinh phiếu điều chuyển',
    title: 'Cơ chế sinh phiếu Nhập điều chuyển tự động theo Đơn tham chiếu',
    prompt: 'Khi Kho tổng lưu phiếu "Xuất điều chuyển" hàng tới Cửa hàng số 2, cơ chế dữ liệu ngầm của IVT Pro sẽ thực hiện hành động gì tiếp theo?',
    options: [
      { id: 'A', text: 'Gửi email cảnh báo và đợi thủ kho Cửa hàng số 2 tạo mới phiếu Nhập bằng tay từ đầu', isCorrect: false },
      { id: 'B', text: 'Hệ thống tự động sinh một phiếu "Nhập điều chuyển" tương ứng tại Cửa hàng số 2 liên kết theo Mã tham chiếu', isCorrect: true },
      { id: 'C', text: 'Tự động trừ tiền trong tài khoản ngân hàng của Cửa hàng số 2', isCorrect: false },
      { id: 'D', text: 'Khoá sổ kiểm kê của cả 2 kho cho đến khi hàng đến nơi', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 048 & Chẩn đoán D3: Cơ chế tự động liên kết giữa Xuất điều chuyển và Nhập điều chuyển.',
    explanation: 'Trong cơ chế vận hành điều chuyển của IVT Pro: Ngay khi phiếu Xuất điều chuyển được lưu, hệ thống sẽ tự động sinh một phiếu Nhập điều chuyển tương ứng tại kho đích theo Đơn tham chiếu. Thủ kho bên nhận chỉ việc mở danh sách Nhập điều chuyển, bấm vào phiếu chờ và xác nhận số lượng thực nhận, không cần phải tạo lại phiếu từ đầu.'
  },
  {
    id: 'T2_06',
    role: 'tech',
    level: 2,
    zone: 'Nhịp Cầu Số 6 Đảo Bếp Trung Tâm',
    ticketCode: 'TCK-L2-06',
    category: 'Quy chuẩn chuyển tuyến Hotline',
    title: 'Các trường hợp BẮT BUỘC chuyển Kỹ thuật tổng đài (1900 4766 nhánh 3)',
    prompt: 'Theo tài liệu đào tạo triển khai IVT Pro, trường hợp nào sau đây nhân viên triển khai/support cơ bản KHÔNG ĐƯỢC tự ý thao tác mà phải chuyển lên bộ phận Kỹ thuật chuyên sâu (1900 4766 phím 3)?',
    options: [
      { id: 'A', text: 'Thay đổi mật khẩu người dùng hoặc in lại bảng kiểm kê kho', isCorrect: false },
      { id: 'B', text: 'Bật cấu hình Trừ kho 2 cấp, Định mức biến thiên, Quản lý Lô/Date, hoặc sửa cấu hình tính giá vốn nâng cao', isCorrect: true },
      { id: 'C', text: 'Lọc báo cáo A06 theo khoảng thời gian từ ngày 1 đến ngày 30', isCorrect: false },
      { id: 'D', text: 'Nhập thông tin nhà cung cấp mới vào danh mục', isCorrect: false }
    ],
    hint: 'Xem Tài liệu 09 mục 5 và Tài liệu 10 mục I: 4 cấu hình nâng cao cần liên hệ 1900 4766 nhánh 3.',
    explanation: 'Cẩm nang IVT Pro quy định rõ các cấu hình nâng cao có tác động sâu sắc đến toàn bộ logic tính toán và không thể đảo ngược (như Trừ kho 2 cấp, Định mức biến thiên, Quản lý theo Lô/Hạn sử dụng, Nhượng quyền tách biệt, hoặc sửa danh sách loại chứng từ tính giá vốn) đều bắt buộc phải chuyển lên Hotline Kỹ thuật chuyên sâu (1900 4766 phím 3) để thẩm định mô hình và trực tiếp bật cấu hình.'
  },

  // =========================================================================
  // LEVEL 3: THÁP CHẨN ĐOÁN TICKET - ROLE: MANAGER (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'M3_01',
    role: 'manager',
    level: 3,
    zone: 'Sảnh Tầng 1 Tháp Chẩn Đoán',
    ticketCode: 'MGR-L3-01',
    category: 'Bẫy huỷ phiếu kiểm kê',
    title: 'Thao tác ĐÚNG khi phát hiện Phiếu Kiểm Kê bị sai số',
    prompt: 'Cuối tháng quản lý lập phiếu kiểm kê kho và đã bấm lưu hoàn thành, nhưng sau đó phát hiện nhân viên đếm sót 1 bao đường. Để làm lại phiếu kiểm kê mới chuẩn xác mà số tồn hệ thống trên phiếu không bị lệch so với báo cáo, thứ tự thao tác ĐÚNG là gì?',
    options: [
      { id: 'A', text: 'Bấm "Sao chép" phiếu kiểm kê cũ ra phiếu mới -> rồi mới bấm "Huỷ" phiếu cũ', isCorrect: false },
      { id: 'B', text: 'Bấm "Huỷ" phiếu kiểm kê sai trước -> Tìm phiếu vừa huỷ trong danh sách -> Bấm "Sao chép lại" để sửa số', isCorrect: true },
      { id: 'C', text: 'Tạo một phiếu xuất bán lẻ khống để bù trừ lượng bao đường đếm sót', isCorrect: false },
      { id: 'D', text: 'Xoá cơ sở dữ liệu kho của tháng đó và làm lại từ đầu', isCorrect: false }
    ],
    hint: 'Xem Chẩn đoán C1: Đây là lỗi thao tác kinh điển nhất. Sao chép trước hay Huỷ trước?',
    explanation: 'Lỗi thao tác kinh điển: Nếu bấm Sao chép trước khi Huỷ, phiếu mới sẽ lấy số tồn hệ thống tại thời điểm phiếu cũ còn hiệu lực (tồn đã bị điều chỉnh sai). Thứ tự CHUẨN XÁC: Huỷ phiếu kiểm kê sai trước (để hệ thống hoàn lại số tồn nguyên trạng ban đầu) -> Lọc phiếu ở trạng thái Đã huỷ -> Bấm Sao chép -> Sửa lại số lượng thực tế chính xác -> Lưu phiếu.'
  },
  {
    id: 'M3_02',
    role: 'manager',
    level: 3,
    zone: 'Phòng Giám Sát Thời Gian Kiểm Kê',
    ticketCode: 'MGR-L3-02',
    category: 'Thời gian ghi nhận kiểm kê',
    title: 'Cơ chế chốt số tồn khi kiểm kê lùi ngày quá khứ',
    prompt: 'Hôm nay là ngày 02/10, quản lý mở IVT Pro tạo phiếu kiểm kê lùi ngày cho ngày 30/09 (ngày cuối tháng trước). Hệ thống sẽ chốt số tồn lý thuyết đến thời điểm nào của ngày 30/09?',
    options: [
      { id: 'A', text: '00h00 sáng ngày 30/09', isCorrect: false },
      { id: 'B', text: '12h00 trưa ngày 30/09', isCorrect: false },
      { id: 'C', text: '23h59 đêm ngày 30/09 (bao gồm toàn bộ phát sinh nhập xuất trong ngày 30/09)', isCorrect: true },
      { id: 'D', text: 'Đúng giờ tạo phiếu của ngày 02/10', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 053 & Chẩn đoán C2: Cơ chế ghi nhận thời gian khi kiểm kê thời gian thực vs lùi ngày quá khứ.',
    explanation: 'Quy tắc của IVT Pro: Khi kiểm kê thời gian thực, hệ thống chốt tồn đến đúng phút thao tác. Khi kiểm kê lùi ngày quá khứ (ví dụ ngày 30/09), hệ thống sẽ MẶC ĐỊNH chốt tồn đến 23h59 ngày đó (nghĩa là đã bao gồm toàn bộ các hoá đơn bán và phiếu nhập xuất phát sinh trong cả ngày hôm đó). Hiểu điều này giúp quản lý không bị hoang mang khi đối chiếu số liệu.'
  },
  {
    id: 'M3_03',
    role: 'manager',
    level: 3,
    zone: 'Phòng Thu Ngân & Công Nợ Nhà Cung Cấp',
    ticketCode: 'MGR-L3-03',
    category: 'Thanh toán công nợ NCC',
    title: 'Thanh toán từng hoá đơn vs Thanh toán vo (không theo hoá đơn)',
    prompt: 'Quán đang nợ Nhà cung cấp rau củ quả 3 hoá đơn: HĐ 1 (tháng trước): 2 triệu; HĐ 2 (tuần trước): 3 triệu; HĐ 3 (hôm qua): 5 triệu. Thủ quỹ chuyển khoản 4 triệu và chọn hình thức "Thanh toán vo" (điền vào ô Tổng tiền thanh toán). Hệ thống IVT Pro sẽ cấn trừ công nợ như thế nào?',
    options: [
      { id: 'A', text: 'Trừ toàn bộ 4 triệu vào HĐ 3 gần nhất', isCorrect: false },
      { id: 'B', text: 'Chia đều 4 triệu cho cả 3 hoá đơn', isCorrect: false },
      { id: 'C', text: 'Tự động phân bổ ưu tiên nợ cũ: Trả hết 2 triệu của HĐ 1, và trả 2 triệu vào HĐ 2 (HĐ 2 còn nợ 1 triệu, HĐ 3 còn nguyên 5 triệu)', isCorrect: true },
      { id: 'D', text: 'Báo lỗi và từ chối xử lý khoản tiền thanh toán', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 051 & Chẩn đoán E1: Cơ chế phân bổ nợ cũ khi thanh toán vo.',
    explanation: 'Khi sử dụng hình thức "Thanh toán vo" (không chỉ định hoá đơn), IVT Pro áp dụng cơ chế FIFO công nợ: ưu tiên cấn trừ từ hoá đơn xa nhất đến gần nhất. Nếu chủ quán muốn trả đích danh cho hoá đơn số 3 thì BẮT BUỘC phải chọn hình thức "Thanh toán theo từng hoá đơn" và nhập số tiền vào dòng của hoá đơn số 3.'
  },
  {
    id: 'M3_04',
    role: 'manager',
    level: 3,
    zone: 'Trạm Quản Trị Tài Sản & CCDC',
    ticketCode: 'MGR-L3-04',
    category: 'Tình trạng hàng hoá',
    title: 'Quản trị tình trạng tồn kho Công Cụ Dụng Cụ (CCDC)',
    prompt: 'Trong kho tồn 10 chiếc máy tính bảng cầm tay order, quản lý muốn ghi nhận chi tiết: 5 chiếc đang dùng tốt ở quầy bar, 3 chiếc hư màn hình chờ bảo hành, 2 chiếc hỏng hoàn toàn chờ thanh lý. Tính năng "Tình trạng hàng hoá" trên IVT Pro đáp ứng nghiệp vụ này như thế nào?',
    options: [
      { id: 'A', text: 'Áp dụng được cho tất cả các loại hàng hoá từ thịt thăn bò đến trà sữa', isCorrect: false },
      { id: 'B', text: 'Tính năng này chỉ áp dụng cho hàng hoá thuộc Loại "Khác (Công cụ dụng cụ)" và hiển thị tình trạng khi rê chuột vào mã trên Báo cáo A06', isCorrect: true },
      { id: 'C', text: 'Phải tạo ra 3 mã hàng hoá khác nhau trên danh mục', isCorrect: false },
      { id: 'D', text: 'Bắt buộc phải kết nối với phần mềm kế toán bên ngoài', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 055 & Chẩn đoán G2: Phạm vi áp dụng của tính năng Tình trạng hàng hoá.',
    explanation: 'Tính năng `Kiểm kê -> Tình trạng hàng hoá` được thiết kế đặc thù dành riêng cho hàng hoá thuộc Loại "Khác (Công cụ dụng cụ)". Người dùng khai báo số lượng gắn với từng Lý do/Tình trạng (ví dụ hư hỏng, đang bảo trì, vị trí sử dụng). Khi xem Báo cáo A06 Xuất nhập tồn, chỉ cần rê chuột vào mã hàng là xem được chi tiết hiện trạng tài sản.'
  },
  {
    id: 'M3_05',
    role: 'manager',
    level: 3,
    zone: 'Đài Quan Sát Nhịp Công Việc Cuối Kỳ',
    ticketCode: 'MGR-L3-05',
    category: 'Quy trình chuẩn cuối kỳ',
    title: 'Thứ tự 3 bước chuẩn mực khi đóng kỳ kế toán kho cuối tháng',
    prompt: 'Để có được báo cáo doanh thu, chi phí giá vốn và tồn kho chính xác nhất vào ngày cuối tháng, người quản lý kho F&B cần tuân thủ nghiêm ngặt trình tự các bước nào sau đây?',
    options: [
      { id: 'A', text: 'Tính giá vốn -> Xuất bán POS -> Kiểm kê kho thực tế', isCorrect: false },
      { id: 'B', text: 'Bước 1: Hoàn tất toàn bộ chứng từ nhập/xuất/huỷ trong kỳ -> Bước 2: Kiểm kê và nhập tồn kho thực tế -> Bước 3: Chạy Tiện ích tính giá vốn', isCorrect: true },
      { id: 'C', text: 'Khoá sổ kỳ -> Huỷ toàn bộ hoá đơn chưa khớp -> In báo cáo A06', isCorrect: false },
      { id: 'D', text: 'Kiểm kê thực tế -> Khoá sổ -> Bỏ qua bước tính giá vốn nếu không có nguyên liệu mới', isCorrect: false }
    ],
    hint: 'Xem Tài liệu 09 mục 8 & Tài liệu 10 mục C4: Nhịp công việc chuẩn cuối kỳ.',
    explanation: 'Trình tự đóng kỳ bất di bất dịch: (1) Rà soát nhập đủ mọi chứng từ nhập mua, xuất chuyển, xuất huỷ; (2) Thực hiện kiểm kê thực tế và lưu phiếu kiểm kê để cân đối chênh lệch; (3) Chạy "Tính giá vốn" để hệ thống tính giá bình quân và áp ngược đơn giá vào toàn bộ các phiếu xuất kho trong tháng. Nếu làm sai thứ tự (chạy giá vốn trước khi kiểm kê), toàn bộ giá trị phiếu xuất điều chỉnh kiểm kê sẽ bị sai hoặc bằng 0.'
  },
  {
    id: 'M3_06',
    role: 'manager',
    level: 3,
    zone: 'Đỉnh Tháp Chẩn Đoán - Đài Danh Dự Quản Trị',
    ticketCode: 'MGR-L3-06',
    category: 'Tối ưu hóa Chi phí F&B',
    title: 'Báo cáo A06 và ma trận phát hiện thất thoát F&B',
    prompt: 'Khi phát hiện tỷ lệ cost thực tế vọt lên 42% trong khi định mức chuẩn chỉ cho phép 32%, chủ quán kết hợp Báo cáo A06 (Xuất nhập tồn), Thẻ kho và Báo cáo A08 như thế nào để khoanh vùng thủ phạm thất thoát nhanh nhất?',
    options: [
      { id: 'A', text: 'Chỉ cần giảm lương nhân viên pha chế và đổi sang nhà cung cấp giá rẻ hơn', isCorrect: false },
      { id: 'B', text: 'Kiểm tra A08 xem có vượt hạn mức xuất huỷ/kiểm kê thiếu không; nếu A08 bình thường thì vào A06 mở Thẻ kho xem các món xuất bán POS có bị âm kho do pha vượt định lượng BOM không', isCorrect: true },
      { id: 'C', text: 'Xoá bỏ toàn bộ công thức chế biến để nhân viên tự do định lượng', isCorrect: false },
      { id: 'D', text: 'Dừng bán hàng tại chỗ và chỉ bán mang đi', isCorrect: false }
    ],
    hint: 'Phối hợp giữa A08 (thất thoát hữu hình do hủy/thiếu) và A06/Thẻ kho (thất thoát vô hình do hao hụt pha chế/sai BOM).',
    explanation: 'Chiến lược kiểm soát cost F&B đỉnh cao: A08 phản ánh thất thoát "hữu hình" (hàng hỏng, đổ vỡ, kiểm kê thiếu). Nếu A08 không tăng đột biến mà cost vẫn cao ngất, thủ phạm nằm ở thất thoát "vô hình" trong quá trình pha chế/chế biến (nhân viên múc quá tay, gian lận làm đồ cho bạn bè, hoặc BOM khai thiếu so với thực tế). Mở Thẻ kho trên A06 sẽ thấy lượng xuất bán thực tế tiêu hao nhanh bất thường so với lượng nhập.'
  },

  // =========================================================================
  // LEVEL 3: THÁP CHẨN ĐOÁN TICKET - ROLE: TECH (6 CÂU - TƯƠNG ỨNG 6 NHỊP CẦU)
  // =========================================================================
  {
    id: 'T3_01',
    role: 'tech',
    level: 3,
    zone: 'Trạm Cứu Hộ Dữ Liệu Giá Vốn',
    ticketCode: 'TCK-L3-01',
    category: 'Lỗi giá vốn bằng 0 / âm',
    title: 'Hiện tượng Giá vốn bằng 0 hoặc âm do Xuất bán âm trước Nhập sau',
    prompt: 'Nhà hàng khai trương bán hàng tấp nập trong tuần đầu nhưng nhân viên chưa kịp nhập hoá đơn mua hàng vào phần mềm (kho bị âm). Đến cuối tuần mới tạo dồn phiếu Nhập mua, sau đó chạy Tính giá vốn thì thấy một loạt phiếu xuất có Đơn giá vốn = 0 hoặc Giá trị tồn kho bị âm bất thường. Bản chất hiện tượng này là gì?',
    options: [
      { id: 'A', text: 'Lỗi phần mềm do phiên bản iPOS bị nhiễm virus', isCorrect: false },
      { id: 'B', text: 'Do xuất bán trước khi có tồn kho (bán âm), hệ thống tại thời điểm xuất không có đơn giá nhập để tính giá bình quân gia quyền', isCorrect: true },
      { id: 'C', text: 'Do máy POS in hoá đơn với phông chữ không được hỗ trợ', isCorrect: false },
      { id: 'D', text: 'Do chưa thanh toán tiền điện cho nhà hàng', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 056 & 102: Logic tính giá vốn bình quân đòi hỏi tồn đầu kỳ + nhập trong kỳ trước khi phát sinh xuất.',
    explanation: 'Bản chất phương pháp Giá bình quân trong IVT Pro: Đơn giá vốn bình quân = (Giá trị tồn đầu + Giá trị nhập) / (Số lượng tồn đầu + Số lượng nhập). Khi bán âm kho (xuất kho trước khi có phiếu nhập), tại thời điểm phát sinh xuất, hệ thống không có giá trị cơ sở để tính nên giá vốn tạm tính là 0. Khi bổ sung phiếu nhập sau, nếu không chạy lại tiện ích "Tính giá vốn" cho toàn bộ kỳ, hoặc khi tồn kho bị âm lũy kế kéo dài, giá trị tồn có thể bị biến dạng méo mó.'
  },
  {
    id: 'T3_02',
    role: 'tech',
    level: 3,
    zone: 'Phòng Phẫu Thuật Dữ Liệu Quá Khứ',
    ticketCode: 'TCK-L3-02',
    category: 'Điều chỉnh giá trị tồn kho',
    title: '4 Ràng buộc thép khi dùng tính năng Điều chỉnh giá trị tồn kho',
    prompt: 'Khi hướng dẫn khách hàng dùng tính năng `Menu -> Kiểm kê -> Điều chỉnh giá trị tồn kho` để nắn lại giá vốn bị sai luỹ kế từ các tháng trước, ràng buộc nào sau đây là BẮT BUỘC KTV phải nhấn mạnh để tránh khiếu nại?',
    options: [
      { id: 'A', text: 'Chỉ điều chỉnh được cho kỳ tương lai', isCorrect: false },
      { id: 'B', text: 'Sau khi điều chỉnh, hệ thống sẽ KHOÁ toàn bộ dữ liệu từ thời điểm điều chỉnh trở về trước và không thể tự ý sửa phiếu cũ', isCorrect: true },
      { id: 'C', text: 'Cột Hệ thống có thể tuỳ ý chỉnh sửa số lượng tồn bất kỳ lúc nào', isCorrect: false },
      { id: 'D', text: 'Không cần phải chạy lại tính giá vốn cho tháng sau', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 054 & Chẩn đoán B3: 4 ràng buộc của Điều chỉnh giá trị tồn kho (Khóa dữ liệu, chỉ chọn kỳ quá khứ...).',
    explanation: 'Cẩm nang IVT Pro liệt kê 4 ràng buộc sống còn của Điều chỉnh giá trị tồn kho: (1) Chỉ chọn được kỳ quá khứ (mặc định chốt 23h59 ngày cuối kỳ); (2) Cột "Hệ thống" KHÔNG THỂ SỬA được (phải kiểm kê chốt số lượng trước); (3) Sau khi lưu, hệ thống KHOÁ DỮ LIỆU từ thời điểm đó trở về trước (không thể can thiệp phiếu cũ bằng cách thông thường); (4) Sau khi điều chỉnh, BẮT BUỘC PHẢI CHẠY TÍNH GIÁ VỐN LẠI CHO THÁNG SAU để giá mới được áp dụng.'
  },
  {
    id: 'T3_03',
    role: 'tech',
    level: 3,
    zone: 'Cổng Nâng Cấp Phiên Bản V1 -> Pro',
    ticketCode: 'TCK-L3-03',
    category: 'Migration V1 lên Pro',
    title: 'Xử lý khiếu nại sai đơn giá sau khi nâng cấp từ IVT V1 lên Pro',
    prompt: 'Ngay sau khi nâng cấp cửa hàng từ IVT V1 lên IVT Pro (V2), chủ nhà hàng gọi điện gay gắt: "Kỹ thuật làm ăn kiểu gì mà nâng cấp xong giá vốn một loạt mặt hàng của tôi bị thay đổi khác hẳn lúc trước!". KTV giải thích và xử lý thế nào cho đúng chuẩn nghiệp vụ?',
    options: [
      { id: 'A', text: 'Thừa nhận phần mềm bị lỗi và cài lại bản V1 cho khách dùng tiếp', isCorrect: false },
      { id: 'B', text: 'Giải thích đây là thay đổi dự kiến vì V1 tính giá theo "Giá nhập gần nhất" còn Pro tính theo "Giá bình quân"; sau đó hướng dẫn khách dùng công cụ "Điều chỉnh giá trị tồn kho" để chuẩn hoá lại đơn giá', isCorrect: true },
      { id: 'C', text: 'Đề nghị khách xoá toàn bộ dữ liệu kinh doanh cũ đi', isCorrect: false },
      { id: 'D', text: 'Báo khách liên hệ sang tổng đài của bên thứ ba', isCorrect: false }
    ],
    hint: 'Xem Tài liệu 09 mục 1 & Tài liệu 10 mục H1, H2: Khác biệt cốt lõi về phương pháp tính giá giữa V1 và V2.',
    explanation: 'Đây là tình huống kinh điển khi triển khai: V1 tính giá vốn theo "Giá nhập gần nhất" (Last Purchase Price), còn IVT Pro (V2) chuyển sang phương pháp chuẩn quốc tế là "Giá bình quân gia quyền". Do đó, việc lệch đơn giá là hiện tượng hoàn toàn dự kiến. KTV giải thích rõ ràng nguyên lý cho khách, và dùng tiện ích `Kiểm kê -> Điều chỉnh giá trị tồn kho` để cập nhật lại giá vốn kỳ đầu theo bảng giá chuẩn hoặc giá nhập cuối. Nhắc khách rằng V1 đã chính thức ngừng hỗ trợ từ 01/04/2025.'
  },
  {
    id: 'T3_04',
    role: 'tech',
    level: 3,
    zone: 'Trạm Tích Hợp AMIS Kế Toán Doanh Nghiệp',
    ticketCode: 'TCK-L3-04',
    category: 'Kết nối hệ thống bên ngoài',
    title: 'Đồng bộ IVT Pro với AMIS Kế Toán Doanh Nghiệp',
    prompt: 'Khi thiết lập đồng bộ dữ liệu giữa IVT Pro và phần mềm Kế toán AMIS (Chuyên đề 089), điều kiện tiên quyết nào trong Danh mục hàng hoá và Danh mục kho phải được thoả mãn để dữ liệu chứng từ không bị từ chối?',
    options: [
      { id: 'A', text: 'Mã hàng hoá và Mã kho trên IVT Pro phải trùng khớp hoàn toàn với Mã vật tư và Mã kho trên hệ thống kế toán AMIS', isCorrect: true },
      { id: 'B', text: 'Mọi mặt hàng phải có ảnh chụp màu dung lượng trên 5MB', isCorrect: false },
      { id: 'C', text: 'Tất cả nhân viên phải có chứng chỉ kế toán trưởng', isCorrect: false },
      { id: 'D', text: 'Phải dùng chung một máy tính cài đặt cả 2 phần mềm', isCorrect: false }
    ],
    hint: 'Xem Chuyên đề 089: Quy tắc mapping danh mục giữa IVT và AMIS.',
    explanation: 'Để tích hợp tự động mượt mà giữa IVT Pro và AMIS Kế toán doanh nghiệp, nguyên tắc mapping dữ liệu bất di bất dịch là: Mã hàng hoá (hoặc Mã kế toán khai báo trong chi tiết hàng hoá) và Mã kho trên IVT Pro phải khớp chính xác 1-1 với Mã vật tư hàng hoá và Mã kho đã tạo trên AMIS. Nếu lệch mã, API đồng bộ chứng từ nhập/xuất sẽ bị từ chối với lỗi không tìm thấy đối tượng.'
  },
  {
    id: 'T3_05',
    role: 'tech',
    level: 3,
    zone: 'Trung Tâm Cấu Hình Tính Giá Vốn Nâng Cao',
    ticketCode: 'TCK-L3-05',
    category: 'Cấu hình tính giá vốn',
    title: 'Cấu hình Danh sách chứng từ loại trừ khi chạy tính giá vốn',
    prompt: 'Trong màn hình `Cấu hình tính giá vốn` (Menu -> Giá vốn -> Cấu hình), cẩm nang triển khai nhấn mạnh điều gì đối với 2 tuỳ chọn: "Danh sách loại chứng từ nhập áp giá" và "Danh sách loại chứng từ xuất không áp giá"?',
    options: [
      { id: 'A', text: 'KTV nên tự do thêm bớt chứng từ theo sở thích của từng chủ quán', isCorrect: false },
      { id: 'B', text: 'Ưu tiên GIỮ NGUYÊN MẶC ĐỊNH sẵn có vì công thức tính giá vốn đã được tối ưu loại trừ các chứng từ đặc thù; chỉ thay đổi khi có chỉ định từ cấp Kỹ thuật R&D', isCorrect: true },
      { id: 'C', text: 'Bắt buộc phải bỏ hết tất cả các loại chứng từ để chạy cho nhanh', isCorrect: false },
      { id: 'D', text: 'Phải tích chọn toàn bộ tất cả các loại chứng từ nhập xuất', isCorrect: false }
    ],
    hint: 'Xem Tài liệu 09 mục 5 và Tài liệu 10 mục B2: "Ưu tiên giữ nguyên mặc định sẵn có".',
    explanation: 'Cẩm nang ghi rõ: Các cài đặt ban đầu của IVT Pro về "Danh sách loại chứng từ nhập áp giá" và "Danh sách loại chứng từ xuất không áp giá" (ví dụ Xuất sơ chế, Xuất trả lại) đã được thiết kế chuẩn mực phù hợp với quy luật giá bình quân. Cẩm nang khuyến cáo "Ưu tiên giữ nguyên mặc định sẵn có". KTV không tự ý chỉnh sửa trừ phi có trường hợp ngoại lệ được bộ phận R&D / Hotline 1900 4766 nhánh 3 phê duyệt.'
  },
  {
    id: 'T3_06',
    role: 'tech',
    level: 3,
    zone: 'Đỉnh Tháp Chẩn Đoán - Nhịp Cầu Số 6 Tuyệt Đỉnh',
    ticketCode: 'TCK-L3-06',
    category: 'Tư duy Cứu Hộ Ticket Hệ Thống',
    title: 'Tư duy chẩn đoán hệ thống IVT Pro cấp Master',
    prompt: 'Khi tiếp nhận một ca ticket phức tạp: "Báo cáo A06 bị lệch số lượng, giá vốn âm, hoá đơn tab Chưa đồng bộ báo lỗi đỏ rực", một Kỹ sư Triển khai / Support Master sẽ tuần tự giải quyết theo chuỗi tư duy nào?',
    options: [
      { id: 'A', text: 'Báo khách cài lại hệ điều hành Windows và mua máy chủ mới', isCorrect: false },
      { id: 'B', text: '(1) Đọc cột Lý do lỗi tại Xuất bán POS -> (2) Kiểm tra Thẻ kho trên A06 tìm phiếu sai ĐVT/đơn giá -> (3) Xử lý chốt kiểm kê huỷ đúng thứ tự -> (4) Chạy lại Tính giá vốn', isCorrect: true },
      { id: 'C', text: 'Chạy ngay Tiện ích tính giá vốn 10 lần liên tục mà không cần sửa chứng từ', isCorrect: false },
      { id: 'D', text: 'Huỷ toàn bộ cơ sở dữ liệu và bảo khách nhập lại từ đầu tháng', isCorrect: false }
    ],
    hint: 'Toàn bộ tinh hoa của 3 tài liệu cẩm nang IVT kết tinh trong chuỗi 4 bước logic không nhảy cóc này!',
    explanation: 'Tư duy chuẩn Master IVT: Không bao giờ phỏng đoán mò mẫm. Bước 1: Mở `Xuất bán POS -> Chưa đồng bộ` để phần mềm tự chỉ ra lý do lỗi hoá đơn; Bước 2: Vào `A06 -> Thẻ kho` để phát hiện các phiếu sai ĐVT quy đổi hoặc gõ nhầm đơn giá; Bước 3: Sửa hoặc huỷ chứng từ sai theo đúng quy trình chuẩn (huỷ trước - sao chép sau); Bước 4: Sau khi dữ liệu thô đã sạch, chạy "Tính giá vốn" để tái lập giá trị chuẩn cho toàn bộ hệ thống.'
  }
];

const outputPath = path.resolve('d:/trum/ivt-3d-adventure/src/data/questions-ivt.json');
fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`Đã xuất thành công ${questions.length} câu hỏi vào: ${outputPath}`);
