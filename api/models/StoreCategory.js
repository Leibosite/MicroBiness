/**
* Store_category.js
*
* @description :: 店铺栏目表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'store_category',
  attributes: {
    name:{
      type:'string',
      size:20,
      defaultsTo:"栏目",
      notNull:true
    },
    storeInformation:{
      model:'StoreInformation',
      size:64,
      required:true
    },
    rank:{
      type:'integer',
      size:32
    },
    storeProductManages:{
      collection:'StoreProductManage',
      via:'storeCategory'
    }
  }
};

