var Sequelize = require("sequelize").Sequelize;
var _account = require("./account");
var _address = require("./address");
var _album = require("./album");
var _bg_img = require("./bg_img");
var _comment_record = require("./comment_record");
var _data = require("./data");
var _demand = require("./demand");
var _demand_evaluate = require("./demand_evaluate");
var _feedback = require("./feedback");
var _goods_record = require("./goods_record");
var _idcard = require("./idcard");
var _instrument = require("./instrument");
var _level = require("./level");
var _message = require("./message");
var _pay = require("./pay");
var _price_record = require("./price_record");
var _production = require("./production");
var _register = require("./register");
var _school = require("./school");
var _skill = require("./skill");
var _team = require("./team");
var _team_user = require("./team_user");
var _user = require("./user");
var _user_attention_user = require("./user_attention_user");
var _video = require("./video");
var _view_record = require("./view_record");

function initModels(sequelize) {
  var account = _account(sequelize, Sequelize);
  var address = _address(sequelize, Sequelize);
  var album = _album(sequelize, Sequelize);
  var bg_img = _bg_img(sequelize, Sequelize);
  var comment_record = _comment_record(sequelize, Sequelize);
  var data = _data(sequelize, Sequelize);
  var demand = _demand(sequelize, Sequelize);
  var demand_evaluate = _demand_evaluate(sequelize, Sequelize);
  var feedback = _feedback(sequelize, Sequelize);
  var goods_record = _goods_record(sequelize, Sequelize);
  var idcard = _idcard(sequelize, Sequelize);
  var instrument = _instrument(sequelize, Sequelize);
  var level = _level(sequelize, Sequelize);
  var message = _message(sequelize, Sequelize);
  var pay = _pay(sequelize, Sequelize);
  var price_record = _price_record(sequelize, Sequelize);
  var production = _production(sequelize, Sequelize);
  var register = _register(sequelize, Sequelize);
  var school = _school(sequelize, Sequelize);
  var skill = _skill(sequelize, Sequelize);
  var team = _team(sequelize, Sequelize);
  var team_user = _team_user(sequelize, Sequelize);
  var user = _user(sequelize, Sequelize);
  var user_attention_user = _user_attention_user(sequelize, Sequelize);
  var video = _video(sequelize, Sequelize);
  var view_record = _view_record(sequelize, Sequelize);


  return {
    account,
    address,
    album,
    bg_img,
    comment_record,
    data,
    demand,
    demand_evaluate,
    feedback,
    goods_record,
    idcard,
    instrument,
    level,
    message,
    pay,
    price_record,
    production,
    register,
    school,
    skill,
    team,
    team_user,
    user,
    user_attention_user,
    video,
    view_record,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
