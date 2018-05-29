<template>
	<div>
		<canvas ref="canvas"></canvas>
	</div>
</template>

<script type="text/javascript">
import domUtils from './dom.js';

export default {
	name: 'Hliquid',

	props: {
		value: {
			type: Number,
			default: 10
		},
		color: {
			type: String,
			default: '#1bb8ff'
		},
		background: {
			type: String,
			default: ''
		},
		textSize: {
			type: Number
		},
		textColor: {
			type: String,
			default: '#fff'
		},
		borderColor: {
			type: String,
			default: '#1bb8ff'
		},
		borderWidth: {
			type: Number,
			default: 2
		},
		borderOffset: {
			type: Number,
			default: 0
		},
		waveHeight: {
			type: Number,
			default: 8
		},
		waveWidth: {
			type: Number,
			default: 2
		},
		speed: {
			type: Number,
			default: 0.8
		},
		anime: {
			type: Boolean,
			default: true
		},
		maxStyle: {
			type: Object,
			default: null
		}
	},

	mounted() {
		const canvas = this.$refs.canvas;
		const context = this.context = canvas.getContext('2d');

		this.w = canvas.width = domUtils.width(this.$el);
		this.h = this.startY = canvas.height = domUtils.height(this.$el);

		this.render();		
	},
	beforeDestroy() {
		this.stop();
	},

	data() {
		return {
			context: null,
			w: 0,
			h: 0,
			offsetX: 0,  // 用于控制波纹横向移动
			startValue: 0,
			startY: 0,
			id: null,  // 动画id
		}
	},

	methods: {
		drawCircle() {
			const context = this.context;
			context.save();
			context.beginPath();
			context.lineWidth = this.borderWidth;
			context.strokeStyle = this.borderColor;
			context.arc(this.h/2, this.h/2, this.h/2-5, 0, Math.PI * 2);
			context.stroke();

			context.beginPath();
			let x = this.borderWidth < 3 ? (3-this.borderWidth) : 0; //半径修正值，因为实际效果中，当 borderWidth 很小时，水波半径会稍稍超出圆框。
			let r = this.h/2-this.borderWidth-this.borderOffset - x; //半径
			context.arc(this.h/2, this.h/2, r, 0, Math.PI * 2);
			if(this.background){
				context.fillStyle = this.background;
				context.fill();
			}
			context.restore();
			context.clip();
		},
		drawSin(offsetX) {
			const context = this.context;
			context.save();
			context.beginPath();
			let points = [];

			if(this.anime){
				// max style
			    if(this.startValue === 100 && this.maxStyle && this.maxStyle.color){
			    	context.fillStyle = this.maxStyle.color;
			    }else{
			    	context.fillStyle = this.color;
			    }

				for(let x=0; x<this.w; x += 20/this.w){
					/*
						this.h * ( 1 - this.value/100 ) 起始 y 值
						n * Math.sin(x); --> n 越大，sin 波纹的高度越高，起伏越大（也就是值域越大）
						Math.sin(x*m)  --> m越大，sin的波纹频率越高，越密集（也就是周期越端小）
						Math.sin(x + z) --> +-z,控制波纹左右偏移的位置。因此，z 越大，视觉效果看来，波纹移动的越快
					*/
					let y = this.startY + this.waveHeight * Math.sin(x*this.waveWidth*0.01 + offsetX);
		            points.push([x, y]);
		            context.lineTo(x, y);
				}
			}else{
				// max style
			    if(this.value === 100 && this.maxStyle && this.maxStyle.color){
			    	context.fillStyle = this.maxStyle.color;
			    }else{
			    	context.fillStyle = this.color;
			    }

				let y = this.h * ( 1 - this.value/100 ) + this.borderOffset;
		        points.push([0, y]);
		        context.lineTo(0, y);
		        context.lineTo(this.w, y);
			}

		    context.lineTo(this.w, this.h);
		    context.lineTo(0, this.h);
		    context.lineTo(points[0][0], points[0][1]);
		    context.fill();
		    context.restore();
		},
		drawText() {
			const context = this.context;
		    context.save();

		    let size = this.textSize || 0.4* ( this.w/2  );
		    context.font = size + 'px Microsoft Yahei';
		    context.textAlign = 'center';
		    if(this.anime){
		    	let value;
		    	// max style
		    	if(this.startValue === 100 && this.maxStyle && this.maxStyle.text){
		    		value = this.maxStyle.text;
		    		if( this.maxStyle.textColor ) context.fillStyle = this.maxStyle.textColor;
		    	}else{
		    		value = ~~this.startValue + '%';
		    		context.fillStyle = this.textColor;
		    	}
		    	context.fillText(value, this.w/2, this.h/2 + size / 2);
		    }else{
		    	let value;
		    	// max style
		    	if(this.value === 100 && this.maxStyle && this.maxStyle.text){
		    		value = this.maxStyle.text;
		    		if( this.maxStyle.textColor ) context.fillStyle = this.maxStyle.textColor;
		    	}else {
		    		value = ~~this.value + '%';
		    		context.fillStyle = this.textColor;
		    	}
		    	context.fillText(value, this.w/2, this.h/2 + size / 2);
		    }

		    context.restore();
		},
		render() {
			const that = this;
			const _render = function(){
				that.context.clearRect(0, 0, that.w, that.h);

				if(that.startValue < that.value){
		            that.startValue++;
		        }
		        if(that.startValue > that.value){
		            that.startValue--;
		        }

	            // 实现水波升降过渡效果
			    let endY = that.h * ( 1 - that.value/100 ) + that.borderOffset;
			    if(that.startY < endY){
			    	that.startY++;
			    }
			    if(that.startY > endY){
			    	that.startY--;
			    }

		        if(that.anime){
			    	that.offsetX += (that.speed*0.1);
					that.drawCircle();
					that.drawSin(that.offsetX);
					that.drawText();
					that.id = requestAnimationFrame(function(){
						_render(that);
					});	
			    }else {
			    	that.offsetX += (that.speed*0.1);
					that.drawCircle();
					that.drawSin(that.offsetX);
					that.drawText();
			    }
			}
			
			_render();
		},
		stop(){
			if(this.id){
				cancelAnimationFrame(this.id);
			}
		},
		update(){
			this.stop();
			const canvas = this.$refs.canvas;
			this.w = canvas.width = domUtils.width(this.$el);
			this.h = canvas.height = domUtils.height(this.$el);
			console.log(this.w, this.h)
			this.render();
		}
	}


}
</script>