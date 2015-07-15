var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({displayName: "DialogBox",
  componentDidMount: function() {
    // gadgets.window.adjustHeight();
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var params = gadgets.views.getParams();
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    var item = {topic: topic, desc: desc, owner: "", time: 0}
    var returnValue;
    // if there is any param, it is edit mode so set returnValue with index 
    // else return without index
    if (!$.isEmptyObject(params)) {
      returnValue = {index: params.index, item: item};
    } else {
      returnValue = item;
    }
    gadgets.views.setReturnValue(returnValue);
    gadgets.views.close();
  },
  handleClose: function() {
    gadgets.views.close();
  },
  render: function() {
    // var params = gadgets.views.getParams();
    var params = {};
    console.log("params are ...");
    console.log(params);
    var topic = params.topic;
    var desc = params.desc;
    return(
      React.createElement("div", {className: "container-fluid"}, 
        React.createElement("h3", null, 
        "Edit Agenda Item"
        ), 
        React.createElement("form", {className: "form-horizontal", onSubmit: this.handleSubmit}, 
          React.createElement("input", {type: "text", className: "form-control", ref: "topic", placeholder: "Title", defaultValue: topic}), 
          React.createElement("br", null), 
          React.createElement("div", {className: "container-fluid"}, 
            React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-xs-3 nopadding"}, 
              React.createElement("input", {type: "text", className: "form-control", ref: "min", defaultValue: "10"})
            ), 
            React.createElement("div", {className: "col-xs-2 nopadding"}, "minutes"), 
            React.createElement("div", {className: "col-xs-5 nopadding pull-right"}, 
              React.createElement("select", {className: "form-control"}, 
                React.createElement("option", null, "White"), 
                React.createElement("option", null, "Grey"), 
                React.createElement("option", null, "Black")
              )
            )
            )
          ), 
          React.createElement("br", null), 
          React.createElement("input", {type: "text", className: "form-control", ref: "presenter", placeholder: "Presenter", defaultValue: topic}), 
          React.createElement("br", null), 
          React.createElement("textarea", {className: "form-control", rows: "3", ref: "desc", placeholder: "Notes", defaultValue: desc}), 
          React.createElement("br", null), 
          React.createElement("div", {className: "form-group pull-right"}, 
            React.createElement("button", {type: "submit", className: "btn btn-primary"}, "Submit"), " ", React.createElement("button", {className: "btn btn-default", onClick: this.handleClose}, "Close")
          )
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);