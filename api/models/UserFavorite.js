// 用户和微店、微商的收藏关系表
module.exports = {
  tableName: 'user_favorite',
  attributes: {
    content: {
      type: 'text',
      defaultsTo: ""
    },
    user_id: {
      type: 'integer',
      size: 64,
      required: true
    },
    favorite_user_id: {
      type: 'integer',
      size: 64,
      required: true
    },
    /*状态 0为可用 1为禁用*/
    status: {
      type: 'integer',
      size: 32,
      defaultsTo: 0
    },
    favorite_store_id: {
      type: 'integer',
      size: 64,
      required: true
    },
    open_id: {
      type: 'string',
      defaultsTo: ""
    }
  }
};
