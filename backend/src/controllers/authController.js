const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateTokenPair, verifyRefreshTokenJWT } = require('../utils/jwt');

/**
 * Register a new user
 * POST /auth/register
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'user'
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Create refresh token in database
    await RefreshToken.create(user.id, 7);

    res.status(201).json({
      message: 'User registered successfully',
      user: User.sanitize(user),
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
}

/**
 * Login user
 * POST /auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Account has been deactivated'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Create refresh token in database
    await RefreshToken.create(user.id, 7);

    res.json({
      message: 'Login successful',
      user: User.sanitize(user),
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
}

/**
 * Refresh access token using refresh token
 * POST /auth/refresh
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Refresh token is required'
      });
    }

    // Verify JWT refresh token
    let decoded;
    try {
      decoded = verifyRefreshTokenJWT(refreshToken);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid token',
        message: error.message
      });
    }

    // Check if refresh token exists in database and is valid
    const tokenRecord = await RefreshToken.findByToken(refreshToken);
    if (!tokenRecord) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Refresh token not found or has been revoked'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user);

    // Create new refresh token
    await RefreshToken.create(user.id, 7);

    // Revoke old refresh token (token rotation)
    await RefreshToken.revoke(refreshToken, tokens.refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      user: User.sanitize(user),
      tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred during token refresh'
    });
  }
}

/**
 * Logout user (invalidate refresh token)
 * POST /auth/logout
 */
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Refresh token is required'
      });
    }

    // Revoke the refresh token
    await RefreshToken.revoke(refreshToken);

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
}

/**
 * Get current user profile
 * GET /auth/me
 */
async function getCurrentUser(req, res) {
  try {
    // req.user is set by authenticate middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred while fetching user profile'
    });
  }
}

/**
 * Update current user profile
 * PUT /auth/me
 */
async function updateCurrentUser(req, res) {
  try {
    const { firstName, lastName, phone, avatarUrl } = req.body;
    const userId = req.userId;

    const updates = {};
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const updatedUser = await User.update(userId, updates);

    res.json({
      message: 'Profile updated successfully',
      user: User.sanitize(updatedUser)
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: error.message || 'An error occurred while updating profile'
    });
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  updateCurrentUser
};
