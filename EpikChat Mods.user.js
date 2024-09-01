// ==UserScript==
// @name         EpikChat Mods
// @namespace    http://tampermonkey.net/
// @version      2024-09-01
// @description  v1.00 test
// @author       half_amused
// @match        https://www.epikchat.com/chat
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epikchat.com
// @grant        none
// @updateURL    https://github.com/halfamused/Epik/raw/main/EpikChat%20Mods.user.js
// @downloadURL  https://github.com/halfamused/Epik/raw/main/EpikChat%20Mods.user.js
// ==/UserScript==

// Mods list:
// Filter Mod - Allows you to filter whatever room you are in by partial usernames separated by commas. You will only see messages from the people on the list. Delete the list to return chat to normal.
// Imgur - Opens normal Imgur share links without going to a new tab.
// Volme - Changes volume scale from 1:100 to 1:1000 (for those really loud mics that are still too loud after turning them all the way down).
// Games - Adds the Game window where game share links can be entered to game with friends without leaving chat. (Replaces Popular Rooms and Doodles in the Side Bar).
// Score Card - Adds an interactive whiteboard to manually keep scores in certain games, gives things a more natural game night feel (Replaces Media Tab in the Side Bar).
// Multivid Popup - Allows you to open multiple free floating cam windows. They are restricted to the chat window. You can still open a single picture-in-picture window by right clicking a cam, which is not restricted to the chat window.
// @username Autosuggestion - Creates an autosuggestion list when you  type @ and begin typing a , you can click on a name from the list or use tab to choose the top name on the list.

// Coming soon:
// Temporary Block - The inverse of the Filter Mod, the messages of people added to this list will not be seen in whatever room you are chatting in.
// Mods Menu - A Menu Panel added to the EpikChat Menu that allows you to enable and disable all mods.




// ********************************************************************FILTER MOD********************************************************************

// Create and style the overlay
let overlay = document.createElement("div");
overlay.id = "messageOverlay";
overlay.style.position = "absolute";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "#2C2E32"; // Background color
overlay.style.zIndex = "3"; // Ensure it's on top
overlay.style.display = "none"; // Initially hidden
overlay.style.overflowY = "auto"; // Enable scrolling
overlay.style.padding = "10px"; // Add padding
overlay.style.boxSizing = "border-box"; // Ensure padding doesn't affect size
overlay.style.flexDirection = "column";
overlay.style.justifyContent = "flex-end";
overlay.style.alignItems = "flex-start"; // Align items to the start

// Append the overlay to the document body
document.body.appendChild(overlay);

// Declare the filter input variable at the top
let filterInput;

// Function to update visibility of original messages based on filter
function updateMessageVisibility() {
    let filterText = filterInput.value.trim().toLowerCase();
    let criteria = filterText.split(',').map(item => item.trim()).filter(item => item.length > 0); // Split input into criteria
    let messageContainer = document.querySelector("#messagesLC");
    let messageElements = messageContainer.querySelectorAll(".chat-item.message");

    messageElements.forEach(function(messageElement) {
        let userNameElement = messageElement.querySelector('.user-name');
        if (userNameElement) {
            let userName = userNameElement.textContent.toLowerCase();
            // Check if userName matches any of the criteria
            let matches = criteria.length === 0 || criteria.some(criterion => userName.includes(criterion));
            messageElement.style.display = matches ? "" : "none"; // Show or hide the message
        }
    });
}

// Append the textbox above and to the far right of the specified node
let targetElement = document.querySelector("#messagesLS");
if (targetElement) {
    // Create the input box
    filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.class = "search";
    filterInput.placeholder = "Filter by Username (CSV)";
    filterInput.style.position = "absolute"; // Position it absolutely
    filterInput.style.left = "20px"; // Align to the right of the container
    filterInput.style.top = `${targetElement.offsetTop - 0}px`; // Adjust top to place it above the target element
    filterInput.style.zIndex = "3"; // Ensure it’s above other elements

    // Append the input box to the parent of the target element
    let container = targetElement.parentNode;
    container.style.position = "relative"; // Ensure container is positioned relative for absolute positioning
    container.appendChild(filterInput);

    // Add event listener to filter nodes inside #messagesLC based on textbox input
    filterInput.addEventListener("input", function() {
        updateMessageVisibility();
    });

    // Make sure filterInput is accessible globally
    window.filterInput = filterInput;
}

// Observer setup and callback
let targetNode = document.querySelector("#messagesLC");
if (targetNode) {
    let config = { childList: true, subtree: true };

    let newObserver = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                updateMessageVisibility(); // Update the visibility when nodes are added
            }
        }
    };

    let observerInstance = new MutationObserver(newObserver);
    observerInstance.observe(targetNode, config);
}


// ********************************************************************IMGUR MOD********************************************************************

