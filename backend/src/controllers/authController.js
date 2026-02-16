import { User } from '../models/User.js';
import { tokenUtils } from '../utils/tokenUtils.js';
import { passwordUtils } from '../utils/passwordUtils.js';

export const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await passwordUtils.hashPassword(password);

      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = tokenUtils.generateToken(user._id.toString(), user.email);
      const refreshToken = tokenUtils.generateRefreshToken(user._id.toString(), user.email);

      return res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Signup failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await passwordUtils.comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = tokenUtils.generateToken(user._id.toString(), user.email);
      const refreshToken = tokenUtils.generateRefreshToken(user._id.toString(), user.email);

      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed' });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const payload = tokenUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const newToken = tokenUtils.generateToken(user._id.toString(), user.email);
      const newRefreshToken = tokenUtils.generateRefreshToken(user._id.toString(), user.email);

      return res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Refresh error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, avatar } = req.body;
      const userId = req.userId;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { name: name.trim(), avatar: avatar || null },
        { returnDocument: 'after' }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  },
};
