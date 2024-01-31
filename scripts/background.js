// var portKey = "victoria";
// var connectedPort = null;

// chrome.runtime.onConnect.addListener(function (port) {
//     if (port.name === portKey) {
//         connectedPort = port;

//         port.onDisconnect.addListener(function () {
//             connectedPort = null;
//         });

//         port.onMessage.addListener(function (msg) {
//             // Handle messages from content.js if needed
//         });
//     }
// });

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//     chrome.tabs.get(activeInfo.tabId, function (tab) {
//         if (connectedPort && connectedPort.sender.tab.id === tab.id) {
//             var url = tab.url;
//             connectedPort.postMessage({ url: url });
//             console.log("onActivated: " + url);
//         }
//     });
// });




async  function getCurrentTab() {
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
      }


var portKey = "victoria";

chrome.runtime.onConnect.addListener(async function (port) {
    console.log("[!] Port: ", port.name);
    if(port.name === portKey)
    {
        const url = await getCurrentTab();
        port.postMessage({url:url.url});
        console.log("[!] URl:", url);
        
    }
});

// chrome.tabs.onActivated.addListener(function (activeInfo) {
//     chrome.tabs.get(activeInfo.tabId, function (tab) {
//         url = tab.url;
//         chrome.runtime.onConnect.addListener(function (port) {
//             console.assert(port.name === portKey);
//             port.onMessage.addListener(function (msg) {
//                 port.postMessage({ url: url }); // change the damn with url
//                 console.log("onActivated: " + url);
//             });
//         });
//         // console.log(y);
//         // send the URL to the content.js file 
//     })
// });



// chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
//     if (tab.active && change.url) {
//         url = tab.url;
//         chrome.runtime.onConnect.addListener(function (port) {
//             console.assert(port.name === portKey);
//             port.onMessage.addListener(function (msg) {
//                 // console.log(url);
//                 port.postMessage({ url: url }); // change the damn with url
//             });
//         });
//         // console.log(y);
//         // send the URL to the content.js file 
//     }
// });
