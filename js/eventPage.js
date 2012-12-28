chrome.tabs.onUpdated.addListener(
	function(tabID, changeInfo, tab)
	{
		limit(changeInfo.url, tabID);
	}
);

var storage_local = chrome.storage.local;

/*
* Logic to see if the URL needs to be limited.
*/
function limit(urlString, tabID)
{
	if(urlString != undefined)
	{
		storage_local.get('urlLimits',
			function(items){
				if(items.urlLimits != undefined){
		
					var urlMatch = checkForMatchingURL(items.urlLimits,urlString);
			
					if(urlMatch.length > 0)
					{
						updateURLHistory(urlMatch);
				
						var limitReached = checkURLLimit(urlMatch);
			
						if(limitReached)
						{
							var updateProp = new Object();
	
							updateProp.url = "../view/error.html";

							chrome.tabs.update(tabID, updateProp, function(){ });
						}
					}
				}
			}
		);
	}
}

function checkForMatchingURL(limitList, urlToMatch)
{
	var urlParams = "";
	
	for(var i = 0; i < limitList.length; i++)
	{
		var url = limitList[i].url;
		
		if(urlToMatch.indexOf(url) !== -1)
		{
			urlParams = url;
			break;
		}
	
	}	
	
	return urlParams;
}

function checkURLLimit(urlToLimit){
	
	var urlHistory;
	var urlLimits;
	
	storage_local.get(["urlHistory", "urlLimits"],
		function(items){
			urlHistory = items.urlHistory;
			urlLimits = items.urlLimits;
		}
	);
	
	var limitReached = false;
	
	if(urlHistory != undefined && urlLimits != undefined)
	{
		var historyIndex = findURLIndex(urlToLimit, urlHistory);
		
		var limitIndex = findURLIndex(urlToLimit, urlLimits);
		
		var urlHistoryObj = urlHistory[historyIndex];
		
		var urlLimitObj = urlLimits[limitIndex];
		
		var history = new URL_History(urlHistoryObj.url, urlHistoryObj.firstVisitDate, urlHistoryObj.lastVisitDate, parseInt(urlHistoryObj.timesVisited));
		
		var timeLimitMinutes = getTimeLimitMinutes(urlLimitObj.timeLimit);
		
		var timeDiffMinutes = Math.round((new Date(history.lastVisitDate) - new Date(history.firstVisitDate))/60000);
		
		if((timeDiffMinutes < timeLimitMinutes) && history.timesVisited >= parseInt(urlLimitObj.limit))
		{
			limitReached = true;
		}
		if(timeDiffMinutes > timeLimitMinutes)
		{
			history.timesVisited = 0;
			urlHistory[historyIndex] = history;
			storage_local.set({"urlHistory" : urlHistory});
		}
	}
	
	return limitReached;
}

function updateURLHistory(urlToLimit){
	
	storage_local.get("urlHistory", 
		function(items){
	
			var urlHistory = new Array();
			
			if(items.urlHistory != undefined){
				urlHistory = items.urlHistory;
			}
			
			var urlIndex = findURLIndex(urlToLimit, urlHistory);
	
			if(urlIndex >= 0){
				var urlHistoryItem = urlHistory[urlIndex];
				var urlHistoryObj = new URL_History(urlHistoryItem.url, urlHistoryItem.firstVisitDate, urlHistoryItem.lastVistDate, urlHistoryItem.timesVisited);
		
				urlHistoryObj.updateLastVisit();
		
				urlHistory[urlIndex] = urlHistoryObj;
			}
			else{
				urlHistory.push(new URL_History(urlToLimit, new Date(), new Date(), 1));
			}
	
			storage_local.set({"urlHistory" : urlHistory});
		}
	);
}

function findURLIndex(urlString, urlHistoryArray){
	var index = -1;
	
	for(var i=0; i < urlHistoryArray.length; i++)
	{
		if(urlHistoryArray[i].url == urlString)
		{
			index = i;
			break;
		}
	}
	
	return index;
}

/*
  Returns the number of minutes in the time period.
*/
function getTimeLimitMinutes(limitPeriod)
{
	var timePeriodInMinutes = 1;
	
	switch(limitPeriod)
	{
		case "Hourly":
			timePeriodInMinutes = 60;
			break;
		case "Daily":
			timePeriodInMinutes = 1440;
			break;
		case "Weekly":
			timePeriodInMinutes = 10080;
			break;
	
	}	
	
	return timePeriodInMinutes;
}

/* URL_History Object */
function URL_History(urlString, firstVisitedDate, lastVisitedDate, timesVisited)
{
	this.url = urlString;
	this.firstVisitDate = firstVisitedDate.toString();
	
	if(lastVisitedDate != undefined){
		this.lastVisitDate = lastVisitedDate.toString();
	}
	else{
		this.lastVisitDate = new Date().toString();
	}
	
	this.timesVisited = timesVisited;
	
	this.updateLastVisit = function(){
		this.lastVisitDate = new Date().toString();
		this.timesVisited++;
	}
	
	this.toString = function(){
		return this.url + "," + this.firstVisitDate.toString() + "," + this.lastVisitDate.toString() + "," + this.timesVisited;
	}
}