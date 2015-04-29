var myui = (function(){ 
    var libs = libs || {};

    //工具
    (function() {
        var Utils = {
            uniqueid:1
        };
        Utils.unique = function(){
            return ++Utils.uniqueid;
        };        
        Utils.strFormat = function() {
            if (arguments.length == 0)
                return null;
            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        };
        Utils.strTrim = function(){
            if (arguments.length == 0)
                return null;
            var str = arguments[0];
            return str.replace(/(^\s*)|(\s*$)/g,"");
        };
        Utils.trigger = function(event,params){
            return this.events[event] && this.events.apply(this,params);
        };
        Utils.extend = function(obj){
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index];
                for (key in source){
                    if(source.hasOwnProperty(key)) {
                        obj[key] = source[key];
                    }                  
                }
            }
            return obj;
        };
        Utils.randIntRange = function (begin,end){
            return Math.ceil(Math.random() * (end - begin)) + begin;
        };
        Utils.randInt = function (max){
            return Math.ceil(Math.random() * max);
        };
        Utils.arrayContains = function(array,data){
            for (var i = 0; i < array.length; i++) {
                if(array[i] == data)
                {
                    return true;
                }
            };
            return false;
        };
        Utils.arrayIndexOf = function(array,data){
            for (var i = 0; i < array.length; i++) {
                if(array[i] == data)
                {
                    return i;
                }
            };
            return -1;
        };
        Utils.arrayFind = function(array,predicate){
            for (var i = 0; i < array.length; i++) {
                var data = array[i];
                if(predicate && predicate(data))
                {
                    return data;
                }
            };
            return null;
        };
        Utils.arrayRemove = function(array,data,predicate){
            var find = -1;            
            if(predicate)
            {
                for (var i = 0; i < array.length; i++) {
                    if(predicate && predicate(array[i],data))
                    {
                        find = i;
                    }
                };
            }
            else
            {
                for (var i = 0; i < array.length; i++) {
                    if(array[i] == data)
                    {
                        find = i;
                    }
                }
            }            
            if(find >= 0){
                array.splice(find,1);
            }
        };
        libs.Utils = Utils;
    })();
    //类
    (function(){
        libs.Class = {};
        //类
        libs.Class.define = function(methods){
            var klass = function(){
                this.__constructor && this.__constructor.apply(this,arguments);
            };
            methods && libs.Utils.extend(klass.prototype, methods);     
            klass.__super = Object.prototype;                   
            klass.prototype.__super = function(){};
            klass.__constructor = klass.prototype.__constructor;
            return klass;
        };
        //继承
        libs.Class.extend = function (superClass,methods) {          
            var klass = function() {
                this.__constructor && this.__constructor.apply(this,arguments);
            };
            klass.prototype = new superClass();
            klass.prototype.prototype = superClass.prototype;
            klass.prototype.prototype.constructor = superClass;
            methods && libs.Utils.extend(klass.prototype, methods); 
            if (superClass.prototype.constructor == Object.prototype.constructor) {
                superClass.prototype.constructor = superClass;
            }
            klass.__super = superClass.prototype;
            klass.prototype.__super = function(){
                if(this.__constructor__cursor == Object.prototype){
                    this.__constructor__cursor = null;
                    return;
                }
                if(this.__constructor__cursor == null) { this.__constructor__cursor = this.prototype; }
                var cursor = this.__constructor__cursor;
                this.__constructor__cursor = this.__constructor__cursor.prototype;
                cursor.__constructor.apply(this,arguments);                
            }
            klass.prototype.__supermethod = function(){
                if(this.__super__cursor == Object.prototype){
                    this.__super__cursor = null;
                    return;
                }
                if(this.__super__cursor == null) { this.__super__cursor = this.prototype; }
                var cursor = this.__super__cursor;
                this.__super__cursor = this.__super__cursor.prototype;                
                return cursor;   
            }
            return klass;
        };
    })();

    //集合
    (function(){
        //哈希
        function Hashtable() {
            this._datas = {};
            this._count = 0;
        }
        Hashtable.prototype = {
            set: function(key, value) {
                if (!this._datas.hasOwnProperty(key)) {
                    this._count++;
                }
                this._datas[key] = value;
            },
            add: function(key, value) {
                if (this._datas.hasOwnProperty(key)) return false;
                else {
                    this._datas[key] = value;
                    this._count++;
                    return true;
                }
            },
            remove: function(key) {
                delete this._datas[key];
                this._count--;
            },
            contains: function(key) {
                return this.containsKey(key);
            },
            containsKey: function(key) {
                return this._datas.hasOwnProperty(key);
            },
            containsValue: function(value,predicate) {
                if(predicate)
                {
                    for (var prop in this._datas) {
                        if (predicate && predicate(this._datas[prop] , value)) {
                            return true;
                        }
                    }    
                    return false;
                }
                for (var prop in this._datas) {
                    if (this._datas[prop] === value) {
                        return true;
                    }
                }
                return false;
            },
            keys: function() {
                var keys = [];
                for (var prop in this._datas) {
                    keys.push(prop);
                }
                return keys;
            },
            values: function() {
                var values = [];
                for (var prop in this._datas) {
                    values.push(this._datas[prop]);
                }
                return values;
            },
            count: function() {
                return this._count;
            },
            item: function(key) {
                if (this.contains(key))
                    return this._datas[key];
                else
                    return undefined;
            },
            key: function(value,predicate) {
                if(predicate)
                {
                    for (var prop in this._datas) {
                        if (predicate && predicate(this._datas[prop] , value)) {
                            return prop;
                        }
                    }    
                    return undefined;
                }
                for (var prop in this._datas) {
                    if (this._datas[prop] === value) {
                        return prop;
                    }
                }
                return undefined;
            },
            clear: function() {
                delete this._datas;
                this._datas = {};
                this._count = 0;
            },
            toString: function() {
                return JSON.stringify(this._datas);
            }
        };
        function List(){
            this._datas = [];
        }
        List.prototype = {
            set: function(key, value) {
                this._datas[key] = value;
            },
            add: function(value) {
                this._datas[this._datas.length] = value;
            },
            remove: function(key) {
                this._datas.splice(key,1);
            },
            find:function(predicate){
                if(typeof predicate === 'function')
                {
                    var count = this._datas.length;
                    for (var i = 0; i < count; i++) {
                        var data = this._datas[i];
                        if (predicate && predicate(data)) {
                            return data;
                        }
                    };
                    return null;                 
                }
                return this._datas[predicate];
            },
            indexOf: function(value,predicate){
                if(predicate)
                {
                    var count = this._datas.length;
                    for (var i = 0; i < count; i++) {
                        if (predicate && predicate(this._datas[i] , value)) {
                            return i;
                        }
                    };                   
                    return -1;
                }
                for (var i = 0; i < count; i++) {
                    if (this._datas[i] === value) {
                        return i;
                    }
                }
                return -1;
            },
            contains: function(value,predicate) {
                if(predicate)
                {
                    var count = this._datas.length;
                    for (var i = 0; i < count; i++) {
                        if (predicate && predicate(this._datas[prop] , value)) {
                            return true;
                        }
                    };                   
                    return false;
                }
                for (var i = 0; i < count; i++) {
                    if (this._datas[prop] === value) {
                        return true;
                    }
                }
                return false;
            },
            count: function() {
                return this._datas.length;
            },           
            clear: function() {
                this._datas = [];
            },
            toString: function() {
                return JSON.stringify(this._datas);
            }
        };

        libs.Collections = libs.Collections || {};
        libs.Collections.Hashtable = Hashtable;
        libs.Collections.List = List;
    })();

    //流程
    libs.Flow = libs.Class.define({
        __constructor:function(actions){
            this.actions = actions || [];
            this.flows = [];
        },
        __trigger : function(index) {
            if(this.flows.length <= index) return;
            var flow = this.flows[index];
            flow && flow();
        },
        async:function(){
            var that = this;
            for (var i = 0; i < this.actions.length; i++) {
                var action = this.actions[i];
                (function(cur,next) {
                    cur && that.flows.push(
                        function(){
                            cur(function(err,result){
                                if(err){ return; }
                                that.__trigger(next);
                            });
                        }
                    );
                })(action,i + 1)
            };
            this.flows.length > 0 && that.__trigger(0);
        },
        sync:function(){
            for (var i = 0; i < this.actions.length; i++) {
                this.actions[i] && this.actions[i]();
            };
        },
        push:function(act){
            if(!act) return;
            this.actions.push(act);
        }
    });

    libs.ActionRecord = libs.Class.define({
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

    //坐标计算类
    (function(){
        libs.Measurement = {
            getOffset:function(element){
                var left = 0;
                var top = 0;
                var obj = element;
                while(obj != document.body && obj != null)
                {
                    left += obj.offsetLeft;
                    top += obj.offsetTop;
                    obj = obj.offsetParent;
                }
                return { "left":left,"top":top };
            },
            scrollTop:function(){
                return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            },
            scrollLeft:function(){
                return document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
            },   
            //width+padding
            clientWidth:function(element){
                if(element == undefined)
                {
                    return document.documentElement.clientWidth || document.body.offsetWidth;
                }
                return element.clientWidth;
            },
            //height+padding
            clientHeight:function(element){
                if(element == undefined)
                {
                    return document.documentElement.clientHeight || document.body.offsetHeight;
                }
                return element.clientHeight;
            },
            //width+padding+border
            offsetWidth:function(element){
                if(element == undefined)
                {
                    return document.documentElement.offsetWidth || document.body.offsetWidth;
                }
                return element.offsetWidth;
            },
            //height+padding+border
            offsetHeight:function(element){
                if(element == undefined)
                {
                    return document.documentElement.offsetHeight || document.body.offsetHeight;
                }
                return element.offsetHeight;
            },
            scrollWidth:function(element){
                if(element == undefined)
                {
                    return document.documentElement.scrollWidth || document.body.scrollWidth;
                }
                return element.scrollWidth;
            },
            scrollHeight:function(element){
                if(element == undefined)
                {
                    return document.documentElement.scrollHeight || document.body.scrollHeight;
                }
                return element.scrollHeight;
            }
        }        
    })();

    //固定分页
    libs.DataPager = (function () {
        function Pager(options){
            this.pageIndex = options.pageIndex || 1;
            this.pageSize = options.pageSize || 10;
            this.totalSize = options.totalSize || 0;
            this.datas = options.datas || [];
            this.options = options;
        }
        Pager.prototype = {
            setCurPage:function(pageIndex,pageSize,totalSize){
                this.pageIndex = pageIndex != null ? ~~pageIndex || 1 : this.pageIndex;
                this.pageSize = pageSize != null ? ~~pageSize || 1 : this.pageSize;
                this.totalSize = totalSize;
            },
            getPageTotal:function(){
                var totalPage = ~~(this.totalSize / this.pageSize) + (this.totalSize % this.pageSize == 0 ? 0 : 1);
                totalPage = totalPage > 0 ? totalPage : 1;
                return totalPage;
            },
            getData:function (datas,action) {
                if(datas && datas.length > 0){
                    return Pager.page(datas,this.pageIndex,this.pageSize,action);    
                }
                return Pager.page(this.datas,this.pageIndex,this.pageSize,action);
            }
        }
        Pager.page = function(datas,pageindex,pagesize,action){
            var begin = (pageindex - 1) * pagesize;            
            var total = datas.length;
            var end = begin + pagesize;
            begin = begin > 0 ? begin : 0;
            end =  total > end ? end : total;
            var result = [];
            for (; begin < end; begin++) {
                var data = datas[begin];
                result.push(data);
                action && action(begin,data);
            };
            return result;
        }
        return Pager;
    })();
    //滑动分页
    libs.DataScroller = (function(){
        function Scroller(options){
            this.rowIndex = options.rowIndex || 0;
            //用于表示页面最大容纳个数
            this.pageSize = options.pageSize || 10;     
            //用于显示个数
            this.displaySize = options.displaySize || options.pageSize || 10;       
            this.totalSize = options.totalSize || 0;
            this.datas = options.datas || [];
            this.options = options;
        }
        Scroller.prototype = {
            setCurPos:function(rowIndex,displaySize,totalSize){                
                this.rowIndex = rowIndex != null ? rowIndex || 0 : this.rowIndex;                
                this.displaySize = displaySize != null ? displaySize || 10 : this.displaySize;
                this.totalSize = totalSize || 0;
            },
            getData:function (datas,act) {
                if(datas && datas.length > 0){
                    return Scroller.scroll(datas,this.rowIndex,this.displaySize,act);    
                }
                return Scroller.scroll(this.datas,this.rowIndex,this.displaySize,act);
            }
        }
        Scroller.scroll = function(datas,rowIndex,displaySize,act){
            var begin = rowIndex;
            var total = datas.length;
            var end = begin + displaySize;
            begin = begin > 0 ? begin : 0;
            end =  total > end ? end : total;
            var result = [];
            for (; begin < end; begin++) {
                var data = datas[begin];
                result.push(data);
                act && act(begin,data);
            };
            return result;
        }
        return Scroller;
    })();    
    return libs;
})();
