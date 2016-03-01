/**
* Wealth.js
*
* @description :: 财富表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    user:{
      model:'User',
      size:64,
      required:true
    },
    current_money:{
      type:'string',
      defaultsTo:'0.0'
    },
    getCurrentMoney:function(){
      return parseFloat(this.current_money);
    }
  }
};

