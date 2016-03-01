/**
 * Created by jcy on 15/10/21.
 */

module.exports = {
  /*
   *支付宝批量支付到支付宝账户
   */
    batchTransNotify: function (req, res) {

      var body = req.body;
        var data = {
          account_name:body.account_name
          ,detail_data:body.detail_data
          ,batch_no:body.batch_no
          ,batch_num:body.batch_num
          ,batch_fee:body.batch_fee
          ,email:body.email
          ,pay_date:body.pay_date
        };

        AlipayService.batchTransNotifyService(data,res);

    },

    alipayCallbackServerNotify: function (req,res) {
      if(req.method === 'POST'){
        sails.log.info('request method is',req.method,req.body);
        res.json('success');
      }
    },

    alipayCallbackMobileNotify: function (req,res) {
      if(req.method === 'POST'){
        sails.log.info('request method is',req.method,req.body);
        res.json('success');
      }
    }
};
