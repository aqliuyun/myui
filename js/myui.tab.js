;(function (libs,$) {
	var Tab = libs.Class.define({
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
			this.current = 0;
			this.events = this.options.events || {};
		},
		events:{
			ontabcomplete:null,
			onasyncload:null
		},
		dom:function () {
			return $(this.container);
		},
		attach:function($container){	
			this.container = $container;
			this.__build();
			this.bindEvents();			
		},
		detach:function(){
			this.dom().empty();
			this.container = null;
			this.unBindEvents();
		},
		__build:function(){
			var that = this;
			var $dom = this.dom();
			var options = that.options;
			$('.myui-tab-content',$dom).hide();
			for (var i = 0; i < options.tabs.length; i++) {
				var tab = options.tabs[i];
				tab.$head = $('.myui-tab-head[data-tabindex='+i+']',$dom);
				tab.$content = $('.myui-tab-content[data-tabindex='+i+']',$dom);
				if(tab.active)
				{
					that.current = i;
				}
			};
			that.activetab(that.current);
		},
		activetab:function(tabindex){
			var that = this;
			var $dom = this.dom();
			var options = that.options;
			if(options.tabs.length == 0){return;}
			var tab = options.tabs[tabindex];
			if(!tab) return;
			if(tab.url){
				$.get(tab.url,function(result){
					var $content = $('.myui-tab-content[data-tabindex='+tabindex+']',$dom);
					if($content.length == 0)
					{
						$dom.append('<div class="myui-tab-content" data-tabindex="'+tabindex+'">'+result+'</div>');
					}
					else
					{
						$content.html(tab.html());
						$content.show();
					}
				});
			}
			else if(tab.html)
			{
				$('.myui-tab-content',$dom).hide();
				var $content = $('.myui-tab-content[data-tabindex='+tabindex+']',$dom);
				if($content.length == 0)
				{
					$dom.append('<div class="myui-tab-content" data-tabindex="'+tabindex+'">'+tab.html()+'</div>');
				}
				else
				{
					$content.html(tab.html());
					$content.show();
				}
			}
			else if(tab.target)
			{
				$('.myui-tab-content',$dom).hide();
				tab.target.show();
			}
			else if(tab.iframe)
			{
				$('.myui-tab-content',$dom).hide();
				tab.iframe.show();
				$('iframe',tab.iframe).prop('src',tab.src);
			}
			$('.myui-tab-head',$dom).removeClass('active');
			tab.$head.addClass('active');
		},
		bindEvents:function(){
			var that = this;
			var $dom = this.dom();
			var options = that.options;
			$('.myui-tab-head',$dom).off('click.myui-tab').on('click.myui-tab',function(){
				var $this = $(this);
				var tabindex = $this.attr('data-tabindex');
				that.activetab(tabindex);
			});
		},
		unbindEvents:function(){
			var that = this;
			var $dom = this.dom();			
			$('.myui-tab-head',$dom).off('click.myui-tab');
		}
	});
	libs.Widgets.Tab = Tab;
})(myui,jQuery);