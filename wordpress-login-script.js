/**
 * ERIC 2026 CHAMPIONSHIP PORTAL - ADVANCED WORDPRESS CUSTOM LOGIN JAVASCRIPT
 * Paste this script into your WordPress Header/Footer scripts plugin or
 * "Custom Login Page Customizer" JS modification workspace.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. UPDATE LOGIN TITLE AND ATTRIBUTES
    var loginHeaderLink = document.querySelector('#login h1 a');
    if (loginHeaderLink) {
        // Remove standard title tooltip
        loginHeaderLink.setAttribute('title', 'Return to Champion Arena');
        // Set actual destination href dynamically to registration portal
        loginHeaderLink.setAttribute('href', '#');
        // Inject human-friendly branding instead of background image
        loginHeaderLink.innerHTML = 'ERIC CHAMPIONSHIP';
    }

    // 2. INJECT LIVE TELEMETRY DECORATION HEADER (Matches ERIC portal aesthetics)
    var loginForm = document.querySelector('#loginform');
    if (loginForm) {
        var devHeaderBlock = document.createElement('div');
        devHeaderBlock.style.margin = '0 0 24px 0';
        devHeaderBlock.style.padding = '12px 14px';
        devHeaderBlock.style.backgroundColor = 'rgba(0, 255, 136, 0.03)';
        devHeaderBlock.style.border = '1px dashed rgba(0, 255, 136, 0.15)';
        devHeaderBlock.style.borderRadius = '12px';
        devHeaderBlock.style.fontFamily = '"JetBrains Mono", monospace';
        devHeaderBlock.style.fontSize = '9px';
        devHeaderBlock.style.color = '#71717a';
        devHeaderBlock.style.textTransform = 'uppercase';
        devHeaderBlock.style.letterSpacing = '0.5px';
        devHeaderBlock.style.lineHeight = '1.45';

        // Dynamic date placeholder or offline simulator indicator
        var dateStr = new Date().toISOString().substring(0, 10);
        devHeaderBlock.innerHTML = 
            '<div style="color: #00FF88; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">' +
                '<span style="display:inline-block; width:6px; height:6px; background:#00FF88; border-radius:50%; box-shadow:0 0 6px #00FF88;"></span>' +
                'Secured Auth Pipeline</div>' +
            '<div>Host Ref: ' + window.location.hostname + '</div>' +
            '<div>Terminal Code: ERIC-LGN-SYS</div>' +
            '<div>Timestamp: ' + dateStr + '</div>';

        loginForm.parentNode.insertBefore(devHeaderBlock, loginForm);
    }

    // 3. IMPROVE INPUT INTERACTIONS AND ACCESSIBILITY
    var inputs = document.querySelectorAll('.login input[type="text"], .login input[type="password"]');
    inputs.forEach(function (input) {
        // Visual trigger classes for outer wrapper on load
        if (input.value !== '') {
            input.classList.add('has-content');
        }
        input.addEventListener('focus', function () {
            this.style.borderColor = '#00FF88';
        });
        input.addEventListener('blur', function () {
            if (this.value === '') {
                this.classList.remove('has-content');
            } else {
                this.classList.add('has-content');
            }
        });
    });

    // 4. SUBMIT BUTTON LOAD STATE PREVENTER
    var submitBtn = document.querySelector('#wp-submit');
    var loginFormElement = document.querySelector('#loginform');
    if (submitBtn && loginFormElement) {
        loginFormElement.addEventListener('submit', function () {
            submitBtn.value = 'AUTHORIZING...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'wait';
        });
    }

    // 5. HELPFUL URL PARAMETER CHECKER (For returning user messages)
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loggedout') === 'true') {
        var errorBar = document.querySelector('.message');
        if (errorBar) {
            errorBar.innerHTML = 'WORDPRESS SESSION HAS CLOSED SUCCESSFULLY. REDIRECT ACTIVE.';
            errorBar.style.borderColor = '#ef4444';
        }
    }
});
