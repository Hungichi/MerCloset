import crypto from 'crypto';

// Generate a strong JWT secret
const generateSecret = () => {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('🔐 Generated JWT Secret:');
  console.log('=====================================');
  console.log(secret);
  console.log('=====================================');
  console.log('');
  console.log('📝 Copy this to your .env file as:');
  console.log(`JWT_SECRET=${secret}`);
  console.log('');
  console.log('⚠️  Keep this secret secure and never share it!');
};

generateSecret(); 