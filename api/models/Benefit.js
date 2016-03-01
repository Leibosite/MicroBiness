/**
* Benefit.js
*
* @description :: 分账表（小伙伴和合伙人获益记录）
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    content:{
      type:'text',
      defaultsTo:""
    },
    money:'string',
    to_user_id:{
      type:'integer',
      size:64,
      notNull:true
    },
    from_user_id:{
      type:'integer',
      size:64,
      notNull:true
    },
    child_user_id:{
      model:'User',
      size:64
    },
    account_flow:{
      type:'string',
      size:50,
      defaultsTo:""
    },
    getMoney: function () {
      return parseFloat(this.money);
    }
  }
};

