
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

  let codeBuffer = '';

  let codeContainer = {
    childCollection: createCollection([]),

    pushToken: (token) => {
      if (token === '```') {
        // handle the case where the codeblock contents finishes without a newline
        if (!hasContentStarted && prebuffer) {
          codeContainer.childCollection.push(prebuffer);
        }

        // detect language using lowlight
        let language = lowlight.highlightAuto(codeBuffer).data.language;

        if (language == "javascript") {
          language = "jsx";
        } else if (language == "php-template") {
          language = "html";
        }

        // tokenize using prism (what would I do to have just a single library to do both :( )
        if (Prism.languages.hasOwnProperty(language)) {
          let grammar = Prism.languages[language];
          let tokens = Prism.tokenize(codeBuffer, grammar, language);

          _setHighlightTokens(tokens);

          // TODO: would be nice to do this in a worker since it's quite 
          // a CPU-intensive operation and we don't want to hog this thread
          // used for UI rendering
        }

        return { type: 'exit' };
      } else if (token == '\n') {
        if (hasContentStarted) {
          codeContainer.childCollection.push(token);
          codeBuffer += token;
        } else {
          _setLanguageFn && _setLanguageFn(prebuffer);
          hasContentStarted = true;
        }
      } else {
        if (hasContentStarted) {
          codeContainer.childCollection.push(token);
          // gather codeBuffer for syntax highlighting
          codeBuffer += token;
        } else {
          prebuffer += token;
        }
      }
    },

    componentFn: () => {
      let [language, setLanguage] = useState('');
      let [highlightTokens, setHighlightTokens] = useState(null);

      // assign the setter to the outer scope to be set when we fully receive 
      // the language identifier up in the pushToken function
      _setLanguageFn = setLanguage;

      _setHighlightTokens = setHighlightTokens;

      return <div style={{ margin: '10px 0' }}>
        <div style={{ borderRadius: '5px 5px 0 0', padding: '5px 15px', fontSize: '11px', background: "#888", color: "#fff" }}>
          {language() == '' ? 'Code' : language()}
        </div>


        <div class="codeblock" style={{ borderRadius: '0 0 5px 5px', padding: '10px 15px', fontSize: '12px', background: "#000", color: "#fff", overflowX: 'scroll' }}>
          <pre style={{ fontFamily: 'monospace', color: '#ddd' }}>
            <code>
              {
                highlightTokens() ?
                  highlightTokens().map(token => <Token token={token} />) :
                  codeContainer.childCollection.view(token => token)
              }
            </code>
          </pre>
        </div>

      </div>;
    }
  };

  return codeContainer;
}

function createCodespanContainer() {
  let codespanContainer = {
    childCollection: createCollection([]),

    pushToken: (token) => {
      codespanContainer.childCollection.push(token);

      if (token === '`') {
        return { type: 'exit' };
      }
    },

    componentFn: () => {
      return <code style={{ fontFamily: 'monospace', fontWeight: '600' }}>
        {codespanContainer.childCollection.view(token => token)}
      </code>;
    }
  };

  codespanContainer.pushToken('`'); // show the first backtick

  return codespanContainer;
}

export function createContainer(type) {
  let c = {
    type,
    childCollection: createCollection([]),

    pushToken: (token) => {
      if (token === '```') {
        let container = createCodeblockContainer();
        c.childCollection.push(container);

        return { type: 'enter', container: container };
      } else if (token === '`') {
        let container = createCodespanContainer();
        c.childCollection.push(container);

        return { type: 'enter', container: container };
      } else if (token === '\n') {

        // exit the paragraph container
        if (c.type == 'p') {
          return { type: 'exit' };
        }

      } else {
        if (c.type === 'root') {
          let container = createContainer('p');
          container.pushToken(token);
          c.childCollection.push(container);

          return { type: 'enter', container };
        } else {
          c.childCollection.push(token);
        }
      }
    },

    componentFn: () => {
      return <p style={{ padding: '10px 0' }}>
        {c.childCollection.map((container => {
          if (typeof container == 'string') {
            return container;
          } else {
            return <container.componentFn />;
          }
        }))}
      </p>;
    }
  };

  return c;
}

function Token(props) {
  let token = props.token;
