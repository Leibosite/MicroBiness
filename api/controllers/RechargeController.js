/**
* Recharge.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var ResponseUtil = require('../util/ResponseUtil');

module.exports = {
  mobileCreate: function (req,res) {
    try{

      var from_user_id = req.param("from_user_id");
      var money = parseFloat(req.param("money"));
      RechargeService.create(from_user_id,money,res);

    }catch(e){
      res.json(ResponseUtil.addErrorMessage());
    }
  },

  mobileUpdate: function (req, res) {
    var id = req.param("id");
    RechargeService.rechargeConfirm(id,res);

  },
  list:function(req,res){
    RechargeService.list(req,res);
  }
};

