;(function (libs,$) {
	var strFormat = libs.Utils.strFormat;
	var default_options = {
		modelKey:'key',
		modelText :'text',
		modelDescription :'description',
		modelAsyncLoad:'asyncload',
		modelIcon: '',
		modelParent :'parent',
		modelChildren:'children',
		dataparser:'tree',
		selectmode:'single',
	};

	var Tree = libs.Class.define({
		__constructor:function(options){			
			this.id = libs.Utils.unique();
			this.options = $.extend({},default_options,options);
			this.selectkey = null;
			this.selectkeys = [];
			this.events = this.options.events || {};
		},
		events:{
			onselet:null,
			ontreecomplete:null,
			onasyncload:null
		},
		dom:function () {
			return $('#myui_tree_'+this.id);
		},
		__build:function(){
			var that = this;
			var options = this.options;
			var codes = [];					
			if(options.dataparser == 'list')
			{
				codes = that.__parsedata_list();
			}
			else if(options.dataparser == 'tree')
			{
				codes = that.__parsedata_tree();
			}
			this.container.append('<div id="myui_tree_'+this.id + '">'+codes.join('')+'</div>');
			this.events.ontreecomplete && this.events.ontreecomplete();
		},
		__parsedata_list:function(){
			var options = this.options;
			var datas = options.datas;
			var codes = [];
			codes.push('<div class="tree-list">');
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				var modelKey = options.modelKey ? data[options.modelKey] : '';
				var modelParent = options.modelParent ? data[options.modelParent] : '';
				var modelText = options.modelText ? data[options.modelText] : '';
				var description = options.modelDescription ? data[options.modelDescription] : '';				
				var modelIcon = options.modelIcon ? data[options.modelIcon] : '';
				var asyncload = options.modelAsyncLoad ? data[options.modelAsyncLoad] : false;
				if(modelParent)
				{
					continue;
				}
				var childrencodes = this.__parsedata_list_children(modelKey);
				codes.push(strFormat('<div class="tree-item {0}" data-children="{1}" data-id="{2}">',
					childrencodes.length > 0 ? 'tree-parent-item':'',
					childrencodes.length > 0,
					modelKey,
					asyncload ? 'tree-parent-item tree-asyncload-item closed' : ''
					));
				codes.push(strFormat('<i class="icon {0}"></i>', modelIcon || ''));
				codes.push('<div class="text">');
				codes.push(strFormat('<div class="head-text">{0}</div>',modelText));
				description && codes.push(strFormat('<div class="description">{0}</div>',description));	
				codes = codes.concat(childrencodes);
				codes.push('</div>');
				codes.push('</div>');
			}
			codes.push('</div>');
			return codes;
		},
		__parsedata_list_children:function(parent){
			var options = this.options;
			var datas = options.datas;
			var begin,end = false;
			var codes = [];
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				var modelKey = options.modelKey ? data[options.modelKey] : '';
				var modelParent = options.modelParent ? data[options.modelParent] : '';
				var modelText = options.modelText ? data[options.modelText] : '';
				var description = options.modelDescription ? data[options.modelDescription] : '';
				var modelIcon = options.modelIcon ? data[options.modelIcon] : '';
				var asyncload = options.modelAsyncLoad ? data[options.modelAsyncLoad] : false;
				if(modelParent != parent) { continue; }
				if(!begin){
					codes.push('<div class="tree-list">');
					begin = true;
					end = true;
				}
				var childrencodes = this.__parsedata_list_children(modelKey);
				codes.push(strFormat('<div class="tree-item {0} {3}" data-children="{1}" data-id="{2}">',
					childrencodes.length > 0 ? 'tree-parent-item':'',
					childrencodes.length > 0,
					modelKey,
					asyncload ? 'tree-parent-item tree-asyncload-item closed' : ''
					));
				codes.push(strFormat('<i class="icon {0}"></i>', modelIcon || ''));
				codes.push('<div class="text">');
				codes.push(strFormat('<div class="head-text">{0}</div>',modelText));
				description && codes.push(strFormat('<div class="description">{0}</div>',description));	
				codes = codes.concat(childrencodes);
				codes.push('</div>');
				codes.push('</div>');
			}
			if(end){
				codes.push('</div>');
			}
			return codes;
		},
		__parsedata_tree:function(children){
			var options = this.options;
			var datas = options.datas;
			var datas = children && children.length > 0 ? children : options.datas;
			var codes = [];
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				var modelKey = options.modelKey ? data[options.modelKey] : '';
				var modelParent = options.modelParent ? data[options.modelParent] : '';
				var modelText = options.modelText ? data[options.modelText] : '';
				var description = options.modelDescription ? data[options.modelDescription] : '';				
				var modelIcon = options.modelIcon ? data[options.modelIcon] : '';
				var modelChildren = options.modelChildren ? data[options.modelChildren] : [];
				var asyncload = options.modelAsyncLoad ? data[options.modelAsyncLoad] : false;
				codes.push('<div class="tree-list">');
				codes.push(strFormat('<div class="tree-item {0}" data-children="{1}" data-id="{2}">',
					modelChildren.length > 0 ?'tree-parent-item':''
					,modelChildren.length > 0,
					modelKey,
					asyncload ? 'tree-parent-item tree-asyncload-item closed' : ''
					));
				codes.push(strFormat('<i class="icon {0}"></i>', modelIcon || ''));
				codes.push('<div class="text">');
				codes.push(strFormat('<div class="head-text">{0}</div>',modelText));
				description && codes.push(strFormat('<div class="description">{0}</div>',description));	
				if(modelChildren.length > 0) {
					codes = codes.concat(this.__parsedata_tree(modelChildren));
				}
				codes.push('</div>');
				codes.push('</div>');
				codes.push('</div>');
			}
			return codes;
		},
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
		reload:function(){
			var that = this;
			var options = this.options;
			if(options.url)
			{
				$.ajax({
					url:options.url,
					data:options.data,
                    dataType:options.dataType,
                    success:function(result){
                    	options.dataparser = result.dataparser;
                    	options.datas = result.datas;
                    	that.__build();
                    }
				});
			}			
		},			
		find:function(modelKey){
			if(this.options.dataparser == 'list')
			{
				return this.__finddata_list(modelKey);
			}
			else if(this.options.dataparser == 'tree')
			{
				return this.__findata_tree(modelKey);
			}
			return null;
		},
		__finddata_list:function(modelKey){
			var datas = this.options.datas;
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				if(data[this.options.modelKey] == modelKey){
					return data;
				}
			}
			return null;
		},
		__findata_tree:function(modelKey,children){
			var datas = children && children.length > 0 ? children : this.options.datas;
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				if(data[this.options.modelKey] == modelKey){
					return data;
				}
				if(data[this.options.modelChildren] && data[this.options.modelChildren].length > 0)
				{
					return this.__findata_tree(modelKey,data[this.options.modelChildren]);
				}
			}
			return null;
		},
		__async_load:function(modelKey,onasyncloadend){
			var that =this;
			var options = that.options;
			var $dom = that.dom();
			var params = {};
			params[options.modelParent] = modelKey;
			params = $.extend({}, options.data,params);
			if(options.url)
			{
				$.ajax({
					url:options.url,
					data:params,
                    dataType:options.dataType,
                    success:function(result){                    	
						if(result.dataparser == 'list')
						{
							options.datas = options.datas.concat(result.datas);
							var data = that.find(modelKey);
							var selector = '.tree-item[data-id='+modelKey+'] .text';
							var codes = that.__parsedata_list_children(modelKey);
							$(selector,$dom).append(codes.join(''));
							onasyncloadend && onasyncloadend(result.datas != null);
						}
						else
						{
							var data = that.find(modelKey);
							data[that.modelChildren] = result.datas;
							var selector = '.tree-item[data-id='+modelKey+'] .text';
							var codes = that.__parsedata_tree(result.datas);
							$(selector,$dom).append(codes.join(''));
							onasyncloadend && onasyncloadend(result.datas != null);
						}                    	
                    }
				});
			}
			else if(this.events.onasyncload)
			{
				this.events.onasyncload(params,function(result){
					if(result.dataparser == 'list')
					{
						options.datas = options.datas.concat(result.datas);
						var data = that.find(modelKey);
						var selector = '.tree-item[data-id='+modelKey+'] .text';
						var codes = that.__parsedata_list_children(modelKey);
						$(selector,$dom).append(codes.join(''));			
						onasyncloadend && onasyncloadend(result.datas != null);
					}
					else
					{
						var data = that.find(modelKey);
						data[that.modelChildren] = result.datas;
						var selector = '.tree-item[data-id='+modelKey+'] .text';
						var codes = that.__parsedata_tree(result.datas);
						$(selector,$dom).append(codes.join(''));	
						onasyncloadend && onasyncloadend(result.datas != null);			
					}
				});
			}
		},
		select:function(modelKey){
			var that = this;
			var options = that.options;
			var $dom = that.dom();
			that.events.onselect && that.events.onselect(modelKey);			
			if(options.selectmode == 'single')
			{
				that.selectkey = modelKey;
				$('.tree-item .head-text',$dom).removeClass('highlight');
				var selector = '[data-id='+modelKey+']>.text>.head-text';
				$(selector,$dom).addClass('highlight');
			}
			else
			{
				if(libs.Utils.arrayContains(that.selectkeys,modelKey)){ return; }
				that.selectkeys.push(modelKey);
				var selector = '[data-id='+modelKey+']>.text>.head-text';
				$(selector,$dom).addClass('highlight');
			}
		},
		isselect:function(modelKey){
			var that = this;
			var options = that.options;
			if(options.selectmode == 'single')
			{
				return (that.selectkey == modelKey);
			}
			else
			{
				return libs.Utils.arrayContains(that.selectkeys,modelKey);
			}
			return false;
		},
		unselect:function(modelKey){
			var that = this;
			var options = that.options;
			var $dom = that.dom();
			if(options.selectmode == 'single')
			{
				that.selectkey = null;
				var selector = '[data-id='+modelKey+']>.text>.head-text';
				$(selector,$dom).removeClass('highlight');
			}
			else
			{
				libs.Utils.arrayRemove(that.selectkeys,modelKey);
				var selector = '[data-id='+modelKey+']>.text>.head-text';
				$(selector,$dom).removeClass('highlight');
			}
		},
		getSelectData:function(){
			return this.find(this.selectkey);
		},
		getSelectDatas:function(){
			var result = [];
			for (var i = 0; i < this.selectkeys.length; i++) {
				var key = this.selectkeys[i]
				result.push(this.find(key));
			};
			return result;
		},
		bindEvents:function(){
			var that = this;
			var options = that.options;
			var $dom = that.dom();
			$('.tree-parent-item>.icon',$dom).off('click.myui-tree').on('click.myui-tree',function(){
				$(this).closest('.tree-parent-item').toggleClass('closed');
			});
			$('.tree-asyncload-item>.icon',$dom).off('click.myui-tree.asyncload').on('click.myui-tree.asyncload',function(){
				var $this = $(this);
				var $treeitem = $(this).closest('.tree-item');
				var modelKey = $treeitem.attr('data-id');
				that.__async_load(modelKey,function(haschildren){
					$this.off('click.myui-tree.asyncload');
					$treeitem.attr('data-children',haschildren);
				});
			});
			$('.tree-item .head-text',$dom).off('click.myui-tree').on('click.myui-tree',function(){
				var $this = $(this);
				var $treeitem = $this.closest('.tree-item');
				var modelKey = $treeitem.attr('data-id');
				if(that.isselect(modelKey))
				{
					that.unselect(modelKey);
				}
				else
				{
					that.select(modelKey);
				}
			});
		},
		unBindEvents:function(){
			var that = this;
			var $dom = that.dom();
			$('.tree-parent-item>.icon',$dom).off('click.myui-tree');
			$('.tree-item .head-text',$dom).off('click.myui-tree');
		}
	});
	libs.Widgets.Tree = Tree;
})(myui,jQuery);