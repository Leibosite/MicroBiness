/**
 * Store_informationController
 *
 * @description :: Server-side logic for managing store_informations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require("bluebird");
var ResponseUtil = require("../util/ResponseUtil");

module.exports = {

    mobileStoreLevel:function(req,res){
       var id = req.param("id");
      StoreInformationService.storeLevel(id,res);
    },
    mobileDetail: function (req, res) {
      var id = req.param("id");
      StoreInformationService.detail(id,res);
    },

    mobileUpdate: function (req,res) {
      StoreInformationService.updateStoreInformationV2(req,res);
    },
    mobilePartnerLevel:function(req,res){
      var id = req.param('id');
      //var user_id = req.param('user_id');
      StoreInformationService.getPartnerLevel(id,res);
    },
    mobileCopartnerLevel:function(req,res){
      var id = req.param('id');
      //var user_id = req.param('user_id');
      StoreInformationService.getCopartnerLevel(id,res);
    },
    mobileUpgradeLevel:function(req,res){
      var store_information_id = req.param('store_information_id');
      var pay_password = req.param('pay_password');
      var money = parseFloat(req.param("money"));
      var level = req.param('level');
      StoreInformationService.upgradeLevel(store_information_id,level,pay_password,money,res);
    }
};

