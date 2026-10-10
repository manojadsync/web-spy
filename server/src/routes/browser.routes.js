import express from 'express';
import {
  recordSearchActivity,
  getSearchActivities,
  deleteSearchActivity,
  clearSearchActivities,
  proxyWebPreview,
  getUrlPreviewMeta,
} from '../controllers/browser.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Record web search activity with domain and timestamp
router.post('/search-activity', authenticate, recordSearchActivity);

// Get search activity list and statistics
router.get('/search-activity', authenticate, getSearchActivities);

// Delete a single search activity log
router.delete('/search-activity/:id', authenticate, deleteSearchActivity);

// Clear search activities
router.delete('/search-activity', authenticate, clearSearchActivities);

// Live proxy preview endpoint for in-app browser embedding (removes X-Frame-Options)
router.get('/proxy', proxyWebPreview);

// Scrape metadata for live rich URL preview cards
router.get('/preview-meta', getUrlPreviewMeta);

export default router;

