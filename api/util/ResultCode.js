/**
 * 定义业务逻辑全局的ResultCode和业务提示的Msg
 * Created by tommy on 15/9/2.
 */
module.exports = {
  success: {
    code: 200001,
    msg: "success"
  },
  server_busy: {
    code: -1,
    msg: "server busy,please wait 1m try again"
  },
  invalid_json_data: {
    code: -3,
    msg: "invalid json data,错误的Json数据，请检查参数"
  },
  network_error: {
    code: -2,
    msg: "network error"
  },
  try_again: {
    code: -4,
    msg: "try again,请重试"
  },
  unknown_user: {
    code: 20002,
    msg: "unknown user,request was rejected!"
  },
  miss_openId: {
    code: 20003,
    msg: "miss openId,openId was required,please check openId"
  },
  miss_address: {
    code: 20004,
    msg: "miss address,address was required,参数{data}缺失,请检查！！"
  },
  miss_page: {
    code: 200020,
    msg: "page miss,param of page was required where type of list request,please check param of page"
  },
  miss_per_page: {
    code: 200021,
    msg: "per_page miss,param of per_page was required where type of list request,please check param of per_page"
  },
  miss_order_id: {
    code: 200022,
    msg: "order_id miss,param of order_id was required when confirm order status,please check param of order_id"
  },
  miss_product_category_id: {
    code: 200023,
    msg: "miss_product_category_id miss,param of product_category_id was required ,please check param of product_category_id"
  },
  miss_page: {
    code: 20000,
    msg: "page miss,param of page was required ,please check param of page"
  },

  miss_product_id: {
    code: 200024,
    msg: "product_id miss,param of product_id was required ,please check param of product_id"
  },
  miss_story_category_id: {
    code: 200025,
    msg: "miss_story_category_id miss,param of miss_story_category_id was required ,please check param of story_category_id"
  },
  miss_story_id: {
    code: 200026,
    msg: "miss_miss_story_id miss,param of miss_story_id was required ,please check param of story_id"
  },
  miss_store_information_id: {
    code: 200027,
    msg: "store_information_id miss,param of store_information_id was required ,please check param of store_information_id"
  },
  store_information_id_not_exist: {
    code: 200028,
    msg: "store_information_id_not_exist in database,please check param of store_information_id"
  },
  product_off_the_shelf: {
    code: 200029,
    msg: "product was already off the shelf"
  },
  miss_product_ids: {
    code: 200030,
    msg: "product_ids miss,param of product_ids was required ,please check param of product_ids"
  },
  miss_order_information: {
    code: 200031,
    msg: "miss_order_information miss,param of miss_order_information was required ,please check param of miss_order_information"
  },
  miss_address_not_exist: {
    code: 200032,
    msg: "address is not exist,please check!"
  },
  miss_order_number: {
    code: 200033,
    msg: "orderNumber is miss,,please check!"
  },
  miss_order_params: {
    code: 200034,
    msg: "miss_order_params is miss,,please check!"
  },
  miss_shop_seller: {
    code: 200035,
    msg: "seller of shop was missed or the status of this shop is invalid,,please check!"
  },
  new_address_error: {
    code: 200036,
    msg: "new address error!"
  },
  faverate_seller_fail: {
    code: 200037,
    msg: "faverate seller fail!"
  },
  miss_faverate_type: {
    code: 200038,
    msg: "faverate seller fail!,请求中缺少参数收藏的type,该参数为type=1,0"
  },
  cancel_faverate_fail: {
    code: 200039,
    msg: "cancel faverate  fail!,用户没有关注该店铺，请关注！"
  },
  user_already_faverate_shop: {
    code: 200040,
    msg: "cancel faverate  fail!,用户已经关注该店铺，请不要重复提交关注请求！"
  },
  shop_column_not_exist: {
    code: 200041,
    msg: "shop culumn is not exist!,该店铺不存在栏目，请检查！"
  },
  shop_column_do_not_contain_any_products: {
    code: 200042,
    msg: "shop column do not contain any products!,该店铺的栏目下不存在任何商品，请添加！"
  },
  shop_product_do_not_exist: {
    code: 200044,
    msg: "shop product do not exist!,该店铺的栏目下不存在任何商品，请添加！"
  },
  shop_commodity_do_not_exist: {
    code: 200045,
    msg: "shop commodity do not exist!,该店铺不存在任何商品，请联系店主上架商品！"
  },
  query_database_error: {
    code: -3,
    msg: "query database error!,请检查数据连接和mysql日志！"
  },
  product_category_do_not_exist: {
    code: 200046,
    msg: "product category do not exist!,产品分类不存在，请联系平台管理员添加产品分类！"
  },
  shop_product_category_do_not_exist: {
    code: 200047,
    msg: "shop product category do not exist!,该店铺的产品分类不存在，请店主添加产品分类！"
  },
  shop_commodity_already_shelve: {
    code: 200048,
    msg: "shop commodity already shelve!,该店铺的商品已经下架！！"
  },
  cmall_product_not_exist: {
    code: 200049,
    msg: "cmall product not exist!,商城产品不存在!！"
  },
  cmall_productIds_is_null: {
    code: 200050,
    msg: "cmall productIds is null!,商品编号数组为空，请检查出入的参数!！"
  },
  cmall_invalid_order_info: {
    code: 200051,
    msg: "cmall invalid order info!,非法的订单数据，请检查!！"
  },
  cmall_generate_order_fail_commodity_out_of_stock: {
    code: 200052,
    msg: "cmall generate order fail,commodity out of stock!,下单失败,部分商品缺货!！"
  },
  cmall_store_keeper_not_exist: {
    code: 200053,
    msg: "cmall store keeper not exist!,店主不存在，请发送Email咨询商城!！"
  },
  cmall_store_commodity_not_available: {
    code: 200055,
    msg: "cmall store commodity not available!,店铺商品不可用，请发送Email咨询店主!！"
  },
  cmall_generate_order_fail: {
    code: 200056,
    msg: "cmall generate order fail,创建订单失败!！"
  },
  invalid_json_format_address: {
    code: 200057,
    msg: "invalid json format address,非法的地址JSON格式,请检查!！"
  },
  invalid_address_parameters: {
    code: 200058,
    msg: "invalid  address parameters,非法的地址参数,请检查!！"
  },
  address_not_exist_in_database: {
    code: 200059,
    msg: "address not exist in database,地址不存在,请检查!！"
  },
  no_next_page: {
    code: 200060,
    msg: "no next page ,无下一页,请检查!！"
  },
};
