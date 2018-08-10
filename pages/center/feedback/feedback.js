// pages/center/feedback/feedback.js
var Bmob = require("../../../utils/bmob.js");
var common = require('../../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  //添加反馈建议
  addFeedback: function (event) {
    var that = this;
    var contact = event.detail.value.contact;
    var content = event.detail.value.content;

    if (!contact) {
      common.showTip("联系方式不能为空", "loading");
      return false;
    }
    
    if (!content) {
      common.showTip("内容不能为空", "loading");
      return false;
    }

    if (!(/^1[34578]\d{9}$/.test(contact))) {
      common.showTip("手机号码有误", "loading");
      return false;
    } 

    that.setData({
      loading: true
    })
      
      var User = Bmob.Object.extend("_User");
      var currentUser = Bmob.User.current();
      var objectid = currentUser.id;
      var Diary = Bmob.Object.extend("feedback");
      var diary = new Diary();
      var me = new Bmob.User();
      me.id = objectid;
      diary.set("contact", contact);
      diary.set("content", content);
      diary.set("user", me);

      //添加数据，第一个入口参数是null
      diary.save(null, {
        success: function (result) {
          // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
          common.showModal('保存反馈成功，点击确定返回。', '提示', '' ,function () {
            wx.navigateBack();
          });

          // wx.navigateBack();
          that.setData({
            loading: false
          })

        },
        error: function (result, error) {
          // 添加失败
          common.showModal('保存反馈失败，请重新发布');
        }
      });

  },

})