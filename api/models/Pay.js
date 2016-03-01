/**
* Pay.js
*
* @description :: 支付密码表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user:{
      model:'User',
      size:64,
      required:true
    },
    pay_password:{
      type:'string',
      required:true
    }
  }
};

