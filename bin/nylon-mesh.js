#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const https = require('https');

const args = process.argv.slice(2);
const command = args[0] || 'start';

const REPO = 'AssetsArt/nylon-mesh';
const BINARY_NAME = 'nylon-mesh';

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
# redis_url: "redis://localhost:6379"
cache:
  t1_cap: 100000
  t1_ttl: 3
  t2_ttl: 30
  status:
    - 200
  content_types:
    - "text/html"
bypass:
  paths:
    - "/_next/"
    - "/api/"
  ext:
    - ".ico"
    - ".png"
# cache_control:
#   - value: "public, max-age=31536000, immutable"
#     paths:
#       - "/_next/static/"
#     ext:
#       - ".ico"
#       - ".png"
#       - ".jpg"
`;

function isMuslLinux() {
  // 1) Fast path: musl ld exists at a well-known location.
  for (const dir of ['/lib', '/usr/lib']) {
    try {
      if (fs.readdirSync(dir).some((f) => /^ld-musl-/.test(f))) return true;
    } catch (_) {}
  }
  // 2) Fallback: ldd prints "musl libc" on musl systems.
  try {
    const r = spawnSync('ldd', ['--version'], { encoding: 'utf8' });
    const out = `${r.stdout || ''}${r.stderr || ''}`;
    if (/musl/i.test(out)) return true;
  } catch (_) {}
  // 3) Explicit override.
  if (process.env.NYLON_MESH_LIBC === 'musl') return true;
  return false;
}

function getPlatformString() {
  const platform = process.platform;
  const arch = process.arch;

  let osStr = '';
  switch (platform) {
    case 'darwin': osStr = 'macos'; break;
    case 'linux': osStr = isMuslLinux() ? 'linux-musl' : 'linux-gnu'; break;
    case 'win32':
      console.error('❌ Windows is not currently supported.');
      process.exit(1);
    default: throw new Error(`Unsupported platform: ${platform}`);
  }

  let archStr = '';
  switch (arch) {
    case 'x64': archStr = 'x86_64'; break;
    case 'arm64': archStr = 'aarch64'; break;
    default: throw new Error(`Unsupported architecture: ${arch}`);
  }

  // Format: nylon-mesh-{platform}-{arch}{ext}
  return `nylon-mesh-${osStr}-${archStr}`;
}

function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'nylon-mesh-cli' }, ...options }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(httpsGet(res.headers.location, options));
      } else if (res.statusCode === 200) {
        resolve(res);
      } else {
        reject(new Error(`Failed with status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadBinary(targetPath, version) {
  if (!version) {
    console.error('Could not determine version. Please build from source using `cargo build --release`.');
    process.exit(1);
  }

  let platformName;
  try {
    platformName = getPlatformString();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const downloadUrl = `https://github.com/${REPO}/releases/download/${version}/${platformName}`;
  console.log(`Downloading ${platformName} (${version})...`);
  console.log(`From: ${downloadUrl}`);

  try {
    const res = await httpsGet(downloadUrl);
    const fileStream = fs.createWriteStream(targetPath);
    await new Promise((resolve, reject) => {
      res.pipe(fileStream);
      res.on('error', reject);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    });
    fs.chmodSync(targetPath, 0o755); // Make it executable
    console.log('Download complete.');
  } catch (err) {
    console.error('Download failed:', err.message);
    process.exit(1);
  }
}

async function main() {
  const packageJson = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8');
  const packageJsonObj = JSON.parse(packageJson);
  const expectedVersion = `v${packageJsonObj.version.split('-')[0]}`;
  const globalBinDir = path.join(os.homedir(), '.nylon-mesh', 'bin');
  const downloadedBinaryPath = path.join(globalBinDir, `${BINARY_NAME}-${expectedVersion}`);

  if (!fs.existsSync(globalBinDir)) {
    fs.mkdirSync(globalBinDir, { recursive: true });
  }

  const cleanupOldBinaries = () => {
    try {
      const files = fs.readdirSync(globalBinDir);
      for (const file of files) {
        if (file.startsWith(BINARY_NAME) && file !== `${BINARY_NAME}-${expectedVersion}`) {
          fs.unlinkSync(path.join(globalBinDir, file));
        }
      }
    } catch (e) { }
  };

  if (command === 'init') {
    const targetPath = path.join(process.cwd(), 'nylon-mesh.yaml');
    if (fs.existsSync(targetPath)) {
      console.error('nylon-mesh.yaml already exists.');
    } else {
      fs.writeFileSync(targetPath, DEFAULT_YAML);
      console.log('Created nylon-mesh.yaml!');
    }

    if (!fs.existsSync(downloadedBinaryPath)) {
      console.log(`Nylon Mesh binary (version ${expectedVersion}) not found. Downloading...`);
      cleanupOldBinaries();
      await downloadBinary(downloadedBinaryPath, expectedVersion);
    } else {
      console.log(`Binary (version ${expectedVersion}) already downloaded.`);
    }

    console.log(`Binary location: ${downloadedBinaryPath}`);
    console.log('Run `bunx nylon-mesh start` to start the proxy.');
    process.exit(0);
  }

  if (command === 'start') {
    let exeToRun = null;
    if (fs.existsSync(downloadedBinaryPath)) {
      exeToRun = downloadedBinaryPath;
    } else {
      console.log(`Nylon Mesh binary (version ${expectedVersion}) not found. Downloading...`);
      cleanupOldBinaries();
      await downloadBinary(downloadedBinaryPath, expectedVersion);
      exeToRun = downloadedBinaryPath;
    }

    let yamlPath = path.join(process.cwd(), 'nylon-mesh.yaml');
    if (args[1]) {
      yamlPath = path.resolve(process.cwd(), args[1]);
    }

    if (!fs.existsSync(yamlPath)) {
      console.error(`Config file not found at ${yamlPath}. Run \`bunx nylon-mesh init\` first.`);
      process.exit(1);
    }

    console.log(`Starting Nylon Mesh with config: ${yamlPath}`);
    const child = spawnSync(exeToRun, ['-c', yamlPath], { stdio: 'inherit' });
    process.exit(child.status || 0);
  }

  console.error(`Unknown command: ${command}`);
  console.error(`Usage:`);
  console.error(`  bunx nylon-mesh init   - Create a default config file and download binary`);
  console.error(`  bunx nylon-mesh start  - Start the proxy server`);
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
