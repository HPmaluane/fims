const bcrypt = require('bcryptjs');
const { query } = require('./src/config/db');

async function createTestUser() {
  try {
    const hash = await bcrypt.hash('fims2025', 10);
    
    // Remover usuário existente se houver
    await query('DELETE FROM users WHERE email = $1', ['teste@fims.co.mz']);
    
    // Criar novo usuário
    await query(`
      INSERT INTO users (email, password, name, role, avatar, active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['teste@fims.co.mz', hash, 'Usuário Teste', 'inspector', 'UT', true]);
    
    console.log('✅ Test user created: teste@fims.co.mz / fims2025');
    
    // Testar login
    const result = await query('SELECT id, email, password FROM users WHERE email = $1', ['teste@fims.co.mz']);
    console.log('User created:', result.rows[0].email);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
