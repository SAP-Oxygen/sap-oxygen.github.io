/**
 * @param {String} msg
 * @return {String}
 */
function getLocale(msg){
  if (typeof(gadgets) != "undefined" && gadgets) {
    var prefs = new gadgets.Prefs();
    return prefs.getMsg(msg);
  } else {
    return msg;
  }
}

/**
 * @param {Date} from
 * @return {Date}
 */
function distance_of_time_in_words(from){
    return " " + moment(from).fromNow();
}

function guid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function adjustHeight(){
    typeof(gadgets) != "undefined" && gadgets && gadgets.window.adjustHeight();
}

/**
 * @param {String} creatorId
 * @return {String}
 */
function getCreatorFullName(creatorId){
  var fullName = "";
  if (typeof(wave) != "undefined" && wave && wave.getParticipantById(creatorId)) {
    fullName = wave.getParticipantById(creatorId).displayName_;
  }
  return fullName;
}

/**
 * @param {String} creatorId
 * @param {Array} cachedInfos 
 * @return {String}
 */
function getCreatorFullNameWithCachedInfo(creatorId, cachedInfos){
  var fullName = getCreatorFullName(creatorId);
  if (fullName == ""){
    for(var i = 0; i < cachedInfos.length; ++i)
    {
      if(cachedInfos[i].userId == creatorId)
      {
        fullName = cachedInfos[i].cachedUserName;
        break;
      }
    }
  }

  return fullName;
}