# Backend API cho Nhóm Tình Nguyện

REST API server được xây dựng với Express.js, TypeScript, MongoDB và Cloudinary.

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình Environment
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật các biến môi trường:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/volunteer-db

# Cloudinary (miễn phí)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Cấu hình MongoDB
**Option 1: Local MongoDB**
- Cài đặt MongoDB: https://www.mongodb.com/try/download/community
- Start MongoDB service
- Sử dụng URI: `mongodb://localhost:27017/volunteer-db`

**Option 2: MongoDB Atlas (Miễn phí)**
- Tạo tài khoản: https://cloud.mongodb.com
- Tạo cluster miễn phí
- Lấy connection string
- Cập nhật `MONGODB_URI` trong `.env`

### 4. Cấu hình Cloudinary (Miễn phí)
- Tạo tài khoản: https://cloudinary.com
- Vào Dashboard, copy:
  - Cloud Name
  - API Key
  - API Secret
- Cập nhật thông tin vào `.env`

### 5. Chạy server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Activities Management

#### GET /api/activities
Lấy danh sách hoạt động với filtering, pagination, search
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- status: 'upcoming' | 'ongoing' | 'completed'
- category: 'Giáo dục' | 'Môi trường' | 'Y tế' | 'Xã hội' | 'Khác'
- search: string
- sortBy: 'date' | 'title' | 'participants' | 'createdAt'
- sortOrder: 'asc' | 'desc'
```

#### GET /api/activities/:id
Lấy thông tin chi tiết một hoạt động

#### POST /api/activities
Tạo hoạt động mới
```json
{
  "title": "Tên hoạt động",
  "description": "Mô tả chi tiết",
  "date": "2024-12-15T00:00:00.000Z",
  "location": "Địa điểm tổ chức",
  "participants": 25,
  "status": "upcoming",
  "category": "Môi trường",
  "images": ["url1", "url2"],
  "videos": ["url1"]
}
```

#### PUT /api/activities/:id
Cập nhật thông tin hoạt động

#### DELETE /api/activities/:id
Xóa hoạt động

#### POST /api/activities/upload
Upload ảnh/video
```
Content-Type: multipart/form-data
Field: files (array of files)
Max files: 10
Max size: 10MB per file
```

#### GET /api/activities/stats
Lấy thống kê hoạt động

### Health Check
#### GET /health
Kiểm tra trạng thái server

## 🗂️ Cấu trúc Project

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   └── cloudinary.ts    # Cloudinary config & utils
│   ├── controllers/
│   │   └── activityController.ts
│   ├── models/
│   │   └── Activity.ts      # Mongoose model
│   ├── routes/
│   │   └── activityRoutes.ts
│   ├── validators/
│   │   └── activityValidator.ts
│   └── server.ts            # Main server file
├── dist/                    # Compiled JS files
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Tính năng

### ✅ Quản lý hoạt động CRUD
- Tạo, đọc, cập nhật, xóa hoạt động
- Validation đầy đủ với Joi
- Pagination và search
- Filtering theo status, category

### ✅ Upload Media
- Upload ảnh/video lên Cloudinary
- Tự động tối ưu hóa ảnh (WebP, resize)
- Tự động tối ưu hóa video (MP4, resize)
- Xóa media khi xóa hoạt động

### ✅ Database
- MongoDB với Mongoose
- Indexing cho performance
- Validation schema
- Timestamps tự động

### ✅ Security & Performance
- Helmet.js cho security headers
- CORS configuration
- Rate limiting (có thể thêm)
- Compression middleware
- Error handling toàn cục

## 🔌 Kết nối Frontend

Cập nhật URL API trong frontend:
```typescript
// src/hooks/useMediaUpload.ts
const API_BASE_URL = 'http://localhost:5000/api';

const uploadFile = async (file: File): Promise<MediaFile> => {
  const formData = new FormData();
  formData.append('files', file);
  
  const response = await fetch(`${API_BASE_URL}/activities/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result.data[0];
};
```

## 🎯 Roadmap

- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Unit tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Email notifications
- [ ] WebSocket for real-time updates

## 🐳 Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Sẽ thêm sau
npm test
```

## 📈 Performance Tips

1. **Database Indexing**: Đã tối ưu indexes cho queries thường dùng
2. **Cloudinary**: Tự động tối ưu hóa media
3. **Compression**: Gzip compression cho responses
4. **Caching**: Có thể thêm Redis sau
5. **CDN**: Cloudinary tự động làm CDN

## 🔐 Security

- Helmet.js cho security headers
- CORS configuration
- Input validation với Joi
- File upload restrictions
- Environment variables protection

## 🚀 Deployment

**Heroku:**
```bash
heroku create volunteer-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongo_uri
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
# ... các env vars khác
git push heroku main
```

**Railway/Render:**
- Connect GitHub repository
- Set environment variables
- Deploy tự động

## 📞 Support

- Health check: `/health`
- Logs: Check server console
- MongoDB: Use MongoDB Compass
- Cloudinary: Check dashboard
