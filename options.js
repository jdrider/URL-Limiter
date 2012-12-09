function limit(){

}

function addURL(){
	$("#urlForm").append('<br/>');
	$("#urlForm").append('<div><label>URL</label><input type="text" id="urlInput"/>'+
						 '<label id="numberLabel">Limit</label><input type="number" id="urlLimit" min="1"/>'+
	                     '<select id="timeLimit"><option name="Hourly">Hourly</option>'+
	                     '<option name="Daily">Daily</option><option name="Weekly">Weekly</option></select>');
}

/*function removeURL(elementToRemove){
	$("#urlForm").remove(elementToRemove.id);
}
*/
function saveURLs(){

	var urlList = new Array();
	
	$("#urlList").children('div').each(function(i){
		var url = $(this).children("#urlInput").val();
		var limit = parseInt($(this).children("#urlLimit").val());
		var timeLimit = $(this).children("#timeLimit").val();
		
		//alert(url + " " + limit + " " + timeLimit);
		
		if(url.length > 0 && limit > 0 && timeLimit.length > 0){
			var limitObj = new URL_Limit(url, limit, timeLimit);
			urlList[i] = limitObj.toString();
		}
	});
	
	/*
	for(var i=0; i < urlList.length; i++){
		alert(urlList[i].toString());
	}
	*/
	
	localStorage['urlLimits'] = JSON.stringify(urlList);
}

/** URL Limit Object **/
function URL_Limit(url, limit, timeLimit){
  this.url = url;
  this.limit = limit;
  this.timeLimit = timeLimit;
  
  this.toString = function(){
	return this.url + "," + this.limit + "," + this.timeLimit;
  }
}