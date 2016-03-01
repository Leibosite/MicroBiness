/**
 * 微信公众号Store业务逻辑
 * Created by tommy on 15/9/2.
 */
var ObjectUtil = require("../StoreInformationService");
var ObjectUtil = require("../../util/ObjectUtil");
var ResponseUtil = require("../../util/ResponseUtil");
var DataFilter = require("../../util/DataFilter");
var FileUtil = require("../../util/FileUtil");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var ProductService = require('../ProductService');
module.exports = {

  //Store Home
  /**
   * Store Home页
   * @param openId
   * @param res
   */
  home: function (openId, page, res) {

    StoreColumn.findOne({priority: 0}).then(function (storeColumn) {
      var temp = {};
      temp.store_column_id = storeColumn.id;
      temp.store_column_name = storeColumn.name;
      return temp;
    }).then(function (temp) {

      var pageNumber=3;

      //Product.find({where:{storeColumn: temp.store_column_id},skip: (page - 1) * pageNumber, limit: pageNumber}).populate("productImages").then(function (products) {

        Product.find({where:{storeColumn: temp.store_column_id}, limit: 4}).populate("productImages").then(function (products) {
          sails.log.info("StoreService.home products");
          sails.log.info(products);
        var data = ObjectUtil.cloneAttributes(products);

        data = DataFilter.productArrayFilter(data);
        temp.products = data;
        ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, temp);

        return res.json(temp);

        return temp;
      })

    }).catch(function (err) {

      sails.log.error(err);
    });
  },
  /**
   * @param openId
   * @param data
   * @param res
   */
  productCategory: function (openId, page, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (page === null || page === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));


    //Order.find({where:{status:statusJump,storeInformation:store_information_id,order_type:1},skip:(page-1)*pageNumber,limit:pageNumber})
    //  .sort("createdAt DESC")
    var pageNumber = 3;
    //ProductCategory.find({skip: (page - 1) * pageNumber, limit: pageNumber}).populate('products').exec( function (err, categories) {
    //ProductCategory.find({where:{products:{not :{size:0}}},skip: (page - 1) * pageNumber, limit: pageNumber}, function (err, categories) {
    ProductCategory.find({skip: (page - 1) * pageNumber, limit: pageNumber}, function (err, categories) {
      sails.log.error("----000000categories");
      sails.log.error(categories);
      if (!categories) {
        sails.log.error(categories);
        res.json(ResponseUtil.addErrorMessage());
      }
      var categoryIDs = [];
      for (var i in  categories) {
        var category = categories[i];
        categoryIDs[i] = category.id;
      }

      var categoriesClone = ObjectUtil.cloneAttributes(categories);

      var categoriesFilter = DataFilter.productCategoryArrayFilter(categoriesClone);
      //TODO:
      categoriesFilter = ObjectUtil.cloneAttributes(categoriesFilter);
      this.categoriesFilter = categoriesFilter;
      //var categoryIDs = param.product_category_ids;

      var categoryIDMap = {};
      for (var i in  categoryIDs) {
        var categoryID = categoryIDs[i];
        categoryIDMap["" + categoryID] = i;
      }

      Promise.map(categoryIDs, function (category_id) {
        return Product.find({productCategory: category_id}).then(function (products) {
          //sails.log.info("-------products");
          //sails.log.info(products);
          return products;

        }).then(function (products) {

          var productIDs = [];
          for (var i in  products) {
            productIDs.push(products[i].id);
          }
          //sails.log.info("-------productIDs");
          //sails.log.info(productIDs);
          return Product.find({id: productIDs}).sort("id DESC").populate("productImages").then(function (products) {

            var data = ObjectUtil.cloneAttributes(products);

            data = DataFilter.productArrayFilter(data);
            var showProducts = [];
            var dataLength;
            if (2 <= data.length) {
              dataLength = 2;
            } else {
              dataLength = data.length;
            }

            for (var n = 0; n < dataLength; n++) {
              sails.log.info(data[n]);
              showProducts.push(data[n]);
            }

            var index = categoryIDMap["" + category_id];

            categoriesFilter[index].products = showProducts;
            return data;
          })

        })


      }).then(function (products) {

        var responseData = ResponseUtil.addSuccessMessage();
        var storeInfo = {};
        sails.log.info("-------10003 this.categoriesFilter");
        sails.log.info(categoriesFilter);
        storeInfo.product_categories = categoriesFilter;
        responseData.store_information = storeInfo;
        return res.json(responseData);
      }).catch(function (err) {
        sails.log.error(err);
      });


    })
  },
  /**
   * 微信公众号商品更多信息，传入参数商品分类ID
   * @param openId
   * @param categoryId
   * @param page
   * @param limit
   * @param res
   */
  productMore: function (openId, product_category_id, page, limit, res) {
    if (openId === null || openId === undefined || openId === "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (product_category_id === null || product_category_id === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_category_id.code, ResultCode.miss_product_category_id.msg));
    else if (page === null || page === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    if (limit === undefined)
      limit = 6;
    Product.find({productCategory: product_category_id}).populate('productImages')
      .then(function (products) {
        if (!products)
          return res.json(ResponseUtil.addErrorMessage());
        return products;
      }).then(function (products) {
        // 过滤Products
        var productsClone = ObjectUtil.cloneAttributes(products);
        products = DataFilter.storeProductArrayFilter(productsClone);
        // 过滤Product
        sails.log.info("productMore()---product");
        sails.log.info(products);
        var product_category = {};
        product_category.id = product_category_id;
        product_category.products = products;
        return product_category;
      }).then(function (product_category) {
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.product_category = product_category;
        return res.json(responseData);

      }).catch(function (err) {
        sails.log.error(err);
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
  },

  /**
   * 微信公众号商品详情
   * @param openId
   * @param product_id
   * @param res
   */
  productDetails: function (openId, product_id, res) {
    if (openId === null || openId === undefined || openId === "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (product_id === null || product_id === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_id.code, ResultCode.miss_product_id.msg));

    Product.findOne({id: product_id}).populate('productImages')
      .then(function (product) {
        if (!product)
          return res.json(ResponseUtil.addErrorMessage());
        return product;
      }).then(function (product) {
        // 过滤Product
        sails.log.info("productDetails()---product");
        sails.log.info(product);
        var product = ObjectUtil.cloneAttributes(product);
        // 过滤商品详情
        product = DataFilter.productDetailsFilter(product);

        return product;
      }).then(function (product) {
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.product = product;
        return res.json(responseData);

      }).catch(function (err) {
        sails.log.error(err);
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
  },
  /**
   * 推荐微商
   * @param openId
   * @param product_id
   * @param res
   */
  microbusiness: function (openId, product_id, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!product_id)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_id.code, ResultCode.miss_product_id.msg));
    // 开始处理业务逻辑
    // 4为审核通过
    Role.findOne({name: ["partner","copartner"]}).populate("users", {apply_status: 4}).then(function (role) {
      var users = ObjectUtil.cloneAttributes(role.users);
      return users;
    }).then(function (users) {
      sails.log.info("microbusiness-----users");
      sails.log.info(users);

      for (var i in users) {
        var user = users[i];
        for (var j in user) {
          var attr = j.toString();
          if (attr == "id" || attr == "real_name" || attr == "area" || attr == "head_image" || attr == "wechat_account" || attr == "storeInformation") {
            continue;
          }
          delete  user[j];
        }
        user.head_image = sails.config.imageHostUrl + user.head_image;
      }

      var m = 0;
      Promise.map(users, function (user) {
        return Area.findOne({id: user.area}).then(function (area) {
          if (area) {
            users[m].area = area.name;
          } else {
            users[m].area = "";
          }
          m++;
          return area;
        });
      }).then(function () {
        users.store_information_id = users.storeInformation;
        delete users.storeInformation;
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.micro_business = users;
        return res.json(responseData);

      })
        .catch(function (err) {
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        });


    }).catch(function (err) {
      if (err) {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    })
  },


}
