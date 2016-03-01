/**
 * Created by jcy on 15/10/21.
 */

var config = {
  partner:'2088021438784137' //合作身份者id，以2088开头的16位纯数字
  ,key:'86mekii4jyfcp8xnr6ff59wq8jzq01b7'//安全检验码，以数字和字母组成的32位字符86mekii4jyfcp8xnr6ff59wq8jzq01b7
  ,seller_email:'laiminqiang@14cells.com' //卖家支付宝帐户 必填
  ,host:'http://localhost:1337/'
  ,cacert:'./cacert.pem'//ca证书路径地址，用于curl中ssl校验
  ,transport:'https' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
  ,_input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
  ,batch_trans_notify_url:'/alipay/batch_trans_notify/notify_url'
};

var Alipay = require('alipay').Alipay;
var AlipaySubmit = require('../../node_modules/alipay/lib/alipay_submit.class').AlipaySubmit;
var alipay = new Alipay(config);
var url = require('url');

module.exports = {

  batchTransNotifyService: function (data,res) {

    //sails.log.info(alipay.alipay_config);
    var alipaySubmit = new AlipaySubmit(alipay.alipay_config);

    var parameter = {
      service:'batch_trans_notify',
      partner:alipay.alipay_config.partner,
      notify_url: url.resolve(config.host, config.batch_trans_notify_url),
      _input_charset:config._input_charset
    };

    //console.log(parameter);

    for(var attr in data){
      parameter[attr] = data[attr];
    }

    var html_text = alipaySubmit.buildRequestForm(parameter,"post", "提交订单");
    res.send(html_text);
  }
};
