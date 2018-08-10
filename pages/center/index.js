// pages/center/index.js
var Bmob=require("../../utils/bmob.js");
Page({
  data:{},
  onLoad:function(options){
    //页面初始化 options为页面跳转所带来的参数
    var that = this;
    var value = wx.getStorageSync('openid')
    if (value) {
      var u = Bmob.Object.extend("_User");
      var query = new Bmob.Query(u);
      query.equalTo("openid", value);
      query.find({
        success: function (results) {
          that.setData({    
            userInfo: results[0],
          })  
        },
        error: function (error) {
        }
      });
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  cart:function(){
    wx.switchTab({ 
      url: '../cart/index' 
    })
  },

  feedback : function(){
    wx.navigateTo({
      url: './feedback/feedback'
    })
  }
})