;(function (libs,$) {
	var ComboView = libs.Class.extend(libs.DataViewer.DefaultView,{
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
		},
	    //渲染头部
        renderHead: function() {
            return libs.Utils.strFormat('<div id="myui_combo_{1}" class="myui-combo {0}">',this.options.comboCss || '',this.id);
        },
        //渲染主题部分
        renderBody: function(data,viewIndex) {
        	var output = '';
        	if(this.options.format){
        		output = this.options.format.apply(this,[data]) || '';
        	}
        	else if(this.options.modelText)
        	{
        		output = data[this.options.modelText];
        	}
            return ['<div class="myui-combo-item ',, '" id="', this.viewId(data,viewIndex), '">', output, '</div>'].join('')
        },
        //渲染尾部
        renderFoot: function() {
            return '</div>';
        },
        //渲染空
        renderEmpty:function(){
            return this.options.emptyText || '<div class="myui-combo-item>无数据项</div>';
        },
        //获取选中的数据
        getSelectData:function(){
            if(this.select == null) return;
            return this.adapter.manager.findData(this.select);
        },
        //获取选中的数据
        getSelectDatas:function(){
            var result = [];
            var count = this.selects.length;
            for (var i = 0; i < count; i++) {
                result.push(this.adapter.manager.findData(this.selects[i]));
            }
            return result;
        },
	});

	var Combo = libs.Class.define({
		__constructor:function(options){
			if(options == null || arguments.length == 0) return;
			this.id = libs.Utils.unique();
			this.options = options || {};
			this.manager = options.manager || new libs.DataViewer.DataManager(options);
			this.adapter = new libs.DataViewer.DefaultAdapter(options);
			this.view = new ComboView(options);
			this.events = options.events || {};
			this.initialize();
		},
		events:{
			onloadcomplete:null,
			oncombocomplete:null,
			onrefreshed:null,
			onselecdata:null,
			onselectable:null,
		},	
		initialize:function(){
			var that = this;
            this.adapter.manager = this.manager;
            this.manager.adapter = this.adapter;
            this.adapter.initialize(this.options,this.manager,this.view,this.watcher);
            var options = this.options;
            if(options.url)
            {
            	this.reload();
            }
            else if(options.datas)
            {
            	that.manager.begin();                        
                that.manager.clear();
                that.manager.appendDatas(options.datas);
                that.manager.end();
            }
		},	
		dom:function(){
			return $('#myui_combo_'+this.id);
		},
		show:function(){
			var $dom = this.dom();
			$dom.show();
		},
		hide:function () {
			var $dom = this.dom();
			$dom.hide();
		},
		close:function(){
			var $dom = this.dom();
			$dom.remove();
		},
		reload:function () {
			var that = this;
			var options = that.options;
			if(options.url){
				$.ajax({
					url:options.url,
					data:options.data,
                    dataType:options.dataType,
                    success:function(result){
                    	result = that.events.onloadcomplete && that.events.onloadcomplete.apply(that,[result]) || result;
                        that.manager.begin();                        
                        that.manager.clear();
                        that.manager.appendDatas(result);
                        that.manager.end();
                        that.events.oncombocomplete && that.events.oncombocomplete.apply(that);
                    }
				})
				return;
			}
			this.adapter.refresh();
		}
	});

    function InputComboWatcher(){
    	this.condition = null;
        this.match = null;
    }

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
        	if(!this.condition) return allDatas;
        	var datas = [];
        	for (var i = 0; i < allDatas.length; i++) {
        		if(this.match && this.match(allDatas[i],this.condition))
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
			this.watcher = new InputComboWatcher();
			this.watcher.match = options.match || function(data,condition){ return data[that.options.modelText].toString().indexOf(condition) >= 0; }
			this.__super(options);
		},
		attach:function(){
			var htmls = [];
			htmls.push('<div class="myui-combo-input-container"><input type="text" class="my-combo-input"/><div class="my-combo-panel"></div></div>');
			var $container = $(htmls.join(''));
			this.adapter.container.empty();
			this.adapter.container.prepend($container);			
			this.$container = this.adapter.container;
			this.adapter.container = $container.find('.my-combo-panel');
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
			$('.my-combo-input',$dom).off('input').on('input',function(){
				var $this = $(this);
				var value = $this.val();
				that.watcher.search(value);
				that.adapter.refresh();
				if(value.length > 0)
				{
					$('.my-combo-panel',$dom).show();
				}
				else
				{
					$('.my-combo-panel',$dom).hide();
				}
			});
		},
		unbindEvents:function(){}
	});

	var DropdownCombo = libs.Class.extend(Combo,{
		__constructor:function(){
			this.__super(arguments);
		},
		attach:function(){

		}
	});

	var MenuCombo = libs.Class.extend(Combo,{
		__constructor:function(){
			this.__super(arguments);
		},		
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.Combo = Combo;
	libs.Widgets.InputCombo = InputCombo;
	libs.Widgets.DropdownCombo = DropdownCombo;
	libs.Widgets.MenuCombo = MenuCombo;
})(myui,jQuery);