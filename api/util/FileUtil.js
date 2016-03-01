/**
 * Created by jcy on 15/8/27.
 */

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

module.exports = {

  baseFilePath:'/Library/WebServer/Documents/microbusiness',
  host:'http://101.200.174.126:16888',
  imageFoldPath:'/home/ftp',
  uploadTemporaryCacheDir:'/upload/micro_business/production/TemporaryCacheDir/',
  uploadHeadImageDir:'/upload/micro_business/production/user/head_image/',
  uploadIdCardImageDir:'/upload/micro_business/production/user/idCard_image/',
  uploadProductImageDir:'/upload/micro_business/production/product_image/',
  uploadBackgroundImageDir:'/upload/micro_business/production/store/background_image/',
  deleteFile: function (filePath,deleteMessage) {
    fs.unlink(filePath, function(err) {
      if (err) {
        sails.log.info('delete file error:',err);
      } else {
        sails.log.info(deleteMessage);
      }
    });
  },
  moveFile: function (oldFilePath,newfileName,moveMessage) {
    fs.rename(oldFilePath,newfileName, function (err) {
      if (err) {
        sails.log.info('move file error:',err);
      } else {
        sails.log.info(moveMessage);
      }
    })
  },
  isFileExist: function (filePath) {
    return new Promise(function (resolve, reject) {
      sails.log.info('start promise call');
      fs.exists(filePath, function (result) {
        sails.log.info('start file exist check',result);
        resolve(result);

      })

    });
  },
  //创建多层文件夹 同步
  mkdirsSync: function(dirpath, mode) {
    return new Promise(function (resolve,reject) {

      if (!fs.existsSync(dirpath)) {
        var pathtmp = path.sep;
        dirpath.split(path.sep).forEach(function (dirname) {

          if(dirname!=''){
            if (pathtmp) {
              pathtmp = path.join(pathtmp, dirname);
            }
            else {
              pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
              fs.mkdirSync(pathtmp, mode);
            }
          }
        });

        if(fs.existsSync(dirpath)){
          resolve(true);
        }else{
          reject(false);
        }
      }
    });
  }

};
