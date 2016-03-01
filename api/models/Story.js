/**
 * Story.js
 *
 * @description :: 平台故事管理表
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    type: {
      type: 'string',
      size: 20,
      required: true
    },
    title: {
      type: 'string',
      size: 255,
      required: true
    },
    content: {
      type: 'text',
      required: true
    },
    storyCategory: {
      model: 'StoryCategory',
      size: 64
    },

    storyColumn: {
      model: 'StoryColumn',
      size: 64
    },
    storyImages: {
      collection: 'StoryImage',
      via: 'story'
    }
  }
};

