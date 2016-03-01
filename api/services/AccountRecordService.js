/**
 * Created by jcy on 15/8/24.
 */
var PageUtil = require('../util/PageUtil');
var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require('../util/ObjectUtil');
var moment = require('moment');
var Promise = require('bluebird');
module.exports = {

  /**
   * 账单记录列表接口
   * @param page
   * @param user_id
   * @param res
   */

  list: function (page,user_id,res) {

    if(!page || !user_id ){
      return res.json(ResponseUtil.addParamNotRight());
    }
    var pageNumber = PageUtil.pageNumber;

    AccountRecord.find({
      or:[{to_user_id:user_id},{from_user_id:user_id}],
      skip:(page-1)*pageNumber,
      limit:pageNumber,
      sort:"id DESC"
    }).populate("to_user_id")
      .populate("from_user_id")
      .then(function (data){

        //sails.log.info(data);
        if(!data || data.length == 0){
          throw new Error("ACCOUNT_RECORD_NULL");
        }
        var records = ObjectUtil.cloneAttributes(data);

        for(var i in records){
          var record = records[i];
          var time = '';
          for(var j in record){
            var attr = j.toString();
            if(attr=="uuid" || attr=="account_id" || attr=="child_id" || attr=="updatedAt"){
              delete record[j];
            }
            if(attr == "createdAt"){
              time = moment(new Date(records[i][j])).format('YYYY-MM-DD HH:mm:ss');
              delete record[j];
            }
          }
          record.to_username = record.to_user_id.username;
          delete record.to_user_id;
          record.from_username = record.from_user_id.username;
          delete record.from_user_id;
          record.createdAt = time;
          //sails.log.info(record);
        }

        //sails.log.info(records);

       var responseData = ResponseUtil.addSuccessMessage();
        responseData.account_records = records;
        return res.json(responseData);
    }).catch(function (err) {
        if(err.message == "ACCOUNT_RECORD_NULL"){
          var successData = ResponseUtil.addSuccessMessage();
          successData.account_records = [];
          sails.log.info("ACCOUNT_RECORD_NULL");
          return res.json(successData);
        }else{
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
    });
  },

  /**
   * 账单记录详情接口
   * @param id
   * @param res
   */
  detail: function (id,res) {
    if(!id){
      return res.json(ResponseUtil.addErrorMessage());
    }

    AccountRecord.findOne({id:id})
      .populate("to_user_id")
      .populate("from_user_id")
      .exec(function (err,data) {
        if(err){
          return res.json(ResponseUtil.addErrorMessage());
        }
        if(!data){
          sails.log.info("AccountRecord is null!");
         return res.json(ResponseUtil.addResultIsNull());
        }
        var time = '';
        var record = [];
        if(data){
           record = data;
        }

        for(var j in record){
          var attr = j.toString();
          if(attr=="uuid" || attr=="account_id" || attr=="child_id" || attr=="updatedAt"){
            delete record[j];
          }
          if(attr == "createdAt"){
            time = moment(new Date(record[j])).format('YYYY-MM-DD HH:mm:ss');
            delete record[j];
          }
        }
        record.to_username = record.to_user_id.username;
        delete record.to_user_id;
        record.from_username = record.from_user_id.username;
        delete record.from_user_id;
        record.createdAt = time;

        var responseData = ResponseUtil.addSuccessMessage();
        responseData.account_record = [];
        if(record){
          responseData.account_record = record;
        }
        return res.json(responseData);
      })
  },

  /**
   * 返回账单流水信息
   * @param req
   * @param res
   */
  list:function(req,res){

    //查找出所有的订单
    AccountRecord.find().then(function(accountRecords){

      Promise.map(accountRecords, function (accountRecord) {

        if(accountRecord.to_user_id){

          return User.findOne({id:accountRecord.to_user_id}).then(function(toUser){

            if(toUser){
              accountRecord.to_user_id = toUser.real_name;
            }else{
              accountRecord.to_user_id = '';
            }
            if(accountRecord.from_user_id){

              return User.findOne({id:accountRecord.from_user_id}).then(function(fromUser){
                  if(fromUser){
                    accountRecord.from_user_id = fromUser.real_name;
                  }else{
                    accountRecord.from_user_id= '';
                  }

                  if(accountRecord.child_user_id){

                    return User.findOne({id:accountRecord.child_user_id}).then(function(childUser){

                      if(childUser){
                        accountRecord.child_user_id = childUser.real_name;
                      }else{
                        accountRecord.child_user_id= '';
                      }
                    });
                  }
                });
            }
          });
        }
      }).then(function(){
        //sails.log.info(orderForms);
        var responseData = ResponseUtil.addSuccessMessage();
        if(accountRecords && accountRecords.length != 0){

          var accountRecordsCopy = ObjectUtil.cloneAttributes(accountRecords);
          var filterRecords = [];
          accountRecordsCopy.map(function (value, index, array) {
            filterRecords[index] = {};
            for (var i in value) {
              var attr = i.toString();
              if (attr !== "uuid" && attr !== "createdAt" && attr!== "updatedAt") {
                filterRecords[index][i] = value[i];
              }
            }
          });

          responseData.total = filterRecords.length;
          responseData.results = filterRecords;
          return res.json(responseData);
        }else{
          responseData.total = 0;
          responseData.results = [];
          return res.json(responseData);
        }
      });
    });
  }
};
