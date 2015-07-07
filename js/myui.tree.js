;(function (libs,$) {
	var strFormat = libs.Utils.strFormat;
	var default_options = {
		modelKey:'key',
		modelText :'text',
		modelDescription :'description',
		modelIcon: '',
		modelParent :'parent',
		modelChildren:'children',
		dataparser:'tree'
	};

	var Tree = libs.Class.define({
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
			this.events = this.options.events || {};
		},
		events:{},
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
			this.container.append(codes.join(''));
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
				if(modelParent)
				{
					continue;
				}
				var childrencodes = this.__parsedata_list_children(modelKey);
				codes.push(strFormat('<div class="tree-item {0}" data-children="{1}">',childrencodes.length > 0 ? 'tree-parent-item':'',childrencodes.length > 0));
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
				if(modelParent != parent) { continue; }
				if(!begin){
					codes.push('<div class="tree-list">');
					begin = true;
					end = true;
				}
				var childrencodes = this.__parsedata_list_children(modelKey);
				codes.push(strFormat('<div class="tree-item {0}" data-children="{1}">',childrencodes.length > 0 ? 'tree-parent-item':'',childrencodes.length > 0));
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
				codes.push('<div class="tree-list">');
				codes.push(strFormat('<div class="tree-item {0}" data-children="{1}">',modelChildren.length > 0 ?'tree-parent-item':'',modelChildren.length > 0));
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
		}	,	
		bindEvents:function(){
			$('.tree-parent-item>.icon').off('click.myui-tree').on('click.myui-tree',function(){
				console.log('click');
				$(this).parent().toggleClass('closed');
			});
		},
		unBindEvents:function(){}
	});
	libs.Widgets.Tree = Tree;
})(myui,jQuery);