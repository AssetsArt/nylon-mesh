import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const pkgPath = join(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  console.log(`🚀 Publishing ${pkg.name} v${pkg.version} to npm...`);

  // Run npm publish with public access for scoped packages
  execSync('npm publish --access public', { stdio: 'inherit' });

  console.log(`\n✅ Successfully published v${pkg.version} to npm!`);
} catch (err) {
  console.error('\n❌ Failed to publish to npm:', err.message);
  process.exit(1);
}
