
## h-liquid 水球图

头部直接引入即可使用：
```
<script src="./h-liquid.js"></script>
```

### [在线演示](http://www.hcbook.cc/demo/h-liquid/)

## 效果
![image](./imgs/example.png)


## 用法示例
```
<div id="test"></div>
```

```
var option = {
	el: 'test', //元素id
	value: 60, //值--为number
	//color: 'green', // 水波的颜色
	//textSize: 40, //文本大小
	//textColor: '#e6e6e6', //文本颜色
	//borderColor: 'red', //圆边框颜色
	//borderWidth: 2, //圆边框宽度
	//borderOffset: 10,   //圆内边距的距离
	//background: 'red', //背景颜色
	//waveHeight: 5, // 波纹幅度
	//waveWidth: 6, //波纹宽度（密集度）
	//speed: 1, // 波动速度
	//anime: false // 开启动画
	//maxStyle: {  // 定制 value 达到 100 时的样式
	//	text: '满了',
	//	textColor: 'red',
	//	color: 'yellow'
	//},
	//exceedStyle: { // 定制 value 超过 100 时的样式
	//	text: '超过了',
	//	textColor: 'red',
	//	color: 'yellow'
	//}
}

instance.update(40); // 更新数值

// 若是 dom 元素为大小自适应，可以在 onresize 里调用 update() 对水球图进行重绘，实现大小自适应
window.onresize = function(){
	instance.update();
}

instance.stop();  // 停止动画。停止后，若想继续动画可调用 instance.update();

```

## Vue 版

1、安装
```
npm install h-liquid --save
```
2、引入
```
import Hliquid from 'h-liquid'
Vue.use(Hliquid)
```
3、使用
```
<Hliquid class="home-liquid" ref="liquid" 
    :value="80"
    :borderWidth="0.1" 
    :background="'#e2e2e2'"
    :waveWidth="4"
    :waveHeight="4"
    :maxStyle="liquidMaxStyle"
    ...
    >
</Hliquid>
```

方法：
```
this.$ref['liquid'].stop(); //停止

window.onresize = function(){
 this.$ref['liquid'].update();   //自适应重绘
}
```
