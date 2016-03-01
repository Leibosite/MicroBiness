/**
* Withdraw.js
*
* @description :: 提现表
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
      defaultsTo:'0.0'
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
      notNull:true
    },
    /**
     * 支付状态，0 未支付 1 已支付
     */
    status:{
      type:'integer',
      size:20,
      defaultsTo:0
    },

    getMoney:function(){
      return parseFloat(this.money);
    }
  }
};

