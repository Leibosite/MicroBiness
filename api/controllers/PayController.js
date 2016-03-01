/**
 * PayController
 *
 * @description :: Server-side logic for managing pays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  mobileCreate: function (req,res) {
    var user_id = req.param("user_id");
    var pay_password = req.param("pay_password");
    PayService.create(user_id,pay_password,res);

  },
  mobileUpdatePassword:function(req,res){
    var user_id = req.param("user_id");
    var pay_password = req.param("pay_password");
    var new_pay_password = req.param("new_pay_password");
    PayService.updatePassword(user_id,pay_password,new_pay_password,res)
  }

};

