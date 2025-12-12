Ứng dụng khách hàng (Mobile App – bắt buộc tải)
Flow: Vào bàn → quét QR → app mở màn hình bàn đó → xem menu → đặt món.
Nhóm chức năng cơ bản:
1.	Đăng ký / đăng nhập
o	Đăng nhập bằng SĐT hoặc email (tùy em chọn), Google.
o	Hoặc cho phép dùng “guest mode” nhưng vẫn phải tải app.
2.	Quét QR & gán bàn
o	Camera quét mã QR trên bàn.
o	QR chứa table_id hoặc token → app gọi API để “join” bàn đó.
o	Check:
	Bàn đang mở bill hay chưa?
	Có cho phép nhiều khách cùng 1 bàn đặt trên nhiều máy không?
3.	Xem menu số (Digital Menu)
o	Danh sách category: Món chính, Món phụ, Đồ uống, Combo…
o	Chi tiết món:
	Tên, mô tả, hình ảnh, giá, đơn vị (đĩa, ly…)
	Topping / lựa chọn thêm (size, đá, đường, thêm phô mai…)
	Tình trạng: còn / hết / tạm ngưng
o	Bộ lọc & sort:
	lọc theo loại món, giá, món bán chạy, món mới.
4.	Đặt món (Ordering)
o	Chọn món → chọn số lượng → chọn topping → ghi chú (ví dụ: “ít cay”, “ít đá”).
o	Thêm vào giỏ hàng (cart).
o	Xem giỏ: danh sách món + số lượng + tổng tiền.
o	Chỉnh sửa giỏ: tăng/giảm số lượng, xóa món, sửa ghi chú.
5.	Gửi đơn & xem trạng thái đơn
o	Bấm “Gửi order” → hệ thống tạo Order gắn với table_id.
o	Trạng thái có thể là:
	Đã gửi / Chờ xác nhận
	Đang chuẩn bị
	Đã xong (có thể thêm “đang phục vụ”)
o	App hiển thị timeline / list món kèm trạng thái.
6.	Thanh toán
o	Hai phương án:
	Thanh toán sau: Khách ăn xong → gọi thanh toán, nhân viên in bill → thanh toán tiền mặt/QR banking.
	Thanh toán trong app: tích hợp cổng thanh toán (QRcode của VietQR hỗ trợ tạo qrcode thanh toán free + API SeePay xử lý kiểm tra lịch sử thanh toán).
o	Lịch sử hóa đơn (cho khách đã đăng nhập).
7.	Đánh giá & phản hồi (Review – chưa dùng AI)
o	Khách chấm sao (1–5) cho:
	Chất lượng món
	Thái độ phục vụ
	Không gian nhà hàng
o	Nhập text review tự do.
o	Hệ thống chỉ lưu raw data, chưa có AI phân tích (sẽ dùng sau).
8.	Thông báo (Notification)
o	Push khi:
	Order được xác nhận
	Order chuẩn bị xong
	Có khuyến mãi dành cho khách đó (optional)
________________________________________
3.2. Ứng dụng nhân viên (Staff App / Web)
Đây là “bộ não” cho front-of-house (phục vụ & thu ngân).
1.	Đăng nhập nhân viên
o	Tài khoản phân quyền: phục vụ, thu ngân, quản lý ca.
o	Thông tin ca làm (ca sáng/chiều/tối).
2.	Quản lý bàn (Table Management)
o	Sơ đồ bàn (table map) hoặc danh sách bàn.
o	Trạng thái:
	Trống
	Có khách / đang dùng
	Đợi dọn
o	Gộp bàn, tách bàn (optional, nếu muốn chi tiết).
3.	Nhận & xử lý đơn (Order Management)
o	Danh sách order realtime (socket/WebSocket, polling…):
	Bàn số mấy, khách đặt lúc mấy giờ, tổng tiền.
o	Nhân viên xác nhận:
	Xem chi tiết món
	Sửa một chút theo đề nghị (nếu gọi điện cho khách)
	Bấm “Gửi bếp” / “Xác nhận”.
o	In phiếu bếp (nếu vẫn dùng giấy song song).
4.	Quy trình phục vụ
o	Ghi nhận:
	Món đã được mang ra bàn nào.
	Món bị hủy / đổi món.
o	Ghi chú sự cố (món bị trả lại, v.v. – sau này AI sentiment có thể dùng).
5.	Thanh toán & xuất hóa đơn
o	Xem bill của từng bàn.
o	Giảm giá / voucher / service charge.
o	In hóa đơn VAT (tùy tích hợp).
o	Ghi nhận phương thức thanh toán (tiền mặt, QR, thẻ).
________________________________________
3.3. Màn hình bếp (Kitchen Display System – KDS)
Ngay cả không có AI, KDS vẫn là một module “xịn” để tối ưu bếp.
1.	Nhận đơn món theo thời gian thực
o	Mỗi order đi vào queue:
	Bàn số, giờ order, danh sách món + số lượng + ghi chú.
o	Ưu tiên theo:
	Thời gian đặt
	Loại món (món lâu làm trước…)
2.	Quản lý trạng thái món
o	Các trạng thái: Chưa làm → Đang làm → Đã xong.
o	Đầu bếp thao tác trên màn hình (touch) hoặc dùng nút bấm.
3.	Hiển thị thông tin hỗ trợ
o	Thời gian đã trôi qua từ khi món được order (đồng hồ chạy).
o	Cảnh báo khi order quá lâu (ví dụ > 20 phút).
4.	Tổng quan theo ca
o	Số order đang chờ / đang làm / đã xong.
o	Load bếp tại từng thời điểm (dùng cho dashboard sau này, rất phù hợp cho module AI dự đoán thời gian chuẩn bị).Foodiv+2RestroWorks+2
________________________________________
3.4. Hệ thống quản trị cho chủ quán (Admin / Back-office)
1.	Quản lý menu
o	CRUD món: thêm / sửa / xóa món.
o	Quản lý category, combo, chương trình khuyến mãi.
o	Thiết lập trạng thái món: đang bán / tạm ngừng / hết hàng.
2.	Quản lý nhân viên & phân quyền
o	Tài khoản nhân viên, phân role:
	Phục vụ, thu ngân, bếp, quản lý.
o	Log hoạt động: ai tạo / sửa order, ai hủy món.
3.	Quản lý bàn & khu vực
o	Tạo bàn, mã QR cho mỗi bàn (in và dán trên bàn).
o	Khu vực: tầng 1, tầng 2, phòng VIP…
4.	Báo cáo doanh thu
o	Doanh thu theo:
	Ngày / tuần / tháng
	Ca làm, khu vực, nhân viên
o	Món bán chạy, món ít bán.myiqmenu.com
5.	Báo cáo vận hành
o	Số đơn / ca, giá trị trung bình mỗi order.
o	Thời gian phục vụ trung bình:
	Từ lúc order đến lúc xong món
	Từ lúc khách yêu cầu thanh toán đến lúc đóng bill
o	Tỷ lệ món bị hủy, món bị đổi (gợi ý sau này làm AI phân tích lỗi quy trình).
6.	Quản lý feedback / review (chưa AI)
o	Danh sách review theo thời gian.
o	Lọc theo món/nhân viên/bàn.
o	Hiện tại:
	Chỉ thống kê thô – ví dụ:
	bao nhiêu review 1–2–3–4–5 sao cho từng món.
o	Sau này, module sentiment AI → phân loại tích cực/tiêu cực/trung tính, thống kê sâu hơn.
