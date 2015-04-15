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
		
	libs.ModalDialog = libs.Class.extend(libs.Dialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function() {
			var that = this;

			this.modal = new libs.Layer({});
			that.__willbuild = true;

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
		show:function(){
			this.modal.block();
			if(this.__willbuild){
				var html = this._build();
				this.options.parent = this.modal.content();
				if(this.options.parent.length == 0){ this.options.parent = document.body; }
				$(this.options.parent).append(html);
				this.__willbuild = false;
			}
			this.__supermethod().show.apply(this);
		},
		hide:function(){
			this.__supermethod().hide.apply(this);
			this.modal.unblock();
		},
		close:function(){
			this.hide();
			var $dom = this.dom();
			$dom.remove();
			this.modal.close();
		},
	});

	libs.SimpleModalAlert = libs.Class.extend(libs.ModalDialog,{
		__constructor:function(options){			
			this.__super(options);
		},
		initialize:function(){			
			var that = this;
			this.__supermethod().initialize();
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog my-dialog-modal {1}">',this.id,options.dialogCss || ''));
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

	libs.SimpleModalConfirm = libs.Class.extend(libs.ModalDialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			this.__supermethod().initialize();
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog my-dialog-modal {1}">',this.id,options.dialogCss || ''));
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

	libs.AsyncModalAlert = libs.Class.extend(libs.ModalDialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			this.__supermethod().initialize();
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog my-dialog-modal {1}">',this.id,options.dialogCss || ''));
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

	libs.AsyncModalConfirm = libs.Class.extend(libs.ModalDialog,{
		__constructor:function(options){
			this.__super(options);
		},
		initialize:function(){
			var that = this;
			this.__supermethod().initialize();
			this.flows.set('done',function(callback){ that.options.done.apply(that,[callback]); });
		},
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.strFormat('<div id="my_dialog_{0}" class="my-dialog my-dialog-modal {1}">',this.id,options.dialogCss || ''));
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
})(myui,jQuery);