/** @namespace */
var myui = (function(libs,$){
    var libs = libs || {};
    var Utils = libs.Utils;
    libs.ScrollerWatcher = (function(){        
        /**
        * @description 滑动视图
        * @constructor myui.ScrollerWatcher
        */
        function Watcher(options){
            this.id = libs.Utils.unique();
            this.scroller = new libs.DataScroller({ displaySize:options.displaySize || 1,pageSize:options.pageSize || 1,rowIndex:options.rowIndex || 0});
            this.rowHeight = options.rowHeight || 20;
            this.adapter = null;
            this.options = options;
            this.$container = null;
        }

        Watcher.prototype = {
            events:{
                onbeforescroll:null,
                onafterscroll:null
            },
            /**
            *@public
            *@instance
            *@memberof myui.ScrollerWatcher
            *@method
            *@description 附加到数据适配器上，生成观察者视图
            *@param adapter {object} - 数据适配器
            */
            attach:function (adapter) {
                var that = this;
                var ctrl = []; 
                ctrl.push('<div id="watcher_' + this.id + '" class="scroller-container-wrap" style="width:100%;position:relative;">')           
                ctrl.push('<div class="scroller-container" style="overflow-x:hidden;overflow-y:scroll;position:absolute;right:0px;top:0px;z-index:1;height:100%;">');
                ctrl.push('<div class="scroller-content" style="height:0px">');
                ctrl.push('</div>');
                ctrl.push('</div>');
                ctrl.push('<div class="scroller-real" style="overflow-y:hidden;overflow-x:auto;"></div>')
                ctrl.push('</div>');
                var $wrap = $(ctrl.join(''));
                this.$container = adapter.container;
                adapter.container.empty();
                adapter.container.append($wrap);
                adapter.container = $wrap.find('.scroller-real');
                this.adapter = adapter;
                this.bindEvents();
            },
            /**
            *@public
            *@instance
            *@memberof myui.ScrollerWatcher
            *@method
            *@description 从数据适配器上分离
            */
            detach:function(){
                this.adapter.container = this.$container;
                this.adapter.container.empty();
                this.adapter = null;
            },
            bindEvents:function () {
                var that = this;
                var $dom = $('#watcher_'+this.id);
                $('.scroller-container',$dom).scroll(function(){
                    that.events.onbeforescroll && that.events.onbeforescroll.apply(that,[that.scroller]);
                    that.scroller.setCurPos(~~($(this).scrollTop() / that.rowHeight),that.scroller.displaySize,that.adapter.datas.length);                
                    that.adapter.refresh();
                    that.events.onafterscroll && that.events.onafterscroll.apply(that,[that.scroller]);
                });
                $dom.on('mousewheel',function (event) {
                    var top = $('.scroller-container', $dom).scrollTop();
                    $('.scroller-container', $dom).scrollTop(top + event.originalEvent.deltaY);
                    event.preventDefault();
                    event.stopPropagation();
                });                
                $dom.on('mousedrag',function(event){
                    event.preventDefault();
                })
            },
            unBindEvents:function () {
                var $dom = $('#watcher_'+this.id);
                $('.scroller-container',$dom).off('scroll');
                $dom.off('mousewheel');
            },
            watchData:function (datas) {
                var $dom = $('#watcher_'+this.id);
                $('.scroller-container',$dom).height($dom.parent().height());
                $('.scroller-real',$dom).height($dom.parent().height());
                var pagesize = ~~($('.scroller-container .scroller-content',$dom).parent().height() / this.rowHeight);
                //if(pagesize < this.scroller.pageSize){throw new Error('scroller pagesize 设置过大');}
                $('.scroller-container .scroller-content',$dom).height((datas.length + pagesize - this.scroller.pageSize) * this.rowHeight);
                return this.scroller.getData(datas,function (i,data) {
                    data.rowid = i + 1;
                });
            }
        }
        return Watcher;
    })();
    libs.PagerWatcher = (function(){
        var default_events = {
            onpagechanged:function(){
                this.adapter && this.adapter.refresh();
            }
        }
        /**
        * @description 分页视图
        * @constructor myui.PagerWatcher
        */
        function Watcher(options) {     
            this.id = libs.Utils.unique();
            this.datapager = new libs.DataPager({ pageIndex:options.pageIndex,pageSize:options.pageSize });
            this.adapter = null;
            this.options = options;
            this.$container = null;
            this.mode = options.url ? 'remote' : 'local';
            this.events = libs.Utils.extend({},default_events,options.events);
        }

        Watcher.prototype = {
            events:{
                /**
                *@description 页序号发生改变后触发
                *@event myui.PagerWatcher#onpagechanged
                */
                onpagechanged:null
            },
            /**
            *@public
            *@instance
            *@memberof myui.PagerWatcher
            *@method
            *@description 附加到数据适配器上，生成观察者视图
            *@param adapter {object} - 数据适配器
            */
            attach:function(adapter){
                this.adapter = adapter;
                var that = this;
                var ctrl = []; 
                ctrl.push('<div id="watcher_' + this.id + '" class="pager-container-wrap" style="width:100%;">');
                ctrl.push('<div class="datapager-real" style="overflow-x:auto;"></div>')
                ctrl.push('<div class="datapager-container"><ul class="datapager">');
                ctrl.push('<li class="datapager-first"><a href="#" aria-label="First"><span aria-hidden="true">首页</span></a></li>');
                ctrl.push('<li class="datapager-prev"><a href="#" aria-label="Prev"><span aria-hidden="true">上一页</span></a></li>');
                ctrl.push('<li class="datapager-cur"><a href="#"><input type="text"/>&#160;<span class="datapager-text">共1页</span></a></li>');
                ctrl.push('<li class="datapager-next"><a href="#" aria-label="Next"><span aria-hidden="true">下一页</span></a></li>');
                ctrl.push('<li class="datapager-last"><a href="#" aria-label="Last"><span aria-hidden="true">末页</span></a></li>');
                ctrl.push('</ul></div>');
                ctrl.push('</div>');
                var $parent = adapter.container.parent();
                var $wrap = $(ctrl.join(''));
                this.$container = adapter.container;
                //this.adapter.empty();
                adapter.container.empty();
                adapter.container.append($wrap);
                adapter.container = $wrap.find('.datapager-real');
                this.adapter = adapter;   
                this.bindEvents();
            },
            /**
            *@public
            *@instance
            *@memberof myui.PagerWatcher
            *@method
            *@description 从数据适配器上分离
            */
            detach:function(){
                this.adapter.container = this.$container;
                this.adapter.container.empty();
                this.adapter = null;
            },
            bindEvents:function () {
                var that = this;
                var $dom = $('#watcher_'+this.id);
                $('.datapager-first',$dom).off('click').on('click',function(){                    
                    var totalPage = that.datapager.getPageTotal();
                    $('.datapager-cur input',$dom).val(1);
                    $('.datapager-text').html('共' + (totalPage) + '页');
                    that.datapager.setCurPage(1,that.datapager.pageSize,that.adapter.datas.length);                            
                    that.events.onpagechanged && that.events.onpagechanged.apply(that);
                });
                $('.datapager-prev',$dom).off('click').on('click',function(){
                    var totalPage = that.datapager.getPageTotal();
                    var prev = that.datapager.pageIndex;
                    prev = prev  > 1 ? prev - 1 : 1;
                    $('.datapager-cur input',$dom).val(prev);
                    $('.datapager-text').html('共' + (totalPage) + '页');
                    that.datapager.setCurPage(prev,that.datapager.pageSize,that.adapter.datas.length);                
                    that.events.onpagechanged && that.events.onpagechanged.apply(that);
                });
                $('.datapager-cur input',$dom).off('keydown').on('keydown',function(){
                    if (event.keyCode == 13) {
                        var totalPage = that.datapager.getPageTotal();
                        var page = ~~$(this).val() || 1;
                        page = page < 1 ? 1 : page;
                        page = page  > totalPage ? totalPage : page;
                        $('.datapager-text').html('共' + (totalPage) + '页');
                        that.datapager.setCurPage(page,that.datapager.pageSize,that.adapter.datas.length);                
                        that.events.onpagechanged && that.events.onpagechanged.apply(that);
                    }
                });
                $('.datapager-next',$dom).off('click').on('click',function(){
                    var totalPage = that.datapager.getPageTotal();
                    var next = that.datapager.pageIndex;
                    next = next < totalPage ? next + 1 : totalPage ;
                    $('.datapager-cur input',$dom).val(next);
                    $('.datapager-text').html('共' + (totalPage) + '页');
                    that.datapager.setCurPage(next,that.datapager.pageSize,that.adapter.datas.length);                
                    that.events.onpagechanged && that.events.onpagechanged.apply(that);
                });
                $('.datapager-last',$dom).off('click').on('click',function(){
                    var totalPage = that.datapager.getPageTotal();
                    $('.datapager-cur input',$dom).val(totalPage);
                    $('.datapager-text').html('共' + (totalPage) + '页');
                    that.datapager.setCurPage(totalPage,that.datapager.pageSize,that.adapter.datas.length);                
                    that.events.onpagechanged && that.events.onpagechanged.apply(that);
                });
            },
            unBindEvents:function () {
                var $dom = $('#watcher_'+this.id);
                $('.datapager-first',$dom).off('click');
                $('.datapager-prev',$dom).off('click');
                $('.datapager-cur input',$dom).off('keydown');
                $('.datapager-next',$dom).off('click');
                $('.datapager-last',$dom).off('click');
            },
            watchData:function(datas){
                var that = this;
                if(that.mode == 'local')
                {
                    that.datapager.setCurPage(null,null,that.adapter.datas.length);                    
                    var totalPage = that.datapager.getPageTotal();
                    $('.datapager-text').html('共' + (totalPage) + '页');
                    $('.datapager-cur input').val(that.datapager.pageIndex);
                    return this.datapager.getData(datas,function (i,data) {
                        data.rowid = i + 1;
                    });
                }
                var totalPage = that.datapager.getPageTotal();
                $('.datapager-text').html('共' + (totalPage) + '页');
                $('.datapager-cur input').val(that.datapager.pageIndex);
                for (var i = 0; i < datas.length; i++) {
                    datas[i].rowid = (that.datapager.pageIndex - 1) * that.datapager.pageSize + i + 1;
                };
                return datas;
            }
        };
        return Watcher;
    })();
    libs.DatatableView = (function(){
        var default_events = {}
        function View(options) {
            this.id = libs.Utils.unique(); 
            this.name = options.name || 'DatatableView';
            this.manager = null;
            this.select = null;  
            this.selects = [];
            this.resizeModel = {};   
            this.options = options;
            this.events = libs.Utils.extend({},default_events,options.events);
        }    

        View.prototype = {
            //初始化
            initialize: function(adapter){
                this.adapter = adapter;
                sortFields = [];
                var options = this.options;
                var columns = options.columns;
                var count = columns.length;
                for (var i = 0; i < count; i++) {
                    var column = options.columns[i];
                    if(column.sortable) {
                        if(!column.name) continue;
                        sortFields.push({
                            name:column.name,
                            type:column.sorttype || 'string',
                            level:column.sortlevel || 1,
                            order:column.sortorder || 'asc',
                            enable:column.sortenable || (options.defaultsort ? column.name == options.defaultsort : false),
                        });
                    }
                }
                this.adapter.sortFields = sortFields;        
            },
            //视图domid
            viewId:function(data,viewIndex){
                return libs.Utils.strFormat('{0}_{1}', this.adapter.modelName, viewIndex);
            },
            //渲染头部
            renderHead: function () { 
                var options = this.options;
                var columns = options.columns;
                var count = columns.length;
                var containerWidth = this.adapter.container.width();
                var colWidth = 0;
                var head = [];
                if(this.options.rowid)
                {
                    head.push(libs.Utils.strFormat('<th style="width:{0};">&nbsp;</th>',this.options.rowidwidth || '40px'));
                    colWidth += parseInt(this.options.rowidwidth) || 40;
                }
                for (var i = 0; i < count; i++) {
                    var column = options.columns[i];
                    if(column.width && column.width.toString().indexOf('%') > 0)
                    {
                        var result = parseInt(column.width.toString().substr(0,column.width.length - 1)) / 100 * containerWidth;
                        colWidth += result;
                        column.rwidth = result;
                    }
                    else if(column.width && column.width.toString().indexOf('px') > 0)
                    {
                        column.rwidth = ~~column.width.substr(0,column.width.length - 2);
                        colWidth += parseInt(column.rwidth);
                    }
                    else
                    {
                        var result = column.width ? column.width : parseInt((containerWidth - (parseInt(this.options.rowidwidth) || 40)) / count);
                        column.rwidth = result,
                        colWidth += parseInt(result);
                    }
                    head.push(libs.Utils.strFormat('<th style="width:{0};" class="{4}" data-sortname="{5}">{1}{2}{3}</th>',
                        column.rwidth + 'px',
                        column.headText,
                        column.sortable ? (this.adapter.getSortField(column.name).enable) ?  (this.adapter.getSortField(column.name).order == 'asc' ? '<span class="sort-caret asc" />': '<span class="sort-caret desc" />'): '<span class="sort-caret asc disabled" />' : '',
                        column.resizable?'<span class="split" data-splitname="' + column.name + '">':'',
                        column.sortable?'sortable':'',
                        column.name
                        )
                    );
                };
                
                head.push('<th class="fix-column" ' + (this.resizeModel.fixColWidth != null ? 'style="width:' + this.resizeModel.fixColWidth + 'px"':'') + '></th>');
                
                head.push('</tr></thead><tbody>');
                var tableWidth = colWidth;
                this.resizeModel.tableWidth && (tableWidth = (tableWidth >= this.resizeModel.tableWidth) ? tableWidth : this.resizeModel.tableWidth);
                tableWidth = tableWidth >= containerWidth ? tableWidth : containerWidth;
                head = ['<div class="grid-container" style="overflow:hidden;width:',tableWidth,'px;height:100%;"><div class="col-split"></div><table id="',this.name,this.id,'" class="grid myui-grid grid-resizeable ',options.tableCss?options.tableCss:'','" style="width:'+tableWidth + 'px' ,'"><thead><tr>'].concat(head);
                return head.join('');
             },
            //渲染主题部分
            renderBody: function (data,viewIndex) {
                if(!data) { return ''};
                var highlight = (this.select == data[this.adapter.modelKey] || libs.Utils.arrayContains(data[this.adapter.modelKey])) ? 'highlight':'';
                var body = ['<tr style="height:20px;text-align:center;" class="',highlight,'" data-modelKey="',data[this.adapter.modelKey],'" id="',this.viewId(data,viewIndex),'">'];
                var options = this.options;
                var columns = options.columns;
                var count = columns.length;
                if(this.options.rowid)
                {
                    body.push(libs.Utils.strFormat('<td class="rowid">{0}</td>',data['rowid']));
                }
                for (var i = 0; i < count; i++) {
                    var column = options.columns[i];
                    if(column.format){
                        body.push(libs.Utils.strFormat('<td>{0}</td>',column.format(data[column.name],data,this)));
                    }
                    else
                    {
                        body.push(libs.Utils.strFormat('<td>{0}</td>',data[column.name]));
                    }
                }
                body.push('<td></td>');
                body.push('</tr>');
                
                return body.join('');
            },
            //渲染尾部
            renderFoot: function () {
                if(this.options.showfooter)
                {
                    var colspan = (this.options.columns.length + (this.options.rowid ? 2 : 1)) ;
                    return ['</tbody>','<tfoot><tr><td colspan="' + colspan + '">',libs.Utils.strFormat(this.options.footText || '总共{0}条数据',this.adapter.manager.count()),'</td></tr></tfoot>','</table>'].join('');
                }
                return ['</tbody>','</table></div>'].join('');
            },
            //渲染空
            renderEmpty:function(){
                var colspan = (this.options.columns.length + (this.options.rowid ? 2 : 1)) ;
                return ['<tr><td colspan="' + colspan + '">',this.options.emptyText || '','</td></tr>'].join('');
            },
            //刷新
            refresh: function (data,viewIndex) {
                $('#' + this.viewId(data,viewIndex)).html(JSON.stringify(data));
                this.bindEvents();
            },
            //获取选中的数据
            getSelectData:function(){
                if(this.select == null) return;
                return this.adapter.manager.findData(this.select);
            },
            //获取选中的数据
            getSelectDatas:function(){
                var result = [];
                var count = this.selects.length;
                for (var i = 0; i < count; i++) {
                    result.push(this.adapter.manager.findData(this.selects[i]));
                }
                return result;
            },
            selectKey: function (key) {
                this.select = key;
                this.events.onselectdata && this.events.onselectdata.apply(this, [key]);
            },
            //绑定view事件
            bindEvents: function(){
                var that = this;
                var $dom = $('#'+that.name + that.id);                       

                $('th',$dom).click(function(){
                    that.adapter.toggleSortField($(this).attr('data-sortname'),that.options.sortmode == 'single');                        
                    if(that.events.onsortchanged){
                        that.events.onsortchanged.apply(that);
                    }
                    else
                    {
                        that.adapter.sort();
                        that.adapter.refresh();
                    }
                });

                $('.sel-box', $dom).click(function (event) {
                    event.stopPropagation();
                    var $selbox = $(this);
                    var modelKey = $selbox.parents('tr').attr('data-modelKey');
                    var data = that.adapter.manager.findData(modelKey);
                    if(that.events.onselectable && !that.events.onselectable.apply(that,[data])){
                        $selbox.prop('checked', false);
                        return;
                    }
                    var check = $selbox.prop('checked');
                    if (that.options.selectmode == 'single') {
                        $('.sel-box', $dom).not($selbox).prop('checked', false);
                        if ($selbox.attr('type') == 'checkbox') {
                            if (check) {
                                that.selectKey(modelKey);
                            }
                            else {
                                that.selectKey(null);
                            }
                        }
                        else {
                            that.selectKey(modelKey);
                        }
                    }
                    else if (that.options.selectmode == 'multiple') {
                        if (check) {
                            that.selects.push(modelKey);
                        }
                        else {
                            libs.Utils.arrayRemove(that.selects, modelKey);
                        }
                        that.selectKey(modelKey);
                    }
                    else {
                        that.selectKey(null);
                        that.selects = [];
                        $selbox.prop('checked', false);
                        return false;
                    }
                    return true;
                })

                $('tbody tr', $dom).click(function () {
                    var modelKey = $(this).attr('data-modelKey');
                    var $selbox = $(this).find('.sel-box');
                    var data = that.adapter.manager.findData(modelKey);
                    if(that.events.onselectable && !that.events.onselectable.apply(that,[data])){
                        $selbox.prop('checked', false);
                        return;
                    }
                    var check = $selbox.prop('checked');
                    if (that.options.selectmode == 'single') {
                        $('.sel-box', $dom).not($selbox).prop('checked', false);
                        if ($selbox.attr('type') == 'checkbox') {
                            if (check) {
                                that.selectKey(null);
                                $selbox.parents('tr').removeClass('highlight');
                            }
                            else {
                                that.selectKey(modelKey);
                                $('tbody tr', $dom).not($selbox.parents('tr')).removeClass('highlight');
                                $selbox.parents('tr').addClass('highlight');
                            }
                            $selbox.prop('checked', !check);
                        }
                        else {
                            that.selectKey(modelKey);
                            $selbox.parents('tr').addClass('highlight');
                            $selbox.prop('checked', true);
                        }
                    }
                    else if (that.options.selectmode == 'multiple') {
                        if (check) {
                            libs.Utils.arrayRemove(that.selects, modelKey);
                            $selbox.parents('tr').removeClass('highlight');
                            that.selectKey(null);
                        }
                        else {
                            that.selects.push(modelKey);
                            $selbox.parents('tr').addClass('highlight');
                            that.selectKey(modelKey);
                        }
                        $selbox.prop('checked', !check);
                    }
                    else {
                        that.selectKey(null);
                        that.selects = [];
                        $selbox.parents('tr').removeClass('highlight');
                        $selbox.prop('checked', false);
                    }
                    var data = that.getSelectData();
                });

                $('th .split',$dom).mousedown(function(event) {
                    that.resizeModel.resizeing = true;
                    that.resizeModel.dragoffset = event.clientX;
                    that.resizeModel.target = $(this);
                });    
                var __calcWidth = function (event){
                    $dom.siblings('.col-split').hide();
                    that.resizeModel.resizeing = false;                        
                    var $this = $(this); 
                    var x = event.clientX - that.resizeModel.dragoffset;
                    that.resizeModel.dragoffset = event.clientX;                    
                    var colwidth = that.resizeModel.target.parent().outerWidth();
                    var containerwidth = that.adapter.container.outerWidth();                    
                    var result = colwidth + x;
                    var splitname = that.resizeModel.target.attr('data-splitname');
                    var column = libs.Utils.arrayFind(that.options.columns,function(left){
                        return left.name == splitname;
                    });
                    result = result <= 2 ? 2 :result;
                    column.width = result + 'px';
                    column.rwidth = result;
                    var columns = that.options.columns;
                    var tableWidth = 0;
                    for (var i = 0; i < columns.length; i++) {
                        tableWidth += columns[i].rwidth;
                    };
                    if(tableWidth <= containerwidth)
                    {
                        that.resizeModel.tableWidth = containerwidth;
                        that.resizeModel.fixColWidth = null;
                    }
                    else
                    {
                        that.resizeModel.tableWidth = tableWidth;
                        that.fixColWidth = 0;
                    }
                    that.adapter.refresh();
                };
                $dom.mouseup(function(event) {
                    if (!that.resizeModel.resizeing) { return; }
                    __calcWidth(event);
                })
                .mouseleave(function(event) {
                    if (!that.resizeModel.resizeing) { return; }
                    __calcWidth(event);
                })
                .mousemove(function(event) {
                    var $this = $(this);                        
                    if (!that.resizeModel.resizeing) { return; }
                    $dom.parent().css('position','relative');
                    var $split =$dom.siblings('.col-split');
                    $split.height($('th',$dom).outerHeight());
                    $split.css('left',event.clientX - that.adapter.container.parent().offset().left + that.adapter.container.scrollLeft()).show();
                });   
                this.events.onbindevents && this.events.onbindevents.apply(this);                
            },            
            unBindEvents:function(){
                var that = this;
                var $dom = $('#'+that.name + that.id);
                $('th',$dom).off('click');
                $('tr',$dom).off('click');
                $('.sel-box',$dom).off('click');
                $('th .split',$dom).off('mousedown');
                $dom.off('mouseup').off('mouseleave').off('mousemove');
                this.events.onunbindevents && this.events.onunbindevents.apply(this);
            },
            events: {
                onsortchanged:null,
                onbindevents:null,
                onunbindevents:null,
                onselectdata:null
            }
        };
        return View;
    })();
    libs.Grid = (function(){
        /**
        *@description 表格控件
        *@constructor myui.Grid
        *@example
        new myui.Grid({
            datas:datas,
            pagedata:true,
            container:$('.ui-container'),
            modelName:'data', 
            modelKey : 'key',
            displaySize:10,
            pageSize:5,
            pageIndex:1,
            rowHeight:38,
            footText:'共{0}条数据',
            rowid:true,
            rowidwidth:'50px',
            selectmode:'single',
            sortmode:'single',
            showfooter:false,   
            tableCss:' table-hover table-bordered table-demo',
            columns:[
                { 
                    headText:'',name:'',width:'30px',
                    format:function(value,data,view) {
                        return ['<input class="sel-box radio" type="checkbox" name="radio_',view.id,view.adapter.modelName,'" data-modelKey="',data[view.adapter.modelKey],'" ',(view.select == data[view.adapter.modelKey] ? 'checked="checked"':''),'/>'].join('');
                    }
                },
                { headText:'key',name:'key',resizable:true,sortable:true,sorttype:'number',sortlevel:3,sortenable:true,width:'20%'},
                { headText:'value',name:'value',resizable:true,width:'80%',sortable:true,sortlevel:1,sortenable:false,},
                { headText:'tag',name:'tag',resizable:true,width:'200px'},
            ]
        });
        */
        function Grid(options)
        {
            this.id = libs.Utils.unique();
            this.view = new libs.DatatableView(options);
            this.watcher = options.pagedata ? new libs.PagerWatcher(options) : new libs.ScrollerWatcher(options);        
            this.adapter = new libs.DataViewer.DefaultAdapter();
            this.manager = options.manager || new libs.DataViewer.DataManager(options);
            this.options = options;
            this.events = options.events || {};   
            this.manager && this.initialize(this.manager);
            this.resize();     
        }

        Grid.prototype = {
            events:{
                /**
                *@description 远程数据加载好触发
                *@event myui.Grid#onloadcomplete
                *@param {object} datas 加载完成的数据集
                */
                onloadcomplete:null,
                /**
                *@description 表格渲染后触发
                *@event myui.Grid#ongridcomplete
                */
                ongridcomplete:null,
                /**
                *@description 选中行触发
                *@event myui.Grid#onselectdata
                *@param {object} 数据的主键
                */
                onselectdata:null,
                /**
                *@description 选中行前触发，返回false表示不可以选中
                *@event myui.Grid#onselectable
                *@param {object} data 需要判断的数据
                */
                onselectable:null,
                /**
                *@description 滑动条滑动前触发
                *@event myui.Grid#onbeforescroll
                */
                onbeforescroll:null,
                /**
                *@description 滑动条滑动后触发
                *@event myui.Grid#onafterscroll
                */
                onafterscroll:null,
                /**
                *@description 页序号发生改变后触发
                *@event myui.Grid#onpagechanged
                */
                onpagechanged:null
            },
            /**
            *@private
            *@description 重新调整表格大小
            */
            resize:function () {
                var that = this;
                $(window).resize(function () {
                    that.adapter.refresh();
                });
            },
            /**
            *@public
            *@instance
            *@memberof myui.Grid
            *@method
            *@param {DataManager} manager 数据管理源
            *@description 附加到数据管理源
            */
            initialize:function(manager){
                var that = this;
                this.manager = manager;
                this.adapter.manager = manager;
                this.manager.adapter = this.adapter;
                this.adapter.initialize(this.options,manager,this.view,this.watcher);
                var options = this.options;
                if(options.url)
                {
                    if(options.pagedata)
                    {
                        that.watcher.events.onpagechanged = function(){
                            that.loadPageData.apply(that);
                        }
                        that.view.events.onsortchanged = function(){
                            that.loadPageData.apply(that);
                        }
                        that.loadPageData.apply(that);
                    }
                    else
                    {
                        that.view.events.onsortchanged = function(){
                            that.loadScrollData.apply(that);
                        }
                        that.loadScrollData.apply(that);
                    }
                }
                else if(options.datas)
                {
                    if(options.pagedata)
                    {
                        var datas = that.events.onloadcomplete && that.events.onloadcomplete.apply(that,[options.datas]) || options.datas;
                        that.manager.begin();
                        that.watcher.datapager.setCurPage(options.pageIndex,options.pageSize,datas.length);
                        that.manager.clear();
                        that.manager.appendDatas(datas);
                        that.manager.end();
                        that.events.ongridcomplete && that.events.ongridcomplete.apply(that);
                    }
                    else
                    {
                        var datas = that.events.onloadcomplete && that.events.onloadcomplete.apply(that,[options.datas]) || options.datas;
                        that.manager.begin();
                        that.watcher.scroller.setCurPos(null,null,datas.length);
                        that.manager.clear();
                        that.manager.appendDatas(datas);
                        that.manager.end();
                        that.events.ongridcomplete && that.events.ongridcomplete.apply(that);
                    }
                }                
            },
            /**
            *@public
            *@instance
            *@memberof myui.Grid
            *@method
            *@description 数据来源是远程就重新加载，是本地则重新刷新
            *@param {json} params 如果是远程数据来源，则向远程发起请求时附加的请求参数，如果是本地数据来源，可为null
            */
            reload:function(params){
                var options = this.options;
                options.data = params || options.data;
                if(options.url)
                {
                    if(options.pagedata)
                    {
                        that.watcher.events.onpagechanged = function(){
                            that.loadPageData.apply(that);
                        }
                        that.view.events.onsortchanged = function(){
                            that.loadPageData.apply(that);
                        }
                        that.loadPageData.apply(that);
                    }
                    else
                    {
                        that.view.events.onsortchanged = function(){
                            that.loadScrollData.apply(that);
                        }
                        that.loadScrollData.apply(that);
                    }
                }
                else
                {
                    this.adapter.refresh();
                }
            },
            /**
            *@private
            *@instance
            *@memberof myui.Grid
            *@method
            */
            loadPageData:function(){
                var that = this;
                var options = this.options;
                var params = options.data;
                params.pageIndex = that.watcher.datapager.pageIndex;
                params.pageSize = that.watcher.datapager.pageSize;
                params.sort = that.adapter.getSortFields();
                params = that.events.beforeSend && that.events.beforeSend.apply(this,[params]) || params;
                $.ajax({
                    url:options.url,
                    data:params,
                    dataType:options.dataType,
                    success:function(result){
                        result = that.events.onloadcomplete && that.events.onloadcomplete.apply(that,[result]) || result;
                        if(!result){ result = { pageIndex:1,pageSize:that.watcher.datapager.pageSize,totalSize:0 }; }
                        that.manager.begin();
                        that.watcher.datapager.setCurPage(result.pageIndex,result.pageSize,result.totalSize);
                        that.manager.clear();
                        that.manager.appendDatas(result.datas);
                        that.manager.end();
                        that.events.ongridcomplete && that.events.ongridcomplete.apply(that);
                    }}); 
            },
            /**
            *@private
            *@instance
            *@memberof myui.Grid
            *@method
            */
            loadScrollData:function(){
                var that = this;
                var options = this.options;
                var params = options.data;
                params.sort = that.adapter.getSortFields();
                params = that.events.beforeSend && that.events.beforeSend.apply(this,[params]) || params;           
                $.ajax({
                    url:options.url,
                    data:params,
                    dataType:options.dataType,
                    success:function(result){
                        result = that.events.onloadcomplete && that.events.onloadcomplete.apply(this,[result]) || result;                                
                        if(!result){ result = []; }
                        that.manager.begin();
                        that.watcher.scroller.setCurPos(null,null,result.length);
                        that.manager.clear();
                        that.manager.appendDatas(result);
                        that.manager.end();
                        that.events.ongridcomplete && that.events.ongridcomplete.apply(that);
                    }});
            },
            /**
            *@public
            *@instance
            *@memberof myui.Grid
            *@method
            *@description 获取选中的单条数据
            */
            getSelectData:function(){
                return this.view.getSelectData();
            },
            /**
            *@public
            *@instance
            *@memberof myui.Grid
            *@method
            *@description 获取选中的多条数据
            */
            getSelectDatas:function(){
                return this.view.getSelectDatas();
            }
        }
        return Grid;
    })();
    return libs;
})(myui,jQuery);
