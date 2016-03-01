/**
 * Product_imageController
 *
 * @description :: Server-side logic for managing product_images
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var FileUtil = require('../util/FileUtil');
var ResponseUtil = require('../util/ResponseUtil');
var gm = require('gm');
var Promise = require('bluebird');
var fs = require("fs");


module.exports = {

  /**
   * 上传商品图片，商品图片分为：
   * origin(大于640x640),medium(640x640),small(300x300),icon(300x300,质量压缩到10%)
   * @param req
   * @param res
   */
  upload: function (req,res) {

    var dirName = FileUtil.imageFoldPath+FileUtil.uploadProductImageDir;

    function errorResponse(err){
      if (err) {
        sails.log.error(err);
        return res.json(ResponseUtil.addErrorMessage());
      }
    }

    req.file('file').upload({
      maxBytes:5000000,
      dirname:dirName
    }, function (err,uploadImageFiles) {

      errorResponse(err);

      if (uploadImageFiles.length == 0) {
        return res.json(ResponseUtil.addErrorMessage());
      }

      var imageFileName = uploadImageFiles[0].fd;

      var pathArr = imageFileName.split('/');
      var imageName = pathArr[pathArr.length - 1];
      var imageNameArr = imageName.split('.');

      var originImagePath = imageNameArr[0] + "_origin." + imageNameArr[1];
      var mediumImagePath = imageNameArr[0] + "_medium." + imageNameArr[1];
      var smallImagePath = imageNameArr[0] + "_small." + imageNameArr[1];
      var iconImagePath = imageNameArr[0] + "_icon.jpg";

      var originImageDir = dirName+"origin/";
      var mediumImageDir = dirName+"medium/";
      var smallImageDir  = dirName+"small/";
      var iconImageDir   = dirName+"icon/";


      fs.exists(originImageDir, function (result) {



        function dealImage(){

          var originAbsolutePath = originImageDir+originImagePath;
          var mediumAbsolutePath = mediumImageDir+mediumImagePath;
          var smallAbsolutePath = smallImageDir+ smallImagePath;
          var iconAbsolutePath = iconImageDir+ iconImagePath;

          var imageHttpPath = FileUtil.uploadProductImageDir + "small/"+ smallImagePath;


          gm(imageFileName)
            .autoOrient()
            .write(originAbsolutePath, function (err) {

              errorResponse(err);

              gm(imageFileName)
                .resize(640, 640, '!') //加('!')强行把图片缩放成对应尺寸640x640！
                .autoOrient()
                .write(mediumAbsolutePath, function (err) {

                  return errorResponse(err);

                  gm(imageFileName)
                    .resize(300, 300, '!') //加('!')强行把图片缩放成对应尺寸300x300！
                    .autoOrient()
                    .write(smallAbsolutePath, function (err) {

                      errorResponse(err);

                      gm(smallAbsolutePath)
                        .quality(10)
                        .write(iconAbsolutePath, function (err) {



                          fs.unlink(imageFileName, function () {

                            var responseData = {
                              result_code:200001,
                              result_msg:"success",
                              image: imageHttpPath,
                              width: 300,
                              height: 300,
                              format: imageNameArr[1]
                            };
                            res.json(responseData);

                          });

                        });
                    });
                });
            });
        }




        if(result){
          dealImage();
        }else{
           fs.mkdir(originImageDir,0777, function (err) {


             errorResponse(err);

             fs.mkdir(mediumImageDir,0777, function (err) {

               errorResponse(err);

               fs.mkdir(smallImageDir,0777,function(err){

                 errorResponse(err);

                 fs.mkdir(iconImageDir,0777, function (err) {

                   errorResponse(err);

                   dealImage();
                 });

               });

             });

           });
        }
      });
    });
  }

};

