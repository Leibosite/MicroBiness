/**
* Cart.js
*
* @description :: 暂时不用此表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user:{
      model:'User',
      size:64
    },
    content:{
      type:'text',
      defaultsTo:""
    },
    total_price: 'float'
  }
};

