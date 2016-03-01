/**
* UpgradeRecharge.js
*
* @description :: 等级升级 财富值流向 记录model
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName :"upgrade_recharge",
  attributes: {
    content:{
      type:'text',
      defaultsTo:""
    },
    money:{
      type:'float',
      notNull:true
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
    }
  }
};

