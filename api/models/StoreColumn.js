/**
 * 平台店铺栏目表
 * Created by tommy on 15/9/6.
 */
module.exports = {
  tableName:'store_column',
  attributes: {
    name:{
      type:'string',
      size:'50',
      notNull:true
    },
    products:{
      collection:'Product',
      via:'storeColumn'
    },
    priority:{
      type:'integer',
      size:32,
      notNull:true
    }
  }
};
