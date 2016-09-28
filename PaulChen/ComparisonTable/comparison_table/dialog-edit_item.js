"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EditDialog = (function (_React$Component) {
  _inherits(EditDialog, _React$Component);

  function EditDialog(props) {
    _classCallCheck(this, EditDialog);

    _get(Object.getPrototypeOf(EditDialog.prototype), "constructor", this).call(this, props);
  }

  _createClass(EditDialog, [{
    key: "saveItem",
    value: function saveItem() {
      var item = {
        text: ReactDOM.findDOMNode(this.refs.content).value.trim(),
        shouldDelete: false
      };
      if (this.validateItem(item)) {
        gadgets.views.setReturnValue(item);
        gadgets.views.close();
      }
    }
  }, {
    key: "validateItem",
    value: function validateItem(item) {
      var length = item.text.length;
      if (length != 0) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "cancel",
    value: function cancel() {
      gadgets.views.setReturnValue(null);
      gadgets.views.close();
    }
  }, {
    key: "deleteItem",
    value: function deleteItem() {
      var item = {
        shouldDelete: true
      };
      gadgets.views.setReturnValue(item);
      gadgets.views.close();
    }
  }, {
    key: "moveCaretToEnd",
    value: function moveCaretToEnd(el) {
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var type = this.props.type;
      var existingContent = this.props.existingContent;
      var title = '';
      if (type === "item") {
        title = getLocale("edit_item");
      } else {
        title = getLocale("edit_topic");
      }
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "dialog-header" },
          title
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "dialog-section" },
            React.createElement(
              "textarea",
              { id: "content", ref: "content" },
              existingContent
            )
          ),
          React.createElement(
            "div",
            { className: "dialog-buttons" },
            React.createElement(
              "button",
              { className: "btn btn-primary", onClick: function () {
                  return _this.saveItem();
                } },
              getLocale("save")
            ),
            React.createElement(
              "button",
              { className: "btn", onClick: function () {
                  return _this.cancel();
                } },
              getLocale("cancel")
            ),
            React.createElement(
              "button",
              { className: "btn btn-left", onClick: function () {
                  return _this.deleteItem();
                } },
              getLocale("delete")
            )
          )
        )
      );
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var content = ReactDOM.findDOMNode(this.refs.content);
      content.focus();
      this.moveCaretToEnd(content);

      gadgets.window.adjustHeight();
      gadgets.window.adjustWidth();
    }
  }]);

  return EditDialog;
})(React.Component);

gadgets.util.registerOnLoadHandler(function () {
  var params = gadgets.views.getParams();
  gadgets.sapjam.asyncMessage.get(params.paramsKey, function (existingContent) {
    ReactDOM.render(React.createElement(EditDialog, _extends({}, gadgets.views.getParams(), { existingContent: existingContent })), document.getElementById('react-mount'));
  });
});