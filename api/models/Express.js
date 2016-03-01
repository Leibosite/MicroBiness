/**
* Express.js
*
* @description :: 快递公司
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name:{
      type:'string',
      size:20,
      required:true
    },
    number:{
      type:'string',
      size:50,
      defaultsTo:"",
      required:true
    },
    description:{
      type:'text',
      defaultsTo:""
    },
    orders:{
      collection:'OrderForm',
      via:'express'
    }
  }
};

