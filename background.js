chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getNotes") {
    chrome.storage.local.get("noteData", (result) => {
      sendResponse(result.noteData || []);
    });
    return true; // Allows async response
  }

  if (request.action === "saveNotes") {
    chrome.storage.local.set({ noteData: request.notes }, () => {
      sendResponse({ success: true });
    });
    return true; // Allows async response
  }
});
