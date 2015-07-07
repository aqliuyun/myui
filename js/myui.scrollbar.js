;(function (libs,$) {
	var Scrollbar = libs.Class.define({
		__constructor:function(options){
			if(options == null || arguments.length == 0) return;
			this.id = libs.Utils.unique();
			this.options = options;
			this.dragModel = {}
			this.xSliderWidth = 4;
			this.ySliderWidth = 4;
			this.xSliderSize = 0;
			this.ySliderSize = 0;
			this.scrollStep = options.scrollStep || 10;
			this.container = $(options.container || 'html,body');
			if(this.container.length > 0)
			{
				this.attach(this.container);
			}
		},
		events:{},
		attach:function($container){	
			this.container = $container;
			this.__build();
			this.bindEvents();
		},
		detach:function(){
			this.dom().remove();
			this.container = null;			
			this.unBindEvents();
		},
		dom:function(){
			if(this.options.mode == 'horizontal')
			{
				return $(libs.Utils.strFormat('#myui_scrollbar_x_{0}',this.id));
			}
			else if(this.options.mode == 'vertical')
			{
				return $(libs.Utils.strFormat('#myui_scrollbar_y_{0}',this.id));
			}
			else
			{
				return $(libs.Utils.strFormat('.myui-scrollbar-{0}',this.id));
			}
		},
		__build:function(){
			var that = this;
			var options = this.options;
			var codes = [];
			if(!this.container){ return; }			
			var isroot = (this.container.is('html,body'));
			var fixed = (this.container.css('position') == 'fixed') || isroot;	
			if(isroot){
				$('html').css({'overflow':'hidden'});
			}
			else
			{
				this.container.css({'overflow':'hidden'});
			}			

			var width = isroot ? libs.Measurement.clientWidth() : libs.Measurement.offsetWidth(that.container.get(0));
			var height = isroot ? libs.Measurement.clientHeight() : libs.Measurement.offsetHeight(that.container.get(0));
			var contentWidth = isroot ?libs.Measurement.scrollWidth() : libs.Measurement.scrollWidth(that.container.get(0));
			var contentHeight = isroot ?libs.Measurement.scrollHeight():libs.Measurement.scrollHeight(that.container.get(0));
			var mode = options.mode;
			var offset = libs.Measurement.getOffset(that.container.get(0));		
			//横向
			if(mode == 'horizontal' || mode != 'vertical')
			{	
				var showX = false;
				if(width < contentWidth)
				{
					that.xSliderSize = width * width / contentWidth;
					showX = true;
				}
				else
				{
					that.xSliderSize = width;
				}
				var style = '';
				if(fixed)
				{
					style = ["left:",offset.left,'px;',"top:",offset.top + height - that.xSliderWidth,'px;',"width:",width,'px;',showX ? 'display:block;':'display:none;','position:fixed;'].join('');	
				}				
				else
				{
					style = ["left:",offset.left,'px;',"top:",offset.top + height - that.xSliderWidth,'px;',"width:",width,'px;',showX ? 'display:block;':'display:none;'].join('');
				}
				codes.push(libs.Utils.strFormat('<div id="myui_scrollbar_x_{0}" class="myui-scrollbar myui-scrollbar-{0} myui-scrollbar-x {1}" style="{2}">',this.id,options.scrollbarCss || '',style));
				codes.push(libs.Utils.strFormat('<div class="myui-scrollbar-slider myui-scrollbar-slider-x {0}" style="width:{1}px"></div></div>',options.sliderCss || '',that.xSliderSize));
			}
			//纵向
			if(mode == 'vertical' || mode != 'horizontal')
			{
				var showY = false;
				if(height < contentHeight)
				{
					that.ySliderSize = height * height / contentHeight;
					showY = true;
				}					
				else
				{
					that.ySliderSize = height;
				}	
				var style = '';
				if(fixed)
				{

					style = ['left:',offset.left + width - that.ySliderWidth,'px;','top:',offset.top,'px;','height:',height,'px;',showY ? 'display:block;':'display:none;','position:fixed;'].join('');
				}				
				else
				{
					style = ['left:',offset.left + width - that.ySliderWidth,'px;','top:',offset.top,'px;','height:',height,'px;',showY ? 'display:block;':'display:none;'].join('');
				}				
				codes.push(libs.Utils.strFormat('<div id="myui_scrollbar_y_{0}" class="myui-scrollbar myui-scrollbar-{0} myui-scrollbar-y {1}" style="{2}">',this.id,options.scrollbarCss || '',style));
				codes.push(libs.Utils.strFormat('<div class="myui-scrollbar-slider myui-scrollbar-slider-y {0}" style="height:{1}px"></div></div>',options.sliderCss || '',that.ySliderSize));
			}
			$(document.body).append(codes.join(''));			
		},
		bindEvents:function(){
			var that = this;
			var $dom = this.dom();
			that.container.off('mousewheel.myui.scrollbar').on('mousewheel.myui.scrollbar',function(event){
				var isroot = that.container.is('html,body');
				var height = libs.Measurement.clientHeight(isroot?null:that.container.get(0));
				var contentHeight = libs.Measurement.scrollHeight(isroot?null:that.container.get(0));
                var $slider = $('.myui-scrollbar-slider-y',$dom);
				var top = $slider.css('marginTop');				
				top = ~~top.substring(0,top.length - 2);
				var maxscroll = height - that.ySliderSize;
				if(maxscroll <= 0) return;
				var delta = event.originalEvent.deltaY || - event.originalEvent.wheelDelta;
				var result = top + (delta > 0 ? that.scrollStep : - that.scrollStep);
				result = result <= 0 ? 0:result;
				result = result >= maxscroll ? maxscroll:result;
				var contenttop = result * (contentHeight - height) / maxscroll;
				if(that.container.is('html,body') && navigator.userAgent.indexOf('MSIE') > -1)
				{
					$(document.documentElement).scrollTop(contenttop);
				}
				else
				{				
					that.container.scrollTop(contenttop);
				}
				$slider.css('marginTop',result);
                return false;
			});
			$('.myui-scrollbar-slider',$dom).off('mousedown.myui.scrollbar').on('mousedown.myui.scrollbar',function(event){
				clearTimeout(that.dragtimer);
				that.dragModel.scrolling = true;
				that.dragModel.target = $(this);
				that.dragModel.begin = { "x":event.clientX,"y":event.clientY };
				$(this).addClass('dragging');
				return false;
			});
			$(document).off('mousemove.myui.scrollbar.'+that.id).on('mousemove.myui.scrollbar.'+that.id,function(event){
				if(!that.dragModel.scrolling){return;}
				that.dragModel.end = { "x":event.clientX,"y":event.clientY };								
				var isroot = that.container.is('html,body');
				var width = libs.Measurement.clientWidth(isroot?null:that.container.get(0));
				var height = libs.Measurement.clientHeight(isroot?null:that.container.get(0));
				var contentWidth = libs.Measurement.scrollWidth(isroot?null:that.container.get(0));
				var contentHeight = libs.Measurement.scrollHeight(isroot?null:that.container.get(0));
				var mode = that.options.mode;
				if(mode == 'horizontal' || mode != 'vertical')
				{
					var $slider = $('.myui-scrollbar-slider-x',$dom);
					if($slider.length > 0 && $slider.get(0) == that.dragModel.target.get(0)){
						var left = $slider.css('marginLeft');
						left = ~~left.substring(0,left.length - 2);
						var maxscroll = width - that.xSliderSize;
						if(maxscroll <= 0) return false;
						var result = left + event.clientX - that.dragModel.begin.x;					
						result = result <= 0 ? 0:result;
						result = result >= maxscroll ? maxscroll:result;
						var contentleft = result * (contentWidth - width) / maxscroll;							
						if(that.container.is('html,body') && navigator.userAgent.indexOf('MSIE') > -1)
						{							
							$(document.documentElement).scrollLeft(contentleft);
						}
						else
						{
							that.container.scrollLeft(contentleft);
						}
						$slider.css('marginLeft',result);
					}					
				}				
				if(mode == 'vertical' || mode != 'horizontal')
				{
					var $slider = $('.myui-scrollbar-slider-y',$dom);
					if($slider.length > 0 && $slider.get(0) == that.dragModel.target.get(0)){
						var top = $slider.css('marginTop');
						top = ~~top.substring(0,top.length - 2);
						var maxscroll = height - that.ySliderSize;
						if(maxscroll <= 0) return false;
						var result = top + event.clientY - that.dragModel.begin.y;
						result = result <= 0 ? 0:result;
						result = result >= maxscroll ? maxscroll:result;					
						var contenttop = result * (contentHeight - height) / maxscroll;
						if(that.container.is('html,body') && navigator.userAgent.indexOf('MSIE') > -1)
						{
							$(document.documentElement).scrollTop(contenttop);
						}
						else
						{				
							that.container.scrollTop(contenttop);
						}
						$slider.css('marginTop',result);
					}
				}
				that.dragModel.begin = { "x":event.clientX,"y":event.clientY };
				return false;
			});
			$(document).off('mouseup.myui.scrollbar.'+that.id).on('mouseup.myui.scrollbar.'+that.id,function(event){
				if(!that.dragModel.scrolling) return;
				clearTimeout(that.dragtimer);
				that.dragtimer = setTimeout(function(){
					that.dragModel.scrolling = false;
					var $this = $('.myui-scrollbar-slider',$dom);
					$this.removeClass('dragging');
				}, 10);
			});
		},
		unBindEvents:function(){
			var that = this;
			var $dom = this.dom();
			that.container.off('mousewheel.myui.scrollbar');
			$('.myui-scrollbar',$dom).off('mousedown.myui.scrollbar');
			$(document).off('mousemove.myui.scrollbar.'+that.id);
			$(document).off('mouseup.myui.scrollbar.'+that.id);
		}
	});

	libs.Widgets.Scrollbar = Scrollbar;
})(myui,jQuery);