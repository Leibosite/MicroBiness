/**
 * 微信公众号Story业务逻辑处理
 * Created by tommy on 15/9/6.
 */
var ObjectUtil = require("../StoreInformationService");
var ObjectUtil = require("../../util/ObjectUtil");
var ResponseUtil = require("../../util/ResponseUtil");
var DataFilter = require("../../util/DataFilter");
var FileUtil = require("../../util/FileUtil");
var Promise = require('bluebird');
var ResultCode = require('../../util/ResultCode');
var ProductService = require('../ProductService');
module.exports = {

  //Story Home
  /**
   * Story Home页
   * @param openId
   * @param res
   */
  column: function (openId, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));

      StoryColumn.findOne({priority: 0}).then(function (storyColumn) {
        var temp = {};
        temp.story_column_id = storyColumn.id;
        temp.story_column_name = storyColumn.name;
        return temp;
      }).then(function (temp) {
          var pageNumber=4;
          Story.find({where:{storyColumn: temp.story_column_id}, limit: pageNumber}).populate("storyImages").then(function (storys) {

          var data = ObjectUtil.cloneAttributes(storys);

          data = DataFilter.storyArrayFilter(data);

          temp.storys = data;

          ResponseUtil.addMessageAndResultCode(ResultCode.success.code, ResultCode.success.msg, temp);

          return res.json(temp);
        })

      }).catch(function (err) {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      });
    },

  /**
   * 微信公众号商品分类Service,根据传入的商品分类的Id
   * req 携带的数据样例param={ 	"product_category_ids":[7,2] }
   * @param openId
   * @param data
   * @param res
   */
  storyCategory: function (openId, page, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (page === null || page === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));

    var pageNumber = 3;
    StoryCategory.find({skip: (page - 1) * pageNumber, limit: pageNumber}, function (err, categories) {

      if (!categories) {
        sails.log.error(categories);
        res.json(ResponseUtil.addErrorMessage());
      }
      var categoryIDs = [];
      for (var i in  categories) {
        var category = categories[i];
        categoryIDs[i] = category.id;
      }

      var categoriesClone = ObjectUtil.cloneAttributes(categories);

      var categoriesFilter = DataFilter.storyCategoryArrayFilter(categoriesClone);
      //TODO:
      categoriesFilter = ObjectUtil.cloneAttributes(categoriesFilter);
      this.categoriesFilter = categoriesFilter;


      var categoryIDMap = {};
      for (var i in  categoryIDs) {
        var categoryID = categoryIDs[i];
        categoryIDMap["" + categoryID] = i;
      }

      Promise.map(categoryIDs, function (category_id) {
        return Story.find({storyCategory: category_id}).then(function (storys) {
          //sails.log.info("-------products");
          //sails.log.info(products);
          return storys;

        }).then(function (storys) {

          var productIDs = [];
          for (var i in  storys) {
            productIDs.push(storys[i].id);
          }
          //sails.log.info("-------productIDs");
          //sails.log.info(productIDs);
          return Story.find({id: productIDs}).sort("id DESC").populate("storyImages").then(function (storys) {

            var data = ObjectUtil.cloneAttributes(storys);

            data = DataFilter.storyArrayFilter(data);

            var showProducts = [];
            var dataLength;
            if (2 <= data.length) {
              dataLength = 2;
            } else {
              dataLength = data.length;
            }

            for (var n = 0; n < dataLength; n++) {
              sails.log.info(data[n]);
              showProducts.push(data[n]);
            }

            var index = categoryIDMap["" + category_id];

            categoriesFilter[index].storys = showProducts;
            return data;
          })

        })


      }).then(function (storys) {

        var responseData = ResponseUtil.addSuccessMessage();
        var storyInfo = {};
        storyInfo.story_categories = categoriesFilter;
        responseData.story_info = storyInfo;
        return res.json(responseData);
      }).catch(function (err) {
        sails.log.error(err);
      });


    })
  },
  /**
   * 微信公众号商品更多信息，传入参数商品分类ID
   * @param openId
   * @param categoryId
   * @param page
   * @param limit
   * @param res
   */
  storyMore: function (openId, story_category_id, page, limit, res) {
    if (!openId )
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!story_category_id)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_story_category_id.code, ResultCode.miss_story_category_id.msg));
    else if (page === null || page === undefined)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_page.code, ResultCode.miss_page.msg));
    if (limit === undefined)
      limit = 6;

    Story.find({storyCategory: story_category_id}).populate('storyImages')
      .then(function (storys) {
        if (!storys)
          return res.json(ResponseUtil.addErrorMessage());
        return storys;
      }).then(function (storys) {
        // 过滤Products
        var storysClone = ObjectUtil.cloneAttributes(storys);
        storys = DataFilter.storyArrayFilter(storysClone);

        // 过滤Story
        sails.log.info("storyMore()---story");
        sails.log.info(storys);
        var story_category = {};
        story_category.id = story_category_id;
        story_category.storys = storys;
        return story_category;
      }).then(function (story_category) {
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.story_category = story_category;
        return res.json(responseData);

      }).catch(function (err) {
        sails.log.error(err);
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
  },

  /**
   * 微信公众号商品详情
   * @param openId
   * @param product_id
   * @param res
   */
  storyDetails: function (openId, story_id, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!story_id )
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_story_id.code, ResultCode.miss_story_id.msg));

    Story.findOne({id: story_id}).populate('storyImages')
      .then(function (story) {
        if (!story)
          return res.json(ResponseUtil.addErrorMessage());
        return story;
      }).then(function (story) {

        var storyClone = ObjectUtil.cloneAttributes(story);
        // 过滤商品详情
        storyClone = DataFilter.storyDetailsFilter(storyClone);


        return storyClone;
      }).then(function (story) {
        var responseData = ResponseUtil.addSuccessMessage();
        responseData.story = story;
        return res.json(responseData);

      }).catch(function (err) {
        sails.log.error(err);
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
  },
  /**
   * 推荐微商
   * @param openId
   * @param product_id
   * @param res
   */
  microbusiness: function (openId, product_id, res) {
    if (!openId)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_openId.code, ResultCode.miss_openId.msg));
    else if (!product_id)
      return res.json(ResponseUtil.addExceptionMessageAndCode(ResultCode.miss_product_id.code, ResultCode.miss_product_id.msg));
    // 开始处理业务逻辑

    Role.findOne({name: "partner"}).populate("users", {apply_status: 2}).then(function (role) {
      var users = ObjectUtil.cloneAttributes(role.users);
      return users;
    }).then(function (users) {
      sails.log.info("microbusiness-----users");
      sails.log.info(users);

      for (var i in users) {
        var user = users[i];
        for (var j in user) {
          var attr = j.toString();
          if (attr == "id" || attr == "real_name" || attr == "area" || attr == "head_image" || attr == "wechat_account") {
            continue;
          }
          delete  user[j];
        }
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
  },


}
