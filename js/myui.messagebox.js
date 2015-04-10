(function(libs,$) {
	function Flow(){
		this.actions = {};
	}
	Flow.prototype = {
		trigger:function(action,params){
			return this.actions[action] && this.actions[action].apply(this,params);
		},
		set:function(action,callback){
			this.actions[action] = callback;
		},
		remove:function(act){
			delete this.actions[action];
		}
	}
	
	/**
	*@description 对话框
	*@constructor myui.Dialog
	*/
	function Dialog(options){
		this.id = libs.Utils.unique();
		this.options = options;
	}

	Dialog.prototype = {
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
		_build:function(){
			var options = this.options;
			var htmls = [];
			htmls.push(libs.Utils.stringFormat('<div id="my_dialog_{0}" class="my-dialog {1}">',this.id,options.dialogCss || ''));
			if(options.title) {
				htmls.push(libs.Utils.stringFormat('<div class="my-dialog-title {0}">',options.titleCss || ''));
				htmls.push(options.title);
				htmls.push('</div>');
			}
			htmls.push(libs.Utils.stringFormat('<div class="my-dialog-content {1}">{0}</div>',options.content,options.contentCss || ''));
			htmls.push('</div>');
			return htmls.join('');
		},
		refresh:function(){
			var $dom = $('#my_dialog_' + this.id);
			$(".my-dialog-content",$dom).html(options.content);
		},
		show:function(){
			this.events.onshow && this.events.onshow.apply(this);
			var $dom = $('#my_dialog_' + this.id);
			$dom.show();
			this.events.onshown && this.events.onshown.apply(this);
		},
		hide:function(){
			this.events.onhide && this.events.onhide.apply(this);
			var $dom = $('#my_dialog_' + this.id);
			$dom.hide();
			this.events.onhidden && this.events.onhidden.apply(this);
		},
	}
})(myui,jQuery);