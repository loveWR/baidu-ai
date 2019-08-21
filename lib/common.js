const common = new class common {
  wxpay(order_sn) {
    var params = {
      "data": { "order_sn": order_sn },
      "url": 'pay/pay'
    }
    this.query(params, function (res) {
      //console.log(res.data.data)
      uni.requestPayment({
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
            uni.showToast({
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
    var token = uni.getStorageSync('token');

    var url = config.host + "/backapi/wxapi/" + params.url;
    // console.log(url)
    uni.request({
      url: url,
      method: params.method,
      data: params.data,
      header: {
        'token': token
      },
      success: (res) => {
        //
        if (res.data.code == 401) {
          uni.showModal({
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
          uni.showToast({
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
            uni.showToast({
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
          uni.showToast({
            icon: 'none',
            title: '无法连接网络',
            duration: 3000
          });
        }
      }
    });

  }
  onError(errcode) {
    uni.showToast({
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
      uni.chooseImage({
      count:1,
      success: (chooseImageRes) => {
        const tempFilePaths = chooseImageRes["tempFilePaths"];
        var FileSystemManager=uni.getFileSystemManager()
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
  ai_common(params, success, url) {
    this.get_aip_token()
    var aip_token = uni.getStorageSync('aip_token')
    var route = url + '?access_token=' + aip_token
    console.log(route)
    uni.request({
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
      }
    })
  }
  ai_car(params, success) {
    this.get_aip_token()
    var aip_token = uni.getStorageSync('aip_token')
    var licese_url = 'https://aip.baidubce.com/rest/2.0/image-classify/v1/car?access_token=' + aip_token
    uni.request({
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
    var aip_token = uni.getStorageSync('aip_token')
    var licese_url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_license?access_token=' + aip_token
    uni.request({
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
    var aip_token = uni.getStorageSync('aip_token')
    var url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + aip_token
    //+'&url=https://img-blog.csdnimg.cn/20190109160201430.png'
    uni.request({
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
    var aip_token = uni.getStorageSync('aip_token')
    var url = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + aip_token
    //+'&url=https://img-blog.csdnimg.cn/20190109160201430.png'
    uni.request({
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
    var app_id = '16695371'
    var api_key = '21eaAgLrdxdmjI9kHxHGTxIL'
    var secret_key = 'HrGWpHLw08S2AQdWpI5niavlj4rd6lph'
    var get_token_url = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + api_key + '&client_secret=' + secret_key
    uni.request({
      url: get_token_url,
      method: 'POST',
      success(res) {
        var access_token = res.data.access_token
        uni.setStorageSync('aip_token', access_token)
        uni.setStorageSync('aip', res.dataa)
      }
    })

  }

  upload_file(tempFilePaths, onSuccess, onError) {
    const uploadTask = uni.uploadFile({
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
          uni.showToast({
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
        // uni.showToast({
        // 	title: '上传成功',
        // 	duration: 2000
        // });
      }
    });
  }


}

export default common
