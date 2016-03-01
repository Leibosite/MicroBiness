/**
* Product_category.js
*
* @description :: 商品类别表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'product_category',
  attributes: {
    name:{
      type:'string',
      size:'50',
      notNull:true
    },
    products:{
      collection:'Product',
      via:'productCategory'
    }
  }
};

