/**
* Score_record.js
*
* @description :: 暂时没用此表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'score_record',
  attributes: {
    store_information_id:{
      type:'integer',
      size:64,
      required:true
    },
    user:{
      model:'User',
      size:64,
      required:true
    },
    store_score:{
      type:'float',
      defaultsTo:0
    },
    service_score:{
      type:'float',
      defaultsTo:0
    },
    order:{
      model:'OrderForm',
      size:64,
      required:true
    }
  }
};

