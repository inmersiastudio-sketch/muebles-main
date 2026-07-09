import crypto from 'crypto';

console.log('\n🔐 GENERADOR DE CLAVES SECRETAS PARA PRODUCCIÓN\n');
console.log('='.repeat(60));

// JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n✅ JWT_SECRET (copiar a Railway):');
console.log(jwtSecret);

// Admin API Key (32 bytes)
const adminKey = crypto.randomBytes(32).toString('hex');
console.log('\n✅ ADMIN_API_KEY (copiar a Railway):');
console.log(adminKey);

console.log('\n' + '='.repeat(60));
console.log('\n📋 COPIAR ESTAS VARIABLES A RAILWAY:\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ADMIN_API_KEY=${adminKey}`);
console.log('\n');
