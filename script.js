let currentEmoji = null;
let apiKey = localStorage.getItem('emojAI-api-key') || '';
let apiUrl = localStorage.getItem('emojAI-api-url') || '';
const MODEL = 'gpt-image-1';

document.addEventListener('DOMContentLoaded', function() {
    if (apiKey) {
        document.getElementById('api-key').value = apiKey;
    }
    if (apiUrl) {
        document.getElementById('api-url').value = apiUrl;
    }
});


async function generateFromText() {
    const description = document.getElementById('description').value.trim();
    if (!description) {
        alert('Please enter a description for your emoji!');
        return;
    }
    
    const outputDiv = document.getElementById('text-output');
    const downloadBtn = document.getElementById('download-text');
    
    await generateAIEmoji(description, outputDiv, downloadBtn);
}

async function generateAIEmoji(description, outputDiv, downloadBtn) {
    const apiKey = document.getElementById('api-key').value.trim();
    const apiUrl = document.getElementById('api-url').value.trim();
    
    if (!apiKey) {
        alert('Please enter your API key to generate emojis!');
        return;
    }
    
    if (!apiUrl) {
        alert('Please enter your LiteLLM URL!');
        return;
    }
    
    outputDiv.innerHTML = '<div class="loading">🤖 AI is generating your emoji...<br><div class="spinner"></div></div>';
    downloadBtn.style.display = 'none';
    
    try {
        await generateImageEmoji(description, MODEL, apiKey, apiUrl, outputDiv, downloadBtn);
    } catch (error) {
        console.error('AI Generation Error:', error);
        outputDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

async function generateImageEmoji(description, model, apiKey, apiUrl, outputDiv, downloadBtn) {
    // Ensure URL ends with /v1/images/generations
    const baseUrl = apiUrl.replace(/\/$/, '');
    const endpoint = baseUrl.endsWith('/v1/images/generations') ? baseUrl : `${baseUrl}/v1/images/generations`;
    
    const prompt = `Create a simple, clean emoji-style icon of: ${description}. The image should be suitable for use as a Slack emoji - simple, clear, and recognizable at small sizes. Use bright, vibrant colors on a transparent or white background.`;
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url'
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Debug: Log the response to see the actual format
    console.log('API Response:', data);
    
    // Try different possible response formats
    let imageUrl = null;
    
    if (data.data && data.data[0] && data.data[0].url) {
        imageUrl = data.data[0].url;
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
        // Convert base64 to blob URL
        const base64Data = data.data[0].b64_json;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        imageUrl = URL.createObjectURL(blob);
    } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Some models might return as text
        const content = data.choices[0].message.content;
        if (content.startsWith('http')) {
            imageUrl = content;
        }
    } else if (data.url) {
        imageUrl = data.url;
    } else if (data.image_url) {
        imageUrl = data.image_url;
    }
    
    if (imageUrl) {
        await loadImageFromUrl(imageUrl, outputDiv, downloadBtn);
    } else {
        console.error('Unexpected response format:', data);
        throw new Error(`Invalid response format from API. Response structure: ${JSON.stringify(Object.keys(data))}`);
    }
}


async function loadImageFromUrl(imageUrl, outputDiv, downloadBtn) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 128;
            canvas.height = 128;
            
            ctx.drawImage(img, 0, 0, 128, 128);
            
            outputDiv.innerHTML = '';
            outputDiv.appendChild(canvas);
            
            currentEmoji = canvas;
            downloadBtn.style.display = 'block';
            resolve();
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load generated image'));
        };
        
        img.src = imageUrl;
    });
}


function processImage() {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const outputDiv = document.getElementById('image-output');
    const downloadBtn = document.getElementById('download-image');
    
    outputDiv.innerHTML = 'Processing image...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const size = parseInt(document.getElementById('emoji-size').value);
            const makeSquare = document.getElementById('make-square').checked;
            
            canvas.width = size;
            canvas.height = size;
            
            let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
            
            if (makeSquare) {
                const minDimension = Math.min(img.width, img.height);
                sourceX = (img.width - minDimension) / 2;
                sourceY = (img.height - minDimension) / 2;
                sourceWidth = minDimension;
                sourceHeight = minDimension;
            }
            
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
            
            outputDiv.innerHTML = '';
            outputDiv.appendChild(canvas);
            
            currentEmoji = canvas;
            downloadBtn.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function downloadEmoji(type) {
    if (!currentEmoji) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    const filename = type === 'text' ? 
        `emoji-${document.getElementById('description').value.replace(/\s+/g, '-')}-${timestamp}.png` :
        `emoji-upload-${timestamp}.png`;
    
    currentEmoji.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

function saveApiKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    if (apiKey) {
        localStorage.setItem('emojAI-api-key', apiKey);
    } else {
        localStorage.removeItem('emojAI-api-key');
    }
}

function saveApiUrl() {
    const apiUrl = document.getElementById('api-url').value.trim();
    if (apiUrl) {
        localStorage.setItem('emojAI-api-url', apiUrl);
    } else {
        localStorage.removeItem('emojAI-api-url');
    }
}

function toggleApiKey() {
    const apiKeyInput = document.getElementById('api-key');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}