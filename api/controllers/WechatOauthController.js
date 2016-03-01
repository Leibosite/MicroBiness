/**
 * Created by tommy on 15/9/10.
 */
var WechatService = require("../services/wechat/WechatService");
module.exports = {
  oauthRedirect: function (req, res) {

    WechatService.oauthRedir(req, res);
  },
  oauthUser: function (req, res) {
    sails.log.info("--------start---------controller oauthUser");
    WechatService.oauthUser(req, res);
    sails.log.info("--------end---------controller oauthUser");
  }
};
