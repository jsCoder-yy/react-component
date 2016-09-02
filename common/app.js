/**
 * 公共逻辑处理
 */
import helper from "./helper.js";
import $ from "jquery"

//动态调整rem值
//$(window).resize(resizeRem);
resizeRem();

/**
 * resizeRem
 *
 * @returns {undefined}
 */
function resizeRem() {
  let screenHeight = $(window).height();
  $('body').css('min-height', screenHeight);
  var winEl = $(window),
  baseFontSize = 50,
  baseWidth = 1125,
  winWidthSize = Math.min(winEl.width(), winEl.height());
  if (winWidthSize > 560) {
    winWidthSize = 560;
  }
  if (winWidthSize < 270) {
    winWidthSize = 270;
  }
  $('html').css({
    fontSize: winWidthSize / baseWidth * baseFontSize + 'px'
  });
}

export default {};
