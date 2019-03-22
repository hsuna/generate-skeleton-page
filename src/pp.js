const ppteer = require('puppeteer');

const devices = {
  mobile: [375, 667, 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'],
  ipad: [1024, 1366, 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1'],
  pc: [1920, 1000, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Chrome/72.0.3626.121 Safari/604.1']
};

async function pp({device = 'mobile', headless = true}) {
  const browser = await ppteer.launch({headless});
  
  async function openPage(url, extraHTTPHeaders) {
    const page = await browser.newPage();
    try{
      let deviceSet = devices[device];
      page.setUserAgent(deviceSet[2]);
      page.setViewport({width: deviceSet[0], height: deviceSet[1]});

      if(extraHTTPHeaders && typeof extraHTTPHeaders === 'object' && !Array.isArray(extraHTTPHeaders)) {
        await page.setExtraHTTPHeaders(new Map(Object.entries(extraHTTPHeaders)));
      }
      await page.goto(url, {
        waitUntil: 'networkidle0'
      });
    }catch(e){
      console.log('\n');
      console.error(e.message);
    }
    return page;
  }
  return {
    browser,
    openPage
  }
};

module.exports = pp;