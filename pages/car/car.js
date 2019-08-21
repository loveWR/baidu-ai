import { common } from '../../lib/common.js';
var com=new common()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList:[],
    image:'',
    matchList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  DelImg(e) {
    this.setData({
      imgList: [],
      matchList:[]
    })
  },
  ai_car(){
    var that=this
    var file = this.data.imgList[0]
    var FileSystemManager = wx.getFileSystemManager()
    FileSystemManager.readFile({
      filePath: file,
      encoding: "base64",
      success(res) {
        console.log(res)
        var params = {
          'image': res.data,
          //'vehicle_license_side':'back',
          // "detect_direction":true,
          // "accuracy":"normal",
          // "vehicle_license_side":'front'
        }
        com.ai_car(params,function(res){
          if(com.isEmpty(res.data.result)){
              wx.showToast({
                title: '无法识别,请重试',
                icon:'none'
              })
              return;
          }
          that.setData({
            matchList: res.data.result
          })
          console.log(that.data.matchList)
        })
      }
    })
  },
  
})