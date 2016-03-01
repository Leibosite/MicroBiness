/**
* OrderForm.js
*
* @description :: 订单表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'order_form',
  attributes: {

    handle_by:{
      model:'User',
      size:64
    },

    status:{
      type:'integer',
      size:'32',
      notNull:true,
      defaultsTo:0
      //enum:['未付款','待发货','待收货','确认收货']
    },
    user_id:{
      type:'integer',
      size:64
    },
    total_price:{
      type:'string',
      notNull:true
    },
    address_id:{
      model:'Address',
      size:64
    },
    storeInformation:{
      model:'StoreInformation',
      size:64,
      required:true
    },

    express:{
      model:'Express',
      size:64
    },

    express_number:{
      type:'string',
      size:20,
      defaultsTo:""
    },

    order_type:{
      type:'integer',
      size:16,
      notNull:true
    },
    order_number:{
      type:'string',
      size:50,
      notNull:true
    },
    orderDetails:{
      collection:'OrderDetail',
      via:'order_form'
    },
    payOrder:{
      model:'PayOrder',
      size:64
    },
    getTotalPrice: function () {
      return parseFloat(this.total_price);
    }
  }
};

