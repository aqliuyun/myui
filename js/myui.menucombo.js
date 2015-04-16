;(function (libs,$) {

	var MenuCombo = libs.Class.extend(Combo,{
		__constructor:function(options){
			var that = this;
			this.watcher = new InputComboWatcher(options);
			this.watcher.match = options.match || function(data,condition){ return data[that.options.modelText].toString().indexOf(condition) >= 0; }
			this.__super(options);
		},
		attach:function(){
			var htmls = [];
			htmls.push('<div class="myui-menucombo"><div class="myui-combo-input-container"><input type="text" class="myui-combo-input" tableindex="0"/></div><div class="myui-combo-panel" tabindex="1"></div></div>');
			var $container = $(htmls.join(''));
			this.adapter.container.empty();
			this.adapter.container.prepend($container);			
			this.$container = this.adapter.container;
			this.adapter.container = $container.find('.myui-combo-panel');
			this.bindEvents();
		},
		detach:function(){
			this.unbindEvents();
			this.$container && this.$container.empty();
			this.adapter.container = this.$container;
			this.$container = null;
		},
		getSelectData:function(){
			return this.view.getSelectData();
		},
		bindEvents:function(){
			var that = this;
			var $dom = this.$container;
			$('.myui-combo-panel',$dom).off('keydown').on('keydown',function(event){
				if(event.keyCode == 38)
				{
					that.view.selectPrev();
				}
				else if(event.keyCode == 40)
				{
					that.view.selectNext();
				}
				else if(event.keyCode == 13)
				{
					$('.myui-combo-panel',$dom).hide();
					that.view.setSelectable(false);
				}
			});
			$('.myui-combo-input',$dom).off('input').on('input',function(){
				var $this = $(this);
				var value = $this.val();
				that.view.resetSelect();
				that.watcher.search(value);
				that.adapter.refresh();
				if(value.length > 0)
				{
					$('.myui-combo-panel',$dom).show();
					$('.myui-combo-panel',$dom).focus();
					that.view.setSelectable(true);
				}
				else
				{
					$('.myui-combo-panel',$dom).hide();
					that.view.setSelectable(false);
				}
			});
			$('.myui-combo-panel',$dom).off('blur').on('blur',function(){
				console.log('blur');
				$('.myui-combo-panel',$dom).hide();
				that.view.setSelectable(false);
			});
			var onselectdata = that.view.events.onselectdata;
			that.view.events.onselectdata = function(key){
				var data = this.getSelectData();		
				data && $('.myui-combo-input',$dom).val(data[that.options.modelText]);
				onselectdata && onselectdata.apply(that.view,[key]);
			}
		},
		unbindEvents:function(){
			var $dom = this.$container;
			$('.myui-combo-input',$dom).off('input');
			$('.myui-inputcombo',$dom).off('keydown');
			$('.myui-combo-panel',$dom).off('blur')
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.MenuCombo = MenuCombo;
})(myui,jQuery);