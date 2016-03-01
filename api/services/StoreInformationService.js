/**
 * Created by jcy on 15/8/24.
 */

var ObjectUtil = require("../util/ObjectUtil");
var ResponseUtil = require("../util/ResponseUtil");
var DataFilter   = require("../util/DataFilter");
var FileUtil  = require("../util/FileUtil");
var Promise = require('bluebird');
var TransactionUtil = require('../util/TransactionUtil');
var moment = require('moment');
var UUID = require('node-uuid');
var DecryUtil = require('../util/DecryptUtil');
var path = require('path');
var MAKEDIR_ERROR = "MAKEDIR-ERROR";
var STORE_NOT_EXIST = "STORE_NOT_EXIST";

module.exports = {

  /**
   * 获取我的等级
   * @param id
   * @param res
   */
  storeLevel : function(id,res){
    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    StoreInformation.findOne({id:id}, function (err,data) {

      if(err || !data){
        return res.json(ResponseUtil.addErrorMessage());
      }

      var storeInfomation = ObjectUtil.cloneAttributes(data);
      var headImage = '';
      for(var i in storeInfomation){
        var attr = i.toString();

        if(attr=="id" || attr=="level" || attr=="status" || attr=="name" ){
          continue;
        }

        if(attr=="head_image"){
          headImage = sails.config.imageHostUrl+storeInfomation[i];
        }
        delete storeInfomation[i];
      }
      storeInfomation.head_image = headImage;

      var responseData = ResponseUtil.addSuccessMessage();
      responseData.store_information = storeInfomation;
      return res.json(responseData);

    });
  },

  /**
   * 查询店铺详情
   * @param id
   * @param res
   */
  detail: function (id,res) {

    if(!id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    StoreInformation.findOne({id:id}).populate('user').then(function (storeInfo) {

      if(!storeInfo){
        throw new Error(STORE_NOT_EXIST);
      }

      sails.log.info("StoreInformationService--76--",storeInfo);

      var storeInfoClone = ObjectUtil.cloneAttributes(storeInfo);

      for(var i in storeInfoClone){
        var attr = i.toString();
        if(attr=="id" || attr=="name"  || attr=="background_image" || attr=="announcement"){
          continue;
        }
        delete storeInfoClone[i];
      }

      var head_image = '';
      var background_image = '';
      if(storeInfo.user && storeInfo.user.head_image){
        head_image = sails.config.imageHostUrl+storeInfo.user.head_image;
      }else{
        head_image = sails.config.imageHostUrl;
      }

      sails.log.info('StoreInformationService--96--',head_image);

      if(storeInfoClone.background_image){
        background_image = sails.config.imageHostUrl+storeInfoClone.background_image;
      }else{
        background_image = sails.config.imageHostUrl;
      }
      storeInfoClone.head_image = head_image;
      storeInfoClone.background_image = background_image;


      this.storeInfo = storeInfoClone;

      return StoreCategory.find({storeInformation:storeInfo.id}).then(function (categories) {
        return categories[0];
      });

    }).then(function (category) {

      if(!category || category.length == 0){
        throw new Error("category Not Exist");
      }
      this.category = ObjectUtil.cloneAttributes(category);

      this.category = DataFilter.productCategoryFilter(this.category);

      //sails.log.info(this.category);

      return StoreProductManage.find({storeInformation:this.storeInfo.id,storeCategory:category.id,is_selling:1})
        .sort("updatedAt DESC")
        .then(function (products) {


          var i =0;
          if(products.length>4){
            i = 4;
          }else{
            i = products.length;
          }
          var tempProductIDs = [];
          this.storeProductType = [];
          for(var j=0;j<i;j++) {

            tempProductIDs.push(products[j]["product"]);
            this.storeProductType.push(products[j]["type"]);
          }

          return tempProductIDs;

        });

    }).then(function (tempProductIDs) {

          var products = [];
          return Promise.map(tempProductIDs,function(productId){

            return Product.findOne({id:productId}).sort("id DESC").populate("productImages").then(function (product) {
              products.push(product);
            });

          }).then(function(){
            return products;
          }).catch(function(err){
            if(err){
              sails.error(err);
              throw new Error("promise map error!");
            }
          })

    }).then(function (products) {
          //sails.log.info("======2");
          //sails.log.info(products);
          var data = ObjectUtil.cloneAttributes(products);
          this.category.products = DataFilter.productAndTypeArrayFilter(data,this.storeProductType);

    }).then(function () {

      var queryStr = 'select distinct(product_category_id) from store_product_manage where storeInformation = '+id+' order by id DESC';

      StoreProductManage.query(queryStr, function (err, data) {


        if(err){
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }

        var productCategoryIDs = [];
        for(var i in  data){
          productCategoryIDs.push(data[i].product_category_id);
        }

        ProductCategory.find({id:productCategoryIDs},function(err,categories){


          if(err){
            sails.log.error(err);
            res.json(ResponseUtil.addErrorMessage());
          }

          var categoriesClone = ObjectUtil.cloneAttributes(categories);

          var categoriesFilter = DataFilter.productCategoryArrayFilter(categoriesClone);

          //sails.log.info(categories);
          var categoryIDs = [];
          var categoryIDMap = {};
          for(var i in  categories){
            var categoryID = categories[i].id;
            categoryIDs.push(categoryID);
            categoryIDMap[""+categoryID] = i;
            categoriesFilter[i].products = [];
          }


          return Promise.map(categoryIDs, function (category_id) {

            return StoreProductManage.find({product_category_id:category_id,storeInformation:id,is_selling:1})
              .sort("product DESC").limit(4).populate("product").then(function (products) {

              return products;

            }).then(function (storeProducts) {


               return Promise.map(storeProducts, function (storeProduct) {

                  return ProductImage.findOne({product:storeProduct.product.id,priority:0}).then(function (productImage) {


                    var type = storeProduct.type;
                    var product = storeProduct.product;

                    product.productImages = [];
                    if(!productImage){
                      product.productImages = [];
                    }else{
                      product.productImages.push(productImage);
                    }


                    //sails.log.info(product.productCategory);
                    var index = categoryIDMap[""+product.productCategory];
                    //sails.log.info(index);

                    var cloneProduct = ObjectUtil.cloneAttributes(product);
                    var productTemp = DataFilter.storeProductFilter(cloneProduct);
                    productTemp.type = type;

                    categoriesFilter[index].products.push(productTemp);

                  });

                }).catch(function (err) {
                 if(err){
                   sails.log.error(err);
                   return res.json(ResponseUtil.addErrorMessage());
                 }
                });

            }).catch(function (err) {
              if(err){
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }
            });

          }).then(function (products) {

              var responseData = ResponseUtil.addSuccessMessage();

              this.storeInfo.store_category = this.category;
              this.storeInfo.product_categories = categoriesFilter;

              responseData.store_information = this.storeInfo;
              return res.json(responseData);


          }).catch(function (err) {
            if(err){
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }
          });
        });

      });

    }).catch(function (err) {
      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }

    });
  },

  /**
   * DIY 修改店铺的基础信息 V2
   * @param req
   * @param res
   * {  fd: '/Library/WebServer/Documents/microbusiness/upload/micro_business/production/user/head_image/2/7750f3a7-5d7e-433b-8951-c75e79c8152b.jpg',
   *    size: 204448,
   *    type: 'image/jpeg',
   *    filename: 'e674c6983edf9e5d43e20acd5ced594a.jpg',
   *    status: 'bufferingOrWriting',
   *    field: 'head_image',
   *    extra: undefined
   * }
   */
  updateStoreInformationV2:function(req,res){
    try{

      var id = req.param('id');
      var name =req.param('name');
      var announcement = req.param('announcement');
      var store_category_name = req.param('store_category_name');
      sails.log.info('receive a http request',id,name,announcement,store_category_name);
      if(!id || !name || !announcement || !store_category_name){
        return res.json(ResponseUtil.addParamNotRight());
      }


      //首先查找有没有此店铺，如果有才能修改信息
      StoreInformation.findOne({id:id}, function (err,storeInformation) {
        if (err || !storeInformation) {
          return res.json(ResponseUtil.addErrorMessage());
        }

        var baseURL = FileUtil.baseFilePath;
        var cacheDir = baseURL + FileUtil.uploadTemporaryCacheDir;
        var backgroundImageFilePath = baseURL + FileUtil.uploadBackgroundImageDir + id + "/";

        //检测有没有上传头像
        req.file('image_files').upload({
          maxBytes:sails.config.imageUploadMaxBytes,
          dirname:cacheDir
        }, function (err,images) {

          sails.log.info('receive head image success ...', images);
          if (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }

          if(images.length > 1){
            sails.log.error('StoreInformationService---updateStoreInformationV2---335---error:upload image greater one');

            for(var i =0;i<images.length;i++){
              var deleteMsg = 'successfully deleted  error cache file';
              FileUtil.deleteFile(images[i]['fd'],deleteMsg);
            }

            return res.json(ResponseUtil.addErrorMessage());
          }


          function saveImageAndUpdateData(){

            //文件路径分隔符
            var pathSep = path.sep;

            //获取文件名
            var backgroundImageName = null;
            if(images.length === 1){

              var image = images[0];
              var filename = image['filename'];
              var fd = image['fd'];
              var fdArray = fd.split(pathSep);

              if(filename==='store_background_pic.jpg'){

                backgroundImageName = fdArray[fdArray.length-1];

                var moveMsg = 'move background image to new path success ... ';
                FileUtil.moveFile(fd,backgroundImageFilePath+backgroundImageName,moveMsg);

                if(storeInformation.background_image){
                  sails.log.info('delete old background image');
                  var deleteMsg = 'success delete old background image';
                  FileUtil.deleteFile(baseURL+storeInformation.background_image,deleteMsg);
                }

              }else{
                sails.log.error('StoreInformationService---updateStoreInformationV2---376---error:filename error');
                return res.json(ResponseUtil.addErrorMessage());
              }
            }


            //根据文件名是否为空来改变店铺的信息
            var updateRecord = null;

            if(backgroundImageName==null){
              updateRecord = {
                name:name,
                announcement:announcement
              };
            }else{
              updateRecord = {
                name:name,
                announcement:announcement,
                background_image:FileUtil.uploadBackgroundImageDir+id+"/"+backgroundImageName
              };
            }

            //更改店铺信息
            StoreInformation.update({id:id},updateRecord, function (err,storeInformation) {

              if (err) {
                return res.json(ResponseUtil.addErrorMessage());
              }

              sails.log.info(storeInformation);

              var headImage = '';
              var backgroundImage = '';

              for(var i in storeInformation[0]){
                var attr = i.toString();
                //var tmp = storeInformation[0][i] == null;

                if(attr =="id" || attr =="name" || attr == "announcement"){
                  continue
                }
                if(attr == "background_image"){
                  backgroundImage = sails.config.imageHostUrl + storeInformation[0][i];
                }
                delete storeInformation[0][i];
              }

              storeInformation[0].background_image = backgroundImage;

              //更改店铺栏目信息
              StoreCategory.update({storeInformation:id},{name:store_category_name}, function (err,category) {

                if (err || !category) {
                  return res.json(ResponseUtil.addErrorMessage());
                }

                var responseData = ResponseUtil.addSuccessMessage();
                responseData.store_information = null;
                if(storeInformation[0]){
                  responseData.store_information = storeInformation[0];
                }
                responseData.store_information.store_category_name = "";
                if(category){
                  responseData.store_information.store_category_name = category[0].name;
                }
                return res.json(responseData);

              });

            });
          }

          if(!images || images.length==0){
            saveImageAndUpdateData();
            return;
          }

          FileUtil.isFileExist(backgroundImageFilePath).then(function (result) {

            if(result){
              return true;
            }else{

              return FileUtil.mkdirsSync(backgroundImageFilePath,0777).then(function (result) {
                return result;
              });
            }

          }).then(function (result) {

            if(result){
              saveImageAndUpdateData();
            }else{
              throw new Error(MAKEDIR_ERROR);
            }

          }).catch(function (error) {
            sails.log.error('file path create error',error);
            return res.json(ResponseUtil.addErrorMessage());
          });

        });

      });

    }catch(e){
      sails.log.error(err);
      res.json(ResponseUtil.addErrorMessage());
    }
  },

  /**
   * DIY 修改店铺的基础信息
   * @param req
   * @param res
   * {  fd: '/Library/WebServer/Documents/microbusiness/upload/micro_business/production/user/head_image/2/7750f3a7-5d7e-433b-8951-c75e79c8152b.jpg',
   *    size: 204448,
   *    type: 'image/jpeg',
   *    filename: 'e674c6983edf9e5d43e20acd5ced594a.jpg',
   *    status: 'bufferingOrWriting',
   *    field: 'head_image',
   *    extra: undefined
   * }
   */
  updateStoreInformation: function (req,res) {
    try{

      var id = req.param('id');
      var name =req.param('name');
      var announcement = req.param('announcement');
      var store_category_name = req.param('store_category_name');
      sails.log.info('receive a http request',id,name,announcement,store_category_name);
      if(!id || !name || !announcement || !store_category_name){
        return res.json(ResponseUtil.addParamNotRight());
      }



      //首先查找有没有此店铺，如果有才能修改信息
      StoreInformation.findOne({id:id}, function (err,storeInformation){
        if(err || !storeInformation){
          return res.json(ResponseUtil.addErrorMessage());
        }

        var baseURL = FileUtil.imageFoldPath;
        var cacheDir = baseURL + FileUtil.uploadTemporaryCacheDir;
        var headImageFilePath = baseURL + FileUtil.uploadHeadImageDir+storeInformation.user+"/";
        var backgroundImageFilePath = baseURL+FileUtil.uploadBackgroundImageDir+id+"/";

        //检测有没有上传头像
        req.file('image_files').upload({
          maxBytes:sails.config.imageUploadMaxBytes,
          dirname:cacheDir
        }, function (err,images) {

          sails.log.info('receive head image success ...',images);
          if (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }

          //if(!images || images.length==0){
          //  sails.log.error('there is no picture upload ...');
          //  return res.json(ResponseUtil.addErrorMessage());
          //}

          if(images.length > 2){
            sails.log.error('there is no picture upload ...');

            for(var i =0;i<images.length;i++){
              var deleteMsg = 'successfully deleted  error cache file';
              FileUtil.deleteFile(images[i]['fd'],deleteMsg);
            }

            return res.json(ResponseUtil.addErrorMessage());
          }

          function saveImageAndUpdateData(){

            //文件路径分隔符
            var pathSep = path.sep;

            //获取文件名
            var headImageName = null;
            //获取文件名
            var backgroundImageName = null;
            if(images.length === 1){

              var image = images[0];
              var filename = image['filename'];
              var fd = image['fd'];
              var fdArray = fd.split(pathSep);

              if(filename==='store_head_pic.jpg'){

                headImageName = fdArray[fdArray.length-1];

                var moveMsg = 'move head image to new path success ... ';
                FileUtil.moveFile(fd,headImageFilePath+headImageName,moveMsg);

                if(storeInformation.head_image){
                  var deleteMsg = 'success delete old head image';
                  FileUtil.deleteFile(baseURL+storeInformation.head_image,deleteMsg);
                }

              }else if(filename==='store_background_pic.jpg'){

                backgroundImageName = fdArray[fdArray.length-1];

                var moveMsg = 'move background image to new path success ... ';
                FileUtil.moveFile(fd,backgroundImageFilePath+backgroundImageName,moveMsg);

                if(storeInformation.background_image){
                  sails.log.info('delete old background image');
                  var deleteMsg = 'success delete old background image';
                  FileUtil.deleteFile(baseURL+storeInformation.background_image,deleteMsg);
                }

              }else{
                sails.log.error('store image file name is error');
                return res.json(ResponseUtil.addErrorMessage());
              }
            }


            if(images.length === 2){

              var fd = images[0]["fd"];
              var fdArray = fd.split(pathSep);
              headImageName = fdArray[fdArray.length-1];

              var moveMsg = 'move head image to new path success ... ';
              FileUtil.moveFile(fd,headImageFilePath+headImageName,moveMsg);

              if(storeInformation.head_image){
                var deleteMsg = 'successfully deleted  old background image';
                FileUtil.deleteFile(baseURL+storeInformation.head_image,deleteMsg);
              }

              var fdb = images[1]["fd"];
              var fdbArray = fdb.split('/');
              backgroundImageName = fdbArray[fdbArray.length-1];

              var moveMsg = 'move background image to new path success ... ';
              FileUtil.moveFile(fdb,backgroundImageFilePath+backgroundImageName,moveMsg);

              if(storeInformation.background_image){
                var deleteMsg = 'success delete old head image';
                FileUtil.deleteFile(baseURL+storeInformation.background_image,deleteMsg);
              }
            }

            //根据文件名是否为空来改变店铺的信息
            var updateRecord = null;

            if(headImageName===null && backgroundImageName===null){
              updateRecord = {
                name:name,
                announcement:announcement
              };
            }else if(headImageName!==null && backgroundImageName===null){

              updateRecord = {
                name:name,
                announcement:announcement,
                head_image:FileUtil.uploadHeadImageDir+storeInformation.user+"/"+headImageName
              };

            }else if(headImageName===null && backgroundImageName!==null){
              updateRecord = {
                name:name,
                announcement:announcement,
                background_image:FileUtil.uploadBackgroundImageDir+id+"/"+backgroundImageName
              };
            }else{
              updateRecord = {
                name:name,
                announcement:announcement,
                head_image:FileUtil.uploadHeadImageDir+storeInformation.user+"/"+headImageName,
                background_image:FileUtil.uploadBackgroundImageDir+id+"/"+backgroundImageName
              };
            }

            //更改店铺信息
            StoreInformation.update({id:id},updateRecord, function (err,storeInformation) {

              if (err) {
                return res.json(ResponseUtil.addErrorMessage());
              }

              sails.log.info(storeInformation);

              var headImage = '';
              var backgroundImage = '';

              for(var i in storeInformation[0]){
                var attr = i.toString();
                //var tmp = storeInformation[0][i] == null;

                if(attr =="id" || attr =="name" || attr == "announcement"){
                  continue
                }
                if(attr == "head_image"){
                  headImage = sails.config.imageHostUrl + storeInformation[0][i];
                }
                if(attr == "background_image"){
                  backgroundImage = sails.config.imageHostUrl + storeInformation[0][i];
                }
                delete storeInformation[0][i];
              }

              storeInformation[0].head_image = headImage;
              storeInformation[0].background_image = backgroundImage;

              //更改店铺栏目信息
              StoreCategory.update({storeInformation:id},{name:store_category_name}, function (err,category) {

                if (err || !category) {
                  return res.json(ResponseUtil.addErrorMessage());
                }

                sails.log.info(category);
                var responseData = ResponseUtil.addSuccessMessage();
                responseData.store_information = null;
                if(storeInformation[0]){
                  responseData.store_information = storeInformation[0];
                }
                responseData.store_information.store_category_name = "";
                if(category){
                  responseData.store_information.store_category_name = category[0].name;
                }
                return res.json(responseData);

              });

            });
          }

          if(!images || images.length==0){
            saveImageAndUpdateData();
            return;
          }

          var filePromise = FileUtil.isFileExist(headImageFilePath).then(function (result) {

            if(result){
              sails.log.info('head image path is exist ');
              return FileUtil.isFileExist(backgroundImageFilePath).then(function (result) {
                return ['EXIST',result];
              });

            }else{

              sails.log.info('head image path is not exist');
              return FileUtil.mkdirsSync(headImageFilePath,0777).then(function (result) {
                return ['MAKEDIR',result];
              });
            }

          }).spread(function (sign,result) {
            sails.log.info(sign,result);
            if(sign=='EXIST'){

              if(result){
                saveImageAndUpdateData();
                return filePromise.cancel();
              }else{
                return FileUtil.mkdirsSync(backgroundImageFilePath,0777).then(function (result) {
                  return result;
                });
              }

            }else{
              if(result){
                return FileUtil.mkdirsSync(backgroundImageFilePath,0777).then(function (result) {
                  return result;
                });
              }else{
                throw new Error('MAKEDIR-ERROR');
              }
            }
          }).then(function (result) {
            if(result){
              saveImageAndUpdateData();
            }else{
              throw new Error('MAKEDIR-ERROR');
            }
          }).catch(function (error) {
            sails.log.error('file path create error',error);
            return res.json(ResponseUtil.addErrorMessage());
          });

        });

      });

    }catch(err){
      sails.log.error(err);
      res.json(ResponseUtil.addErrorMessage());
    }
  },

  /**
   * 小伙伴等级接口
   * @param id
   * @param res
   */
  getPartnerLevel:function(id,res){

    StoreInformation.findOne({id:id}).then(function(storeInformation){
      return storeInformation;
    }).then(function(storeInformation){

      if(!storeInformation){
        throw new Error("STORE_INFORMATION_NULL");
      }

      var headImage = '';
      for(var i in storeInformation){
        var attr = i.toString();
        if(attr == "id" || attr == "level" || attr == "name" || attr == "status" || attr == "user"){
          continue;
        }
        if(attr == "head_image"){
          if(storeInformation[i] == null){
            headImage = sails.config.imageHostUrl;
          }else{
            headImage = sails.config.imageHostUrl + storeInformation[i];
          }
        }
        delete storeInformation[i];
      }
      storeInformation.head_image = headImage;

      var responData = ResponseUtil.addSuccessMessage();
      responData.store_information = storeInformation;

      //sails.log.info(storeInformation);
      User.findOne({id:storeInformation.user}).then(function(partner){

        if(!partner){
          throw new Error("USER_IS_NULL");
        }
        User.findOne({id:partner.parent_id}).populate("storeInformation").then(function(partnerAndStoreInformation){

          if(!partnerAndStoreInformation){
            throw  new Error("PARTNER_IS_NULL");
          }
          var level = partnerAndStoreInformation.storeInformation.level;
          LevelPrivilege.findOne({level:level}).then(function(levelPrivilege){

            if(!levelPrivilege){
              throw new Error("LEVEL_PRIVILEGE_NULL");
            }else{

              for(var i in levelPrivilege){
                var attr = i.toString();
                if(attr == "id" || attr == "level" || attr == "partner_rate" || attr == "name" || attr == "money"|| attr == "number"){
                  continue;
                }
                delete levelPrivilege[i];
              }
              responData.level_privilege = levelPrivilege;
              return res.json(responData);
            }
          }).catch(function(err){
            if(err.message == "LEVEL_PRIVILEGE_NULL"){
              sails.log.info(err.message);
              responData.level_privilege = null;
              return res.json(responData);
            }
          });
        }).catch(function(err){
          if(err.message == "PARTNER_IS_NULL"){
            sails.log.info(err.message);
            return res.json(ResponseUtil.addResultIsNull());
          }
        });
      }).catch(function(err){
        if(err.message == "USER_IS_NULL"){
          sails.log.info(err.message);
          return res.json(ResponseUtil.addResultIsNull());
        }
      });
    }).catch(function(err){
      if(err.message == "STORE_INFORMATION_NULL"){
        sails.log.info(err.message);
        return res.json(ResponseUtil.addResultIsNull());
      }else{
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  },

  /**
   * 合伙人等级接口
   * @param id
   * @param res
   */
  getCopartnerLevel:function(id,res){

    StoreInformation.findOne({id:id}).then(function(storeInformation){
      return storeInformation;
    }).then(function(storeInformation){

      if(!storeInformation){
        throw new Error("STORE_INFORMATION_NULL");
      }

      var headImage = '';
      for(var i in storeInformation){
        var attr = i.toString();
        if(attr == "id" || attr == "level" || attr == "name" || attr == "status" ){
          continue;
        }
        if(attr == "head_image"){
          if(storeInformation[i] == null){
            headImage = sails.config.imageHostUrl;
          }else{
            headImage = sails.config.imageHostUrl + storeInformation[i];
          }
        }
        delete storeInformation[i];
      }
      storeInformation.head_image = headImage;
      storeInformation.level_name = "";
      var responData = ResponseUtil.addSuccessMessage();

      LevelPrivilege.find().sort('level ASC').then(function(levelPrivileges){

        if(!levelPrivileges || levelPrivileges.length ==0){
          throw new Error("LEVEL_PRIVILEGES_NULL");
        }else{

          for(var k in levelPrivileges){

            var levelPrivilege = levelPrivileges[k];
            for(var i in levelPrivilege){
              var attr = i.toString();
              if(attr == "id" || attr == "copartner_rate"||
                attr == "partner_rate" || attr == "name" || attr == "money" || attr == "number"){
                continue;
              }
              //为store_information 设置 level_name 字段
              if(attr == "level"){
                if(levelPrivilege[i] == storeInformation.level){
                  storeInformation.level_name = levelPrivilege.name;
                }
                continue;
              }
              delete levelPrivilege[i];
            }
          }

          responData.store_information = storeInformation;
          responData.level_privileges = levelPrivileges;
          return res.json(responData);
        }
      }).catch(function(err){
        if(err.message == "LEVEL_PRIVILEGE_NULL"){
          sails.log.info(err.message);
          responData.level_privileges = [];
          return res.json(responData);
        }
      });

    }).catch(function(err){
      if(err.message == "STORE_INFORMATION_NULL"){
        sails.log.info(err.message);
        return res.json(ResponseUtil.addResultIsNull());
      }else{
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  },

  /**
   * 店铺等级升级接口
   * @param store_information_id
   * @param level
   * @param pay_password
   * @param money
   * @param res
   */
  upgradeLevel:function(store_information_id,level,pay_password,money,res){

    var level = Number(level) + 1;
    //sails.log.info(level);
    var payPassword = DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password));

    LevelPrivilege.findOne({level:level}).then(function(levelPrivilege){

      if(!levelPrivilege){
        throw new Error("LEVEL_PRIVILEGE_NULL");
      }
      //sails.log.info(levelPrivilege);
      if(levelPrivilege.getMoney() != money){
        throw new Error("MONEY_IS_NOT_EQUAL");
      }
      StoreInformation.findOne({id:store_information_id}).then(function(storeInformation){

        //验证支付密码是否存在
        Pay.findOne({user:storeInformation.user}).then(function(pay){
          if(!pay){
            sails.log.info("pay password is not exited!");
            throw new Error("PAY_PASSWORD_IS_NOT_EXITED");
          }

          //验证支付密码是否正确
          Pay.findOne({user:storeInformation.user}).then(function(payResult){
            if(!payResult){
              sails.log.info("pay password is mistake!");
              throw new Error("PAY_PASSWORD_MISTAKE");
            }

            //var pay_password = DecryUtil.getPayPassword(DecryUtil.decrypt(payPassword.pay_password));

            if (payPassword != payResult.pay_password) {
              sails.log.info("paypassword is error!")
              return res.json(ResponseUtil.payPasswordMistake());
            }

            //验证财富值是否足够
            Wealth.findOne({user:storeInformation.user}).then(function(wealth){

              if(wealth.getCurrentMoney() < money){
                sails.log.info("money is not enough");
                throw new Error("MONEY_NOT_ENOUGH");
              }

              //事务开始：
              //首先更新財富表中的錢數；
              //再更新店铺表中的等级；
              //然後在等級升級記錄表中記錄數據
              //最後將記錄添加到
              var conn = TransactionUtil.createConnection();
              TransactionUtil.startTransaction(conn);
              var current_money = wealth.getCurrentMoney() - money;
              var updateWealthSql = "update wealth set current_money='" + current_money.toFixed(2) + "' where id="+wealth.id+";";

              conn.query(updateWealthSql, function (err) {

                if (err) {
                  TransactionUtil.rollback(conn);
                  sails.log.error(err);
                  return res.json(ResponseUtil.addErrorMessage());
                }
                sails.log.info(updateWealthSql);

                var updateStoreInformationSql = "update store_information set level = "+level+" where id = "+store_information_id+";";
                sails.log.info(updateStoreInformationSql);
                conn.query(updateStoreInformationSql, function (err) {

                  if (err) {
                    TransactionUtil.rollback(conn);
                    sails.log.error(err);
                    return res.json(ResponseUtil.addErrorMessage());
                  }

                  sails.log.info(updateStoreInformationSql);
                  User.find().populate("roles", {name: "admin"}).then(function (users) {

                    if (!users || !users[0]) {
                      sails.log.error("can't find super admin user");
                      TransactionUtil.rollback(conn);
                      return res.json(ResponseUtil.addErrorMessage());
                    }

                    var adminUser = users[0];
                    var toUserId = adminUser.id;
                    var fromUserId = storeInformation.user;
                    var accountFlow = toUserId + "00" + fromUserId + "00" + new Date().getTime();;
                    var time = moment().format('YYYY-MM-DD HH:mm:ss');
                    var uuid = UUID.v4();
                    var insertIntoUpgradeRechargeSql = "insert into upgrade_recharge(uuid,money,to_user_id,from_user_id,account_flow,createdAt,updatedAt)"
                      + "values('" + uuid + "','" + money + "'," + toUserId + "," + fromUserId + ",'" + accountFlow + "','" + time + "','" + time + "');";
                    conn.query(insertIntoUpgradeRechargeSql, function (err) {

                      if (err) {
                        TransactionUtil.rollback(conn);
                        sails.log.error(err);
                        return res.json(ResponseUtil.addErrorMessage());
                      }
                      sails.log.info(insertIntoUpgradeRechargeSql);

                      conn.query("select LAST_INSERT_ID()", function (err, upgradeRechargeId) {
                        var upgradeRechargeID = upgradeRechargeId[0]["LAST_INSERT_ID()"];

                        if (err) {
                          sails.log.error(err);
                          TransactionUtil.rollback(conn);
                          return res.json(ResponseUtil.addErrorMessage());
                        }
                        var accountSql = "insert into account_record(uuid,type,account_id,money,to_user_id,from_user_id,account_flow,createdAt,updatedAt) " +
                          "values('" + uuid + "',5," + upgradeRechargeID + ",'" + money + "'," + toUserId + "," + fromUserId + ",'" + accountFlow + "','" + time + "','" + time + "');";
                        conn.query(accountSql, function (err) {

                          if (err) {
                            TransactionUtil.rollback(conn);
                            sails.log.error(err);
                            return res.json(ResponseUtil.addErrorMessage());
                          }
                          sails.log.info(accountSql);

                          TransactionUtil.commit(conn, function (err) {
                            if (err) {
                              sails.log.error(err);
                              TransactionUtil.rollback(conn);
                              return res.json(ResponseUtil.addErrorMessage());
                            }
                            TransactionUtil.destroyConnection(conn);

                            StoreInformation.findOne({id: store_information_id}).then(function (updatedStoreInformation) {

                              var responseData = ResponseUtil.addSuccessMessage();
                              var imageUrl = "";
                              var store_information = null;
                              if (updatedStoreInformation) {
                                store_information = ObjectUtil.cloneAttributes(updatedStoreInformation);
                              }
                              for (var i in store_information) {
                                var attr = i.toString();
                                if (attr == "id" || attr == "level" || attr == "name" || attr == "status") {
                                  continue;
                                }
                                if (attr == "head_image") {
                                  imageUrl = sails.config.imageHostUrl + store_information[i];
                                  store_information.head_image = imageUrl;
                                  continue;
                                }
                                delete store_information[i];
                              }
                              responseData.store_information = store_information;

                              LevelPrivilege.findOne({level: level}).then(function (levelPrivilege) {
                                if (!levelPrivilege) {
                                  responseData.level_privilege = null;
                                } else {
                                  for (var i in levelPrivilege) {
                                    var attr = i.toString();
                                    if (attr == "id" || attr == "level" || attr == "name") {
                                      continue;
                                    }
                                    delete levelPrivilege[i];
                                  }
                                  responseData.level_privilege = levelPrivilege;
                                  return res.json(responseData);
                                }
                              });
                            });
                          });
                        });
                      });
                      });
                    });
                });
              });
            }).catch(function(err) {
              if (err.message == "MONEY_NOT_ENOUGH") {
                sails.log.info("MONEY_NOT_ENOUGH");
                return res.json(ResponseUtil.moneyNotEnough());
              }else{
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }
            });
          }).catch(function(err){
            if(err.message == "PAY_PASSWORD_MISTAKE"){
              sails.log.info("PAY_PASSWORD_MISTAKE");
              return res.json(ResponseUtil.payPasswordMistake());
            }else{
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }
          });
        }).catch(function(err){
          if(err.message == "PAY_PASSWORD_IS_NOT_EXITED"){
            sails.log.info("PAY_PASSWORD_IS_NOT_EXITED");
            return res.json(ResponseUtil.addNoPaypasswordMistake());
          }else{
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
        });
      });
    }).catch(function(err){
      if(err.message == "LEVEL_PRIVILEGE_NULL"){
        sails.log.info("LEVEL_PRIVILEGE_NULL");
        return res.json(ResponseUtil.addResultIsNull());
      }else if(err.message == "MONEY_IS_NOT_EQUAL"){
        sails.log.info("MONEY_IS_NOT_EQUAL");
        return res.json(ResponseUtil.addMoneyNotEqual());
      }else{
        //sails.log.info(err);
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  }
};
