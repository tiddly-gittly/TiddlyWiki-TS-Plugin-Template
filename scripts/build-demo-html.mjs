import { cd } from "zx";

/**
 * Put plugin into demo folder
 */
const packageJSON = fs.readJsonSync('package.json');
const pluginTitle = `${packageJSON.author}/${packageJSON.name}`;

const repoDir = path.resolve(__dirname, '..');
const distDir = path.join(repoDir, 'dist');
const jsonPluginFileName = `$__plugins_${pluginTitle.replace('/', '_')}.json`;
// copy demo
await fs.copy(path.join(repoDir, 'demo'), distDir);
// copy json plugin
await fs.copy(path.join(distDir, 'out', jsonPluginFileName), path.join(distDir, 'tiddlers', jsonPluginFileName));

/**
 * Make demo html file
 */
const htmlPath = `${distDir}/output/index.html`;

/**
 * Same as `cross-env TIDDLYWIKI_PLUGIN_PATH='node_modules/tiddlywiki/plugins/published' TIDDLYWIKI_THEME_PATH='${wikiFolderName}/themes'`
 * 
 * But we don't need this, because we put the JSON plugin into the dist folder, it will be loaded automatically
 */
// process.env.TIDDLYWIKI_PLUGIN_PATH = `${distDir}/plugins`;


cd(distDir)
await $`tiddlywiki ${distDir} --build externalimages`;
await $`tiddlywiki ${distDir} --build externaljs`;
// build dll.js and config tw to load it
// original filename contains invalid char, will cause static server unable to load it
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const htmlContentWithCorrectJsPath = htmlContent.replaceAll('%24%3A%2Fcore%2Ftemplates%2Ftiddlywiki5.js', 'tiddlywiki5.js');
await fs.writeFile(htmlPath, htmlContentWithCorrectJsPath);
