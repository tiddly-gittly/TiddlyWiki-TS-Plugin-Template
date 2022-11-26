/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import fs from 'fs-extra';
import esbuild from 'esbuild';
import browserslist from 'browserslist';
import { esbuildPluginBrowserslist } from 'esbuild-plugin-browserslist';
import tw from 'tiddlywiki';
import CleanCSS from 'clean-css';
import { walkFilesAsync } from './utils.mjs';

const SOURCE_DIRECTORY = 'src';
const DISTNATION_DIRECTORY = 'dist';
const WIKI_DIRECTORY = 'demo';
const WIKI_TIDDLERS_DIRECTORY = `${WIKI_DIRECTORY}/tiddlers`;
const ENTRANCE_EXT_LIST = new Set(['.ts', '.tsx', '.jsx', '.mjs']);
const pluginInfo = fs.readJsonSync('src/plugin.info');
const [_, __, author, name] = pluginInfo.title.split('/');
const pluginTitle = `${author}/${name}`;
const DIST_PLUGIN_DIRECTORY = path.join(DISTNATION_DIRECTORY, 'plugins', pluginTitle);

export const cleanDist = async () => {
  const distJsTiddler = /^.*\.js\.dist\.tid$/;
  await walkFilesAsync(DISTNATION_DIRECTORY, (dir) => {
    if (distJsTiddler.test(dir)) fs.rmSync(dir);
  });
  const distPluginTiddler = /^.*\.json\.dist\.json$/;
  await walkFilesAsync(WIKI_TIDDLERS_DIRECTORY, (dir) => {
    if (distPluginTiddler.test(dir)) fs.rmSync(dir);
  });
  fs.rmSync('dist', { recursive: true, force: true });
};

export const findAllEntries = async (previousEntryList) => {
  previousEntryList = previousEntryList || [];
  let entryChanged = false;
  const entryList = [];
  const outputMetaMap = {};
  await walkFilesAsync(SOURCE_DIRECTORY, (dir) => {
    const metaDirectory = `${dir.replace(path.extname(dir), '.js')}.meta`;
    const dirInfo = path.parse(dir);
    if (ENTRANCE_EXT_LIST.has(path.extname(dir).toLowerCase())) {
      if (fs.existsSync(metaDirectory)) {
        entryList.push(dir);
        if (!entryChanged && !previousEntryList.includes(dir)) entryChanged = true;
        outputMetaMap[`${path.join(dirInfo.dir, dirInfo.name)}.js`] = fs.readFileSync(metaDirectory).toString('utf8');
      }
    } else if (dir.endsWith('.css.meta')) {
      outputMetaMap[path.join(dirInfo.dir, dirInfo.name)] = fs.readFileSync(metaDirectory.replace('.js', '')).toString('utf8');
    }
  });
  if (!entryChanged) {
    const length_ = previousEntryList.length;
    for (let index = 0; index < length_; index++) {
      if (entryList.includes(previousEntryList[index])) continue;
      entryChanged = true;
      break;
    }
  }
  return [entryList, outputMetaMap, entryChanged];
};

export const buildEntries = async (entries, metaMap) => {
  // Build .ts, .tsx, .jsx to .js.dist.tid
  const buildResult = await esbuild.build({
    entryPoints: entries,
    bundle: true,
    minify: false,
    write: false,
    incremental: true,
    outdir: DISTNATION_DIRECTORY,
    sourcemap: false,
    format: 'cjs',
    treeShaking: true,
    platform: 'browser',
    external: ['$:/*', 'react', 'react-dom'],
    plugins: [
      // http://browserl.ist/?q=%3E0.25%25%2C+not+ie+11%2C+not+op_mini+all
      esbuildPluginBrowserslist(browserslist(['last 2 versions']), {
        printUnknownTargets: false,
      }),
    ],
  });
  buildResult.outputFiles.forEach((out) => {
    const outName = path.basename(out.path);
    const outKey = out.path.replace(path.resolve(DISTNATION_DIRECTORY), SOURCE_DIRECTORY);
    fs.writeFileSync(
      path.join(DISTNATION_DIRECTORY, 'tiddlers', `${outName}.dist.tid`),
      `${metaMap[outKey]}\n\n${out.text
        .replace('module.exports = ', '')
        // fix Cannot find module named 'react-dom/server
        .replace(' = __require("react-dom/server")', '')
        .replace(' = require("react-dom/server")', '')}`,
    );
  });
};

// .replaceAll(
//     /module\.exports\s*=\s*__toCommonJS\(demo_exports\)/g,
//     'Object.assign(exports, __toCommonJS(demo_exports))',
//   )

export const initTiddlyWiki = async (_$tw, arguments_) => {
  // copy demo
  await fs.copy(path.join(process.cwd(), 'demo'), DISTNATION_DIRECTORY);
  const $tw = tw.TiddlyWiki(_$tw);
  $tw.boot.argv = arguments_ || [DISTNATION_DIRECTORY];
  $tw.boot.boot();
  return $tw;
};

const cleanCSS = new CleanCSS({
  compatibility: 'ie8',
  level: 2,
});

const excludeFiles = /^.*\.(tsx?|jsx|meta|swp|mjs)$|^\.(git|hg|lock-wscript|svn|DS_Store|(wafpickle-|_).*)$|^CVS$|^npm-debug\.log$/;

export const exportPlugins = ($tw, minify, exportToDistribution, exportToWiki) => {
  if (fs.existsSync(DIST_PLUGIN_DIRECTORY)) {
    // Ignore ts, tsx, jsm and jsx
    if (exportToDistribution) fs.mkdirsSync(DISTNATION_DIRECTORY);
    const directory = DIST_PLUGIN_DIRECTORY;
    const directoryStat = fs.statSync(directory);
    if (!directoryStat.isDirectory()) return;
    const pluginInfo = $tw.loadPluginFolder(directory, excludeFiles);
    const pluginTiddlerName = `${path.basename($tw.utils.generateTiddlerFilepath(pluginInfo.title, {}))}.json`;
    if (exportToWiki) fs.writeJSONSync(path.join(WIKI_TIDDLERS_DIRECTORY, `${pluginTiddlerName}.dist.json`), pluginInfo);
    if (exportToDistribution) fs.writeJSONSync(path.join('dist', 'tiddlers', pluginTiddlerName), pluginInfo);
  }
};
