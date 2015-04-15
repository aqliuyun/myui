(function(libs,$) {

	var Flow = libs.Flow;

	var Record = libs.Class.define({
		__constructor:function(){
			this.actions = {};
		},
		trigger:function(action){
			return this.actions[action] && this.actions[action].apply(this);
		},
		get:function(action){
			return this.actions[action];
		},
		set:function(action,callback){
			this.actions[action] = callback;
		},
		remove:function(act){
			delete this.actions[action];
		}
	});
		
	var Dialog = libs.Class.define({
		/**
		*@description 对话框
		*@constructor myui.Dialog
		*/
		__constructor:function(options){
			//空构造函数			
			if(arguments.length == 0 || options == null){ return; }
			this.id = libs.Utils.unique();
			this.options = options || {};
			this.flows = new Record();
			this.initialize();
		},
		events:{
			/**
			*@description 弹出前触发
			*@event myui.Dialog#onshow
			*/
			onshow:null,			
			onshown:null,
			onhidden:null,
			onhide:null
		},
		initialize:function() {
			var that = this;

			var html = this._build();

			$(this.options.parent || document.body).append(html);

			this.flows.set('close',function(callback){ that.close(); callback && callback(); });
			this.flows.set('hide',function(callback){ that.hide(); callback && callback(); });
			this.flows.set('show',function(callback){ that.show(); callback && callback(); });
			this.flows.set('refresh',function(callback){ that.refresh(); callback && callback(); });

			var options = this.options;			
			if(!options.actions){return;}
			var count = options.actions.length;
			for (var i = 0; i < count; i++) {
				var act = options.actions[i];
				this.flows.set(act.name,act.action);
			};
		},
		_build:function() {
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('<button data-action="close" type="button" class="my-btn close"><span aria-hidden="true">&times;</span></button>')				
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-body {1}">{0}</div>',options.content,options.contentCss || ''));
			if(options.buttons)
			{
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-foot {0}">',options.footCss || ''));
				var count = options.buttons.length;
				for (var i = 0; i < count; i++) {
					var btn = options.buttons[i];
					htmls.push(libs.Utils.strFormat('<input type="button" data-action="{2}" data-async="{3}" class="my-btn my-btn-alert {1}" value="{0}"/>',btn.btnText,btn.btnCss || '',btn.action,btn.async || false));
				};
				htmls.push('</div>');
			}
			htmls.push('</div>');
			return htmls.join('');
		},
		dom:function(){
			return $('#my_dialog_' + this.id);
		},
		refresh:function(){
			var $dom = this.dom();
			$(".my-dialog-body",$dom).html(options.content);
		},
		show:function(){
			this.events.onshow && this.events.onshow.apply(this);
			var $dom = this.dom();
			$dom.show();
			this.bindEvents();
			this.events.onshown && this.events.onshown.apply(this);
		},
		hide:function(){
			this.events.onhide && this.events.onhide.apply(this);
			var $dom = this.dom();
			$dom.hide();
			this.unbindEvents();
			this.events.onhidden && this.events.onhidden.apply(this);
		},
		close:function(){
			this.hide();
			var $dom = this.dom();
			$dom.remove();
		},
		bindEvents:function(){
			var that = this;
			var $dom = this.dom();
			$('.my-btn',$dom).off('click').on('click',function() {
				var $this = $(this);
				var data_actions = libs.Utils.strTrim($this.attr('data-action'));
				var actions = data_actions.split(';');
				var async = $this.attr('data-async') === "true" ? true : false;
				var flows = [];
				for (var i = 0; i < actions.length; i++) {
					flows.push(that.flows.get(actions[i]));
				};
				async ? new Flow(flows).async():new Flow(flows).sync();
			});
		},
		unbindEvents:function(){
			var $dom = this.dom();
			$('.my-btn',$dom).off('click');
		}
	});

	var SimpleAlert = libs.Class.extend(Dialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			SimpleAlert.__super.initialize.apply(this);
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('<button data-action="close" type="button" class="my-btn close" ><span aria-hidden="true">&times;</span></button>')				
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-body {1}">{0}</div>',options.content,options.contentCss || ''));
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-foot {1}"><input type="button"  data-action="close;done;" data-async="false" class="my-btn my-btn-alert {2}" value="{0}"/></div>',options.btnText || '确定',options.footCss || '',options.btnCss || ''));
			htmls.push('</div>');
			return htmls.join('');
		},
	});

	var SimpleConfirm = libs.Class.extend(Dialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			SimpleConfirm.__super.initialize.apply(this);
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('<button data-action="close" type="button" class="my-btn close"><span aria-hidden="true">&times;</span></button>')
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-body {1}">{0}</div>',options.content,options.contentCss || ''));
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-foot {0}">',options.footCss || ''));
			htmls.push(libs.Utils.strFormat('<input type="button" data-action="close;done;" data-async="false" class="my-btn my-btn-confirm {1}" value="{0}"/>',options.yesText || '确定',options.btnCss || ''));
			htmls.push(libs.Utils.strFormat('<input type="button" data-action="close" class="my-btn my-btn-confirm {1}" value="{0}"/>',options.noText || '取消',options.btnCss || ''));
			htmls.push('</div>');
			htmls.push('</div>');
			return htmls.join('');
		},
	});

	var AsyncAlert = libs.Class.extend(Dialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			AsyncAlert.__super.initialize.apply(this);
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('<button data-action="close" type="button" class="my-btn close"><span aria-hidden="true">&times;</span></button>')
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-body {1}">{0}</div>',options.content,options.contentCss || ''));
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-foot {1}"><input type="button" data-action="done;close;" data-async="true" class="my-btn my-btn-alert {2}" value="{0}"/></div>',options.btnText || '确定',options.footCss || '',options.btnCss || ''));
			htmls.push('</div>');
			return htmls.join('');
		},
	});

	var AsyncConfirm = libs.Class.extend(Dialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			AsyncConfirm.__super.initialize.apply(this);
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.strFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('<button data-action="close" type="button" class="my-btn close"><span aria-hidden="true">&times;</span></button>')
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-body {1}">{0}</div>',options.content,options.contentCss || ''));
			htmls.push(libs.Utils.strFormat('<div class="my-dialog-foot {0}">',options.footCss || ''));
			htmls.push(libs.Utils.strFormat('<input type="button" data-action="done;close;" data-async="true" class="my-btn my-btn-confirm {1}" value="{0}"/>',options.yesText || '确定',options.btnCss || ''));
			htmls.push(libs.Utils.strFormat('<input type="button" data-action="close" class="my-btn my-btn-confirm {1}" value="{0}"/>',options.noText || '取消',options.btnCss || ''));
			htmls.push('</div>');
			htmls.push('</div>');
			return htmls.join('');
		},
	});

	libs.Widgets = libs.Widgets || {};
	libs.Widgets.Dialog = Dialog;
	libs.Widgets.SimpleAlert = SimpleAlert;
	libs.Widgets.SimpleConfirm = SimpleConfirm;
	libs.Widgets.AsyncAlert = AsyncAlert;
	libs.Widgets.AsyncConfirm = AsyncConfirm;
})(myui,jQuery);