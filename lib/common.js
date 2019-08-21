class common  {
  constructor() {


  }
  wxpay(order_sn) {
    var params = {
      "data": { "order_sn": order_sn },
      "url": 'pay/pay'
    }
    this.query(params, function (res) {
      //console.log(res.data.data)
      wx.requestPayment({
        provider: 'wxpay',
        timeStamp: res.data.data.timeStamp,
        nonceStr: res.data.data.nonceStr,
        package: res.data.data.package,
        signType: res.data.data.signType,
        paySign: res.data.data.paySign,
        success: function (res) {
          console.log('success:' + JSON.stringify(res));
        },
        fail: function (err) {
          if (JSON.stringify(err) == "requestPayment:fail cancel") {
            wx.showToast({
              title: '取消支付'
            })
          }
          console.log('fail:' + JSON.stringify(err));
        }
      });
    })

  }
  query(params, onSuccess, onError, retry = 3) {

    if (!params.method) {
      params.method = 'POST';
    }
    var token = wx.getStorageSync('token');

    var url = config.host + "/backapi/wxapi/" + params.url;
    // console.log(url)
    wx.request({
      url: url,
      method: params.method,
      data: params.data,
      header: {
        'token': token
      },
      success: (res) => {
        //
        if (res.data.code == 401) {
          wx.showModal({
            title: '登录失效',
            content: '用户登录已失效，需要登录后才能继续',
            success: (res) => {
              if (res.confirm) {
                
              }
            }
          });
        }
        //可删除
        else if (res.data.code == 403) {
          wx.showToast({
            icon: 'none',
            title: '没有权限',
            duration: 2000
          });
          return;
        }
        else if (res.data.code == 200) {
          if (res.data.data.code == -1) {
            if (onError) {
              onError(res)
            }
            wx.showToast({
              icon: 'none',
              title: res.data.data.message
            })
            return;
          }
          if (onSuccess) {
            return onSuccess(res);
          }
        } else {
          var msg = '服务器错误'
          if (res.data.data.message) {
            msg = res.data.data.message
          }
          this.onError(msg)
        }
      },
      error: (res) => {
        //console.log(JSON.stringify(res))
        retry--;
        if (retry > 0) {
          return this.query(params, onSuccess, onError, retry);
        } else {
          if (onError()) {
            onError(res)
          } else {
            this.onError('接口调用出错');
          }

        }
      },
      complete(res) {
        if (res.errMsg == "request:fail abort") {
          wx.showToast({
            icon: 'none',
            title: '无法连接网络',
            duration: 3000
          });
        }
      }
    });

  }
  onError(errcode) {
    wx.showToast({
      icon: 'none',
      title: errcode,
      duration: 4000
    });
  };

  isEmpty(obj) {
    if (typeof obj == "undefined" || obj == null || obj == "" || obj.length == 0) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * usege
   * up_img(){
      var that=this
      wx.chooseImage({
      count:1,
      success: (chooseImageRes) => {
        const tempFilePaths = chooseImageRes["tempFilePaths"];
        var FileSystemManager=wx.getFileSystemManager()
        FileSystemManager.readFile({
          filePath:tempFilePaths[0],
          encoding:"base64",
          success(res){
            var params={
              'image':res.data,
              'id_card_side':'front'
              // "detect_direction":true,
              // "accuracy":"normal",
              // "vehicle_license_side":'front'
            }
            that.common.aip_id_card(params)
          }
        })
      	
      }
    })},
    params参考文档：https://ai.baidu.com/docs#/OCR-API/top
   *
   */

  ai_pic(params, success) {
    var url = "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general";
    this.ai_common(params, success, url)
  }

  ai_plant(params, success) {
    var url = "https://aip.baidubce.com/rest/2.0/image-classify/v1/plant";
    this.ai_common(params, success, url)
  } 
  ai_animal(params, success) {
    var url = "https://aip.baidubce.com/rest/2.0/image-classify/v1/animal";
    this.ai_common(params, success, url)
  }
  ai_common(params, success, url) {
    this.get_aip_token()
    var aip_token = wx.getStorageSync('aip_token')
    if(this.isEmpty(aip_token)){
      wx.showToast({
        title: '请重试',
        icon:'none'
      })
      return;
    }
    var route = url + '?access_token=' + aip_token
    //console.log(route)
    wx.request({
      url: route,
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success(res) {
        if (success) {
          success(res)
        }
        console.log(res)
      },
      fail:function(e){
        console.log('fail:'+e)
      },
      error:function(e){
        coonsole.log('error:'+e)
      }
    })
  }
  ai_car(params, success) {
    this.get_aip_token()
    var aip_token = wx.getStorageSync('aip_token')
    var licese_url = 'https://aip.baidubce.com/rest/2.0/image-classify/v1/car?access_token=' + aip_token
    wx.request({
      url: licese_url,
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success(res) {
        if (success) {
          success(res)
        }
        console.log(res)
      }
    })
  }
  aip_driver_license(params, success) {
    this.get_aip_token()
    var aip_token = wx.getStorageSync('aip_token')
    var licese_url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_license?access_token=' + aip_token
    wx.request({
      url: licese_url,
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success(res) {
        if (success) {
          success(res)
        }

      }
    })
  }
  aip_id_card(params) {
    this.get_aip_token()
    var aip_token = wx.getStorageSync('aip_token')
    var url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + aip_token
    //+'&url=https://img-blog.csdnimg.cn/20190109160201430.png'
    wx.request({
      url: url,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params,
      method: 'POST',
      success(res) {

      }
    })
  }
  words_detect(params) {

    this.get_aip_token()
    var aip_token = wx.getStorageSync('aip_token')
    var url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + aip_token
    //+'&url=https://img-blog.csdnimg.cn/20190109160201430.png'
    wx.request({
      url: url,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params,
      method: 'POST',
      success(res) {

      }
    })
  }
  get_aip_token() {
    var token = wx.getStorageSync('aip_token')
    if(token){
      return;
    }
    var app_id = '16695371'
    var api_key = '21eaAgLrdxdmjI9kHxHGTxIL'
    var secret_key = 'HrGWpHLw08S2AQdWpI5niavlj4rd6lph'
    var get_token_url = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + api_key + '&client_secret=' + secret_key
    wx.request({
      url: get_token_url,
      method: 'POST',
      success(res) {
        console.log(res)
        var access_token = res.data.access_token
        wx.setStorageSync('aip_token', access_token)
        wx.setStorageSync('aip', res.data)
      }
    })

  }

  upload_file(tempFilePaths, onSuccess, onError) {
    const uploadTask = wx.uploadFile({
      url: config.host + '/backapi/upload/save-file',
      filePath: tempFilePaths,
      name: 'file',
      success: (res) => {//注意这里返回的res.data不是对象，要用JSON.parse转换成对象再取内容
        if (onSuccess) {
          onSuccess(res)
        }
      },
      error: (res) => {
        if (onError) {
          onError(res)
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'false',
            duration: 2000
          });
        }

      },
    });
    console.log(uploadTask);
    uploadTask.onProgressUpdate((res) => {
      // console.log('上传进度' + res.progress);
      // console.log('已经上传的数据长度' + res.totalBytesSent);
      // console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
      // 测试条件，取消上传任务。
      if (res.progress == 100) {
        //uploadTask.abort();
        // wx.showToast({
        // 	title: '上传成功',
        // 	duration: 2000
        // });
      }
    });
  }


}

export { common };
