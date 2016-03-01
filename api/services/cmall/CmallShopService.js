/**
 * 谷雨商城业务实现
 * Created by tommy on 15/9/7.
 */
var ObjectUtil = require("../../util/ObjectUtil");
var ResponseUtil = require("../../util/ResponseUtil");
var DataFilter = require("../../util/DataFilter");
var FileUtil = require("../../util/FileUtil");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var ProductService = require('../ProductService');
var Api = require('wechat-api');
var api = new Api(sails.config.wechatAppId, sails.config.wechatSecret);
var cmallCommonService = require('./CmallCommonService');
/**
 * 生成订单编号
 * 订单号 user_id + 时间戳 + 四位随机数
 * @param value
 * @returns {string}
 */
var createOrderNumber = function (value) {

  return value + "00" + new Date().getTime() + Math.floor(Math.random() * 10000);
};
module.exports = {

  /**
   * 商城店铺头部
   * @param openId
   * @param page
   * @param res
   */
  shopHeader: function (openId, store_information_id, res) {
    sails.log.info("store_information_id");
    sails.log.info(store_information_id);
    // Req中没有携带store_information_id
    if (!store_information_id)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (store_information_id == "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!openId || openId == '?' || openId == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    StoreInformation.findOne({id: store_information_id}).then(function (store_info) {
      // store_information_id数据库中不存在
      if (!store_info) {
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.store_information_id_not_exist.code, ResultCode.store_information_id_not_exist.msg));
        throw new Error("store_information_id_not_exist");
      }
      var data = DataFilter.storeBaseInfoFilter(store_info);
      if (data.head_image != null || data.head_image != '')
        data.head_image = sails.config.imageHostUrl + data.head_image;
      if (data.background_image != null || data.background_image != '')
        data.background_image = sails.config.imageHostUrl + data.background_image;
      data.is_favorite = 0;
      UserFavorite.findOne({open_id: openId}, function (err, result) {
        sails.log.info(result);
        if (result != null && result != undefined && result.length >= 1)
          data.is_favorite = 1;
      })

      return data;

    }).then(function (data) {
      var result = {};
      ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, result);
      result.store_information = data;
      return res.json(result);

    }).catch(function (err) {
      sails.log.error(err);
      var responseData = ResponseUtil.addSuccessMessage();
      return res.json(responseData);

    });
  },
  /**
   * 店铺栏目
   * @param openId
   * @param store_information_id
   * @param res
   * @returns {*}
   */
  storeColumn: function (openId, store_information_id, res) {
    if (!store_information_id || store_information_id === "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));

    StoreCategory.find({storeInformation: store_information_id}).populate("storeProductManages").then(function (storeCategories) {
      sails.log.info(storeCategories);
      if (!storeCategories || storeCategories.length === 0) {
        // 店铺不存在
        sails.log.info("-----------------------method---{storeColumn()}---storeCategories is@--{店铺分类不存在}");
        throw new Error(ResultCode.shop_column_not_exist.code);

      }
      else {
        var category = storeCategories[0];
        var temp = {};
        temp.store_column_id = category.id;
        temp.store_column_name = category.name;
        sails.log.info("-----------------------method---{storeColumn()}---storeCategories is@--{category}");
        sails.log.info(category);
        return temp;
      }


    }).then(function (temp) {
      var products = [];

      StoreProductManage.find({storeCategory: temp.store_column_id,storeInformation: store_information_id, is_selling: 1}).then(function (storeProductManages) {
        sails.log.info("-----------------------method---{storeColumn()}---storeCategories is@--{storeProductManages}");
        sails.log.info(storeProductManages);
        if (storeProductManages == null || storeProductManages.length === 0)
          throw new Error(ResultCode.shop_column_do_not_contain_any_products.code);
        var storeProductManageIds = [];
        var storeProductMap = {};
        for (var j in storeProductManages) {

          storeProductManageIds.push(storeProductManages[j].id);
          storeProductMap["" + storeProductManages[j].id] = storeProductManages[j];
        }
        sails.log.info("-----------------------method---{storeColumn()}---storeProductManageIds is@--{storeProductManageIds}");
        sails.log.info(storeProductManageIds);
        return Promise.map(storeProductManageIds, function (storeProductId) {
          sails.log.info("-----------------------method---{storeColumn()}--- Promise.map--- is@--{storeProductId}");
          sails.log.info(storeProductId);
          sails.log.info("storeProductMap");
          sails.log.info(storeProductMap);
          sails.log.info("storeProductMap[storeProductId]");
          sails.log.info(storeProductMap[storeProductId]);
          sails.log.info(storeProductMap[storeProductId].product);

          return Product.findOne({id: storeProductMap[storeProductId].product}).sort("id DESC").populate("productImages").then(function (product) {

            sails.log.info("product from database");
            sails.log.info(product);
            if (product !== null && product != undefined) {
              sails.log.info("product");
              sails.log.info(product);
              var productClone = ObjectUtil.cloneAttributes(product);
              productClone.id = storeProductMap[storeProductId].id;
              sails.log.info("push product into map");
              sails.log.info(productClone);
              products.push(productClone);
              sails.log.info("----00001-------------products length");
              sails.log.info(products.length);

            }
            else
              throw new Error(ResultCode.shop_product_do_not_exist.code);

          });
          sails.log.info("----00002-------------products length");
          sails.log.info(products.length);
          sails.log.debug("products");
          sails.log.debug(products);

        }).then(function (a) {
          sails.log.info("-------------0000002------^-^products");
          sails.log.debug(products);
          sails.log.debug(products.length);
          var data = DataFilter.productArrayFilter(products);
          temp.products = data;
          sails.log.debug("temp");
          sails.log.debug(temp);
          ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, temp);
          return res.json(temp);
        })
      }).catch(function (err) {
        // 捕获异常各种情况的异常
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());

      });
    }).catch(function (err) {
      sails.log.info(err);
      sails.log.error('err.name ' + err.name);
      sails.log.error('err.message ' + err.message);
      sails.log.error('err.code ' + err.code);
      sails.log.info(err.message == ResultCode.shop_column_not_exist.code);
      if (err.message == ResultCode.shop_column_not_exist.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_column_not_exist.code, ResultCode.shop_column_not_exist.msg));
      else if (err.message == ResultCode.shop_column_do_not_contain_any_products.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_column_do_not_contain_any_products.code, ResultCode.shop_column_do_not_contain_any_products.msg));
      else if (err.message == ResultCode.shop_product_do_not_exist.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_product_do_not_exist.code, ResultCode.shop_product_do_not_exist.msg));
    });
  },

  /**
   * 商城店铺的商品分类
   * @param openId
   * @param data
   * @param res
   */
  productCategory: function (oepnId, store_information_id, page, res) {
    sails.log.info("--------------{start}--|Function:productCategory()|------------");
    if (!store_information_id || store_information_id == "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!page)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    else if (!oepnId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    sails.log.debug("--------------[db-start]-[StoreProductManage]-{StoreProductManage.find({storeInformation: store_information_id}).then(function (storeProductManages) }------------" + "storeInformation is: " + "{" + store_information_id + "}");
    var start = (page - 1) * 3;
    var querySql = "select distinct product_category_id from store_product_manage where storeInformation=" + store_information_id + " limit " + start + ",3";
    sails.log.info(querySql);
    StoreProductManage.query(querySql, function (err, psm) {
      try {
        if (err) {
          sails.log.error(err);
          throw new Error(ResultCode.query_database_error.code);
          //todo:
        }
        if (!psm || psm.length === 0){
          sails.log.info("------------[bs]--page:"+page+"no data---------{该分页无数据}---------------------");
          throw new Error(ResultCode.no_next_page.code);
        }

        sails.log.info(psm);
        var productCategoryIds = [];
        var categoryIDMap = {};
        for (var j in psm) {

          var categoryId = psm[j].product_category_id;
          productCategoryIds.push(categoryId);
          categoryIDMap["" + categoryId] = categoryId;
        }
        sails.log.debug("---------@@-----[db-start]-[ProductCategory]---------------------");
        var pageNumber = 2;


        ProductCategory.find({id: productCategoryIds}).then(function (productCategorys) {

          for (var j in productCategorys) {

            categoryIDMap["" + productCategorys[j].id] = productCategorys[j];
          }
          var result = {};
          ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, result);
          var store_information = {};
          store_information.product_categories = [];
          Promise.map(productCategoryIds, function (category_id) {

            return StoreProductManage.find({
              where: {product_category_id: category_id, storeInformation: store_information_id},
              skip: (page - 1) * pageNumber,
              limit: pageNumber,
              sort: 'product DESC'
            }).then(function (storeProductManages) {
              sails.log.info("@@---storeProductManages");
              sails.log.info(storeProductManages);
              sails.log.info(categoryIDMap[category_id]);
              if (storeProductManages === null || storeProductManages === undefined || storeProductManages.length === 0)
                throw new Error(ResultCode.shop_product_category_do_not_exist.code);

              return cmallCommonService.getProduct(storeProductManages).then(function (products) {
                if (err)
                  sails.log.error(err);
                sails.log.info("@@-^-^--products");
                sails.log.info(products);
                var product_category = {};
                product_category.id = category_id;
                product_category.name = categoryIDMap[category_id].name;
                product_category.products = products;
                store_information.product_categories.push(product_category);
                sails.log.info("----@-111---store_information");
                sails.log.info(store_information);
              });
            });
          }).then(function () {
            sails.log.info("----@-333---store_information");
            sails.log.info(store_information);
            result.store_information = store_information;
            res.json(result);

          });
        });
      } catch (err) {
        sails.log.info("information");
        sails.log.error(err);
        if (err.message == ResultCode.no_next_page.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.no_next_page.code, ResultCode.no_next_page.msg));
        else if (err.message == ResultCode.query_database_error.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.query_database_error.code, ResultCode.query_database_error.msg));
        var responseData = ResponseUtil.addErrorMessage();
        return res.json(responseData);

      }
    });


  },
  /**
   * 店铺商品分类下更多产品
   * @param openId
   * @param product_category_id
   * @param store_information_id
   * @param page
   * @param limit
   * @param res
   */
  productMore: function (openId, product_category_id, store_information_id, page, limit, res) {

    if (!openId || openId === "" || openId === "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!product_category_id || product_category_id === "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_category_id.code, ResultCode.miss_product_category_id.msg));
    else if (!store_information_id || store_information_id === "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!page || page === "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    if (limit === undefined)
      limit = 6;
    StoreProductManage.find({
      where: {storeInformation: store_information_id, is_selling: 1, product_category_id: product_category_id},
      skip: (page - 1) * limit,
      limit: limit,
      sort: 'id ASC'
    }).then(function (ps) {

      if (!ps || ps.length == 0) {

        //throw new Error("数据库中无数据");
        //TODO:抛出异常
        return res.json(ResponseUtil.addErrorMessage());
      }

      return cmallCommonService.getProduct(ps).then(function (products) {
        var product_category = {};
        product_category.id = product_category_id;
        product_category.products = products;
        return product_category;
      }).then(function (product_category) {

        var responseData = ResponseUtil.addSuccessMessage();
        responseData.product_category = product_category;
        return res.json(responseData);

      });

    });
  },

  /**
   * 微信店铺商品详情
   * @param openId
   * @param product_id
   * @param store_information_id
   * @param res
   * @returns {*}
   */
  productDetails: function (openId, product_id, store_information_id, res) {
    sails.log.info("--------------{start}--|Function:productDetails()|------------");
    sails.log.debug("--------------{start}-[bs]-|check url parameters|------------");
    if (!openId || openId === "") {
      sails.log.debug("--------------miss openId--(请求中无openId,请检查)------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    }

    else if (!product_id || product_id === "?") {
      sails.log.debug("--------------miss productId--(productId,请检查)------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_id.code, ResultCode.miss_product_id.msg));
    }

    sails.log.info("--------------{start}-[db]-|StoreProductManage-{find by product_id}|------------");
    StoreProductManage.findOne({id: product_id}).then(function (storeProductManage) {
      sails.log.info("--------------{end}-[db]-|StoreProductManage-{find by product_id}|------------");
      if (!storeProductManage) {
        sails.log.info("--------------[bs]-storeProductManage--{获取到的storeProductManage为空，抛出异常shop_commodity_already_shelve}------------");
        throw new Error(ResultCode.shop_commodity_already_shelve.code);
      }

      Product.findOne({id: storeProductManage.product}).populate('productImages')
        .then(function (product) {
          if (!product) {
            sails.log.info("--------------[bs]-product not exist--{产品不存在}--product id is:--" + storeProductManage.product);
            throw new Error(ResultCode.cmall_product_not_exist.code);
          }

          // 过滤Product
          sails.log.info("productDetails()---product");
          sails.log.info(product);
          var product = ObjectUtil.cloneAttributes(product);
          // 过滤商品详情
          product = DataFilter.productDetailsFilter(product);
          var responseData = ResponseUtil.addSuccessMessage();
          responseData.product = product;
          return res.json(responseData);

        }).catch(function (err) {
          if (err.message == ResultCode.shop_commodity_already_shelve.code)
            return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_commodity_already_shelve.code, ResultCode.shop_commodity_already_shelve.msg));
          else if (err.message == ResultCode.cmall_product_not_exist.code)
            return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_product_not_exist.code, ResultCode.cmall_product_not_exist.msg));
          var responseData = ResponseUtil.addErrorMessage();
          return res.json(responseData);
        });
    }).catch(function (err) {

      if (err.message == ResultCode.shop_commodity_already_shelve.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_commodity_already_shelve.code, ResultCode.shop_commodity_already_shelve.msg));
      else if (err.message == ResultCode.cmall_product_not_exist.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_product_not_exist.code, ResultCode.cmall_product_not_exist.msg));
      var responseData = ResponseUtil.addErrorMessage();
      return res.json(responseData);

    });
  },
  /**
   *
   * @param openId
   * @param product_id
   * @param store_information_id
   * @param res
   * @returns {*}
   */
  shopProductsShow: function (openId, product_id, store_information_id, res) {
    sails.log.info("--------------{start}--|Function:shopProductsShow()|------------");
    sails.log.info("--------------[bs]---{product_id}-|产品ID|------------");
    sails.log.info(product_id);
    sails.log.info("--------------[bs]---{store_information_id}-|店铺ID|------------");
    sails.log.info(store_information_id);
    if (!openId || openId === "") {
      sails.log.debug("--------------miss openId--(请求中无openId,请检查)------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    }
    else if (!store_information_id || store_information_id == '?' || store_information_id == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!product_id || product_id == '?' || product_id == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_id.code, ResultCode.miss_product_id.msg));
    // 开始处理业务逻辑
    StoreProductManage.find({
      storeInformation: store_information_id,
      product: product_id,
      is_selling: 1
    }).then(function (storeProductManages) {
      sails.log.info(storeProductManages);
      if (!storeProductManages) {
        sails.log.info("--------------[bs]-storeProductManage--{获取到的storeProductManage为空，抛出异常shop_commodity_already_shelve}------------");
        throw new Error(ResultCode.shop_commodity_already_shelve.code);
      }
      return cmallCommonService.getProduct(storeProductManages);

    }).then(function (products) {
      if (products.length === 0)
        throw new Error(ResultCode.shop_commodity_already_shelve.code);

      else {
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.products = products;
        return res.json(responseData);
      }

    }).catch(function (err) {

      if (err.message == ResultCode.shop_commodity_already_shelve.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_commodity_already_shelve.code, ResultCode.shop_commodity_already_shelve.msg));

      var responseData = ResponseUtil.addErrorMessage();
      return res.json(responseData);
    });
  },
  /**
   *
   * @param openId
   * @param product_ids
   * @param store_information_id
   * @param res
   * @returns {*}
   */
  getProductsInfo: function (openId, product_ids, store_information_id, res) {
    sails.log.info("--------------{start}--|Function:getProductsInfo()|------------");
    if (!openId || openId === "") {
      sails.log.debug("--------------miss openId--(请求中无openId,请检查)------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    }
    else if (!store_information_id || store_information_id == '?' || store_information_id == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!product_ids || product_ids == '?' || product_ids == '' || product_ids.length == 0)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_ids.code, ResultCode.miss_product_ids.msg));
    // 开始处理业务逻辑
    try {
      product_ids = JSON.parse(product_ids);
      if (!product_ids || product_ids.length === 0)
        throw new Error(ResultCode.cmall_productIds_is_null.code);
      var productArray = [];
      StoreProductManage.find({
        id: product_ids, storeInformation: store_information_id, is_selling: 1
      }).then(function (storeProductManages) {

        if (!storeProductManages) {
          sails.log.info("--------------[bs]-storeProductManage--{获取到的storeProductManage为空，抛出异常shop_commodity_already_shelve}------------");
          throw new Error(ResultCode.shop_commodity_already_shelve.code);
        }
        return cmallCommonService.getProduct(storeProductManages);

      }).then(function (productArray) {

        if (!productArray || productArray.length == 0) {
          sails.log.info("--------------[bs]-productArray--{获取到的productArray为空，抛出异常product_off_the_shelf}------------");
          throw new Error(ResultCode.product_off_the_shelf.code);
        }
        else {
          var responseData = ResponseUtil.addSuccessMessage();
          responseData.products = productArray;
          sails.log.info("--------------[bs]-responseData--{数据为}------------");
          sails.log.info(JSON.stringify(responseData));
          return res.json(responseData);
        }
      }).catch(function (err) {
        sails.log.error(err);
        if (err.message == ResultCode.shop_commodity_already_shelve.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.shop_commodity_already_shelve.code, ResultCode.shop_commodity_already_shelve.msg));
        else if (err.message == ResultCode.product_off_the_shelf.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.product_off_the_shelf.code, ResultCode.product_off_the_shelf.msg));
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
    } catch (err) {
      if (err.message == ResultCode.cmall_productIds_is_null.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_productIds_is_null.code, ResultCode.cmall_productIds_is_null.msg));
      sails.log.info("--------------invalid product_ids,--(解析Json数据product_ids错误，请检查)------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_json_data.code, ResultCode.invalid_json_data.msg));

    }
  },
  /**
   * 购物车确认订单接口
   * 1.验证店铺中库存是否有货
   * 2.生成发货订单
   * 3.生成支付订单给前端
   * @param openId
   * @param order_info
   * @param store_information_id
   * @param res
   */
  confirmOrder: function (openId, order_info, store_information_id, res) {
    sails.log.info("--------------{start}--|Function:confirmOrder()|------------");
    sails.log.info("--------------[bs]--|parameters of req are:|------------");
    sails.log.info("--------------[bs]--|openId is:|------------" + openId);
    sails.log.info("--------------[bs]--|order_info is:|------------" + JSON.stringify(order_info));
    sails.log.info("--------------[bs]--|store_information_id is:|------------" + store_information_id);
    if (!store_information_id || store_information_id == '?' || store_information_id == '') {
      sails.log.info("--------------[bs]--|miss store_information_id in req,please check:|--{Req中缺少参数store_information_id,请检查！}------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    }

    else if (!order_info || order_info === '?' || order_info === '') {
      sails.log.info("--------------[bs]--|miss order_info in req,please check:|--{order_info,请检查！}------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_order_information.code, ResultCode.miss_order_information.msg));
    }

    else if (!openId || openId == '?' || openId == '') {

      sails.log.info("--------------[bs]--|miss openId in req,please check:|--{openId,请检查！}------------");
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    }
    // 开始解析请求中携带的orderInfo
    try {
      var orderInfo = JSON.parse(order_info);
      if (!orderInfo || !orderInfo.address_id || !orderInfo.productions || orderInfo.productions.length === 0) {
        sails.log.info("--------------[parameters of orderInfo is invalid,please check|--{order_info信息非法,请检查！}------------");
        throw new Error(ResultCode.cmall_invalid_order_info.code);
      }
      // 业务逻辑处理:先生成订单，再生成支付订单
      var commodityMaps = {};
      var commodityIds = [];

      for (var j in orderInfo.productions) {
        var pId = orderInfo.productions[j].id;
        commodityMaps["" + pId] = orderInfo.productions[j];
        commodityIds.push(orderInfo.productions[j].id);

      }
      // 预处理商品信息
      var temp;
      cmallCommonService.preHandleCommodity(commodityIds, commodityMaps).then(function (tmp) {
        temp = tmp;
        if (tmp.flag === 1) {
          // 下单失败部分商品缺货
          sails.log.info("--------------[cmall generate order fail,commodity out of stock|--{下单失败，部分商品缺货！}------------");
          throw new Error(ResultCode.cmall_generate_order_fail_commodity_out_of_stock.code);
        }
        // 开始生成订单和支付订单

        return User.findOne({storeInformation: store_information_id}).then(function (handUser) {
          if (!handUser) {

            sails.log.info("--------------[cmall store keeper not exist|--{店主不存在！}------------");
            throw new Error(ResultCode.cmall_store_keeper_not_exist.code);

          }
          else if (handUser.status === 1) {

            sails.log.info("--------------[cmall store keeper in blacklist|--{店主已被商城加入黑名单，禁止买卖！}------------");
            throw new Error(ResultCode.cmall_store_keeper_in_blacklist.code);
          }


          return User.findOne({open_id: openId}).then(function (user) {

            if (!user) {

              sails.log.info("--------------[cmall store user not exist|--{用户不存在！}------------");
              throw new Error(ResultCode.unknown_user.code);

            }
            if ((!tmp.weProducts || tmp.weProducts.length === 0) && (!tmp.guProducts || tmp.guProducts.length === 0))
              throw new Error(ResultCode.cmall_store_commodity_not_available.code);

            return Promise.all([cmallCommonService.generateOder(tmp.weProducts, handUser, user, store_information_id,
              orderInfo.address_id), cmallCommonService.generateOder(tmp.guProducts, handUser, user, store_information_id, orderInfo.address_id)])
              .spread(function (weOrder, guOrder) {
                sails.log.info("--------------[cmall store generate order|--{生成订单！}------------");
                sails.log.info("--------------[cmall weProducts|--{微商发货订单！}------------");
                sails.log.info(JSON.stringify(weOrder));
                sails.log.info("--------------[cmall guProducts|--{谷雨发货订单！}------------");
                sails.log.info(JSON.stringify(guOrder));
                if (weOrder === "-1" && guOrder === "-1")
                  throw new Error(ResultCode.cmall_generate_order_fail.code);
                var orders = [];
                if (weOrder != "-1")
                  orders.push(weOrder);
                else if (guOrder != "-1")
                  orders.push(guOrder);
                if (orders.length != 0)
                  return cmallCommonService.generatePayOrder(orders, handUser, user, store_information_id);
                else
                  return "-1";
              }).then(function (payOrder) {
                sails.log.info("-----------[bs]-------{payOrder}-------|生成的支付订单为|----------------");
                sails.log.info(JSON.stringify(payOrder));
                if (!payOrder || payOrder === "-1")
                  throw new Error(ResultCode.cmall_generate_order_fail.code);
                var result = {};
                ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, result);
                result.order_number = payOrder.order_number;
                sails.log.info("-----------[bs]-------{api-res}-------|返回API结果为|----------------");
                sails.log.info(JSON.stringify(result));
                return res.json(result);
              });
          });
        });
      }).catch(function (err) {
        sails.log.info("-----1");
        sails.log.error(err);
        if (err.message === ResultCode.cmall_generate_order_fail_commodity_out_of_stock.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_generate_order_fail_commodity_out_of_stock.code, ResultCode.cmall_generate_order_fail_commodity_out_of_stock.msg));
        else if (err.message === ResultCode.cmall_store_commodity_not_available.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_store_commodity_not_available.code, ResultCode.cmall_store_commodity_not_available.msg));
        else if (err.message === ResultCode.cmall_generate_order_fail.code)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_generate_order_fail.code, ResultCode.cmall_generate_order_fail.msg));
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_store_commodity_not_available.code, ResultCode.cmall_store_commodity_not_available.msg));
      });

    } catch (err) {
      sails.log.info("--------------invalid product_ids,--(解析Json数据product_ids错误，请检查)------------");
      sails.log.error(err);
      if (err.message === ResultCode.cmall_invalid_order_info.code)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_invalid_order_info.code, ResultCode.cmall_invalid_order_info.msg));

      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.cmall_generate_order_fail.code, ResultCode.cmall_generate_order_fail.msg));
    }
  },
  /**
   * 店铺收藏微商接口
   * @param openId
   * @param store_information_id
   * @param res
   */
  favoriteShop: function (openId, store_information_id, type, res) {
    if (!store_information_id || store_information_id == '?' || store_information_id == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_store_information_id.code, ResultCode.miss_store_information_id.msg));
    else if (!openId || openId == '?' || openId == '')
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!type)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_faverate_type.code, ResultCode.miss_faverate_type.msg));
    User.findOne({open_id: openId}).then(function (user) {
      if (!user) {
        throw new Error(ResultCode.unknown_user.msg);
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.unknown_user.code, ResultCode.unknown_user.msg));

      }

      return user;

    }).then(function (user) {
      User.findOne({storeInformation: store_information_id}).then(function (seller) {
        if (!seller) {

          throw new Error(ResultCode.miss_shop_seller.msg);

        }
        //用户关注请求，先判断用户是否已经关注过该店铺
        if (type === 1) {
          var querySql = 'select * from user_favorite where user_id=' + user.id + ' and favorite_user_id =' + seller.id;
          sails.log.info(querySql);
          UserFavorite.query(querySql, function (err, queryFavorites) {
            if (err) {
              sails.log.info("--------------00001---查询用户收藏信息失败：---{--err--}");
              sails.log.error(err);
              var responseData = {};
              ResponseUtil.addMessageAndResultCode(ResultCode.faverate_seller_fail.code, ResultCode.faverate_seller_fail.msg, responseData);
              responseData.favorite_flag = 0;
              return res.json(responseData);

            }

            if (queryFavorites.length > 0) {

              sails.log.info("--------------00001---用户已经收藏该店铺请不要重复提交：---{--queryFavorites--}");
              sails.log.info(queryFavorites);
              var responseData = {};
              ResponseUtil.addMessageAndResultCode(ResultCode.user_already_faverate_shop.code, ResultCode.user_already_faverate_shop.msg, responseData);
              responseData.favorite_flag = 1;
              return res.json(responseData);
            }

            UserFavorite.create({
              user_id: user.id,
              favorite_user_id: seller.id,
              status: 0,
              favorite_store_id: store_information_id,
              open_id: openId
            }).exec(function (err, userFavorite) {

              sails.log.info("--------------00001---创建的用户收藏信息为：---{--userFavorite--}");
              sails.log.info(userFavorite);
              var responseData = ResponseUtil.addSuccessMessage();
              responseData.favorite_flag = 1;
              return res.json(responseData);
            });

          })

        }
        else if (type == 0) {
          var deleteSql = 'delete from user_favorite where user_id=' + user.id + ' and favorite_user_id=' + seller.id;
          UserFavorite.query(deleteSql, function (err, deleteUserFavorite) {
            if (err) {
              sails.log.info("--------------00001---删除的收藏信息失败：---{--err--}");
              sails.log.error(err);
              var responseData = {};
              ResponseUtil.addMessageAndResultCode(ResultCode.faverate_seller_fail.code, ResultCode.faverate_seller_fail.msg, responseData);
              responseData.favorite_flag = 0;
              return res.json(responseData);

            }
            if (!deleteUserFavorite.affectedRows && deleteUserFavorite.affectedRows > 0) {
              sails.log.info("--------------00001---成功删除的收藏信息为：---{--deleteUserFavorite--}");
              sails.log.info(deleteUserFavorite);
              var responseData = ResponseUtil.addSuccessMessage();
              responseData.favorite_flag = 0;
              return res.json(responseData);
            }
            else {
              sails.log.info("--------------00001---失败删除的收藏信息为：---{--deleteUserFavorite--}");
              sails.log.info(deleteUserFavorite);
              var responseData = {};
              ResponseUtil.addMessageAndResultCode(ResultCode.cancel_faverate_fail.code, ResultCode.cancel_faverate_fail.msg, responseData);
              responseData.favorite_flag = 0;
              return res.json(responseData);

            }

          });
        }

      }).catch(function (err) {
        sails.log.error(err);
        var responseData = {};
        ResponseUtil.addMessageAndResultCode(ResultCode.faverate_seller_fail.code, ResultCode.faverate_seller_fail.msg, responseData);
        responseData.favorite_flag = 0;
        return res.json(responseData);
      });

    }).catch(function (err) {
      sails.log.error(err);
      var responseData = {};
      ResponseUtil.addMessageAndResultCode(ResultCode.faverate_seller_fail.code, ResultCode.faverate_seller_fail.msg, responseData);
      responseData.favorite_flag = 0;
      return res.json(responseData);
    });
  },

}
