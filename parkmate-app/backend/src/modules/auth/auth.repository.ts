import { pool } from '@config/database';
import bcrypt from 'bcryptjs';
import { CreateUserDto, User } from './auth.types';

export class AuthRepository {
  async createUser(userData: CreateUserDto): Promise<User> {
    const { email, password, name } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, [email, passwordHash, name]);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", name, is_verified as "isVerified",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, is_verified as "isVerified",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    const query = `
      UPDATE users
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = $2
    `;

    await pool.query(query, [newPasswordHash, userId]);
  }

  async saveResetToken(email: string, token: string, expiresAt: Date): Promise<void> {
    const query = `
      UPDATE users
      SET reset_password_token = $1, reset_password_expires = $2
      WHERE email = $3
    `;

    await pool.query(query, [token, expiresAt, email]);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, is_verified as "isVerified",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE reset_password_token = $1 AND reset_password_expires > NOW()
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  async deleteUser(userId: string): Promise<void> {
    const query = `
      DELETE FROM users
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }
}
