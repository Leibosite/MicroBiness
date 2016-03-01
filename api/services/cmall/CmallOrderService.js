/**
 * 微信店铺订单业务逻辑处理
 * Created by tommy on 15/9/14.
 */
var ObjectUtil = require("../../util/ObjectUtil");
var ResponseUtil = require("../../util/ResponseUtil");
var DataFilter = require("../../util/DataFilter");
var FileUtil = require("../../util/FileUtil");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var Payment = require('wechat-pay').Payment;
var middleware = require('wechat-pay').middleware;
var Api = require('wechat-api');
var api = new Api(sails.config.wechatAppId, sails.config.wechatSecret);
var initConfig = {
  partnerKey: sails.config.partnerKey,
  appId: sails.config.wechatAppId,
  mchId: sails.config.mchId,
  notifyUrl: sails.config.notifyUrl,
  pfx: sails.config.wechatSecret
} ;

module.exports = {
  /**
   * 支付订单
   * 1.通过openId查询用户，检查用户是否存在
   * 2.检查orderNumber，orderNumber是否存在
   * 3.根据传入的orderNumber调用统一下单API
   * 4.将返回结果给微信浏览器
   * @param openId
   * @param orderNumber
   * @param res
   */
  payOrder: function (openId, orderNumber, ip, res) {
    sails.log.info("--------------{start}--|Function:payOrder()|------------");
    sails.log.info("--------------[bs]---{user ip address}-------|用户的IP地址为:|--------------");
    sails.log.info(ip);
    sails.log.info("--------------[bs]---{orderNumber}-------|订单编号为:|--------------");
    sails.log.info(orderNumber);
    sails.log.info("--------------[bs]---{openId}-------|openId为:|--------------");
    sails.log.info(openId);
    if (!openId || openId === "?" || openId === "")
      return res.json(ResponseUtil.addExceptionMesgeAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    if (!orderNumber || orderNumber === "?" || orderNumber === "")
      return res.json(ResponseUtil.addExceptionMesgeAndCode(ResultCode.miss_order_number.code, ResultCode.miss_order_number.msg));

    var order = {
      body: '谷雨商品 * 1',
      attach: '{"部位":"三角"}',
      out_trade_no: orderNumber,
      total_fee: 1,
      spbill_create_ip: '101.200.174.126',
      openid: openId,
      trade_type: 'JSAPI'
    };
    var payment = new Payment(initConfig);
    sails.log.info("--------------[bs]---{payment}-------|生成开始向微信统一下单|--------------");
    sails.log.info(payment);
    sails.log.info("--------------[bs]---{order}-------|微信支付统一下单,订单为:|--------------");
    sails.log.info(order);
    payment.getBrandWCPayRequestParams(order, function (err, payargs) {
      if (err) {
        sails.log.error("----[bs]----{payment.getBrandWCPayRequestParams(order, function (err, payargs)}---error");
        sails.log.error(err);
      }

      sails.log.info("--------------[bs]---{payargs}-------|生成微信的支付信息参数为:|--------------");
      sails.log.info(payargs);

      var responseData = ResponseUtil.addSuccessMessage();
      responseData.payargs = payargs;
      sails.log.info("--------------{res}--|res|----|返回的API JSON数据为|--------");
      sails.log.info(JSON.stringify(responseData));
      sails.log.info("--------------{end}--|Function:payOrder()|------------");
      return res.json(responseData);
    });

  },
  /**
   * 查询支付结果
   * @param openId
   * @param orderNumber
   * @param res
   */
  queryPayResult: function (openId, orderNumber, res) {
    if (!openId || openId === "?" || openId === "")
      return res.json(ResponseUtil.addExceptionMesgeAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    if (!orderNumber || orderNumber === "?" || orderNumber === "")
      return res.json(ResponseUtil.addExceptionMesgeAndCode(ResultCode.miss_order_number.code, ResultCode.miss_order_number.msg));
  },
  /**
   * 接收微信支付结果通知
   * @param openId
   * @param orderNumber
   * @param res
   */
  wechatNofify: function (req, res) {
    sails.log.info("--------------{start}--|Function:wechatNofify()|------------");
    sails.log.info("--------------[bs]-----------{wechat pay notify}--------|收到微信支付成功通知消息为:|--------");

      middleware(initConfig).getNotify().done(function (message, req, res, next) {
        sails.log.info("---------[bs]-------{wechat notify}-----------------------1------------");
        sails.log.info(message);
        sails.log.info("---------[bs]-------{wechat notify}-----------------------2------------");
        var openid = message.openid;
        var order_id = message.out_trade_no;
        var attach = {};
        try {
          attach = JSON.parse(message.attach);
        } catch (e) {
        }
        /**
         * 查询订单，在自己系统里把订单标为已处理
         * 如果订单之前已经处理过了直接返回成功
         */
        sails.log.info("--------------[bs]-----------{payOrder update}--------|开始更新支付订单下的订单列表|--------");
        PayOrder.findOne({order_number: order_id}).exec(function (err, payOrder) {
          sails.log.info("--------------[bs]-----------{payOrder update}--------|支付订单为:|--------");
          sails.log.info(JSON.stringify(payOrder));
          if (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
          sails.log.info("--------------[bs]-----------{ updating order}--------|更新订单列表|--------");
          OrderForm.update({payOrder: payOrder.id}, {status: 3}).exec(function (err, results) {
            if (err) {
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }
            sails.log.info("--------------[bs]-----------{ updated order}--------|更新后的订单列表为:|--------");
            sails.log.info(results);
            res.reply('success');
          });
        });


        /**
         * 有错误返回错误，不然微信会在一段时间里以一定频次请求你
         * res.reply(new Error('...'))
         */
      });



  },
  /**
   * 微信支付配置前端支付参数
   * @param openId
   * @param res
   */
  configParm: function (openId, storeInformationId, productIds, res) {
    sails.log.info("--------------{start}--|Function:configParm()|----|开始获取微信支付配置参数|--------");
    sails.log.info("------------------------{method}--------configParm()--------openId");
    sails.log.info(openId);
    sails.log.info("------------------------{method}--------configParm()--------storeInformationId");
    sails.log.info(storeInformationId);
    sails.log.info("------------------------{method}--------configParm()--------productIds");
    sails.log.info(productIds);

    if (!openId || openId == '?' || openId == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!storeInformationId || storeInformationId == '?' || storeInformationId == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!productIds || productIds == '?')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_ids.code, ResultCode.miss_product_ids.msg));
    try {
      var param = {
        debug: sails.config.wechatPayDebug,
        jsApiList: ['chooseWXPay'],
        url: sails.config.jssdkUrl + 'storeInformationId=' + storeInformationId + '&productIds=' + productIds
      };
      sails.log.info("--------------[bs]------------------ api.getJsConfig()--------param");
      sails.log.info(param);
      api.getJsConfig(param, function (err, config) {
        if (err)
          sails.log.error(err);
        sails.log.info("--------------[bs]------------------ api.getJsConfig()--------config");
        sails.log.info(config);
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.jssdk_config = config;
        sails.log.info("--------------{res}--|res|----|返回的API JSON数据为|--------");
        sails.log.info(JSON.stringify(responseData));
        sails.log.info("--------------{end}--|Function:configParm()|----|结束获取微信支付配置参数|--------");
        return res.json(responseData);

      });
    } catch (err) {
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_json_data.code, ResultCode.invalid_json_data.msg));
    }

  },


}
