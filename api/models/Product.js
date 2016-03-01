/**
* Product.js
*
* @description :: 商品表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name:{
      type:'string',
      size:255,
      notNull:true
    },
    productCategory:{
      model:'ProductCategory',
      size:64,
      required:true
    },

    wholesale_price:'string',
    selling_price:{
        type:'string',
        notNull:true
    },
    benefit:'string',
    is_deposit:{
      type:'integer',
      size:8,//tinyint type in mysql
      defaultsTo:0
    },
    is_wholesale:{
      type:'integer',
      size:8,
      defaultsTo:0
    },
    amount:{
      type:'integer',
      size:32,
      notNull:true
    },
    description:{
      type:'text',
      defaultsTo:""
    },
    brand:{
      model:'Brand',
      size:64
    },

    comments:{
      collection:'Comment',
      via:'product'
    },
    orderDetails:{
      collection:'OrderDetail',
      via:'product'
    },
    productImages:{
      collection:'ProductImage',
      via:'product'
    },
    storeColumn:{
      model:'StoreColumn',
      size:64
    },
    getWholePrice: function () {
      return parseFloat(this.wholesale_price);
    },
    getSellingPrice: function () {
      return parseFloat(this.selling_price);
    },
    getBenefit: function () {
      return parseFloat(this.benefit);
    }

  }
};

