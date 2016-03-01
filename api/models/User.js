// api/models/User.js

var _ = require('lodash');
var _super = require('sails-permissions/api/models/User');
delete _super.attributes.email.notNull;
delete _super.afterCreate;
_.merge(exports, _super);
_.merge(exports, {

  // Extend with custom logic here by adding additional fields, methods, etc.
  attributes: {
    real_name: {
      type: 'string',
      size: 20,
      defaultsTo: ""
    },
    id_card_number: {
      type: 'string',
      size: 18,
      defaultsTo: ""
    },
    mobile: {
      type: 'string',
      size: 11,
      //notNull:true,
      defaultsTo: ""
    },
    parent_id: {
      type: 'integer',
      size: 64,
      defaultsTo: 0
    },
    alipay_account: {
      type: 'string',
      size: 40,
      defaultsTo: ""
    },
    card_image_front: {
      type: 'text',
      defaultsTo: ""
    },
    card_image_back: {
      type: 'text',
      defaultsTo: ""
    },
    head_image: {
      type: 'text',
      defaultsTo: ""
    },
    wechat_account: {
      type: 'string',
      size: 50,
      defaultsTo: ""
    },
    apply_status: {
      type: 'integer',
      size: 32,
      defaultsTo: 0
    },
    apply_time: {
      type: 'datetime',
      defaultsTo: function () {
        return new Date();
      }
    },
    invite_code: {
      type: 'string',
      size: 8,
      defaultsTo: ""
    },

    status: {
      type: 'integer',
      size: 16,
      defaultsTo: 0 //0正常1冻结
    },
    app_id: {
      type: 'string',
      size: 40,
      defaultsTo: ""
    },
    app_secrect: 'string',
    app_key_timestamp: {
      type: 'integer',
      size: 64
    },
    token: {
      type: 'string'
    },
    open_id: {
      type: 'string',
      defaultsTo: ""
    },
    //ORM
    addresses: {
      collection: 'Address',
      via: 'user'
    },
    area: {
      model: 'Area',
      size: 64
    },
    scoreRecords: {
      collection: 'ScoreRecord',
      via: 'user'
    },
    comments: {
      collection: 'Comment',
      via: 'user'
    },
    orders: {
      collection: 'OrderForm',
      via: 'handle_by'
    },
    storeInformation: {
      model: 'StoreInformation',
      size: 64
    },
    currentLocation: {
      type: 'integer',
      size: 64
    },
    nick_name: {
      type: 'string',
      size: 100,
      defaultsTo: ""
    },
    access_token: {
      type: 'string',
      size: 500

    }
  }
});
