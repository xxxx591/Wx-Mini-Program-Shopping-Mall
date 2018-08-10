var Bmob=require("../../utils/bmob.js");
var that;
Page({
  data: {
    indicatorDots: true,//是否出现焦点  
    autoplay: true,//是否自动播放轮播图  
    interval: 4000,//时间间隔
    duration: 1000,//延时时间
    hiddenModal: true,
  },

  onLoad: function () {
  },

  onShow: function() {
    that = this;
    //查询出推荐的商品
    var Good = Bmob.Object.extend("good");
    var query = new Bmob.Query(Good);
    query.equalTo("is_delete", 0);  //上架
    query.equalTo("is_rec",1);  //推荐
    query.find({
        success: function(result) {
          console.log(result);
            var goodsArray = new Array();
            for (var i = 0; i < result.length; i++) {
                var object = result[i];
                var class_value = '';
                if(i ==0 || i%2 == 0){
                    //如果是0或者偶数class就为left-box,否则为right-box
                    class_value = 'left-box';
                }else{
                    class_value = 'right-box';
                }
                var t = {menu_logo:object.get('menu_logo'),menu_name:object.get('menu_name'),id:object.id,price:object.get('price'),class_value:class_value}
                goodsArray.push(t);
            }
            that.setData({
                goods:goodsArray,
            })
        },
        error: function(error) {
            
        }
    })

    const adv = Bmob.Object.extend("adv");
    const advs = new Bmob.Query(adv);
    // 查询所有数据
    advs.equalTo("is_show", 1);  //推荐
    advs.find({
      success: (results) => {
        const data = [];
        for (let object of results) {
          data.push({
            id: object.get('good_id'),
            url: object.get('adv')
          })
        }
        this.setData({
          banner:data
        })
      },
      error: (error) => {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });






  },
  more : function(){
    wx.navigateTo({
        url: '../shop/index'
    })
  }
})
