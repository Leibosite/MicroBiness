/**
 * Created by leibosite on 2015/8/25.
 */
var ObjectUtil = require("../util/ObjectUtil");
var ResponseUtil = require("../util/ResponseUtil");



var PageUtil = require('../util/PageUtil');

var TransactionUtil = require('../util/TransactionUtil');
var DataFilter = require("../util/DataFilter");
var Promise = require('bluebird');
var moment = require('moment');
var UUID = require('node-uuid');
var DecryUtil = require('../util/DecryptUtil');
module.exports={

  /**
   * 所有小伙伴为合伙人带来收益列表接口
   * @param to_user_id
   * @param page
   * @param res
   */
  getAllPartnerBenefit:function(to_user_id,page,res){

    if(!to_user_id || !page ){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var pageNumber = PageUtil.pageNumber;

    Benefit.find({
      where:{to_user_id:to_user_id},
      skip:(page-1)*pageNumber,
      limit:pageNumber,
      sort:'createdAt DESC'
    }).populate('child_user_id').exec(function (err,AllPartnerBenefit) {

      if(err) return res.json(ResponseUtil.addErrorMessage());

      var successData = ResponseUtil.addSuccessMessage();
      if(!AllPartnerBenefit || AllPartnerBenefit.length == 0){
        successData.benefit = [];
        return res.json(successData);
      }else{

        //sails.log.info(AllPartnerBenefit);
        for(var i in AllPartnerBenefit){

          var child_user_name = '';
          var time = '';
          for(var j in AllPartnerBenefit[i]){
            var attr = j.toString();
            if(attr=="id" || attr=="money"){
              continue;
            }

            if(attr =="child_user_id"){

              for(var k in AllPartnerBenefit[i][j]){

                if(k.toString()=="real_name" && AllPartnerBenefit[i][j][k]){
                  child_user_name = AllPartnerBenefit[i][j][k];
                }
              }
              //continue;
            }
            if(attr == "createdAt"){
              time = moment(new Date(AllPartnerBenefit[i][j])).format('YYYY-MM-DD HH:mm:ss');
            }
            delete AllPartnerBenefit[i][j];
          }
          AllPartnerBenefit[i].child_user_name = child_user_name;
          AllPartnerBenefit[i].createdAt = time;
        }
        //sails.log.info(AllPartnerBenefit);
        successData.benefit = AllPartnerBenefit;
        return res.json(successData);
      }

    })
  },

  /**
   * 指定小伙伴为合伙人带来收益列表接口
   * @param to_user_id
   * @param child_id
   * @param page
   * @param res
   */
  getOnePartnerBenefit: function (to_user_id,child_id,page,res) {

    if(!to_user_id || !page || !child_id){
      return res.json(ResponseUtil.addParamNotRight());
    }

    var pageNumber = PageUtil.pageNumber;

    User.findOne({id:child_id}).exec(function(err,child){

      if(!child){
        return res.json(ResponseUtil.addErrorMessage());
      }
      if(err){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
      //sails.log.info(child);
      Benefit.find({
        where:{to_user_id:to_user_id,child_user_id:child_id},
        skip:(page-1)*pageNumber,
        limit:pageNumber,
        sort:'createdAt DESC'
      }).populate('child_user_id').exec(function(err,onePartnerBenefit){
        //sails.log.info(onePartnerBenefit);
        if(err) {
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }

        var successData = ResponseUtil.addSuccessMessage();

        if(!onePartnerBenefit || onePartnerBenefit.length == 0){
          successData.benefit = [];
          return res.json(successData);
        }
        for(var i in onePartnerBenefit){

          var child_user_name = '';
          var time = '';

          for(var j in onePartnerBenefit[i]){

            var attr = j.toString();

            if(attr=="id" || attr=="money"){
              continue;
            }

            if(attr=="child_user_id"){
              for(var k in onePartnerBenefit[i][j]){
                if(k.toString()=="real_name" && onePartnerBenefit[i][j][k]){
                  child_user_name = onePartnerBenefit[i][j][k];
                }
              }
              continue;
            }
            if(attr == "createdAt"){
              time = moment(new Date(onePartnerBenefit[i][j])).format('YYYY-MM-DD HH:mm:ss');
            }
            delete onePartnerBenefit[i][j];
          }

          onePartnerBenefit[i].child_user_name = child_user_name;
          onePartnerBenefit[i].createdAt = time;
          delete onePartnerBenefit[i].child_user_id;
        }

        successData.benefit = onePartnerBenefit;
        return res.json(successData);
      })
    });

  },
  /**
   * 返回收益信息列表
   * @param req
   * @param res
   */
  list:function(req,res){

    Benefit.find().then(function(benfits){

      Promise.map(benfits, function (benfit) {

        var to_user_id = benfit.to_user_id;

        if(to_user_id){

        return User.findOne({id:to_user_id}).then(function(toUser){

            if(toUser){
              benfit.to_user_id = toUser.real_name;
            }else{
              benfit.to_user_id = '';
            }

          var from_user_id = benfit.from_user_id;
          if(from_user_id){

            return User.findOne({id:from_user_id}).then(function(fromUser){

                if(fromUser){
                  benfit.from_user_id = fromUser.real_name;
                }else{
                  benfit.from_user_id = '';
                }
                var child_user_id = benfit.child_user_id;

                if(child_user_id){

                  return User.findOne({id:child_user_id}).then(function(childUser){

                    if(childUser){
                      benfit.child_user_id = childUser.real_name;
                    }else{
                      benfit.child_user_id = '';
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
        if(benfits && benfits.length != 0){

          var benfitsCopy = ObjectUtil.cloneAttributes(benfits);
          var filterbenfits=[];
          benfitsCopy.map(function(value,index,array)
          {
            filterbenfits[index]={};
            for(var i in value)
            {
              var attr= i.toString();
              if (attr !== "uuid" && attr !== "createdAt" && attr!== "updatedAt") {
                filterbenfits[index][i] = value[i];
              }
            }
          });

          responseData.total = filterbenfits.length;
          responseData.results = filterbenfits;
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
