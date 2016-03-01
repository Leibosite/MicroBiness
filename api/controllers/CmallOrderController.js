/**
 * 店铺订单业务处理
 * Created by tommy on 15/9/14.
 */
var CmallOrderService = require("../services/cmall/CmallOrderService");

module.exports = {
  payOrder: function (req, res) {
    var openId = req.param('openId');
    var orderNumber = req.param('orderNumber');
    var ip = req.ip;

    CmallOrderService.payOrder(openId, orderNumber, ip, res);
  },
  queryPayResult: function (req, res) {
    var openId = req.param('openId');
    var orderNumber = req.param('orderNumber');

    CmallOrderService.queryPayResult(openId, orderNumber, res);
  },
  // TODO:
  wechatNofify: function (req, res) {
    CmallOrderService.wechatNofify(req, res);

  },
  configParm: function (req, res) {

    var openId = req.param('openId');
    var storeInformationId = req.param('storeInformationId');
    var productIds = req.param('productIds');
    CmallOrderService.configParm(openId, storeInformationId, productIds, res);

  }
};
