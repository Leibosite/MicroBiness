/**
 * 微信公众号接口
 * Created by tommy on 15/9/10.
 */
var API = require('wechat-api');
var api = new API(sails.config.wechatAppId, sails.config.wechatSecret);
var OAuth = require('wechat-oauth');
var client = new OAuth(sails.config.wechatAppId, sails.config.wechatSecret);
var ResponseUtil = require("../../util/ResponseUtil");
var Promise = require('bluebird');
module.exports = {

  /**
   * 首次受到前端请求时进行用户验证
   * @param req
   * @param res
   */
  checkUser: function (req, res) {


  },
  /**
   * 微信授权和回调，微信有一个唯一的id是openid，它是辨别的唯一标识
   * 拦截用户请求，重定向到用户授权验证功能
   * @param req
   * @param res
   */
  oauthRedir: function (req, res) {
    sails.log.info("--------------{start}--|Function:oauthRedir()|------|获取用户请求的URL|------");
    var url = client.getAuthorizeURL(sails.config.wechatDomain + '/wechat/center', '', sails.config.oauthMode);
    sails.log.info("URL: " + url);
    sails.log.info("--------------{end}--|Function:oauthRedir()|------|开始重定向到URL|------");
    res.redirect(url);
  },
  /**
   * 用户授权
   * @param req
   * @param res
   */
  oauthUser: function (req, res) {
    sails.log.info("--------------{start}--|Function:oauthUser()|------|开始验证用户接入的权限|------");

    var code = req.param('code');
    if (!code) {
      sails.log.info("[bs]-------{code}----|code为空,重定向到/wechat/center再次获取code|");
      res.redirect('/wechat/center');
      res.end();
    }

    sails.log.info("--------[bs]-----------{code}-------------");
    sails.log.info(code);

    client.getAccessToken(code, function (err, result) {
      if(err){
        sails.log.error("--------------[bs]--------{getAccessToken error}--------|获取accessToken错误|-----------------");
        sails.log.error(err);
      }
      sails.log.info("--------[bs]-----------{client.getAccessToken:result}-------------");
      sails.log.info(result);

      var accessToken = result.data.access_token;
      var openId = result.data.openid;

      sails.log.info("--------------[db]---[start]-----{find user by open_id}--------|通过open_id查询用户|-----------------");
      sails.log.info("--------------[bs]---[open_id]-----:"+openId);
      var reUrl = sails.config.noLocationRedirectUrl + openId;
      User.findOne({open_id: openId}).then(function (user) {

        if (!user) {
          sails.log.info("--------[bs]-----------{user is null}---------|数据库中不存在该用户,开始从微信端获取用户的基本信息|----");
          client.getUser(openId, function (err, result) {
            if(err){
              sails.log.info("--------[bs]-----------{user is null}---------|查询user表发生错误|----");

            }
            var oauth_user = result;
            //新建用户
            sails.log.info("--------[bs]-----------{oauth_user is}---------|微信端获取用户信息为:|----");
            sails.log.info(JSON.stringify(oauth_user));
            sails.log.info("--------------[db]---[start]-----{create user}--------|开始创建新用户|-----------------");
            return User.create({
              open_id: openId,
              username: oauth_user.nickname,
              nick_name: oauth_user.nickname,
              head_image: oauth_user.headimgurl,
              access_token: accessToken
            }).then(function (err, user) {
              if (err) {
                sails.log.error("-----------[bs]-------{create user error}----------|创建用户失败|--------");
                sails.log.error(err);
              }
              sails.log.info("--------------[db]---[end]-----{create user}--------|结束创建新用户,创建的新用户为:|-----------------");
              sails.log.info(JSON.stringify(user));
              reUrl = sails.config.noLocationRedirectUrl + openId;
              sails.log.info('redirect url:' + reUrl);
              res.redirect(reUrl);
              res.end();
              return user;
            });
          });
        } else {
          sails.log.info("--------[bs]-----------{user is exist}---------|数据库中存在该用户,开始更新用户的accessToken|----");
          // 更新用户AccessToken
          User.update({open_id: openId}, {access_token: accessToken}).exec(function (err, result) {
            if (err) {
              sails.log.error("-----------[bs]-------{update user error}----------|更新用户失败|--------");
              sails.log.error(err);
            }
            sails.log.info("--------------[db]---[end]-----{update user}--------|结束更新用户,更新的新用户为:|-----------------");
            sails.log.info(JSON.stringify(result));
            if(user.currentLocation)
              reUrl = sails.config.redirectUrl + openId;
            sails.log.info('redirect url:');
            sails.log.info(reUrl);
            res.redirect(reUrl);
            res.end();
          });

        }
      }).catch(function (err) {
        sails.log.error(err);
        var responseData = ResponseUtil.addSuccessMessage();
        return res.json(responseData);
      });
    })
  }
}
