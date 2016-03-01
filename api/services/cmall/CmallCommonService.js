/**
 * 店铺共有业务实现类
 * Created by tommy on 15/10/10.
 */
var ObjectUtil = require("../../util/ObjectUtil");
var ResponseUtil = require("../../util/ResponseUtil");
var DataFilter = require("../../util/DataFilter");
var FileUtil = require("../../util/FileUtil");
var Promise = require('bluebird');
module.exports = {
  /**
   * 获取产品信息
   * @param storeProductManages
   * @returns {Promise.<T>}
   */
  getProduct: function (storeProductManages) {
    sails.log.info("--------------{start}--|Function:getProduct()|------------");
    var products = [];
    var productIds = [];
    var storeProductManageIds = [];

    var spmMap = {};
    for (var j in storeProductManages) {
      if(storeProductManages[j].is_selling==1)

      storeProductManageIds.push(storeProductManages[j].id);
      productIds.push(storeProductManages[j].product);
      spmMap["" + storeProductManages[j].id] = storeProductManages[j];
    }

    return Promise.map(storeProductManageIds, function (storeProductManageId) {
      sails.log.info("0000------5---storeProductManageId");
      sails.log.info(storeProductManageId);

      var productId = spmMap[storeProductManageId].product;
      sails.log.info("product id is: " + productId);
      return Product.findOne({id: productId}).sort("id DESC").populate("productImages").then(function (product) {

        sails.log.info("0000------5---product is: ");
        sails.log.info(JSON.stringify(product));
        if (product != null || product != undefined) {

          product.id = storeProductManageId;
          var productClone = ObjectUtil.cloneAttributes(product);
          productClone.type = spmMap[storeProductManageId].type;
          products.push(productClone);
          sails.log.info("5550------5---products");
          sails.log.info(JSON.stringify(products));
        }
      })


    }).then(function () {

      sails.log.info("5555------5---products");
      sails.log.info(JSON.stringify(products));
      products = DataFilter.productArrayFilter(products);
      sails.log.info(JSON.stringify(products));
      sails.log.info("--------------{end}--|Function:getProduct()|------------");
      return products;

    });

  },
  /**
   * 确认下单前预处理商品
   * @param storeProductManages
   * @returns {Promise.<T>}
   */
  preHandleCommodity: function (commodityIds, commodityMaps) {
    sails.log.info("--------------{start}--|Function:preHandleCommodity()|------------");

    // 微商发货商品
    var weProducts = [];
    // 谷雨发货商品
    var guProducts = [];
    // 缺货
    var outOfStock = [];
    return Promise.map(commodityIds, function (pId) {

      var temp = {};
      sails.log.info("------------ Promise.map ----pId");
      sails.log.info(pId);
      sails.log.info("-------- Promise.map--------productsMap info");
      sails.log.info(commodityMaps[pId]);
      sails.log.info("--------------[db]--[start]-{StoreProductManage}--(id: " + pId + "," + "is_selling: 1)" + "-------");

      return StoreProductManage.findOne({id: pId, is_selling: 1}).then(function (storeProductManage) {
        sails.log.info("--------------[db]--[end]-{StoreProductManage}-------------|查询到的商品信息为|-------");
        sails.log.info(JSON.stringify(storeProductManage));
        if (storeProductManage) {
          sails.log.info("--------------[db]--[start]-{Product}--(id: " + storeProductManage.product + "--------");
          return Product.findOne({id: storeProductManage.product}).then(function (product) {
            sails.log.info("--------------[db]--[end]-{Product}-------------|查询到的产品信息为|-------");
            sails.log.info(JSON.stringify(product));
            if (product) {
              product.type = storeProductManage.type;
              product.count = commodityMaps[pId].count;
              if (storeProductManage.amount >= commodityMaps[pId].count) {
                storeProductManage.count = commodityMaps[pId].count;
                //0:代销,1:直销
                if (storeProductManage.type == 0)
                  guProducts.push(product);
                else if (storeProductManage.type == 1)
                  weProducts.push(product);
              }

              else {
                sails.log.info("-------[bs]--{repertory not enoughh}--- |商品库存量不够|");
                sails.log.info("-------[bs]--{commodity is :}--- |商品信息为|");
                sails.log.info(JSON.stringify(storeProductManage));
                outOfStock.push(storeProductManage.id);
              }

            }


          });
        }

      });

    }).then(function () {
      var tmp = {};
      tmp.weProducts = weProducts;
      tmp.guProducts = guProducts;
      tmp.outOfStock = outOfStock;
      if (outOfStock.length === 0)
        tmp.flag = 0;
      else
        tmp.flag = 1;
      sails.log.info("--------------[bs]--|tmp is:|--------------" + tmp);
      sails.log.info("--------------{end}--|Function:preHandleCommodity()|------------");
      return tmp;

    });
  },
  /**
   * 生成订单
   * @param temp
   * @param handUser
   * @param user
   */
  generateOder: function (products, handUser, user, store_information_id, address_id) {
    sails.log.info("--------------{start}--|Function:generateOder()|------------");

    sails.log.info("--------[bs]---{start handle order}---|开始生成提交的订单|----");
    //给订单处理者
    var handle_by = handUser.id;
    var user_id = user.id;
    var store_id = store_information_id;
    var totalPrice = 0;
    for (var p in products) {
      var product = products[p];
      totalPrice += product.amount * product.getSellingPrice();
    }
    var order_number = this.createOrderNumber(user_id);
    var order_type = 2;

    sails.log.info("---------[bs]--{parameters of order}---00001--{order}----|生成订单的参数|----------");
    sails.log.info("-------[bs]----{handUser}---00001------handUser");
    sails.log.info(JSON.stringify(handUser));
    sails.log.info("------[bs]----{user}----00001------user");
    sails.log.info(JSON.stringify(user));
    sails.log.info("------[bs]----{orderNumber}----00001------orderNumber");
    sails.log.info(order_number);
    sails.log.info("------[bs]----{totalPrice}----00001------totalPrice");
    sails.log.info(totalPrice);
    sails.log.info("------[bs]----{products}----00001------products");
    sails.log.info(JSON.stringify(products));
    sails.log.info("------[bs]----{order_type}----00001------order_type");
    sails.log.info(order_type);
    sails.log.info("------[bs]----{store_id}----00001------store_id");
    sails.log.info(store_id);
    sails.log.info("------[bs]----{address_id}----00001------address_id");
    sails.log.info(address_id);

    if (!handle_by || !user_id || !totalPrice || !products || !order_type || !order_number || !store_id || !address_id) {
      sails.log.info("------[bs]----{order parameters check fail}----00001------|订单参数非法，生成订单失败|-----");
      return '-1'
    }
    //0商城卖给顾客1商城卖给微商2微商卖给顾客

    //'0 未付款','1 待发货','2 待收货','3 确认收货'

    var order = {
      user_id: user_id,
      handle_by: handle_by,
      total_price: totalPrice,
      order_number: order_number,
      order_type: order_type,
      storeInformation: store_id,
      status: 1,
      address_id: address_id
    };
    sails.log.info(JSON.stringify(order));
    return OrderForm.create(order).then(function (order) {
      sails.log.info("-------[bs]-------00010-{create order}--|工厂方法创建的订单信息为|---");
      sails.log.info(JSON.stringify(order));

      this.order = {id: order.id, order_number: order.order_number};

      var details = [];
      for (var p in products) {
        var product = products[p];
        var total_price = product.amount * product.getSellingPrice();
        var detail = {
          order_form: order.id,
          product: product.id,
          product_amount: product.amount,
          total_price: total_price
        };
        details.push(detail);
      }
      return OrderDetail.create(details).then(function (orderDetails) {
        sails.log.info("--------------[bs]----00100--{orderDetails informations are: }-----|创建的订单详情信息为:|");
        sails.log.info(JSON.stringify(orderDetails));
        return order;

      });

    }).catch(function (err) {
      sails.log.error(err);
      return "-1";
    });

  },
  /**
   * 根据订单列表生成支付订单
   * @param orders
   */
  generatePayOrder: function (orders, handUser, user, store_information_id) {
    if (!orders || orders.length === 0)
      return "-1";

    sails.log.info("--------------{start}--|Function:generatePayOrder()|------------");

    sails.log.info("--------[bs]---{start check pay-order}---|开始检查支付订单参数|----");
    //给订单处理者
    var handle_by = handUser.id;
    var user_id = user.id;
    var store_id = store_information_id;
    var totalPrice = 0;
    for (var p in orders) {
      var order = orders[p];
      totalPrice += order.getTotalPrice();
    }
    var order_number = this.createOrderNumber("PAY-" + user_id);
    var order_type = "0";

    sails.log.info("---------[bs]--{parameters of order}---00001--{pay-order}----|生成支付订单的参数|----------");
    sails.log.info("-------[bs]----{handUser}---00001------handUser");
    sails.log.info(JSON.stringify(handUser));
    sails.log.info("------[bs]----{user}----00001------user");
    sails.log.info(JSON.stringify(user));
    sails.log.info("------[bs]----{orderNumber}----00001------orderNumber");
    sails.log.info(order_number);
    sails.log.info("------[bs]----{totalPrice}----00001------totalPrice");
    sails.log.info(totalPrice);
    sails.log.info("------[bs]----{orders}----00001------orders");
    sails.log.info(JSON.stringify(orders));
    sails.log.info("------[bs]----{order_type}----00001------order_type");
    sails.log.info(order_type);
    sails.log.info(!order_type);
    sails.log.info("------[bs]----{store_id}----00001------store_id");
    sails.log.info(store_id);
    if (!handle_by || !user_id || !totalPrice || !orders || !order_type || !order_number || !store_id) {
      sails.log.info("------[bs]----{order parameters check fail}----00001------|支付订单参数非法，生成支付订单失败|-----");
      return '-1'
    }

    var payOrder = {
      user_id: user_id,
      handle_by: handle_by,
      total_price: totalPrice,
      order_number: order_number,
      order_type: 0,
      storeInformation: store_id,
      status: 0
    };
    sails.log.info(JSON.stringify(payOrder));
    //TODO:事务操作
    return PayOrder.create(payOrder).then(function (payOrder) {
      sails.log.info("-------[bs]-------00010-{create order}--|工厂方法创建的支付订单信息为|---");
      sails.log.info(JSON.stringify(payOrder));
      var orderIds = [];
      for (var j in orders) {
        orders[j].payOrder = payOrder.id;
        orderIds.push(orders[j].id);
      }

    return  OrderForm.update({id: orderIds}, {payOrder: payOrder.id}).then(function (updated) {

        sails.log.info("--------------[bs]----00100--{orders are: }-----|更新订单的支付信息为:|");
        sails.log.info(JSON.stringify(updated));

       return payOrder;
      }).then(function (payOrder) {
        return payOrder;

      });
    }).catch(function (err) {
      sails.log.error(err);
      return {};
    });
  },
  /**
   * 生成订单编号
   * @param value
   * @returns {string}
   */
  createOrderNumber: function (value) {

    return value + "00" + new Date().getTime() + Math.floor(Math.random() * 10000);
  }


};
