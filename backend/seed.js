const bcrypt = require('bcryptjs');
const { query } = require('./src/config/db');

async function seed() {
  console.log('🌱 Seeding database...');
  
  const hashedPassword = await bcrypt.hash('fims2025', 10);
  
  try {
    // Insert users
    await query(`
      INSERT INTO users (email, password, name, role, avatar, active)
      VALUES 
        ('admin@fims.co.mz', $1, 'Admin Sistema', 'admin', 'AD', true),
        ('ceo@fims.co.mz', $1, 'CEO Teste', 'ceo', 'CE', true),
        ('supervisor@fims.co.mz', $1, 'Supervisor Teste', 'supervisor', 'SU', true),
        ('inspector1@fims.co.mz', $1, 'Inspector João', 'inspector', 'JT', true),
        ('inspector2@fims.co.mz', $1, 'Inspector Maria', 'inspector', 'MN', true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    
    console.log('✅ Users seeded');
    
    // Get supervisor ID
    const supervisorResult = await query(`SELECT id FROM users WHERE role = 'supervisor' LIMIT 1`);
    const supervisorId = supervisorResult.rows[0]?.id;
    
    if (supervisorId) {
      // Insert locations
      await query(`
        INSERT INTO locations (name, address, "supervisorId")
        VALUES 
          ('Baker Hughes', 'Av. Julius Nyerere, Maputo', $1),
          ('Bayport', 'Av. 24 de Julho, Maputo', $1),
          ('Biofund', 'Av. Marginal, Maputo', $1),
          ('Radisson Hotel', 'Av. Julius Nyerere 1234, Maputo', $1),
          ('Casino', 'Av. da Marginal, Maputo', $1),
          ('Hollard Seguros', 'Rua dos Desportistas, Maputo', $1)
        ON CONFLICT (name) DO NOTHING
      `, [supervisorId]);
      
      console.log('✅ Locations seeded');
    }
    
    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
