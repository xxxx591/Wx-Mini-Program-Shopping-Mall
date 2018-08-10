var Zan = require('../../dist/index');
var common = require('../../utils/common.js');
const WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp()
var that;
var Bmob=require("../../utils/bmob.js");
Page(Object.assign({}, Zan.Quantity, {
  data: {
    indicatorDots: true,//是否出现焦点  
    autoplay: true,//是否自动播放轮播图  
    interval: 4000,//时间间隔
    duration: 1000,//延时时间
    hiddenModal: true,
    quantity1: {
      quantity: 1,
      min: 1,
      max: 20
    },
    actionType : 'payOrder',
  },
  

  onLoad: function (options) {
    that = this;
    that.setData({    
      good_id: options.id    
    })   

    //查询商品详情
    var menu_cover = null;
    var good_id = this.data.good_id;
    var Good = Bmob.Object.extend("good");
    var query = new Bmob.Query(Good);
    query.equalTo("is_delete", 0);
    query.get(good_id, {
      success: function(result) {
        // 查询成功，调用get方法获取对应属性的值
        console.log(result.get("good_desc"));
        
        var str = result.get("good_desc");

        if(str){
          var reg = new RegExp("&quot;", "g");
          var detail = str.replace(reg, "");
          WxParse.wxParse('content', 'html', detail, that);
        }

        menu_cover = result.get("menu_logo");

        var arr = { id: good_id, price: result.get("price"), menu_name: result.get("menu_name"), sale_number: result.get("sale_number"), menu_logo: result.get("menu_logo"), num: 0, good_number: result.get("good_number")};
        that.setData({    
          good_info: arr,
          quantity1:{
            quantity: 1,
            min: 1,
            max: result.get("good_number")
          }
        })
      },
      error: function(object, error) {
        console.log(error);
        // 查询失败
      }
    });

    //查询商品图片
    var Good_Pic = Bmob.Object.extend("good_pic");
    var query = new Bmob.Query(Good_Pic);
    query.equalTo("good_id", good_id);
    query.find({
            success: function(result) {
                var pic_attr = new Array();
                for (var i = 0; i < result.length; i++) {
                    var object = result[i];
                    var t = object.get('good_pic');
                    pic_attr.push(t);
                }
                pic_attr.unshift(menu_cover)
                that.setData({
                    imgUrls:pic_attr
                })
            },
            error: function(error) {
                
            }
        })
    
  },

  onShow: function() {
  },

  placeOrder:function(event){
        var name = event.target.dataset.name;
        if(name=="order"){
            this.setData({
                    actionType : 'payOrder'
                })
        }else if(name=="cart"){
            this.setData({
                    actionType : 'addCart'
                })
        }
        if(this.data.showModalStatus){  
          this.hideModal();  
        }else{  
          this.showModal();  
        }  
    },

  showModal: function () {  
    // 显示遮罩层  
    var animation = wx.createAnimation({  
      duration: 200,  
      timingFunction: "linear",  
      delay: 0  
    })  
    this.animation = animation  
    animation.translateY(300).step()  
    this.setData({  
      animationData: animation.export(),  
      showModalStatus: true  
    })  
    setTimeout(function () {  
      animation.translateY(0).step()  
      this.setData({  
        animationData: animation.export()  
      })  
    }.bind(this), 200)  
  },  

  hideModal: function () {  
    // 隐藏遮罩层  
    var animation = wx.createAnimation({  
      duration: 200,  
      timingFunction: "linear",  
      delay: 0  
    })  
    this.animation = animation  
    animation.translateY(300).step()  
    this.setData({  
      animationData: animation.export(),  
    })  
    setTimeout(function () {  
      animation.translateY(0).step()  
      this.setData({  
        animationData: animation.export(),  
        showModalStatus: false  
      })  
    }.bind(this), 200)  
  },  


  handleZanQuantityChange(e) {
    var componentId = e.componentId;
    var quantity = e.quantity;

    this.setData({
      [`${componentId}.quantity`]: quantity
    });
  },

  click_cancel:function(){  
     this.hideModal();  
  },  

   payOrder:function(){
     //获取传递过来的数量，商品名称，价格
     var id =this.data.good_info.id;
     var number = this.data.quantity1.quantity;
     var price = this.data.good_info.price;
     var name = this.data.good_info.menu_name;
     var pic = this.data.good_info.menu_logo;
     var good_number = this.data.good_info.good_number;
      if(parseInt(number) > parseInt(good_number)){
          common.showModal("货存不足！");
          return false;
      }
     var detailArray = new Array();
     detailArray = {number:number,price:price,name:name,pic:pic};
     var orderResult = new Array();
     orderResult.push(detailArray);
      wx.setStorage({
          key:"orderResult",
          data: orderResult
      })
     wx.redirectTo({
            url: '../payorder/index'
        })
  },  

  addCart : function(){
      //购物车数据放进本地缓存
    var id = this.data.good_info.id;
      var number = this.data.quantity1.quantity;
      var price = this.data.good_info.price;
      var name = this.data.good_info.menu_name;
      var pic = this.data.good_info.menu_logo;
      var good_number = this.data.good_info.good_number;
      var cartResult = new Array();
      if(parseInt(number) > parseInt(good_number)){
          common.showModal("货存不足！");
          return false;
      }
      var detailArray = { id:id, number: number, price: price, name: name, pic: pic, good_number: good_number,active: true };
      var oldcartResult = new Array;
      oldcartResult = wx.getStorageSync('cartResult');
      if(!oldcartResult){
        cartResult.push(detailArray);
        wx.setStorage({
          key: "cartResult",
          data: cartResult
        })
      }else{
        oldcartResult.push(detailArray);
        wx.setStorage({
          key: "cartResult",
          data: oldcartResult
        })
      }
     
      wx.reLaunch({
            url: '../cart/index'
        })
  },

  index : function(){
    wx.switchTab({
            url: '../dashboard/index'
        })
  },

  cart : function(){
    wx.switchTab({
            url: '../cart/index'
        })
  },
  
  selectAttributes : function(){
    common.showModal("商品属性功能还未完善！");
  }

}))
