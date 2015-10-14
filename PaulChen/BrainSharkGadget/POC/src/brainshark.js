function init(ReactBootstrap, jQuery){
  var BrainSharkGadget = React.createClass({
    getInitialState: function() {
      var url = "";
      if (typeof(wave) != "undefined" && wave) {
        url = wave.getState().get('url', "");
      }
      
      var isCollapse = true;
      if (url == ""){
        isCollapse = false;
      }
      
      var isOwner = false;
      if (typeof(wave) != "undefined" && wave) {
        var ownerId = wave.getState().get('ownerId', "");
        if (wave.getViewer()) {
          isOwner = (ownerId == wave.getViewer().id_);
        }
      }
      
      var scaleOption = "1";
      if (typeof(wave) != "undefined" && wave) {
        scaleOption = wave.getState().get('scaleOption', "2");
      }
      
      return {url: url, tempUrl: url, isCollapse: isCollapse, isOwner: isOwner, scaleOption: scaleOption, tempScaleOption: scaleOption, height: "400px"};
    },
    
    getSettingsPaneClass: function(){
      if (this.state.isCollapse)
      {
        return "collapse";
      } else {
        return "";
      }
    },
    
    getSettingsBtnClass: function(){
      if (this.state.isOwner)
      {
        return "";
      } else {
        return "collapse";
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
        this.hideSettingsPane();
      }
    },
    
    getScaleText: function(){
      return this.getScaleTextByKey(this.state.tempScaleOption);
    },
    
    getScaleTextByKey: function(key){
      if (key == "1"){
        return "4:3 without Menu";
      } else if (key == "2"){
        return "4:3 with Menu";
      } else if (key == "3"){
        return "16:9 without Menu";
      } else if (key == "4"){
        return "16:9 with Menu";
      } else {
        return "ERROR";
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
        if (typeof(wave) != "undefined" && wave && wave.getState()){
          wave.getState().submitDelta({'url': this.state.tempUrl});
          wave.getState().submitDelta({'ownerId': wave.getViewer().id_});
        }
      }
      
      if(this.state.scaleOption != this.state.tempScaleOption){
        this.setState({scaleOption: this.state.tempScaleOption});
        if (typeof(wave) != "undefined" && wave && wave.getState()){
          wave.getState().submitDelta({'scaleOption': this.state.tempScaleOption});
        }
        this.changeHeightBaseOnScaleOption();
      }
      
      this.setState({isCollapse: true});
    },
    
    changeHeightBaseOnScaleOption: function(){
      if (typeof(gadgets) != "undefined" && gadgets){
        var width = gadgets.window.getViewportDimensions().width;
        if (this.state.tempScaleOption == "1"){
          var targetHeight = width * 3.3 / 4.0;
          this.setState({height: targetHeight});
        } else if (this.state.tempScaleOption == "2"){
          var targetHeight = width * 2.4 / 4.0;
          this.setState({height: targetHeight});
        } else if (this.state.tempScaleOption == "3"){
          var targetHeight = width * 10.4 / 16.0;
          this.setState({height: targetHeight});
        } else if (this.state.tempScaleOption == "4"){
          var targetHeight = width * 7.7 / 16.0;
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
      var self = this;
      var onWaveUpdate = function(){
        var url = wave.getState().get('url', "");
        var ownerId = wave.getState().get('ownerId', "");
        var scaleOption = wave.getState().get('scaleOption', "2");
        var isOwner = (ownerId == wave.getViewer().id_);
        self.setState({isOwner: isOwner, url: url, tempUrl: url});
        self.changeHeightBaseOnScaleOption();
      };

      this.adjustHeight();

      if (typeof(wave) != "undefined" && wave) {
        wave.setStateCallback(onWaveUpdate);
      }
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
          <div id="input-group-main" className={this.getSettingsBtnClass()}>
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
                      <MenuItem eventKey="2" onSelect={this.onSelectHandler}>{this.getScaleTextByKey("2")}</MenuItem>
                      <MenuItem eventKey="4" onSelect={this.onSelectHandler}>{this.getScaleTextByKey("4")}</MenuItem>
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