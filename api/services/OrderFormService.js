/**
 * Created by leibosite on 2015/8/18.
 */
var ResponseUtil = require('../util/ResponseUtil');
var PageUtil = require('../util/PageUtil');
var ObjectUtil = require('../util/ObjectUtil');
var TransactionUtil = require('../util/TransactionUtil');
var DataFilter = require("../util/DataFilter");
var Promise = require('bluebird');
var moment = require('moment');
var UUID = require('node-uuid');
var DecryUtil = require('../util/DecryptUtil');
require('magic-globals');
var Log = require('../util/LogUtil');

module.exports = {

    /**
     * 进货订单列表接口
     * @param store_information_id
     * @param status
     * @param page
     * @param res
     */
    getReplenishOrderList:function(store_information_id,status,page,res){

    var statusJump;

    if(status==0){
      statusJump = [0,1,2];
    }else if(status==1){
      statusJump = 3;
    }

    var pageNumber = PageUtil.pageNumber;
    OrderForm.find({where:{status:statusJump,storeInformation:store_information_id,order_type:1},
      skip:(page-1)*pageNumber,limit:pageNumber})
      .sort("updatedAt DESC")
      .populate('address_id')
      .then(function(orders){

        if(orders.length == 0 || !orders){
          throw new Error("ORDERS_NULL");
        }

        var ordersClone = ObjectUtil.cloneAttributes(orders);

        this.orderIdMap = {};
        for(var k in ordersClone){
          var order = ordersClone[k];
          this.orderIdMap[order.id.toString()] = k;
        }


        for(var i in ordersClone){

          var order = ordersClone[i];

          var timeCreated = '';
          var timeUpdated = '';

          for(var j in order){

            var attr = j.toString();

            if(attr=="id" || attr=="status" || attr=="order_number" || attr=="order_type"
              || attr=="address_id" || attr == "total_price" || attr =="handle_by"){
              continue;
            }
            if(attr=="createdAt"){
              timeCreated = moment(new Date(order[j])).format('YYYY-MM-DD HH:mm:ss');
            }
            if(attr == "updatedAt"){
              timeUpdated = moment(new Date(order[j])).format('YYYY-MM-DD HH:mm:ss');
            }

            delete order[j];
          }

          order.createdAt = timeCreated;
          order.updatedAt = timeUpdated;
          var address = null;

          if(order.address_id){
            address = order.address_id;
            for(var k in address){
              var attr = k.toString();
              if(attr=="id" || attr=="name"|| attr=="contact_number"
                || attr=="detail_address"){
                continue;
              }
              delete  address[k];
            }
          }
          order.address = address;
          delete order.address_id;
        }

        //sails.log.info(ordersClone);
        this.ordersClone = ordersClone;

        var orders = [];
        for(var i in ordersClone){
          var order = ordersClone[i];
          orders.push(order.id);
        }
        return orders;

      }).then(function(orders){

        Promise.map(orders, function (order_id) {

          return OrderDetail.find({order_form:order_id})
            .then(function (orderDetails) {

                if(!orderDetails || orderDetails.length == 0){
                  throw new Error("ORDERDETAILS_NULL");
                }

                var amountMap = {};
                for(var j in orderDetails){
                  var orderDetail = orderDetails[j];
                  amountMap[orderDetail.product.toString()] = orderDetail.product_amount;
                }
                var orderDetailIDS = [];
                for(var i in orderDetails){
                  var order = orderDetails[i];
                  orderDetailIDS.push(order.product);
                }

                var products = [];

                return Promise.map(orderDetailIDS, function (product_id) {

                  return Product.findOne({id:product_id}).populate("productImages").then(function (product) {
                    var data = ObjectUtil.cloneAttributes(product);
                    data = DataFilter.productFilter(data);
                    data.product_amount = amountMap[data.id.toString()];
                    products.push(data);
                    return data;
                  });

                }).then(function (data) {

                  return products;

                }).catch(function (err) {
                  sails.log.error(err);
                  res.json(ResponseUtil.addErrorMessage());
                });

          }).then(function (products) {

              //sails.log.info("-----------22");
              //sails.log.info(order_id);
              var index = this.orderIdMap[order_id.toString()];
              this.ordersClone[index].products = [];
              if(products){
                this.ordersClone[index].products = products;
              }
              //sails.log.info(this.ordersClone[index].id);

          }).catch(function (err) {
              if(err.message == "ORDERDETAILS_NULL"){
                var successdata = ResponseUtil.addSuccessMessage();
                successdata.orders = [];
                sails.log.info("ORDERDETAILS_NULL");
                return res.json(successdata);
              }else{
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              }

            });

        }).then(function () {
          var responseData = ResponseUtil.addSuccessMessage();
          responseData.orders = this.ordersClone;
          res.json(responseData);

        }).catch(function (err) {
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        });

      }).catch(function(err){
        //sails.log.info(err.message);
        if(err.message == "ORDERS_NULL"){
          var successdata = ResponseUtil.addSuccessMessage();
          successdata.orders = [];
          sails.log.info("ORDERS_NULL");
          return res.json(successdata);
        }else{
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        }
      });
    },

    /**
     * 销售订单列表接口
     * @param store_information_id
     * @param status
     * @param page
     * @param res
     */
    getSellOrderList:function(store_information_id,status,page,res){
      var statusJump;
      var orderType;

      if(status==0){
        statusJump = [1,2];
        orderType = [0,2];
      }else if(status==1){
        statusJump = 3;
        orderType = [0,2];
      }

      var pageNumber = PageUtil.pageNumber;
      OrderForm.find({
        where:{status:statusJump,storeInformation:store_information_id,order_type:orderType},
        skip:(page-1)*pageNumber,
        limit:pageNumber})
        .sort("updatedAt DESC")
        .populate('address_id')
        .then(function(orders){

          if(orders.length == 0 || !orders){
            throw new Error("ORDERS_NULL");
          }

          var ordersClone = ObjectUtil.cloneAttributes(orders);

          this.orderIdMap = {};
          for(var k in ordersClone){
            var order = ordersClone[k];
            this.orderIdMap[order.id.toString()] = k;
          }

          for(var i in ordersClone){

            var order = ordersClone[i];

            var timeCreated = '';
            var timeUpdated = '';

            for(var j in order){

              var attr = j.toString();

              if(attr=="id" || attr=="status" || attr=="order_number" || attr=="order_type"
                || attr=="address_id" ){
                continue;
              }
              if(attr=="createdAt"){
                timeCreated = moment(new Date(order[j])).format('YYYY-MM-DD HH:mm:ss');
              }
              if(attr == "updatedAt"){
                timeUpdated = moment(new Date(order[j])).format('YYYY-MM-DD HH:mm:ss');
              }

              delete order[j];
            }

            order.createdAt = timeCreated;
            order.updatedAt = timeUpdated;

            var address = null;

            if(order.address_id){
              address = order.address_id;
              for(var k in address){
                var attr = k.toString();
                if(attr=="id" || attr=="name"|| attr=="contact_number"
                  || attr=="detail_address"){
                  continue;
                }
                delete  address[k];
              }
            }

            order.address = address;
            delete order.address_id;
          }

          //sails.log.info(ordersClone);
          this.ordersClone = ordersClone;

          var orders = [];
          for(var i in ordersClone){
            var order = ordersClone[i];
            orders.push(order.id);
          }
          return orders;

        }).then(function(orders){

          Promise.map(orders, function (order_id) {
            return OrderDetail.find({order_form:order_id})
              .then(function (orderDetails) {

                if(!orderDetails || orderDetails.length == 0){
                  throw new Error("ORDERDETAILS_NULL");
                }
                var amountMap = {};
                for(var j in orderDetails){
                  var orderDetail = orderDetails[j];
                  amountMap[orderDetail.product.toString()] = orderDetail.product_amount;
                }
                var orderDetailIDS = [];
                for(var i in orderDetails){
                  var order = orderDetails[i];
                  orderDetailIDS.push(order.product);
                }

                var products = [];

                return Promise.map(orderDetailIDS, function (product_id) {

                  return Product.findOne({id:product_id}).populate("productImages").then(function (product) {

                    var data = ObjectUtil.cloneAttributes(product);
                    data = DataFilter.productFilter(data);
                    data.product_amount = amountMap[data.id.toString()];
                    products.push(data);
                    return data;
                  });

                }).then(function (data) {

                  return products;

                }).catch(function (err) {
                  sails.log.error(err);
                  res.json(ResponseUtil.addErrorMessage());
                });

              }).then(function (products) {

                //sails.log.info("-----------22");
                //sails.log.info(order_id);
                var index = this.orderIdMap[order_id.toString()];
                this.ordersClone[index].products = [];
                if(products){
                  this.ordersClone[index].products = products;
                }
                //sails.log.info(this.ordersClone[index].id);

              });

          }).then(function () {
            var responseData = ResponseUtil.addSuccessMessage();
            responseData.orders = this.ordersClone;
            res.json(responseData);

          }).catch(function (err) {
            if(err.message == "ORDERDETAILS_NULL"){
              var successdata = ResponseUtil.addSuccessMessage();
              successdata.orders = [];
              sails.log.info("ORDERDETAILS_NULL");
              return res.json(successdata);
            }else{
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            }
          });

        }).catch(function(err){
          if(err.message == "ORDERS_NULL"){
            var successdata = ResponseUtil.addSuccessMessage();
            successdata.orders = [];
            sails.log.info(err.message);
            return res.json(successdata);
          }else{
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
        });
    },

    /**
     * 提交订单接口
     * @param json
     * @param res
     * @returns {*}
     */
      //TODO 方法未使用到
    create: function (json,res) {

      try{


        Role.findOne({name: 'admin'}).populate('users').exec(function (err, role) {

          if (err || !role || !role.users || !role.users[0]) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }

          //给订单处理者
          var handle_by = role.users[0].id;
          var jsonObj = JSON.parse(json);
          var user_id = jsonObj.user_id;
          //var total_price = jsonObj.total_price;
          var products = jsonObj.products;
          var order_type = jsonObj.order_type;

          //订单号 user_id + 时间戳 + 四位随机数
          var order_number = user_id + "00" + new Date().getTime() + Math.floor(Math.random() * 10000);
          var store_information_id = jsonObj.store_information_id;

          var totalPrice = 0;
          for(var p in products){
            var product = products[p];
            totalPrice += product.product_amount * product.selling_price;
          }

          if(!handle_by || !user_id || !totalPrice || !products ||
            !order_type || !order_number || !store_information_id){
            return res.json(ResponseUtil.addParamNotRight());
          }

          //0商城卖给顾客1商城卖给微商2微商卖给顾客


          //'0 未付款','1 待发货','2 待收货','3 确认收货'
          var status = 0;

          var order = {
            user_id: user_id,
            handle_by: handle_by,
            total_price: totalPrice.toString(),
            order_number: order_number,
            order_type: order_type,
            storeInformation: store_information_id,
            status: status
          };


          OrderForm.create(order).then(function (order) {

            this.order = {id: order.id, order_number: order.order_number};

            var details = [];
            for (var p in products) {
              var product = products[p];
              var total_price = product.product_amount * product.selling_price;
              var detail = {
                order: order.id,
                product: product.id,
                product_amount: product.product_amount,
                total_price: total_price.toString()
              };
              details.push(detail);
            }
            return OrderDetail.create(details);

          }).then(function (details) {

            var responseData = ResponseUtil.addSuccessMessage();
            responseData.order = this.order;
            return res.json(responseData);


          }).catch(function (err) {
            sails.log.error(err);

            return res.json(ResponseUtil.addErrorMessage());
          });
        });

      }catch(e){
        sails.log.info(e);
        return res.json(ResponseUtil.addErrorMessage());
      }
    },

    /**
     * 确认订单
     * @param id
     * @param address_id
     * @param res
     */
    confirm: function (json, res) {
      if(!json){
        return res.json(ResponseUtil.addParamNotRight());
      }

      try{

        Role.findOne({name: 'admin'}).populate('users').exec(function (err, role) {

          if (err || !role || !role.users || !role.users[0]) {
            sails.log.error(err);
            throw new Error();
            return res.json(ResponseUtil.addErrorMessage());
          }

          sails.log.info(json);
          //给订单处理者
          var handle_by = role.users[0].id;
          try{
            var jsonObj = JSON.parse(json);
          }catch(err){
            if(err){
              sails.log.error(err);
              return res.json(ResponseUtil.addJSONParseError());
            }
          }

          /*if(!jsonObj){
            throw  new Error("JSON_ERROR");
          }*/
          var user_id = jsonObj.user_id;
          //var total_price = jsonObj.total_price;
          var products = jsonObj.products;
          var order_type = jsonObj.order_type;
          var address_id = jsonObj.address_id;
          //var token  = jsonObj.token;
          //订单号 user_id + 时间戳 + 两位随机数
          //sails.log.info(user_id.toString());
          var order_number = user_id.toString()  + new Date().getTime().toString() + Math.floor(Math.random() * 100).toString();
          //sails.log.info(order_number);
          var store_information_id = jsonObj.store_information_id;

          var totalPrice = 0;
          //TODO:折扣需要到数据库中去查找吗？；
          for(var p in products){
            var product = products[p];
            /*NumberPrivilege.findOne({product:product.id,start:{'<':product.product_amount},end:{'>':product.product_amount}}).exec(function(err,numberPrvilege){

              if(err ){
                return res.json(ResponseUtil.addErrorMessage());
              }
              if(!numberPrvilege){

              }
            });*/
            totalPrice += product.product_amount * product.preferential_price;
          }

          if(!handle_by || !user_id || !totalPrice || !products || products.length == 0 ||
            !order_type || !order_number || !store_information_id){
            return res.json(ResponseUtil.addParamNotRight());
          }
          // order_type
          // 0商城卖给顾客
          // 1商城卖给微商
          // 2微商卖给顾客

          //'0 未付款','1 待发货','2 待收货','3 确认收货'
          var status = 0;


          var conn = TransactionUtil.createConnection();
          TransactionUtil.startTransaction(conn);

          //var dataBaseOrderTable = sails.config.connections.MicroBusiness.database;
          var time = moment().format('YYYY-MM-DD HH:mm:ss');
          var uuid = UUID.v4();
          var createOrderSql = "insert into order_form(user_id,handle_by,address_id,total_price,order_number," +
            "order_type,storeInformation,status,uuid,createdAt,updatedAt) values ("+user_id+","
                                                                                   +handle_by+","
                                                                                   +address_id+",'"
                                                                                   +totalPrice+ "','"+order_number+"',"
                                                                                   +order_type+","
                                                                                   +store_information_id+","
                                                                                   +status+",'"+uuid+"','"+time+"','"+time+"');";
          sails.log.info(createOrderSql);
          conn.query(createOrderSql, function (err) {
            if (err) {
              sails.log.error(err);
              TransactionUtil.rollback(conn);
              return res.json(ResponseUtil.addErrorMessage());
            }

            conn.query("select LAST_INSERT_ID()", function (err, order) {
              var orderId = order[0]["LAST_INSERT_ID()"];
              if (err || !orderId) {
                sails.log.error(err);
                TransactionUtil.rollback(conn);
                return res.json(ResponseUtil.addErrorMessage());
              }
              var createOrderDetailSql = "insert into order_detail(order_form,product,product_amount,total_price,uuid,createdAt,updatedAt) values";
              for (var p in products) {
                var product = products[p];
                var time = moment().format('YYYY-MM-DD HH:mm:ss');
                var uuid = UUID.v4();
                var detail_total_price = product.product_amount * product.preferential_price;

                if(p != products.length-1){
                  createOrderDetailSql += "(" + orderId +","+ product.id +","+ product.product_amount +",'"
                                              + detail_total_price +"','"+ uuid +"','"+ time +"','"+ time +"'),";
                }else{
                  createOrderDetailSql += "(" + orderId +","+ product.id +","+ product.product_amount +",'"
                                              + detail_total_price +"','"+ uuid +"','"+ time +"','"+ time +"');";
                }
              }

              sails.log.info(createOrderDetailSql);
              conn.query(createOrderDetailSql,function(err){
                if (err) {
                  sails.log.error(err);
                  TransactionUtil.rollback(conn);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                TransactionUtil.commit(conn, function (err) {
                  if(err){
                    sails.log.error(err);
                    TransactionUtil.rollback(conn);
                    return res.json(ResponseUtil.addErrorMessage());
                  }
                  TransactionUtil.destroyConnection(conn);

                  var responseData = ResponseUtil.addSuccessMessage();
                  responseData.order = {
                    id:orderId,
                    order_number:order_number,
                    total_price:totalPrice,
                    handle_by:handle_by,
                    status:0 };
                  return res.json(responseData);
                });
              });
              });
            });
          });
      }catch(e){
        sails.log.info(e);
        return res.json(ResponseUtil.addErrorMessage());
      }
    },


    /**
     * 支付订单
     * @param req
     * @param res
     */
    pay: function (req,res) {

      try{
        var from_user_id = req.param("from_user_id");
        var to_user_id =req.param("to_user_id");
        var order_id = req.param("order_id");
        var money    = parseFloat(req.param("money"));
        var pay_password = req.param("pay_password");
      }catch(e){
        return res.json(ResponseUtil.addErrorMessage());
      }


      //1.判断API调用时的接口不为空
      if(!from_user_id || !to_user_id || !order_id || !money || !pay_password){
        return res.json(ResponseUtil.addParamNotRight());
      }

      //判断订单是否存在
      OrderForm.findOne({id:order_id},function(err,orderForm){

        if (err || !orderForm) {
          return res.json(ResponseUtil.addOrderNotExist());
        }

        var token = DecryUtil.getToken(DecryUtil.decrypt(pay_password));
        User.findOne({id:from_user_id},function(err,user){

          //验证支付密码中截取的token是否正确
          if(token != user.token.substring(6,12)){
            sails.log.info("pay password's toke is error!");
            return res.json(ResponseUtil.addTokenErrorMessage());
          }

          //2.找到付钱者的密码进行比对
          Pay.findOne({user:from_user_id},function (err,pay){

            if (err || !pay) {
              return res.json(ResponseUtil.addNoPaypasswordMistake());
            }

            if (pay.pay_password != DecryUtil.getPayPassword(DecryUtil.decrypt(pay_password))) {
              sails.lof.info("pay password is mistake");
              return res.json(ResponseUtil.payPasswordMistake());
            }

            //3.判断付钱者的财富值够不够支付此订单
            Wealth.findOne({user: from_user_id}, function (err, from_user_wealth) {


              if (err || !from_user_wealth) {
                return res.json(ResponseUtil.addErrorMessage());
              }


              if (from_user_wealth.current_money < money) {
                return res.json(ResponseUtil.moneyNotEnough());
              }


              Wealth.findOne({user: to_user_id}).then(function (to_user_wealth) {
                sails.log.info(to_user_wealth);
                if (!to_user_wealth) {
                  sails.log.info(err);
                  throw new Error("NO_WEALTH_RECORD");
                }


                var to_user_money = to_user_wealth.getCurrentMoney() + money;

                var from_user_money = from_user_wealth.getCurrentMoney() - money;


                //开启事务
                var conn = TransactionUtil.createConnection();
                TransactionUtil.startTransaction(conn);
                var time = moment().format('YYYY-MM-DD HH:mm:ss');
                var uuid = UUID.v4();

                var updateToUserMoneySql = "update wealth set current_money='" + to_user_money + "' where user=" + to_user_id;
                sails.log.info(updateToUserMoneySql);
                //更改to_user的钱数
                conn.query(updateToUserMoneySql, function (err) {

                  if (err) {
                    TransactionUtil.rollback(conn);
                    sails.log.error(err);
                    return res.json(ResponseUtil.addErrorMessage());
                  }

                  var updateFromUserMoneySql = "update wealth set current_money='" + from_user_money + "' where user=" + from_user_id;

                  conn.query(updateFromUserMoneySql, function (err) {
                    if (err) {
                      TransactionUtil.rollback(conn);
                      sails.log.error(err);
                      return res.json(ResponseUtil.addErrorMessage());
                    }

                    OrderForm.findOne({id: order_id}, function (err, order) {

                      if (err || !order) {
                        TransactionUtil.rollback(conn);
                        sails.log.error(err);
                        return res.json(ResponseUtil.addErrorMessage());
                      }

                      var updateOrderSql = "update order_form set status=1 where id=" + order_id;

                      sails.log.info(updateOrderSql);
                      conn.query(updateOrderSql, function (err) {

                        if (err) {
                          TransactionUtil.rollback(conn);
                          sails.log.error(err);
                          return res.json(ResponseUtil.addErrorMessage());
                        }

                        var account_flow = to_user_id + "00" + from_user_id + "00" + new Date().getTime();

                        var orderRecordCreateSql = "insert into order_record(money,to_user_id,from_user_id,account_flow,order_id,uuid,createdAt,updatedAt)" +
                          "values('" + money + "'," + to_user_id + "," + from_user_id + ",'" + account_flow + "'," + order_id + ",'" + uuid + "','" + time + "','" + time + "')";
                        conn.query(orderRecordCreateSql, function (err) {

                          if (err) {
                            TransactionUtil.rollback(conn);
                            sails.log.error(err);
                            return res.json(ResponseUtil.addErrorMessage());
                          }

                          conn.query("select LAST_INSERT_ID()", function (err, orderRecordID) {
                            var order_record_id = orderRecordID[0]["LAST_INSERT_ID()"];
                            if (err || !order_record_id) {
                              sails.log.error(err);
                              TransactionUtil.rollback(conn);
                              return res.json(ResponseUtil.addErrorMessage());
                            }

                            /*
                             流水类型
                             分账表 1，
                             充值表 2，
                             提现表 3，
                             订单交易表 4
                             */
                            var accountRecordCreateSql = "insert into account_record(money,to_user_id,from_user_id,account_flow,type,account_id,uuid,createdAt,updatedAt)" +
                              "values('" + money + "'," + to_user_id + "," + from_user_id + ",'" + account_flow + "',4 ," + order_record_id + ",'" + uuid + "','" + time + "','" + time + "')";

                            conn.query(accountRecordCreateSql, function (err) {

                              if (err) {
                                sails.log.error(err);
                                TransactionUtil.rollback(conn);
                                return res.json(ResponseUtil.addErrorMessage());
                              }

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
            });
        });

      });
      });
    },

    /**
     * 订单确认收货、确认发货接口
     * @param id
     * @param type
     * @param res
     * @desc 当微商请求的为确认收货的时候，
     * 服务端应该把对应的订单里的商品（商品ID（product_id），
     * 所属类别ID(product_category_id)[服务端根据商品查询对应所属类别ID]，
     * 数量(amount)、微店ID(store_information_id)，是否上架（is_selling=0）、
     * 类型（type=1）等）信息添加到店铺商品管理表内（添加之前首先验证店铺商品
     * 管理表内是否存在该用户的微商发货的该商品，若存在则只修改数量，若不存在再
     * 添加一条新纪录），生成新的记录
     */
    updateStatus: function (id,type,res) {

      if(!id || !type){
        return res.json(ResponseUtil.addParamNotRight());
      }

      OrderForm.findOne({id:id}).then(function (order) {
        if(!order){
          return res.json(ResponseUtil.addErrorMessage());
        }
        //this.order = order;
        //sails.log.info(order);
        return order;
      }).then(function(order){
        var status;

          /*OrderForm.update({id:id},{status:status}).exec(function (err,result) {
           if(err){
           sails.log.error(err);
           return res.json(ResponseUtil.addErrorMessage());
           }
           });*/

          if (type == 1) {
            //将该对应订单的订单状态status的值由2更新为3，即由已发货状态改为已收货（已完成）状态。
            status =3;

            var conn = TransactionUtil.createConnection();
            TransactionUtil.startTransaction(conn);
            //更改 order_form 中订单的状态
            var updateOrderFormSql = "update order_form set status = "+status+" where id = "+id+";";
            //事务开始
            conn.query(updateOrderFormSql, function (err) {
              if (err) {
                TransactionUtil.rollback(conn);
                return res.json(ResponseUtil.addErrorMessage());
              }

              var orderId = id;
              var storeInformationId = order.storeInformation;

              //DataFilter.insertIntoStoreProductManage(orderId,storeInformationId,res);

              if (!orderId || !storeInformationId) {
                return res.json(ResponseUtil.addParamNotRight());
              }

              //查询到该订单的所有商品，并将id数组返回下一级
              return OrderDetail.find({order_form: orderId}).sort("product ASC").then(function (orderDetails) {
                //sails.log.info(orderDetails);
                if (orderDetails.length == 0) {
                  sails.log.info("insertIntoStoreProductManage's orderDetails length is 0");
                  return res.json(ResponseUtil.addResultIsNull());
                }
                var productsId = [];
                for (var i in orderDetails) {
                  productsId.push(orderDetails[i].product);
                }
                this.orderDetails = orderDetails;
                return productsId;

              }).then(function (productsId) {
                //sails.log.info(productsId);
                return Product.find({id: productsId}).sort("id ASC").then(function (products) {
                  if (products.length == 0) {
                    sails.log.info("insert Into StoreProductManage's products length is zero");
                    return res.json(ResponseUtil.addResultIsNull());
                  }
                  return products;
                });
              }).then(function (products) {

                var categoryMap = {};
                for (var i in products) {
                  var productTemp = products[i];
                  categoryMap["" + productTemp.id] = productTemp.productCategory;
                }

                var orderDetails = this.orderDetails;

                //sails.log.info("orderDetails");
                //sails.log.info(orderDetails);

                //根据得到的商品id到store_product_manage表中的
                return Promise.map(orderDetails, function (orderDetail) {

                  var storeProductManage = {};
                  var storeProductManageAmount = 0;
                  var updateAndCreateSql = {updateSql: "", createSql: ""};
                  updateAndCreateSql.createSql = "";
                  for (var j in orderDetail) {

                    var temp = orderDetail[j];

                    var attr = j.toString();

                    if (attr == "product") {
                      storeProductManage.product = temp;
                    }
                    if (attr == "product_amount") {
                      storeProductManageAmount = temp;
                    }
                  }
                  storeProductManage.type = 1;
                  storeProductManage.product_category_id = categoryMap["" + orderDetail.product];
                  storeProductManage.storeInformation = storeInformationId;

                  //sails.log.info("storeProductManage.amount::"+storeProductManage.amount);
                  //如果数据库中有则只增加数量，没有则添加一条新数据；
                  return StoreProductManage.findOne(storeProductManage).then(function (found) {

                    if (!found) {
                      //数量和是否上架不同
                      //没有添加数量
                      storeProductManage.amount = storeProductManageAmount;
                      storeProductManage.is_selling = 0;
                      var time = moment().format('YYYY-MM-DD HH:mm:ss');
                      var uuid = UUID.v4();

                      //返回要插入的sql语句
                      var createStoreProductManageSql = "('" + uuid + "','" + time + "','" + time + "'," +
                        storeProductManage.product + "," +
                        storeProductManage.product_category_id + "," +
                        storeProductManage.is_selling + "," +
                          //storeProductManage.storeCategory + "," +
                        storeProductManage.amount + "," +
                        storeProductManage.type + "," +
                        storeProductManage.storeInformation + ")";

                      updateAndCreateSql.createSql = createStoreProductManageSql;
                    } else {
                      //有则更改数量
                      var amount = found.amount + storeProductManageAmount;
                      //更改数量的Sql语句
                      var updateStoreProductManageSql = "update store_product_manage set amount = " + amount + " where id=" + found.id + ";";

                      updateAndCreateSql.updateSql = updateStoreProductManageSql;
                    }
                    return updateAndCreateSql;
                  }).catch(function (err) {
                    if (err) {
                      sails.log.error(err);
                      return res.json(ResponseUtil.addErrorMessage());
                    }
                  });
                }).then(function (updateAndCreateSql) {

                  var defaultCreateSql = "insert into store_product_manage (uuid,createdAt," +
                    "updatedAt,product,product_category_id,is_selling,amount,type,storeInformation) values";
                  //sails.log.info("------------------------");
                  sails.log.info(updateAndCreateSql);

                  var updateSql = "";
                  var createSql = defaultCreateSql;
                  for (var j in updateAndCreateSql) {
                    for (var i in updateAndCreateSql[j]) {
                      sails.log.info(updateAndCreateSql[j][i]);
                      if (i.toString() == "updateSql") {
                        updateSql = updateSql + updateAndCreateSql[j][i] + "";
                      }
                      if (i.toString() == "createSql") {
                        if (j == (updateAndCreateSql.length - 1)) {
                          if (updateAndCreateSql[j][i] != '' && defaultCreateSql != updateAndCreateSql[j][i] + "") {
                            createSql = createSql + updateAndCreateSql[j][i] + ";";
                          }
                        } else {
                          if (updateAndCreateSql[j][i] != '' && defaultCreateSql != updateAndCreateSql[j][i] + "") {
                            createSql = createSql + updateAndCreateSql[j][i] + ",";
                          }
                        }
                      }
                    }
                  }

                  var excuteSql = "";
                  if (createSql == defaultCreateSql) {
                    excuteSql = updateSql;
                  } else {
                    excuteSql = updateSql + createSql;
                  }

                  //打印更新 和 创建的 SQL语句
                  sails.log.info("updateSql:" + updateSql);
                  sails.log.info("createSql:" + createSql);

                  sails.log.info("executeSql:" + excuteSql);

                  conn.query(excuteSql, function (err) {

                    if (err) {
                      TransactionUtil.rollback(conn);
                      return res.json(ResponseUtil.addErrorMessage());
                    }

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

                }).catch(function (err) {
                  if (err) {
                    sails.log.error(err);
                    return res.json(ResponseUtil.addErrorMessage());
                  }
                });

              }).catch(function (err) {
                sails.log.error(err);
                return res.json(ResponseUtil.addErrorMessage());
              });
            });
          }
          else if(type == 0){
            //该对应订单的订单状态status的值由1更新为2，即由未发货（已付款）状态改为已发货状态；
            status =2;
            var conn = TransactionUtil.createConnection();
            TransactionUtil.startTransaction(conn);
            //更改 order_form 中订单的状态
            var updateOrderFormSql = "update order_form set status = "+status+" where id = "+id+";";
            //事务开始
            conn.query(updateOrderFormSql, function (err) {
              if (err) {
                TransactionUtil.rollback(conn);
                return res.json(ResponseUtil.addErrorMessage());
              }
              TransactionUtil.commit(conn, function (err) {
                if (err) {
                  sails.log.error(err);
                  TransactionUtil.rollback(conn);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                TransactionUtil.destroyConnection(conn);
                return res.json(ResponseUtil.addSuccessMessage());
              });
              //return res.json(ResponseUtil.addSuccessMessage());
            });
          }
          else{
            return res.json(ResponseUtil.addErrorMessage());
          }
        }).catch(function(err){
          if(err){
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
        });
    },

    /**
     * 获取订单详情
     * @param id
     * @param res
     */
    fetch: function (id,res) {

      if(!id){
        return res.json(ResponseUtil.addErrorMessage());
      }

      OrderForm.findOne({id:id}).then(function (order) {

        if(!order){
          throw new Error("OrderNotExist");
        }


        var orderClone = ObjectUtil.cloneAttributes(order);

        for(var i in orderClone){
          var attr = i.toString();
          if(attr=="id" || attr=="status" || attr=="order_number"
            || attr=="total_price" || attr == "handle_by"){
            continue;
          }
          delete orderClone[i];
        }

        this.order = orderClone;

        return Address.find({user: order.user_id,status:0}).sort({is_default:0,updatedAt:0}).then(function (addresses) {

          var addressResult = null;
          if(addresses.length == 0){
            return addressResult;
          }else
          {
            addressResult = addresses[0];
            var addressClone = ObjectUtil.cloneAttributes(addressResult);
            for(var i in addressClone){
              var attr = i.toString();
              if(attr=="id" || attr=="name" || attr=="contact_number"
                || attr=="detail_address" || attr == "is_default"){
                continue;
              }
              delete addressClone[i];
            }
            return addressClone;
          }
        });
      }).then(function (address) {
        this.address = address;

        return OrderDetail.find({order:id}).sort("product ASC").then(function (details) {
          return details;
        });

      }).then(function (details) {

        this.details = [];
        if(details){
          this.details = details;
        }
        var product_ids = [];
        for(var i in this.details){
          var detail = this.details[i];
          product_ids.push(detail.product);
        }

        return Product.find({id:product_ids}).sort("id ASC").populate('productImages').then(function (products) {
          return products;
        });

      }).then(function (products) {

          var data = [];
          if(products){
             data = ObjectUtil.cloneAttributes(products);
          }

          for(var i in data){

            var product = data[i];
            var orderDetail = this.details[i];

            //retain less
            for(var k in product){

              if(k.toString()=="id"|| k.toString()=="name" || k.toString()=="productImages"
                || k.toString()=="wholesale_price" || k.toString() == "selling_price"){
                continue;
              }
              delete product[k];
            }

            //retain more
            if(!product.productImages || product.productImages.length == 0){
              product.product_image = null;
            }else{
              var images = product.productImages;
              for(var j in images){
                var image = images[j];

                if(image.priority == 0){
                  var imageUrl = "";
                  for(var i in image){
                    var attr = i.toString();
                    if(attr == "height" || attr == "width" || attr == "id")
                    {
                      continue;
                    }
                    if(attr == "image"){
                      imageUrl = sails.config.imageHostUrl + image[i];
                    }
                    delete image[i];
                  }
                  image.image = imageUrl;
                  product.product_image = image;
                  break;
                }
              }
            }
            delete product.productImages;
            product.product_amount = orderDetail.product_amount;
          }
          this.order.products = [];
          if(data){
            this.order.products = data;
          }

        var responseData = ResponseUtil.addSuccessMessage();
        responseData.address = null;
        if(this.address){
          responseData.address = this.address;
        }
        responseData.order = null;
        if(this.order){
          responseData.order = this.order;
        }

        return res.json(responseData);

      }).catch(function (err) {
        if(err.message == "OrderNotExist"){
          sails.log.error(err);
          return res.json(ResponseUtil.addOrderNotExist());
        }
        else{
          return res.json(ResponseUtil.addErrorMessage());
        }
      });
    },

    /**
     * 删除未付款订单
     * @param id
     * @param res
     * @returns {*}
     */
   deleteOrderForm: function (id,res) {
      if(!id){
        return res.json(ResponseUtil.addErrorMessage());
      }

      OrderForm.findOne({id:id}, function (err,orderForm) {

        if(!orderForm){
          return res.json(ResponseUtil.addOrderNotExist());
        }

        if(orderForm.status!=0){
          return res.json(ResponseUtil.addOrderFormNotPay());
        }

        var conn = TransactionUtil.createConnection();
        TransactionUtil.startTransaction(conn);

        var deleteOrderForm = "delete from order_form where id="+id;

        conn.query(deleteOrderForm, function (err,data) {
          if(err){
            TransactionUtil.rollback();
            sails.log.error("delete orderForm error");
            return res.json(ResponseUtil.addErrorMessage());
          }

          var deleteOrderDetail = "delete from order_detail where order_form="+id;

          conn.query(deleteOrderDetail, function (err,data) {
            if(err){
              TransactionUtil.rollback();
              sails.log.error("delete orderDetail error");
              return res.json(ResponseUtil.addErrorMessage());
            }

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
   },

  /**
   * 返回订单列表
   * @param req
   * @param res
   */
  list:function(req,res){
    //查找出所有的订单
    OrderForm.find().then(function(orderForms){

      //遍历所有的订单
      Promise.map(orderForms, function (orderForm) {

        var handle_by = orderForm.handle_by;

        //判断是否为空
        if(handle_by){

          return User.findOne({id:handle_by}).then(function(handleBy){

            if(handleBy){
              orderForm.handle_by = handleBy.real_name;
            }else{
              orderForm.handle_by = '';
            }

            var user_id = orderForm.user_id;
            if(user_id){

              return User.findOne({id:user_id}).then(function(user){

                if(user){
                  orderForm.user_id = user.real_name;
                }else{
                  orderForm.user_id = '';
                }
              });
            }
          });
        }else{
          //return res.json(ResponseUtil.addErrorMessage());
          //TODO:如果handle_by 字段為空則 說明這條記錄有問題，繼續遍歷下一條記錄

        }
      }).then(function(){
        //sails.log.info(orderForms);
        var responseData = ResponseUtil.addSuccessMessage();
        if(orderForms && orderForms.length != 0){

          var orderFormsCopy = ObjectUtil.cloneAttributes(orderForms);
          var filterRecords = [];
          orderFormsCopy.map(function (value, index, array) {
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
  },

  /**
   * 订单确认付款接口
   * @param id
   * @param res
   */
  confirmPayService: function(id,res) {
    if(!id){
      Log.errorLog(__fili+'\n===> request param id is not exist');
      return res.json(ResponseUtil.addParamNotRight());
    }

    OrderForm.findOne({id:id}).exec(function(err,orderForm){
      if(err || !orderForm){
        Log.errorLog(__fili+'\n===> this order form is not exist')
        return res.json(ResponseUtil.addOrderNotExist());
      }

      //开启事务
      var conn = TransactionUtil.createConnection();
      TransactionUtil.startTransaction(conn);
      var time = moment().format('YYYY-MM-DD HH:mm:ss');
      var uuid = UUID.v4();

      User.findOne({username:'admin'}).exec(function(err,adminUser){

        if(err || !adminUser){
          Log.errorLog(__fili+'\n===> there is no user name is admin');
          return res.json(ResponseUtil.addErrorMessage());
        }

        Wealth.findOne({user: adminUser.id}).exec(function (err,wealth){

          if(err || !wealth){
            Log.errorLog(__fili+'\n===> admin user has no wealth');
            return res.json(ResponseUtil.addErrorMessage());
          }

          var money = wealth.getCurrentMoney() + orderForm.getTotalPrice();

          var updateToUserMoneySql = "update wealth set current_money='" + money + "' where user=" + adminUser.id;
          sails.log.info(updateToUserMoneySql);

          //更改to_user的钱数
          conn.query(updateToUserMoneySql, function (err) {

            if (err) {
              TransactionUtil.rollback(conn);
              Log.errorLog(__fili+'\n===> update admin user money error');
              return res.json(ResponseUtil.addErrorMessage());
            }


            var updateOrderSql = "update order_form set status=1 where id=" + orderForm.id;

            sails.log.info(updateOrderSql);
            conn.query(updateOrderSql, function (err) {

              if (err) {
                TransactionUtil.rollback(conn);
                Log.errorLog(__fili+'\n===> update order pay status error');
                return res.json(ResponseUtil.addErrorMessage());
              }

              var account_flow = adminUser.id + "00" + orderForm.user_id + "00" + new Date().getTime();

              var orderRecordCreateSql = "insert into order_record(money,to_user_id,from_user_id,account_flow,order_id,uuid,createdAt,updatedAt)" +
                " values('" + orderForm.total_price + "'," + adminUser.id + "," + orderForm.user_id + ",'" + account_flow + "'," + orderForm.id + ",'" + uuid + "','" + time + "','" + time + "')";
              sails.log.info(orderRecordCreateSql);
              conn.query(orderRecordCreateSql, function (err) {

                if (err) {
                  TransactionUtil.rollback(conn);
                  Log.errorLog(__fili+'\n===> insert order record error',err);
                  return res.json(ResponseUtil.addErrorMessage());
                }

                conn.query("select LAST_INSERT_ID()", function (err, orderRecordID) {
                  var order_record_id = orderRecordID[0]["LAST_INSERT_ID()"];
                  if (err || !order_record_id) {
                    Log.errorLog(__fili+'\n===> select newest order record insert id error',err);
                    TransactionUtil.rollback(conn);
                    return res.json(ResponseUtil.addErrorMessage());
                  }

                  /*
                   流水类型
                   分账表 1，
                   充值表 2，
                   提现表 3，
                   订单交易表 4
                   */
                  var accountRecordCreateSql = "insert into account_record(money,to_user_id,from_user_id,account_flow,type,account_id,uuid,createdAt,updatedAt)" +
                    "values('" + orderForm.total_price + "'," + adminUser.id + "," + orderForm.user_id + ",'" + account_flow + "',4 ," + order_record_id + ",'" + uuid + "','" + time + "','" + time + "')";

                  conn.query(accountRecordCreateSql, function (err) {

                    if (err) {
                      Log.errorLog(__fili+'\n===> insert account record error',err);
                      TransactionUtil.rollback(conn);
                      return res.json(ResponseUtil.addErrorMessage());
                    }

                    TransactionUtil.commit(conn, function (err) {
                      if (err) {
                        Log.errorLog(__fili+'\n===> there are some transaction ,is not complete ,it will rollback');
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
  }
};
