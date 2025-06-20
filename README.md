# emojAI

An AI-powered emoji generator that creates custom emojis from text descriptions using advanced AI models.

![emojAI Logo](logo.png)

## Features

- **AI-Powered Generation**: Creates unique emoji images from text descriptions
- **LiteLLM Integration**: Uses GPT Image 1 model through LiteLLM proxy
- **Simple Interface**: Clean, user-friendly design
- **Instant Download**: Download generated emojis as PNG files
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Enter your LiteLLM instance URL (e.g., `https://your-litellm-instance.com`)
2. Enter your API key
3. Describe your desired emoji (e.g., "happy cat", "coffee cup", "rocket ship")
4. Click "Generate Emoji"
5. Download your custom emoji

## Live Demo

Visit the live application: [https://your-username.github.io/emojAI](https://your-username.github.io/emojAI)

## Setup

### Prerequisites

- A running LiteLLM instance with API access
- API key for your LiteLLM instance

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/emojAI.git
   cd emojAI
   ```

2. Open `index.html` in your web browser

3. Enter your LiteLLM instance URL and API key, then start generating emojis!

## API Integration

This app uses LiteLLM proxy services which provide access to multiple AI models in OpenAI format. You can use any LiteLLM instance by providing its URL. The app specifically uses the `gpt-image-1` model for image generation.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- LiteLLM API
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.