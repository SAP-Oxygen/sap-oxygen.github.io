var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({
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
    var item = {topic: topic, desc: desc, owner: "", time: time};
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
              <select className="form-control">
                <option>White</option>
                <option>Grey</option>
                <option>Black</option>
              </select>
            </div>
            </div>
          </div>
          <br />
          <input type="hidden" id="people-picker" ref="presenter" placeholder="Presenter" />
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
