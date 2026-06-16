const { query } = require('../config/db');
const { successResponse } = require('../middlewares/response.middleware');

async function getSections(req, res, next) {
  try {
    const sections = await query(
      `SELECT ts.*, json_agg(
         json_build_object(
           'id', ti.id, 'code', ti.code, 'text', ti.text,
           'max_score', ti.max_score, 'sort_order', ti.sort_order
         ) ORDER BY ti.sort_order
       ) AS items
       FROM template_sections ts
       JOIN template_items ti ON ti.section_id = ts.id
       WHERE ts.active = true AND ti.active = true
       GROUP BY ts.id
       ORDER BY ts.sort_order`
    );
    return successResponse(res, sections.rows);
  } catch (err) { next(err); }
}

async function getAuditLogs(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const logs = await query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const total = await query(`SELECT COUNT(*) FROM audit_logs`);
    return successResponse(res, { logs: logs.rows, total: parseInt(total.rows[0].count) });
  } catch (err) { next(err); }
}

module.exports = { getSections, getAuditLogs };
