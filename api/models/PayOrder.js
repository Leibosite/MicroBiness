/**
 * PayOrder.js
 *
 * @description :: 支付订单表
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'pay_order',
  attributes: {

    handle_by: {
      model: 'User',
      size: 64
    },

    status: {
      type: 'integer',
      size: '32',
      notNull: true,
      defaultsTo: 0
      //enum:['未付款','待发货','待收货','确认收货']
    },
    user_id: {
      type: 'integer',
      size: 64
    },
    total_price: {
      type: 'string',
      notNull: true
    },
    storeInformation: {
      model: 'StoreInformation',
      size: 64,
      required: true
    },

    order_type: {
      type: 'integer',
      size: 16,
      notNull: true
    },
    order_number: {
      type: 'string',
      size: 50,
      notNull: true
    },
    getTotalPrice: function () {
      return parseFloat(this.total_price);
    }
  }
};

