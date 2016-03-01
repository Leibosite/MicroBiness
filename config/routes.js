/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  //'/': {
  //  view: 'homepage'
  //},
  'get /wechat/user/location': {
    controller: 'WechatMeController',
    action: 'getLocation',
  },
  'post /wechat/user/location': {
    controller: 'WechatMeController',
    action: 'postLocation',
  },
  'get /wechat/center/home': {
    controller: 'WechatCenterController',
    action: 'home'
  },
  'get /wechat/center/myAddresses/list': {
    controller: 'WechatCenterController',
    action: 'addressList'
  },
  'post /wechat/center/myAddresses/new': {
    controller: 'WechatCenterController',
    action: 'addAddress'
  },
  'delete /wechat/center/myAddresses/delete': {
    controller: 'WechatCenterController',
    action: 'deleteAddress'
  },
  'put /wechat/center/myAddresses/setIsDefault': {
    controller: 'WechatCenterController',
    action: 'setIsDefault'
  },
  'put /wechat/center/myAddresses/update': {
    controller: 'WechatCenterController',
    action: 'updateAddress'
  },
  'get /wechat/center/myAddresses/info': {
    controller: 'WechatCenterController',
    action: 'addressInfo'
  },
  'get /wechat/center/myOders/list': {
    controller: 'WechatCenterController',
    action: 'myOdersList'
  },
  'put /wechat/center/myOders/confirm': {
    controller: 'WechatCenterController',
    action: 'confirmOrder'
  },
  // 微信公众号Store Home
  'get /wechat/store/home': {
    controller: 'WechatStoreController',
    action: 'home'
  },
  // 微信公众号Store Home页刷新Product分类
  'get /wechat/store/home/productCategory': {
    controller: 'WechatStoreController',
    action: 'productCategory'
  },
  // 微信公众号Store商品分类更多
  'get /wechat/store/column/more': {
    controller: 'WechatStoreController',
    action: 'productMore'
  },
  // 微信公众号商品详细信息
  'get /wechat/store/product/details': {
    controller: 'WechatStoreController',
    action: 'details'
  },
  // 微信公众号Story栏目
  'get /wechat/store/product/microbusiness': {
    controller: 'WechatStoreController',
    action: 'microbusiness'
  },
  // 微信公众号商品推荐微商信息
  'get /wechat/story/home/column': {
    controller: 'WechatStoryController',
    action: 'storyColumn'
  },  // 微信公众号故事分类
  'get /wechat/story/home/category': {
    controller: 'WechatStoryController',
    action: 'storyCategory'
  },
  // 微信公众号故事分类更多
  'get /wechat/story/category/more': {
    controller: 'WechatStoryController',
    action: 'storyMore'
  },
  // 微信公众号故事详情
  'get /wechat/story/details': {
    controller: 'WechatStoryController',
    action: 'storyDetails'
  },
  // 微信公众号店铺
  'get /cmall/home/header': {
    controller: 'CmallShopController',
    action: 'shopHeader'
  },  // 微信公众号店铺栏目productCategory
  'get /cmall/store/column': {
    controller: 'CmallShopController',
    action: 'storeColumn'
  },
  // 微信公众号店铺商品分类
  'get /cmall/store/product/category': {
    controller: 'CmallShopController',
    action: 'productCategory'
  },
  // 微信公众号店铺商品分类更多产品
  'get /cmall/productCategory/product/more': {
    controller: 'CmallShopController',
    action: 'productMore'
  },
  // 微信公众号店铺商品详情shopProducts
  'get /cmall/product/details': {
    controller: 'CmallShopController',
    action: 'productDetails'
  },
  // 微信公众号店铺商品详情
  'get /cmall/shop/product/show': {
    controller: 'CmallShopController',
    action: 'shopProducts'
  },
  // 微信公众号店铺获取商品信息
  'get /cmall/purchase/product/infos': {
    controller: 'CmallShopController',
    action: 'getProductsInfo'
  },
  // 微信公众号店铺确认订单
  'post /cmall/purchase/order/confirm': {
    controller: 'CmallShopController',
    action: 'confirmOrder'
  },
  '/': {
    controller: 'WechatOauthController',
    action: 'oauthRedirect'
  },
  'get /wechat/center': {
    controller: 'WechatOauthController',
    action: 'oauthUser'
  },
  'get /wechat/center/myMerchants/list': {
    controller: 'WechatCenterController',
    action: 'myMerchants'
  },
  // 微信公众号店铺确认支付
  'get /cmall/purchase/order/pay': {
    controller: 'CmallOrderController',
    action: 'payOrder'
  },
  // 微信公众号店铺查询支付结果
  'get /cmall/purchase/order/pay/query': {
    controller: 'CmallOrderController',
    action: 'queryPayResult'
  },
  // 微信公众号店铺接收微信服务器支付结果通知接口
  'post /wechat/cmall/order/pay/notify': {
    controller: 'CmallOrderController',
    action: 'wechatNofify'
  },
  // 微信公众号店铺支付前端Config参数
  'get /cmall/purchase/order/config': {
    controller: 'CmallOrderController',
    action: 'configParm'
  },
  // 微信公众号店铺收藏微商
  'post /cmall/purchase/favorite/shop': {
    controller: 'CmallShopController',
    action: 'favoriteShop'
  },
  'get /alipay/batchTransNotify':{
    view:'batch_trans_notify'
  }
  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

};
