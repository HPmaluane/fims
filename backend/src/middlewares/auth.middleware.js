const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Verify access token and attach user to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acesso não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expirado.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }

    const result = await query(
      'SELECT id, name, email, role, avatar, active FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (!result.rows.length || !result.rows[0].active) {
      return res.status(401).json({ success: false, message: 'Utilizador não encontrado ou inativo.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('[Auth Middleware]', err);
    res.status(500).json({ success: false, message: 'Erro interno de autenticação.' });
  }
}

/**
 * Role-based access control — pass allowed roles.
 * Usage: authorize('admin', 'ceo')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Requer um dos seguintes perfis: ${roles.join(', ')}.`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
