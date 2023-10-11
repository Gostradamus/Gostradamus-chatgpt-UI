
import { useState, createCollection } from 'seniman';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import { lowlight } from 'lowlight/lib/common.js'

setTimeout(() => {
  loadLanguages(['js', 'jsx', 'typescript', 'bash', 'html', 'css', 'python', 'java', 'php', 'sql', 'arduino', 'cpp']);

  let codeString = `
    import React from 'react';

    function MyComponent(props) {
        return (
            <div>
                <h1>{props.heading}</h1>
                <p>{props.content}</p>
            </div>
        );
    }

    export default MyComponent;`;

  // warm up code path (brings down 100ms first call to <10ms)
  lowlight.highlightAuto(codeString).data;
}, 10);

function createCodeblockContainer() {
  let hasContentStarted = false;
  let prebuffer = '';
  let _setLanguageFn = null;
  let _setHighlightTokens = null;
