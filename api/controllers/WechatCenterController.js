/**
 * 微信公众号Center的Controller
 * Created by tommy on 15/9/1.
 */
var CenterService = require("../services/wechat/CenterService");

module.exports = {
  home: function (req, res) {
    var openId = req.param('openId');

    CenterService.home(openId, res);
  },
  addressList: function (req, res) {
    var openId = req.param('openId');
    CenterService.addressList(openId, res);
  },
  addAddress: function (req, res) {
    var openId = req.param('openId');
    var data = req.param('data');
    CenterService.addAddress(openId, data, res);
  },
  deleteAddress: function (req, res) {
    var openId = req.param('openId');
    var data = req.param('data');
    CenterService.deleteAddress(openId, data, res);
  }, addressInfo: function (req, res) {
    var openId = req.param('openId');
    var id = req.param('id');
    CenterService.addressInfo(openId, id, res);
  },
  setIsDefault: function (req, res) {
    var openId = req.param('openId');
    var data = req.param('data');
    CenterService.setIsDefault(openId, data, res);
  },
  updateAddress: function (req, res) {
    var openId = req.param('openId');
    var data = req.param('data');
    CenterService.updateAddress(openId, data, res);
  },
  myOdersList: function (req, res) {
    // 用户openId
    var openId = req.param('openId');
    // 页数
    var page = req.param('page');
    //每页个数
    var perPage = req.param('per_page');
    //排序字段
    var sortBy = req.param('sortBy');
    //排序方式
    var order = req.param('order');
    CenterService.myOdersList(openId, page, perPage, sortBy, order, res);
  },
  confirmOrder: function (req, res) {
    // 用户openId
    var openId = req.param('openId');
    // 订单Id
    var orderId = req.param('orderId');
    CenterService.confirmOrder(openId, orderId, res);
  },
  myMerchants: function (req, res) {
    // 用户openId
    var openId = req.param('openId');
    // 订单Id
    var page = req.param('page');

    var openId=req.param('openId');
    CenterService.myMerchants(openId, page, res);
  }
};
