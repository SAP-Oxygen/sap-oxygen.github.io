class AddDialog extends React.Component {
  constructor(props) {
    super(props);
  }

  save() {
    const item = {
      text: ReactDOM.findDOMNode(this.refs.content).value.trim()
    };
    if (this.validate(item)) {
      gadgets.views.setReturnValue(item);    
      gadgets.views.close();    
    }
  }

  validate(item) {
    const length = item.text.length;
    if (length != 0) {
      return true;
    } else {
      return false;
    }
  }

  cancel() {
    gadgets.views.setReturnValue(null);
    gadgets.views.close();
  }

  render() {
    var title = getLocale("create_new_item");
    const type = this.props.type;
    var existingContent = "";
    if (type === "ColumnHeader") {
      title = getLocale("edit_column_header");
      existingContent = this.props.existingContent;
    }
    else if (type === "topic") {
      title = getLocale("add_topic");
    }
    return (
      <div>
        <div className="dialog-header">{title}</div>
        <div>
          <div className="dialog-section">
            <textarea id="content" ref="content">{existingContent}</textarea>
          </div>
          <div className="dialog-buttons">
            <button className="btn btn-primary" onClick={() => this.save()}>
              {getLocale("save")}
            </button>
            <button className="btn" onClick={() => this.cancel()}>
              {getLocale("cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    var content = ReactDOM.findDOMNode(this.refs.content);
    content.focus();

    gadgets.window.adjustHeight();
    gadgets.window.adjustWidth();
  }
}

gadgets.util.registerOnLoadHandler(() => {
  ReactDOM.render(<AddDialog {...gadgets.views.getParams()}/>, document.getElementById('react-mount'));
});