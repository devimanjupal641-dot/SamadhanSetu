import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../config/db';
import { User } from '../models/types';
import { generateToken } from '../middleware/auth';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDatabase();
    const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed.' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      password,
      role,
      organization_name,
      department,
      district,
      state,
      language_pref
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const db = getDatabase();
    const existing = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      password_hash: hash,
      role,
      organization_name: organization_name || '',
      department: department || '',
      district: district || 'Ranchi',
      state: state || 'Jharkhand',
      language_pref: language_pref || 'en',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken(newUser);
    const { password_hash, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed.' });
  }
}
