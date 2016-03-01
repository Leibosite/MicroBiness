/**
 * Product_categoryController
 *
 * @description :: Server-side logic for managing product_categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
      mobileList: function (req,res) {
        ProductCategoryService.list(res);
      }
};

