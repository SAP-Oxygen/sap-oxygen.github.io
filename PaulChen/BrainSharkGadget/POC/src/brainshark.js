function init(ReactBootstrap, jQuery){
  var BrainSharkGadget = React.createClass({
    getInitialState: function() {
      return {url: "http://www.baidu.com", tempUrl:"http://www.baidu.com", isCollapse: true, isOwner: true, scaleOption: 2, tempScaleOption: 2, height: "400px"};
    },
    
    getSettingsPaneClass: function(){
      if (this.state.isCollapse)
      {
        return "collapse";
      } else {
        return "";
      }
    },
    
    getSettingsPaneLabel: function(){
      if (this.state.isCollapse)
      {
        return "";
      } else {
        return "Settings";
      }
    },
    
    changeCollapseState: function(){
      if (this.state.isCollapse)
      {
        this.setState({isCollapse: false});
      } else {
        this.hideSettinsPane();
      }
    },
    
    getScaleText: function(){
      if (this.state.tempScaleOption == 1){
        return "16:9 without Menu";
      } else if (this.state.tempScaleOption == 2){
        return "16:9 with Menu";
      } else if (this.state.tempScaleOption == 3){
        return "4:3 without Menu";
      } else {
        return "4:3 with Menu";
      }
    },
    
    setScaleOption: function(option){
      this.setState({scaleOption: option});
    },
    
    hideSettingsPane: function(){
      this.setState({isCollapse: true, tempUrl: this.state.url, tempScaleOption: this.state.scaleOption});
    },
    
    okBtnClickHandler: function(){
      if(this.state.url != this.state.tempUrl){
        this.setState({url: this.state.tempUrl});
      }
      
      if(this.state.scaleOption != this.state.tempScaleOption){
        this.setState({scaleOption: this.state.tempScaleOption});
        this.changeHeightBaseOnScaleOption();
      }
      
      this.hideSettingsPane();
    },
    
    changeHeightBaseOnScaleOption: function(){
      if (typeof(gadgets) != "undefined" && gadgets){
        var width = gadgets.window.getViewportDimensions().width;
        if (this.state.tempScaleOption == 1){
          var targetHeight = width * 3 / 4.0;
          this.setState({height: targetHeight});
        }
      }
    },
    
    onSelectHandler: function(eventKey){
      this.setState({tempScaleOption: eventKey});
    },
    
    tempUrlChanged: function(e) {
      this.setState({tempUrl: e.target.value});
    },
    
    adjustHeight: function(){
      typeof(gadgets) != "undefined" && gadgets && gadgets.window.adjustHeight();
    },
    
    componentDidMount: function() {
      this.adjustHeight();
    },

    componentDidUpdate: function() {
      this.adjustHeight();
    },
    
    render: function(){
      var Button = ReactBootstrap.Button;
      var DropdownButton = ReactBootstrap.DropdownButton;
      var MenuItem = ReactBootstrap.MenuItem;
      return(
        <div>
          <div id="input-group-main">
            <Button id="settings-btn" onClick={this.changeCollapseState}>Settings</Button>
          </div>
          <div id="settings-pane" className={this.getSettingsPaneClass()}>
            <div id="settings-pane-label"><h2>{this.getSettingsPaneLabel()}</h2></div>
            <div>
              <table style={{width: "100%"}}>
                <tr style={{height: "50px"}}>
                  <td style={{width: "50px"}}><label className="col-sm-1">URL</label></td>
                  <td><input type="text" className="form-control" name="settings-url" placeholder="https://www.brainshark.com/..." value={this.state.tempUrl} onChange={this.tempUrlChanged}/></td>
                </tr>
                <tr style={{height: "50px"}}>
                  <td style={{width: "50px"}}><label className="col-sm-1 ">Scale</label></td>
                  <td>
                    <DropdownButton title={this.getScaleText()}>
                      <MenuItem eventKey="1" onSelect={this.onSelectHandler}>16:9 without Menu</MenuItem>
                      <MenuItem eventKey="2" onSelect={this.onSelectHandler}>16:9 with Menu</MenuItem>
                      <MenuItem eventKey="3" onSelect={this.onSelectHandler}>4:3 without Menu</MenuItem>
                      <MenuItem eventKey="4" onSelect={this.onSelectHandler}>4:3 with Menu</MenuItem>
                    </DropdownButton>
                  </td>
                </tr>
              </table>
              <div id="settings-input-group">
                <Button onClick={this.okBtnClickHandler} bsStyle="primary" style={{marginLeft: "15px", marginRight: "5px"}}>Save</Button>
                <Button onClick={this.hideSettingsPane}>Cancel</Button>
              </div>
            </div>
          </div>
          <div id="content">
            <iframe id="url-frame" src={this.state.url} style={{height: this.state.height}}></iframe>
          </div>
        </div>
      );
    }
  });

  React.render(<BrainSharkGadget/>, document.body);
}

if (typeof(gadgets) != "undefined" && gadgets) {
  gadgets.util.registerOnLoadHandler(function() { init(ReactBootstrap, jQuery); });
} else {
  init(ReactBootstrap, jQuery);
}