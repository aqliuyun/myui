;(function (libs,$) {	
    var InputCombo = libs.Widgets.InputCombo;
    var InputComboWatcher = libs.Widgets.InputComboWatcher;
    var SelectCombo = libs.Class.extend(InputCombo,{
		__constructor:function(options){
			this.__super(options);
		},
		attach:function(target){
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div class="myui-selectcombo" tabindex="-1"><div class="myui-combo-input-container"><input type="text" class="myui-combo-input {0}" tableindex="-1"/><span class="myui-dropdown-btn">\u25bc</span></div><div class="myui-combo-panel" tabindex="-1"></div></div>',this.options.readonly?'readonly':''));
			var $container = $(htmls.join(''));
			this.adapter.container = target;
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
		bindEvents:function(){
			var that = this;			
			var $dom = this.$container;
			$('.myui-dropdown-btn',$dom).off('click').on('click',function(event){
				var $this = $(this);												
				if(that.options.url)
				{
					that.watcher.search(null);
					that.reload();
				}
				else
				{
					that.watcher.search(null);
					that.adapter.refresh();
				}
				$('.myui-combo-panel',$dom).show();
				$('.myui-combo-panel',$dom).focus();	
				that.view.setSelectable(true);
			});
			SelectCombo.__super.bindEvents.apply(this);
		},
		unbindEvents:function(){
			var $dom = this.$container;
			SelectCombo.__super.unbindEvents.apply(this);
			$('.myui-dropdown-btn',$dom).off('click');
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.SelectCombo = SelectCombo;
})(myui,jQuery);