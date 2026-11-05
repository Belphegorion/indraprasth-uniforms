import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController';
import {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  importProductsCsv,
} from '../controllers/productController';
import {
  getAdminSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../controllers/schoolController';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import {
  getAdminOrders,
  getOrderById,
  patchOrderStatus,
  exportOrdersCsv,
} from '../controllers/orderController';
import {
  getAdminInquiries,
  patchInquiry,
} from '../controllers/inquiryController';
import {
  getAdminSettings,
  updateSettings,
} from '../controllers/settingController';
import {
  uploadProductImage,
  deleteProductImage,
} from '../controllers/uploadController';
import { getAdminStats } from '../services/statsService';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginLimiter } from '../middleware/rateLimit';
import { uploadSingleImage, uploadCsvFile } from '../middleware/upload';
import {
  adminLoginSchema,
  adminChangePasswordSchema,
  productCreateSchema,
  productUpdateSchema,
  schoolCreateSchema,
  schoolUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  orderStatusUpdateSchema,
  inquiryStatusUpdateSchema,
  settingUpdateSchema,
} from '@indraprasth/shared';

const router = Router();

// Auth (public endpoints)
router.post('/auth/login', loginLimiter, validateBody(adminLoginSchema), login);
router.post('/auth/logout', logout);

// Protected routes below
router.use(authenticate);

// Current user & password
router.get('/auth/me', getMe);
router.post('/auth/change-password', validateBody(adminChangePasswordSchema), changePassword);

// Dashboard stats
router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// Products
router.get('/products', getAdminProducts);
router.post('/products/import', uploadCsvFile, importProductsCsv);
router.get('/products/:id', getProductById);
router.post('/products', validateBody(productCreateSchema), createProduct);
router.put('/products/:id', validateBody(productUpdateSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

// Schools
router.get('/schools', getAdminSchools);
router.post('/schools', validateBody(schoolCreateSchema), createSchool);
router.put('/schools/:id', validateBody(schoolUpdateSchema), updateSchool);
router.delete('/schools/:id', deleteSchool);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', validateBody(categoryCreateSchema), createCategory);
router.put('/categories/:id', validateBody(categoryUpdateSchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders/export.csv', exportOrdersCsv);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', validateBody(orderStatusUpdateSchema), patchOrderStatus);

// Inquiries
router.get('/inquiries', getAdminInquiries);
router.patch('/inquiries/:id', validateBody(inquiryStatusUpdateSchema), patchInquiry);

// Uploads
router.post('/uploads/image', uploadSingleImage, uploadProductImage);
router.delete('/uploads/:publicId(*)', deleteProductImage);
router.delete('/uploads', deleteProductImage);

// Settings (Owner only for updates)
router.get('/settings', getAdminSettings);
router.put('/settings', requireRole('owner'), validateBody(settingUpdateSchema), updateSettings);

export default router;
