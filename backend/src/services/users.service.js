const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function getAll({ role, active } = {}) {
  let sql = 'SELECT id, name, email, role, avatar, active, created_at FROM users WHERE 1=1';
  const params = [];
  if (role) { params.push(role); sql += ` AND role = $${params.length}`; }
  if (active !== undefined) { params.push(active); sql += ` AND active = $${params.length}`; }
  sql += ' ORDER BY name ASC';
  const result = await query(sql, params);
  return result.rows;
}

async function getById(id) {
  const result = await query(
    'SELECT id, name, email, role, avatar, active, created_at FROM users WHERE id = $1',
    [id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Utilizador não encontrado.' };
  return result.rows[0];
}

async function update(id, { name, email, role, active, password }) {
  const user = await getById(id);

  const updates = [];
  const params = [];

  if (name !== undefined)   { params.push(name);   updates.push(`name = $${params.length}`); }
  if (email !== undefined)  { params.push(email.toLowerCase().trim()); updates.push(`email = $${params.length}`); }
  if (role !== undefined)   { params.push(role);   updates.push(`role = $${params.length}`); }
  if (active !== undefined) { params.push(active); updates.push(`active = $${params.length}`); }
  if (password)             {
    const hash = await bcrypt.hash(password, 12);
    params.push(hash);
    updates.push(`password = $${params.length}`);
  }

  if (!updates.length) return user;

  params.push(id);
  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}
     RETURNING id, name, email, role, avatar, active, created_at`,
    params
  );
  return result.rows[0];
}

async function remove(id) {
  // Soft delete — deactivate
  const result = await query(
    `UPDATE users SET active = false WHERE id = $1
     RETURNING id, name, email, role, active`,
    [id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Utilizador não encontrado.' };
  return result.rows[0];
}

module.exports = { getAll, getById, update, remove };