(function() {
    'use strict';

// Function to create and append the Imgur embed
function appendImgurEmbed(imgurId) {
    console.log('Appending embed for Imgur ID:', imgurId);

    // Create the outermost container
    const spotlightDiv = document.createElement('div');
    spotlightDiv.id = 'spotlight';
    spotlightDiv.className = 'menu show';

    // Create spinner element
    const spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'spl-spinner';
    spotlightDiv.appendChild(spinnerDiv);

    // Create track element
    const trackDiv = document.createElement('div');
    trackDiv.className = 'spl-track';

    // Create scene element
    const sceneDiv = document.createElement('div');
    sceneDiv.className = 'spl-scene';
    sceneDiv.style.transform = 'translateX(0%)';

    // Create pane element for the Imgur embed
    const paneDiv = document.createElement('div');
    paneDiv.className = 'spl-pane';
    paneDiv.style.transition = 'none';

    // Create overlay for the Imgur content
    const imgurOverlayDiv = document.createElement('div');
    imgurOverlayDiv.id = 'imgur-overlay';
    imgurOverlayDiv.style.position = 'fixed';
    imgurOverlayDiv.style.top = '50%';
    imgurOverlayDiv.style.left = '50%';
    imgurOverlayDiv.style.transform = 'translate(-50%, -50%) scale(1)';
    imgurOverlayDiv.style.opacity = '1';
    imgurOverlayDiv.style.visibility = 'visible';
    imgurOverlayDiv.style.zIndex = '9999';

    // Create a blockquote element for the Imgur embed
    const imgurBlockquote = document.createElement('blockquote');
    imgurBlockquote.className = 'imgur-embed-pub';
    imgurBlockquote.lang = 'en';
    imgurBlockquote.setAttribute('data-id', `a/${imgurId}`);
    imgurBlockquote.innerHTML = `<a href="//imgur.com/a/${imgurId}"></a>`;

    // Create an invisible overlay to handle clicks
    const clickOverlay = document.createElement('div');
    clickOverlay.style.position = 'absolute';
    clickOverlay.style.top = '0';
    clickOverlay.style.left = '0';
    clickOverlay.style.width = '100%';
    clickOverlay.style.height = '100%';
    clickOverlay.style.zIndex = '1000';
    clickOverlay.style.cursor = 'pointer';
    clickOverlay.onclick = () => {
        // Open the original Imgur link in a new tab
        window.open(`//imgur.com/a/${imgurId}`, '_blank');
    };

    // Append the click overlay to the imgurOverlayDiv
    imgurOverlayDiv.appendChild(clickOverlay);

    // Append blockquote to the overlay
    imgurOverlayDiv.appendChild(imgurBlockquote);
    paneDiv.appendChild(imgurOverlayDiv);
    sceneDiv.appendChild(paneDiv);
    trackDiv.appendChild(sceneDiv);
    spotlightDiv.appendChild(trackDiv);

    // Append the spotlight div to the body
    document.body.appendChild(spotlightDiv);

    // Create the script element to load Imgur's embed.js
    const script = document.createElement('script');
    script.src = '//s.imgur.com/min/embed.js';
    script.charset = 'utf-8';
    script.async = true;

    // Append the script to the spotlight div to load the Imgur embed script
    spotlightDiv.appendChild(script);
}



    // Function to create and append the comments overlay
    function appendCommentsOverlay() {
        console.log('Appending comments overlay');

        // Create a container for the comments overlay
        let commentsContainer = document.getElementById('comments-overlay');
        if (!commentsContainer) {
            commentsContainer = document.createElement('div');
            commentsContainer.id = 'comments-overlay';
            commentsContainer.style.position = 'fixed';
            commentsContainer.style.top = '10px';
            commentsContainer.style.right = '10px';
            commentsContainer.style.backgroundColor = 'white';
            commentsContainer.style.border = '1px solid #ccc';
            commentsContainer.style.padding = '10px';
            commentsContainer.style.zIndex = '9998';
            commentsContainer.style.maxWidth = '30vw';
            commentsContainer.style.maxHeight = '90vh';
            commentsContainer.style.overflow = 'auto';
            document.body.appendChild(commentsContainer);
        }

        // Set the content of the comments container
        commentsContainer.innerHTML = `
            <div id="comments">
                <div class="spl-c-header">
                    <div class="spl-user" style="visibility: visible;">
                        <span class="media-left">
                            <a href="/laylay12" target="_blank">
                                <img class="media-object img-circle" src="https://www.epikchat.com/sites/default/files/global/images/default_profile.png" height="42" width="42">
                            </a>
                        </span>
                        <div class="media-body">
                            <strong><a href="/imgur" target="_blank">imgur</a></strong>
                            <p><small>It's 4:20 somewhere.</small></p>
                        </div>
                    </div>
                    <div class="closeMediaView" role="tooltip" aria-label="Press ESC to close" data-microtip-position="bottom-left">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div id="comments-body">
                    <div id="comments-intro" style="visibility: visible;">
                        <div class="spl-desc"></div>
                        <hr style="margin-top: 15px;">
                        <div class="spl-c-header" data-mid="243408">
                            <div class="action-button">
                                <div class="spl-views"><i class="far fa-eye"></i></div>
                                <div class="spl-views-number">1</div>
                            </div>
                            <div class="action-button">
                                <div class="spl-like" role="tooltip" aria-label="Like" data-microtip-position="bottom">
                                    <i class="far fa-heart"></i>
                                </div>
                                <div class="spl-likes-number" role="tooltip" data-microtip-position="bottom" aria-label="gosha_eureka">1</div>
                            </div>
                            <div class="spl-favorite action-button" role="tooltip" aria-label="Add to favorites" data-microtip-position="bottom">
                                <i class="far fa-star"></i>
                            </div>
                            <div class="spl-link action-button" role="tooltip" aria-label="Copy link" data-microtip-position="bottom" data-url="https://www.epikchat.com/laylay12/doodles/243408">
                                <i class="fas fa-link"></i>
                            </div>
                        </div>
                        <hr>
                    </div>
                    <ul class="media-list media-list-conversation">
                        <li class="media emptyComments text-center"><h4>korie's imegerr mod.</h4></li>
                    </ul>
                </div>
                <form id="addCommentForm" style="position: absolute; display: block; bottom: 32px; padding: 0px 30px; visibility: visible;">
                    <div class="input-group">
                        <input id="mediaComment" type="text" class="form-control" maxlength="200" placeholder="don't do it, idk what will happen...">
                        <div class="input-group-btn">
                            <button type="submit" id="submitComment" class="btn btn-default m-t-0">Post</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        // Add event listener to closeMediaView button
        const closeButton = commentsContainer.querySelector('.closeMediaView');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                // Remove both overlays
                const spotlight = document.getElementById('spotlight');
                const commentsOverlay = document.getElementById('comments-overlay');

                if (spotlight) {
                    spotlight.remove();
                }
                if (commentsOverlay) {
                    commentsOverlay.remove();
                }
            });
        }
    }

    // Function to handle clicks on Imgur links
    function handleImgurLinkClick(event) {
        const target = event.target.closest('a');

        // Ensure we're dealing with a link element and prevent default action
        if (target && target.href.includes('imgur.com/a/')) {
            event.preventDefault(); // Prevent the default link behavior
            event.stopImmediatePropagation(); // Stop other listeners from running

            console.log('Clicked link:', target.href);

            // Get the Imgur album ID from the URL
            const imgurId = target.href.split('/a/')[1].split('?')[0];

            // Log the Imgur ID to the console
            console.log('Imgur ID:', imgurId);

            // Append the Imgur embed
            appendImgurEmbed(imgurId);

            // Append the comments overlay
            appendCommentsOverlay();
        }
    }

    // Attach the event listener to the document for clicks on Imgur links
    document.addEventListener('click', handleImgurLinkClick, true);

})();


// ********************************************************************VOLUME MOD********************************************************************

(function() {
    'use strict';

    // Function to update the step attribute
    function updateStepAttribute(element) {
        if (element.classList.contains('vol-control')) {
            element.step = '0.1'; // Set the step attribute to 0.1 for decimal support
        }
    }

    // Create a MutationObserver to watch for new nodes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node itself is a .vol-control element
                        if (node.matches('.vol-control')) {
                            updateStepAttribute(node);
                        }
                        // Check if any child nodes are .vol-control elements
                        node.querySelectorAll('.vol-control').forEach(updateStepAttribute);
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also handle already existing volume controls
    document.querySelectorAll('.vol-control').forEach(updateStepAttribute);
})();

// ********************************************************************GAMES MOD********************************************************************


(function() {
    'use strict';

    // Function to create the modal
    function createModal() {
        // Create the modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'gamediv';
        modalContainer.style.position = 'absolute'; // For free movement
        modalContainer.style.left = '50%'; // Centered horizontally initially
        modalContainer.style.top = '50%'; // Centered vertically initially
        modalContainer.style.transform = 'translate(-50%, -50%)'; // Centering by translating
        modalContainer.style.backgroundColor = '#34363A'; // Background color
        modalContainer.style.border = '2px solid #ccc';
        modalContainer.style.zIndex = '9999'; // Ensure it is above other content
        modalContainer.style.overflow = 'hidden'; // Prevent overflow
        modalContainer.style.width = '300px'; // Initial width
        modalContainer.style.height = '200px'; // Initial height
        modalContainer.style.cursor = 'default'; // Default cursor
        modalContainer.style.borderRadius = '15px'; // Rounded edges
        modalContainer.style.color = '#CCCCCC'; // Text color
        modalContainer.style.display = 'none'; // Start with display block

        // Create the iframe inside the modal container
        const innerIframe = document.createElement('iframe');
        innerIframe.id = 'epikgame';
        innerIframe.src = 'https://richup.io/';
        innerIframe.style.width = '100%';
        innerIframe.style.height = '100%';
        innerIframe.style.border = 'none';

        // Append the inner iframe to the modal container
        modalContainer.appendChild(innerIframe);

        // Append the modal container to the body
        document.body.appendChild(modalContainer);

        // Create and style the Font Awesome drag icon (top-left corner)
        const dragIcon = document.createElement('i');
        dragIcon.className = 'fa-solid fa-arrows'; // Font Awesome icon for dragging
        dragIcon.style.position = 'absolute';
        dragIcon.style.top = '0';
        dragIcon.style.left = '0';
        dragIcon.style.color = '#fff'; // Adjust color if needed
        dragIcon.style.fontSize = '20px'; // Adjust size if needed
        dragIcon.style.cursor = 'move'; // Cursor for dragging
        dragIcon.style.padding = '5px'; // Padding around the icon
        modalContainer.appendChild(dragIcon);

        // Handle dragging to make the modal free-floating
        let isDragging = false;
        let offsetX, offsetY;

        dragIcon.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - modalContainer.getBoundingClientRect().left;
            offsetY = e.clientY - modalContainer.getBoundingClientRect().top;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDragging);
        });

        function drag(e) {
            if (isDragging) {
                let newLeft = e.clientX - offsetX;
                let newTop = e.clientY - offsetY;

                // Optional: Limit dragging within the viewport
                newLeft = Math.max(newLeft, 0);
                newTop = Math.max(newTop, 0);
                newLeft = Math.min(newLeft, window.innerWidth - modalContainer.offsetWidth);
                newTop = Math.min(newTop, window.innerHeight - modalContainer.offsetHeight);

                modalContainer.style.left = `${newLeft}px`;
                modalContainer.style.top = `${newTop}px`;
                modalContainer.style.transform = 'none'; // Disable the centering transform when dragging
            }
        }

        function stopDragging() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDragging);
        }

        // Create and style the Font Awesome resize icon (bottom-right corner)
        const resizeIcon = document.createElement('i');
        resizeIcon.className = 'fa-solid fa-up-right-and-down-left-from-center'; // Font Awesome icon for resizing
        resizeIcon.style.position = 'absolute';
        resizeIcon.style.right = '0';
        resizeIcon.style.bottom = '0';
        resizeIcon.style.color = '#fff'; // Adjust color if needed
        resizeIcon.style.fontSize = '20px'; // Adjust size if needed
        resizeIcon.style.cursor = 'se-resize'; // Cursor for resizing
        resizeIcon.style.padding = '5px'; // Padding around the icon
        resizeIcon.style.transform = 'rotate(90deg)'; // Rotate the icon to align arrows correctly
        modalContainer.appendChild(resizeIcon);

        // Handle resizing using the resize icon
        resizeIcon.addEventListener('mousedown', startResizing);

        function startResizing(e) {
            e.preventDefault();
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }

        function resize(e) {
            const rect = modalContainer.getBoundingClientRect();
            const width = e.clientX - rect.left;
            const height = e.clientY - rect.top;
            modalContainer.style.width = `${Math.max(100, width)}px`; // Minimum width of 100px
            modalContainer.style.height = `${Math.max(100, height)}px`; // Minimum height of 100px
        }

        function stopResizing() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
    }

    createModal();
})();






// Create and configure the div to replace #home-trending
const newDiv = document.createElement('div');
newDiv.className = 'btn-group list-search';

// Create the input box
const input = document.createElement('input');
input.type = 'text';
input.className = 'search';
input.placeholder = 'Set Shared Link';

// Create the "Set" button
const setButton = document.createElement('button');
setButton.className = 'badge';
setButton.textContent = 'Set';
setButton.addEventListener('click', () => {
    const iframe = document.querySelector('#epikgame');
    if (iframe) {
        iframe.src = input.value;
    }
});

// Create a container for the input and set button
const inputContainer = document.createElement('div');
inputContainer.style.display = 'flex';
inputContainer.style.alignItems = 'center';

// Append input and set button to the container
inputContainer.appendChild(input);
inputContainer.appendChild(setButton);

// Create the "Game Visibility:" label
const nameDiv = document.createElement('div');
nameDiv.className = 'name';
nameDiv.textContent = 'Game Visibility:';

// Create the toggle button for game visibility
const toggleButton = document.createElement('button');
toggleButton.className = 'badge';
toggleButton.textContent = 'Show';
toggleButton.addEventListener('click', () => {
    const gameDiv = document.querySelector('#gamediv');
    if (gameDiv) {
        if (gameDiv.style.display === 'none' || gameDiv.style.display === '') {
            gameDiv.style.display = 'block';
            toggleButton.textContent = 'Hide';
        } else {
            gameDiv.style.display = 'none';
            toggleButton.textContent = 'Show';
        }
    }
});

// Create a container for the "Game Visibility:" label and toggle button
const visibilityContainer = document.createElement('div');
visibilityContainer.style.display = 'flex';
visibilityContainer.style.alignItems = 'center';

// Append the "Game Visibility:" label and toggle button to the container
visibilityContainer.appendChild(nameDiv);
visibilityContainer.appendChild(toggleButton);

// Append elements to the new div
newDiv.appendChild(inputContainer);
newDiv.appendChild(visibilityContainer);

// Replace #home-trending with the new div
const homeTrending = document.querySelector('#home-trending');
if (homeTrending) {
    homeTrending.replaceWith(newDiv);
}

// Create a wrapper div for input and links
const wrapper = document.createElement("div");

// Create the section header
var sectionHeader = document.querySelector("#home-inner > div:nth-child(5)");
sectionHeader.className = "section-header";
sectionHeader.textContent = "CREATE A NEW GAME";


// Create and append the first link element
var link1 = document.createElement("a");
link1.href = "https://www.pokernow.club/"; // Set href to open the desired URL
link1.className = "list-item"; // Apply a new class
link1.target = "_blank"; // Open link in a new tab
link1.style.position = 'relative'; // Position relative for the overlay

function openTextInputPopup() {
    // Create the popup container
    var popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '20px';
    popup.style.zIndex = '1000';
    popup.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    popup.style.width = '300px';
    popup.style.textAlign = 'center';

    // Create the text input field
    var textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.style.width = '100%';
    textInput.style.padding = '10px';
    textInput.style.marginBottom = '10px';

    // Create the submit button
    var submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.padding = '10px 20px';
    submitButton.style.cursor = 'pointer';

    // Add an event listener to the button to handle the input value
    submitButton.addEventListener('click', function() {
        const iframe = document.querySelector('#epikgame');
        frame.src = link2.href;
        document.body.removeChild(popup); // Close the popup
    });

    // Create the cancel button
    var cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.marginLeft = '10px';

    // Add an event listener to the cancel button to close the popup
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(popup); // Close the popup
    });

    // Append elements to the popup
    popup.appendChild(textInput);
    popup.appendChild(submitButton);
    popup.appendChild(cancelButton);

    // Append the popup to the body
    document.body.appendChild(popup);
}

// Call the function to open the popup
// openTextInputPopup();


// Create inner HTML for the first link
link1.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724611967.png" alt="Poker Now Image">
        </div>
        <div class="media-body">
            <div class="name">Poker Now</div>
            <div class="text-overlay" onclick=" openTextInputPopup(); return false;"></div> <!-- Overlay for the text -->
        </div>
    </div>`;

// Create and append the second link element
var link2 = document.createElement("a");
link2.href = "https://skribbl.io/"; // Set href to open the desired URL
link2.className = "list-item"; // Apply a new class
link2.target = "_blank"; // Open link in a new tab
link2.style.position = 'relative'; // Position relative for the overlay

function clk2() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link2.href;
}

// Create inner HTML for the second link
link2.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724611995.png" alt="Skribbl.io Image">
        </div>
        <div class="media-body">
            <div class="name">Skribbl.io</div>
            <div class="text-overlay" onclick="clk2()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;

// Create and append the third link element
var link3 = document.createElement("a");
link3.href = "https://buddyboardgames.com/connect4"; // Set href to open the desired URL
link3.className = "list-item"; // Apply a new class
link3.target = "_blank"; // Open link in a new tab
link3.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace YT
function clk3() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link3.href;
}

// Create inner HTML for the third link
link3.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724619637.png" alt="Connect 4 Image">
        </div>
        <div class="media-body">
            <div class="name">Connect 4</div>
            <div class="text-overlay" onclick="clk3()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;

// Create and append the forth link element
var link4 = document.createElement("a");
link4.href = "https://picturecards.online/static/index.html"; // Set href to open the desired URL
link4.className = "list-item"; // Apply a new class
link4.target = "_blank"; // Open link in a new tab
link4.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace YT
function clk4() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link4.href;
}

