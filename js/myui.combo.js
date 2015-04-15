;(function (libs,$) {
	var ComboView = libs.Class.extend(libs.DataViewer.DefaultView,{
		__constructor:function(options){
//			this.__super(options);
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
			this.attach(this.manager);
		},
		events:{
			onloadcomplete:null,
			oncombocomplete:null,
			onrefreshed:null,
			onselecdata:null,
			onselectable:null,
		},	
		attach:function(manager){
			var that = this;
            this.manager = manager;
            this.adapter.manager = manager;
            this.manager.adapter = this.adapter;
            this.adapter.initialize(this.options,manager,this.view,this.watcher);
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

	var InputCombo = libs.Class.extend(Combo,{
		__constructor:function(){

		},
	});

	var DropdownCombo = libs.Class.extend(Combo,{
		__constructor:function(){

		},
	});

	var MenuCombo = libs.Class.extend(Combo,{
		__constructor:function(){

		},		
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.Combo = Combo;
	libs.Widgets.InputCombo = InputCombo;
	libs.Widgets.DropdownCombo = DropdownCombo;
	libs.Widgets.MenuCombo = MenuCombo;
})(myui,jQuery);