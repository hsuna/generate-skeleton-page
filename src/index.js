const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const merge = require('merge');

const ppteer = require('./pp');
const evalScripts = require('./evalDOM');

const COLOR_LEVEL = require('./ColorLevel')

const DEFAULT_OPTIONS = {
  puppeteer: {
    device: 'pc',
    page: {
      url: '',
      extraHTTPHeaders: null,
    },
    launch: {
      headless: true,
    },
    delay: 0,
  },
  output: {
    name: 'index',
    template: '',
    filepath: '',
    injectSelector: '#app',
    writePageStructure(){},
  },
  evalParams:{
    id: 'SKELETON_SCRIPT',
    rootNode: '',
    px2rem: 0,
    parseNode(){},
  },
}

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

const createEvalParams = params => Object.assign(
  ...Object.keys(params).map(key => 
    'function' === typeof params[key] 
    ?{[`Function:${key}`]: params[key].toString()}
    :{[key]: params[key]}
  )
)

class Structure {
  constructor(options = {}) {
    this.options = merge.recursive(true, {}, DEFAULT_OPTIONS, options)

    const { puppeteer, output } = this.options
    if (!output.name) {
      console.error('please provide entry name !', 1);
    }
    if (!puppeteer.page.url) {
      console.error('please provide entry url !', 1);
    }
    if (!output.template) {
      console.error('please provide output template !', 1);
    }
    if (!fs.existsSync(output.template) || !fs.statSync(output.template).isFile()) {
      console.error('[template] should be a file !', 1);
    }
    if (!fs.existsSync(output.template)) {
      console.error('[template:404] please provide the absolute filepath !', 1);
    }
  }
  async generateSkeletonHTML(page) {
    let html = '';
    try {
      html = await page.evaluate(evalScripts, {
        ...createEvalParams(this.options.evalParams),
        require: {
          COLOR_LEVEL
        }
      })
    } catch (e) {
      console.error('\n[page.evaluate] ' + e.message);
    }
    return html;
  }
  writeToFilepath(html) {
    const { output } = this.options
    output.writePageStructure(html. output);

    const fileHTML = fs.readFileSync(output.template);
    const $ = cheerio.load(fileHTML, {
      decodeEntities: false
    });
    $(output.injectSelector).html(html);
    if (!fs.existsSync(output.filepath)) fs.mkdirSync(output.filepath)
    fs.writeFileSync(path.join(output.filepath, `${output.name}.html`), $.html('html'), { flag: 'w' });
    console.log(`skeleton screen has created and output to ${output.filepath}`);
  }
  async start() {
    const { puppeteer } = this.options;

    console.log('启动浏览器...')
    const pp = await ppteer(puppeteer);

    console.log(`正在打开页面：${puppeteer.page.url}...`)
    const page = await pp.openPage(puppeteer.page);

    if(puppeteer.delay > 0){
      console.log(`打开页面 waitimg [${puppeteer.delay}]...`)
      await sleep(puppeteer.delay)
      console.log(`打开页面 wait over...`)
    }

    console.log('正在生成骨架屏...');
    const html = await this.generateSkeletonHTML(page);
    
    console.log('');
    this.writeToFilepath(html);
    console.log(`骨架屏已生成完毕.`);

    if (puppeteer.launch.headless) {
      await pp.browser.close();
      process.exit(0);
    }
  }
}

module.exports = config => {
  return new Structure(config)
};