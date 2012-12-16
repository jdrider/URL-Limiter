chrome.tabs.onUpdated.addListener(
	function(tabID, changeInfo, tab)
	{
		limit(changeInfo.url, tabID);
	}
);

/*
* Logic to see if the URL needs to be limited.
*/
function limit(urlString, tabID)
{
	if(urlString != undefined)
	{
		var urls = localStorage['urlLimits'];
	
		if(urls != undefined){
	
			var urlList = JSON.parse(urls);
		
			var urlMatch = checkForMatchingURL(urlList,urlString);
			
			if(urlMatch.length > 0)
			{
				updateURLHistory(urlMatch);
				
				var limitReached = checkURLLimit(urlMatch);
			
				if(limitReached)
				{
					var updateProp = new Object();
	
					updateProp.url = "error.html";

					chrome.tabs.update(tabID, updateProp, function(){ });
				}
			}
		}
	}
}

function checkForMatchingURL(limitList, urlToMatch)
{
	var urlParams = "";
	
	for(var i = 0; i < limitList.length; i++)
	{
		var splitUrl = limitList[i].split(',');
		
		if(splitUrl[0].indexOf(urlToMatch) != -1)
		{
			urlParams = splitUrl;
			break;
		}
	
	}	
	
	return urlParams;
}

function checkURLLimit(urlLimitValues){
	var urlHistory = getURLHistory();
	
	var limitReached = false;
	
	if(urlHistory != undefined)
	{
		var index = findURLIndex(urlLimitValues[0], urlHistory);
		
		var urlHistoryObj = urlHistory[index];
		
		var history = new URL_History(urlHistoryObj.url, new Date(urlHistoryObj.firstVisitDate), new Date(urlHistoryObj.lastVisitDate), parseInt(urlHistoryObj.timesVisited));
		
		var timeLimitMinutes = getTimeLimitMinutes(urlLimitValues[2]);
		
		var timeDiffMinutes = Math.round((history.lastVisitDate - history.firstVisitDate)/60000);
		
		if((timeDiffMinutes < timeLimitMinutes) && history.timesVisited >= parseInt(urlLimitValues[1]))
		{
			limitReached = true;
		}
		if(timeDiffMinutes > timeLimitMinutes)
		{
			history.timesVisited = 0;
			urlHistory[index] = history;
			localStorage["urlHistory"] = JSON.stringify(urlHistory);
		}
	}
	
	return limitReached;
}

function updateURLHistory(urlLimitValues){
	
	var urlHistory = getURLHistory();
	
	var urlIndex = findURLIndex(urlLimitValues[0], urlHistory);
	
	if(urlIndex >= 0){
		var urlHistoryItem = urlHistory[urlIndex];
		var urlHistoryObj = new URL_History(urlHistoryItem.url, new Date(urlHistoryItem.firstVisitDate), new Date(urlHistoryItem.lastVistDate), urlHistoryItem.timesVisited);
		
		urlHistoryObj.updateLastVisit();
		
		urlHistory[urlIndex] = urlHistoryObj;
	}
	else{
		urlHistory[urlHistory.length] =  new URL_History(urlLimitValues[0], new Date(), new Date(), 1);
	}
	
	localStorage["urlHistory"] = JSON.stringify(urlHistory);
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

function getURLHistory()
{
	var localHistory = localStorage["urlHistory"];
	
	var urlHistory;
	
	if(localHistory == undefined)
	{
		urlHistory = new Array();
	}
	else
	{
		urlHistory = JSON.parse(localHistory);
	}
	
	return urlHistory;
}

/* URL_History Object */
function URL_History(urlString, firstVisitDate, lastVisitDate, timesVisited)
{
	this.url = urlString;
	this.firstVisitDate = firstVisitDate;
	this.lastVisitDate = lastVisitDate;
	this.timesVisited = timesVisited;
	
	this.updateLastVisit = function(){
		this.lastVisitDate = new Date();
		this.timesVisited++;
	}
	
	this.toString = function(){
		return this.url + "," + this.firstVisitDate.toString() + "," + this.lastVisitDate.toString() + "," + this.timesVisited;
	}
}