const API_BASE = "https://mostar-api.onrender.com"; // Replace with your actual Render URL

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask is required to use this feature.");
    return null;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    alert("Failed to connect wallet. Please try again.");
    return null;
  }
}

async function purchaseCredits(packId) {
  try {
    const wallet = await connectWallet();
    if (!wallet) return;

    const res = await fetch(`${API_BASE}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, pack: packId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Payment failed. Please try again.");
    }

    alert(`Transaction sent!\nHash: ${data.tx_hash}`);
    // Optional: open Polygonscan
    // window.open(`https://polygonscan.com/tx/${data.tx_hash}`, "_blank");

  } catch (e) {
    alert(`An error occurred: ${e.message}`);
  }
}

// Create particles on page load
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initializeCharacter();
    initChart();
});

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        // Random color (blue, pink, green)
        const colors = ['var(--neon-blue)', 'var(--neon-pink)', 'var(--neon-green)'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = randomColor;
        particle.style.boxShadow = `0 0 10px ${randomColor}`;
        
        particlesContainer.appendChild(particle);
    }
}

// Character animation and interaction
function initializeCharacter() {
    const character = document.getElementById('authCharacter');
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const mouth = document.querySelector('.character-mouth');

    // Blink animation
    setInterval(() => {
        leftEye.classList.add('closed');
        rightEye.classList.add('closed');
        
        setTimeout(() => {
            leftEye.classList.remove('closed');
            rightEye.classList.remove('closed');
        }, 200);
    }, 4000);

    // Follow cursor with eyes
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const characterRect = character.getBoundingClientRect();
        const characterCenterX = characterRect.left + characterRect.width / 2;
        const characterCenterY = characterRect.top + characterRect.height / 2;
        
        const angle = Math.atan2(mouseY - characterCenterY, mouseX - characterCenterX);
        
        const eyeMovementX = Math.cos(angle) * 2;
        const eyeMovementY = Math.sin(angle) * 2;
        
        leftEye.style.transform = `translate(${eyeMovementX}px, ${eyeMovementY}px)`;
        rightEye.style.transform = `translate(${eyeMovementX}px, ${eyeMovementY}px)`;
    });

    // Happiness on hover
    character.addEventListener('mouseenter', () => {
        character.classList.add('happy');
        mouth.style.borderColor = 'var(--neon-green)';
        mouth.style.boxShadow = '0 0 10px var(--neon-green)';
    });
    
    character.addEventListener('mouseleave', () => {
        character.classList.remove('happy');
        mouth.style.borderColor = '#fff';
        mouth.style.boxShadow = 'none';
    });
}

// Toggle password visibility
function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Character eyes interaction with password field
function closeCharacterEyes() {
    document.getElementById('leftEye').classList.add('closed');
    document.getElementById('rightEye').classList.add('closed');
}

function openCharacterEyes() {
    document.getElementById('leftEye').classList.remove('closed');
    document.getElementById('rightEye').classList.remove('closed');
}

// Show login or register forms
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
}

