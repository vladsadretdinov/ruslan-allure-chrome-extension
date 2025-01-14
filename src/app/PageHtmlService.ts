import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PageHtmlService {
  getHtml(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: "getPageHTML" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
              } else {
                resolve(response?.html || '');
              }
            }
          );
        } else {
          reject('No active tab found');
        }
      });
    });
  }
}
