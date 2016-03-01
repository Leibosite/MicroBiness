/**
 * Account_recordController
 *
 * @description :: Server-side logic for managing account_records
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  mobileList: function (req,res) {
    var page = req.param("page");
    var user_id = req.param("user_id");
    AccountRecordService.list(page,user_id,res);
  },
  mobileDetail: function (req,res) {
    var id = req.param("id");
    AccountRecordService.detail(id,res);
  },
  list:function(req,res){
    AccountRecordService.list(req,res);
  }
};

