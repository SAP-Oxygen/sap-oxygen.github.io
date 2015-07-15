var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({
  componentDidMount: function() {
    // gadgets.window.adjustHeight();
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
    if (!$.isEmptyObject(params)) {
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
    // var params = gadgets.views.getParams();
    var params = {};
    console.log("params are ...");
    console.log(params);
    var topic = params.topic;
    var desc = params.desc;
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
              <input type="text" className="form-control" ref="min" defaultValue="10" />
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
          <input type="text" className="form-control" ref="presenter" placeholder="Presenter" defaultValue={topic} />
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
