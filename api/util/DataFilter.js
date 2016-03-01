/**
 * Created by jcy on 15/8/27.
 */

var ResponseUtil = require('../util/ResponseUtil');
var ObjectUtil = require("./ObjectUtil");
var Promise = require("bluebird");
var moment = require('moment');
var UUID = require('node-uuid');

module.exports = {

  /**
   * 过滤product
   * @param product
   * @returns {*}
   */
  productFilter: function (product) {
    //retain less
    for (var k in product) {

      var attr = k.toString();

      if (attr == "id" || attr == "name" || attr == "productImages"
        || attr == "selling_price" || attr == "wholesale_price" || attr == "description" || attr == "type") {
        continue;
      }
      delete product[k];
    }

    //retain more
    if(!product.productImages || product.productImages.length == 0 || !product.productImages[0]){
      product.product_image = null;
      delete product.productImages;
      return product;
    }else{
      var images = product.productImages;
      //TODO:
      for (var j in images) {

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
      delete product.productImages;
      return product;
    }
  },
  /**
   * 过滤product数组
   * @param products
   * @returns {*}
   */
  productArrayFilter: function (products) {

    var data = products;
    for (var i in data) {

      var product = data[i];
      this.productFilter(product);

    }
    return products;
  },
  /**
   * 过滤product 加类型
   * @param products
   * @param types
   * @returns {*}
   */
  productAndTypeArrayFilter: function (products, types) {

    var data = products;
    for (var i in data) {

      var product = [];
      if(data[i]){
        product =  data[i];
      }
      this.productFilter(product);
      var type = -1;
      if(types[i]){
        product.type = types[i];
      }

    }
    return products;
  },
  /**
   * 过滤productCategory
   * @param category
   * @returns {*}
   */
  productCategoryFilter: function (category) {

    for (var i in category) {
      var attr = i.toString();
      if (attr == "id" || attr == "name") {
        continue;
      }
      delete category[i];
    }
    return category;
  },
  productCategoryArrayFilter: function (categories) {

    for (var i in categories) {
      var category = categories[i];
      this.productCategoryFilter(category);
    }

    return categories;
  },

  /**
   * 过滤Store的产品信息
   * author:tommy
   * @param product
   * @returns {*}
   */
  storeProductFilter: function (product) {

    //retain less
    for (var k in product) {

      var attr = k.toString();
      if (attr == "id" || attr == "productImages" || attr =="selling_price" || attr == "name") {
        continue;
      }
      delete product[k];
    }

    //retain more
    if(!product.productImages || product.productImages.length == 0 || !product.productImages[0]){
      product.product_image = null;
      delete product.productImages;
      return product;
    }else{
      var images = product.productImages;
      //sails.log.info(images);
      for (var j in images) {
        var image = images[j];

        /*if (image.priority == 0) {

          delete image.uuid;
          //delete image.name;
          delete image.createdAt;
          delete image.updatedAt;
          delete image.format;
          delete image.product;
          //delete image.priority;

          product.product_image = image;
          break;
        }*/
        if(image.priority == 0){
          var imageUrl = "";
          for(var i in image){
            var attr = i.toString();
            if(attr == "height" || attr == "width" || attr == "id" || attr == "name" || attr == "priority")
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
      delete product.productImages;
      return product;
    }
  },
  storeProductArrayFilter: function (products) {

    var data = products;

    for (var i in data) {

      var product = data[i];

      this.storeProductFilter(product);
    }
    return products;
  },
  /**
   * @author:tommy
   * @desp过滤商品详情
   * @param product
   * @returns {*}
   */
  productDetailsFilter: function (product) {

    //retain less
    for (var k in product) {
      // 留下{id,name,productImages}
      if (k.toString() == "id" || k.toString() == "productImages" || k.toString() == "name" || k.toString() == "selling_price") {
        continue;
      }
      delete product[k];
    }

    //retain more
    if(!product.productImages || product.productImages.length == 0){
      product.product_images = [];
      return product;
    }else{
      var images = product.productImages;
      sails.log.info(images);
      var imagesResult = [];
      for (var j in images) {

        var image = images[j];

        /*delete image.uuid;
        delete image.name;
        delete image.createdAt;
        delete image.updatedAt;
        delete image.format;
        delete image.product;
        continue;//break;*/
        var imageUrl = "";
        for(var i in image){
          var attr = i.toString();
          if(attr == "height" || attr == "width" || attr == "id" || attr == "name" || attr == "priority")
          {
            continue;
          }
          if(attr == "image"){
            imageUrl = sails.config.imageHostUrl + image[i];
          }
        }
        image.image = imageUrl;
        imagesResult[j] = image;
      }
      delete product.productImages;
      product.productImages = imagesResult;
      return product;
    }

  },
  /**
   * 过滤StoryCulumn
   * author:tommy
   * @param product
   * @returns {*}
   */
  storyColumnFilter: function (storyColumn) {

    //retain less
    for (var k in storyColumn) {

      if (k.toString() == "id" || k.toString() == "name" || k.toString() == "storys") {
        continue;
      }
      delete storyColumn[k];
    }


    //retain more
    if(!storyColumn.storys || storyColumn.storys.length == 0){
      storyColumn.storys = [];
      return storyColumn;
    }else{
      var storys = storyColumn.storys;

      delete storyColumn.storys;
      storyColumn.storys = this.storyArrayFilter(storys);
      sails.log.info("------@storyColumn");
      sails.log.info(storyColumn);
      return storyColumn;
    }

  },
  /**
   * 过滤Story信息
   * @param story
   * @returns {*}
   */
  storyDetailsFilter: function (story) {

    //retain less
    for (var k in story) {

      if (k.toString() == "id" || k.toString() == "storyImages" || k.toString() == "title") {
        continue;
      }
      delete story[k];
    }

    //retain more
    if(!story.storyImages || story.storyImages.length == 0){
      story.storyImages = [];
      return story;
    }else{
      var images = story.storyImages;
      for (var j in images) {
        var image = images[j];

        delete image.uuid;
        delete image.name;
        delete image.createdAt;
        delete image.updatedAt;
        delete image.format;
        delete image.story;

        /*var imageUrl = "";
        for(var i in image){
          var attr = i.toString();
          if(attr == "height" || attr == "width" || attr == "id" || attr == "priority")
          {
            continue;
          }
          if(attr == "image"){
            imageUrl = sails.config.imageHostUrl + image[i];
          }
        }
        image.image = imageUrl;*/

      }
      return story;
    }

  },
  /**
   * 过滤Story数组
   * @param storys
   * @returns {*}
   */
  storyArrayFilter: function (storys) {

    var datas = storys;

    for (var i in datas) {

      var data = datas[i];
      this.storyFilter(data);

    }
    return storys;
  },
  storyFilter: function (story) {

    //retain less
    for (var k in story) {

      if (k.toString() == "id" || k.toString() == "storyImages" || k.toString() == "title") {
        continue;
      }
      delete story[k];
    }

    //retain more
    if(!story.storyImages || story.storyImages.length == 0){
      story.storyImages = [];
      return story;
    }else{
      var images = story.storyImages;
      for (var j in images) {
        var image = images[j];

        if (image.priority == 0) {

          delete image.uuid;
          delete image.name;
          delete image.createdAt;
          delete image.updatedAt;
          delete image.format;
          delete image.story;
          delete image.priority;

          story.story_image = image;
          break;
        }

      }
      sails.log.info("story.storyImages");
      delete story.storyImages;
      sails.log.info(story.storyImages);
      sails.log.info(story);
      return story;
    }

  },
  /**
   * 故事分类过滤
   * @param category
   * @returns {*}
   */
  storyCategoryFilter: function (category) {

    for (var i in category) {
      var attr = i.toString();
      if (attr == "id" || attr == "name") {
        continue;
      }
      delete category[i];
    }
    return category;
  },
  storyCategoryArrayFilter: function (categories) {

    for (var i in categories) {
      var category = categories[i];
      this.storyCategoryFilter(category);
    }

    return categories;
  },
  storeBaseInfoFilter: function (storeInformation) {

    //retain less
    for (var k in storeInformation) {
      if (k.toString() == "id" || k.toString() == "name" || k.toString() == "head_image" || k.toString() == "background_image"
        || k.toString() == "announcement" || k.toString() == "rank" || k.toString() == "guest" || k.toString() == "level") {
        continue;
      }
      delete storeInformation[k];
    }

    return storeInformation;
  },
  userInfoFilter: function (user) {
    //retain less
    var current_location=user.currentLocation;
    for (var k in user) {
      if (k.toString() == "id" || k.toString() == "head_image" || k.toString()=="nick_name") {
        continue;
      }
      delete user[k];
    }
    user.current_location=current_location;
    return user;
  }
};
