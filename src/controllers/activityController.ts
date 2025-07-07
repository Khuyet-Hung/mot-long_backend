import { Request, Response } from 'express';
import { Activity, IActivity } from '../models/Activity';
import { createActivitySchema, updateActivitySchema, querySchema } from '../validators/activityValidator';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

// Get all activities with filtering, pagination, and search
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    const { 
      page, 
      limit, 
      status, 
      category, 
      keyword, 
      search, 
      sortBy, 
      sortOrder,
      dateFrom,
      dateTo,
      participantsMin,
      participantsMax
    } = value;

    // Build filter query
    const filter: any = {};
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Text search (support both 'keyword' and 'search' for backward compatibility)
    const searchTerm = keyword || search;
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }
    
    // Participants range filter
    if (participantsMin !== undefined || participantsMax !== undefined) {
      filter.participants = {};
      if (participantsMin !== undefined) {
        filter.participants.$gte = participantsMin;
      }
      if (participantsMax !== undefined) {
        filter.participants.$lte = participantsMax;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries with enhanced projection
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title description date location participants status category images videos createdAt updatedAt')
        .lean(),
      Activity.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Enhanced response with metadata
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          startIndex: skip + 1,
          endIndex: Math.min(skip + limit, total)
        },
        filters: {
          status,
          category,
          keyword: searchTerm,
          dateFrom,
          dateTo,
          participantsMin,
          participantsMax,
          sortBy,
          sortOrder
        },
        metadata: {
          totalActivities: total,
          queryTime: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách hoạt động'
    });
  }
};

// Get single activity by ID
export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoạt động'
      });
      return;
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin hoạt động'
    });
  }
};

// Create new activity
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = createActivitySchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // Create new activity
    const activity = new Activity(value);
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Tạo hoạt động thành công',
      data: activity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo hoạt động'
    });
  }
};

// Update activity
export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateActivitySchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.details.map(detail => detail.message)
      });
      return;
    }

    // Update activity
    const activity = await Activity.findByIdAndUpdate(
      id,
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoạt động'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật hoạt động thành công',
      data: activity
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật hoạt động'
    });
  }
};

// Delete activity
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy hoạt động'
      });
      return;
    }

    // Delete associated media from Cloudinary
    try {
      const deletePromises = [];
      
      // Delete images
      for (const imageUrl of activity.images) {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        deletePromises.push(deleteFromCloudinary(publicId, 'image'));
      }
      
      // Delete videos
      for (const videoUrl of activity.videos) {
        const publicId = videoUrl.split('/').slice(-2).join('/').split('.')[0];
        deletePromises.push(deleteFromCloudinary(publicId, 'video'));
      }
      
      await Promise.allSettled(deletePromises);
    } catch (mediaError) {
      console.error('Error deleting media files:', mediaError);
      // Continue with activity deletion even if media deletion fails
    }

    // Delete activity from database
    await Activity.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Xóa hoạt động thành công'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa hoạt động'
    });
  }
};

// Upload media files
export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Không có file nào được upload'
      });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    const uploadResults = [];

    for (const file of files as Express.Multer.File[]) {
      try {
        const result = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        
        uploadResults.push({
          originalName: file.originalname,
          url: result.url,
          publicId: result.publicId,
          resourceType: result.resourceType
        });
      } catch (uploadError) {
        console.error(`Error uploading ${file.originalname}:`, uploadError);
        uploadResults.push({
          originalName: file.originalname,
          error: 'Upload failed'
        });
      }
    }

    res.json({
      success: true,
      message: 'Upload hoàn thành',
      data: uploadResults
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload file'
    });
  }
};

// Get activity statistics
export const getActivityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [statusStats, categoryStats, totalActivities, totalParticipants] = await Promise.all([
      Activity.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Activity.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Activity.countDocuments(),
      Activity.aggregate([
        { $group: { _id: null, total: { $sum: '$participants' } } }
      ])
    ]);

    const stats = {
      total: totalActivities,
      totalParticipants: totalParticipants[0]?.total || 0,
      byStatus: statusStats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byCategory: categoryStats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê'
    });
  }
};

// Delete temporary media file
export const deleteTempMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId, resourceType } = req.body;
    
    if (!publicId) {
      res.status(400).json({
        success: false,
        message: 'publicId is required'
      });
      return;
    }

    const result = await deleteFromCloudinary(publicId, resourceType || 'image');
    
    res.json({
      success: true,
      message: 'File đã được xóa thành công',
      data: result
    });
  } catch (error) {
    console.error('Error deleting temp media:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa file'
    });
  }
};

// Get available filter options for activities
export const getActivityFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const [categories, statuses, dateRange, participantsRange] = await Promise.all([
      Activity.distinct('category'),
      Activity.distinct('status'),
      Activity.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$date' },
            maxDate: { $max: '$date' }
          }
        }
      ]),
      Activity.aggregate([
        {
          $group: {
            _id: null,
            minParticipants: { $min: '$participants' },
            maxParticipants: { $max: '$participants' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.filter(cat => cat), // Remove null/empty categories
        statuses: statuses.filter(status => status), // Remove null/empty statuses
        dateRange: dateRange[0] || { minDate: null, maxDate: null },
        participantsRange: participantsRange[0] || { minParticipants: 0, maxParticipants: 0 },
        sortOptions: [
          { value: 'date', label: 'Ngày tổ chức' },
          { value: 'title', label: 'Tên hoạt động' },
          { value: 'participants', label: 'Số người tham gia' },
          { value: 'createdAt', label: 'Ngày tạo' },
          { value: 'updatedAt', label: 'Ngày cập nhật' }
        ],
        sortOrders: [
          { value: 'asc', label: 'Tăng dần' },
          { value: 'desc', label: 'Giảm dần' }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting activity filters:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bộ lọc'
    });
  }
};

// Get filter options for activities
export const getFilterOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const [categoryStats, statusStats, dateRange, participantsRange] = await Promise.all([
      // Get unique categories with counts
      Activity.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Get unique statuses with counts
      Activity.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Get date range
      Activity.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$date' },
            maxDate: { $max: '$date' }
          }
        }
      ]),
      
      // Get participants range
      Activity.aggregate([
        {
          $group: {
            _id: null,
            minParticipants: { $min: '$participants' },
            maxParticipants: { $max: '$participants' }
          }
        }
      ])
    ]);

    const filterOptions = {
      categories: categoryStats.map(item => ({
        value: item._id,
        label: item._id,
        count: item.count
      })),
      
      statuses: statusStats.map(item => ({
        value: item._id,
        label: item._id === 'upcoming' ? 'Sắp diễn ra' : 
               item._id === 'ongoing' ? 'Đang diễn ra' : 'Đã hoàn thành',
        count: item.count
      })),
      
      dateRange: dateRange[0] ? {
        min: dateRange[0].minDate,
        max: dateRange[0].maxDate
      } : null,
      
      participantsRange: participantsRange[0] ? {
        min: participantsRange[0].minParticipants,
        max: participantsRange[0].maxParticipants
      } : null,
      
      sortOptions: [
        { value: 'date', label: 'Ngày tổ chức' },
        { value: 'title', label: 'Tên hoạt động' },
        { value: 'participants', label: 'Số người tham gia' },
        { value: 'createdAt', label: 'Ngày tạo' },
        { value: 'updatedAt', label: 'Ngày cập nhật' }
      ],
      
      sortOrders: [
        { value: 'desc', label: 'Giảm dần' },
        { value: 'asc', label: 'Tăng dần' }
      ]
    };

    res.json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tùy chọn lọc'
    });
  }
};
