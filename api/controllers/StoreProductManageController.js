/**
 * Store_product_manageController
 *
 * @description :: Server-side logic for managing store_product_manages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  mobileAllList:function(req,res){
    var page = req.param('page');
    var storeInformation = req.param('store_information_id');
    var type = req.param('type');
    StoreProductManageService.allList(page,storeInformation,type,res);
  },
  mobileIsSellingList: function (req,res) {
    var page = req.param('page');
    var storeInformation = req.param('store_information_id');
    StoreProductManageService.isSellingList(page,storeInformation,res);
  },
  mobileAdd: function (req,res) {
    var json = req.param("json");
    StoreProductManageService.add(json,res);
  },
  mobileDelete:function(req,res){
    var id = req.param("id");
    StoreProductManageService.deleteProduct(id,res);
  },

  mobileUpdateIsSelling: function (req,res) {
    var id = req.param("id");
    StoreProductManageService.updateIsSelling(id,res);
  },

  /**
   * 添加为代购商品接口
   * @param req
   * @param res
   */
  mobileCreate: function (req,res) {
    var product_id = req.param('product_id');
    var store_information_id = req.param('store_information_id');
    var product_category_id = req.param('product_category_id');
    StoreProductManageService.createProduct(product_id,store_information_id,product_category_id,res);
  },
  list: function (req, res) {
      StoreProductManageService.list(req, res);
  }
};

