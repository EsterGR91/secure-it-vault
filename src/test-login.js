const { login } = require('./services/auth.service');

async function testLogin() {
  try {
    const user = await login('admin', 'Admin123!');
    console.log('✅ Login exitoso:', user);
    process.exit(0);
  } catch (err) {
    console.error('❌ Login fallido:', err.message);
    process.exit(1);
  }
}

testLogin();
