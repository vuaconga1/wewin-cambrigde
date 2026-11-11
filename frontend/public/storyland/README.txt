WEWIN STORYLAND — 50 TRUYỆN SONG NGỮ ANH–VIỆT

CÁCH MỞ
1. Bản một file: mở WEWIN_STORYLAND_50_Stories.html bằng Chrome, Edge hoặc Safari hiện đại.
2. Bản source: giải nén toàn bộ ZIP, mở index.html. Giữ nguyên thư mục assets và các file JS/CSS.
3. Có thể đưa nguyên thư mục source lên máy chủ web tĩnh. Không cần backend, API key hay tài khoản.

ĐÃ CÓ TRONG BẢN NÀY
- 50 truyện không trùng, 956 cảnh có tranh và nội dung Anh–Việt.
- Chọn/tìm truyện, lọc thể loại/trình độ, lưu truyện, lưu vị trí đọc trên trình duyệt.
- Tranh đổi theo cảnh, ẩn/hiện bản dịch, chế độ chỉ đọc, cỡ chữ, giao diện tối.
- Nghe tiếng Anh bằng Web Speech API; chọn giọng, tốc độ, âm lượng; phát/tạm dừng, chuyển cảnh, nhấn từ để nghe từ đó.
- Nội dung là bản kể WEWIN; không sao chép văn bản hay hình của Parroto.
- Ba truyện mới bổ sung để đủ 50 được đánh dấu New WEWIN Original trong dữ liệu: The Brave Little Seed, The Lost Red Balloon, The Bridge of Kindness. Chúng có thể được thay bằng ba truyện khác qua stories.json.
- Trình độ là hướng dẫn đọc tham khảo, không phải chứng nhận CEFR. Một số truyện có chủ đề mất mát/nguy hiểm; người lớn nên đọc trước để chọn cho trẻ.

AUDIO VÀ HIGHLIGHT
Bộ file không kèm 50 bản thu MP3. Nút Phát sử dụng giọng tiếng Anh có sẵn trên thiết bị. Danh sách giọng và chất lượng phụ thuộc hệ điều hành/trình duyệt; một số giọng cần Internet. Tranh và nội dung được đóng gói cục bộ.
Giọng theo câu: chỉ tô từng từ khi SpeechSynthesis phát sự kiện boundary có charIndex thực. Nếu giọng không có mốc từ, ứng dụng tô cả câu và hiển thị Theo câu. Bật Cài đặt > Đọc rõ từng từ để phát từng từ và tô tại sự kiện onstart thực; nhịp đọc sẽ ngắt hơn. Không dùng bộ đếm giả để đoán vị trí từ.
Tạm dừng TTS sẽ hủy câu đang đọc và tiếp tục từ từ cuối có mốc đã biết; giọng không hỗ trợ mốc có thể đọc lại câu.

DÙNG MP3/WAV RIÊNG
Mở truyện > Cài đặt > Dùng bản thu âm riêng > chọn audio rồi chọn JSON mốc từ. File chọn tại đây chỉ giữ cho phiên hiện tại. MP3 không có mốc vẫn nghe được nhưng không tô từng từ.
JSON là mảng hoặc đối tượng có trường cues. scene và word bắt đầu từ 0. Từ được tách bằng khoảng trắng (dấu câu đi cùng từ). Cần đủ và đúng thứ tự mọi từ, thời gian giây không âm, start < end, không chồng lấn. Ví dụ minh họa cấu trúc, không phải bảng mốc hoàn chỉnh:
{"cues":[{"scene":0,"word":0,"start":0.15,"end":0.42},{"scene":0,"word":1,"start":0.43,"end":0.66}]}
Audio phải đúng bản tiếng Anh trong dữ liệu. Muốn phát ngay khi tải trang, lập trình viên có thể thêm audioSrc và wordCues vào từng truyện; wordCues dùng cùng định dạng. Không thêm các mốc ước lượng nếu cần đồng bộ chính xác.

CHỈNH NỘI DUNG
- app.js: logic trình đọc, giọng đọc, đồng bộ mốc từ.
- styles.css: giao diện responsive.
- stories.json: bản dữ liệu dễ chỉnh.
- story-data.js: dữ liệu chạy trực tiếp bằng script, không phụ thuộc fetch/CORS.
Sau khi sửa stories.json, cập nhật story-data.js thành: window.STORYLAND_DATA=<nội dung JSON>;
Có thể nạp stories.json qua Cài đặt > Nhập bộ truyện khác để thử trong phiên hiện tại.
Mỗi truyện có id duy nhất; titleEn, titleVi, level, category, scenes:[{en,vi,image}], cover, vocab, lesson, note. assets ánh xạ mã ảnh sang đường dẫn assets/... hoặc data:image/... .
Bản một file nhúng ảnh nên dung lượng lớn hơn bản source. ZIP thích hợp để chỉnh sửa và đưa lên web.

KIỂM TRA
Đã kiểm tra 50 lựa chọn, 956 cặp câu và ảnh, thao tác đọc/tìm/lưu/chuyển cảnh, giao diện desktop/mobile và logic boundary bằng sự kiện kiểm thử. Không thể xác nhận chất lượng âm thanh của mọi giọng trên mọi thiết bị; hãy nghe thử giọng được chọn trên thiết bị sử dụng thực tế.

Tài liệu kỹ thuật chính thức:
https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event
