const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const ppteer = require('./pp');
const evalScripts = require('./evalDOM');

const COLOR_LEVEL = require('./ColorLevel')

class Structure {
  constructor({
      name,
      url,
      template,
      output = {},
      rootNode,
      parseNode,
      px2rem,
      device,
      headless,
      extraHTTPHeaders,
      writePageStructure,
    } = {}) {
      this.name = name;
      this.url = url;
      this.template = template
      this.filepath = output.filepath;
      this.injectSelector = output.injectSelector || '#app';
      this.rootNode = rootNode || '';
      this.parseNode = parseNode || (_ => {})
      this.px2rem = px2rem;
      this.device = device;
      this.headless = headless;
      this.extraHTTPHeaders = extraHTTPHeaders;
      this.writePageStructure = writePageStructure;

      if(this.headless === undefined) this.headless = true;

      if(!name){
        console.error('please provide entry name !', 1); 
      }
      if(!url) {
        console.error('please provide entry url !', 1); 
      }
      if(!template) {
        console.error('please provide output template !', 1); 
      }
      if(!fs.existsSync(template) || !fs.statSync(template).isFile()) {
        console.error('[template] should be a file !', 1); 
      }
      if(!fs.existsSync(template)) {
        console.error('[template:404] please provide the absolute filepath !', 1); 
      }
  }
  async generateSkeletonHTML(page) {
    let html = '';
    try{
      html = await page.evaluate(evalScripts, 
        {
          device: this.device,
          px2rem: this.px2rem,
          rootNode: this.rootNode,
          'Function:parseNode': this.parseNode.toString(),
          require: {
            COLOR_LEVEL
          }
        }
      )
    }catch(e){
      console.error('\n[page.evaluate] ' + e.message);
    }
    return html;

  }
  writeToFilepath(html) {
    let fileHTML = fs.readFileSync(this.template);
    let $ = cheerio.load(fileHTML, {
      decodeEntities: false
    });
    $(this.injectSelector).html(html);
    if(!fs.existsSync(this.filepath)) fs.mkdirSync(this.filepath)
    fs.writeFileSync(path.join(this.filepath, `${this.name}.html`), $.html('html'), { flag: 'w' });
  }
  async start() {
    const pageUrl = this.url;

    console.log('启动浏览器...')
    const pp = await ppteer({
      device: this.device,
      headless: this.headless
    });

    console.log(`正在打开页面：${ pageUrl }...`)
    const page = await pp.openPage(pageUrl, this.extraHTTPHeaders);

    console.log('正在生成骨架屏...');
    const html = await this.generateSkeletonHTML(page);

    if(typeof this.writePageStructure === 'function') {
      this.writePageStructure(html, this.template);
    }
    if(this.filepath) {
      this.writeToFilepath(html);
    }

    console.log('');
    console.log(`skeleton screen has created and output to ${this.filepath}`);
    console.log(`骨架屏已生成完毕.`);

    if(this.headless) {
      await pp.browser.close();
      process.exit(0);
    }
  }
}

module.exports = config => {
  return new Structure(config)
};
