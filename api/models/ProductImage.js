/**
* Product_image.js
*
* @description :: 商品图片表
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  tableName:'product_image',
  attributes: {
    name:{
      type:'string',
      size:50,
      defaultsTo:""
    },
    product:{
      model:'Product',
      size:64,
      required:true
    },
    image:{
      type:'text',
      notNull:true
    },
    height:{
      type:'integer',
      size:32
    },
    width:{
      type:'integer',
      size:32
    },
    format:{
      type:'string',
      size:10
      //enum: ['BMP','JPEG','SVG','GIF','PNG','JPG']
    },
    priority:{
      type:'integer',
      size:32,
      notNull:true
    }
  }
};

