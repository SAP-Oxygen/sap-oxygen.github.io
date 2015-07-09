var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Button = ReactBootstrap.Button;

var DialogBox = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    var topic = React.findDOMNode(this.refs.topic).value.trim();
    var desc = React.findDOMNode(this.refs.desc).value.trim();
    gadgets.views.setReturnValue({topic: topic, desc: desc, owner: "", time: 0});
    gadgets.views.close();
  },
  render: function() {
    return(
      <div>
        <h3>
        Add New Agenda Topic
        </h3>
        <form onSubmit={this.handlesubmit}>
          <Input type='text' label='Topic' ref='topic' placeholder='Enter Agenda Topic' />
          <Input type='textarea' label='Details' ref='desc' placeholder='Describe This Topic' />
          <ButtonInput type='submit' bsSize='small'>Submit</ButtonInput>
          <ButtonInput bsSize='small'>Close</ButtonInput>
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
