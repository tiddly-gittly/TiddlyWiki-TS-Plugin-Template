import archiver from 'archiver';

const packageJSON = fs.readJsonSync('package.json');

const repoDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, '..', 'dist');
const nodejsPluginOutDir = path.join(distDir, 'plugins', packageJSON.author, packageJSON.name);
// cross platform cp -r ${repoDir}/src/ ${nodejsPluginOutDir}/
const copyOptions = {
  filter: (src, dest) => {
    if (!src.endsWith('.ts')) {
      // Return true to copy the item
      return true;
    }
  },
};
await fs.copy(path.join(repoDir, 'src'), nodejsPluginOutDir, copyOptions);

// zip folder for nodejs wiki
/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const outPath = path.join(__dirname, '..', 'plugins.zip');
await zipDirectory(path.join(__dirname, '..', 'dist'), outPath);
await fs.move(outPath, path.join(distDir, 'out', 'plugins.zip'));
