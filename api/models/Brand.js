/**
* Brand.js
*
* @description :: 品牌表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name:{
      type:'string',
      size:200,
      defaultsTo:"",
      notNull:true
    },
    description:{
      type:'text',
      defaultsTo:""
    },
    logo_image:{
      type:'text',
      defaultsTo:""
    },
    products:{
      collection:'Product',
      via:'brand'
    }

  }
};

