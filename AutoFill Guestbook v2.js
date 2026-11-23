// ==UserScript==
// @name         AutoFill Guestbook v2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  AutoFill guestbook forms with predefined values automatically v2
// @author       Lakshay
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

//hOW TO USE THIS :  First Open gestbooks Site like this Example :  https://montesphotography.zenfolio.com/guestbook.html
// then ...Add some New URLs CLikcking the tempermonky ...below the turn of off button ..find the button here
// real workflow is this to use like a pro  : Fistly Open just one link of gestbooks site -> save the Latest URLs -> Use URL opener to open all urls -> it fill gestbooks
(function() {
    'use strict';

    // Default URLs (will be stored)
    const STORAGE_KEY = 'guestbook_urls';
    let urlList = [];
    let autoFillEnabled = true; // Auto-fill toggle

    // Load saved URLs
    function loadUrls() {
        const saved = GM_getValue(STORAGE_KEY, '');
        if (saved) {
            urlList = saved.split('\n').filter(url => url.trim() !== '');
        } else {
            // Default URLs if none saved
            urlList = [
                'https://example.com/guestbook1',
                'https://example.com/guestbook2'
            ];
            saveUrls();
        }
    }

    // Save URLs
    function saveUrls() {
        GM_setValue(STORAGE_KEY, urlList.join('\n'));
    }

    // Show URL management dialog
    function showUrlDialog() {
        const currentUrls = GM_getValue(STORAGE_KEY, '');

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Create dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 5px 30px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
        `;

        dialog.innerHTML = `
            <h2 style="margin-top:0;color:#333;">Guestbook URLs</h2>
            <p style="color:#666;font-size:14px;">Enter one URL per line (these will be pasted into the guestbook)</p>
            <textarea id="urlTextarea" style="
                width: 100%;
                height: 200px;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                font-family: monospace;
                resize: vertical;
                box-sizing: border-box;
            ">${currentUrls}</textarea>
            <div style="margin-top:15px;display:flex;gap:10px;justify-content:flex-end;">
                <button id="saveUrlsBtn" style="
                    padding: 10px 25px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Save</button>
                <button id="cancelUrlsBtn" style="
                    padding: 10px 25px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Event listeners
        document.getElementById('saveUrlsBtn').addEventListener('click', function() {
            const textarea = document.getElementById('urlTextarea');
            const urls = textarea.value.split('\n').filter(url => url.trim() !== '');
            urlList = urls;
            saveUrls();
            overlay.remove();
            showNotification('URLs saved successfully!');
        });

        document.getElementById('cancelUrlsBtn').addEventListener('click', function() {
            overlay.remove();
        });

        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Function to check if element exists and is visible
    function isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    // Enhanced button click function
    function clickButton(button) {
        if (!button) return false;

        try {
            // Method 1: Standard click
            button.click();
            console.log('✅ Button clicked (method 1)');
            return true;
        } catch (e) {
            console.warn('⚠️ Standard click failed, trying alternative methods');
        }

        try {
            // Method 2: Create and dispatch click event
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            });
            button.dispatchEvent(clickEvent);
            console.log('✅ Button clicked (method 2 - MouseEvent)');
            return true;
        } catch (e) {
            console.warn('⚠️ MouseEvent click failed');
        }

        try {
            // Method 3: Simulate mouse events
            const events = ['mousedown', 'mouseup', 'click'];
            events.forEach(eventType => {
                const event = new MouseEvent(eventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1
                });
                button.dispatchEvent(event);
            });
            console.log('✅ Button clicked (method 3 - full mouse simulation)');
            return true;
        } catch (e) {
            console.warn('⚠️ Mouse simulation failed');
        }

        try {
            // Method 4: If button has onclick attribute, execute it directly
            if (button.getAttribute('onclick')) {
                const onclickFunc = new Function(button.getAttribute('onclick'));
                onclickFunc.call(button);
                console.log('✅ Button clicked (method 4 - onclick execution)');
                return true;
            }
        } catch (e) {
            console.warn('⚠️ Onclick execution failed');
        }

        try {
            // Method 5: Find and call the function from the onclick attribute
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
                // Try to extract function name and call it
                const match = onclickAttr.match(/(\w+)\(/);
                if (match && match[1]) {
                    const funcName = match[1];
                    if (window[funcName] && typeof window[funcName] === 'function') {
                        window[funcName]();
                        console.log(`✅ Button clicked (method 5 - called ${funcName}())`);
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Function extraction failed');
        }

        console.error('❌ All click methods failed for button:', button);
        return false;
    }

    // Enhanced button detection
    function findAddButton() {
        // Try all possible selectors for your specific button
        const selectors = [
            // Your specific button
            'a.ml-addlink.abutton.button-font1.standard.button-bgcolor1.button-color1.button-border1',
            'a[onclick*="_add_onclick"]',
            'a[onclick*="_zf_aabb._add_onclick"]',
            'a.ml-addlink',
            'a.abutton',
            'a[href="javascript:;"]',

            // General selectors
            '#_aaba-add',
            'a[onclick*="_save_onclick"]',
            'input[type="submit"]',
            'button[type="submit"]',
            'a[class*="add"]',
            '[onclick*="add"]',
            'input[value*="Add"]',
            'button:contains("Add")',
            'a:contains("Add entry")',
            'a:contains("Add")'
        ];

        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (element && isElementVisible(element)) {
                        console.log(`🔍 Found button with selector: ${selector}`);
                        return element;
                    }
                }
            } catch (e) {
                // Skip invalid selectors
            }
        }

        // Additional search: look for any element containing "Add entry" text
        const allElements = document.querySelectorAll('a, button, input[type="submit"]');
        for (const element of allElements) {
            if (element.textContent && element.textContent.trim().toLowerCase().includes('add entry')) {
                if (isElementVisible(element)) {
                    console.log('🔍 Found button by text content: Add entry');
                    return element;
                }
            }
        }

        return null;
    }

    // Function to detect if page has guestbook form
    function detectGuestbookForm() {
        const nameInput = document.querySelector('input[name="name"]') ||
                         document.querySelector('#_aaba-name') ||
                         document.querySelector('input[id*="name" i]');

        const emailInput = document.querySelector('input[name="email"]') ||
                          document.querySelector('#_aaba-email') ||
                          document.querySelector('input[type="email"]') ||
                          document.querySelector('input[id*="email" i]');

        const messageTextarea = document.querySelector('textarea[name="message"]') ||
                               document.querySelector('textarea[name="body"]') ||
                               document.querySelector('#_aaba-body') ||
                               document.querySelector('textarea[id*="body" i]') ||
                               document.querySelector('textarea[id*="message" i]') ||
                               document.querySelector('textarea');

        const addButton = findAddButton();

        // Check if at least name and message fields exist
        if (nameInput && messageTextarea) {
            return { hasForm: true, nameInput, emailInput, messageTextarea, addButton };
        }
        return { hasForm: false };
    }

    // Main auto-fill function
    function autoFillGuestbook(showNotificationMsg = true) {
        try {
            const form = detectGuestbookForm();

            if (!form.hasForm) {
                if (showNotificationMsg) {
                    console.log('ℹ️ No guestbook form detected on this page');
                }
                return false;
            }

            let filled = false;

            // Fill name
            if (form.nameInput) {
                form.nameInput.value = 'Lakshay';
                form.nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                form.nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Filled name: Lakshay');
                filled = true;
            }

            // Fill email
            if (form.emailInput) {
                form.emailInput.value = 'nixifoddavid@gmail.com';
                form.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                form.emailInput.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('✅ Filled email: nixifoddavid@gmail.com');
                filled = true;
            }

            // Fill message textarea with URLs
            if (form.messageTextarea) {
                const urlsText = urlList.join('\n');
                form.messageTextarea.value = urlsText;
                form.messageTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                form.messageTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✅ Filled message with ${urlList.length} URLs`);
                filled = true;
            }

            // Click add button after a short delay with retry mechanism
            if (form.addButton) {
                console.log('🔍 Found add button, attempting to click...');

                // Try clicking with retry
                let clickAttempts = 0;
                const maxAttempts = 5;

                function attemptClick() {
                    clickAttempts++;
                    console.log(`🔄 Click attempt ${clickAttempts}/${maxAttempts}`);

                    const success = clickButton(form.addButton);

                    if (success) {
                        console.log('✅ Add button clicked successfully!');
                        if (showNotificationMsg) {
                            showNotification('Guestbook auto-filled and submitted!');
                        }
                        return true;
                    } else if (clickAttempts < maxAttempts) {
                        // Wait and try again with a different approach
                        console.log(`⏳ Retrying in 500ms...`);
                        setTimeout(() => {
                            // Try to find the button again (might have changed)
                            const newButton = findAddButton();
                            if (newButton) {
                                form.addButton = newButton;
                            }
                            attemptClick();
                        }, 500);
                    } else {
                        console.error('❌ Failed to click add button after multiple attempts');
                        if (showNotificationMsg) {
                            showNotification('Fields filled but could not submit automatically', 4000);
                        }
                    }
                }

                // Start the click attempts after a short delay
                setTimeout(() => {
                    attemptClick();
                }, 500);

            } else if (filled && showNotificationMsg) {
                showNotification('Guestbook fields filled! (Submit manually)');
            }

            return filled;

        } catch (error) {
            console.error('❌ Auto-fill error:', error);
            return false;
        }
    }

    // Auto-fill on page load
    function autoFillOnLoad() {
        // Wait for page to fully load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    if (autoFillEnabled) {
                        autoFillGuestbook(true);
                    }
                }, 2000); // Increased delay to ensure all dynamic content loads
            });
        } else {
            setTimeout(() => {
                if (autoFillEnabled) {
                    autoFillGuestbook(true);
                }
            }, 2000);
        }
    }

    // Also check for dynamic content changes
    function observeDynamicContent() {
        let lastFormCheck = 0;
        const observer = new MutationObserver(function(mutations) {
            // Throttle checks to avoid excessive processing
            const now = Date.now();
            if (now - lastFormCheck < 1000) {
                return;
            }
            lastFormCheck = now;

            // Check if any new forms were added
            const form = detectGuestbookForm();
            if (form.hasForm) {
                // Check if fields are empty before filling
                const nameEmpty = !form.nameInput || !form.nameInput.value;
                const messageEmpty = !form.messageTextarea || !form.messageTextarea.value;

                if ((nameEmpty || messageEmpty) && autoFillEnabled) {
                    console.log('🔄 Dynamic form detected, auto-filling...');
                    autoFillGuestbook(true);
                }
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }

    // Keyboard shortcut handler
    document.addEventListener('keydown', function(e) {
        // Ctrl+B
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            autoFillGuestbook(true);
        }
        // Ctrl+Shift+T to toggle auto-fill
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            autoFillEnabled = !autoFillEnabled;
            showNotification(`Auto-fill ${autoFillEnabled ? 'Enabled' : 'Disabled'}`);
            console.log(`🔄 Auto-fill ${autoFillEnabled ? 'enabled' : 'disabled'}`);
        }
    });

    // Simple notification
    function showNotification(message, duration = 3000) {
        // Remove existing notifications
        const existing = document.querySelector('.autofill-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'autofill-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // Register menu commands
    GM_registerMenuCommand('Manage Guestbook URLs', showUrlDialog);
    GM_registerMenuCommand('Auto-Fill Guestbook (Ctrl+B)', function() {
        autoFillGuestbook(true);
    });
    GM_registerMenuCommand('Toggle Auto-Fill (Ctrl+Shift+T)', function() {
        autoFillEnabled = !autoFillEnabled;
        showNotification(`Auto-fill ${autoFillEnabled ? 'Enabled' : 'Disabled'}`);
    });

    // Load URLs and start auto-fill
    loadUrls();

    // Enable auto-fill on page load
    autoFillOnLoad();

    // Watch for dynamic content
    observeDynamicContent();

    console.log('✅ Guestbook AutoFill script loaded!');
    console.log('ℹ️ Auto-fill is enabled - will fill forms automatically');
    console.log('ℹ️ Press Ctrl+B to manually fill');
    console.log('ℹ️ Press Ctrl+Shift+T to toggle auto-fill');
    console.log(`ℹ️ ${urlList.length} URLs loaded`);

})();
