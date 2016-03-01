/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    mobileReplenishOrderList:function(req,res){
      var store_information_id = req.param('store_information_id');
      var status = req.param('status');
      var page = req.param('page');
		  OrderFormService.getReplenishOrderList(store_information_id,status,page,res);
    },

    mobileSellOrderList:function(req,res){

      var store_information_id = req.param('store_information_id');
      var status = req.param('status');
      var page = req.param('page');
      OrderFormService.getSellOrderList(store_information_id,status,page,res);
    },

    mobileCreate: function (req,res) {
      var json = req.param("json");
      OrderFormService.create(json,res);

    },

    mobileConfirm: function (req,res) {
      var json = req.param("json");
      OrderFormService.confirm(json,res);
    },

    mobilePay: function (req, res) {
      OrderFormService.pay(req, res);
    },

    mobileUpdateStatus: function (req,res) {
      var id = req.param("id");
      var type = req.param("type");
      OrderFormService.updateStatus(id,type,res);
    },

    mobileFetch: function (req,res) {
      var id = req.param("id");
      OrderFormService.fetch(id,res);
    },

    mobileDeleteOrder:function(req,res){
      var id = req.param("id");
      OrderFormService.deleteOrderForm(id,res);
    },
    list:function(req,res){
      OrderFormService.list(req,res);
    },

    mobileConfirmPay: function (req,res) {
      var id = req.param("order_id");
      OrderFormService.confirmPayService(id,res);
    }


};

