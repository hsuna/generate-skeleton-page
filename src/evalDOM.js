module.exports = opts => {   
  //外部依赖
  const { COLOR_LEVEL } = opts.require
  
  const STYLE_NAMES = ["position", "top", "left", "width", "height", "borderRadius", "background", "zIndex", "transform"]

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
      this.colors = (() => {
        let map = {}, index = 0;
        return {
          add(color){
            if(!map.hasOwnProperty(color)) map[color] = index++
            return map[color]
          },
          index(color){
            return map[color]
          },
          list(){
            return Object.keys(map).reduce((arr, color)=> {
              arr[map[color]] = color
              return arr
            }, [])
          },
          clear(){
            map = {}, index = 0;
          }
        }
      })()

      this.initOptions(options)
    }
    initOptions(options){
      this.options = {}
      Object.keys(options).forEach(key => {
        if(/^Function:/.test(key)) this.options[key.replace('Function:', '')] = eval('(function ' + options[key].replace(/^function/, '') + ')')
        else this.options[key] = options[key]
      })
      this.rootNode = (options.rootNode && 'string' === typeof options.rootNode && document.querySelector(options.rootNode)) || document.body
      this.px2rem = this.options.px2rem || 1
    }
    parseNode(nodes, layer=1, fixed=false){
      nodes.forEach(node => {
        if(1 === node.nodeType){
          //隐藏的样式不参与
          if(isHideStyle(node)) return

          fixed = fixed || getStyle(node, 'position')==='fixed'
          const styles = {
            position: fixed ? 1 : '',
            zIndex: layer,
            ...getRect(node),
          }
          if(1 === layer){
            styles['background'] = colorLayer()
          }else{
            styles['borderRadius'] = getStyle(node, 'border-radius')
            
            const transform = getStyle(node, 'transform')
            if(transform && 'none' !== transform) {
              styles['transform'] = transform
            }

            let background = getBackground(node)
            if(background){
              styles['background'] = background
            } else if(!node.childNodes || node.childNodes.length<=0){
              background = getStyle(node, 'backgroundImage');
              if(/url\(.+?\)/.test(background)){
                styles['background'] = COLOR_LEVEL.LEVEL_3
              }
            }
          }

          //外部解析
          if(false === this.options.parseNode(node, styles, this.generate.bind(this))){//如果返回结果为false，则表示不再往下渲染，且不递归子节点
            return
          }else if(styles.background){
            this.generate(styles)
          }
          
          //若存在子节点，则递归子节点
          if(node.childNodes && node.childNodes.length>0){
            this.parseNode(node.childNodes, layer+1, fixed)
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
      this.colors.clear()
      const nodes = this.rootNode.childNodes;
      this.parseNode(nodes)
      return this.getScript(this.blocks)
    }
    generate(styles = {}) {
      if(!styles['width'] || !styles['height']) return;

      this.blocks.push(STYLE_NAMES.map(key => {
        if(!styles[key]) return '';
        
        if(/^(top|left|width|height|borderRadius)$/.test(key)){
          return parseInt(styles[key])/this.px2rem
        }else if('background'==key){
          return this.colors.add(styles[key])
        }else{
          return styles[key]
        }
      }).join('|'));
    }
    getScript(list){
      const { id, px2rem } = this.options
      //l=${JSON.stringify(list)};
      //l="${list.join('&')}".split('&');
      return `
        <div id="${id}">
          <script>
            (function(){
              var h='<div class="skeleton-wrap">',
              u="${px2rem>0?'rem':'px'}", 
              t=${JSON.stringify(STYLE_NAMES.map(s => s.replace(/([A-Z])/g, "-$1").toLowerCase()))}, 
              c=${JSON.stringify(this.colors.list())},
              l=${JSON.stringify(list)};
              for(var i=0; i<l.length; i++){
                var s="",v= l[i].split('|');
                for(var j=0; j<v.length; j++){
                  if(0==j) s+=t[j]+':'+(!!v[j]?'fixed':'absolute')+';'
                  else if(v[j]){
                    s+=t[j]+':';
                    if(j<6) s+=v[j]+u;
                    else if(6==j) s+=c[v[j]];
                    else s+=v[j];;
                    s+=';';
                  }
                }
                h+='<div style="'+s+'"></div>';
              }
              h+='</div>'
              document.getElementById("${id}").innerHTML = h;
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