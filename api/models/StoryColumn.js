/**
 * Story栏目表
 * Created by tommy on 15/9/6.
 */
module.exports = {
  tableName:'story_column',
  attributes: {
    name:{
      type:'string',
      size:'50',
      notNull:true
    },
    storys:{
      collection:'Story',
      via:'storyColumn'
    },
    priority:{
      type:'integer',
      size:32,
      notNull:true
    }
  }
};
