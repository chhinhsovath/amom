import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await db.findOne('users', { id: decoded.userId });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};