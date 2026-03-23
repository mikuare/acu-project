const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const bindingsByPlatformAndArch = {
  android: {
    arm: { base: 'android-arm-eabi' },
    arm64: { base: 'android-arm64' },
  },
  darwin: {
    arm64: { base: 'darwin-arm64' },
    x64: { base: 'darwin-x64' },
  },
  linux: {
    arm: { base: 'linux-arm-gnueabihf', musl: 'linux-arm-musleabihf' },
    arm64: { base: 'linux-arm64-gnu', musl: 'linux-arm64-musl' },
    ppc64: { base: 'linux-powerpc64le-gnu', musl: null },
    riscv64: { base: 'linux-riscv64-gnu', musl: null },
    s390x: { base: 'linux-s390x-gnu', musl: null },
    x64: { base: 'linux-x64-gnu', musl: 'linux-x64-musl' },
  },
  win32: {
    arm64: { base: 'win32-arm64-msvc' },
    ia32: { base: 'win32-ia32-msvc' },
    x64: { base: 'win32-x64-msvc' },
  },
};

function isMusl() {
  return process.platform === 'linux' &&
    process.report &&
    typeof process.report.getReport === 'function' &&
    !process.report.getReport().header.glibcVersionRuntime;
}

function getExpectedPackageBase() {
  const platformBindings = bindingsByPlatformAndArch[process.platform];
  const imported = platformBindings?.[process.arch];

  if (!imported) {
    return null;
  }

  if ('musl' in imported && isMusl()) {
    return imported.musl || null;
  }

  return imported.base;
}

function getInstalledRollupPackages() {
  const rollupDir = path.join(process.cwd(), 'node_modules', '@rollup');

  if (!fs.existsSync(rollupDir)) {
    return [];
  }

  return fs.readdirSync(rollupDir).filter((name) => name.startsWith('rollup-'));
}

function main() {
  const expectedBase = getExpectedPackageBase();
  if (!expectedBase) {
    return;
  }

  const expectedPackageName = `@rollup/rollup-${expectedBase}`;
  try {
    require.resolve(expectedPackageName);
    return;
  } catch {
    const installed = getInstalledRollupPackages();
    const hasOtherPlatformRollup = installed.length > 0;

    console.error('');
    console.error('Rollup native package mismatch detected.');
    console.error(`Expected: ${expectedPackageName}`);
    console.error(`Current platform: ${process.platform} ${process.arch}`);

    if (hasOtherPlatformRollup) {
      console.error(`Installed @rollup packages: ${installed.join(', ')}`);
      console.error('This usually means node_modules was installed from a different OS.');
    }

    console.error('');
    if (process.platform === 'win32') {
      console.error('Fix on Windows:');
      console.error('1. Delete node_modules');
      console.error('2. Run npm install');
      console.error('3. Run npm run dev again');
      console.error('');
      console.error('If you switch between WSL/Linux and Windows in the same project folder, keep separate installs.');
      console.error('Do not reuse the same node_modules across both environments.');
    } else {
      console.error('Fix on this platform:');
      console.error('1. Delete node_modules');
      console.error('2. Run npm install');
      console.error('3. Run the command again');
    }

    process.exit(1);
  }
}

main();
