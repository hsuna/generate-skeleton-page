const path = require('path')
const COLOR_LEVEL = require('../src/ColorLevel')

module.exports = {
	name: 'index',
	url: 'https://www.baidu.com',
	template: path.resolve(__dirname, '../build/pc.html'), 
	output: {
		filepath: path.resolve(__dirname, '../dist'),
		injectSelector: '#app'  
	},
	px2rem: 50,
	device: 'pc',
	//rootNode: '#app',
	parseNode(node, layer, generate){
		/* if(1 === node.nodeType){
			if(node.classList.contains('swiper-container')){
				let rect = node.getBoundingClientRect().toJSON() || {}
				generate.call({
				  zIndex: layer,
				  ...rect,
				  background: COLOR_LEVEL.LEVEL_3
				})
				return false;
			}
		} */
	}
}