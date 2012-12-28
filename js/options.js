//Page Load event handler
document.addEventListener('DOMContentLoaded', function () {
  setupPage();
});

var storage_local = chrome.storage.local;

/*
* Setup the page
*/
function setupPage(){
	loadURLs();
	addClickHandlers();
}

/*
* Add click handlers to the elements that need them.
*/
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
	//Add click handlers for Remove buttons
	$(".removeBtn").on("click",
		function(event){
				removeURL($(this).parent());
		}
	);
}

/*
* Add URL fields to the options page.
*/
function addURL(){
	//Break only needs to be there if it is not the first element being added.
	if($("#urlList").children('div').length != 0){
		$("#urlList").append('<br/>');
	}
	
	$("#urlList").append('<div><label>URL</label><input type="text" id="urlInput"/>'+
						 '<label id="numberLabel">Limit</label><input type="number" id="urlLimit" min="1" value="1"/>'+
	                     '<select id="timeLimit"><option name="Hourly">Hourly</option>'+
	                     '<option name="Daily">Daily</option><option name="Weekly">Weekly</option></select>');
}

/*
* Remove a set of URL fields from the options page.
* 
* elemenToRemove - The set of URL fields to remove.
*/
function removeURL(elementToRemove){
	
	var url = elementToRemove.children("#urlInput").val();
	
	removeURLHistory(url);
	
	elementToRemove.remove();
	
	//Remove all extra break elements if all url fields have been removed.
	if($("#urlList").children('div').length == 0){
		$("#urlList").empty();
	}
}

function removeURLHistory(url)
{	
	storage_local.get('urlHistory', 
		function(items){
			if(items.urlHistory != undefined)
			{		
				var newURLHistory = new Array();
		
				for(var i=0; i < items.urlHistory.length; i++)
				{
					var history = items.urlHistory[i];
			
					if(history.url != url)
					{
						newURLHistory.push(history);
					}
				}
		
				storage_local.set({"urlHistory" : newURLHistory});
			}
		}
	);
}

/*
* Load the saved URLs from localStorage
*/
function loadURLs(){
	storage_local.get('urlLimits', 
		function(items){
			if(items.urlLimits != undefined){
			
				$("#urlList").empty();
			
				for(var i = 0; i < items.urlLimits.length; i++){
				
					var limitItem = items.urlLimits[i];
				
					if(i != 0){
						$("#urlList").append('<br/>');
					}
				
					$("#urlList").append('<div><label>URL</label><input type="text" id="urlInput" value="'+ limitItem.url + '"/>'+
										 '<label id="numberLabel">Limit</label><input type="number" id="urlLimit" min="1" value="'+ limitItem.limit +'"/>'+
										 '<select id="timeLimit" value="'+ limitItem.timeLimit +'"><option name="Hourly">Hourly</option>'+
										 '<option name="Daily">Daily</option><option name="Weekly">Weekly</option></select>'+
										 '<button class="removeBtn">Remove</button>');
				}
			}
		}
	);
}

/*
* Save URL options to localStorage
*/
function saveURLs(){

	var urlList = new Array();
	
	//Iterate over all field elements and create limit options.
	$("#urlList").children('div').each(function(i){
		var url = $(this).children("#urlInput").val();
		var limit = $(this).children("#urlLimit").val();
		var timeLimit = $(this).children("#timeLimit").val();
		
		if(url.length > 0 && limit > 0 && timeLimit.length > 0){
			var limitObj = new URL_Limit(url, limit, timeLimit);
			urlList[i] = limitObj;//.toString();
		}
	});
	
	//Save to local storage if there are elements to save
	if(urlList.length > 0){
		storage_local.set({'urlLimits' : urlList});
	}
	//Remove the item if there are no elements to save
	else{
		storage_local.get('urlLimits', 
			function(items){
				if(items.urlLimits != undefined){
					storage_local.remove('urlLimits');
				}
			}
		);
	}
}

/*
* Create a URL_Limit object from a comma-separated string of values.
*
function createURL_Limit(valueString){
	var indValues = valueString.split(",");
	
	return new URL_Limit(indValues[0], indValues[1], indValues[2]);
}
*/

/** URL Limit Object **/
function URL_Limit(url, limit, timeLimit){
  this.url = url;
  this.limit = parseInt(limit);
  this.timeLimit = timeLimit;
  
  this.toString = function(){
	return this.url + "," + this.limit + "," + this.timeLimit;
  }
}