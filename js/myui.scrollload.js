;(function (libs,$) {
	var ScrollLoad = libs.Class.define({
		__constructor:function(options){
			if(options == null || arguments.length == 0) return;
			this.id = libs.Utils.unique();
			this.options = options;			
			this.events = this.options.events || {};
			this.dragModel = {};
			this.container = $(options.container || 'html,body');
			if(this.container.length > 0)
			{
				this.attach(this.container);
			}
		},
		events:{
			onsetparam:null,
			onloadcomplete:null,
			onloadprev:null,
			onloadnext:null,	
			onrenderitem:null,
			onrender:null
		},
		attach:function($container){
			this.bindEvents();
		},
		detach:function(){
			this.unBindEvents();
		},
		bindEvents:function(){
			var that = this;
			// that.container.off('mousewheel.myui.scrollload').on('mousewheel.myui.scrollload',function(event){
			// 	var delta = event.originalEvent.deltaY || - event.originalEvent.wheelDelta;
			// });
			that.container.off('mousedown.myui.scrollload.'+that.id).on('mousedown.myui.scrollload.'+that.id,function(event){
				clearTimeout(that.dragtimer);				
				that.dragModel.scrolling = true;
				that.dragModel.target = $(this);
				that.dragModel.begin = { "x":event.clientX,"y":event.clientY };
				$(this).addClass('dragging');
				libs.log('myui.scrolload.dragging begin');				
				return false;
			});
			$(document).off('mousemove.myui.scrollload.'+that.id).on('mousemove.myui.scrollload.'+that.id,function(event){
				if(!that.dragModel.scrolling) return;
				that.dragModel.end = { "x":event.clientX,"y":event.clientY };
				var length = event.clientY - that.dragModel.begin.y;								
				if(that.options.dragHeight >= Math.abs(length))
				{
					if(length > 0)
					{
						that.container.addClass('dragging-down');
					}
					else
					{
						that.container.addClass('dragging-up');
					}
					that.container.css('-webkit-transform','translateY('+length+'px)');					
				}
			});
			$(document).off('mouseup.myui.scrollload.'+that.id).on('mouseup.myui.scrollload.'+that.id,function(event){
				if(!that.dragModel.scrolling) return;				
				clearTimeout(that.dragtimer);
				that.dragtimer = setTimeout(function(){
					that.dragModel.scrolling = false;
					that.container.removeClass('dragging');
					libs.log('myui.scrolload.dragging end');
					that.container.css('-webkit-transform','translateY(0px)');					
					that.container.removeClass('dragging-up dragging-down');
					var length = event.clientY - that.dragModel.begin.y;
					if(that.options.dragHeight <= Math.abs(length))
					{
						libs.log('myui.scrolload.dragging trigger load');
						if(length > 0)
							that.__prevload();
						else
							that.__nextload();
					}
				}, 10);
			});
		},
		unBindEvents:function(){
			var that = this;
			that.container.off('mousewheel.myui.scrollload');
			that.container.off('mousedown.myui.scrollload');
			$(document).off('mousemove.myui.scrollload.' + that.id);
			$(document).off('mouseup.myui.scrollload.' + that.id);
		},
		load:function(datas){
			var that = this;
			if(datas){
				result = that.events.onloadcomplete && that.events.onloadcomplete.call(that,result);
				if(that.events.onrender)
				{
					that.container.append(that.events.onrender(result));
				}
				else if(that.events.onrenderitem)
				{
					var htmls = [];
					for (var i = 0; i < result.length; i++) {
						htmls.push(that.events.onrenderitem(result[i]));
					}
					that.container.append(htmls.join(''));	
				}
			}
			else
			{
				$.ajax({
					url:that.options.url,
					data:that.events.setparam && that.events.setparam() || {},
					type:that.options.type || 'post',
					dataType:that.options.dataType || 'json',
					success:function(result){
						result = that.events.onloadcomplete && that.events.onloadcomplete.call(that,result) || result;
						if(that.events.onrender)
						{
							that.container.append(that.events.onrender(result));
						}
						else if(that.events.onrenderitem)
						{
							var htmls = [];
							for (var i = 0; i < result.length; i++) {
								htmls.push(that.events.onrenderitem(result[i]));
							}
							that.container.append(htmls.join(''));	
						}
					}
				});
			}
		},
		__prevload:function(){
			var that = this;
			libs.log('myui.scrolload.loading begin');
			$.ajax({
				url:that.options.url,
				data:that.events.setparam && that.events.setparam() || {},
				type:that.options.type || 'post',
				dataType:that.options.dataType || 'json',
				success:function(result){
					libs.log('myui.scrolload.loading end');
					result = that.events.onloadcomplete && that.events.onloadcomplete.call(that,result) || result;
					if(that.events.onrender)
					{
						that.container.prepend(that.events.onrender(result));
					}
					else if(that.events.onrenderitem)
					{
						var htmls = [];
						for (var i = 0; i < result.length; i++) {
							htmls.push(that.events.onrenderitem(result[i]));
						}
						that.container.prepend(htmls.join(''));	
					}
					that.events.onloadprev && that.events.onloadprev();
				}
			});
		},
		__nextload:function(){
			var that = this;
			libs.log('myui.scrolload.loading begin');
			$.ajax({
				url:that.options.url,
				data:that.events.setparam && that.events.setparam() || {},
				type:that.options.type || 'post',
				dataType:that.options.dataType || 'json',
				success:function(result){
					libs.log('myui.scrolload.loading end');
					result = that.events.onloadcomplete && that.events.onloadcomplete.call(that,result) || result;
					if(that.events.onrender)
					{
						that.container.append(that.events.onrender(result));
					}
					else if(that.events.onrenderitem)
					{
						var htmls = [];
						for (var i = 0; i < result.length; i++) {
							htmls.push(that.events.onrenderitem(result[i]));
						}
						that.container.append(htmls.join(''));
					}
					that.events.onloadnext && that.events.onloadnext();
				}
			});
		}
	});
	libs.Widgets.ScrollLoad = ScrollLoad;
})(myui,jQuery);