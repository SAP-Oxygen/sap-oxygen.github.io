var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({displayName: "DialogBox",
  componentDidMount: function() {
    gadgets.window.adjustHeight();
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
    if (params) {
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
    var params = gadgets.views.getParams();
    console.log("params are ...");
    console.log(params);
    var topic = params.topic;
    var desc = params.desc;
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Add New Agenda Topic"
        ), 
        React.createElement("form", {onSubmit: this.handleSubmit}, 
          "Topic", 
          React.createElement("input", {type: "text", className: "form-control", ref: "topic", placeholder: "Enter Agenda Topic", defaultValue: topic}), 
          React.createElement("br", null), 
          "Description", 
          React.createElement("textarea", {className: "form-control", rows: "3", ref: "desc", placeholder: "Describe This Topic", defaultValue: desc}), 
          React.createElement(ButtonInput, {type: "submit", bsSize: "small"}, "Submit"), 
          React.createElement(ButtonInput, {bsSize: "small", onClick: this.handleClose}, "Close")
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
