const path = require('node:path');
const { rcedit } = require('rcedit');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;
  const exePath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  await rcedit(exePath, { icon: path.join(__dirname, '..', 'build', 'icon.ico') });
};
