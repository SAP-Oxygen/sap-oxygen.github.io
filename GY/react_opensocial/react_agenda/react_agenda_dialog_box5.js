var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({displayName: "DialogBox",
  handleSubmit: function(e){
    e.preventDefault();
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    gadgets.views.setReturnValue({topic: topic, desc: desc, owner: "", time: 0});
    gadgets.views.close();
  },
  render: function() {
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Add New Agenda Topic"
        ), 
        React.createElement("form", {onSubmit: this.handlesubmit}, 
          React.createElement(Input, {type: "text", label: "Topic", ref: "topic", placeholder: "Enter Agenda Topic"}), 
          React.createElement(Input, {type: "textarea", label: "Details", ref: "desc", placeholder: "Describe This Topic"}), 
          React.createElement(ButtonInput, {type: "submit", bsSize: "small"}, "Submit"), 
          React.createElement(ButtonInput, {bsSize: "small"}, "Close")
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
