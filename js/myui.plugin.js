(function (lib,$) {
	$.fn.myui = function(plugin,options) {		
		var $this = $(this);
		var data = $this.data('myui-plugin');
		if(data == null)
		{
			var default_options = libs[plugin].default_options || {};
			var opts = $.extend({}, default_options,options);			
			data = new libs[plugin](opts);
			$this.data('myui-plugin',data);
		}
		return data;
	}
})(myui,jQuery);