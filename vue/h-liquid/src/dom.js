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
		var timeToCall = Math.max(0, 1-(currTime-lastTime) );
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

})();

var domUtils = {
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

export default domUtils;