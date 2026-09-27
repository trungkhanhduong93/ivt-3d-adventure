# 🎮 IVT 3D Adventure - iPOS Warehouse & Technical RPG

Game RPG 3D mô phỏng thực tế ảo huấn luyện chuyên sâu nghiệp vụ Quản lý Kho & Kỹ thuật triển khai **iPOS IVT Pro** dành cho ngành F&B.

---

## 🌟 Điểm Nổi Bật & Tính Năng UI/UX

1. **Phong Cách Modern F&B Glassmorphism Studio**:
   - Giao diện kính mờ sang trọng (`backdrop-filter: blur(16px)`), viền phản quang mỏng nhẹ, hiệu ứng ánh sáng neon hiện đại.
   - Typography cao cấp: Google Fonts `Baloo 2` (tiêu đề thân thiện F&B), `Outfit` (nội dung thanh lịch), `Space Grotesk` (chỉ số kỹ thuật & mã Ticket).

2. **Dual Perspective Selector (Hai Góc Nhìn & Chủ Đề Song Hành)**:
   - ☕ **Role Chủ Quán / Quản Lý Kho F&B (`role-manager`)**:
     - Tông màu: *Emerald Green, Warm Amber & Cà phê rang xay*.
     - Nghiệp vụ: Cấu hình BOM định lượng, Bán thành phẩm, Cân đối giá vốn bình quân liên hoàn, Kiểm kê thực tế và báo cáo Food Cost.
   - 💻 **Role Kỹ Thuật Viên Triển Khai iPOS (`role-tech`)**:
     - Tông màu: *Cyber Navy, Electric Blue & Hologram Cyan*.
     - Kỹ thuật: Chẩn đoán iPOS Sync Service, Xử lý Deadlock SQL Server, Recalculate giá vốn lùi ngày, Phân quyền Role-based, và Mapping API Delivery.

3. **Top HUD Tinh Tế & Thông Minh**:
   - Level Badge & Chức danh nghiệp vụ động theo cấp bậc.
   - Thanh EXP chuyển màu gradient mượt mà với hiệu ứng thăng cấp.
   - Tiến độ **Cầu Dữ Liệu IVT** (0/6 Nhịp) kết nối sang Đảo Máy Chủ Đám Mây.
   - Nút bật/tắt âm thanh (Web Audio API Synthesizer), Đổi vai trò tức thời (Phím Tab), Cẩm nang hướng dẫn (Phím H).
   - **Radar Minimap Bo Tròn**: Quét radar thời gian thực, hiển thị hướng nhân vật, vị trí NPC và các kiện hàng cần thu thập.

4. **RPG Dialogue & Ticket Challenge Modal (Thẻ Bài Nghiệp Vụ)**:
   - Avatar 3D động của các NPC: **Milo Thủ Kho**, **Chef John Bếp Trưởng**, **Support Master Kỹ Sư iPOS**.
   - Thẻ bài Ticket hiển thị Mã Ticket, Tag phân loại (`[BOM ĐỊNH LƯỢNG]`, `[GIÁ VỐN]`, `[KIỂM KÊ]`, `[CSDL SQL]`, `[API DELIVERY]`).
   - 4 phương án chọn tương tác với phím tắt nhanh `1`, `2`, `3`, `4`.
   - Khu vực Gợi ý (Hint) mở rộng và Phân tích chuyên sâu (Explanation) từ chuyên gia iPOS sau khi giải quyết tình huống.

5. **Tối Ưu Hoàn Hảo Cho Điện Thoại & Máy Tính Bảng (Mobile & Tablet Ergonomics)**:
   - **Virtual Joystick 360°**: Cần gạt ảo công thái học ở góc trái dưới, phản hồi chạm mượt mà.
   - **Nút Hành Động Tròn (Action Button)**: Nút tương tác to nổi bật ở góc phải dưới với biểu tượng bàn tay phát sáng.
   - Tự động phát hiện màn hình cảm ứng / thiết bị di động để bật Touch Controls.
   - Chống vỡ layout, hỗ trợ cả chiều dọc và ngang (Landscape / Portrait).

6. **Web Audio API Không Phụ Thuộc File Ngoài**:
   - Âm thanh được tổng hợp trực tiếp bằng Web Audio API (Footsteps, UI click, Correct chord, Error buzz, Plank placement chime, Level up fanfare).

---

## 🚀 Khởi Chạy Dự Án

### 1. Chạy trên môi trường Dev (Local):
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

### 2. Đóng gói Production (Build):
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo sẵn sàng deploy.

### 3. Deploy 1-Click Lên Vercel:
Dự án đã được cấu hình sẵn file `vercel.json` và `vite.config.js`:
- Đẩy source code lên GitHub / GitLab.
- Kết nối kho mã nguồn với Vercel. Vercel sẽ tự nhận diện Vite framework và deploy trong vài giây!

---

## ⌨️ Phím Tắt Điều Khiển (Desktop):
- `W`, `A`, `S`, `D` hoặc `Phím Mũi Tên`: Di chuyển nhân vật 3D.
- `E` hoặc `Space`: Tương tác NPC / Nhặt thùng hàng nguyên liệu.
- `1`, `2`, `3`, `4`: Chọn phương án trả lời trong Ticket.
- `Tab`: Đổi góc nhìn Chủ Quán ⇄ Kỹ Thuật Viên.
- `M`: Bật / Tắt âm thanh.
- `H`: Mở cẩm nang hướng dẫn.
- `Esc`: Đóng các cửa sổ Popup đang mở.
- `Kéo chuột trên màn hình 3D`: Xoay góc nhìn camera quanh nhân vật.
