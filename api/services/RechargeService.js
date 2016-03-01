/**
 * Created by jcy on 15/8/26.
 */
var ResponseUtil = require('../util/ResponseUtil');
var TransactionUtil = require('../util/TransactionUtil');
var UUID = require('node-uuid');
var moment = require('moment');
var Promise = require('bluebird');
var ObjectUtil = require('../util/ObjectUtil');
var USER_ACCOUNT_NOT_EXIST  = 'USER_ACCOUNT_NOT_EXIST';
module.exports = {

  /**
   * 充值
   * @param from_user_id
   * @param money
   * @param res
   */
  create: function (from_user_id,money,res) {

    if(!from_user_id || !money){
      return res.json(ResponseUtil.addParamNotRight());
    }

    User.find().populate("roles",{name:"admin"}).then(function (users) {

      if(!users || users.length == 0){
        throw new Error("USERS_NULL");
      }

      var adminUser = users[0];

      if(!adminUser.alipay_account || adminUser.alipay_account==""){
        throw new Error(USER_ACCOUNT_NOT_EXIST);
      }

      var rechargeMoney = Number(money).toFixed(2);

      var account_flow = from_user_id + adminUser.id + new Date().getTime();

      var recharge = {
        money:rechargeMoney.toString(),
        to_user_id:adminUser.id,
        from_user_id:from_user_id,
        account_flow:account_flow
      };

      Recharge.create(recharge, function (err,recharge) {
        if(err || !recharge){
          return res.json(ResponseUtil.addErrorMessage());
        }

        var rechargeTemp = {id:recharge.id,to_user_id:adminUser.id,alipay_account:adminUser.alipay_account};
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.recharge = rechargeTemp;
        res.json(responseData);
      });
    }).catch(function (err) {
      if(err.message == "USERS_NULL"){
        sails.log.error("USERS_NULL");
        return res.json(ResponseUtil.addResultIsNull());
      }else if(err.message=="USER_ACCOUNT_NOT_EXIST"){
        sails.log.error("商城用户的支付宝账户为空,请给admin用户添加支付宝账户");
        return res.json(ResponseUtil.addAlipayAccountMistake());
      }else {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    });
  },

  /**
   * 确认充值，往用户的账户里面的财富增加财富值
   * @param id
   * @param res
   */
  rechargeConfirm: function (id,res) {

    Recharge.findOne({id:id}, function (err,recharge) {
      if(err || !recharge){
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }


      Wealth.findOne({user:recharge.from_user_id}, function (err,wealth) {

        if(err || !wealth){
          sails.log.error("用户的财富记录不存在");
          return res.json(ResponseUtil.addErrorMessage());
        }
        var money = Number(wealth.getCurrentMoney() + recharge.getMoney()).toFixed(2);

        var conn = TransactionUtil.createConnection();
        TransactionUtil.startTransaction(conn);
        var wealthSql = "update wealth set current_money='"+money+"' where user="+recharge.from_user_id;
        conn.query(wealthSql, function (err) {

          if(err){
            sails.log.error("充值确认时更改充钱账户的钱数时失败");
            TransactionUtil.rollback(conn);
            return res.json(ResponseUtil.addErrorMessage());
          }

          var rechargeSql = "update recharge set status=1 where id="+id;
          conn.query(rechargeSql, function (err) {
            if(err){
              sails.log.error("充值时更改充值记录的状态失败");
              TransactionUtil.rollback(conn);
              return res.json(ResponseUtil.addErrorMessage());
            }
            var uuid = UUID.v4();
            var time = moment().format('YYYY-MM-DD HH:mm:ss');
            var accountSql = "insert into account_record(uuid,type,account_id,money,to_user_id,from_user_id,account_flow,createdAt,updatedAt) "+
                "values('"+uuid+"',2,"+id+",'"+Number(recharge.getMoney()).toFixed(2)+"',"+recharge.to_user_id+","+recharge.from_user_id+",'"+recharge.account_flow+"','"+time+"','"+time+"')";

            conn.query(accountSql, function (err) {
              if(err){
                sails.log.error('插入充值记录失败');
                sails.log.error(err);
                TransactionUtil.rollback(conn);
                return res.json(ResponseUtil.addErrorMessage());
              }

              //TODO 建议钱数加密

              TransactionUtil.commit(conn, function (err) {
                if (err) {
                  sails.log.error(err);
                  TransactionUtil.rollback(conn);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                TransactionUtil.destroyConnection(conn);
                return res.json(ResponseUtil.addSuccessMessage());
              });
            });
          });
        });
      });
    });
  },
  /**
   * 返回充值信息
   * @param req
   * @param res
   */
  list:function(req,res){
    Recharge.find().then(function(recharges){

      Promise.map(recharges, function (recharge) {

        if(recharge.to_user_id){

          return User.findOne({id:recharge.to_user_id}).then(function(toUser){

            if(toUser){
              recharge.to_user_id = toUser.real_name;
            }else{
              recharge.to_user_id = '';
            }
            if(recharge.from_user_id){

              return User.findOne({id:recharge.from_user_id}).then(function(fromUser){

                  if(fromUser){
                    recharge.from_user_id = fromUser.real_name;
                  }else{
                    recharge.from_user_id= '';
                  }
                });
            }
          });
        }
      }).then(function(){
        //sails.log.info(orderForms);
        var responseData = ResponseUtil.addSuccessMessage();
        if(recharges && recharges.length != 0){

          var rechargesCopy = ObjectUtil.cloneAttributes(recharges);
          var filterRecharges=[];
          rechargesCopy.map(function(value,index,array)
          {
            filterRecharges[index]={};
            for(var i in value)
            {
              var attr= i.toString();
              if (attr !== "uuid" && attr !== "createdAt" && attr!== "updatedAt") {
                filterRecharges[index][i] = value[i];
              }
            }
          });
          responseData.total = filterRecharges.length;
          responseData.results = filterRecharges;
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