// Create inner HTML for the forth link
link4.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724633326.png" alt="Connect 4 Image">
        </div>
        <div class="media-body">
            <div class="name">Cards Against Humanity</div>
            <div class="text-overlay" onclick="clk4()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;

// Create and append the fifth link element
var link5 = document.createElement("a");
link5.href = "https://playingcards.io/kr3pdh"; // Set href to open the desired URL
link5.className = "list-item"; // Apply a new class
link5.target = "_blank"; // Open link in a new tab
link5.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace YT
function clk5() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link5.href;
}

// Create inner HTML for the fifth link
link5.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724659752.png" alt="Connect 4 Image">
        </div>
        <div class="media-body">
            <div class="name">Bones</div>
            <div class="text-overlay" onclick="clk5()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;

// Create and append the sixth link element
var link6 = document.createElement("a");
link6.href = "https://playingcards.io/fap9wv"; // Set href to open the desired URL
link6.className = "list-item"; // Apply a new class
link6.target = "_blank"; // Open link in a new tab
link6.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace YT
function clk6() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link6.href;
}

// Create inner HTML for the sixth link
link6.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724659841.png" alt="Connect 4 Image">
        </div>
        <div class="media-body">
            <div class="name">Asshole</div>
            <div class="text-overlay" onclick="clk6()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;

