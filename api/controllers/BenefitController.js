/**
 * BenefitController
 *
 * @description :: Server-side logic for managing benefits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	mobileAllPartnerList:function(req,res){
    var to_user_id = req.param('to_user_id');
    var page = req.param('page');
    BenefitService.getAllPartnerBenefit(to_user_id,page,res);

  },
  mobileOnePartnerList: function (req,res) {
    var to_user_id = req.param('to_user_id');
    var child_id = req.param('child_id');
    var page = req.param('page');
    BenefitService.getOnePartnerBenefit(to_user_id,child_id,page,res);


  }, list:function(req,res){
    BenefitService.list(req,res);
  }

};

