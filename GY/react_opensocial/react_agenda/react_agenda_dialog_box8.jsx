var DialogBox = React.createClass({
  componentWillMount: function() {
    gadgets.window.adjustWidth(400);
  },
  componentDidMount: function() {
    var params = gadgets.views.getParams();
    $("#people-picker").select2({
      data: params.people,
      width: "100%"
    });
    gadgets.window.adjustHeight();
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
      <div>
        <h3>
        Edit Agenda Item
        </h3>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <input type="text" className="form-control input-field" ref="topic" placeholder="Title" defaultValue={topic} />
          <div className="container-fluid container-no-padding">
            <div className="row">
            <div className="col-xs-6">
              <input type="text" maxLength="3" className="form-control input-field input-time" ref="time" defaultValue={time} />
              <span>minutes</span>
            </div>
            <div className="col-xs-6">
              <select className="form-control input-field" ref="color" defaultValue={color}>
                <option value="none">None</option>
                <option value="grey">Grey</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            </div>
          </div>
          <input type="hidden" id="people-picker" ref="owner" placeholder="Presenter" defaultValue={owner} />
          <textarea className="form-control input-field text-area" rows="4" ref="desc" placeholder="Notes" defaultValue={desc} />
          <div className="pull-right">
            <button type="submit" className="btn btn-emphasized">Submit</button> <button className="btn btn-normal" onClick={this.handleClose}>Close</button>
          </div>
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
