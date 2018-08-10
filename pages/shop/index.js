//index.js
//获取应用实例
const Bmob = require("../../utils/bmob.js");
let Good = Bmob.Object.extend("good");
let query = new Bmob.Query(Good);

Page({
  data: {
    goods: [], //页面数据
    pagination: 0, //页码
    pageSize: 8, //每页数据
    nodata: true, //无数据
    searchVal:""
  },
  onLoad() {
    //初始页面第一次获取页面数据
    this.getData();
  },
  input(e){
    this.setData({
      searchVal: e.detail.value
    })
    this.search()
  },
  clear(){
    this.setData({
      goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 8, //每页数据
      nodata: true, //无数据
      searchVal: ""
    })
    this.getData();
  },
  search(){
    this.setData({
      goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 8, //每页数据
      nodata: true, //无数据
    })
    query.equalTo("menu_name", { "$regex": `${this.data.searchVal}.*`});
    query.limit(this.data.pageSize); //返回n条数据
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.descending('createdAt'); 
    query.find({
      success: (results) => {
        let data = [];
        //将得到的数据存入数组
        for (let object of results) {
          data.push({
            id: object.id,
            title: object.get('menu_name'),
            image: object.get('menu_logo'),
            price: object.get('price'),
          })
        }
        console.log(data)
        
        this.setData({
          goods:data
        })
      }
    });
  },
  getData() {
    query.equalTo("menu_name", { "$regex": `${this.data.searchVal}.*` });
    query.limit(this.data.pageSize); //返回n条数据
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.descending('weight'); //按权重排序
    query.find({
      success: (results) => {
        console.log(results)
        let data = [];
        //将得到的数据存入数组
        for (let object of results) {
          data.push({
            id: object.id,
            title: object.get('menu_name'),
            image: object.get('menu_logo'),
            price: object.get('price'),
          })
        }
        //判断是否有数据返回
        if (data.length) {
          let goods = this.data.goods; //得到页面上已经渲染的数据(数组)
          let pagination = this.data.pagination; //获取当前分页(第几页)
          goods.push.apply(goods, data); //将页面上面的数组和最新获取到的数组进行合并
          pagination = pagination ? pagination + 1 : 1; //此处用于判断是首次渲染数据还是下拉加载渲染数据

          //更新数据
          this.setData({
            goods: goods,
            pagination: pagination
          })
        } else {
          //没有返回数据，页面不再加载数据
          this.setData({
            nodata: false
          })
        }
      },
      error(error) {
        console.log(`查询失败: ${error.code} ${error.message}`);
      }
    });
  },
  router(e) {
    //跳转至商品详情页
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/good/index?id=${id}`
    })
  },
  onReachBottom() {
    //下拉触底加载更多数据
    this.getData();
  }
})