// Create and append the seventh link element
var link7 = document.createElement("a");
link7.href = "https://richup.io/"; // Set href to open the desired URL
link7.className = "list-item"; // Apply a new class
link7.target = "_blank"; // Open link in a new tab
link7.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace YT
function clk7() {
    const iframe = document.querySelector('#epikgame');
    iframe.src = link7.href;
}

// Create inner HTML for the sixth link
link7.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1725081679.png" alt="Connect 4 Image">
        </div>
        <div class="media-body">
            <div class="name">Monopoly</div>
            <div class="text-overlay" onclick="clk7()"></div> <!-- Corrected the function call -->
        </div>
    </div>`;


// Append the Game Links to Right Panel
wrapper.appendChild(sectionHeader);
wrapper.appendChild(link1);
wrapper.appendChild(link2);
wrapper.appendChild(link3);
wrapper.appendChild(link4);
wrapper.appendChild(link5);
wrapper.appendChild(link6);
wrapper.appendChild(link7);

// Replace the existing element with the new wrapper
var outa = document.querySelector("#home-inner");
var inna = document.querySelector("#home-trending");
var doodle = document.querySelector("#home-media-doodles");
var gobye2 = document.querySelector("#home-inner > div:nth-child(5)");
outa.replaceChild(wrapper, doodle);

// Custom button and link styling within JavaScript
var style = document.createElement('style');
style.innerHTML = `
    .custom-button {
        color: #888888; /* Swapped text color */
        font-size: 14px; /* Adjusted font size */
        margin: 0px 4px; /* Margin adjusted */
        display: inline-block; /* Display */
        position: relative; /* Position */
        cursor: pointer; /* Cursor */
        background-color: #566666; /* Swapped background color */
        border: none; /* Remove default border */
        padding: 2px 5px; /* Adjusted padding */
        height: 18px; /* Height adjusted */
        line-height: 14px; /* Line height adjusted */
        text-align: center; /* Text alignment */
        border-radius: 5px; /* Rounded corners */
    }
    .send-button {
        /* Styling specific to the POST URL button */
        width: auto; /* Automatic width to fit text */
    }
    .custom-button:not(.send-button) {
        /* Styling for minus and plus buttons */
        width: 24px; /* Fixed width for consistency */
    }
    .custom-button:hover {
        background-color: #444444; /* Darker background on hover */
        color: #888888; /* Text color on hover */
    }
    .list-item {
        display: block;
        padding: 4px 10px;
        color: var(--list-item-text-color); /* Ensure this variable is defined in your CSS */
        text-decoration: none;
        font-weight: 500;
        height: 42px;
        line-height: 42px; /* Center text vertically */
        position: relative; /* Ensure the overlay is positioned relative to the link */
        transition: background-color 0.2s ease; /* Smooth transition for background color */
    }
    .text-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0); /* Fully transparent background */
        cursor: pointer; /* Pointer cursor */
        z-index: 10; /* Ensure it appears above the text */
        /* No margin, padding, or borders to avoid shifting */
    }
    .text-overlay:hover {
        background: rgba(255, 255, 255, 0); /* Maintain transparency on overlay hover */
    }
    .list-item:hover {
        background-color: #1F2124; /* Background color of the link when hovering over the overlay */
    }
