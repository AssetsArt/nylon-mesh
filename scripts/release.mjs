import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

// Get version from standard arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error("❌ Please specify a version. Example: bun run release 1.0.0");
  process.exit(1);
}

// Clean and validate semantic version tag
const cleanVersion = newVersion.replace(/^v/, "");

if (
  !/^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(
    cleanVersion,
  )
) {
  console.error(`❌ Invalid semantic version: ${newVersion}`);
  process.exit(1);
}

const tagVersion = `v${cleanVersion}`;

console.log(`📦 Bumping version to: ${cleanVersion} (Tag: ${tagVersion})`);

try {
  // Update package.json
  console.log("📝 Updating package.json...");
  const pkgPath = join(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.version = cleanVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Update Cargo.toml
  console.log("📝 Updating Cargo.toml...");
  const processCargoPath = join(process.cwd(), "Cargo.toml");
  let cargoToml = readFileSync(processCargoPath, "utf8");
  cargoToml = cargoToml.replace(
    /^version\s*=\s*"[^"]+"/m,
    `version = "${cleanVersion}"`,
  );
  writeFileSync(processCargoPath, cargoToml);

  // Run Git Commands
  console.log("🔖 Preparing git commit...");
  execSync("git add package.json Cargo.toml", { stdio: "inherit" });

  const hasChanges =
    execSync("git status --porcelain package.json Cargo.toml")
      .toString()
      .trim() !== "";

  if (hasChanges) {
    console.log("🚀 Creating git commit...");
    execSync(`git commit -m "chore: release ${tagVersion}"`, {
      stdio: "inherit",
    });
  } else {
    console.log(
      "⚠️ No changes in package.json or Cargo.toml. Skipping commit.",
    );
  }

  console.log("🔖 Creating git tag...");
  const tagExists =
    execSync(`git tag -l ${tagVersion}`).toString().trim() !== "";
  if (tagExists) {
    console.log(`⚠️ Tag ${tagVersion} already exists locally. Re-creating...`);
    execSync(`git tag -d ${tagVersion}`, { stdio: "inherit" });
  }
  execSync(`git tag ${tagVersion}`, { stdio: "inherit" });

  console.log("\n✅ Release prepared successfully!");
  console.log(
    `\n🚀 To push the release, run:\n   git push origin main && git push origin ${tagVersion} --force`,
  );
} catch (err) {
  console.error("\n❌ Error during release:", err.message);
  process.exit(1);
}
