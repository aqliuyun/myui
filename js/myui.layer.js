(function (libs,$) {
    layerState = {
        normal: 0,
        block: 1,
        unblock: 2,
        close: 3
    };
    var zIndex = 2000;
    function getzIndex()
    {
        zIndex += 2;
        return zIndex;
    }
    /**
    *@description 弹出层
    *@constructor myui.Layer
    *@example
    new myui.Layer({}).block();
    new myui.Layer({ parent : 'ui-container' }).block();
    */
    function Layer(options) {
        this.id = libs.Utils.unique();
        this.options = options;
        this.parent = options.parent || document.body;
        this.state = layerState.normal;
        this.options.zIndex = getzIndex();
    };
    Layer.default_options = {
        zIndex: 2000,
        single: false,
        fixed: true,
        html: '',
        dom: '',
        target: 'self',
        layerCss: '',
        contentCss: ''
    }
    /**
    *@constructs myui.LayerManager
    *@description 全局弹出层管理类
    *@example
    //弹出第一个弹出层
    myui.Layer.manager.first().block();
    */
    var LayerManager = {
        _layers: [],
        _roots: [],
        _leafs: [],
        /**
        *@private
        */
        _add: function (layer) {            
            if (libs.Utils.arrayIndexOf(this._layers,layer) >= 0) { return; }
            this._layers.push(layer);
            if (layer.parent === document.body) {
                this._roots.push(layer);
            }
            else {
                this._leafs.push(layer);
            }
        },
        /**
        *@private
        */
        _remove: function (layer) {
            libs.Utils.arrayRemove(this._layers,layer);
            if (layer.parent === document.body) {
                libs.Utils.arrayRemove(this._roots,layer);
            }
            else {
                libs.Utils.arrayRemove(this._leafs,layer);
            }
        },
        /**
        *@public        
        *@method
        *@description 第一个弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回第一个弹出层，否则返回null
        */
        first: function () {
            return this._layers.length > 0 ? this._layers[0] : null;
        },
        /**
        *@public        
        *@method
        *@description 第一个根弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回第一个根弹出层，否则返回null
        */
        firstRoot: function () {
            return this._roots.length > 0 ? this._roots[0] : null;
        },
        /**
        *@public        
        *@method
        *@description 第一个叶弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回第一个叶弹出层，否则返回null
        */
        firstLeaf: function () {
            return this._leafs.length > 0 ? this._leafs[0] : null;
        },
        /**
        *@public        
        *@method
        *@description 最后一个弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回最后一个弹出层，否则返回null
        */
        last: function () {
            var layers = this._layers;
            var count = layers.length;
            return count ? layers[count - 1] : null;
        },
         /**
        *@public        
        *@method
        *@description 最后一个根弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回最后一个根弹出层，否则返回null
        */
        lastRoot: function () {
            var layers = this._roots;
            var count = layers.length;
            return count ? layers[count - 1] : null;
        },
         /**
        *@public        
        *@method
        *@description 最后一个叶弹出层
        *@memberof myui.LayerManager
        *@return {Layer} 存在返回最后一个叶弹出层，否则返回null
        */
        lastLeaf: function () {
            var layers = this._leafs;
            var count = layers.length;
            return count ? layers[count - 1] : null;
        },
        /**
        *@public        
        *@method
        *@description 弹出层的总数
        *@memberof myui.LayerManager
        *@return {int} 弹出层的个数
        */
        count: function () {
            var layers = this._layers;
            return layers.length;
        },
        /**
        *@public        
        *@method
        *@description 只打开第一个弹出层
        *@memberof myui.LayerManager
        */
        unique: function () {
            var layers = this._layers;
            for (var i = layers.length - 1; i > 0; i--) {
                var l = layers[i];
                l.unblock();
            };
        },
        /**
        *@public        
        *@method
        *@description 只打开第一个根弹出层
        *@memberof myui.LayerManager
        */
        uniqueRoot: function () {
            var layers = this._roots;
            for (var i = layers.length - 1; i > 0; i--) {
                var l = layers[i];
                l.unblock();
            };
        },
        /**
        *@public        
        *@method
        *@description 只打开第一个叶弹出层
        *@memberof myui.LayerManager
        */
        uniqueLeaf: function () {
            var layers = this._leafs;
            for (var i = layers.length - 1; i > 0; i--) {
                var l = layers[i];
                l.unblock();
            };
        },
        /**
        *@public        
        *@method
        *@description 判断存在弹出层
        *@memberof myui.LayerManager
        *@return {boolean} 存在返回true,不存在返回false
        */
        find: function (layer) {
            var layers = this._layers;
            for (var i = layers.length - 1; i >= 0; i--) {
                if (layers[i] === layer) {
                    return true;
                }
            };
            return false;
        },
        /**
        *@public        
        *@method
        *@description 弹出所有弹出层
        *@memberof myui.LayerManager
        */
        blockAll: function () {
            var layers = this._layers;
            var count = layers.length;
            for (var i = 0; i < count; i++) {
                var l = layers[i];
                l.block();
            };
        },
        /**
        *@public        
        *@method
        *@description 收起所有弹出层
        *@memberof myui.LayerManager
        */
        unblockAll: function () {
            var layers = this._layers;
            for (var i = layers.length - 1; i >= 0; i--) {
                var l = layers[i];
                l.unblock();
            };
        },
        events: {
            oncreate: function (layer) {
                if (!layer || Layer.manager.find(layer)) {
                    return;
                }
                Layer.manager._add(layer);
            },
            ondestroy: function (layer) {
                Layer.manager._remove(layer);
            }
        }
    }
    /**
    *@memberof myui.Layer
    *@readonly
    *@description 全局弹出层管理类
    *@see myui.LayerManager
    */
    Layer.manager = LayerManager;
    Layer.prototype = {
        /**
        *@public
        *@instance
        *@memberof myui.Layer
        *@method
        *@description 获取弹出层jquery对象
        *@return {object} 弹出层jquery对象
        */
        layer: function () {
            return $(libs.Utils.strFormat("#Layer_{0}",this.id));
        },
        /**
        *@public
        *@instance
        *@memberof myui.Layer
        *@method
        *@description 获取弹出层内容Jquery对象
        *@return {object} 弹出层内容Jquery对象
        */
        content: function () {
            return $(libs.Utils.strFormat("#Layer_content_{0}",this.id));
        },
        _build: function () {
            var opts = this.options;
            var content = [];
            var $parent = $(this.parent);
            content.push(libs.Utils.strFormat('<div id="Layer_{0}" class="layer ',this.id));
            if ($parent && $parent.fisrt == document.body) {
                content.push('root-layer');
            }
            else {
                content.push('child-layer');
            }
            content.push('" style="');
            var l_style = opts.layerCss;
            if (l_style) {
                content.push(l_style);
            }
            content.push(libs.Utils.strFormat(';z-index:{0};">',opts.zIndex));
            content.push('</div>');
            content.push(libs.Utils.strFormat('<div id="Layer_content_{0}" class="layer-content ',this.id));
            if (opts.fixed) {
                content.push('layer-content-fixed');
            }
            else {
                content.push('layer-content-abosulte');
            }
            content.push('" style="');
            var c_style = opts.contentCss;
            if (c_style) {
                content.push(c_style);
            }
            content.push(libs.Utils.strFormat(';z-index:{0};">',opts.zIndex + 1));
            var text = this._build_content(opts);
            content.push(text);
            content.push('</div>');
            return content.join('');
        },
        _build_content: function (options) {
            var opts = options || {};
            var text = '';
            if (opts.html) {
                text = opts.html;
            }
            else if (opts.dom && opts.target === 'child') {
                text = $(opts.dom).html();
            }
            return text;
        },
        show: function () {
            this.layer().show();
            this.content().show();
            return this;
        },
        hide: function () {
            this.layer().hide();
            this.content().hide();
            return this;
        },
        /**
        *@public
        *@instance
        *@memberof myui.Layer
        *@method
        *@description 弹出弹出层
        */
        block: function () {
            if (this.state == layerState.unblock) {
                this.state = layerState.block;
                this.show();
                return this;
            }
            if (this.state == layerState.block) {
                return this;
            }
            var $parent = $(this.parent);
            if ($parent.get(0) != document.body) {
                var position = $parent.css('position');
                if (position != 'absolute' && position != 'relative') {
                    $parent.css('position', 'relative');
                }
            }
            $parent.append(this._build());
            var opts = this.options;
            if (opts.target === 'self') {
                this.content().append($(opts.dom).detach());
            }
            if ($.browser && $.browser.msie) {
                this.layer().height(parent.height());
                this.content().height(parent.height());
                if (opts.fixed)
                    this._fixed();
            }
            this.state = layerState.block;
            Layer.manager.events.oncreate(this);
            return this;
        },
        /**
        *@public
        *@instance
        *@memberof myui.Layer
        *@method
        *@description 收起弹出层
        */
        unblock: function () {
            this.state = layerState.unblock;
            this.hide();
            return this;
        },
        /**
        *@public
        *@instance
        *@memberof myui.Layer
        *@method
        *@description 关闭弹出层
        */
        close: function () {
            if (this.state = layerState.block) {
                this.unblock();
            }
            this.state = layerState.close;
            $(libs.Utils.strFormat('#Layer_{0}',this.id)).remove();
            $(libs.Utils.strFormat('#Layer_content_{0}',this.id)).remove();
            var $parent = $(this.parent);
            if ($parent.length > 0) {
                $parent.data('Layer', null);
            }
            Layer.manager.events.ondestroy(this);
            return this;
        },
        attr: function (value) {
            value = value || {};
            var opts = value || {};
            opts = $.extend(this.options, opts);
            if (opts.fixed) {
                this.content().addClass('layer-content-fixed').removeClass('layer-content-abosulte');
            }
            else {
                this.content().addClass('layer-content-abosulte').removeClass('layer-content-fixed');
            }
            if (value.html || value.dom || value.contentCss || value.layerCss) {
                this.content().html(this._build_content(value));
                return;
            }
            return this;
        },
        refresh: function (options) {
            var opts = options || {};
            opts = $.extend(this.options, opts);
            this.content().html(this._build());
        }
    }
    libs.Layer = Layer;
})(myui,jQuery);