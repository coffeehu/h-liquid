(function(){


/*-----requestAnimationFrame pollyfill ----*/
var lastTime = 0;
var vendors = ['ms','moz','webkit','o'];
for(var x=0;x<vendors.length&&!window.requestAnimationFrame;x++){
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[ vendors[x]+'CancelAnimationFrame' ] || window[ vendors[x]+'CancelRequestAnimationFrame' ];
}
if(!window.requestAnimationFrame){
	window.requestAnimationFrame = function(callback,el){
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16-(currTime-lastTime) );
		var id = window.setTimeout(function(){
			callback(currTime+timeToCall);
		},timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	}
}
if(!window.cancelAnimationFrame){
	window.cancelAnimationFrame = function(id){
		clearTimeout(id);
	}
}


var utils = {
	width:function(el){
		if(this.isWindow(el)){
			return window.document.documentElement.clientWidth;
		}
		//可见
		if(true){
			return this.getWidthOrHeight(el,'width','content');
		}
		//不可见
		else{

		}
	},
	height:function(el){
		if(this.isWindow(el)){
			return window.document.documentElement.clientHeight;
		}
		//可见
		if(true){
			return this.getWidthOrHeight(el,'height','content');
		}
		//不可见
		else{

		}
	},
	getWidthOrHeight:function(el,type,extra){
		var styles = this.getStyle(el),
			val = this.curCSS(el,type,styles),
			isBorderBox = this.curCSS(el,'boxSizing',styles) === 'border-box';

		if(val === 'auto'){
			val = el['offset'+type[0].toUpperCase()+type.slice(1)];
		}

		val = parseFloat(val)||0;
		
		return ( val + this.argumentWidthOrHeight(el,type,extra,isBorderBox,styles) );
	},
	getStyle:function(el){
		var view = el.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( el );
	},
	curCSS:function(el,type,styles){
		var val;
		if(styles){
			val = styles.getPropertyValue(type) || styles[type];
		}
		return val;
	},
	//当为 borderBox 时，width 宽度为 content+padding+border
	argumentWidthOrHeight:function(el,type,extra,isBorderBox,styles){
		var val = 0, that = this;
		var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
		var i;

		if(extra === (isBorderBox?'border':'content') ){ // 此时不需要进行padding、border、margin的加减，所以不参与循环
			i = 4;
		}else{
			i = ( type==='width' ? 1 : 0 );			
		}

		for(;i<4;i=i+2){

			if(extra === 'margin'){
				val += parseFloat( that.curCSS(el, 'margin'+cssExpand[i], styles) );
			}

			// 当为 border-box 时，减去
			if(isBorderBox){
				// padding 和 content 时都会减去 border
				if(extra !== 'margin'){
					val -= parseFloat( that.curCSS(el, 'border'+cssExpand[i]+'Width', styles) );
				}

				if(extra === 'content'){
					val -= parseFloat( that.curCSS(el, 'padding'+cssExpand[i], styles) );
				}
			}else{
				if(extra !== 'content'){
					val += parseFloat( that.curCSS(el, 'padding'+cssExpand[i], styles) );
				}
				if(extra === 'border'|| extra === 'margin'){
					val += parseFloat( that.curCSS(el, 'border'+cssExpand[i]+'Width', styles) );
				}
			}

		}
		return val;
	},
	isWindow:function( obj ) {
		return obj != null && obj === obj.window;
	}
};


/*
	var options = {
		el: 'test', //元素id
		value: 0, //值--为number
		color: , // 水波的颜色
		textSize: 20, //文本大小
		textColor: , //文本颜色
		borderColor: , //圆边框颜色
		borderWidth: , //圆边框宽度
		borderOffset:   //圆内边距的距离
		waveHeight：8， // 波纹幅度
		waveWidth: 2, //波纹宽度（密集度）
		speed: 0.8, // 波动速度
		anime: true // 开启动画
		maxStyle: {  // 定制 value 达到 100 时的样式
			text: '满了',
			textColor: 'red',
			color: 'yellow'
		},
		exceedStyle: { // 定制 value 超过 100 时的样式
			text: '超过了',
			textColor: 'red',
			color: 'yellow'
		}
	}
*/
var Hliquid = window.Hliquid = function(options){
	var wrapper = this.wrapper = document.getElementById(options.el);
	var canvas;
	if(typeof wrapper.tagName === 'string' && (wrapper.tagName).toLowerCase() === 'canvas' ){
		canvas = this.canvas = wrapper;
		this.h = canvas.height;
		this.w = canvas.width;			
	}else {
		canvas = this.canvas = document.createElement('canvas');
		this.w = canvas.width = utils.width(wrapper);
		this.h = canvas.height = utils.height(wrapper);
		wrapper.appendChild(canvas);
	}

	if(canvas.getContext){

		this.context = canvas.getContext('2d');
		/*if( window.devicePixelRatio && window.devicePixelRatio ){
			canvas.style.width = 150 + "px";
			canvas.style.height = 150 + "px";
			canvas.height = 150 * window.devicePixelRatio;
			canvas.width = 150 * window.devicePixelRatio;
			this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
		}*/
		this.offsetX = 0;
		this.startValue = 0;
		this.startY = this.h;
		this.init(options);
	}
}

Hliquid.prototype.init = function(options){
	this.value = (typeof options.value === 'undefined') ? 10 : Number(options.value);
	this.color = options.color || '#1bb8ff';
	this.background = options.background;
	this.textSize = options.textSize;
	this.textColor = options.textColor || '#fff';
	this.borderColor = options.borderColor || this.color;
	this.borderWidth = options.borderWidth || 2;
	this.borderOffset = options.borderOffset || 0;
	this.waveHeight = options.waveHeight || 5;
	this.waveWidth = options.waveWidth || 2;
	this.speed = options.speed || 0.8;
	this.anime = (typeof options.anime === 'boolean') ? options.anime : true;
	this.maxStyle = options.maxStyle;
	this.exceedStyle = options.exceedStyle;
}

Hliquid.prototype.drawCircle = function(){
	var context = this.context;

	context.save();
	context.beginPath();
	context.lineWidth = this.borderWidth;
	context.strokeStyle = this.borderColor;
	context.arc(this.h/2, this.h/2, this.h/2-5, 0, Math.PI * 2);
	context.stroke();

	context.beginPath();
	var x = this.borderWidth < 3 ? (3-this.borderWidth) : 0; //半径修正值，因为实际效果中，当 borderWidth 很小时，水波半径会稍稍超出圆框。
	var r = this.h/2-this.borderWidth-this.borderOffset - x; //半径
	context.arc(this.h/2, this.h/2, r, 0, Math.PI * 2);
	if(this.background){
		context.fillStyle = this.background;
		context.fill();
	}
	context.restore();
	context.clip();

}

Hliquid.prototype.drawSin = function(offsetX){
	var context = this.context;
	context.save();
	context.beginPath();
	var points = [];

	if(this.anime){
		// max style
	    if(this.startValue === 100 && this.maxStyle && this.maxStyle.color){
	    	context.fillStyle = this.maxStyle.color;
	    }else if(this.startValue > 100 && this.exceedStyle && this.exceedStyle.color){
	    	context.fillStyle = this.exceedStyle.color;
	    }else{
	    	context.fillStyle = this.color;
	    }

		for(var x=0; x<this.w; x += 20/this.w){
			/*
				this.h * ( 1 - this.value/100 ) 起始 y 值
				n * Math.sin(x); --> n 越大，sin 波纹的高度越高，起伏越大（也就是值域越大）
				Math.sin(x*m)  --> m越大，sin的波纹频率越高，越密集（也就是周期越端小）
				Math.sin(x + z) --> +-z,控制波纹左右偏移的位置。因此，z 越大，视觉效果看来，波纹移动的越快
			*/
			var y = this.startY + this.waveHeight * Math.sin(x*this.waveWidth*0.01 + offsetX);
            points.push([x, y]);
            context.lineTo(x, y);
		}
	}else{
		// max style
	    if(this.value === 100 && this.maxStyle && this.maxStyle.color){
	    	context.fillStyle = this.maxStyle.color;
	    }else if(this.value > 100 && this.exceedStyle && this.exceedStyle.color){
	    	context.fillStyle = this.exceedStyle.color;
	    }else{
	    	context.fillStyle = this.color;
	    }
	    
		var y = this.h * ( 1 - this.value/100 ) + this.borderOffset;
        points.push([0, y]);
        context.lineTo(0, y);
        context.lineTo(this.w, y);
	}

    context.lineTo(this.w, this.h);
    context.lineTo(0, this.h);
    context.lineTo(points[0][0], points[0][1]);
    context.fill();
    context.restore();
}

Hliquid.prototype.drawText = function(){
	var context = this.context;
    context.save();

    var size = this.textSize || 0.4* ( this.w/2  );
    context.font = size + 'px Microsoft Yahei';
    context.textAlign = 'center';
    if(this.anime){
    	var value;
    	// max style
    	if(this.startValue === 100 && this.maxStyle && this.maxStyle.text){
    		value = this.maxStyle.text;
    		if( this.maxStyle.textColor ) context.fillStyle = this.maxStyle.textColor;
    	}else if(this.startValue > 100 && this.exceedStyle && this.exceedStyle.text) {
    		value = this.exceedStyle.text;
    		if( this.exceedStyle.textColor ) context.fillStyle = this.exceedStyle.textColor;
    	}else{
    		value = ~~this.startValue + '%';
    		context.fillStyle = this.textColor;
    	}
    	context.fillText(value, this.w/2, this.h/2 + size / 2);
    }else{
    	var value;
    	if(this.value === 100 && this.maxStyle && this.maxStyle.text){
    		value = this.maxStyle.text;
    		if( this.maxStyle.textColor ) context.fillStyle = this.maxStyle.textColor;
    	}else if(this.value > 100 && this.exceedStyle && this.exceedStyle.text){
    		value = this.exceedStyle.text;
    		if( this.exceedStyle.textColor ) context.fillStyle = this.exceedStyle.textColor;
    	}else {
    		value = ~~this.value + '%';
    		context.fillStyle = this.textColor;
    	}
    	context.fillText(value, this.w/2, this.h/2 + size / 2);
    }

    context.restore();
};


Hliquid.prototype.stop = function(){
	if(this.id){
		cancelAnimationFrame(this.id);
	}
}

var _render = function(instance){
	instance.context.clearRect(0, 0, instance.w, instance.h);

	if(instance.startValue < instance.value){
        instance.startValue++;
    }
    if(instance.startValue > instance.value){
        instance.startValue--;
    }

    // 实现水波升降过渡效果
    var endY = instance.h * ( 1 - instance.value/100 ) + instance.borderOffset;
    if(instance.startY < endY){
    	instance.startY++;
    }
    if(instance.startY > endY){
    	instance.startY--;
    }
    

    if(instance.anime){
    	instance.offsetX += (instance.speed*0.1);
		instance.drawCircle();
		instance.drawSin(instance.offsetX);
		instance.drawText();
		instance.id = requestAnimationFrame(function(){
			_render(instance);
		});	
    }else {
    	instance.offsetX += (instance.speed*0.1);
		instance.drawCircle();
		instance.drawSin(instance.offsetX);
		instance.drawText();
    }
}

Hliquid.render = function(options){
	var instance = new Hliquid(options);
	
	_render(instance);

	return instance;	
}

Hliquid.prototype.update = function(value){
	if(typeof value !== 'undefined'){ //更新数值
		this.value = value;
	}else{ //更新大小
		this.w = this.canvas.width = utils.width(this.wrapper);
		this.h = this.canvas.height = utils.height(this.wrapper);
	}
	this.stop();
	_render(this);
}



}(window))



	
