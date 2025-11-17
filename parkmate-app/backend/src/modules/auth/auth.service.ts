import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import { CreateUserDto, LoginDto, AuthResponse } from './auth.types';
import config from '@config/environment';
import { emailService } from '../../services/emailService';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.authRepository.createUser(userData);

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    // Find user
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Remove password hash from response
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
      const accessToken = this.generateAccessToken(decoded.userId);
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return 'If the email exists, a reset link has been sent';
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.authRepository.saveResetToken(email, resetToken, expiresAt);

    // Send email with reset token
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // In development, throw the error so we can debug
      if (process.env.NODE_ENV === 'development') {
        throw new Error('Failed to send password reset email. Please check your email configuration.');
      }
      // In production, still return success message to not reveal if user exists
    }

    return 'If the email exists, a reset link has been sent';
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(user.id, newPasswordHash);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    // Find user to verify password
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user with password hash for verification
    const userWithPassword = await this.authRepository.findByEmail(user.email);
    if (!userWithPassword) {
      throw new Error('User not found');
    }

    // Verify password before deletion
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Delete user (cascade will delete related data: favorites, history, feedback)
    await this.authRepository.deleteUser(userId);
  }

  private generateAccessToken(userId: string): string {
    const secret = config.jwt.secret;
    const expiresIn = config.jwt.expiresIn;
    // @ts-expect-error - JWT type overload resolution issue, works fine at runtime
    return jwt.sign({ userId }, secret, { expiresIn });
  }

  private generateRefreshToken(userId: string): string {
    const secret = config.jwt.refreshSecret;
    const expiresIn = config.jwt.refreshExpiresIn;
    // @ts-expect-error - JWT type overload resolution issue, works fine at runtime
    return jwt.sign({ userId }, secret, { expiresIn });
  }
}
