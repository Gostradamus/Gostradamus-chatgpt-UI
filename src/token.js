
/*
 This tokenizer is basically a buffering tokenizer that makes sure tokens coming in from the API
 that are important for "content containerization" such as:
 
 - three-backticks (codeblocks)
 - single-backtick (codespans)
 - newlines (paragraphs) 

 are given to the UI layer as single complete tokens. This enables easier token handling logic within the 