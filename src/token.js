
/*
 This tokenizer is basically a buffering tokenizer that makes sure tokens coming in from the API
 that are important for "content containerization" such as:
 
 - three-backticks (codeblocks)
 - single-backtick (codespans)
 - newlines (paragraphs) 

 are given to the UI layer as single complete tokens. This enables easier token handling logic within the UI layer.
*/
export class Tokenizer {
  constructor() {
    this.callback = null;
    this.queue = [];
    this.tokenBuffer = '';
    this.backtickCount = 0;
  }

  tokenize2(textToken) {

    if (textToken === '[DONE]') {
      return [this.tokenBuffer, textToken];
    }

    let returnTokens = [];
    let tokenLength = textToken.length;

    let flushBuffer