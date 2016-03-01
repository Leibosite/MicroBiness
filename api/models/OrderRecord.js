/**
* Order_record.js
*
* @description :: 订单记录表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'order_record',
  attributes: {
    content:{
      type:'text',
      defaultsTo:""
    },
    money:{
      type:'string',
      notNull:true
    },
    order_id:{
      type:'integer',
      size:64,
      required:true
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
    getMoney: function () {
      return parseFloat(this.money);
    }

  }
};

