(function($) {
    var zTreeSelect=function(element,options){
        /*默认参数，可对API开放，外部可传的参数*/
        var defaults={
            setting:{
                check: {
                    enable: true,
                    chkboxType: {
                        "Y": "p",//关联
                        "N": "p"
                    }
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "dictCode",
                        pIdKey: "dictPcode"
                    },
                    check: {
                        chkDisabledInherit: true,
                        enable: true
                    },
                    key: {
                        name: "dictName"
                    }
                },
                view:{
                },
                callback: {
                    beforeCheck : this.zTreeBeforeCheck,
                    onCheck: this.zTreeOnCheck
                }
            },
            initData : null
        };
        /*私有参数，组件内部使用，不对外开放，外部不可修改*/
        this._defaults={};
        /*合并所有参数*/
        this.options = $.extend(true, {}, defaults, options);
        var _this=this;
        this.element =$(element).selector;
        this.options.element=this.element;
        this.element=this.element.substring(1,this.element.length)
        this.containerSelect=this.element+'_treeDemo';
        this.menuContent=this.element+"_menuContent";

        _this.initDom();
        this.selectContainer=$("#"+this.containerSelect);//treeId
        
        if(this.options.isMultiselect){
            this.options.setting.callback.beforeClick=this.mulBeforeClick;
            this.options.setting.callback.onClick=null;
            this.options.setting.callback.onCheck=this.onCheck;
            this.options.setting.check.enable=true;
            this.options.setting.check.chkboxType={"Y":"", "N":""};
        }

        t = $.fn.zTree.init($(this.selectContainer), this.options.setting, this.options.zNodes);

        _this.initData(this.containerSelect);//初始化选中数据
        _this.bindEvent();
    }


    /*支持2次扩展的方法*/
    zTreeSelect.fn=zTreeSelect.prototype={
        /*初始化所需要的Dom结构*/
        initDom:function(){
            var $container = $('<div class="form-group" style="position:relative;"></div>');
            $("#"+this.element).wrap($container);
            // 创建树
            var eleWidth=parseInt($("#"+this.element).width(), 10);
            var outPut='<div id="'+this.menuContent+'" class="menuContent" style="display:none; position: absolute;z-index:100;">'
                + '<ul id="'+ this.containerSelect+'" class="ztree" style="margin-top:0; width:'+eleWidth+'px"></ul>'
                +'</div>';
            $("#"+this.element).prop({readonly: 'readonly'});
            $("#"+this.element).after(outPut);

            $("#"+this.element).css({'overflow-x':'hidden'});
            // 创建选择和删除按钮
            // this.$delBtn = $('<span class="glyphicon glyphicon-trash delBtn" style="position: absolute;right: 25px; top: 10px; cursor: pointer;display:none"></span>');
            // $("#"+this.element).before(this.$delBtn).css("padding-right", "25px");
            // if(this.options.initData) { // 有初始化数据
            //     $("#"+this.element).val(this.options.initData.value);
            //     $("#"+this.element).attr({
            //         codeVal : this.options.initData.codeVal,
            //         codeId : this.options.initData.codeId
            //     });
            //     this.$delBtn.show();
            // }

        },

        /*input框绑定显示树的事件*/
        bindEvent:function(){
            var _this=this;
            $("#"+this.element).bind("click",function(){
                zTreeSelect.showMenu(_this);
            });
            // $("#"+this.element).prev('span').on('click', function(event){
            //     $("#"+_this.element).val('');
            //     $("#"+_this.element).attr({
            //         value: '',
            //         codeval: '',
            //         dictid: ''
            //     });
            //     $(this).hide();
            // });

        },

        zTreeBeforeCheck : function(treeId, treeNode) {
            if (treeNode.isParent) {
                alert("请选择子节点！");
                return false;
            }
        },

        // 初始化数据方法
        initData: function(treeId) {
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            var initDatas = this.options.initData;
            var selectShow = '';
            if(initDatas) { // 有初始化数据
                // selectShow += '<div id="showSelect" style="position:absolute;top:0;bottom:0;max-width:100%;overflow-x:hidden;overflow-y:auto;padding:4px;margin:1px 3px 1px 0;line-height:24px;">'
                for (var i = 0; i < initDatas.length; i++) {
                    selectShow += '<span class="selectContent" data-code="'+initDatas[i].codeId+'" codeVal="'+initDatas[i].codeVal+'" codeId="'+initDatas[i].codeId+'"  style="display:inline-block;padding:1px 3px;margin:3px 4px 3px 0;border:1px solid #ddd;background:#eee;border-radius:3px;" id="delSelect" >';
                    selectShow +=      initDatas[i].value;
                    selectShow +=      '<a class="deleteSel" style="margin-left:2px;cursor:pointer;">x</a>';
                    selectShow += '</span>';
                    treeObj.checkNode(treeObj.getNodeByParam('dictCode', initDatas[i].codeId), true, true);
                }
                // selectShow += '</div>';
               
                $("#"+this.element).append(selectShow);
            }
            $('.deleteSel').bind('click', function(event) {
                zTreeSelect.deleteChoose($(this),treeObj);
            });
        },

        // 获取数据的方法
        // getData : function() {
        //     var _this = this;
        //     var $element = $("#"+_this.element);
        //     return {
        //         value : $element.attr('value'),
        //         codeVal : $element.attr('codeval'),
        //         dictId : $element.attr('dictId')
        //     }
        // },

        zTreeOnCheck: function(event, treeId, treeNode){
            var treeObj = $.fn.zTree.getZTreeObj(treeId);
            nodes = treeObj.getCheckedNodes(true);
            // var $element = $("#"+treeId).parent().prev();
            var elName = treeId.split('_')[0];
            var $element = $('#'+elName);
            // var dictName = '';
            var selectShow = '';
            $element.empty();
            // selectShow += '<div id="showSelect" style="position:absolute;top:0;bottom:0;max-width:100%;overflow-x:hidden;overflow-y:auto;padding:4px;margin:1px 3px 1px 0;line-height:24px;">'
            for (var i = 0; i < nodes.length; i++) {
                if(nodes[i].isParent == false){
                    // dictName += nodes[i].dictName+',';
                    selectShow += '<span class="selectContent" id="delSelect" data-code="'+nodes[i].dictCode+'" style="display:inline-block;padding:1px 3px;margin:3px 4px 3px 0;border:1px solid #ddd;background:#eee;border-radius:3px;" >';
                    selectShow +=      nodes[i].dictName;
                    selectShow +=      '<a class="deleteSel" style="margin-left:2px;cursor:pointer;">x</a>';
                    selectShow += '</span>';
                }
            }
            // selectShow += '</div>';
            // dictName = dictName.substring(0, dictName.length-1);
            $element.append(selectShow);
            
            console.log(nodes);

            $('.deleteSel').bind('click', function(event) {
                zTreeSelect.deleteChoose($(this),treeObj);
            });
        }
    }
    /*删除选中*/
    zTreeSelect.deleteChoose=function(delThis,theTreeObj){
        var dataCode = delThis.parent('.selectContent').attr('data-code');
        // treeObj.checkNode(treeObj.getNodeByParam('dictCode', dataCode), true, true);
        theTreeObj.checkNode(theTreeObj.getNodeByParam('dictCode', dataCode), false, true);
        delThis.parent('.selectContent').remove();
    }
    /*初始化选中数据*/
    zTreeSelect.initSelectData=function(){

    }

    /*显示菜单*/
    zTreeSelect.showMenu=function(myThis){
        var _this=myThis;
        $("#"+_this.menuContent).slideDown("fast");
        $("body").bind("mousedown",{myThis:_this}, zTreeSelect.onBodyDown);
    }

    /*隐藏菜单*/
    zTreeSelect.hideMenu=function(_this) {
        $("#"+_this.menuContent).fadeOut("fast");
        $("body").unbind("mousedown", _this.onBodyDown);
    }

    /*点击页面其他位置就隐藏树*/
    zTreeSelect.onBodyDown=function(options) {
        var _this=options.data.myThis;
        if (!(event.target.className === 'deleteSel' || event.target.id === 'delSelect' || event.target.id === _this.element || event.target.id === "menuBtn" || event.target.id === _this.menuContent || $(event.target).parents("#"+_this.menuContent).length>0)) {
            zTreeSelect.hideMenu(_this);
        }
    }

    $.fn.zTreeSelect=function(options){
        if($.data(this,"plugin_zTreeSelect")){
            $.data(this,"plugin_zTreeSelect",null)
        }
        return $.data(this, "plugin_zTreeSelect" , new zTreeSelect(this, options));
    }


})(jQuery);