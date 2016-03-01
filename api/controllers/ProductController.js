/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

	mobileList: function (req,res) {

        var product_category_id = req.param('product_category_id');
        var page = req.param('page');

        ProductService.list(product_category_id,page,res);
  },

  mobileDetail: function (req, res) {
        var id = req.param('id');
        var storeInformation = req.param('store_information_id');
        ProductService.productDetail(id,storeInformation,res);
  }
};

