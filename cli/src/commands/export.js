const {Command, flags} = require('@oclif/command');
const path = require('path');
const fs = require('fs');
const {Script} = require('vm');
const colors = require('colors');
const WebpackHelper = require('../webpack/webpack.helper');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

class ExportCommand extends Command {
  async run() {
    const {flags} = this.parse(ExportCommand);
    const file = flags.file || 'src/pages.json';
    const environment = flags.prod ? 'prod' : 'dev';

    let timeStarted = Date.now();

    const executionDir = process.cwd();
    const webpack = WebpackHelper.createWebpack(environment, executionDir, {});

    webpack.compiler.run(async (err, stats) => {
      if (err) {
        throw (err);
      }

      this.log(`initial build (${(Date.now() - timeStarted) / 1000}s)`.green);
      timeStarted = Date.now();

      const bundleRaw = fs.readFileSync(path.join(webpack.config.output.path, webpack.config.output.filename));
      const bundleScript = new Script(bundleRaw);
      this.log(`bundle.js loaded (${(Date.now() - timeStarted) / 1000}s)`.green);
      timeStarted = Date.now();
      const exportConf = require(path.join(executionDir, 'src/export.js'));
      this.log(`export.js loaded (${(Date.now() - timeStarted) / 1000}s)`.green);

      const domRaw = fs.readFileSync(path.join(webpack.config.output.path, 'index.html'));

      for (let pathString of exportConf.pages) {
        const canonical = pathString.replace(/^\/|\/([#?].*)?$/, '');
        console.log(canonical);
        const filePathOut = canonical ? `${canonical}.html` : 'index.html';
        console.log(filePathOut);
        const initialState = await exportConf.getInitialState(pathString);
        const dom = new JSDOM(domRaw, {
          url: 'http://localhost/',
          referrer: 'http://localhost/',
          contentType: 'text/html',
          includeNodeLocations: false,
          runScripts: 'outside-only'
        });

        const stateScript = dom.window.document.createElement('script');
        dom.window.document.head.appendChild(stateScript);
        stateScript.innerHTML = `document.initialState=${JSON.stringify(initialState)};`;
        dom.window.document.initialState = initialState;
        dom.window.document.isServer = true;

        this.log(`index.html loaded (${(Date.now() - timeStarted) / 1000}s)`.green);
        timeStarted = Date.now();
        dom.runVMScript(bundleScript);
        fs.writeFileSync(path.join(webpack.config.output.path, filePathOut), dom.serialize());
        this.log(`${pathString} (${filePathOut}) rendered (${(Date.now() - timeStarted) / 1000}s)`.green);
        timeStarted = Date.now();
      }
      this.log(`SUCCESS (${(Date.now() - timeStarted) / 1000}s)`.green);
    });
  }
}

ExportCommand.description = `export pre-rendered pages by your ./src/pages.json
...
`;

ExportCommand.flags = {
  file: flags.string({char: 'f', description: 'load pages from another file'}),
  prod: flags.boolean({char: 'p', description: 'run in production mode'}),
};

module.exports = ExportCommand;
