var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var DialogBox = React.createClass({displayName: "DialogBox",
  render: function() {
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Add New Agenda Topic"
        ), 
        React.createElement("form", null, 
          React.createElement(Input, {type: "text", label: "Topic", placeholder: "Enter Agenda Topic"}), 
          React.createElement(Input, {type: "textarea", label: "Details", placeholder: "Describe This Topic"})
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
