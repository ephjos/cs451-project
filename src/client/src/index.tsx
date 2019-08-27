import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Disable React Dev Tools in Prod builds
const disableReactDevTools = (): void => {
  if (process.env.NODE_ENV === "production") {
    const noop = (): void => undefined;
    const DEV_TOOLS = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (typeof DEV_TOOLS === 'object') {
      for (const [key, value] of Object.entries(DEV_TOOLS)) {
        DEV_TOOLS[key] = typeof value === 'function' ? noop : null;
      }
    }
  }
};

disableReactDevTools();
ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
