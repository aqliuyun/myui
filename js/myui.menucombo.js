;(function (libs,$) {
	var Combo = libs.Widgets.Combo;	

	var MenuItemView = libs.Class.extend(libs.DataViewer.DefaultView,{
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
			this.events = this.options.events || {};
		},
		dom:function (argument) {
			return $('#myui_menu_'+this.id);
		},
	    //渲染头部
        renderHead: function() {
            return libs.Utils.strFormat('<div id="myui_menu_{1}" class="myui-menu {0}">',this.options.comboCss || '',this.id);
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
            return ['<div class="myui-menu-item ',this.options.comboItemCss || '', '" data-modelKey="',modelKey,'" data-viewIndex="',viewIndex,'" >', output, '</div>'].join('')
        },
        //渲染尾部
        renderFoot: function() {
            return '</div>';
        },
        //渲染空
        renderEmpty:function(){
            return this.options.emptyText || '<div class="myui-menu-item">无菜单项</div>';
        },        
        bindEvents:function () {
        	var that = this;
        	var $dom = this.dom();
        	$('.myui-menu-item',$dom).off('mouseover').on('mouseover',function(){
				var $this = $(this);
				var modelKey = $this.attr('data-modelKey');
				that.events.onpopsubmenu && that.events.onpopsubmenu.apply(that,[modelKey]);
			});
			this.events.onbindevents && this.events.onbindevents.apply(this);      
        },
        unBindEvents:function () {
        	var that = this;
        	var $dom = this.dom();
        	$('.myui-menu-item',$dom).off('mouseover');
        	this.events.onunbindevents && this.events.onunbindevents.apply(this);      	
        }
	});

	var MenuItem = libs.Class.define({
		__constructor:function(parent,key,datas){
			this.key = key;
			this.children = datas;
			this.popup = false;
			this.parent = parent;
		},
		popup:function(x,y){
			this.popup = true;
		},
		close:function(){
			this.popup = false;
		}
	});

	var MenuCombo = libs.Class.define({
		__constructor:function(options){
			this.manager = new libs.DataViewer.DataManager(options);
			this.view = new MenuView();
			if(options.datas)
			{
				this.load(options.datas);
			}
		},
		load:function(datas){
			var options = this.options;
			this.manager.begin();
			this.manager.clear();
			for(var i = 0;i < datas.length;i++)
			{
				var data = datas[i];
				var find = this.manager.findData(data[options.modelKey]);
				if(find) { find.children.push(data); }
				this.manager.appendData(new MenuItem(data[options.modelParent],data[options.modelKey],[data]));
			}
			this.manager.end();
			this.bindEvents();
		},
		bindEvents:function(){
			var that = this;
			if(this.view){
				var popsubmenu = this.view.events.onpopsubmenu;
				this.view.events.onpopsubmenu = function(key){
					that.popsub(key);
					popsubmenu && popsubmenu();
				}
			}
		},
		close:function(){
			var menuitems = this.manger.getDatas();
			for(var i = 0;i < menuitems.length;i++)
			{
				var menuitem = menuitems[i];
				menuitem.close();
			}			
		},
		closesub:function(){
			var menuitems = this.manager.getDatas();
			for(var i = 0;i < menuitems.length;i++)
			{
				var menuitem = menuitems[i];
				if(menuitem.parent == key){
					menuitem.close();
				}
			}
		},
		popup:function(x,y){
			var menuitems = this.manager.getDatas();
			for(var i = 0;i < menuitems.length;i++)
			{
				var menuitem = menuitems[i];
				if(menuitem.parent == null){
					menuitem.popup(x,y);
				}
			}
		},
		popsub:function(key){
			var menuitems = this.manager.getDatas();
			for(var i = 0;i < menuitems.length;i++)
			{
				var menuitem = menuitems[i];
				if(menuitem.parent == key){
					menuitem.popup(x,y);
				}
			}
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.MenuCombo = MenuCombo;
})(myui,jQuery);