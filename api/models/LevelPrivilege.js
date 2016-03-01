/**
* LevelPrivilege.js
*
* @description :: 等级优惠
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName:'level_privilege',
  attributes: {
    level:{
      type:'Integer',
      size:32,
      required:true
    },
    copartner_rate:{
      type:'float',
      defaultsTo:0.00,
      notNull:true
    },
    partner_rate:{
      type:'float',
      defaultsTo:0.00,
      notNull:true
    },
    money:{
      type:'string',
      defaultsTo:'0.0',
      notNull:true
    },
    number:{
      type:'Integer',
      defaultsTo:0
    },
    name:{
      type:'string',
      size:20,
      notNull:true
    },
    getMoney: function () {
      return parseFloat(this.money);
    }
  }
};

