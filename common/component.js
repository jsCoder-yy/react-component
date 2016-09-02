/**
 * 基础组件
 */
import React, { Component } from 'react';
import PureRenderMixin from "react-addons-pure-render-mixin";
import reactMixin from "react-mixin";

class BaseComponent extends Component {
  constructor(props) {
      super(props);
  }
}
reactMixin.onClass(BaseComponent, PureRenderMixin);
export {
  BaseComponent
}
