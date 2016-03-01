/**
* Comment.js
*
* @description :: 评论表.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    //TODO:mapping
    store_information_id:{
      type:'integer',
      size:64,
      required:true
    },
    user:{
      model:'User',
      size:64,
      notNull:true
    },
    product:{
      model:'Product',
      size:64,
      notNull:true
    },
    order:{
      model:'Comment',
      size:64,
      notNull:true
    },
    content:{
      type:'text',
      defaultsTo:""
    }
  }
};

