/**
* Business.js
*
* @description :: 进销表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    to_user_id:{
      type:'integer',
      size:64,
      required:true
    },
    from_user_id:{
      type:'integer',
      size:64,
      required:true
    },
    product_id:{
      type:'integer',
      size:64,
      required:true
    },
    amount:{
      type:'integer',
      size:32,
      required:true
    },
    content:{
      type:'text',
      defaultsTo:""
    }
  }
};

