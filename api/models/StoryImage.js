/**
 * Created by tommy on 15/9/6.
 */
module.exports = {
  tableName:'story_image',
  attributes: {
    name:{
      type:'string',
      size:50,
      defaultsTo:""
    },
    story:{
      model:'Story',
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
