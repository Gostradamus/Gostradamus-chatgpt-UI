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
In contrast