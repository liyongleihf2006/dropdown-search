/**
 * Created by LiYonglei on 2017/5/19.
 * 输入查询下拉列表:通过输入获取下拉列表,选中下拉列表中的数据填充输入框
 *params:
 *   name:""查询框的name属性
 *   cls:"dropdown-search",该插件的class
 *   inputCls:"dropdown-search-input",插件中的输入框的class
 *   panelCls:"dropdown-search-panel",插件中下拉面板的class
 *   itemCls:"dropdown-search-item",下拉面板中每一项的class
 *   delay:300,每次输入间隔后进行查询的时间间隔,单位 ms
 *   triggerMinLength:3,可以触发查询的最小的输入框中字符串的长度
 *   formatter:function(data){},下拉面板中每一条元素的格式,返回值为最终生成的节点
 *                    data为每条原始数据
 *   emptyMsg:function($self){return "未查询到符合条件的数据"},未查询到数据时显示的格式,返回值为最终展示的节点
 *   onTrigger:function(value){},输入框输入后字符串满足条件后触发的事件,
 *                    value为输入框中的值
 *   onItemClick:function(data,input,container){}点击下拉框中每条数据触发的事件
 *                    data为每条原始数据
 *                    input为查询框
 *                    container生成插件的jquery元素
 * methods:
 *   setPanelData(data) 填充生成下拉面板的数据
 *                    data 是数组类型
 *   getData 获取当前选中的数据
 *
 */
(function ($) {
    if ($.fn.dropdownSearch) {
        return;
    }
    var setMethods = {
        setPanelData:setPanelData
    };
    var getMethods = {
        getData:getData
    };
    $.fn.dropdownSearch = function () {
        var args = arguments, params, method;
        if (!args.length || typeof args[0] == 'object') {
            return this.each(function (idx) {
                var $self = $(this);
                $self.data('dropdownSearch', $.extend(true, {}, $.fn.dropdownSearch.default, args[0]));
                params = $self.data('dropdownSearch');
                _init.call($self, params);
            });
        } else {
            if (!$(this).data('dropdownSearch')) {
                throw new Error('You has not init dropdownSearch!');
            }
            params = Array.prototype.slice.call(args, 1);
            if (setMethods.hasOwnProperty(args[0])) {
                method = setMethods[args[0]];
                return this.each(function (idx) {
                    var $self = $(this);
                    method.apply($self, params);
                    _render.call($self);
                });
            } else if (getMethods.hasOwnProperty(args[0])) {
                method = getMethods[args[0]];
                return method.apply(this, params);
            } else {
                throw new Error('There is no such method');
            }
        }
    };
    $.fn.dropdownSearch.default = {
        name:"",
        cls:"dropdown-search",
        inputCls:"dropdown-search-input",
        panelCls:"dropdown-search-panel",
        itemCls:"dropdown-search-item",
        delay:300,
        triggerMinLength:3,
        formatter:function(data){},
        emptyMsg:function($self){return "未查询到符合条件的数据"},
        onTrigger:function(value){},
        onItemClick:function(data,input,container){}
    };
    function _init(params) {
        var $self = this,
            params = $self.data("dropdownSearch"),
            name=params.name,
            delay=params.delay,
            triggerMinLength=params.triggerMinLength,
            onTrigger=params.onTrigger;
        $self.addClass(params.cls).
        html(
            [function(){
                var input=document.createElement("input");
                if(name){
                    input.name=name;
                }
                $(input).addClass(params.inputCls);
                input.value=params._value||"";
                input.addEventListener("input",function(){
                    var value=this.value.trim();
                    if(params._timeout){
                        clearTimeout(params._timeout);
                    }
                    params._panel.addClass("hidden");
                    if(value.length>=triggerMinLength){
                        params._timeout=setTimeout(function(){
                            params._value=value;
                            onTrigger.call($self,input.value);
                        },delay);
                    }
                });
                input.addEventListener("focus",function(){
                    var value=this.value.trim();
                    if(value.length>=triggerMinLength){
                        if(value===params._value){
                            params._panel.removeClass("hidden");
                        }else{
                            params._value=value;
                            onTrigger.call($self,input.value);
                        }
                    }
                });
                input.addEventListener("blur",function(){
                    params._panel.addClass("hidden");
                });
                params._input=input;
                return input;
            }(),
            function(){
                params._panel=$("<div/>",{
                    "class":function(){
                        return "hidden "+params.panelCls;
                    }
                }).append(
                    $("<ul/>")
                );
                return params._panel;
            }()]
        );
    }
    function setPanelData(datas){
        var $self = this,
            params = $self.data("dropdownSearch");
        params._datas=datas;
    }
    function getData(){
        var $self = this,
            params = $self.data("dropdownSearch");
        return params.currentData;
    }
    function _render( ) {
        var $self = this,
            params = $self.data("dropdownSearch"),
            _datas = params._datas||[],
            _panel = params._panel,
            _input = params._input,
            formatter = params.formatter,
            onItemClick = params.onItemClick,
            emptyMsg=params.emptyMsg;
        _panel.toggleClass("hidden",function(){
            return document.activeElement!==_input;
        }()).find("ul").html(
            function(){
                if(_datas.length){
                    return _datas.map(function(data){
                        return $("<li/>",{
                            "class":params.itemCls,
                            "mousedown":function(){
                                onItemClick.call(this,data,_input,$self);
                                params.currentData=data;
                            }
                        }).append(
                            formatter.call($self,data)
                        )
                    })
                }else{
                    return emptyMsg.call($self);
                }
            }()
        )
    }
})(jQuery);