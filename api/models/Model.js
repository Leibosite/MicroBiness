// api/models/Model.js

var _ = require('lodash');
var _super = require('sails-permissions/api/models/Model');

_.merge(exports, _super);
_.merge(exports, {

  attributes: {
    /**
     * 每个Model对应响应的功能
     * 功能分级别,所以添加父ID
     */
    pid:{
      type:'integer',
      size: 20,
      defaultsTo:0
    }
  }

});
