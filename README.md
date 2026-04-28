# AI Webpage Explainer

AI Webpage Explainer is a Chrome extension that helps users understand any webpage using Google Gemini AI. It extracts readable content from the active browser tab and generates summaries, detailed explanations, simplified explanations, key points, and custom answers based on user questions.

This project demonstrates practical experience with LLM integration, prompt engineering, conversational AI workflows, browser automation APIs, and building user-facing AI tools.

## Features

- Summarize webpage content into concise, easy-to-read explanations
- Explain complex webpage content in detail
- Simplify content into beginner-friendly language
- Extract important key points from a webpage
- Ask custom questions about the current page
- Store Gemini API key locally using Chrome storage
- Format AI responses for readable display inside the extension popup
- Handle loading states, API errors, and missing API key cases

## Tech Stack

- JavaScript
- HTML
- CSS
- Chrome Extension Manifest V3
- Chrome Extension APIs
  - `chrome.storage`
  - `chrome.tabs`
  - `chrome.scripting`
- Google Gemini API

## How It Works

1. The user opens a webpage and clicks the extension.
2. The extension extracts readable text from the current page.
3. The selected action, such as summarize or explain, is converted into a structured prompt.
4. The prompt and webpage content are sent to the Gemini API.
5. The AI response is formatted and displayed inside the popup.

## Prompt Engineering Use Cases

The extension uses different prompt templates for different user goals:

- Summary generation
- Detailed concept explanation
- Simple ELI5-style explanation
- Key-point extraction
- Context-aware custom Q&A

These prompt flows show how LLMs can be adapted for multiple conversational scenarios using the same source content.

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the project folder.
6. Open the extension popup and add your Gemini API key in Settings.

You can get a Gemini API key from Google AI Studio:

https://aistudio.google.com/app/apikey

## Project Structure

```text
.
├── background.js
├── content.js
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
└── icons/
```

## Resume Relevance

This project is relevant for roles involving AI agents, conversational AI, LLM applications, and prompt engineering. It includes hands-on implementation of AI-powered workflows, API integration, content extraction, prompt design, response handling, and user-focused AI interaction design.

## Future Improvements

- Add conversation history for follow-up questions
- Support multiple AI providers
- Add response quality rating and feedback collection
- Add prompt presets for business, education, research, and customer support use cases
- Improve markdown rendering and export options
