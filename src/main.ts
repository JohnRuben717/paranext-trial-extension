import papi, { logger } from '@papi/backend';
import { ExecutionActivationContext, IWebViewProvider } from '@papi/core';
import webViewContent from './first.web-view?inline';
import webViewContentStyle from './first.web-view.scss?inline';

// Provider for the verse image generator webview
const webViewProvider: IWebViewProvider = {
  async getWebView(savedWebView) {
    return {
      ...savedWebView,
      content: webViewContent,
      styles: webViewContentStyle,
      title: 'Ruben',
    };
  },
};

export async function activate(context: ExecutionActivationContext) {
  logger.info('Extension template is activating!');
  // Register the web view provider
  const webViewPromise = papi.webViewProviders.register(
    'verseImageGenerator.view',
    webViewProvider,
  );

  // Pull up the web view on startup
  papi.webViews.getWebView('verseImageGenerator.view', undefined, { existingId: '?' });

  // Set up registered extension features to be unregistered when deactivating the extension
  context.registrations.add(await webViewPromise);
}

export async function deactivate() {
  logger.info('Extension template is deactivating!');
  return true;
}
