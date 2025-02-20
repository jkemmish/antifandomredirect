// Simple extension to redirect all requests to RS Wikia to RS Wiki
(function(){
  'use strict';
  let isPluginDisabled = false; // Variable storing whether or not the plugin is disabled.
  let storage = window.storage || chrome.storage; // Make sure we have a storage API.
  const RSWIKIA_REGEX = /.*\.fandom\.com.*/; // Used to match the domain of the old wikia/fandom to make sure we are redirecting the correct domain.
  const PT_REGEX = /\/pt(?=\/)/i;
  function redirect(info) {
	  console.log("running");
      if(isPluginDisabled) { // Ignore all navigation requests when the extension is disabled.
        console.log("RSWikia intercepted, ignoring because plugin is disabled.");
        return;
      }
      // Create a native URL object to more easily determine the path of the url and the domain.
      var url = new URL(info.url);
	  console.log(url.host)
      var isWikia = RSWIKIA_REGEX.test(url.host); // Check to ensure the redirect is occurring on either the fandom/wikia domain.
      console.log("url detected?:"+isWikia);
	  // If domain isn't subdomain of wikia.com, ignore, also if it's not in the redirect filter
      if (!isWikia) return;
      // Generate new url
	  console.log("redirecting");
      const oldHost = url.host.split('.')[0].toLowerCase();
      let newHost = null;
      newHost = oldHost;
      chrome.tabs.update(info.tabId,{url:"http://antifandom.com/"+newHost});
  }
  // Listen to before anytime the browser attempts to navigate to the old Wikia/Fandom sites.
  chrome.webNavigation.onBeforeNavigate.addListener(redirect)

  function updateIcon(){
    // Change the icon to match the state of the plugin.
    browser.browserAction.setIcon({ path: isPluginDisabled?"icon32_black.png":"icon32.png"  });
  }

  storage.local.get(['isDisabled'],(result)=>{
      // Get the initial condition of whether or not the extension is disabled
      isPluginDisabled= result ? result.isDisabled : false;
      updateIcon(); // Update icon to match new state
  });

  // Anytime the state of the plugin changes, update the internal state of the background script.
  storage.onChanged.addListener(
      function(changes, areaName) {
        // If isDisabled changed, update isPluginDisabled
        if(changes["isDisabled"]!==undefined && changes["isDisabled"].newValue!=changes["isDisabled"].oldValue) {
          console.log(`RS Wiki Redirector is now ${changes["isDisabled"].newValue?'disabled':'enabled'}`);
          isPluginDisabled=changes["isDisabled"].newValue;
          updateIcon();
        }
      }
    );
})();
