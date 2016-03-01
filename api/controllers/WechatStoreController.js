/**
 * 微信公众号Store Controller
 * Created by tommy on 15/9/2.
 */
var StoreService = require("../services/wechat/StoreService");

module.exports = {
  home: function (req, res) {
    var openId = req.param('openId');
    var page = req.param('page');
    sails.log.info(openId);
    if (!page)
      page = 1;
    StoreService.home(openId, page, res);
  },
  productCategory: function (req, res) {
    var openId = req.param('openId');
    var page = req.param('page');
    sails.log.info(openId);
    StoreService.productCategory(openId, page, res);
  },
  productMore: function (req, res) {
    var openId = req.param('openId');
    // 页数
    var page = req.param('page');
    // 每页的个数
    var limit = req.param('limit');

    var product_category_id = req.param('id');

    StoreService.productMore(openId, product_category_id, page, limit, res);
  },
  details: function (req, res) {
    var openId = req.param('openId');

    var product_id = req.param('id');

    StoreService.productDetails(openId, product_id, res);
  }
  ,
  microbusiness: function (req, res) {
    var openId = req.param('openId');

    var product_id = req.param('productId');

    StoreService.microbusiness(openId, product_id, res);
  }
};
