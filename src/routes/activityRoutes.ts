import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  uploadMedia,
  deleteTempMedia,
  getActivityStats,
  getFilterOptions
} from '../controllers/activityController';
import { upload } from '../config/cloudinary';

const router = Router();

/**
 * @route   GET /api/activities
 * @desc    Get all activities with filtering, pagination, and search
 * @access  Public
 * @query   {
 *   page?: number,
 *   limit?: number,
 *   status?: 'upcoming' | 'ongoing' | 'completed',
 *   category?: string,
 *   keyword?: string,
 *   search?: string,
 *   sortBy?: 'date' | 'title' | 'participants' | 'createdAt' | 'updatedAt',
 *   sortOrder?: 'asc' | 'desc',
 *   dateFrom?: string,
 *   dateTo?: string,
 *   participantsMin?: number,
 *   participantsMax?: number
 * }
 */
router.get('/', getActivities);

/**
 * @route   GET /api/activities/stats
 * @desc    Get activity statistics
 * @access  Public
 */
router.get('/stats', getActivityStats);

/**
 * @route   GET /api/activities/filters
 * @desc    Get available filter options for activities
 * @access  Public
 */
router.get('/filters', getFilterOptions);

/**
 * @route   GET /api/activities/:id
 * @desc    Get single activity by ID
 * @access  Public
 */
router.get('/:id', getActivityById);

/**
 * @route   POST /api/activities
 * @desc    Create new activity
 * @access  Admin (sẽ thêm middleware auth sau)
 * @body    {
 *   title: string,
 *   description: string,
 *   date: Date,
 *   location: string,
 *   participants: number,
 *   status?: 'upcoming' | 'ongoing' | 'completed',
 *   category: string,
 *   images?: string[],
 *   videos?: string[]
 * }
 */
router.post('/', createActivity);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update activity
 * @access  Admin (sẽ thêm middleware auth sau)
 */
router.put('/:id', updateActivity);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity
 * @access  Admin (sẽ thêm middleware auth sau)
 */
router.delete('/:id', deleteActivity);

/**
 * @route   POST /api/activities/upload
 * @desc    Upload images and videos
 * @access  Admin (sẽ thêm middleware auth sau)
 * @upload  multipart/form-data with files
 */
router.post('/upload', upload.array('files', 10), uploadMedia);

/**
 * @route   DELETE /api/activities/upload/temp
 * @desc    Delete temporary uploaded file
 * @access  Admin (sẽ thêm middleware auth sau)
 */
router.delete('/upload/temp', deleteTempMedia);

export default router;
