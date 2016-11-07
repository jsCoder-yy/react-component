/**
 * 帮助库
 */
import $ from "jquery";
import React, {Component} from "react";
import ReactDom from "react-dom";
import app from "./boot.js";
import Dialog from "../widget/dialog/dialog.js";
import Immutable, {Map, List, fromJS} from 'immutable';

var helper = {};
//定义一系列工具
Object.assign(helper, {
  app,
  generateID() {
    //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    return "x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  getPageData(key) {
    var pageData = app._pageData || {};
    return pageData[key];
  },
  setPageData(key, value) {
    var pageData = app._pageData || {};
    if (typeof key === "object") {
      Object.assign(pageData, key);
    } else {
      pageData[key] = value;
    }
    app._pageData = pageData;
  },
  getUrlParam(strParameterName) {
    let strReturn = "";
    let strUrl = window.location.href;
    let checkFound = false;
    let strCmp = strParameterName + "=";
    let strCmpLen = strCmp.length;

    if (strUrl.indexOf("?") > -1) {
      let strParams = strUrl.substr(strUrl.indexOf("?") + 1);
      let arrayParams = strParams.split("&");

      for (let i = 0; i < arrayParams.length; i++) {
        var tempParam = arrayParams[i].split("#");
        arrayParams[i] = tempParam[0];
        if (arrayParams[i].substr(0, strCmpLen) == strCmp) {
          let arrayParam = arrayParams[i].split("=");
          strReturn = arrayParam[1];
          checkFound = true;
          break;
        }
      }
    }
    if (checkFound == false) return '';
    return strReturn;
  },
  jsonToParamStr(json) {
    var paramStr = "";
    if (json) {
      $.each(json, function(i) {
        paramStr += '&' + i + '=' + json[i];
      });
      return paramStr.substr(1);
    }
  },
  mergeJsonObject(jsonbject1, jsonbject2) {
    var resultJsonObject = {};
    for (var attr in jsonbject1) {
      resultJsonObject[attr] = jsonbject1[attr];
    }
    for (var attr in jsonbject2) {
      resultJsonObject[attr] = jsonbject2[attr];
    }
    return resultJsonObject;
  },
  mergeArrayObject(arr1, arr2) {
    let arrTemp = [];
    for (var i = 0; i < arr2.length; i++) {
      if (arr1.indexOf(arr2[i]) == -1) {
        arr1.push(arr2[i]);
      }
    }
    return arr1;
  },
  objectArraySortBy(name) {
    return function(o, p) {
      var a, b;
      if (typeof o === "object" && typeof p === "object" && o && p) {
        a = o[name];
        b = p[name];
        if (a === b) {
          return0;
        }
        if (typeof a === typeof b) {
          return
          a < b ? -1 : 1;
        }
        returntypeofa < typeofb ? -1 : 1;
      } else {
        throw ("error");
      }
    }
  },
  "ajax": (function() {
    let xhrStore = [];
    return function(opts = {}, {
      mask = false, // true/false or jquery selector
        ajaxType = "none", // ignore(等上次请求完才能发请求)/abort(直接中断上次请求)/none(可发多个相同请求)
        withData = true //在ajaxType不等于none时起作用
    } = {}) {
      opts = Object.assign({
        dataType: "json",
        url: "",
        data: {},
      }, opts);
      //处理遮罩
      var maskEl,
        maskRefEl,
        maskRefOffset,
        maskRefTid,
        maskRefExecute,
        maskRefResizer;
      if (mask === true) { //全局遮罩共用一个遮罩
        maskEl = $('.ajax-global-mask');
        if (maskEl.length === 0) {
          maskEl = $('<div class="ajax-global-mask"></div>');
          let spinner = $('<div class="spinner"></div>');
          // let shade = $('<div class="shade"></div>');
          $("body").append(maskEl);
          // maskEl.append(shade);
          // shade.append('<div class="shade-icon"></div>');
          // shade.append('<div class="shade-content">页面加载中...</div>');
          maskEl.append(spinner);
          spinner.append('<div class="spinner-container container1"></div>');
          spinner.append('<div class="spinner-container container2"></div>');
          for (let i = 1; i < 3; i++) {
            for (let j = 1; j < 5; j++) {
              $(".container" + i + "").append('<div class="circle' + j + '"></div>')
            }
          }
        }
        maskEl.show();
      } else if (mask !== false) { //局部遮罩各自用自己的遮罩
        maskEl = $('<div class="ajax-mask ajax-part-mask"></div>');
        maskEl.html('<div class="ajax-mask-inner"><div class="sk-circle">' +
          (() => {
            var arr = [];
            for (let i of Array(16).keys()) {
              arr.push('<div class="sk-circle' + (i + 1) + ' sk-child"></div>');
            }
            return arr.join("");
          })() +
          '</div></div>');
        maskEl.hide().appendTo('body');
        maskRefEl = $(mask);
        maskRefExecute = function() {
          maskRefOffset = maskRefEl.offset();
          maskEl.css({
            "top": maskRefOffset.top,
            "left": maskRefOffset.left,
            "width": maskRefEl.outerWidth(),
            "height": maskRefEl.outerHeight()
          });
        };
        //注册window resize事件
        maskRefResizer = function() {
          clearTimeout(maskRefTid);
          maskRefTid = setTimeout(function() {
            maskRefExecute();
          }, 300);
        };
        $(window).bind('resize', maskRefResizer);
        //先执行一次
        setTimeout(function() {
          maskRefExecute();
          maskEl.show();
        }, 0);
      }
      //处理ajax类型，防止多次请求
      let isIgnore = false;
      if (ajaxType == "abort" || ajaxType == "ignore") {
        xhrStore.some(function(itemData) {
          let data = itemData.data,
            url = itemData.url,
            xhr,
            state;
          //带请求参数判定和不带请求参数判定
          if (opts.url == url && (!withData || (withData && Immutable.is(Immutable.Map(opts.data), Immutable.Map(data))))) {
            xhr = itemData.xhr;
            state = xhr.state();
            if (state === "pending") {
              ajaxType === "abort" ? xhr.abort() : (isIgnore = true);
              return true;
            }
          }
        });
        if (isIgnore) { //需要等待的请求直接返回，不做任何操作
          return;
        }
      }
      var xhr,
        id;
      xhr = $.ajax(opts);
      //生成唯一id
      id = helper.generateID();
      xhr.always(function() {
        //隐藏遮罩
        if (mask === true) { //全局遮罩需要等所有带全局遮罩的请求完成才能隐藏
          if (xhrStore.filter(function(itemData) {
              return itemData.id != id && itemData.mask === true;
            }).every(function(itemData) {
              return itemData.xhr.state() !== "pending";
            })) {
            maskEl.hide();
          }
        } else if (mask !== false) { //局部遮罩各自清除
          maskEl.remove();
          maskEl = null;
          maskRefTid && clearTimeout(maskRefTid) && (maskRefTid = null);
          maskRefResizer && $(window).unbind('resize', maskRefResizer) && (maskRefResizer = null);
        }
        //清除对应存储
        xhrStore = xhrStore.filter(function(itemData) {
          return itemData.id != id;
        });
      });
      //设置存储
      xhrStore.push({
        "xhr": xhr,
        "url": opts.url,
        "data": opts.data,
        "id": id,
        "mask": mask
      });
      return xhr;
    };
  }()),
  c2s(opts = {}, cusOpts = {}) {
    var xhr;
    //预设参数
    opts = Object.assign({
      "data": {}
    }, opts);
    //过滤掉空值
    for (let key of Object.keys(opts.data)) {
      if (opts.data[key] === "" || opts.data[key] === null || opts.data[key] === "null") {
        delete opts.data[key];
      }
    }
    opts.data.randomTime = new Date().getTime()
    cusOpts = Object.assign({
      "mask": true,
      "ajaxType": "ignore", //防止二次提交
      "withData": true,
      "autoApplyUrlPrefix": true, //自动附加请求前缀
      "silentError": false //默认提示错误
    }, cusOpts);
    if (cusOpts.autoApplyUrlPrefix) {
      opts.url = app.BASE_PATH + opts.url;
    }
    xhr = helper.ajax(opts, cusOpts);
    if (xhr) {
      xhr.done(function(responseData) {
        var data;
        if (responseData.errcode) {
          if (!cusOpts.silentError) {
            helper.alert({
              "content": responseData.errmsg,
              "iconType": "error"
            });
          }
        }
      });
      xhr.fail(function() {
        helper.alert({
          "content": "服务端请求失败 ",
          "iconType": "error"
        });
      });
    }
    return xhr;
  },
    /**
    * 提示框
    * @param  {[type]} opt [description]
    * @return {[type]}     [description]
    */
    alert({
        content = "",
        iconType = "success",
        countdown = 3,   //默认3秒倒计时
        onSubmit = function () {}
    } = {}) {
    var countdown,
        tId,
        wEl;
    //准备容器
    wEl = $('<div></div>');
    wEl.appendTo('body');
    var createDialog = function (isVisible) {
      if (isVisible) {
        ReactDom.render(
          <Dialog customTemplate={true} isVisible={true} className="app-alert app-popup-tip">
            <div className="app-popup-tip-inner">
              <div className="app-popup-tip-header"></div>
              <div className="app-popup-tip-main">
                <div className="app-popup-tip-main-inner">
                  <div className={'icon-' + iconType + ' icon-wrapper'}>
                    <div className="icon-box">
                      <div className="icon"></div>
                    </div>
                  </div>
                  <div className="popup-content">{content}</div>
                </div>
              </div>
            </div>
            <div className="close-box">
              <button className="close-btn" type="button" onClick={function () {
                clearInterval(tId);
                if (onSubmit(function () {
                  createDialog(false);
                }) !== false) {  //onSubmit执行不返回false，直接关闭清除alert
                  createDialog(false);
                }
              }}>×</button>
            </div>
            <div className="icon-tl"></div>
            <div className="icon-bl"></div>
            <div className="icon-br"></div>
          </Dialog>, wEl[0]);
      } else {
        ReactDom.unmountComponentAtNode(wEl[0]);
        wEl.remove();
      }
    };
    createDialog(true);
    if (countdown > 0) {
      tId = setInterval(function() {
        countdown--;
        if (countdown <= 0) {
          clearInterval(tId);
          if (onSubmit(function() {
              createDialog(false);
            }) !== false) { //onSubmit执行不返回false，直接关闭清除alert
            createDialog(false);
          }
        }
      }, 1000);
    }
    },
    /**
    * 确认框
    * @return {[type]} [description]
    */
    confirm({
        content = "",
        onSubmit = function () {},
        onCancel = function () {}
    } = {}) {
    var wEl;
    //准备容器
    wEl = $('<div></div>');
    wEl.appendTo('body');

    var confirm = ReactDom.render(
      <Dialog customTemplate={true} openAfterRender={true} className="app-confirm" 
              onAfterClose={function () {
                ReactDom.unmountComponentAtNode(wEl[0]);
                wEl.remove();}}>
      <div className="app-confirm-body">
        <div className="app-confirm-main">
          <div className="confirm-content">{content}</div>
        </div>
      </div>
      <div className="app-confirm-footer">
        <div className="footer-l">
          <button className="btn-cancel" type="button" 
            onClick={function () {if (onCancel(confirm.close) !== false) {confirm.close();}}}>取&nbsp;消</button>
        </div>
        <div className="footer-r">
          <button className="btn-submit" type="button" 
            onClick={function () {if (onSubmit(confirm.close) !== false) {confirm.close();}}}>确&nbsp;认</button>
        </div>
      </div>
    </Dialog>, wEl[0]);
  },
  getDistImagePath(imagePath) {
    var imageName = imagePath.split("/").pop();
    return app.BASE_PATH + "viewport/dist/image/" + imageName;
  },
  log: function(data) {
    var loggerEl = $('#logger');
    if (!loggerEl.length) {
      loggerEl = $('<div id="logger"></div>');
      loggerEl.css({
        "position": "fixed",
        "top": 0,
        "right": 0,
        "z-index": 10000,
        "background": "white"
      }).appendTo('body');
    }
    loggerEl.html(JSON.stringify(data));
  },
  formatNumber(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    let l = s.split(".")[0].split("").reverse(),
      r = s.split(".")[1];
    let t = "";
    for (let i = 0; i < l.length; i++) {
      t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
  }
});
//预设置window.APP_DATD里的信息
if (window.PAGE_DATA) {
  helper.setPageData(PAGE_DATA);
  PAGE_DATA = null;
  window.PAGE_DATA = null;
}
export default helper;