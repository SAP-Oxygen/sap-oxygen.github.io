var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({displayName: "DialogBox",
  componentDidMount: function() {
    gadgets.window.adjustHeight();

    var params = gadgets.views.getParams();
    $("#people-picker").select2({
      data: params.people
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var params = gadgets.views.getParams();
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    var time = React.findDOMNode(this.refs.time).value.trim();
    var owner = React.findDOMNode(this.refs.owner).value.trim();
    var item = {topic: topic, desc: desc, owner: owner, time: time};
    var returnValue;
    // if there is any param, it is edit mode so set returnValue with index 
    // else return without index
    returnValue = {index: params.index, item: item};

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
    var time = params.time;
    if (time === 0) {
      time = 10;
    }
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
              React.createElement("input", {type: "text", className: "form-control", ref: "time", defaultValue: time})
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
          React.createElement("input", {type: "hidden", id: "people-picker", ref: "owner", placeholder: "Presenter", style: "width: 100%"}), 
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
