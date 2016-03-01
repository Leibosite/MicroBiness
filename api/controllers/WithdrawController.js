/**
 * WithdrawController
 *
 * @description :: Server-side logic for managing withdraws
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ResponseUtil = require('../util/ResponseUtil');
var moment = require('moment');
var _ = require('lodash');

module.exports = {
    mobileWithdraw: function (req, res) {
        try {
            var user_id = req.param("user_id");
            var alipay_account = req.param("alipay_account");
            var money = parseFloat(req.param("money"));
            var pay_password = req.param("pay_password");

            WithdrawService.fetchWithdraw(user_id, alipay_account, money, pay_password, res);
        } catch (e) {
            res.json(ResponseUtil.addErrorMessage());
        }
    },

    list: function (req, res) {
        WithdrawService.list(req, res);
    },

  /**
   * 构建支付宝支付参数
   * account_name 付款方的支付宝账户名,必填
   * detail_data  流水号1^收款方账号1^收款账号姓名1^付款金额1^备注说明1|流水号2^收款方账号2^收款账号姓名2^付款金额2^备注说明2
   * batch_no     年+月+日+序号 20080107001
   * batch_num    批量付款笔数(最多1000笔)
   * batch_fee    付款文件中的总金额。 格式:10.01,精确到分
   * email        付款方的支付宝账号
   * pay_date     支付时间(必须为当前日期)。格式:YYYYMMDD
   * @param req
   * @param res
   */
    //TODO 还没做完
    buildAlipayParams: function (req, res) {
      //1、查出角色是admin 默认是平台账户 查询其支付宝账户
      //2、withdraw IDs 查询 拼接字符串
      //3、moment.js 拼接序号
      //4、withdrawIDs.length
      //5、查出角色是admin 默认是平台账户 查询其支付宝账户
      //6、withdraw查询 钱数相加
      //7、moment.js 拼接序号
      try{

        var withdrawIDString = req.param('withdrawIDs');
        var withdrawIDs = JSON.parse(withdrawIDString);


        var responseData = {};
        responseData.result_code = 20001;
        responseData.result_msg  = 'success';
        responseData.account_name = '北京清软时代科技有限公司';//写到配置文件里面
        var dateString = moment().format('YYYYMMDD');
        responseData.batch_no = dateString+'001';
        responseData.pay_date = dateString;

        Withdraw.find({id:withdrawIDs}).exec(function (err,result) {
          if (err || !result || !_.isArray(result)) {
            return res.json(ResponseUtil.addErrorMessage());
          }

          responseData.batch_num = result.length;
          return res.json(responseData);

        });

      }catch(e){
        sails.log.error('WithdrawController-->buildAlipayParams-->error:',e);
        return res.json(ResponseUtil.addErrorMessage());
      }
    }
};

