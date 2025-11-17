import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      
      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      
      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found',
        });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const message = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
      });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId; // From auth middleware
      const { password } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      await authService.deleteAccount(userId, password);
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Account deletion failed',
      });
    }
  }
}
