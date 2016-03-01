/**
* Order_detail.js
*
* @description :: 订单详情表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'order_detail',
  attributes: {
    order_form:{
      model:'OrderForm',
      size:64,
      required:true
    },

    product:{
      model:'Product',
      size:64,
      required:true
    },

    product_amount:{
      type:'integer',
      size:32,
      notNull:true
    },
    total_price:{
      type:'string',
      notNull:true
    },
    discount:{
      type:'float',
      defaultsTo:1.0
    },
    getMoney: function () {
      return parseFloat(this.total_price);
    }
  }
};

