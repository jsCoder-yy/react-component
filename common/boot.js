'use strict';
/**
 * 启动设置
 */
import babelPolyfill from "babel-polyfill";

var app = {};
let BASE_PATH = window.BASE_PATH ? window.BASE_PATH : "/";  //默认部署到根目录下
app.BASE_PATH = BASE_PATH;
//webpack设置运行时bundle访问路径
__webpack_public_path__ = BASE_PATH + "viewport/dist/";
//抛出app命名空间
export default app;
