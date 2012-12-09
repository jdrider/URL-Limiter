document.addEventListener('DOMContentLoaded', function () {
  setupPage();
});

function setupPage(){
	loadURLs();
	addClickHandlers();
}

function addClickHandlers(){
	$("#addURLButton").on("click", 
		function(event){
			addURL();
		}
	);
	$("#saveURLsButton").on("click", 
		function(event){
			saveURLs();
		}
	);
}

function limit(){

}

function addURL(){
	if($("#urlList").children('div').length != 0){
		$("#urlList").append('<br/>');
	}
	
	$("#urlList").append('<div><label>URL</label><input type="text" id="urlInput"/>'+
						 '<label id="numberLabel">Limit</label><input type="number" id="urlLimit" min="1" value="1"/>'+
	                     '<select id="timeLimit"><option name="Hourly">Hourly</option>'+
	                     '<option name="Daily">Daily</option><option name="Weekly">Weekly</option></select>');
}

function removeURL(elementToRemove){
	elementToRemove.remove();
	
	if($("#urlList").children('div').length == 0){
		$("#urlList").empty();
	}
}


function loadURLs(){
	var urls = localStorage['urlLimits'];
	
	if(urls != undefined){
	
		var urlList = JSON.parse(urls);
		
		if(urlList != undefined){
			
			$("#urlList").empty();
			
			for(var i = 0; i < urlList.length; i++){
				
				var limitItem = createURL_Limit(urlList[i]);
				
				if(i != 0){
						$("#urlList").append('<br/>');
				}
				
				$("#urlList").append('<div><label>URL</label><input type="text" id="urlInput" value="'+ limitItem.url + '"/>'+
						             '<label id="numberLabel">Limit</label><input type="number" id="urlLimit" min="1" value="'+ limitItem.limit +'"/>'+
	                                 '<select id="timeLimit" value="'+ limitItem.timeLimit +'"><option name="Hourly">Hourly</option>'+
	                                 '<option name="Daily">Daily</option><option name="Weekly">Weekly</option></select>'+
									 '<button class="removeBtn">Remove</button>');
			}
			
			$(".removeBtn").on("click",
				function(event){
					removeURL($(this).parent());
				}
			);
			
		}
	}
}

function saveURLs(){

	var urlList = new Array();
	
	$("#urlList").children('div').each(function(i){
		var url = $(this).children("#urlInput").val();
		var limit = $(this).children("#urlLimit").val();
		var timeLimit = $(this).children("#timeLimit").val();
		
		if(url.length > 0 && limit > 0 && timeLimit.length > 0){
			var limitObj = new URL_Limit(url, limit, timeLimit);
			urlList[i] = limitObj.toString();
		}
	});
	
	if(urlList.length > 0){
		localStorage['urlLimits'] = JSON.stringify(urlList);
	}
	else if(localStorage['urlLimits'] != undefined){
		localStorage.removeItem("urlLimits");
	}
}

function createURL_Limit(valueString){
	var indValues = valueString.split(",");
	
	return new URL_Limit(indValues[0], indValues[1], indValues[2]);
}

/** URL Limit Object **/
function URL_Limit(url, limit, timeLimit){
  this.url = url;
  this.limit = parseInt(limit);
  this.timeLimit = timeLimit;
  
  this.toString = function(){
	return this.url + "," + this.limit + "," + this.timeLimit;
  }
}