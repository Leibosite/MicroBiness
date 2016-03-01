/**
 * WealthController
 *
 * @description :: Server-side logic for managing wealths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	  mobileDetail:function(req,res){
      var user_id = req.param('user_id');
      var role = req.param('role');
      WealthService.getWealth(user_id,role,res);
    }
};

