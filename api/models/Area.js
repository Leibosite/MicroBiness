/**
* Area.js
* @modified:tommy   2015.8.31
* @description :: 用户所在区域表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    users:{
      collection:'User',
      via:'area'
    },
    name:{
      type:'string',
      size:200,
      defaultsTo:"",
      notNull:true
    },
    address:{
      type:'text',
      defaultsTo:""
    },
    number:{
      type:'integer',
      size:32,
      defaultsTo:0
    },
    parent_id:{
      type:'integer',
      size:64,
      defaultsTo:0
    },
    //  区域登记level，标记区域的层级，区域最多有三级区域
    level:{
      type:'integer',
      size:1,
      defaultsTo:0
    }
  }
};

