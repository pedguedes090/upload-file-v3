# 🚀 Hugging Face Upload Center

Giao diện web hiện đại để tải lên file trực tiếp lên Hugging Face Hub với đầy đủ tính năng.

## ✨ Tính năng

### 🎯 Upload methods
- **Kéo & Thả**: Upload nhiều file cùng lúc bằng cách kéo thả
- **Chọn file**: Chọn file từ máy tính của bạn

### 🗂️ Quản lý Repository
- Tự động load danh sách repository của bạn
- Tạo repository mới trực tiếp từ giao diện
- Hỗ trợ cả Model và Dataset repositories
- Tùy chọn thư mục đích cho file

### 📊 Theo dõi tiến trình
- Hiển thị tiến trình upload realtime
- Trạng thái chi tiết cho từng file
- Link trực tiếp đến file trên Hugging Face
- Thông báo thành công/lỗi

### 🎨 Giao diện hiện đại
- Dark theme với glass morphism effect
- Responsive design cho mobile và desktop
- Animations mượt mà
- Icons đẹp mắt cho từng loại file

## 🛠️ Cài đặt

### Yêu cầu
- Node.js 16+ 
- NPM hoặc Yarn
- Hugging Face Access Token

### Hướng dẫn

1. **Clone hoặc tải xuống project**
   ```bash
   git clone <repository-url>
   cd uploadfile
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình Environment Variables**
   
   Tạo file `.env`:
   ```env
   HUGGINGFACE_TOKEN=your_hugging_face_token_here
   PORT=3000
   DEFAULT_REPO_TYPE=dataset
   DEFAULT_REPO_NAME=your_username/your_repo
   ```

4. **Khởi chạy server**
   ```bash
   npm start
   ```

5. **Mở trình duyệt**
   Truy cập `http://localhost:3000`

## 🔧 API Endpoints

### User Info
- `GET /api/user` - Lấy thông tin user hiện tại

### Repository Management
- `GET /api/repos/models` - Danh sách models của user
- `GET /api/repos/datasets` - Danh sách datasets của user
- `POST /api/repo/create` - Tạo repository mới

### File Upload
- `POST /api/upload` - Upload file từ máy tính

### File Management
- `GET /api/repo/:type/:name/files` - Danh sách file trong repo
- `DELETE /api/repo/:type/:name/files/*` - Xóa file

## 📝 Cách sử dụng

### 1. Cấu hình Repository
- Chọn repository từ dropdown hoặc tạo mới
- Chọn loại repository (Model/Dataset)
- Nhập thư mục đích (tùy chọn)

### 2. Upload File
**Cách 1: Kéo & Thả**
- Kéo file vào vùng upload
- File sẽ tự động được thêm vào queue

**Cách 2: Chọn file**
- Click "Chọn File"
- Chọn một hoặc nhiều file

### 3. Theo dõi tiến trình
- Xem trạng thái upload realtime
- Click vào link để xem file trên Hugging Face
- Xóa file khỏi danh sách nếu cần

## 🔒 Bảo mật

- **Access Token**: Được lưu trong environment variables
- **File Validation**: Kiểm tra file size và format
- **Error Handling**: Xử lý lỗi chi tiết và an toàn

## 📋 Supported File Types

Hỗ trợ tất cả loại file với icons đặc biệt cho:
- 📄 Documents: PDF, DOC, DOCX
- 📊 Spreadsheets: XLS, XLSX
- 🖼️ Images: JPG, JPEG, PNG, GIF
- 🎵 Audio: MP3, WAV, FLAC
- 🎥 Video: MP4, AVI, MOV
- 📦 Archives: ZIP, RAR, 7Z
- 💻 Code files: JS, TS, PY, JSON
- Và nhiều loại khác...

## 🐛 Troubleshooting

### Server không khởi động
- Kiểm tra PORT có bị chiếm không
- Đảm bảo Node.js version >= 16
- Kiểm tra file `.env` đã được tạo

### Upload lỗi
- Kiểm tra Hugging Face token còn hiệu lực
- Đảm bảo có quyền ghi vào repository
- Kiểm tra kích thước file (max 100MB)

### Không load được repository
- Kiểm tra token có quyền đọc repository
- Đảm bảo kết nối internet ổn định

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🙏 Credits

- [Hugging Face Hub](https://huggingface.co/docs/huggingface_hub) - API integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Multer](https://github.com/expressjs/multer) - File upload handling

---

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng:
1. Kiểm tra [Issues](../../issues) trên GitHub
2. Tạo issue mới nếu chưa có
3. Cung cấp thông tin chi tiết về lỗi

**Happy uploading! 🎉**
