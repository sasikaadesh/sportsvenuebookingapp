// Quick TypeScript build test
// Run this to verify the build works: node typescript-build-test.js

const { execSync } = require('child_process');

console.log('🔍 Testing TypeScript build...');

try {
  // Test TypeScript compilation
  console.log('Running: npx tsc --noEmit');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
  
  // Test Next.js build
  console.log('\nRunning: npm run build');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js build successful!');
  
  console.log('\n🎉 All builds passed! Ready for deployment.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
