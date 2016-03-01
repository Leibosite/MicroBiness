/**
* Account_record.js
*
* @description :: 账单流水表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'account_record',
  attributes: {
    type:{
      type:'integer',
      size:64,
      notNull:true
    },
    account_id:{
      type:'integer',
      size:64,
      notNull:true
    },
    money:'string',
    content:{
      type:'text',
      defaultsTo:""
    },
    to_user_id:{
      model:'User',
      size:64
    },
    from_user_id:{
      model:'User',
      size:64
    },
    child_user_id:{
      model:'User',
      size:64
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

