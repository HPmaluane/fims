const { query, getClient } = require('../config/db');

function calcAlertLevel(pct) {
  if (pct === null || pct === undefined) return 'ok';
  if (pct < 60) return 'critical';
  if (pct < 75) return 'warning';
  return 'ok';
}

async function getAll({ inspector_id, location_id, status, from, to, role, userId } = {}) {
  let sql = `
    SELECT i.*,
           l.name  AS location_name,
           u.name  AS inspector_name,
           s.name  AS supervisor_name
    FROM inspections i
    JOIN locations l ON l.id = i.location_id
    JOIN users u     ON u.id = i.inspector_id
    LEFT JOIN users s ON s.id = i.supervisor_id
    WHERE 1=1`;
  const params = [];

  // Inspectors only see their own
  if (role === 'inspector') {
    params.push(userId); sql += ` AND i.inspector_id = $${params.length}`;
  }
  if (inspector_id) { params.push(inspector_id); sql += ` AND i.inspector_id = $${params.length}`; }
  if (location_id)  { params.push(location_id);  sql += ` AND i.location_id  = $${params.length}`; }
  if (status)       { params.push(status);        sql += ` AND i.status       = $${params.length}`; }
  if (from)         { params.push(from);          sql += ` AND i.inspection_date >= $${params.length}`; }
  if (to)           { params.push(to);            sql += ` AND i.inspection_date <= $${params.length}`; }

  sql += ' ORDER BY i.created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function getById(id) {
  const result = await query(
    `SELECT i.*, l.name AS location_name, u.name AS inspector_name, s.name AS supervisor_name
     FROM inspections i
     JOIN locations l ON l.id = i.location_id
     JOIN users u     ON u.id = i.inspector_id
     LEFT JOIN users s ON s.id = i.supervisor_id
     WHERE i.id = $1`,
    [id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Inspeção não encontrada.' };

  const inspection = result.rows[0];

  // Fetch items with section & template info
  const items = await query(
    `SELECT ii.*, ti.text, ti.code, ti.max_score, ts.name AS section_name, ts.code AS section_code
     FROM inspection_items ii
     JOIN template_items ti    ON ti.id = ii.template_item_id
     JOIN template_sections ts ON ts.id = ii.section_id
     WHERE ii.inspection_id = $1
     ORDER BY ts.sort_order, ti.sort_order`,
    [id]
  );
  inspection.items = items.rows;
  return inspection;
}

async function create({ location_id, inspector_id, supervisor_id, inspection_date, notes }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const insp = await client.query(
      `INSERT INTO inspections (location_id, inspector_id, supervisor_id, inspection_date, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [location_id, inspector_id, supervisor_id || null, inspection_date || new Date(), notes || null]
    );
    const inspection = insp.rows[0];

    // Clone all active template items into inspection_items
    const templateItems = await client.query(
      `SELECT ti.id, ti.section_id FROM template_items ti
       JOIN template_sections ts ON ts.id = ti.section_id
       WHERE ti.active = true AND ts.active = true
       ORDER BY ts.sort_order, ti.sort_order`
    );

    for (const item of templateItems.rows) {
      await client.query(
        `INSERT INTO inspection_items (inspection_id, template_item_id, section_id) VALUES ($1, $2, $3)`,
        [inspection.id, item.id, item.section_id]
      );
    }

    await client.query('COMMIT');
    return await getById(inspection.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateItems(id, items) {
  // items: [{ id, score, comment }]
  const inspection = await getById(id);
  if (['submitted', 'reviewed', 'closed'].includes(inspection.status)) {
    throw { status: 400, message: 'Inspeção já submetida. Não é possível editar.' };
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      await client.query(
        `UPDATE inspection_items SET score = $1, comment = $2 WHERE id = $3 AND inspection_id = $4`,
        [item.score ?? null, item.comment ?? null, item.id, id]
      );
    }

    // Recalculate score
    const scored = await client.query(
      `SELECT score, max_score FROM inspection_items ii
       JOIN template_items ti ON ti.id = ii.template_item_id
       WHERE ii.inspection_id = $1 AND ii.score IS NOT NULL`,
      [id]
    );

    let scorePct = null;
    if (scored.rows.length > 0) {
      const total   = scored.rows.reduce((s, r) => s + Number(r.score), 0);
      const maxPoss = scored.rows.length * 5;
      scorePct = Math.round((total / maxPoss) * 100);
    }

    const alertLevel = calcAlertLevel(scorePct);
    await client.query(
      `UPDATE inspections SET score_pct = $1, alert_level = $2, status = 'in_progress' WHERE id = $3`,
      [scorePct, alertLevel, id]
    );

    await client.query('COMMIT');
    return await getById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function submit(id, { notes } = {}) {
  const inspection = await getById(id);
  if (inspection.status === 'submitted') throw { status: 400, message: 'Inspeção já submetida.' };
  if (['reviewed', 'closed'].includes(inspection.status)) {
    throw { status: 400, message: 'Não é possível alterar o estado desta inspeção.' };
  }

  // Recalculate final score
  const scored = await query(
    `SELECT ii.score FROM inspection_items ii WHERE ii.inspection_id = $1 AND ii.score IS NOT NULL`, [id]
  );
  let scorePct = null;
  if (scored.rows.length > 0) {
    const total = scored.rows.reduce((s, r) => s + Number(r.score), 0);
    scorePct = Math.round((total / (scored.rows.length * 5)) * 100);
  }
  const alertLevel = calcAlertLevel(scorePct);

  const result = await query(
    `UPDATE inspections
     SET status = 'submitted', score_pct = $1, alert_level = $2,
         notes = COALESCE($3, notes), submitted_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [scorePct, alertLevel, notes || null, id]
  );
  return result.rows[0];
}

async function review(id, { notes } = {}) {
  const result = await query(
    `UPDATE inspections
     SET status = 'reviewed', notes = COALESCE($1, notes), reviewed_at = NOW()
     WHERE id = $2 AND status = 'submitted'
     RETURNING *`,
    [notes || null, id]
  );
  if (!result.rows.length) throw { status: 400, message: 'Apenas inspeções submetidas podem ser revisadas.' };
  return result.rows[0];
}

async function close(id) {
  const result = await query(
    `UPDATE inspections SET status = 'closed', closed_at = NOW()
     WHERE id = $1 AND status = 'reviewed' RETURNING *`,
    [id]
  );
  if (!result.rows.length) throw { status: 400, message: 'Apenas inspeções revisadas podem ser fechadas.' };
  return result.rows[0];
}

async function remove(id) {
  const result = await query(`DELETE FROM inspections WHERE id = $1 RETURNING id`, [id]);
  if (!result.rows.length) throw { status: 404, message: 'Inspeção não encontrada.' };
  return { id };
}

// Dashboard stats
async function getDashboardStats() {
  const [totals, byStatus, byLocation, byMonth, alerts] = await Promise.all([
    query(`SELECT COUNT(*) AS total,
           ROUND(AVG(score_pct),1) AS avg_score,
           COUNT(*) FILTER (WHERE alert_level='critical') AS critical,
           COUNT(*) FILTER (WHERE alert_level='warning')  AS warning
           FROM inspections WHERE score_pct IS NOT NULL`),
    query(`SELECT status, COUNT(*) AS count FROM inspections GROUP BY status`),
    query(`SELECT l.name, ROUND(AVG(i.score_pct),1) AS avg_score, COUNT(*) AS total
           FROM inspections i JOIN locations l ON l.id=i.location_id
           WHERE i.score_pct IS NOT NULL
           GROUP BY l.id, l.name ORDER BY avg_score DESC LIMIT 10`),
    query(`SELECT TO_CHAR(inspection_date,'YYYY-MM') AS month,
           ROUND(AVG(score_pct),1) AS avg_score, COUNT(*) AS total
           FROM inspections WHERE score_pct IS NOT NULL
           GROUP BY month ORDER BY month DESC LIMIT 12`),
    query(`SELECT i.*, l.name AS location_name, u.name AS inspector_name
           FROM inspections i JOIN locations l ON l.id=i.location_id
           JOIN users u ON u.id=i.inspector_id
           WHERE i.alert_level='critical' AND i.score_pct IS NOT NULL
           ORDER BY i.inspection_date DESC LIMIT 5`),
  ]);

  return {
    totals:     totals.rows[0],
    byStatus:   byStatus.rows,
    byLocation: byLocation.rows,
    byMonth:    byMonth.rows.reverse(),
    alerts:     alerts.rows,
  };
}

module.exports = { getAll, getById, create, updateItems, submit, review, close, remove, getDashboardStats };
