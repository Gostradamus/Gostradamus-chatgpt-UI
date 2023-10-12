
import { createServer } from 'seniman/server';
import { useState, useClient, createHandler, createCollection } from 'seniman';
import { Link, Style } from 'seniman/head';
import { throttle } from 'throttle-debounce';
import { API_requestCompletionStream } from './api.js';
import { Tokenizer } from './token.js';
import { createContainer } from './containers.js';
import { Microphone } from './microphone.js';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

async function fetchMessageHistory() {
  // TODO: actually fetch message history
  return [];
}

function Message(props) {
  let { role, tokenizer } = props;
  let [isWaiting, setIsWaiting] = useState(true);

  let rootContainer = createContainer('root');
  let activeContainer = rootContainer;
  let containerParentStack = [];

  // What we do here is basically handle incoming (properly buffer-tokenized) tokens
  // and route it to "containers" that handle different types of content, such as 
  // code blocks, paragraphs, etc. with their own internal state and rendering logic.
  tokenizer.onResultTokens(tokens => {
    setIsWaiting(false);

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] == '[DONE]') {
        break;
      }

      let result = activeContainer.pushToken(tokens[i]);

      // the active container can return a non-null result to indicate that it wants to
      // exit or enter a new container (establishing new levels of nesting)
      if (result) {
        if (result.type == 'enter') {
          let newContainer = result.container;
          containerParentStack.push(activeContainer);
          activeContainer = newContainer;
        } else if (result.type == 'exit') {
          activeContainer = containerParentStack.pop();
        }
      }
    }
  });

  return <div style={{ fontSize: '13px', color: '#fff', background: role == "assistant" ? "#555" : "#444", lineHeight: '1.5' }}>
    <div style={{ padding: "0 15px", margin: "0 auto", maxWidth: "600px", color: "#ddd" }}>
      {isWaiting() ? <div style={{ padding: "15px 0" }}>...</div> : <rootContainer.componentFn />}
    </div>
  </div>;
}

function* iterateCodePoints(str) {
  for (let i = 0; i < str.length; ++i) {
    const charCode = str.codePointAt(i);
    if (charCode === undefined) {
      break;
    }
    yield String.fromCodePoint(charCode);
    if (charCode > 0xFFFF) {
      i++; // Skip the trailing surrogate pair.
    }
  }
}

function createTokenizerFromText(text) {
  let tokenizer = new Tokenizer();

  for (const character of iterateCodePoints(text)) {
    tokenizer.feedInputToken(character);
  }

  tokenizer.feedInputToken('[DONE]');
  return tokenizer;
}

function ConversationThread(props) {
  let [isThreadEmpty, set_isThreadEmpty] = useState(true);
  let [isBotTyping, set_isBotTyping] = useState(false);
  let messageCollection = createCollection([]);
  let conversationMessagesContext = [];