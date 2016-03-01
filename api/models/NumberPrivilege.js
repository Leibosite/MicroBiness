/**
* NumberPrivilege.js
*
* @description :: 数量优惠
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'number_privilege',
  attributes: {
    product: {
      model: 'Product',
      size: 64,
      required:true
    },
    start: {
      type: 'Integer',
      size: 32,
      required:true
    },
    end: {
      type: 'Integer',
      size: 32,
      required:true
    },
    rate: {
      type:'float',
      required:true
    },
    preferential_price: 'String',
    getPreferentialPrice: function () {
      return parseFloat(this.preferential_price);
    }
  }
};

