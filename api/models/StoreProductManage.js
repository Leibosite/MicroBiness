/**
* Store_product_manage.js
*
* @description :: 店铺商品管理表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'store_product_manage',
  attributes: {

    product:{
      model:'Product',
      size:64,
      required:true
    },
    product_category_id:{
      type:'integer',
      size:64,
      required:true
    },
    is_selling:{
      type:'integer',
      size:8,
      defaultsTo:0
    },
    storeCategory:{
      model:'StoreCategory',
      size:64
    },
    amount:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    type:{
      type:'integer',
      size:32,
      required:true
    },
    storeInformation:{
      model:'StoreInformation',
      size:64,
      required:true
    }
  }
};

