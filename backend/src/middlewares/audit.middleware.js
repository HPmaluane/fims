const { query } = require('../config/db');

/**
 * Write an entry to audit_logs
 */
async function writeAudit({ userId, userName, action, detail, entityType, entityId, ipAddress }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, user_name, action, detail, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, userName || null, action, detail || null, entityType || null, entityId || null, ipAddress || null]
    );
  } catch (err) {
    // Audit failures must never crash the request
    console.error('[Audit]', err.message);
  }
}

/**
 * Express middleware factory — logs action after response
 */
function auditLog(action, detail) {
  return (req, _res, next) => {
    const ip = req.ip || req.connection?.remoteAddress;
    const user = req.user;
    writeAudit({
      userId:   user?.id,
      userName: user?.name,
      action,
      detail:   typeof detail === 'function' ? detail(req) : detail,
      ipAddress: ip,
    });
    next();
  };
}

module.exports = { writeAudit, auditLog };
