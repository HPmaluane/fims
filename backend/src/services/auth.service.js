const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name,
      jti: uuidv4()
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

async function login(email, password) {
  const result = await query(
    'SELECT id, name, email, password, role, avatar, active FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  const user = result.rows[0];

  if (!user) throw new Error('INVALID_CREDENTIALS');
  if (!user.active) throw new Error('USER_INACTIVE');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  const { password: _, ...safeUser } = user;

  return { accessToken, refreshToken, user: safeUser };
}

async function register(name, email, password, role = 'inspector') {
  const exists = await query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (exists.rows.length) {
    throw new Error('EMAIL_EXISTS');
  }

  const hash = await bcrypt.hash(password, 12);

  const avatar = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  const result = await query(
    `INSERT INTO users (name, email, password, role, avatar)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, avatar, active, created_at`,
    [name.trim(), email.toLowerCase().trim(), hash, role, avatar]
  );

  return result.rows[0];
}

async function refresh(refreshToken) {
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error('INVALID_REFRESH');
  }

  const stored = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [refreshToken]
  );

  if (!stored.rows.length) {
    throw new Error('REFRESH_REVOKED');
  }

  const userResult = await query(
    'SELECT id, name, email, role, avatar, active FROM users WHERE id = $1',
    [decoded.sub]
  );

  const user = userResult.rows[0];

  if (!user || !user.active) {
    throw new Error('USER_NOT_FOUND');
  }

  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

  const newAccess = generateAccessToken(user);
  const newRefresh = generateRefreshToken(user);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, newRefresh, expiresAt]
  );

  return { accessToken: newAccess, refreshToken: newRefresh, user };
}

async function logout(refreshToken) {
  if (refreshToken) {
    await query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
  }
}

module.exports = {
  login,
  register,
  refresh,
  logout
};
