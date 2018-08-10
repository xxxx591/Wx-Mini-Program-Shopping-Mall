var that;
var Bmob=require("../../utils/bmob.js");
var common = require("../../utils/common.js");
Page({
  data: {
    currentTab : 0,
    winHeight: null,
  },
  onLoad:function(options){
    that = this;

    if (options.id){
      this.setData({
        currentTab: options.id
      })
    }

    console.log(options.id)
    // 页面初始化 options为页面跳转所带来的参数
    wx.getSystemInfo( {
            success: function( res ) {
                that.setData( {
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight,
                });
            }
        });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    //获取全部订单信息
    var currentUser = Bmob.User.current();
    var Order = Bmob.Object.extend("Order");
    var query = new Bmob.Query(Order);
    query.equalTo("orderUser",currentUser.id); 
    query.descending('createdAt'); 
    query.find({
        success: function(result) {
            var allOrder  = [], //全部
              noPayment = [], //待付款
              shipments = [], //待发货
              Receiving = [], //待收货
              finish = [];//已完成
            
            for (var i = 0; i < result.length; i++) {
                var object = result[i];
                var status = "";

                var resData = { totalprice: object.get('totalprice'), remarks: object.get('remarks'), orderId: object.get('orderId'), status: status, orderDetail: object.get('orderDetail'), createdAt: object.createdAt }

                switch (object.get('status')) {
                case 0: //待付款
                    resData.status = "待付款";
                    noPayment.push(resData);
                  break;
                case 1: //已付款-->待发货
                    resData.status = "待发货";
                    shipments.push(resData);
                  break;
                case 2: //已发货-->待收货
                    resData.status = "正在配送";
                    Receiving.push(resData);
                  break;
                case 3: //已收货-->全部完
                    resData.status = "已完成";
                    finish.push(resData);
                  break;
                default://全部状态
              }
                allOrder.push(resData);
            }
       
            that.setData({
              allOrder: allOrder, //全部
              noPayment: noPayment, //待付款
              shipments: shipments, //待发货
              Receiving: Receiving, //待收货
              finish:finish
            })
        },
        error: function(error) {
            
        }
    })
    
  },
  swichNav: function( e ) {

        var that = this;

        if( this.data.currentTab === e.target.dataset.current ) {
            return false;
        } else {
            that.setData( {
                currentTab: e.target.dataset.current
            })
        }

    },

    bindChange: function( e ) {

        that = this;
        that.setData( { currentTab: e.detail.current });

    },

    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
      that.onShow()
    },


    cancelOrder : function( e ){
       var that = this;
       var orderid = e.target.dataset.id;
       
       common.showModal('你确定取消订单吗？','提示',true , function(e){
         if (e.confirm) {
         
            //取消订单
            var Order = Bmob.Object.extend("Order");
            var query = new Bmob.Query(Order);
            query.equalTo("orderId", orderid);
            query.find().then(function (result) {
              return Bmob.Object.destroyAll(result);
            }).then(function (result) {
              common.showTip('取消订单成功');
              setTimeout(function () {
                that.onShow()
              }, 3000);
              // 删除成功
            }, function (error) {
              // 异常处理
            });
         }
       });
    },
  overOrder:function(e){
    var that = this;
    var orderid = e.target.dataset.id;
    common.showModal('你确定收货了吗？', '提示', true, function (e) {

      if (e.confirm) {
        var Order = Bmob.Object.extend("Order");
        var query = new Bmob.Query(Order);
        query.equalTo("orderId", orderid);
        
        query.find().then(function (result) {

          for(let obj of result){
            obj.set('status',3)
   
            for (let item of obj.get('orderDetail')) {
              var good = Bmob.Object.extend("good");
              var qgood = new Bmob.Query(good);
              qgood.get(item.id, {
                success: function (result) {
                  console.log(result)
                  result.set("sale_number", item.number);
                  result.save()
                },
                error: function (object, error) {
                  // 查询失败
                }
              });
            }

            
            obj.save(null,{
              success:function(){
                common.showTip('收货成功');
                setTimeout(function () {
                  that.onShow()
                }, 1000);
              }
            });
          }
        }), function (error) {
          // 异常处理
        };

        
      }
    });
  },
    deleteOrder: function (e) {
      var that = this;
      var orderid = e.target.dataset.id;
      common.showModal('你确定删除订单吗？', '提示', true, function (e) {

        if (e.confirm) {
          //取消订单
          var Order = Bmob.Object.extend("Order");
          var query = new Bmob.Query(Order);
          query.equalTo("orderId", orderid);
          query.find().then(function (result) {
            return Bmob.Object.destroyAll(result);
          }).then(function (result) {
            common.showTip('删除订单成功');
            setTimeout(function () {
              that.onShow()
            }, 3000);
            // 删除成功
          }, function (error) {
            // 异常处理
          });
        }
      });
    },
  logistics:function(e){
    var orderid = e.target.dataset.id;
console.log(1)

  },
    payOrder : function( e ){
      var orderid = e.target.dataset.id;
      var money = e.target.dataset.price
      var that = this;
      // 发起支付
      wx.getStorage({
        key: 'openid',
        success: function (res) {
          var openId = res.data;
          if (!openId) {
            console.log('未获取到openId请刷新重试');
            return false;
          }
          //传参数金额，名称，描述,openid
          Bmob.Pay.wechatPay(money, '小程序商城', '描述', openId).then(function (resp) {

            //服务端返回成功
            var timeStamp = resp.timestamp,
              nonceStr = resp.noncestr,
              packages = resp.package,
              orderId = resp.out_trade_no,//订单号，如需保存请建表保存。
              sign = resp.sign;
            //发起支付
            wx.requestPayment({
              'timeStamp': timeStamp,
              'nonceStr': nonceStr,
              'package': packages,
              'signType': 'MD5',
              'paySign': sign,
              'success': function (res) {
                //付款成功,修改订单的状态
                var Order = Bmob.Object.extend("Order");
                var query = new Bmob.Query(Order);
                query.equalTo("orderId", orderid);
                query.find({
                  success: function (result) {
                    result.set("status", 1);
                    result.save();
                    common.showTip('支付成功');
                    setTimeout(function () {
                      that.onShow()
                    }, 3000);
                  },
                  error: function (error) {

                  }
                });
              },
              'fail': function (res) {
                common.showTip('支付失败');
                var User = Bmob.Object.extend("_User");
                var currentUser = Bmob.User.current();
                var objectid = currentUser.id;
                var Order = Bmob.Object.extend("Order");
                var Order = new Order();
                var me = new Bmob.User();
                me.id = objectid;
                Order.set("remarks", remarks);
                Order.set("orderUser", me);
                Order.set("totalprice", parseInt(totalPrice));
                Order.set("orderDetail", orderDetail);
                Order.set("status", 0);
                Order.set("userInfo", userInfo);
                Order.set("orderId", orderId);
                Order.save(null, {
                  success: function (result) {
                    console.log(result.id)
                  },
                  error: function (result, error) {

                  }
                });
              }
            })

          }, function (err) {
            console.log('服务端返回失败');
            console.log(err);
          });

        }
      })
    }

});
