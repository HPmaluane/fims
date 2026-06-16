const { query } = require('../config/db');

async function getAll() {
  const result = await query(
    `SELECT l.*, u.name AS supervisor_name
     FROM locations l
     LEFT JOIN users u ON u.id = l.supervisor_id
     WHERE l.active = true
     ORDER BY l.name ASC`
  );
  return result.rows;
}

async function getById(id) {
  const result = await query(
    `SELECT l.*, u.name AS supervisor_name
     FROM locations l
     LEFT JOIN users u ON u.id = l.supervisor_id
     WHERE l.id = $1`,
    [id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Localização não encontrada.' };
  return result.rows[0];
}

async function create({ name, address, supervisor_id }) {
  const result = await query(
    `INSERT INTO locations (name, address, supervisor_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name.trim(), address || null, supervisor_id || null]
  );
  return result.rows[0];
}

async function update(id, { name, address, supervisor_id, active }) {
  await getById(id);
  const updates = []; const params = [];
  if (name !== undefined)        { params.push(name.trim());    updates.push(`name = $${params.length}`); }
  if (address !== undefined)     { params.push(address);        updates.push(`address = $${params.length}`); }
  if (supervisor_id !== undefined){ params.push(supervisor_id); updates.push(`supervisor_id = $${params.length}`); }
  if (active !== undefined)      { params.push(active);         updates.push(`active = $${params.length}`); }
  if (!updates.length) return getById(id);
  params.push(id);
  const result = await query(
    `UPDATE locations SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await query(
    `UPDATE locations SET active = false WHERE id = $1 RETURNING *`, [id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Localização não encontrada.' };
  return result.rows[0];
}

module.exports = { getAll, getById, create, update, remove };
