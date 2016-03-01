/**
 * Created by jcy on 15/8/27.
 */
var ResponseUtil = require('../util/ResponseUtil');
var TransactionUtil = require('../util/TransactionUtil');
var moment = require('moment');
var UUID = require('node-uuid');
var DecryUtil = require('../util/DecryptUtil');
var Promise = require('bluebird');
var ObjectUtil = require('../util/ObjectUtil');

module.exports = {

    /**
     * 提现
     * @param user_id
     * @param alipay_account
     * @param money
     * @param pay_password
     * @param res
     */
    fetchWithdraw: function (user_id, alipay_account, money, pay_password, res) {

        if (!user_id || !alipay_account || !money || !pay_password || pay_password.length < 38) {
            sails.log.error("parameter error");
            return res.json(ResponseUtil.addParamNotRight());
        }

        var payPassword = DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password));
        var token = DecryUtil.getToken(DecryUtil.decrypt(pay_password));
        Pay.findOne({ user: user_id }, function (err, pay) {

            if (err || !pay) {
                sails.log.error("you haven’t set pay password");
                return res.json(ResponseUtil.addNoPaypasswordMistake());
            }

            //检验提现的账户对不对
            User.findOne({ id: user_id }, function (err, user) {

                if (err || !user) {
                    sails.log.error("提现账户不正确或者不存在");
                    return res.json(ResponseUtil.addDetailErrorMessage('user not exist'));
                }

                if (token != user.token.substring(6, 12)) {
                    sails.log.info("pay password token is error! please check!");
                    return res.json(ResponseUtil.addTokenErrorMessage());
                }

                if (!user.alipay_account || user.alipay_account != alipay_account) {
                    sails.log.error("用户的支付宝账户不存在或者不正确");
                    return res.json(ResponseUtil.addAlipayAccountMistake());
                }

                //1、首先查询要提现账户中的财富值够不够；
                Wealth.findOne({ user: user_id }).exec(function (err, wealth) {

                    if (err || !wealth) {
                        sails.log.error("can't find this user wealth");
                        return res.json(ResponseUtil.moneyNotEnough());
                    }

                    this.wealth = wealth;
                    if (money > wealth.getCurrentMoney()) {
                        sails.log.error("money is not enough");
                        return res.json(ResponseUtil.moneyNotEnough());
                    }


                    //2、检验提现的密码对不对
                    //var pay_password = DecryUtil.decrypt(pay.pay_password);
                    if (payPassword != pay.pay_password) {
                        return res.json(ResponseUtil.payPasswordMistake());
                    }

                    var conn = TransactionUtil.createConnection();
                    TransactionUtil.startTransaction(conn);
                    var current_money = this.wealth.getCurrentMoney() - money;
                    var wealthSql = "update wealth set current_money='" + current_money + "' where user=" + this.wealth.user + ";";

                    //4、 事务处理账户上的金钱
                    conn.query(wealthSql, function (err) {

                        if (err) {
                            TransactionUtil.rollback(conn);
                            return res.json(ResponseUtil.addErrorMessage());
                        }

                        //5、查询超级管理员信息，里面绑定的是谷雨商城的用户信息
                        User.find().populate("roles", { name: "admin" }).exec(function (err, users) {

                            if (err || !user || !users[0]) {
                                sails.log.error("can't find super admin user");
                                TransactionUtil.rollback(conn);
                                return res.json(ResponseUtil.addErrorMessage());
                            }

                            var adminUser = users[0];

                            //往提现表里面插入提现记录
                            var account_flow = adminUser.id + "00" + user_id + "00" + new Date().getTime();
                            var time = moment().format('YYYY-MM-DD HH:mm:ss');
                            var uuid = UUID.v4();
                            var withdrawSql = "insert into withdraw(uuid,money,to_user_id,from_user_id,account_flow,status,createdAt,updatedAt)"
                                + "values('" + uuid + "','" + money + "'," + user_id + "," + adminUser.id + ",'" + account_flow + "',0,'" + time + "','" + time + "');";
                            conn.query(withdrawSql, function (err) {

                                if (err) {
                                    sails.log.error(err);
                                    TransactionUtil.rollback(conn);
                                    return res.json(ResponseUtil.addErrorMessage());
                                }

                                conn.query("select LAST_INSERT_ID()", function (err, withdrawID) {
                                    var withdraw_id = withdrawID[0]["LAST_INSERT_ID()"];

                                    if (err) {
                                        sails.log.error(err);
                                        TransactionUtil.rollback(conn);
                                        return res.json(ResponseUtil.addErrorMessage());
                                    }

                                    var accountSql = "insert into account_record(uuid,type,account_id,money,to_user_id,from_user_id,account_flow,createdAt,updatedAt) " +
                                        "values('" + uuid + "',3," + withdraw_id + ",'" + money + "'," + user_id + "," + adminUser.id + ",'" + account_flow + "','" + time + "','" + time + "');";

                                    conn.query(accountSql, function (err) {

                                        if (err) {
                                            sails.log.error(err);
                                            TransactionUtil.rollback(conn);
                                            return res.json(ResponseUtil.addErrorMessage());
                                        }

                                        //3、TODO 应该生成提现的工单，工单审核成功后才能减少客户账户上的虚拟货币
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
                });
            });
        });
    },

    list: function (req, res) {
        Withdraw.find().then(function (records) {
            Promise.map(records, function (record) {
              var toUserId = record.to_user_id;
              if (toUserId) {
                  return User.findOne({ id: toUserId }).then(function (toUser) {
                      if (toUser) {
                        record.to_user_id = toUser.username;
                      }
                      else {
                        record.to_user_id = '';
                      }

                      var fromUserId = record.from_user_id;
                      if (fromUserId) {
                          return User.findOne({ id: fromUserId }).then(function (fromUser) {
                              if (fromUser) {
                                  record.from_user_id = fromUser.username;
                              }
                              else {
                                  record.from_user_id = '';
                              }
                          });
                      }
                  });
              }
            }).then(function () {
                var responseDate = ResponseUtil.addSuccessMessage();
                if (records && records.length != 0) {

                    var recordsCopy = ObjectUtil.cloneAttributes(records);
                    var filterRecords = [];
                    recordsCopy.map(function (value, index, array) {
                        filterRecords[index] = {};
                        for (var i in value) {
                            var attr = i.toString();
                            if (attr !== "uuid" && attr !== "createdAt" && attr!== "updatedAt") {
                              filterRecords[index][i] = value[i];
                            }
                        }
                    });

                    responseDate.total = filterRecords.length;
                    responseDate.results = filterRecords;
                    return res.json(responseDate);
                }
                else {
                    responseDate.total = 0;
                    responseDate.results = [];
                    return res.json(responseDate);
                }
            });
        });
    }

};
