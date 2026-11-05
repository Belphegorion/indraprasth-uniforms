import { Router } from 'express';
import {
  getPublicProducts,
  browsePublicProducts,
  getFeaturedProducts,
  getProductBySlug,
} from '../controllers/productController';
import { getPublicSchools } from '../controllers/schoolController';
import { getPublicCategories } from '../controllers/categoryController';
import { getPublicSettings } from '../controllers/settingController';
import { createPublicOrder, trackOrder } from '../controllers/orderController';
import { createInquiry } from '../controllers/inquiryController';
import { validateBody, validateQuery } from '../middleware/validate';
import { orderLimiter, inquiryLimiter } from '../middleware/rateLimit';
import {
  productQuerySchema,
  productBrowseQuerySchema,
  orderCreateSchema,
  orderTrackQuerySchema,
  inquiryCreateSchema,
} from '@indraprasth/shared';

const router = Router();

// Products
router.get('/products', validateQuery(productQuerySchema), getPublicProducts);
router.get('/products/browse', validateQuery(productBrowseQuerySchema), browsePublicProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/:slug', getProductBySlug);

// Schools & Categories
router.get('/schools', getPublicSchools);
router.get('/categories', getPublicCategories);

// Settings
router.get('/settings/public', getPublicSettings);

// Orders
router.post('/orders', orderLimiter, validateBody(orderCreateSchema), createPublicOrder);
router.get('/orders/track', validateQuery(orderTrackQuerySchema), trackOrder);

// Inquiries
router.post('/inquiries', inquiryLimiter, validateBody(inquiryCreateSchema), createInquiry);

export default router;
