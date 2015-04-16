;(function (libs,$) {
	var ComboView = libs.Class.extend(libs.DataViewer.DefaultView,{
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
			this.select = null;
			this.selects = [];
			this.events = this.options.events;
			this.selectIndex = null;
			this.selectable = false;
		},
		dom:function (argument) {
			return $('#myui_combo_'+this.id);
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
        	var modelKey = data[this.options.modelKey];
        	var highlight = (libs.Utils.arrayContains(this.selects,modelKey) || this.select == modelKey);
            return ['<div class="myui-combo-item ',highlight?'highlight':'',this.options.comboItemCss || '', '" id="', this.viewId(data,viewIndex), '" data-modelKey="',data[this.options.modelKey],'" data-viewIndex="',viewIndex,'" >', output, '</div>'].join('')
        },
        //渲染尾部
        renderFoot: function() {
            return '</div>';
        },
        //渲染空
        renderEmpty:function(){
            return this.options.emptyText || '<div class="myui-combo-item">无数据项</div>';
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
        setSelectable:function(able){
        	this.selectable = able;
        },
        resetSelect:function(){
        	this.selectIndex = null;
            this.select = null;
            this.selects = [];
        },
        //选中的数据
        selectKey:function (key) {
        	if(!this.selectable){ return; }
        	this.select = key;
        	if(this.options.selectmode == 'multiple')
        	{
        		this.selects.push(key);
        	}
        	this.events.onselectdata && this.events.onselectdata.apply(this,[key]);
        },
        //选择下一个
        selectNext:function(){
        	if(this.options.selectmode == 'multiple')
        	{
        		return;
        	}
        	var next = this.selectIndex != null ? ~~this.selectIndex + 1 : 0;
        	var $next = $('[data-viewIndex=' + next + ']');
        	if($next.length == 0)
        	{
        		this.selectIndex = $('[data-viewIndex]:first').attr('data-viewIndex');
        		this.selectKey($('[data-viewIndex]:first').attr('data-modelKey')) ;
        	}
        	else
        	{
        		this.selectIndex = next;
        		this.selectKey($next.attr('data-modelKey')) ;	
        	}
			this.adapter.refresh();
        },
        selectPrev:function(){
			if(this.options.selectmode == 'multiple')
        	{
        		return;
        	}
        	var prev = this.selectIndex != null ? ~~this.selectIndex - 1 : $('[data-viewIndex]:last').attr('data-viewIndex') || 0;
        	var $prev = $('[data-viewIndex=' + prev + ']');
        	if($prev.length == 0)
        	{
        		this.selectIndex = $('[data-viewIndex]:last').attr('data-viewIndex');
        		this.selectKey($('[data-viewIndex]:last').attr('data-modelKey')) ;
        	}
        	else
        	{
        		this.selectIndex = prev;
        		this.selectKey($prev.attr('data-modelKey')) ;	
        	}
			this.adapter.refresh();
        },
        bindEvents:function () {
        	var that = this;
        	var $dom = this.dom();
        	$('.myui-combo-item',$dom).off('click').on('click',function(){
				var $this = $(this);
				var modelKey = $this.attr('data-modelKey');
				var viewIndex = $this.attr('data-viewIndex');
				that.selectIndex = viewIndex;
				that.selectKey(modelKey);
				that.adapter.refresh();
			});
			this.events.onbindevents && this.events.onbindevents.apply(this);      
        },
        unBindEvents:function () {
        	var that = this;
        	var $dom = this.dom();
        	$('.myui-combo-item',$dom).off('click');
        	this.events.onunbindevents && this.events.onunbindevents.apply(this);      	
        }
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
			onselectdata:null,
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

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.Combo = Combo;
})(myui,jQuery);