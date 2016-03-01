/**
 * Created by leibosite on 2015/8/19.
 */
var PageUtil = require('../util/PageUtil');
var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require('../util/ObjectUtil');
var Promise = require('bluebird');

module.exports={

  /**
   *  店铺商品管理列表接口
   * @param page
   * @param storeInformation
   * @param type
   * @param res
   */
    allList: function (page, storeInformation,type,res) {

          if(!page || !storeInformation || !type){
            return res.json(ResponseUtil.addParamNotRight());
          }

          var pageNumber = PageUtil.pageNumber;

          StoreProductManage.find({
            where:{storeInformation:storeInformation,type:type},
            skip:(page-1)*pageNumber,
            limit:pageNumber,
            sort:'product ASC'
          }).populate('product')
            .then(function (storeProducts) {

              if(storeProducts.length == 0 || !storeProducts){
                throw new Error("STOREPRODUCTS_NULL");
              }
              // sails.log.info(products);
              this.storeProducts = ObjectUtil.cloneAttributes(storeProducts);
              // sails.log.info(this.products);
              for (var k in this.storeProducts) {

                var productInStore = this.storeProducts[k];

                for (var j in productInStore) {
                  var attr = j.toString();
                  if (attr == "id" || attr == "is_selling" ||
                    attr == "amount" || attr == "type" || attr == "product") {
                    continue;
                  }

                  delete productInStore[j];
                }

                var product = productInStore.product;
                for (var i in product) {
                  if (i.toString() == "id" || i.toString() == "name" ) {
                    continue;
                  }
                  delete product[i];
                }
              }

            }).then(function(){

              var n = 0;
              Promise.map(this.storeProducts,function(storeProduct){
                return ProductImage.findOne({product:storeProduct.product.id,priority:0}).then(function(productImage){

                  var product_image = null;
                  if(productImage){
                    product_image = ObjectUtil.cloneAttributes(productImage);
                  }

                  //sails.log.info(product_image);
                  var imageUrl = "";
                  for(var i in product_image){
                    var attr = i.toString();
                    if(attr == "id" || attr == "width"||attr =="height"){
                      continue;
                    }
                    if(attr == "image"){
                      imageUrl = sails.config.imageHostUrl + product_image[i];
                      product_image.image = imageUrl;
                      continue;
                    }
                    delete product_image[i];
                  }

                  this.storeProducts[n].product.product_image = product_image;
                  n++;
                });

              }).then(function(){
                var successData = ResponseUtil.addSuccessMessage();
                successData.store_products_manage = this.storeProducts;
                return res.json(successData);
              }).catch(function(err){

                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());

              });
            }).catch(function(err){
              if(err.message =="STOREPRODUCTS_NULL"){
                var successData = ResponseUtil.addSuccessMessage();
                successData.store_products_manage = [];
                sails.log.info("STOREPRODUCTS_NULL");
                return res.json(successData);
              }else{
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }
            });
    },

  /**
   * 仓库商品列表接口
   * @param page
   * @param storeInformation
   * @param res
   */
  isSellingList: function (page, storeInformation, res) {

    if(!page || !storeInformation){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var pageNumber = PageUtil.pageNumber;

    StoreProductManage.find({
      where: {storeInformation: storeInformation, is_selling: 1},
      skip: (page - 1) * pageNumber,
      limit: pageNumber,
      sort: 'id ASC'
    }).populate('product')
      .then(function (storeProducts) {

        if (!storeProducts || storeProducts.length == 0) {
          throw new Error("STORE_PRODUCT_MANAGE_NULL");
        }

        this.storeProducts = ObjectUtil.cloneAttributes(storeProducts);
        // sails.log.info(this.products);
        for (var k in this.storeProducts) {

          var productInStore = this.storeProducts[k];
          var is_exit = 1;

          for (var j in productInStore) {

            if (j.toString() == "id" || j.toString() == "is_selling" ||
              j.toString() == "amount" || j.toString() == "type" || j.toString() == "product") {
              continue;
            }

            if(j.toString() == "storeCategory" && productInStore[j] == null){
              is_exit = 0
            }

            delete productInStore[j];
          }

          productInStore.is_exist = is_exit;

          var product = null;
          if(productInStore.product){
            product = productInStore.product;
          }

          for (var i in product) {
            if (i.toString() == "id" || i.toString() == "name" || i.toString() == "selling_price") {
              continue;
            }
            delete product[i];
          }
        }

      }).then(function(){

        var n = 0;
        Promise.map(this.storeProducts,function(storeProduct){
          return ProductImage.findOne({product:storeProduct.product.id,priority:0}).then(function(productImage){
            var product_image = null;
            if(productImage){
              product_image = productImage;
            }
            var imageUrl = "";
            for(var i in product_image){
              var attr = i.toString();
              if(attr == "id" || attr == "width"||attr =="height"){
                continue;
              }
              if(attr == "image"){
                imageUrl = sails.config.imageHostUrl + product_image[i];

                product_image.image = imageUrl;
                continue;
              }
              delete product_image[i];
            }
            this.storeProducts[n].product.product_image = product_image;
            n++;
          });

        }).then(function(){
          var successData = ResponseUtil.addSuccessMessage();
          successData.store_products_manage = this.storeProducts;
          return res.json(successData);
        });
      }).catch(function(err){
        if(err.message =="STORE_PRODUCT_MANAGE_NULL"){
          var successData = ResponseUtil.addSuccessMessage();
          successData.store_products_manage = [];
          sails.log.error("STORE_PRODUCT_MANAGE_NULL");
          return res.json(successData);
        }else{
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
      });
  },

  /**
   * @description
   *  往栏目添加商品,这些商品是已经上架的商品，
   *  添加的意思是把storeCategory由空变为具体的栏目
   * @param json
   * @param res
   */
  add: function (json,res) {
    try{

      var jsonObj = JSON.parse(json);
      var storeProductIDs = jsonObj.store_product_ids;
      var store_information_id = jsonObj.store_information_id;
      var store_category_id = jsonObj.store_category_id;

      if(!storeProductIDs || !store_information_id || !store_category_id){
        return res.json(ResponseUtil.addErrorMessage());
      }

      var updateSql = "update store_product_manage set storeCategory = NULL where storeInformation="+store_information_id;

      StoreProductManage.query(updateSql, function (err) {
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }

          if(storeProductIDs.length == 0){
            return res.json(ResponseUtil.addSuccessMessage());
          }
          Promise.map(storeProductIDs, function (storeProductID) {

            return StoreProductManage.findOne({storeInformation:store_information_id,id:storeProductID,is_selling:1}).then(function (storeProduct) {

              if(storeProduct){
                storeProduct.storeCategory = store_category_id;
                storeProduct.save(function (err) {
                  if(err){
                    sails.log.error(err);
                    throw new Error("AddProductToCategoryError");
                  }
                });
              }else{
                throw new Error("CanNotFindProductToCategoryError");
              }
            });
          }).then(function () {
            return res.json(ResponseUtil.addSuccessMessage());
          }).catch(function (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          });

      });
    }catch(err){
      sails.log.error(err);
      return res.json(ResponseUtil.addErrorMessage());
    }

  },

  /**
   * @description 删除商品
   * @param id
   * @param res
   */
  deleteProduct: function (id,res) {
    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }
    StoreProductManage.destroy({id:id}, function (err,data) {
      if(err){
        return res.json(ResponseUtil.addErrorMessage());
      }

      return res.json(ResponseUtil.addSuccessMessage());
    });
  },

  /**
   * @description 更改商品上下架的状态
   * 1 上架
   * 0 下架
   * @param id
   * @param res
   */
  updateIsSelling: function (id,res) {

    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    StoreProductManage.findOne({id:id}, function (err,product) {

      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

      if(product){

        if(product.is_selling==0){
          product.is_selling=1;
        }else if(product.is_selling==1){
          product.is_selling=0;
        }
        product.storeCategory= null;
        product.save(function (err,data) {
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }

          return res.json(ResponseUtil.addSuccessMessage());
        });
      }else{
        sails.log.error("返回此商品不存在");
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  },

  /**
   * 添加为代购商品接口
   * @param product_id
   * @param store_information_id
   * @param product_category_id
   * @param res
   */
  createProduct:function(product_id,store_information_id,product_category_id,res) {
    if(!product_id || !store_information_id || !product_category_id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    StoreProductManage.findOrCreate({
                product:product_id,
       storeInformation:store_information_id,
                   type:0,
    product_category_id:product_category_id}).exec(function(err,result){

        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
        return res.json(ResponseUtil.addSuccessMessage());
    });

  },
  
  list: function (req, res) {
      StoreProductManage.find().then(function (records) {
          Promise.map(records, function (record) {
              var storeInformationId = record.storeInformation;

              if (storeInformationId) {
                  return StoreInformation.findOne({ id: storeInformationId }).then(function (storeInformation) {
                      if (storeInformation) {
                          record.storeInformation = storeInformation.name;
                      }
                      else {
                          record.storeInformation = '';
                      }

                      var productId = record.product;
                      if (productId) {
                          return Product.findOne({ id: productId }).then(function (product) {
                              if (product) {
                                  record.procuct = product.name;
                              }
                              else {
                                  record.product = '';
                              }
                          });
                      }
                  });
              }
              else {

              }
          }).then(function () {
              var responseData = ResponseUtil.addSuccessMessage();
              if (records && records.length != 0) {
                  responseData.total = records.length;
                  responseData.result = records;
                  return res.json(responseData);
              }
          });
      });
  },
};

