/**
* Store_information.js
*
* @description :: 微商店铺表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'store_information',
  attributes: {
    name:{
      type:'string',
      size:20,
      notNull:true
    },
    head_image:{
      type:'text',
      defaultsTo:""
    },
    background_image:{
      type:'text',
      defaultsTo:""
    },
    announcement:{
      type:'text',
      defaultsTo:""
    },
    user:{
      model:'User',
      size:64,
      required:true
    },
    status:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    level:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    rank:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    guest:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    storeCategories:{
      collection:'StoreCategory',
      via:'storeInformation'
    },
    storeProductManages:{
      collection:'StoreProductManage',
      via:'storeInformation'
    }
    /*scoreRecords:{
      collection:'ScoreRecord',
      via:'storeInformation'
    }*/
  }
};

