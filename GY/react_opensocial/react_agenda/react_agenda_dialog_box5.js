var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({displayName: "DialogBox",
  handleSubmit: function(e){
    e.preventDefault();
  },
  render: function() {
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Add New Agenda Topic"
        ), 
        React.createElement("form", {onSubmit: this.handlesubmit}, 
          React.createElement(Input, {type: "text", label: "Topic", placeholder: "Enter Agenda Topic"}), 
          React.createElement(Input, {type: "textarea", label: "Details", placeholder: "Describe This Topic"}), 
          React.createElement(ButtonInput, {type: "submit", bsSize: "small"}, "Submit"), 
          React.createElement(ButtonInput, {bsSize: "small"}, "Close")
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
