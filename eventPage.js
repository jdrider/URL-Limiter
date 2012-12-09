/*chrome.webNavigation.onCommitted.addListener(function(details) {
	limit(details.url);
});*/

chrome.tabs.onUpdated.addListener(
	function(tabID, changeInfo, tab){
		limit(changeInfo.url, tabID);
	}
);

/*
* Logic to see if the URL needs to be limited.
*/
function limit(urlString, tabID){
	
	if(urlString != undefined)
	{
		
	
	
		var updateProp = new Object();
	
		updateProp.url = "error.html";

		chrome.tabs.update(tabID, updateProp, function(){ });
	}
}