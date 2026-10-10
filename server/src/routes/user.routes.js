import express from 'express';
import {
  getUsers,
  inviteUser,
  deleteUser,
  toggleUserStatus,
  getInviteDetails,
  completeProfile,
  getProfile,
  updateProfile,
} from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public invitation routes
router.get('/invite/:token', getInviteDetails);
router.post('/complete-profile', completeProfile);

// Authenticated user profile routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin-protected routes
router.get('/', authenticate, requireAdmin, getUsers);
router.post('/invite', authenticate, requireAdmin, inviteUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);
router.put('/:id/toggle-status', authenticate, requireAdmin, toggleUserStatus);

export default router;
