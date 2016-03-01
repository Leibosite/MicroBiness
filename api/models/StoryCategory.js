/**
 * Story分类表
 * Created by Tommy on 15/9/6.
 */

module.exports = {
  tableName:'story_category',
  attributes: {
    name:{
      type:'string',
      size:'50',
      notNull:true
    },
    storys:{
      collection:'Story',
      via:'storyCategory'
    }
  }
};
