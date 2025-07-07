import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  images: string[];
  videos: string[];
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  title: {
    type: String,
    required: [true, 'Tên hoạt động là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên hoạt động không được vượt quá 200 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Mô tả hoạt động là bắt buộc'],
    trim: true,
    maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự']
  },
  date: {
    type: Date,
    required: [true, 'Ngày tổ chức là bắt buộc']
  },
  location: {
    type: String,
    required: [true, 'Địa điểm là bắt buộc'],
    trim: true,
    maxlength: [300, 'Địa điểm không được vượt quá 300 ký tự']
  },
  images: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'URL ảnh không hợp lệ'
    }
  }],
  videos: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(mp4|avi|mov|wmv|webm)$/i.test(url);
      },
      message: 'URL video không hợp lệ'
    }
  }],
  participants: {
    type: Number,
    required: [true, 'Số người tham gia là bắt buộc'],
    min: [1, 'Số người tham gia phải ít nhất là 1'],
    max: [10000, 'Số người tham gia không được vượt quá 10000']
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'ongoing', 'completed'],
      message: 'Trạng thái phải là: upcoming, ongoing, hoặc completed'
    },
    default: 'upcoming'
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    enum: {
      values: ['Giáo dục', 'Môi trường', 'Y tế', 'Xã hội', 'Khác'],
      message: 'Danh mục phải là: Giáo dục, Môi trường, Y tế, Xã hội, hoặc Khác'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ActivitySchema.index({ status: 1, date: -1 });
ActivitySchema.index({ category: 1 });
ActivitySchema.index({ title: 'text', description: 'text' });

// Virtual for formatted date
ActivitySchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('vi-VN');
});

// Pre-save middleware to update timestamps
ActivitySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
