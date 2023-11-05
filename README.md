# Gostradamus-chatgpt-UI
A speedy, featherweight ChatGPT UI assembled with [Seniman](https://github.com/senimanjs/seniman). It loads with a minimal 3KB of JS upfront, using WebSockets to incessantly stream the user interface.

https://user-images.githubusercontent.com/510503/231417407-2ce80242-0109-44cc-87d3-a163414431d6.mov

## Setting up the application
1. First, clone this repository
2. Install all the project dependencies with
```bash
npm install
```
3. Execute the build script
```bash
npm run build
```
4. Now, start the server. Ensure to pass your OpenAI API key as an environmental variable)
```bash
OPENAI_API_KEY=<...> npm start
```
Obtain your OpenAI API key [here](https://platform.openai.com/account/api-keys).

5. Finally, access the application at `http://localhost:3020`

## Evaluating Network Performance
In contrast with OpenAI's native `chat.openai.com` frontend:

#### OpenAI
- Downloads an initial 600KB of JS
- ~160KB of data sent per message (includes a short code block and a 5 sentence paragraph)

#### Seniman
- Requires just 3KB of JS upfront and roughly 3KB of websocket messages for setting up UI
- Merely ~5KB of WS data sent per message of the same content size.