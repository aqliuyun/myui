;(function (libs,$) {	
    function InputComboWatcher(options){
    	this.options = options || {};
    	this.condition = null;
        this.match = null;
        this.displaySize = options.displaySize;
    }

    var Combo = libs.Widgets.Combo;

    InputComboWatcher.prototype = {    	
        attach:function(adapter){
            this.adapter = adapter;            
        },
        detach:function(){
            this.adapter = null;
        },
        search:function(condition){
        	this.condition = condition;
        },
        watchData:function(allDatas){
        	if(this.condition === null){ return allDatas; }
        	if(this.condition && this.condition.length == 0) return [];
        	var datas = [];
        	var end = this.displaySize || allDatas.length;
        	end = end < allDatas.length ? end : allDatas.length;
        	for (var i = 0; i < allDatas.length; i++) {
        		if(this.match && this.match(allDatas[i],this.condition) && datas.length <= end)
        		{
        			datas.push(allDatas[i]);
        		}
        	};
            return datas;
        }
    };

	var InputCombo = libs.Class.extend(Combo,{
		__constructor:function(options){
			var that = this;
			this.watcher = new InputComboWatcher(options);
			this.watcher.match = options.match || function(data,condition){ return data[that.options.modelText].toString().indexOf(condition) >= 0; }
			this.__super(options);
		},
		attach:function(){
			var htmls = [];
			htmls.push('<div class="myui-inputcombo" tabindex="-1"><div class="myui-combo-input-container"><input type="text" class="myui-combo-input" tableindex="-1"/></div><div class="myui-combo-panel" tabindex="-1"></div></div>');
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
		__getkeepshow:function(){
			return this.__keepshow;
		},
		__setkeepshow:function(k) {
			this.__keepshow = k;
		},
		getSelectData:function(){
			return this.view.getSelectData();
		},
		bindEvents:function(){
			var that = this;
			var $dom = this.$container;
			$('.myui-combo-panel,.myui-combo-input',$dom).off('keydown').on('keydown',function(event){
				if(event.keyCode == 38)
				{
					that.view.selectPrev();
					$('.myui-combo-input',$dom).off('focusout');
					$('.myui-combo-panel',$dom).focus();
				}
				else if(event.keyCode == 40)
				{
					that.view.selectNext();
					$('.myui-combo-input',$dom).off('focusout');
					$('.myui-combo-panel',$dom).focus();
				}
				else if(event.keyCode == 13)
				{
					$('.myui-combo-panel',$dom).hide();
					that.view.setSelectable(false);
					return true;
				}		
				else
				{					
					$('.myui-combo-input',$dom).off('focusout').on('focusout',function(){
						setTimeout(function() {
							if(that.__getkeepshow()){return;}
							$('.myui-combo-panel',$dom).hide();
							that.view.setSelectable(false);
						},100);						
						return true;
					});
				}
				return true;
			});
			$('.myui-combo-input',$dom).off('input').on('input',function(){
				var $this = $(this);
				var value = $this.val();
				that.view.resetSelect();
				if(that.options.url)
				{
					that.watcher.search(null);
					that.reload();
				}
				else
				{
					that.watcher.search(value);
					that.adapter.refresh();
				}
				if(value.length > 0)
				{
					$('.myui-combo-panel',$dom).show();
					that.view.setSelectable(true);
				}
				else
				{
					$('.myui-combo-panel',$dom).hide();
					that.view.setSelectable(false);
				}
				return true;
			});
			$('.myui-combo-panel',$dom).off('mousedown').on('mousedown',function(){
				that.__setkeepshow(true);
				return true;
			});
			$('.myui-combo-panel',$dom).off('focusin').on('focusin',function(){	
				that.__setkeepshow(true);
				return true;
			});
			$('.myui-combo-panel',$dom).off('focusout').on('focusout',function(){						
				$('.myui-combo-panel',$dom).hide();
				that.view.setSelectable(false);
				that.__setkeepshow(false);
				return true;
			});
			var onselectdata = that.view.events.onselectdata;
			that.view.events.onselectdata = function(key){
				if(that.options.selectmode == 'multiple')
				{
					var datas = this.getSelectDatas();
					var texts = [];
					for (var i = 0; i < datas.length; i++) {
						var data = datas[i];
						if(that.options.formatselect){
							texts.push(that.options.formatselect(data[that.options.modelText]));
						}
						else
						{
							texts.push(data[that.options.modelText]);
						}
					};
					datas && $('.myui-combo-input',$dom).val(texts.join(';'));
				}
				else
				{
					var data = this.getSelectData();
					if(that.options.formatselect){
						data && $('.myui-combo-input',$dom).val(that.options.formatselect(data[that.options.modelText]));
					}
					else
					{
						data && $('.myui-combo-input',$dom).val(data[that.options.modelText]);
					}					
				}
				onselectdata && onselectdata.apply(that.view,[key]);
			}
		},
		unbindEvents:function(){
			var $dom = this.$container;
			$('.myui-combo-input',$dom).off('input');
			$('.myui-combo-panel,.myui-combo-input',$dom).off('keydown');
			$('.myui-combo-panel,.myui-inputcombo',$dom).off('blur')
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.InputCombo = InputCombo;
})(myui,jQuery);