const path = require('path')
const COLOR_LEVEL = require('../src/ColorLevel')

module.exports = {
	puppeteer: {
		device: 'pc',
		page: {
			url: 'http://www.hsuna.com/',
		},
		//delay: 5000,
	},
	output: {
		name: 'index',
		template: path.resolve(__dirname, '../build/pc.html'), 
		filepath: path.resolve(__dirname, '../dist'),
		injectSelector: '#app'
	},
	evalParams: {
		//rootNode: '#app',
		//px2rem: 0,
		parseNode(node, styles, generate){
			/* if(1 === node.nodeType){
				if(node.classList.contains('swiper-container')){
					generate.call({
					  ...styles,
					  background: COLOR_LEVEL.LEVEL_3
					})
					return false;
				}
			} */
		}
	}
}