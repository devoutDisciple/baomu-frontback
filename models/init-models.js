var Sequelize = require("sequelize").Sequelize;
var _account = require("./account");
var _address = require("./address");
var _album = require("./album");
var _bg_img = require("./bg_img");
var _comment_record = require("./comment_record");
var _content = require("./content");
var _data = require("./data");
var _feedback = require("./feedback");
var _goods_record = require("./goods_record");
var _message = require("./message");
var _notice = require("./notice");
var _posts = require("./posts");
var _register = require("./register");
var _user = require("./user");
var _user_attention_user = require("./user_attention_user");
var _user_copy1 = require("./user_copy1");
var _video = require("./video");
var _view_record = require("./view_record");
var _vote = require("./vote");
var _vote_record = require("./vote_record");

function initModels(sequelize) {
  var account = _account(sequelize, Sequelize);
  var address = _address(sequelize, Sequelize);
  var album = _album(sequelize, Sequelize);
  var bg_img = _bg_img(sequelize, Sequelize);
  var comment_record = _comment_record(sequelize, Sequelize);
  var content = _content(sequelize, Sequelize);
  var data = _data(sequelize, Sequelize);
  var feedback = _feedback(sequelize, Sequelize);
  var goods_record = _goods_record(sequelize, Sequelize);
  var message = _message(sequelize, Sequelize);
  var notice = _notice(sequelize, Sequelize);
  var posts = _posts(sequelize, Sequelize);
  var register = _register(sequelize, Sequelize);
  var user = _user(sequelize, Sequelize);
  var user_attention_user = _user_attention_user(sequelize, Sequelize);
  var user_copy1 = _user_copy1(sequelize, Sequelize);
  var video = _video(sequelize, Sequelize);
  var view_record = _view_record(sequelize, Sequelize);
  var vote = _vote(sequelize, Sequelize);
  var vote_record = _vote_record(sequelize, Sequelize);


  return {
    account,
    address,
    album,
    bg_img,
    comment_record,
    content,
    data,
    feedback,
    goods_record,
    message,
    notice,
    posts,
    register,
    user,
    user_attention_user,
    user_copy1,
    video,
    view_record,
    vote,
    vote_record,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
