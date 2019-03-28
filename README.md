# generate-skeleton-page

> 骨架屏生成工具 <br/>
> 作者：Hsuna <br/>
> 时间：2019/03/25

### 一、项目结构

```
./
├─ config
│  └─ index.js         # 配置信息
│
├─ src                       
│  ├─ ColorLevel.js    # 颜色分层表
│  ├─ evalDOM.js       # 运行时解析文件
│  ├─ pp.js            # puppeteer集成处理
│  └─ index.js         # 配置执行文件
│
└─ start.js            # 启动文件
```

### 二、运行
```
# 安装依赖
npm install

# 生成骨架屏
npm start
```

* 配置修改：`config/index.js`

### 三、具体参数配置

| 参数 | 说明 | 类型 |
|----|----|----|
| puppeteer | 页面操作配置 | obejct |
| output | 输出配置 | obejct |
| evalParams | 运行时配置 | obejct |

- puppeteer

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|----|----|----|----|----|
| device | 设备类型 | string | pc/mobile/ipad| pc |
| page | 参数如下 | object | — | — |
| page.url | 原页面访问地址 | string | — | — |
| page.extraHTTPHeaders | headers设置 | object | — | null |
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

