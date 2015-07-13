var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({
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
    var params = gadgets.views.getParams();
    console.log("params are ...");
    console.log(params);
    var topic = params.topic;
    var desc = params.desc;
    return(
      <div>
        <h3>
        Add New Agenda Topic
        </h3>
        <form onSubmit={this.handleSubmit}>
          Topic
          <input type='text' className="form-control" ref='topic' placeholder='Enter Agenda Topic' value={topic} />
          <br />
          Description
          <textarea className="form-control" rows="3" ref='desc' placeholder='Describe This Topic' value={desc} />
          <ButtonInput type='submit' bsSize='small'>Submit</ButtonInput>
          <ButtonInput bsSize='small' onClick={this.handleClose}>Close</ButtonInput>
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