// Initialize usage chart
function initChart() {
    const ctx = document.getElementById('usageChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '5', '10', '15', '20', '25', '30'],
                datasets: [{
                    label: 'API Calls',
                    data: [12, 19, 3, 5, 2, 3, 20],
                    borderColor: 'var(--neon-blue)',
                    backgroundColor: 'rgba(0, 243, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
}

// Mock API functions
function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const tier = document.getElementById('tier').value;
    
    if (!username || !email || !password || !tier) {
        alert("All fields are required!");
        return;
    }
    
    // In a real app, this would make an API call
    // Simulating API call delay
    const character = document.getElementById('authCharacter');
    character.style.animation = 'none';
    character.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        const mockApiKey = 'ms_' + Array.from({length: 32}, () => 
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
        
        localStorage.setItem('mostar_api_key', mockApiKey);
        
        character.style.animation = 'characterFloat 3s ease-in-out infinite';
        character.style.transform = 'scale(1)';
        
        // Show success and reveal API key
        document.getElementById('authSection').innerHTML = `
            <div class="alert alert-success">
                <h3 style="margin-bottom: 10px;">🎉 Registration Successful!</h3>
                <p>Welcome to MoStar Industries, Agent ${username}!</p>
                <p style="margin: 15px 0;">Your API key is:</p>
                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px; font-family: monospace; word-break: break-all;">${mockApiKey}</div>
                <button class="btn" onclick="login('${mockApiKey}')" style="width: 100%; margin-top: 20px;">
                    <i class="fas fa-rocket"></i> Continue to Dashboard
                </button>
            </div>
        `;
    }, 1500);
}

function login(apiKey) {
    const key = apiKey || document.getElementById('apiKey')?.value;
    
    if (!key) {
        alert("API key is required!");
        return;
    }
    
    // In a real app, this would validate the API key
    localStorage.setItem('mostar_api_key', key);
    
    // Update UI to show logged in state
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('accountStatus').classList.remove('hidden');
    document.getElementById('aiServices').classList.remove('hidden');
    document.getElementById('creditPurchase').classList.remove('hidden');
    
    // Load mock dashboard data
    document.getElementById('creditsRemaining').textContent = '750';
    document.getElementById('totalCalls').textContent = '243';
    document.getElementById('creditsUsed').textContent = '250';
    document.getElementById('userTierName').textContent = 'Voyager';
    
    // Initialize chart
    initChart();
}

function logout() {
    localStorage.removeItem('mostar_api_key');
    location.reload();
}

function generateAI() {
    const prompt = document.getElementById('aiPrompt').value;
    const model = document.getElementById('aiModel').value;
    
    if (!prompt) {
        alert("Please enter a prompt!");
        return;
    }
    
    document.getElementById('aiResponse').classList.remove('hidden');
    document.getElementById('aiResponse').innerHTML = '<div class="loading"><div class="loading-spinner"></div>Processing request...</div>';
    
    // Simulate API call
    setTimeout(() => {
        const mockResponse = {
            id: 'gen_' + Math.random().toString(36).substr(2, 9),
            model: model === 'standard' ? 'MoStar-S' : 'MoStar-Ultra',
            prompt: prompt,
            completion: `Here's an AI-generated response to your prompt: "${prompt}"\n\nAs requested, I've analyzed the data and found some interesting patterns. The quantum fluctuations you mentioned appear to be consistent with our theoretical models. Further investigation is recommended to explore the anomalies in sector 7.\n\nShall I proceed with a deeper analysis?`,
            credits_used: model === 'standard' ? 1 : 5
        };
        
        document.getElementById('aiResponse').innerHTML = JSON.stringify(mockResponse, null, 2);
        
        // Update credits
        const currentCredits = parseInt(document.getElementById('creditsRemaining').textContent);
        document.getElementById('creditsRemaining').textContent = (currentCredits - mockResponse.credits_used).toString();
    }, 2000);
}

function getClimateData() {
    document.getElementById('climateResponse').classList.remove('hidden');
    document.getElementById('climateResponse').innerHTML = '<div class="loading"><div class="loading-spinner"></div>Processing climate predictions...</div>';
    
    // Simulate API call
    setTimeout(() => {
        const mockResponse = {
            id: 'climate_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            predictions: [
                { year: 2030, temp_change: +1.2, confidence: 0.92 },
                { year: 2040, temp_change: +1.8, confidence: 0.85 },
                { year: 2050, temp_change: +2.3, confidence: 0.79 }
            ],
            recommendation: "Immediate carbon reduction of 45% recommended to mitigate projections.",
            credits_used: 2
        };
        
        document.getElementById('climateResponse').innerHTML = JSON.stringify(mockResponse, null, 2);
        
        // Update credits
        const currentCredits = parseInt(document.getElementById('creditsRemaining').textContent);
        document.getElementById('creditsRemaining').textContent = (currentCredits - mockResponse.credits_used).toString();
    }, 2500);
}

function purchaseCredits(plan) {
    // In a real app, this would open a payment modal/page
    alert(`In a production environment, this would redirect to a payment page for the ${plan} plan.`);
}