`;
document.head.appendChild(style);

// ********************************************************************SCORE PAD********************************************************************

var element = document.createElement("div");
element.style.position = "fixed";
element.style.zIndex = "9999";
element.id = "lc";

var element2 = document.createElement("iframe");
element2.src = "https://browserboard.com/whiteboard/kvGTmeD6Q6FKRGjDnpa7Hz?key=7W9xg6Jara6hkJF2xpPR6W";
element2.height = "918.65px";
element2.width = "260px";

element.appendChild(element2);

let test = document.getElementById('media-inner');
document.getElementById('media').replaceChild(element, test);

// ********************************************************************MULTI-VID POP-UP********************************************************************

(function() {
    'use strict';

    // Function to move the video to a modal
    function moveVideoToModal(videoNode) {
        if (!videoNode) {
            console.error('Video node not found.');
            return;
        }

        // Store the original parent node and styles of the video
        const originalParent = videoNode.parentNode;
        const originalStyles = {
            width: videoNode.style.width,
            height: videoNode.style.height,
            position: videoNode.style.position,
        };

        // Get the aspect ratio of the video
        const aspectRatio = videoNode.videoWidth / videoNode.videoHeight;

        // Create the modal container
        const modalContainer = document.createElement('div');
        modalContainer.style.position = 'absolute'; // For free movement
        modalContainer.style.left = '50%';
        modalContainer.style.top = '50%';
        modalContainer.style.transform = 'translate(-50%, -50%)'; // Centered initially
        modalContainer.style.backgroundColor = 'transparent'; // Transparent background
        modalContainer.style.border = 'none'; // No border
        modalContainer.style.zIndex = '1000'; // Ensure it is above other content
        modalContainer.style.overflow = 'hidden'; // Prevent overflow
        modalContainer.style.display = 'inline-block';
        modalContainer.style.cursor = 'default'; // Use default cursor (arrow)
        modalContainer.style.borderRadius = '15px'; // Rounded edges for modal

        // Move the video node to the modal container
        videoNode.style.position = 'relative'; // Adjust position for modal
        videoNode.style.width = '100%';
        videoNode.style.height = '100%';
        modalContainer.appendChild(videoNode);

        // Set initial modal size based on the aspect ratio
        const initialWidth = videoNode.videoWidth || 640;  // Fallback to 640px width if videoWidth is not available
        const initialHeight = initialWidth / aspectRatio;
        modalContainer.style.width = `${initialWidth}px`;
        modalContainer.style.height = `${initialHeight}px`;

        // Append the modal container to the body
        document.body.appendChild(modalContainer);

        // Create and style the Font Awesome close button inside the modal
        const closeButton = document.createElement('i');
        closeButton.className = 'fa-regular fa-circle-xmark cur-pointer videoStopBtn'; // Adjust class as needed
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.color = '#fff'; // Adjust color if needed
        closeButton.style.fontSize = '24px'; // Adjust size if needed
        closeButton.style.display = 'none'; // Initially hidden
        closeButton.addEventListener('click', closeModal);
        modalContainer.appendChild(closeButton);

        // Show close button on modal mouseover, hide on mouseout
        modalContainer.addEventListener('mouseover', () => {
            closeButton.style.display = 'block';
        });
        modalContainer.addEventListener('mouseout', () => {
            closeButton.style.display = 'none';
        });

        // Function to close the modal and restore the video
        function closeModal() {
            // Restore original styles
            videoNode.style.width = originalStyles.width;
            videoNode.style.height = originalStyles.height;
            videoNode.style.position = originalStyles.position;

            // Move the video back to its original parent
            originalParent.appendChild(videoNode);

            // Remove the modal container from the document
            document.body.removeChild(modalContainer);
        }

        // Create and style the resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.style.width = '20px';
        resizeHandle.style.height = '20px';
        resizeHandle.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.right = '0';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.cursor = 'se-resize'; // Cursor for resizing
        modalContainer.appendChild(resizeHandle);

        // Handle resizing using the resize handle while maintaining the aspect ratio
        resizeHandle.addEventListener('mousedown', startResizing);

        function startResizing(e) {
            e.preventDefault();
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }

        function resize(e) {
            const width = e.clientX - modalContainer.getBoundingClientRect().left;
            const height = width / aspectRatio;
            modalContainer.style.width = `${width}px`;
            modalContainer.style.height = `${height}px`;
        }

        function stopResizing() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }

        // Handle dragging to make the modal free-floating
        let isDragging = false;
        let offsetX, offsetY;

        modalContainer.addEventListener('mousedown', function(e) {
            if (e.target !== resizeHandle && e.target !== closeButton) {
                isDragging = true;
                offsetX = e.clientX - modalContainer.getBoundingClientRect().left;
                offsetY = e.clientY - modalContainer.getBoundingClientRect().top;
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDragging);
            }
        });

        function drag(e) {
            if (isDragging) {
                let newLeft = e.clientX - offsetX;
                let newTop = e.clientY - offsetY;

                // Optional: Limit dragging within the viewport
                newLeft = Math.max(newLeft, 0);
                newTop = Math.max(newTop, 0);
                newLeft = Math.min(newLeft, window.innerWidth - modalContainer.offsetWidth);
                newTop = Math.min(newTop, window.innerHeight - modalContainer.offsetHeight);

                modalContainer.style.left = `${newLeft}px`;
                modalContainer.style.top = `${newTop}px`;
                modalContainer.style.transform = 'none'; // Disable the centering transform when dragging
            }
        }

        function stopDragging() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDragging);
        }
    }

    // Function to handle click events on SVG buttons
    function handleSvgButtonClick(event) {
        event.stopImmediatePropagation(); // Prevent default behavior

        const svgButton = this;

        // Find the parent node with a specific selector
        const parentNode = svgButton.closest('.bcst-player');

        if (parentNode) {
            // Get the associated video element within this parent node
            const video = parentNode.querySelector('video');

            if (video) {
                // Move the video to the modal
                moveVideoToModal(video);
            }
        }
    }

    // Function to set up click handlers for SVG buttons
    function setupSvgButtonHandlers() {
        // Select all SVG buttons
        const svgButtons = document.querySelectorAll(".bcst-player .ecp-popout");

        svgButtons.forEach(svgButton => {
            // Store the original onclick function if it exists
            const originalOnClick = svgButton.onclick;

            // Remove any previously attached event listeners
            svgButton.onclick = function(event) {
                event.stopImmediatePropagation(); // Prevent default behavior
                handleSvgButtonClick.call(this, event);

                // Call the original onclick function if it exists
                if (originalOnClick) {
                    originalOnClick.call(this, event);
                }
            };
        });
    }

    // Initialize handlers for existing SVG buttons
    setupSvgButtonHandlers();

    // Set up a MutationObserver to handle dynamically added nodes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                // Check if the added node is an SVG button or contains SVG buttons
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Handle SVG buttons directly within the node
                    if (node.matches && node.matches(".bcst-player .ecp-popout")) {
                        setupSvgButtonHandlers();
                    }
                    // Also handle the scenario where SVG buttons are added inside a new parent
                    if (node.querySelectorAll) {
                        node.querySelectorAll(".bcst-player .ecp-popout").forEach(svgButton => {
                            setupSvgButtonHandlers();
                        });
                    }
                }
            });
        });
    });

    // Observe changes to the entire document body
    observer.observe(document.body, { childList: true, subtree: true });
})();


// ********************************************************************@user auto********************************************************************

// Variables to store user names and filtered suggestions
let userNames = [];
let filteredNames = [];
let activeIndex = -1;

// Function to extract and log user names
function logUserNames() {
    const userNameElements = document.querySelectorAll('#usersLS .user-name');
    userNames = Array.from(userNameElements).map(element => element.textContent.trim());
}

// Function to show the suggestions dropdown
function showSuggestions(inputElement) {
    let suggestionsBox = document.querySelector("#suggestionsBox");

    if (!suggestionsBox) {
        suggestionsBox = document.createElement('div');
        suggestionsBox.id = 'suggestionsBox';
        suggestionsBox.style.position = 'absolute';
        suggestionsBox.style.display = 'none';
        suggestionsBox.style.backgroundColor = '#34363A';
        suggestionsBox.style.border = '1px solid #ccc';
        suggestionsBox.style.zIndex = '1000';
        suggestionsBox.style.color = '#CCCCCC'; // Text color
        suggestionsBox.style.borderRadius = '4px';
        suggestionsBox.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)'; // Shadow for better visibility
        suggestionsBox.style.opacity = '0.9'; // Slight transparency
        suggestionsBox.style.fontSize = '14px';
        suggestionsBox.style.padding = '0'; // No extra padding
        suggestionsBox.style.whiteSpace = 'nowrap'; // Prevent text wrapping
        suggestionsBox.style.maxWidth = `${inputElement.offsetWidth}px`; // Match width of input element
        document.body.appendChild(suggestionsBox);
    }

    suggestionsBox.innerHTML = '';

    filteredNames.forEach((name, index) => {
        const item = document.createElement('div');
        item.textContent = name;
        item.classList.add('suggestion-item');
        item.dataset.index = index; // Store the index for selection
        item.style.padding = '8px 12px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #444';
        item.style.transition = 'background-color 0.3s'; // Smooth transition for hover effect
        item.addEventListener('click', () => selectSuggestion(index));
        suggestionsBox.appendChild(item);
    });

    const rect = inputElement.getBoundingClientRect();
    suggestionsBox.style.left = `${rect.left}px`;
    suggestionsBox.style.top = `${rect.top - suggestionsBox.offsetHeight}px`; // Position above the input field
    suggestionsBox.style.display = 'block';

    activeIndex = 0;
    updateActiveSuggestion();
}

// Function to hide the suggestions dropdown
function hideSuggestions() {
    const suggestionsBox = document.querySelector("#suggestionsBox");
    if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }
    activeIndex = -1;
}

// Function to select a suggestion from the filtered list
function selectSuggestion(filteredIndex) {
    const inputElement = document.querySelector("#chatInputWrapper > div.dropup > div.emojionearea.emojionearea-inline > div.emojionearea-editor");

    if (filteredIndex >= 0 && filteredIndex < filteredNames.length) {
        const userName = filteredNames[filteredIndex];
        const newText = `@${userName}`; // Username without trailing space

        // Update the content with @username
        inputElement.innerHTML = newText;

        // Move the cursor to the end
        setTimeout(() => {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(inputElement.firstChild, newText.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            inputElement.focus();
        }, 100); // Delay to ensure content is set correctly

        // Hide suggestions
        hideSuggestions();
    }
}

// Function to handle keydown events
function handleKeyDown(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        if (filteredNames.length > 0 && activeIndex >= 0) {
            selectSuggestion(activeIndex); // Select the active value from the filtered list
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (filteredNames.length > 0) {
            activeIndex = (activeIndex + 1) % filteredNames.length;
            updateActiveSuggestion();
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (filteredNames.length > 0) {
            activeIndex = (activeIndex - 1 + filteredNames.length) % filteredNames.length;
            updateActiveSuggestion();
        }
    }
}

// Function to update the active suggestion's styling
function updateActiveSuggestion() {
    const items = document.querySelectorAll('#suggestionsBox .suggestion-item');
    items.forEach((item, index) => {
        item.style.backgroundColor = index === activeIndex ? '#555' : '#34363A'; // Highlight active item
        item.style.color = index === activeIndex ? '#FFFFFF' : '#CCCCCC'; // Change text color when active
    });
}

// Function to handle input events
function handleInput(event) {
    const inputElement = event.target;
    const text = inputElement.innerText; // Use innerText for content extraction
    const match = text.match(/@(\w*)$/);
    if (match) {
        const query = match[1].toLowerCase();
        filteredNames = userNames
            .filter(name => name.toLowerCase().startsWith(query));
        if (filteredNames.length > 0) {
            showSuggestions(inputElement);
        } else {
            hideSuggestions();
        }
    } else {
        hideSuggestions();
    }
}

// Add a MutationObserver to monitor changes in the user list
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            logUserNames();
        }
    });
});

const userListContainer = document.getElementById('usersLS'); // Renamed targetNode to userListContainer
const config = { childList: true, subtree: true };
observer.observe(userListContainer, config);

// Initial log of user names
logUserNames();

// Add event listeners to handle input and keydown events
const inputElement = document.querySelector("#chatInputWrapper > div.dropup > div.emojionearea.emojionearea-inline > div.emojionearea-editor");
inputElement.addEventListener('input', handleInput);
inputElement.addEventListener('keydown', handleKeyDown);

