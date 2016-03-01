/**
* Address.js
*
* @description :: 用户收货地址表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {

    user:{
      model:'User',
      size:64,
      required:true
    },

    province:{
      type:'string',
      size:20,
      defaultsTo:""
    },
    city:{
      type:'string',
      size:20,
      defaultsTo:""
    },
    district:{
      type:'string',
      size:40,
      defaultsTo:""
    },
    detail_address:{
      type:'string',
      size:500,
      notNull:true
    },
    contact_number:{
      type:'string',
      size:11,
      notNull:true
    },
    name:{
      type:'string',
      size:20,
      defaultsTo:""
    },
    is_default:{
      type:'Integer',
      size:32, //int type in mysql
      defaultsTo:0
    },
    postcode:{
      type:'Integer',
      size:32, //int type in mysql
      defaultsTo:0
    },
    status:{
      type:'Integer',
      size:32,
      defaultsTo:0
    }
  }
};

