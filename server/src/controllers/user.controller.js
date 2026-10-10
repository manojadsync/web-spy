import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '7d',
  });
};

// GET /api/v1/users - List all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'inviteToken'] },
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// POST /api/v1/users/invite - Invite a new user (Admin only)
export const inviteUser = async (req, res) => {
  try {
    const { name, email, role = 'user' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });

    if (existingUser) {
      if (existingUser.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists and is active',
        });
      }

      // If user was previously invited, regenerate invite token
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      existingUser.name = name.trim();
      existingUser.role = role || existingUser.role;
      existingUser.inviteToken = inviteToken;
      existingUser.inviteExpires = inviteExpires;
      existingUser.status = 'invited';
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'Invitation resent successfully',
        data: {
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            status: existingUser.status,
          },
          inviteToken,
        },
      });
    }

    // Generate unique invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      role: role || 'user',
      status: 'invited',
      isActive: true,
      inviteToken,
      inviteExpires,
    });

    return res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
        inviteToken,
      },
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to invite user',
    });
  }
};

// DELETE /api/v1/users/:id - Delete a user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

// PUT /api/v1/users/:id/toggle-status - Toggle active/inactive status (Admin only)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

// ==========================================
// PUBLIC INVITATION ENDPOINTS
// ==========================================

// GET /api/v1/users/invite/:token - Validate invitation token and get prefilled details
export const getInviteDetails = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token is required',
      });
    }

    const user = await User.findOne({
      where: { inviteToken: token },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation link or already accepted',
      });
    }

    if (user.inviteExpires && new Date(user.inviteExpires) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This invitation link has expired. Please ask the administrator to resend.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error verifying invite token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify invitation link',
    });
  }
};

// POST /api/v1/users/complete-profile - Complete profile using invitation token
export const completeProfile = async (req, res) => {
  try {
    const { token, phone, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({
      where: { inviteToken: token },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation link or profile already completed',
      });
    }

    if (user.inviteExpires && new Date(user.inviteExpires) < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Invitation link has expired',
      });
    }

    // Set phone, password, and mark as active
    user.phone = phone ? phone.trim() : user.phone;
    user.password = password;
    user.status = 'active';
    user.isActive = true;
    user.inviteToken = null;
    user.inviteExpires = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate auth token so user is automatically logged in
    const authToken = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully!',
      data: {
        token: authToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete profile',
    });
  }
};

// ==========================================
// PROFILE ENDPOINTS (CURRENT USER)
// ==========================================

// GET /api/v1/users/profile - Get profile of authenticated user
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'inviteToken', 'inviteExpires'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// PUT /api/v1/users/profile - Update profile of authenticated user
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required',
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = name.trim();
    if (phone !== undefined) {
      user.phone = phone ? phone.trim() : null;
    }

    // Email, role, status are deliberately not modifiable here
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        createdAt: user.createdAt || user.created_at,
        lastLogin: user.lastLogin || user.last_login,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

