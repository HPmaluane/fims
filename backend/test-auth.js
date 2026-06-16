const bcrypt = require('bcryptjs');
const { query } = require('./src/config/db');

async function testAuth() {
  console.log('=== Testing Authentication ===\n');
  
  // Verificar usuário
  const result = await query('SELECT id, email, password FROM users WHERE email = $1', ['teste@fims.co.mz']);
  
  if (result.rows.length === 0) {
    console.log('❌ User not found');
    return;
  }
  
  const user = result.rows[0];
  console.log('User found:', user.email);
  console.log('Password hash:', user.password.substring(0, 50) + '...');
  
  // Testar senha
  const password = 'fims2025';
  const isValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValid);
  
  if (isValid) {
    console.log('✅ Authentication would work!');
  } else {
    console.log('❌ Password hash mismatch');
    
    // Gerar hash correto
    const newHash = await bcrypt.hash(password, 10);
    console.log('Correct hash for "fims2025":', newHash);
    console.log('\nRun: UPDATE users SET password = \'' + newHash + '\' WHERE email = \'' + user.email + '\';');
  }
}

testAuth();
