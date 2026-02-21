#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const command = args[0] || 'start';

const DEFAULT_YAML = `# threads: 10
# liveness_path: "/_health/live"
# readiness_path: "/_health/ready"
# grace_period_seconds: 0
# graceful_shutdown_timeout_seconds: 0
listen: "0.0.0.0:3000"
# tls:
#   listen: "0.0.0.0:443"
#   certs:
#     - host: "default"
#       cert_path: "cert.pem"
#       key_path: "key.pem"
upstreams:
  - "127.0.0.1:3001"
  # - address: "127.0.0.1:3002"
    # weight: 5
load_balancer_algo: "round_robin"
redis_url: "redis://localhost:6379"
cache:
  tier1_capacity: 10000
  tier1_ttl_seconds: 3
  tier2_ttl_seconds: 60
bypass:
  paths:
    - "/_next/"
    - "/api/"
  extensions:
    - ".ico"
    - ".png"
# cache_control:
#   - value: "public, max-age=31536000, immutable"
#     paths:
#       - "/_next/static/"
#     extensions:
#       - ".ico"
#       - ".png"
#       - ".jpg"
`;

if (command === 'init') {
  const targetPath = path.join(process.cwd(), 'nylon-mesh.yaml');
  if (fs.existsSync(targetPath)) {
    console.error('nylon-mesh.yaml already exists.');
    process.exit(1);
  }
  fs.writeFileSync(targetPath, DEFAULT_YAML);
  console.log('Created nylon-mesh.yaml!');
  console.log('Run `npx nylon-mesh start` to start the proxy.');
  process.exit(0);
}

if (command === 'start') {
  const binaryPath = path.join(__dirname, '..', 'target', 'release', 'nylon-mesh');
  const debugBinaryPath = path.join(__dirname, '..', 'target', 'debug', 'nylon-mesh');

  let exeToRun = binaryPath;
  if (!fs.existsSync(binaryPath)) {
    if (fs.existsSync(debugBinaryPath)) {
      exeToRun = debugBinaryPath;
    } else {
      console.error('Nylon Mesh binary not found. Please run `bun run build` or `cargo build` first.');
      process.exit(1);
    }
  }

  let yamlPath = path.join(process.cwd(), 'nylon-mesh.yaml');
  if (args[1]) {
    yamlPath = path.resolve(process.cwd(), args[1]);
  }

  if (!fs.existsSync(yamlPath)) {
    console.error(`Config file not found at ${yamlPath}. Run \`npx nylon-mesh init\` first.`);
    process.exit(1);
  }

  console.log(`Starting Nylon Mesh with config: ${yamlPath}`);
  const child = spawnSync(exeToRun, [yamlPath], { stdio: 'inherit' });
  process.exit(child.status || 0);
}

console.error(`Unknown command: ${command}`);
console.error(`Usage:`);
console.error(`  npx nylon-mesh init   - Create a default config file`);
console.error(`  npx nylon-mesh start  - Start the proxy server`);
process.exit(1);
