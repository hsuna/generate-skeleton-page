# generate-skeleton-page

> 骨架屏生成工具 <br/>
> 作者：Hsuna <br/>
> 时间：2019/03/25



name //
url  // 待生成骨架屏页面的地址
filepath   // 
injectSelector // 生成的骨架屏插入页面的节点


> 配置参数

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|----|----|----|----|----|
| puppeteer |  | string | pc/mobile/ipad| pc |
| output |  | string | pc/mobile/ipad| pc |
| evalParams |  | string | pc/mobile/ipad| pc |

- puppeteer

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|----|----|----|----|----|
| device |  | string | pc/mobile/ipad| pc |
| page |  | object | — | — |
| page.url |  | string | — | — |
| page.extraHTTPHeaders |  | object | — | null |
| launch | 同puppeteer.launch | object | — | { headless: true } |
| delay | 毫秒，延迟获取页面内容 | number | — | 0 |

- output

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|----|----|----|----|----|
| name | 生成页面的名字 | string| — | 'index' |
| template | 骨架屏插入页面模板 | string | — | — |
| filepath | 存放骨架屏页面路径 | string | — | — |
| injectSelector | 生成的骨架屏插入页面的节点 | string | — | #app |
| writePageStructure | 生成页面前置操作 | function | — | — |

- evalParams

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|----|----|----|----|----|
| id | 插入骨架屏的节点id | string | — | — |
| rootNode | 目标页面的节点，如果不存在，则以body作为节点生成骨架屏 | string | — | — |
| px2rem | 将px转化为rem，如果<=0，则表示不转化 | number | >=0 | 0 |
| parseNode | 骨架屏节点解析，如果返回false，则子节点不再递归 | function | — | — |

