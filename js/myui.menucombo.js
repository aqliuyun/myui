;(function (libs,$) {
	var Flow = libs.Flow;
	var Record = libs.ActionRecord;
	var MenuItemView = libs.Class.extend(libs.DataViewer.DefaultView,{
		__constructor:function(options){
			this.id = libs.Utils.unique();
			this.options = options;
			this.events = this.options.events || {};
			this.container = $(this.options.container);
		},
		dom:function () {
			return this.container;
		},
		getMenuItem:function(key){
			return $('.myui-menu-item[data-modelKey='+key + ']',this.dom());
		},
		getMenu:function(key){
			return $('.myui-menucombo[data-modelKey='+key + ']',this.dom());
		},
		getSubMenu:function(key){
			return $('.myui-menucombo[data-parentKey='+key + ']',this.dom());
		},
		getSubMenus:function(level){
			return $('.myui-menucombo[data-level]',this.dom()).not(function(){
				return ~~($(this).attr('data-level')) < level;
			});
		},
		getSubMenuOffset:function(key){
			var $container = this.dom();			
			var $obj = $('.myui-menu-item[data-modelKey='+key + ']',$container);
			var offset =  libs.Measurement.getOffset($obj.get(0));
			console.log(offset);
			offset.left += $obj.outerWidth() + 3;
			return offset;
		},
	    //渲染头部
        renderHead: function(left,top,key,parentKey,level) {
            return libs.Utils.strFormat('<div class="myui-menucombo myui-menu {0}" style="left:{1}px;top:{2}px;" data-modelKey="{3}" data-parentKey="{4}" data-level="{5}">',this.options.comboCss || '',left,top,key,parentKey,level);
        },
        //渲染主题部分
        renderBody: function(menuitem,viewIndex) {
        	var output = '';
        	if(this.options.format){
        		output = this.options.format.apply(this,[menuitem,menuitem.data]) || '';
        	}
        	else if(this.options.modelText)
        	{
        		output = menuitem.text;
        	}
        	else
        	{
        		output = menuitem.value;
        	}
        	var modelKey = menuitem.key;
            return ['<div class="myui-menu-item ',this.options.comboItemCss || '', '" data-modelKey="',modelKey,'" data-viewIndex="',viewIndex,'" data-action="',menuitem.action,'" data-async="',menuitem.async,'">', output, '</div>'].join('')
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
				that.events.onpopsubmenu && that.events.onpopsubmenu.apply(that,[modelKey,$this,event]);
				return true;
			});
			$('.myui-menu-item',$dom).off('mousedown').on('mousedown',function(event){
				event.stopPropagation();
				var $this = $(this);				
				var act = $this.attr('data-action');
				if(!act){ return true; }
				var data_actions = libs.Utils.strTrim($this.attr('data-action'));
				var actions = data_actions.split(';');
				var async = $this.attr('data-async') === "true" ? true : false;
				that.events.onaction && that.events.onaction.apply(that,[actions,async]);
				return true;
			});
			this.events.onbindevents && this.events.onbindevents.apply(this);			
        },
        unBindEvents:function () {
        	var that = this;
        	var $dom = this.dom();
        	$('.myui-menu-item',$dom).off('mouseover');
        	$('.myui-menu-item',$dom).off('mousedown');
        	this.events.onunbindevents && this.events.onunbindevents.apply(this);      	
        }
	});	

	var MenuItem = libs.Class.define({
		__constructor:function(){
			this.key = null;
			this.text = null;
			this.value = null;
			this.parent = null;
			this.level = 0;
			this.action = '';
			this.async = false;
			this.data = null;
		}
	});

	var MenuCombo = libs.Class.define({
		__constructor:function(options){
			var that = this;
			this.menuitems = options.menuitems || [];
			this.view = new MenuItemView(options);
			this.popups = [];
			this.options = options;
			this.flows = new Record();
			this.container = $(options.container);
			if(options.datas.length)
			{
				this.load(options.datas);
			}
			this.flows.set('close',function(callback){ that.close(); callback && callback(); });
			if(!options.actions){return;}
			var count = options.actions.length;
			for (var i = 0; i < count; i++) {
				var act = options.actions[i];
				this.flows.set(act.name,act.action);
			};
			this.bindEvents();
		},		
		load:function(datas){
			var options = this.options;
			var rootmenu = new MenuItem();
			this.menuitems.push(rootmenu);
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				var menuitem = new MenuItem();
				menuitem.data = data;
				menuitem.action = data.action || 'close';
				menuitem.async = data.async || false;
				menuitem.text = data[this.options.modelText];
				menuitem.value = data[this.options.modelValue];
				menuitem.key = data[this.options.modelKey];
				menuitem.parent = data.parent;
				this.menuitems.push(menuitem);
				var parentmenu = libs.Utils.arrayFind(this.menuitems,function(left){ return left.key == data.parent; })
				parentmenu.children = parentmenu.children || [];
				menuitem.level = parentmenu.level + 1;
				parentmenu.action = '';
				parentmenu.children.push(menuitem);	
			};
		},
		bindEvents:function(){
			var that = this;
			var popsubmenu = this.view.events.onpopsubmenu;
			this.view.events.onpopsubmenu = function(key){				
				that.closesub && that.closesub(key);
				that.popsub && that.popsub(key);
				popsubmenu && popsubmenu(key);
			}
			this.view.events.onaction = function(actions,async){
				var flows = [];
				for (var i = 0; i < actions.length; i++) {
					flows.push(that.flows.get(actions[i]));
				};
				async ? new Flow(flows).async():new Flow(flows).sync();
			}
			this.container.on('mousedown',function(event){
				if(event.which == 3)
				{
					that.close();					
					that.popup(libs.Measurement.scrollLeft() + event.clientX,libs.Measurement.scrollTop() + event.clientY);
				}
				else
				{
					that.close();
				}
				return true;
			});
		},
		render:function(menu,left,top){
			if(!menu){ return''; }
			if(!this.view){ return ''; }
			var contents = [];			
			contents.push(this.view.renderHead(left,top,menu.key,menu.parent,menu.level));			
			if(!menu.children || menu.children.length == 0){
				return;
			}
			else
			{
				for (var i = 0; i < menu.children.length; i++) {
					contents.push(this.view.renderBody(menu.children[i],i));
				};
			}			
			contents.push(this.view.renderFoot());
			this.view.unBindEvents && this.view.unBindEvents();
			this.container && this.container.append(contents.join(''));
			this.view.bindEvents && this.view.bindEvents();
		},
		findRootMenu:function(){
			var options = this.options;
			return libs.Utils.arrayFind(this.menuitems,function(left){
				return left.key == null;
			});
		},
		findMenu:function(key){
			var options = this.options;
			return libs.Utils.arrayFind(this.menuitems,function(left){
				return left.key == key;
			});
		},
		findSubMenu:function(key){
			var options = this.options;
			return libs.Utils.arrayFind(this.menuitems,function(left){
				return left.parent == key;
			});
		},	
		close:function(){
			this.view && this.view.unBindEvents();
			$('.myui-menucombo').remove();
		},
		closesub:function(key){
			var menu = this.findMenu(key);
			var menuitem = this.view.getSubMenus(menu.level);
			menuitem.remove();
		},
		popup:function(left,top){
			var that = this;
			var menu = that.findRootMenu();
			that.render(menu,left,top);
		},
		popsub:function(key){
			var that = this;
			var offset = that.view.getSubMenuOffset(key);
			var menu = that.findMenu(key);
			that.render(menu,offset.left,offset.top);
		}
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.MenuCombo = MenuCombo;
})(myui,jQuery);