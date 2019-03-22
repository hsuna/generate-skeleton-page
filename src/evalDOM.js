module.exports = opts => {   
  //外部依赖
  const { COLOR_LEVEL } = opts.require
  
  const STYLE_NAMES = ["top", "left", "width", "height", "borderRadius", "background", "zIndex", "transform"]

  const getStyle = (node, attr) => (node.nodeType === 1? getComputedStyle(node)[attr]: '') || ''

  const isHideStyle = node => getStyle(node, 'display') === 'none' ||  getStyle(node, 'visibility') === 'hidden' || getStyle(node, 'opacity') == 0 || node.hidden

  const getRect = node => node?node.getBoundingClientRect().toJSON():{}

  const colorLayer = (_ => {
    let base = 0
    return _ => (base++%2)?'#ffffff':COLOR_LEVEL.LEVEL_1
  })()
  const colorMap = {
    li: COLOR_LEVEL.LEVEL_2,
    img: COLOR_LEVEL.LEVEL_3,
    //a: COLOR_LEVEL.LEVEL_3,
  }
  const getBackground = node => colorMap[node.tagName.toLowerCase()]

  class StructureDraw {
    constructor(options){
      this.range = document.createRange()
      this.blocks = []

      this.initOptions(options)
    }
    initOptions(options){
      this.options = {}
      Object.keys(options).forEach(key => {
        if(/^Function:/.test(key)){
          this.options[key.replace('Function:', '')] = eval('(function ' + options[key].replace(/^function/, '') + ')')
        }else{
          this.options[key] = options[key]
        }
      })
      this.unit = 'pc' !== this.options.device&&this.options.px2rem ? 'rem' : 'px'
      this.px2rem = ('pc' !== this.options.device && this.options.px2rem) || 1
      this.rootNode = (options.rootNode && 'string' === typeof options.rootNode && document.querySelector(options.rootNode)) || document.body
    }
    parseNode(nodes, layer=1){
      nodes.forEach(node => {
        if(1 === node.nodeType){
          //隐藏的样式不参与
          if(isHideStyle(node)) return

          //外部解析
          let result = this.options.parseNode(node, layer, this.generate.bind(this))
          
          if(false === result){//如果返回结果为false，则表示不再往下渲染，且不递归子节点
            return
          }else if(true !== result){ //如果返回结果不为false和true，则表示无视外部解析，按原递归方式进行
            let rect = getRect(node)
            let borderRadius = getStyle(node, 'border-radius-width')
            if(1 === layer){
              this.generate({
                zIndex: layer,
                ...rect,
                background: colorLayer()
              })
            }else{
              let transform = getStyle(node, 'transform')
              let background = getBackground(node)
              if(background){
                this.generate({
                  zIndex: layer,
                  ...rect,
                  background,
                  borderRadius
                })
              } else if(transform && 'none' !== transform){
                this.generate({
                  zIndex: layer,
                  ...rect,
                  background,
                  borderRadius,
                  transform
                })
              } else if(!node.childNodes || node.childNodes.length<=0){
                background = getStyle(node, 'backgroundImage');
                let hasBgUrl = background.match(/url\(.+?\)/)
                if(hasBgUrl && hasBgUrl.length){
                  this.generate({
                    zIndex: layer,
                    ...rect,
                    background: COLOR_LEVEL.LEVEL_3,
                    borderRadius
                  })
                }
              }
            }
          }
          
          //若存在子节点，则递归子节点
          if(node.childNodes && node.childNodes.length>0){
            this.parseNode(node.childNodes, layer+1)
          }
        }else if(3 === node.nodeType){
          if(node.textContent.length > 0){
            this.range.selectNode(node)
            const rects = [...this.range.getClientRects()]
            rects.forEach(rect => {
              this.generate({
                zIndex: layer,
                ...rect.toJSON(),
                background: COLOR_LEVEL.LEVEL_3
              })
            })
          }
        }
        
      });
    }
    start() {
      this.blocks = []
      const nodes = this.rootNode.childNodes;
      this.parseNode(nodes)
      return this.getScript(this.blocks, 'pc'===this.options.device)
    }
    generate(styles = {}) {
      if(!styles['width'] || !styles['height']) return;

      this.blocks.push(STYLE_NAMES.map(key => {
        if(!styles[key]) return '';
        else if(/^(top|left|width|height|borderRadius)$/.test(key)){
          return parseInt(styles[key])/this.px2rem
        }else{
          return styles[key]
        }
      }).join('|'));
    }
    getScript(list, isPC){
      const ID = 'SKELETON_SCRIPT'
      return `
        <style>
          ${isPC?
            `#${ID}{position:relative; overflow-x: hidden;width:100%; height:100%;}
             #${ID}>.skeleton-wrap{left:50%; width:${getStyle(this.rootNode,'width')}; height:${getStyle(this.rootNode,'height')}; margin-left:-${this.rootNode.offsetWidth/2}px;}`
          :''}
          #${ID} div{position:absolute;}
        </style>
        <div id="${ID}">
          <script>
            (function(){
              var h="", 
              u="${this.unit}", 
              t=${JSON.stringify(STYLE_NAMES)}, 
              l="${list.join('&')}".split('&');
              for(var i=0; i<l.length; i++){
                var s="",v= l[i].split('|');
                for(var j=0; j<v.length; j++){
                  if(v[j]) s+=t[j].replace(/([A-Z])/g, "-$1").toLowerCase()+':'+v[j]+(j<5?u:'')+';';
                }
                h+='<div style="'+s+'"></div>';
              }
              ${isPC?`h='<div class="skeleton-wrap">'+h+'</div>'`:''}
              document.getElementById("${ID}").innerHTML = h;
            })();
          </script>
        </div>
      `
    }
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try{
        const html = new StructureDraw(opts).start();
        resolve(html);
      }catch(e) {
        reject(e);
      }
    }, 1000)
  })
}