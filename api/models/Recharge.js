/**
* Recharge.js
*
* @description :: 充值表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    content:{
      type:'text',
      defaultsTo:""
    },
    money:{
      type:'string',
      notNull:true,
      defaultsTo:"0.0"
    },
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
    account_flow:{
      type:'string',
      size:50,
      required:true
    },
    /*充值状态 0为充值未确认 1为确认充值*/
    status:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    getMoney:function(){
      return parseFloat(this.money);
    }
  }
};

