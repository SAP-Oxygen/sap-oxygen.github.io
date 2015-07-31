var DialogBox = React.createClass({
  componentDidMount: function() {
    gadgets.window.adjustHeight();

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
      <div className="container-fluid">
        <h3>
        Edit Agenda Item
        </h3>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <input type="text" className="form-control" ref="topic" placeholder="Title" defaultValue={topic} />
          <br />
          <div className="container-fluid">
            <div className="row">
            <div className="col-xs-3 nopadding">
              <input type="text" className="form-control" ref="time" defaultValue={time} />
            </div>
            <div className="col-xs-2 nopadding">minutes</div>
            <div className="col-xs-5 nopadding pull-right">
              <select className="form-control" ref="color" defaultValue={color}>
                <option value="none">None</option>
                <option value="grey">Grey</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            </div>
          </div>
          <br />
          <input type="hidden" id="people-picker" ref="owner" placeholder="Presenter" defaultValue={owner} />
          <br />
          <textarea className="form-control" rows="3" ref="desc" placeholder="Notes" defaultValue={desc} />
          <br />
          <div className="form-group pull-right">
            <button type="submit" className="btn btn-primary">Submit</button> <button className="btn btn-default" onClick={this.handleClose}>Close</button>
          </div>
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
