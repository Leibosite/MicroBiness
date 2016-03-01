/**
 * Created by jcy on 15/8/18.
 */
var PageUtil = require('../util/PageUtil');
var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require('../util/ObjectUtil');


module.exports = {
    /**
     * 集市商品列表接口
     * @param product_category_id
     * @param page
     * @param res
     */
    list: function (product_category_id,page,res) {

        if(!product_category_id || !page){
          return res.json(ResponseUtil.addParamNotRight());
        }

        var pageNumber = PageUtil.pageNumber;


        Product.find({
            where:{productCategory:product_category_id},
            skip:(page-1)*pageNumber,
            limit:pageNumber,
            sort:'id ASC'
        }).populate('productImages',{priority:0})
        .populate('productCategory')
        .exec(function (err, products) {

            if(err){
              sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
            }
            var responseData = ResponseUtil.addSuccessMessage();
            if(!products || products.length == 0){
              sails.log.info("The products is empty");
              responseData.products = [];
              return res.json(responseData);
            }

            var data = ObjectUtil.cloneAttributes(products);

            for(var i in data){

            var product = data[i];

            //retain less
            for(var k in product){

                var attr = k.toString();

                if(attr === "id"|| attr ==="name" || attr === "productImages"
                 || attr === "productCategory" || attr == "selling_price"){
                    continue;
                }
                delete product[k];
            }

            //retain more
            //sails.log.info(product.productImages);
            /*var image = product.productImages[0];
            for(var j in image){
              var attr = j.toString();
              if(attr == "id" || attr == "image" || attr == "width" || attr == "height"){
                continue;
              }
              delete image[j];
            }*/
              var images = product.productImages;
              var image = null;
              for(var j in images){
                image = images[j];
                if(image.priority == 0){
                  for(var n in image){
                    var attr = n.toString();
                    if(attr == "height" || attr == "width" || attr == "id")
                    {
                      continue;
                    }
                    if(attr == "image"){
                      imageUrl = sails.config.imageHostUrl + image[n];
                    }
                    delete image[n];
                  }
                  image.image = imageUrl;
                  break;
                }
              }

            product.product_image = image;
            delete product.productImages;


            var category = ObjectUtil.cloneAttributes(product.productCategory);
            for(var k in category){
              if(k.toString()=="id" || k.toString()=="name"){
                continue;
              }
              delete category[k];
            }
            product.product_category = category;
            delete product.productCategory;
        }
        responseData.products = data;
        return res.json(responseData);
        });
    },

    /**
     * 集市商品详情接口
     * @param id
     * @param storeInformation
     * @param res
     */
    productDetail: function (id,storeInformation,res) {

      if(!id || !storeInformation){
        return res.json(ResponseUtil.addParamNotRight());
      }

      var successData = {};

      Product.findOne().where({id:id})
        .populate('productImages')
        .populate('productCategory')
        .exec(function(err,result){
          //sails.log.info(result);
        if(!result){
          return res.json(ResponseUtil.addErrorMessage());
        }
          if(err){
          return res.json(ResponseUtil.addErrorMessage());
        }
          var data = ObjectUtil.cloneAttributes(result);

          var productImage = null;
          var imageUrl = "";
          //拿出productImages 中所需要的
          for(var i in data){
            var temp = i.toString();

            if(temp=="productImages"){
              for(var k in data[i]){

                if(data[i][k].priority == 0){
                productImage = data[i][k];
                for(var j in productImage){
                  var attr = j.toString();
                  if(attr=="id"|| attr=="height"|| attr=="width"){
                    continue;
                  }
                  if(attr == "image"){
                    imageUrl = sails.config.imageHostUrl + productImage[j];
                  }
                  delete productImage[j];
                 }
                  delete data[i][k];
                }
                productImage.image = imageUrl;
              }
              if(!productImage){
                productImage = null;
              }

              data.product_image = productImage;
              delete data.productImages;
            }

            //productCategory
            var category = {id:0,name:""};

            if(i.toString()=="productCategory"){

             for(var k in data[i]){
               if(k.toString()=="name" ){
                 category.name = data[i][k];
                 continue;
               }
               if(k.toString()=="id" ){
                 category.id = data[i][k];
                 continue;
               }

             }
              delete data[i];

              if(!category){
                category = null;
              }
              data.product_category = category;
            }

            if(temp=="uuid" || temp=="amount"|| temp=="description"|| temp=="brand"
             || temp=="createdAt"|| temp=="updatedAt"|| temp=="comments"
              || temp=="orderDetails" || temp == "businesses" || temp == "storeColumn"){

              delete data[i];
            }
          }

          successData = ResponseUtil.addSuccessMessage();
          successData.product = data;

          //sails.log.info(successData.product);
          //successData.product.sale_status = 2;

          StoreProductManage.find({
                where:{storeInformation:storeInformation,product:id}
              }).exec(function(err,result){
            //sails.log.info("result :*****"+result);
            var type = 2;

            if(err){
              return res.json(ResponseUtil.addErrorMessage());
            }

            if(!result){
              successData.product.sale_status = type;
              return res.json(successData);
            }

            for(var i in result){
              for(var j in result[i]){
                if(j.toString()=="type"){
                  if(result[i][j] == 0){
                    type = 0;
                    break;
                  }
                }
              }
            }

            successData.product.sale_status = type;

            //sails.log.info(successData);
            NumberPrivilege.find({product:id}).exec(function(err,numberPrivilefes){

              //sails.log.info(numberPrivilefes);
              if(err){
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }

              if(numberPrivilefes.length == 0 || !numberPrivilefes){
                successData.product.number_privileges = [];
                return res.json(successData);
              }else{
                for(var i in numberPrivilefes){
                  var numberPrivilefe = numberPrivilefes[i];
                  for(var j in numberPrivilefe){
                    var attr = j.toString();
                    //var preferential_price = 0.0;
                    if(attr == "id" || attr == "start" || attr == "end" || attr == "preferential_price"){
                      continue;
                    }
                    /*if(attr == "product"){
                     preferential_price = rate * numberPrivilefe["product"].selling_price;
                     }*/
                    delete numberPrivilefe[j];
                  }
                  //numberPrivilefe.preferential_price = preferential_price;
                }
                successData.product.number_privileges = numberPrivilefes;

                return res.json(successData);
              }
            });
          });
      });
    }
};
