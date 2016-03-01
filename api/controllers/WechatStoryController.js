/**
 * 微信公众号Story栏目
 * Created by tommy on 15/9/6.
 */
var StoryService = require("../services/wechat/StoryService");

module.exports = {
  storycolumn: function (req, res) {
    var openId = req.param('openId');
    StoryService.column(openId, res);
  },
  storyCategory: function (req, res) {
    var openId = req.param('openId');
    var page = req.param('page');
    StoryService.storyCategory(openId, page, res);
  },
  storyMore: function (req, res) {
    var openId = req.param('openId');
    // 页数
    var page = req.param('page');
    // 每页的个数
    var limit = req.param('limit');

    var story_category_id = req.param('id');

    StoryService.storyMore(openId, story_category_id, page, limit, res);
  },
  storyDetails: function (req, res) {
    var openId = req.param('openId');

    var story_id = req.param('id');

    StoryService.storyDetails(openId, story_id, res);
  }
  ,
  microbusiness: function (req, res) {
    var openId = req.param('openId');

    var product_id = req.param('productId');

    StoreService.microbusiness(openId, product_id, res);
  }
};
