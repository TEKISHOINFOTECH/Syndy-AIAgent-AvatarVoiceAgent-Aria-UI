// livekit-loader.js - LiveKit Library Loading Logic

function loadLiveKitFromCDN() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/livekit-client@1.4.2/dist/livekit-client.umd.js';
    script.onload = () => console.log('CDN LiveKit loaded successfully');
    script.onerror = () => console.error('CDN LiveKit also failed to load');
    document.head.appendChild(script);
}

// Fallback loading function
function loadLiveKitFallback() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/livekit-client@1.4.2/dist/livekit-client.umd.js';
        script.onload = () => {
            console.log('Fallback LiveKit loaded');
            const liveKitLib = window.LivekitClient || window.LiveKit || window.livekit;
            if (liveKitLib) {
                window.LiveKit = liveKitLib; // Normalize for our code
            }
            resolve();
        };
        script.onerror = () => {
            console.error('Fallback LiveKit failed');
            reject();
        };
        document.head.appendChild(script);
    });
}

// Debug script to check what's loaded
window.addEventListener('load', async function() {
    console.log('Window loaded. Checking LiveKit availability...');
    console.log('LiveKit available:', typeof LiveKit);
    console.log('LivekitClient available:', typeof LivekitClient);
    console.log('All window properties containing "live":', Object.keys(window).filter(k => k.toLowerCase().includes('live')));
    
    // If LivekitClient is available, make it available as LiveKit
    if (typeof LivekitClient !== 'undefined' && typeof LiveKit === 'undefined') {
        window.LiveKit = LivekitClient;
        console.log('Set window.LiveKit = LivekitClient');
    }
    
    // Try fallback if not loaded
    if (typeof LiveKit === 'undefined' && typeof LivekitClient === 'undefined') {
        console.log('Trying fallback loading...');
        try {
            await loadLiveKitFallback();
            console.log('After fallback - LiveKit:', typeof LiveKit, 'LivekitClient:', typeof LivekitClient);
        } catch (e) {
            console.error('All loading methods failed');
        }
    }
});

// Function to wait for LiveKit to be available
function waitForLiveKit() {
    return new Promise((resolve, reject) => {
        // Check for LivekitClient (the actual global name)
        let liveKitLib = window.LivekitClient || window.LiveKit || window.livekit;
        if (liveKitLib) {
            window.LiveKit = liveKitLib; // Normalize to LiveKit for our code
            console.log('LiveKit found immediately');
            resolve();
            return;
        }
        
        console.log('LiveKit not found, waiting...');
        
        // Wait up to 10 seconds
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max
        const interval = setInterval(() => {
            attempts++;
            liveKitLib = window.LivekitClient || window.LiveKit || window.livekit;
            if (liveKitLib) {
                window.LiveKit = liveKitLib; // Normalize to LiveKit for our code
                console.log('LiveKit found after', attempts * 100, 'ms');
                clearInterval(interval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('LiveKit library failed to load after 10 seconds');
                
                // Last resort: try to load it dynamically
                console.log('Attempting dynamic load as last resort...');
                loadLiveKitDynamic()
                    .then(() => resolve())
                    .catch(() => reject(new Error('LiveKit library failed to load')));
            }
        }, 100);
    });
}

// Function to dynamically load LiveKit as a last resort
function loadLiveKitDynamic() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/livekit-client@1.4.2/dist/livekit-client.umd.js';
        script.onload = () => {
            const liveKitLib = window.LivekitClient || window.LiveKit || window.livekit;
            if (liveKitLib) {
                window.LiveKit = liveKitLib; // Normalize to LiveKit for our code
                console.log('Dynamic load successful');
                resolve();
            } else {
                reject(new Error('Dynamic load failed - no global found'));
            }
        };
        script.onerror = () => {
            reject(new Error('Dynamic script load failed'));
        };
        document.head.appendChild(script);
    });
}

// Make functions available globally
window.waitForLiveKit = waitForLiveKit;
window.loadLiveKitDynamic = loadLiveKitDynamic;