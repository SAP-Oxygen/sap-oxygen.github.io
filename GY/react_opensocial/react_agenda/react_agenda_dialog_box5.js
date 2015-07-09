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
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    gadgets.views.setReturnValue({topic: topic, desc: desc, owner: "", time: 0});
    gadgets.views.close();
  },
  handleClose: function() {
    gadgets.views.close();
  },
  render: function() {
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Add New Agenda Topic"
        ), 
        React.createElement("form", {onSubmit: this.handleSubmit}, 
          "Topic", 
          React.createElement("input", {type: "text", className: "form-control", ref: "topic", placeholder: "Enter Agenda Topic"}), 
          React.createElement("br", null), 
          "Description", 
          React.createElement("textarea", {className: "form-control", rows: "3", ref: "desc", placeholder: "Describe This Topic"}), 
          React.createElement(ButtonInput, {type: "submit", bsSize: "small"}, "Submit"), 
          React.createElement(ButtonInput, {bsSize: "small", onClick: this.handleClose}, "Close")
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
