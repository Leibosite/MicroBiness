/**
 * 微信公众号商城
 * Created by tommy on 15/9/6.
 */
//var StoryService = require("../services/wechat/StoryService");
var CmallShopService = require("../services/cmall/CmallShopService");

module.exports = {
  shopHeader: function (req, res) {
    var openId = req.param('openId');
    var store_information_id = req.param('store_information_id');

    CmallShopService.shopHeader(openId, store_information_id, res);
  },
  storeColumn: function (req, res) {
    var openId = req.param('openId');
    var store_information_id = req.param('store_information_id');

    CmallShopService.storeColumn(openId, store_information_id, res);
  },
  productCategory: function (req, res) {
    var openId = req.param('openId');
    var store_information_id = req.param('store_information_id');
    var page = req.param('page');
    CmallShopService.productCategory(openId, store_information_id, page, res);
  },
  productMore: function (req, res) {
    sails.log.info("000000res");
    sails.log.info(res);
    var openId = req.param('openId');
    // 页数
    var page = req.param('page');
    // 每页的个数
    var limit = req.param('limit');
    // 商品分类ID
    var product_category_id = req.param('product_category_id');
    // 店铺ID
    var store_information_id = req.param('store_information_id');


    CmallShopService.productMore(openId, product_category_id, store_information_id, page, limit, res);
  },
  productDetails: function (req, res) {
    var openId = req.param('openId');

    var product_id = req.param('product_id');
    // 店铺ID
    var store_information_id = req.param('store_information_id');
    CmallShopService.productDetails(openId, product_id, store_information_id, res);
  },
  shopProducts: function (req, res) {
    var openId = req.param('openId');

    var product_id = req.param('product_id');

    var store_information_id = req.param('store_information_id');

    CmallShopService.shopProductsShow(openId, product_id, store_information_id, res);
  },
  getProductsInfo: function (req, res) {
    var openId = req.param('openId');

    var product_ids = req.param('product_ids');

    var store_information_id = req.param('store_information_id');

    CmallShopService.getProductsInfo(openId, product_ids, store_information_id, res);
  },
  confirmOrder: function (req, res) {
    var openId = req.param('openId');

    var order_info = req.param('orderInfo');

    var store_information_id = req.param('storeInformationId');


    CmallShopService.confirmOrder(openId, order_info, store_information_id, res);


  },
  favoriteShop: function (req, res) {
    var openId = req.param('openId');

    var store_information_id = req.param('storeInformationId');
    var type = req.param('type');

    CmallShopService.favoriteShop(openId, store_information_id, type, res);
  }
};
