/**
 * 个人中心业务逻辑
 * Created by tommy on 15/9/1.
 */
var ResponseUtil = require('../../util/ResponseUtil');
var AddressService = require('../AddressService');
var PageUtil = require('../../util/PageUtil');
var ObjectUtil = require('../../util/ObjectUtil');
var TransactionUtil = require('../../util/TransactionUtil');
var DataFilter = require("../../util/DataFilter");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var OrderFormService = require('../OrderFormService');

module.exports = {

  /**
   * 用户进入微信公众号个人中心
   */
  home: function (openId, res) {
    sails.log.info("--------------{start}--|Function:home()|----------|[函数]--个人中心主页|--");
    if (!openId || openId == "" || openId == "?")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));

    User.findOne({open_id: openId}).exec(function (err, user) {
      sails.log.info("--------------[bs]----{user information}----------|用户信息为:|--");
      sails.log.info(JSON.stringify(user));
      if (err) {
        return res.json(ResponseUtil.addErrorMessage());
      }
      if (!user)
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.unknown_user.code, ResultCode.unknown_user.msg));


      Area.findOne({id: user.currentLocation}).exec(function (err, area) {

        if (err) {
          sails.log.error("---------------[bs]-----{find area}----|查询子区域数据错误|----------------");
          return res.json(ResponseUtil.addErrorMessage());
        }
        sails.log.info("--------------[bs]----{sub area}----------|子区域信息为:|--");
        sails.log.info(JSON.stringify(area));
        if (!area||!area.parent_id) {
          sails.log.info("--------------[bs]----{sub area}----------|子区域为空或子区域的上级区域为空:|--");
          return res.json(ResponseUtil.addErrorMessage());
        }

        Area.findOne({id: area.parent_id}).exec(function (err, parentArea) {

          if (err) {
            sails.log.error("---------------[bs]-----{find area}----|查询父区域数据错误|----------------");
            return res.json(ResponseUtil.addErrorMessage());
          }

          if (!area && !parentArea) {
            sails.log.error("---------------[bs]-----{ area}----|子区域和父区域为空|----------------");
            return res.json(ResponseUtil.addErrorMessage());
          }

          var result = {};
          var userClone = ObjectUtil.cloneAttributes(user);
          userClone = DataFilter.userInfoFilter(userClone);
          userClone.current_location={};
          userClone.current_location.area_one={};
          userClone.current_location.area_two={};
          userClone.current_location.area_one.id = parentArea.id;
          userClone.current_location.area_one.name = parentArea.name;
          userClone.current_location.area_two.id = area.id;
          userClone.current_location.area_two.name = area.name;
          result.data = userClone;
          //返回结果添加头部
          ResponseUtil.addMessageAndResultCode(200001, "success", result);

          sails.log.info("--------------[bs-API]--|返回的JSON数据为:|--------------------");
          sails.log.info(JSON.stringify(result));
          sails.log.info("--------------{end}--|Function:home()|----------|[函数]--个人中心主页|--");
          return res.json(result);

        });

      });


    });

  },
  /**
   * 个人中心地址列表
   * @param openId
   * @param res
   * @returns {*}
   */
  addressList: function (openId, res) {
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));

        return AddressService.list(user.id, res);

      });
    }
  },
  /**
   * 新增收货地址
   * @param openId
   * @param res
   * @returns {*}
   */
  addAddress: function (openId, data, res) {
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else if (data == null || data == undefined || data == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20004, "address is null,please check"));
    else if ((openId == null || openId == undefined || openId == "") && (data == null || data == undefined || data == ""))
      return res.json(ResponseUtil.addExceptionMessageAndCode(20005, "address is null,data is null,please check"));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));
        sails.log.info("---------------0000-method.addAddress()--{@--data--@} is:");
        sails.log.info(data);
        data = JSON.parse(data);
        sails.log.info("---------------0000-method.addAddress()--{@--after JSON.parse data--@} is:");
        sails.log.info(data);
        if (!user.id || !data.contact_number || !data.name || !data.detail_address) {
          return res.json(ResponseUtil.addParamNotRight());
        }
        Address.create({
          user: user.id, province: "", city: "", district: "", detail_address: data.detail_address,
          contact_number: data.contact_number, name: data.name, is_default: 1
        }, function (err, address) {
          if (err) {
            sails.log.info("---------------0000-method.addAddress()--{@--create address error--@} error info is:");
            sails.log.info(err);
          }
          sails.log.info("---------------0000-method.addAddress()--{@--new adress--@} is:");
          sails.log.info(address);
          var addressUpdate = 'update address set is_default=0 where id !=' + address.id + ' and user=' + user.id;
          sails.log.info("---------------0000-method.addAddress()--{@--new adress-addressUpdate-@} is:");
          sails.log.info(addressUpdate);
          Address.query(addressUpdate, function (err, updated) {


            if (err) {
              sails.log.info("---------------0000-method.addAddress()--{@--update is_default--err--@} is:");
              sails.log.info(err);
              return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.new_address_error.code, ResultCode.new_address_error.msg));
            }
            sails.log.info("---------------0000-method.addAddress()--{@--update is_default--@} is:");
            sails.log.info(updated);
            return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.success.code, ResultCode.success.msg));
          })

        })

      });
    }
  },
  /**
   * 删除地址
   * @param openId
   * @param data
   * @param res
   * @returns {*}
   */
  deleteAddress: function (openId, data, res) {
    sails.log.info(openId);
    sails.log.info(data);
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else if (data == null || data == undefined || data == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20004, "address is null,please check"));
    else if ((openId == null || openId == undefined || openId == "") && (data == null || data == undefined || data == ""))
      return res.json(ResponseUtil.addExceptionMessageAndCode(20005, "address is null,data is null,please check"));

    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));
        sails.log.info(data);
        data = JSON.parse(data);
        if (data.id == null || data.id == undefined)
          res.json(ResponseUtil.addExceptionMessageAndCode(20006, "address id null,please check"));
        else if (data.token == null || data.token == undefined)
          res.json(ResponseUtil.addExceptionMessageAndCode(20007, "token id null,please check"));
        else if (data.token != "delete-token-key1")
          res.json(ResponseUtil.addExceptionMessageAndCode(20008, "token is invalid,delete address rejected!!"));
        sails.log.info(data);
        return AddressService.destroyAddress(data.id, res);

      });
    }
  },
  addressInfo: function (openId, id, res) {
    sails.log.info(openId);
    sails.log.info(id);
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else if (id == null || id == undefined || id == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20004, "address is null,please check"));
    else {
      Address.findOne({id: id}).exec(function (err, addr) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (!addr)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_address_not_exist.code, ResultCode.miss_address_not_exist.msg));
        var address = ObjectUtil.cloneAttributes(addr);
        var successData = ResponseUtil.addSuccessMessage();
        for (var j in address) {

          var attr = j.toString();
          if (attr == "id" || attr == "name" || attr == "contact_number"
            || attr == "detail_address" || attr == "is_default") {
            continue;
          }
          delete  address[j];
        }
        successData.address = address;
        return res.json(successData);
      })


    }
  },
  setIsDefault: function (openId, data, res) {
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else if (data == null || data == undefined || data == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20004, "address is null,please check"));
    else if ((openId == null || openId == undefined || openId == "") && (data == null || data == undefined || data == ""))
      return res.json(ResponseUtil.addExceptionMessageAndCode(20005, "address is null,data is null,please check"));

    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));
        sails.log.info(data);
        data = JSON.parse(data);
        if (data.id == null || data.id == undefined)
          res.json(ResponseUtil.addExceptionMessageAndCode(20006, "address id null,please check"));
        sails.log.info(data);

        var queryStr = 'update address set is_default=1 where id=' + data.id;
        sails.log.info("--------------------{queryStr}-----------------");
        sails.log.info(queryStr);
        Address.query(queryStr, function (err, param) {

          if (err) {

            sails.log.info("--------------------{Address.query(queryStr, function (err, param) }-------err is---------");
            sails.log.error(err);
          }


          sails.log.info(param);
          var updateSql = 'update address set is_default=0 where id !=' + data.id + ' and user=' + user.id + ' and is_default=1';
          Address.query(updateSql, function (err, addresses) {
            if (err) {
              sails.log.error(err);

            }
            sails.log.info("--------------------{method.setIsDefault()}------after updating addresses");
            sails.log.info(addresses);
            return res.json(ResponseUtil.addSuccessMessage());
          })


        });

      });
    }
  },
  /**
   * 修改地址
   * @param openId
   * @param data
   * @param res
   * @returns {*}
   */
  updateAddress: function (openId, data, res) {
    sails.log.info("--------------{start}--|Function:updateAddress()|------------");
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!data || data == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_address.code, ResultCode.miss_address.msg));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (!user)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.unknown_user.code, ResultCode.unknown_user.msg));
        sails.log.info("--------------{bs}--{updating address}-----|收到需要修改的新地址为:|-------");
        sails.log.info(JSON.stringify(data));

        sails.log.info("--------------{bs}--{start parse address}-----|开始解析收到的新地址|-------");
        try {

          data = JSON.parse(data);
          sails.log.info("--------------{bs}--{after parsed address}-----|解析后的新地址|-------");
          sails.log.info(JSON.stringify(data));
          // 校验收到的地址信息格式
          if (!data.id || !data.name || !data.contact_number || !data.detail_address)
            return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_address_parameters.code, ResultCode.invalid_address_parameters.msg));

          Address.findOne({id: data.id}).exec(function (err, address) {
            if (err) {
              sails.log.error('---------------[bs]---{find address failed}----------|查找地址失败,请检查数据库日志文件|----------------');
              return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.try_again.code, ResultCode.try_again.msg));

            }
            if (!address)
              return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.address_not_exist_in_database.code, ResultCode.address_not_exist_in_database.msg));
            sails.log.info("-----------[bs]--------{start update address,address }---|开始更新该地址|----------");
            Address.update({id: data.id}, {
              contact_number: data.contact_number, name: data.name, detail_address: data.detail_address
            })
              .exec(function afterword(err, result) {

                if (err) {
                  sails.log.info("-------[bs]------------{update address error}------|更新地址出错|------------");
                  sails.log.error(err);
                  return res.json(ResponseUtil.addErrorMessage());
                }
                sails.log.info("--------[bs]-----------{updated address is}----------|结束更新地址|--------------");
                sails.log.info(JSON.stringify(result));
                return res.json(ResponseUtil.addSuccessMessage());
              });
          });

        } catch (err) {
          sails.log.info("--------[bs]-----------{parse address json data error}----------|解析地址Json数据出错,请检查日志文件|--------------");
          sails.log.error(err);
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.invalid_json_format_address.code, ResultCode.invalid_json_format_address.msg));
        }

      });
    }
  },
  /**
   * 获取用户订单列表
   * @param openId
   * @param openId
   * @param page
   * @param perPage
   * @param sortBy
   * @param order
   * @param res
   */
  myOdersList: function (openId, page, perPage, sortBy, order, res) {
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (page == null || page == undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    else if (perPage == null || perPage == undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_per_page.code, ResultCode.miss_per_page.msg));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(20002, "user donot exist"));
        //TODO:开始处理业务逻辑
        //-----------------------

        var statusJump;
        var orderType;
        var status = 0;
        var user_id = user.id;

        if (status == 0) {
          statusJump = [1, 2];
          orderType = [0, 2];
        } else if (status == 1) {
          statusJump = 3;
          orderType = [0, 2];
        }

        var pageNumber = PageUtil.pageNumber;
        OrderForm.find({
          where: {status: statusJump, user_id: user_id, order_type: orderType},
          skip: (page - 1) * pageNumber,
          limit: pageNumber
        })
          .sort("createdAt DESC")
          .populate('address_id')
          .then(function (orders) {


            var ordersClone = ObjectUtil.cloneAttributes(orders);

            for (var i in ordersClone) {

              var order = ordersClone[i];

              for (var j in order) {

                var attr = j.toString();

                if (attr == "id" || attr == "status" || attr == "order_number" || attr == "order_type"
                  || attr == "createdAt" || attr == "address_id") {
                  continue;
                }
                delete order[j];
              }

              var address = order.address_id;
              for (var k in address) {
                var attr = k.toString();
                if (attr == "id" || attr == "name" || attr == "contact_number"
                  || attr == "detail_address") {
                  continue;
                }
                delete  address[k];
              }

              order.address = address;
              delete order.address_id;
            }

            sails.log.info(ordersClone);
            this.ordersClone = ordersClone;

            var orders = [];
            for (var i in ordersClone) {
              var order = ordersClone[i];
              orders.push(order.id);
            }
            return orders;

          }).then(function (orders) {

            var n = 0;

            Promise.map(orders, function (order_id) {

              return OrderDetail.find({order_form: order_id})
                .then(function (orderdetails) {

                  var orderDetailIDS = [];
                  for (var i in orderdetails) {
                    var order = orderdetails[i];
                    orderDetailIDS.push(order.product);
                  }
                  var m = 0;

                  var products = [];

                  return Promise.map(orderDetailIDS, function (product_id) {

                    return Product.findOne({id: product_id}).populate("productImages").then(function (product) {
                      var data = ObjectUtil.cloneAttributes(product);
                      data = DataFilter.productFilter(data);
                      data.product_amount = orderdetails[m].product_amount;
                      products.push(data);
                      m++;
                    });

                  }).then(function () {

                    return products;

                  }).catch(function (err) {
                    sails.log.error(err);
                    res.json(ResponseUtil.addErrorMessage());
                  });

                }).then(function (products) {

                  this.ordersClone[n].products = products;
                  n++;
                });

            }).then(function () {
              var responseData = ResponseUtil.addSuccessMessage();
              responseData.orders = this.ordersClone;
              res.json(responseData);

            }).catch(function (err) {
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            });

          }).catch(function (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          });

        //-----------------------
        //var status=0;
        //return CenterService.getSellOrderList(user.id,status,page,res);
      });
    }
  },
  /**
   * 查询顾客的订单
   * @param user_id
   * @param status
   * @param page
   * @param res
   */
  getSellOrderList: function (user_id, status, page, res) {
    var statusJump;
    var orderType;

    if (status == 0) {
      statusJump = [1, 2];
      orderType = [0, 2];
    } else if (status == 1) {
      statusJump = 3;
      orderType = [0, 2];
    }

    var pageNumber = PageUtil.pageNumber;
    OrderForm.find({
      where: {status: statusJump, user_id: user_id, order_type: orderType},
      skip: (page - 1) * pageNumber,
      limit: pageNumber
    })
      .sort("createdAt DESC")
      .populate('address_id')
      .then(function (orders) {


        var ordersClone = ObjectUtil.cloneAttributes(orders);

        for (var i in ordersClone) {

          var order = ordersClone[i];

          for (var j in order) {

            var attr = j.toString();

            if (attr == "id" || attr == "status" || attr == "order_number" || attr == "order_type"
              || attr == "createdAt" || attr == "address_id") {
              continue;
            }
            delete order[j];
          }

          var address = order.address_id;
          for (var k in address) {
            var attr = k.toString();
            if (attr == "id" || attr == "name" || attr == "contact_number"
              || attr == "detail_address") {
              continue;
            }
            delete  address[k];
          }

          order.address = address;
          delete order.address_id;
        }

        sails.log.info(ordersClone);
        this.ordersClone = ordersClone;

        var orders = [];
        for (var i in ordersClone) {
          var order = ordersClone[i];
          orders.push(order.id);
        }
        return orders;

      }).then(function (orders) {

        var n = 0;

        Promise.map(orders, function (order_id) {

          return OrderDetail.find({order: order_id})
            .then(function (orderdetails) {

              var orderDetailIDS = [];
              for (var i in orderdetails) {
                var order = orderdetails[i];
                orderDetailIDS.push(order.product);
              }
              var m = 0;

              var products = [];

              return Promise.map(orderDetailIDS, function (product_id) {

                return Product.findOne({id: product_id}).populate("productImages").then(function (product) {
                  var data = ObjectUtil.cloneAttributes(product);
                  data = DataFilter.productFilter(data);
                  data.product_amount = orderdetails[m].product_amount;
                  products.push(data);
                  m++;
                });

              }).then(function () {

                return products;

              }).catch(function (err) {
                sails.log.error(err);
                res.json(ResponseUtil.addErrorMessage());
              });

            }).then(function (products) {

              this.ordersClone[n].products = products;
              n++;
            });

        }).then(function () {
          var responseData = ResponseUtil.addSuccessMessage();
          responseData.orders = this.ordersClone;
          res.json(responseData);

        }).catch(function (err) {
          sails.log.error(err);
          return res.json(ResponseUtil.addErrorMessage());
        });

      }).catch(function (err) {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      });

  },
  /**
   * 确认收货
   * @param openId
   * @param orderId
   * @param res
   * @returns {*}
   */
  confirmOrder: function (openId, orderId, res) {
    sails.log.info("00000");
    sails.log.info(openId);
    sails.log.info(orderId);
    if (openId == null || openId == undefined || openId == "")
      return res.json(ResponseUtil.addExceptionMessageAndCode(20003, "openId is null,please check"));
    else if (orderId == null || orderId == undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_order_id.code, ResultCode.miss_order_id.msg));
    else {
      User.findOne({open_id: openId}).exec(function (err, user) {
        if (err) {
          return res.json(ResponseUtil.addErrorMessage());
        }
        if (user == null || user == undefined)
          return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.unknown_user.code, ResultCode.unknown_user.msg));
        //TODO:开始处理业务逻辑
        // type=1,确认收货
        return OrderFormService.updateStatus(orderId, 1, res);
        //-----------------------
      });
    }
  },
  /**
   * 收藏的微商业务实现
   * @param openId
   * @param page
   * @param res
   */
  myMerchants: function (openId, page, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    if (!page)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    // 开始处理业务逻辑
    User.findOne({open_id: openId}).then(function (user) {
      if (!user)
      // 用户不存在
        return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.unknown_user.code, ResultCode.unknown_user.msg));
      // 通过用户信息查询得到收藏的微商列表
      var pageNumber = 6;
      UserFavorite.find({
        where: {user_id: user.id},
        select: ['favorite_user_id'],
        skip: (page - 1) * pageNumber,
        limit: pageNumber
      }).then(function (userIds) {
        var ids = [];
        for (var j in userIds)
          ids.push(userIds[j].favorite_user_id);

        User.find({id: ids}).then(function (users) {

          for (var i in users) {
            var user = users[i];
            for (var j in user) {
              var attr = j.toString();
              if (attr == "id" || attr == "real_name" || attr == "area" || attr == "head_image" || attr == "wechat_account" || attr == "storeInformation") {
                continue;
              }
              delete  user[j];
            }
            user.head_image = sails.config.imageHostUrl + user.head_image;
          }

          var m = 0;
          Promise.map(users, function (user) {
            return Area.findOne({id: user.area}).then(function (area) {
              if (area) {
                users[m].area = area.name;
              } else {
                users[m].area = "";
              }
              m++;
              return area;
            });
          }).then(function () {
            users.store_information_id = users.storeInformation;
            delete users.storeInformation;
            var responseData = ResponseUtil.addSuccessMessage();
            responseData.micro_business = users;
            return res.json(responseData);

          })
            .catch(function (err) {
              sails.log.error(err);
              return res.json(ResponseUtil.addErrorMessage());
            });


        }).catch(function (err) {
          if (err) {
            sails.log.error(err);
            return res.json(ResponseUtil.addErrorMessage());
          }
        })

      })

    })

  }
};
