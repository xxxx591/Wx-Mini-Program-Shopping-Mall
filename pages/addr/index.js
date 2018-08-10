var common = require('../../utils/common.js');
var Bmob=require("../../utils/bmob.js");
var that;
Page({
  data: {
    area: ['省份', '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'],
    areaIndex: 0,
  },

  onLoad: function () {
      
  },

  onShow: function () {
      that = this;
      //获取用户的信息
      var User = Bmob.Object.extend("_User");
      var currentUser = Bmob.User.current();
      var objectid = currentUser.id;
      var query = new Bmob.Query(User);
      query.get(objectid, {
      success: function(result) {
        // 查询成功，调用get方法获取对应属性的值
        var name = result.get("name");
        var tel = result.get("tel");
        var barea = result.get("area");
        var addrdetail = result.get("addrdetail");
        var mailcode = result.get("mailcode");
        that.setData({    
          name: name,
          tel: tel,
          areaIndex: barea,
          addrdetail: addrdetail,
          mailcode: mailcode,
        })  
      },
      error: function(object, error) {
        // 查询失败
      }
      });
  },

  onAreaChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
    });
  },

  cancel:function(){
     wx.redirectTo({
            url: '../payorder/index'
        })
  },  
  addAddr : function(event){
    var currentUser = Bmob.User.current();
    var objectid = currentUser.id;
    var name = event.detail.value.name;
    var tel = event.detail.value.tel;
    var area = event.detail.value.area;
    console.log(area);
    var addrdetail = event.detail.value.addrdetail;
    var mailcode = event.detail.value.mailcode;
    if (!name) {
      common.showTip("名字不能为空", "loading");
      return false;
    }
    else if (!tel) {
      common.showTip("电话不能为空", "loading");
      return false;
    }else if(area == 0){
      common.showTip("请选着区域", "loading");
      return false;
    }else if(!addrdetail){
      common.showTip("详细地址不能为空", "loading");
      return false;
    }else if(!mailcode){
      common.showTip("邮政编码不能为空", "loading");
      return false;
    }
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
    query.get(objectid, {
        success: function(result) {
          // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
          result.set('name',name);
          result.set('tel',tel);
          result.set('area',area);
          result.set('addrdetail',addrdetail);
          result.set('mailcode',mailcode);
          result.save();
          // The object was retrieved successfully.
          common.showTip("保存成功");
          wx.redirectTo({
            url: '../payorder/index'
          })
        },
        error: function(object, error) {

        }
    });
  }
});