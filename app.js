//app.js
var Bmob=require("utils/bmob.js");
Bmob.initialize("965bd5435f688777335dafcac521255f", "e5d2d945a29693e97a677650946ba68f");

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    try {
      var value = wx.getStorageSync('openid')
      if (value) {
      }
      else{
        wx.login({
        success: function (res) {
          var user = new Bmob.User();//开始注册用户
          user.loginWithWeapp(res.code).then(function (user) {
            var openid = user.get("authData").weapp.openid;
            if (user.get("nickName")) {
              // 第二次访问
              wx.setStorageSync('openid', openid)
            } else {
               //保存用户其他信息
              wx.getUserInfo({
                success: function (result) {

                  var userInfo = result.userInfo;
                  var nickName = userInfo.nickName;
                  var avatarUrl = userInfo.avatarUrl;

                  var u = Bmob.Object.extend("_User");
                  var query = new Bmob.Query(u);
                  // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
                  query.get(user.id, {
                    success: function (result) {
                      // 自动绑定之前的账号
                      result.set('nickName', nickName);
                      result.set("userPic", avatarUrl);
                      result.set("openid", openid);
                      result.save();
                      wx.setStorageSync('openid', openid)
                      
                    }
                  });
                }
              });
            }

          }, function (err) {
            console.log(err, 'errr');
          });

        }
      });
      }
    } catch (e) {
    }
  },
  getUserInfo:function(cb){
    var that = this
  },
  globalData:{
    userInfo:null
  }
})