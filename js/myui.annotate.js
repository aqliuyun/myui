;(function (libs,$) {
    var AnnotateView = libs.Class.define({
        __constructor:function(options){
            this.id = libs.Utils.unique();
            this.options = options;
            this.select = null;
            this.selects = [];
            this.events = this.options.events || {};
            this.selectIndex = null;
            this.selectable = false;
        },
        dom:function (argument) {
            return $('#myui_annotate_'+this.id);
        },
        //渲染头部
        renderHead: function() {
            return libs.Utils.strFormat('<div id="myui_annotate_{1}" class="myui-annotate {0}">',this.options.annotateCss || '',this.id);
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
            return ['<div class="myui-annotate-item ',highlight?'highlight':'',this.options.annotateItemCss || '', '" id="', this.viewId(data,viewIndex), '" data-modelKey="',data[this.options.modelKey],'" data-viewIndex="',viewIndex,'" >', output, '</div>'].join('')
        },
        //渲染尾部
        renderFoot: function() {
            return '</div>';
        },
        //渲染空
        renderEmpty:function(){
            return this.options.emptyText || '';
        }
    });
	var Annotate = libs.Class.define({
		__constructor:function(options){
			if(options == null || arguments.length == 0) return;
			this.id = libs.Utils.unique();
			this.options = options || {};
			this.manager = options.manager || new libs.DataViewer.DataManager(options);
			this.adapter = new libs.DataViewer.DefaultAdapter(options);
			this.view = new AnnotateView(options);
			this.events = options.events || {};
			this.initialize();
		},
		events:{
			onloadcomplete:null,
			oncombocomplete:null,
			onrefreshed:null,
			onselectdata:null,
			onselectable:null
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
			return $('#myui_annotate_'+this.id);
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
				});
				return;
			}
			this.adapter.refresh();
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.Annotate = Annotate;
})(myui,jQuery);