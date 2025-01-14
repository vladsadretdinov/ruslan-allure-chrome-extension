chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageHTML') {
    const html = document.documentElement.innerHTML;
    sendResponse({ html });
  }

  // Required for asynchronous response
  return true;
});
