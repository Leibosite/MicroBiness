// api/controllers/UserController.js

var _ = require('lodash');
var _super = require('sails-permissions/api/controllers/UserController');
delete _super.create;
var ObjectUtil = require("../util/ObjectUtil");

_.merge(exports, _super);
_.merge(exports, {

  mobileLogin: function (req,res) {
    var mobile = req.param('mobile');
    var password = req.param('password');
   // var app_key_timestamp = req.param('app_key_timestamp');
    LoginRegisterService.login(mobile,password,res);
  },
  mobileRegist:function(req,res){
    var mobile = req.param('mobile');
    var password = req.param('password');
    LoginRegisterService.userRegister(mobile,password,res);
  },
  mobileNewPartnerList: function (req,res) {
    var copartner_id = req.param("id");
    UserService.newPartnerList(copartner_id,res);
  },

  mobileParentVerify: function (req,res) {
    var partner_id = req.param("id");
    var type = req.param("type");
    UserService.parentVerify(partner_id,type,res);
  },

  mobileUpdateUserName:function(req,res){
    var id = req.param('id');
    var user_name = req.param('username');
    UserService.updateUserName(id,user_name,res);
  },

  mobileUpdateWechatAccount: function (req,res) {
    var id = req.param('id');
    var wechat_account = req.param('wechat_account');
    UserService.updateWechatAccount(id,wechat_account,res);
  },
  mobileOrganization:function(req,res){
    var id = req.param('id');
    UserService.getOrganization(id,res);

  },
  mobileDeletePartnerApply:function(req,res){
    var id = req.param('id');
    UserService.deletePartnerApply(id,res);
  },
  mobileUpdateAlipayAccount: function (req,res) {
    var id = req.param('id');
    var alipay_account = req.param('alipay_account');
    var pay_password = req.param('pay_password');
    var new_alipay_account = req.param('new_alipay_account');
    UserService.updateAlipayAccount(id,alipay_account,pay_password,new_alipay_account,res);
  },
  mobileDetail: function (req,res) {
    var id = req.param('id');
    UserService.getDetail(id,res);
  },
  mobileApplyAccount:function(req,res){
    UserService.applyAccount(req,res);
  },
  mobileForgetPassword:function(req,res){
    var mobile = req.param('mobile');
    var password = req.param('password');
    UserService.forgetPassword(mobile,password,res);
  },
  mobileUpdatePassword: function (req,res) {
    var id = req.param('id');
    var password = req.param('password');
    var new_password = req.param('new_password');
    UserService.updatePassword(id,password,new_password,res);
  },
  mobileUpdateHeadImage: function (req,res) {
    UserService.updateHeadImage(req,res);
  },
  mobilePartnerList: function (req,res) {
    var id = req.param('id');
    UserService.partnerList(id,res);
  }

});
