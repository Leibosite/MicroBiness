/**
 * 验证用户业务逻辑
 * Created by tommy on 15/9/1.
 */
var ResponseUtil = require('../../util/ResponseUtil');
var AddressService = require('../AddressService');
var PageUtil = require('../../util/PageUtil');
var ObjectUtil = require('../../util/ObjectUtil');
var TransactionUtil = require('../../util/TransactionUtil');
var DataFilter = require("../../util/DataFilter");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var OrderFormService = require('../OrderFormService');

module.exports = {

  /**
   * 用户进入微信公众号个人中心
   */
  checkUser: function (openId, res) {
    if (!openId ||openId==="?"||openId==="")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {

        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));

      });
    }
  },
}
