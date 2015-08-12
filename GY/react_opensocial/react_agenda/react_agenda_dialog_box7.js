var DialogBox = React.createClass({displayName: "DialogBox",
  componentWillMount: function() {
    gadgets.window.adjustWidth(400);
    gadgets.window.adjustHeight(350);
  },
  componentDidMount: function() {
    var params = gadgets.views.getParams();
    $("#people-picker").select2({
      data: params.people,
      width: "100%"
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var item = gadgets.views.getParams().item;
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    var time = React.findDOMNode(this.refs.time).value.trim();
    var owner = React.findDOMNode(this.refs.owner).value.trim();
    var color = React.findDOMNode(this.refs.color).value.trim().toLowerCase();
    var item = {id: item.id, topic: topic, desc: desc, owner: owner, time: time, color: color};
    var returnValue = {item: item};

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
    var item = params.item;
    var topic = item.topic;
    var desc = item.desc;
    var time = item.time;
    if (time === 0) {
      time = 10;
    }
    var owner = params.owner;
    var color = item.color;
    return(
      React.createElement("div", null, 
        React.createElement("h3", null, 
        "Edit Agenda Item"
        ), 
        React.createElement("form", {className: "form-horizontal", onSubmit: this.handleSubmit}, 
          React.createElement("input", {type: "text", className: "form-control input-field", ref: "topic", placeholder: "Title", defaultValue: topic}), 
          React.createElement("br", null), 
          React.createElement("div", {className: "container-fluid"}, 
            React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-xs-3"}, 
              React.createElement("input", {type: "text", maxLength: "3", className: "form-control input-field", ref: "time", defaultValue: time})
            ), 
            React.createElement("div", {className: "col-xs-2"}, "minutes"), 
            React.createElement("div", {className: "col-xs-5 pull-right"}, 
              React.createElement("select", {className: "form-control input-field", ref: "color", defaultValue: color}, 
                React.createElement("option", {value: "none"}, "None"), 
                React.createElement("option", {value: "grey"}, "Grey"), 
                React.createElement("option", {value: "blue"}, "Blue")
              )
            )
            )
          ), 
          React.createElement("input", {type: "hidden", id: "people-picker", ref: "owner", placeholder: "Presenter", defaultValue: owner}), 
          React.createElement("textarea", {className: "form-control input-field text-area", rows: "4", ref: "desc", placeholder: "Notes", defaultValue: desc}), 
          React.createElement("div", {className: "form-group pull-right"}, 
            React.createElement("button", {type: "submit", className: "btn btn-primary"}, "Submit"), " ", React.createElement("button", {className: "btn btn-default", onClick: this.handleClose}, "Close")
          )
        )
      )
    );
  }
});

React.render(React.createElement(DialogBox, null), document.body);
