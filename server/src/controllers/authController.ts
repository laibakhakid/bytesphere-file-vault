import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { fullName, email, password } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        await AuditService.log({
          req,
          action: 'USER_REGISTER',
          details: `Registration failed: Email ${email} already exists`,
          status: 'WARNING',
        });
        return res.status(409).json({ error: 'User with this email already exists.' });
      }

      // Password hashing via bcrypt (12 salt rounds)
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        role: 'user',
      });

      const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      user.refreshToken = refreshToken;
      await user.save();

      await AuditService.log({
        req,
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'USER_REGISTER',
        details: `User account created successfully for ${user.email}`,
      });

      return res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          storageQuotaBytes: user.storageQuotaBytes,
          storageUsedBytes: user.storageUsedBytes,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        await AuditService.log({
          req,
          action: 'LOGIN_FAILED',
          details: `Invalid credentials for email: ${email}`,
          status: 'FAILURE',
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        await AuditService.log({
          req,
          userId: user._id.toString(),
          userEmail: user.email,
          action: 'LOGIN_FAILED',
          details: `Invalid password attempt for email: ${email}`,
          status: 'FAILURE',
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      user.refreshToken = refreshToken;
      await user.save();

      await AuditService.log({
        req,
        userId: user._id.toString(),
        userEmail: user.email,
        action: 'LOGIN_SUCCESS',
        details: `User logged in successfully`,
      });

      return res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          storageQuotaBytes: user.storageQuotaBytes,
          storageUsedBytes: user.storageUsedBytes,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Login failed: ' + error.message });
    }
  }

  public static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.userId);

      if (!user || user.refreshToken !== refreshToken) {
        await AuditService.log({
          req,
          action: 'ACCESS_DENIED',
          details: 'Invalid or revoked refresh token provided',
          status: 'WARNING',
        });
        return res.status(403).json({ error: 'Invalid or revoked refresh token' });
      }

      const tokenPayload = { userId: user._id.toString(), email: user.email, role: user.role };
      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      user.refreshToken = newRefreshToken;
      await user.save();

      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.userId) {
        await User.findByIdAndUpdate(req.user.userId, { refreshToken: '' });
      }
      return res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Logout failed: ' + error.message });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId).select('-passwordHash -refreshToken');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
}
