import Joi from 'joi';

export const createActivitySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Tên hoạt động không được để trống',
      'string.min': 'Tên hoạt động phải có ít nhất 3 ký tự',
      'string.max': 'Tên hoạt động không được vượt quá 200 ký tự',
      'any.required': 'Tên hoạt động là bắt buộc'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Mô tả không được để trống',
      'string.min': 'Mô tả phải có ít nhất 10 ký tự',
      'string.max': 'Mô tả không được vượt quá 2000 ký tự',
      'any.required': 'Mô tả là bắt buộc'
    }),

  date: Joi.date()
    .required()
    .messages({
      'date.base': 'Ngày tổ chức phải là ngày hợp lệ',
      'any.required': 'Ngày tổ chức là bắt buộc'
    }),

  location: Joi.string()
    .trim()
    .min(3)
    .max(300)
    .required()
    .messages({
      'string.empty': 'Địa điểm không được để trống',
      'string.min': 'Địa điểm phải có ít nhất 3 ký tự',
      'string.max': 'Địa điểm không được vượt quá 300 ký tự',
      'any.required': 'Địa điểm là bắt buộc'
    }),

  participants: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required()
    .messages({
      'number.base': 'Số người tham gia phải là số',
      'number.integer': 'Số người tham gia phải là số nguyên',
      'number.min': 'Số người tham gia phải ít nhất là 1',
      'number.max': 'Số người tham gia không được vượt quá 10000',
      'any.required': 'Số người tham gia là bắt buộc'
    }),

  status: Joi.string()
    .valid('upcoming', 'ongoing', 'completed')
    .default('upcoming')
    .messages({
      'any.only': 'Trạng thái phải là: upcoming, ongoing, hoặc completed'
    }),

  category: Joi.string()
    .valid('Giáo dục', 'Môi trường', 'Y tế', 'Xã hội', 'Khác')
    .required()
    .messages({
      'any.only': 'Danh mục phải là: Giáo dục, Môi trường, Y tế, Xã hội, hoặc Khác',
      'any.required': 'Danh mục là bắt buộc'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .default([])
    .messages({
      'array.base': 'Danh sách ảnh phải là mảng',
      'string.uri': 'URL ảnh không hợp lệ'
    }),

  videos: Joi.array()
    .items(Joi.string().uri())
    .default([])
    .messages({
      'array.base': 'Danh sách video phải là mảng',
      'string.uri': 'URL video không hợp lệ'
    })
});

export const updateActivitySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .messages({
      'string.empty': 'Tên hoạt động không được để trống',
      'string.min': 'Tên hoạt động phải có ít nhất 3 ký tự',
      'string.max': 'Tên hoạt động không được vượt quá 200 ký tự'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .messages({
      'string.empty': 'Mô tả không được để trống',
      'string.min': 'Mô tả phải có ít nhất 10 ký tự',
      'string.max': 'Mô tả không được vượt quá 2000 ký tự'
    }),

  date: Joi.date()
    .messages({
      'date.base': 'Ngày tổ chức phải là ngày hợp lệ'
    }),

  location: Joi.string()
    .trim()
    .min(3)
    .max(300)
    .messages({
      'string.empty': 'Địa điểm không được để trống',
      'string.min': 'Địa điểm phải có ít nhất 3 ký tự',
      'string.max': 'Địa điểm không được vượt quá 300 ký tự'
    }),

  participants: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .messages({
      'number.base': 'Số người tham gia phải là số',
      'number.integer': 'Số người tham gia phải là số nguyên',
      'number.min': 'Số người tham gia phải ít nhất là 1',
      'number.max': 'Số người tham gia không được vượt quá 10000'
    }),

  status: Joi.string()
    .valid('upcoming', 'ongoing', 'completed')
    .messages({
      'any.only': 'Trạng thái phải là: upcoming, ongoing, hoặc completed'
    }),

  category: Joi.string()
    .valid('Giáo dục', 'Môi trường', 'Y tế', 'Xã hội', 'Khác')
    .messages({
      'any.only': 'Danh mục phải là: Giáo dục, Môi trường, Y tế, Xã hội, hoặc Khác'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .messages({
      'array.base': 'Danh sách ảnh phải là mảng',
      'string.uri': 'URL ảnh không hợp lệ'
    }),

  videos: Joi.array()
    .items(Joi.string().uri())
    .messages({
      'array.base': 'Danh sách video phải là mảng',
      'string.uri': 'URL video không hợp lệ'
    })
});

// Query validation schemas
export const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed'),
  category: Joi.string().valid('Giáo dục', 'Môi trường', 'Y tế', 'Xã hội', 'Khác'),
  keyword: Joi.string().trim().max(100), // Primary search field
  search: Joi.string().trim().max(100),  // Keep for backward compatibility
  sortBy: Joi.string().valid('date', 'title', 'participants', 'createdAt', 'updatedAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso().when('dateFrom', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('dateFrom')).message('dateTo phải sau dateFrom'),
    otherwise: Joi.date()
  }),
  participantsMin: Joi.number().integer().min(0),
  participantsMax: Joi.number().integer().min(0).when('participantsMin', {
    is: Joi.exist(),
    then: Joi.number().min(Joi.ref('participantsMin')).message('participantsMax phải lớn hơn hoặc bằng participantsMin'),
    otherwise: Joi.number().integer().min(0)
  })
}).messages({
  'date.iso': 'Định dạng ngày phải là ISO (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss.sssZ)',
  'number.base': 'Giá trị phải là số',
  'number.integer': 'Giá trị phải là số nguyên',
  'number.min': 'Giá trị phải lớn hơn hoặc bằng {#limit}',
  'string.max': 'Độ dài tối đa là {#limit} ký tự'
});
