// ==UserScript==
// @name         EpikChat Mods
// @namespace    http://tampermonkey.net/
// @version      2024-09-01
// @description  v1.03
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
// Chat Logs - (Requires DominantStranger's EpickChat enhancements which you can get here: https://dl.fifo.stream/epik/epik.user.js)
// Favorite Users - Allows you to favorite users the same way you can with rooms. Favorite users will appear at the top of the user list and their posts will be highlighted in chat.

// Completed Bug fixes:
// Bug fix - @username in the middle of a sentense. Use it or make it only at the beginning?

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
//newDiv.className = 'btn-group list-search';
newDiv.style.margin = '7px'; // Set 10px margin on all sides

// Create the input box
const input = document.createElement('input');
input.type = 'text';
input.className = 'search';
input.placeholder = 'LINK SHARED WITH YOU';

// Create the "Set" button
const setButton = document.createElement('button');
setButton.className = 'badge';
setButton.textContent = 'SET';
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

// Create clones of the input and button
// Create the input box
const input2 = document.createElement('input');
input2.type = 'text';
input2.className = 'search';
input2.placeholder = 'POST LINK IN CHAT';

// Create the "Set" button
const setButton2 = document.createElement('button');
var msg = input2.value
setButton2.className = 'badge';
setButton2.textContent = 'POST';
setButton2.addEventListener('click', function() {
        cApp.t_me(input2.value);
});

// Create a container for the cloned input and button
const clonedInputContainer = document.createElement('div');
clonedInputContainer.style.display = 'flex';
clonedInputContainer.style.alignItems = 'center';

// Append cloned input and button to the container
clonedInputContainer.appendChild(input2);
clonedInputContainer.appendChild(setButton2);

// Create the "Game Visibility:" label
const nameDiv = document.createElement('div');
nameDiv.className = 'name';
nameDiv.textContent = '   Game Visibility:';

// Create the toggle button for game visibility
const toggleButton = document.createElement('button');
toggleButton.className = 'badge';
toggleButton.textContent = 'SHOW';
toggleButton.addEventListener('click', () => {
    const gameDiv = document.querySelector('#gamediv');
    if (gameDiv) {
        if (gameDiv.style.display === 'none' || gameDiv.style.display === '') {
            gameDiv.style.display = 'block';
            toggleButton.textContent = 'HIDE';
        } else {
            gameDiv.style.display = 'none';
            toggleButton.textContent = 'SHOW';
        }
    }
});

// Create a container for the "Game Visibility:" label and toggle button
const visibilityContainer = document.createElement('div');
visibilityContainer.style.display = 'flex';
visibilityContainer.style.alignItems = 'center';
visibilityContainer.style.justifyContent = 'space-between'; // Align items to the edges

// Append the "Game Visibility:" label and toggle button to the container
visibilityContainer.appendChild(nameDiv);
visibilityContainer.appendChild(toggleButton);

// Append all containers to the new div
newDiv.appendChild(inputContainer);
newDiv.appendChild(clonedInputContainer);
newDiv.appendChild(visibilityContainer);


// Create a wrapper div for input and links
const wrapper = document.createElement("div");

const sectionHeader = document.createElement('h2');
sectionHeader.className = 'section-header'; // Apply the class name for styling
sectionHeader.textContent = 'CREATE A NEW GAME'; // Set the text content


// Create and append the first link element
var link1 = document.createElement("a");
link1.href = "https://www.pokernow.club/"; // Set href to open the desired URL
link1.className = "list-item"; // Apply a new class
link1.target = "_blank"; // Open link in a new tab
link1.style.position = 'relative'; // Position relative for the overlay

// Create inner HTML for the first link
link1.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724611967.png" alt="Poker Now Image">
        </div>
        <div class="media-body">
            <div class="name">Poker Now</div>
            <div class="text-overlay"></div>
        </div>
    </div>`;

// Optionally, if you want to also update the iframe when this link is clicked
link1.onclick = function(e) {
    // Open the link in a new tab
    const newTab = window.open(link1.href, '_blank');

    // Optionally update the iframe if needed later
    if (newTab) {
        newTab.addEventListener('beforeunload', function() {
            const iframe = document.querySelector('#epikgame');
            iframe.src = link1.href;
        });
    } else {
        // If pop-up is blocked or in case of failure
        const iframe = document.querySelector('#epikgame');
        iframe.src = link1.href;
    }
};


// Create and append the second link element
var link2 = document.createElement("a");
link2.href = "https://skribbl.io/"; // Set href to open the desired URL
link2.className = "list-item"; // Apply a new class
link2.target = "_blank"; // Open link in a new tab
link2.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk2(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
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
            <div class="text-overlay"></div>
        </div>
    </div>`;
link2.onclick = clk2; // Attach the onclick event handler

// Create and append the third link element
var link3 = document.createElement("a");
link3.href = "https://buddyboardgames.com/connect4"; // Set href to open the desired URL
link3.className = "list-item"; // Apply a new class
link3.target = "_blank"; // Open link in a new tab
link3.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk3(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
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
            <div class="text-overlay"></div> <!-- Ensure this tag is properly closed -->
        </div>
    </div>`;
link3.onclick = clk3; // Attach the onclick event handler

// Create and append the fourth link element
var link4 = document.createElement("a");
link4.href = "https://picturecards.online/static/index.html"; // Set href to open the desired URL
link4.className = "list-item"; // Apply a new class
link4.target = "_blank"; // Open link in a new tab
link4.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk4(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
    const iframe = document.querySelector('#epikgame');
    iframe.src = link4.href;
}

// Create inner HTML for the fourth link
link4.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724633326.png" alt="Cards Against Humanity Image">
        </div>
        <div class="media-body">
            <div class="name">Cards Against Humanity</div>
            <div class="text-overlay"></div> <!-- Ensure this tag is properly closed -->
        </div>
    </div>`;
link4.onclick = clk4; // Attach the onclick event handler

// Create and append the fifth link element
var link5 = document.createElement("a");
link5.href = "https://playingcards.io/kr3pdh"; // Set href to open the desired URL
link5.className = "list-item"; // Apply a new class
link5.target = "_blank"; // Open link in a new tab
link5.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk5(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
    const iframe = document.querySelector('#epikgame');
    iframe.src = link5.href;
}

// Create inner HTML for the fifth link
link5.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724659752.png" alt="Bones Image">
        </div>
        <div class="media-body">
            <div class="name">Bones</div>
            <div class="text-overlay"></div> <!-- Ensure this tag is properly closed -->
        </div>
    </div>`;
link5.onclick = clk5; // Attach the onclick event handler

// Create and append the sixth link element
var link6 = document.createElement("a");
link6.href = "https://playingcards.io/fap9wv"; // Set href to open the desired URL
link6.className = "list-item"; // Apply a new class
link6.target = "_blank"; // Open link in a new tab
link6.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk6(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
    const iframe = document.querySelector('#epikgame');
    iframe.src = link6.href;
}

// Create inner HTML for the sixth link
link6.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1724659841.png" alt="Asshole Image">
        </div>
        <div class="media-body">
            <div class="name">Asshole</div>
            <div class="text-overlay"></div> <!-- Ensure this tag is properly closed -->
        </div>
    </div>`;
link6.onclick = clk6; // Attach the onclick event handler

// Create and append the seventh link element
var link7 = document.createElement("a");
link7.href = "https://richup.io/"; // Set href to open the desired URL
link7.className = "list-item"; // Apply a new class
link7.target = "_blank"; // Open link in a new tab
link7.style.position = 'relative'; // Position relative for the overlay

// Create variable to replace epikgame iframe
function clk7(e) {
    e.preventDefault(); // Prevent the link from opening in a new tab
    const iframe = document.querySelector('#epikgame');
    iframe.src = link7.href;
}

// Create inner HTML for the seventh link
link7.innerHTML = `
    <div class="media">
        <div class="media-left">
            <img class="img-circle media-object" src="https://www.epikchat.com/sites/default/files/media/photos/29/762835-1725081679.png" alt="Monopoly Image">
        </div>
        <div class="media-body">
            <div class="name">Monopoly</div>
            <div class="text-overlay"></div> <!-- Ensure this tag is properly closed -->
        </div>
    </div>`;
link7.onclick = clk7; // Attach the onclick event handler



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
const outa = document.querySelector("#home-inner");
const trend = document.querySelector("#home-trending");
const doodle = document.querySelector("#home-media-doodles");
const gobye = document.querySelector("#home-inner > div:nth-child(2)");
newDiv.appendChild(wrapper);
outa.replaceChild(newDiv, trend);
//outa.replaceChild(wrapper, doodle);

// Check if the element exists before attempting to remove it
if (gobye) {
    gobye.className = "section-header";
    gobye.textContent = "ENTER GAME LINKS";
}

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


// ********************************************************************@USER AUTO********************************************************************

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
        const text = inputElement.innerText;
        const match = text.match(/@(\w*)$/);
        const beforeAt = text.substring(0, match ? match.index : text.length);
        const newText = `${beforeAt}@${userName}`; // Maintain text before and replace after @

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


// ********************************************************************CHAT LOGS********************************************************************


// Create the new <a> element
const newLink = document.createElement('a');
newLink.href = '#';  // Correct href attribute
newLink.className = 'list-group-item m-a-0 settings-list';
newLink.target = '_blank';  // Fixed target attribute

// Create the inner content of the <a> element
newLink.innerHTML = `
  <i class="fas fa-fw fa-comment-alt"></i>
  <span class="title">Chat Logs</span>
  <i class="fas fa-fw pull-right fa-chevron-right"></i>
`;

// Prevent the default click action
newLink.addEventListener('click', function(event) {
  event.preventDefault(); // Prevents the default action of the <a> element
});

// Select the target container
const targetContainer = document.querySelector("#chatSettings_modal > div > div.modal-content.main > div.modal-body.main");

// Check if the target container is found
if (targetContainer) {
  // Append the new <a> element to the target container
  targetContainer.appendChild(newLink);
}

// Create the new <div> element with the specified HTML structure
const newModalContent = document.createElement('div');
newModalContent.className = 'modal-content chat-logs-content';  // New unique class
newModalContent.style.display = 'none';  // Set initial display to none

newModalContent.innerHTML = `
  <div class="modal-header">
    <h4 class="modal-title">
      <i class="fas fa-fw fa-arrow-left section-close" style="cursor:pointer; margin-right:6px;"></i>
      Chat Logs
    </h4>
  </div>
  <div class="modal-body">
    <div class="setting">
      <div class="setting-title">Choose 1</div>
      <ul class="list-group" style="margin-top:10px;margin-bottom: 0;">
        <li class="list-group-item">
          <div class="radio custom-control custom-radio m-a-0">
            <label>
              Room
              <input type="radio" name="Room" class="multi-input" data-setting="room" value="room">
              <span class="custom-control-indicator"></span>
            </label>
          </div>
        </li>
        <li class="list-group-item">
          <div class="radio custom-control custom-radio m-a-0">
            <label>
              Direct Message
              <input type="radio" name="Room" class="multi-input" data-setting="room" value="dm">
              <span class="custom-control-indicator"></span>
            </label>
          </div>
        </li>
      </ul>
    </div>

    <!-- New Inputs for Name and Keyword -->
    <div class="setting" style="margin-top:20px;">
      <div class="setting-title">Filter by:</div>
      <div class="form-group">
        <label for="filterName">Name</label>
        <input type="text" class="form-control" id="filterName" placeholder="Enter name">
      </div>
      <div class="form-group">
        <label for="filterKeyword">Keyword</label>
        <input type="text" class="form-control" id="filterKeyword" placeholder="Enter keyword">
      </div>
    </div>

    <div class="setting-description p-a-0">
      <br>
      <div class="hotkey-row">
        <div class="type">This Mod requires DominantStranger's EpikChat Enhancements</div>
      </div>
    </div>
  </div>

  <!-- Submit Button -->
  <div class="modal-footer" style="display: flex; justify-content: flex-end;">
    <button id="submitButton" class="btn btn-primary">Submit</button>
  </div>
`;

// Select the updated target container
const updatedTargetContainer = document.querySelector("#chatSettings_modal > div");

// Check if the updated target container is found
if (updatedTargetContainer) {
  // Append the new <div> element to the updated target container
  updatedTargetContainer.appendChild(newModalContent);
}

// Set display to none for specific elements
const modalContentMain = document.querySelector("#chatSettings_modal > div > div.modal-content.main");
const modalFooter = document.querySelector("#chatSettings_modal > div > div.modal-content.main > div.modal-footer");

if (modalContentMain) {
  modalContentMain.style.display = 'block';
}

if (modalFooter) {
  modalFooter.style.display = 'none';
}

// Add event listener to the back button to hide the new modal content
const backButton = newModalContent.querySelector('.section-close');

if (backButton) {
  backButton.addEventListener('click', function() {
    newModalContent.style.display = 'none'; // Hide the modal content
  });
}

// Add event listener to the Chat Logs button
newLink.addEventListener('click', function(event) {
  event.preventDefault(); // Prevents the default action of the <a> element

  // Toggle the visibility of the new modal content
  if (newModalContent.style.display === 'none') {
    newModalContent.style.display = 'block'; // Show the modal content

    // Ensure existing modal content is hidden
    if (modalContentMain) {
      modalContentMain.style.display = 'none';
    }
  } else {
    newModalContent.style.display = 'none'; // Hide the modal content
  }
});

// Ensure the settings button is not interfering
const settingsButton = document.querySelector('[data-toggle="modal"][data-target="#chatSettings_modal"]');

if (settingsButton) {
  settingsButton.addEventListener('click', function() {
    // Ensure the settings modal is shown and the Chat Logs modal content is hidden
    if (newModalContent.style.display === 'block') {
      newModalContent.style.display = 'none';
    }
  });
}

// Wait for the DOM to be fully loaded
window.addEventListener('load', function() {
    console.log("Script is running!");

    const ulElement = document.querySelector("#ctabs > ul");
    if (!ulElement) {
        console.error("#ctabs > ul not found!");
        return;
    }

    console.log("Parent element found, creating new list item...");

    // Create the new <li> element
    const newListItem = document.createElement("li");
    newListItem.id = "logtab";
    newListItem.className = "ui-sortable-handle"; // Updated class name
    newListItem.setAttribute("data-toggle", "tooltip");
    newListItem.setAttribute("data-placement", "bottom");
    newListItem.setAttribute("title", "");
    newListItem.setAttribute("data-original-title", "Chat Logs");

    const selectedDiv = document.createElement("div");
    selectedDiv.className = "selected";
    newListItem.appendChild(selectedDiv);

    const tabDiv = document.createElement("div");
    tabDiv.className = "tab";
    tabDiv.setAttribute("data-id", "");
    tabDiv.setAttribute("data-type", "room");
    tabDiv.setAttribute("data-rid", "12920");

    const img = document.createElement("img");
    img.className = "img-circle";
    img.src = "/sites/default/files/chat/room_icon_uploads/188415_1725411952.jpg";
    img.style.width = "40px";
    img.style.height = "40px";
    tabDiv.appendChild(img);

    newListItem.appendChild(tabDiv);
    ulElement.appendChild(newListItem);

    console.log("New list item appended.");

    // Function to handle clicks on <li> elements
    function handleClick(event) {
        // Hide the chatlogs element for all <li> elements
        const chatlogs = document.getElementById("chatlogs");
        if (chatlogs) {
            chatlogs.style.display = "none";
        }

        // Show chatlogs if the clicked <li> has id="logtab"
        if (event.target.closest('li').id === "logtab") {
            const roomHeaderTitle = document.querySelector("#ctabs > div.roomheaderinfo > div.roomheadertitle");
            const roomHeaderDesc = document.querySelector("#ctabs > div.roomheaderinfo > div.roomheaderdescription");
            roomHeaderDesc.innerText = "Generate the log in the chat settings.";
            roomHeaderTitle.innerText = "Chat Logs";
            chatlogs.style.display = "block";
        }
    }

    // Add event listener to the <ul> to handle clicks on its <li> children
    ulElement.addEventListener('click', function(event) {
        if (event.target.closest('li')) {
            handleClick(event);
        }
    });

});


// Function to create a new HTML element with provided content
function createNewChatItemHTML(content) {
  // Function to detect URLs and convert them into clickable links
  function makeUrlsClickable(text) {
    const urlRegex = /(\bhttps?:\/\/[^\s/$.?#].[^\s]*)/gi;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // Process the message content to make URLs clickable
  const messageTextWithLinks = makeUrlsClickable(content.message);

  // Format the timestamp to include both date and time
  const formattedTimestamp = new Date(content.timestamp).toLocaleString();

  return `
    <div class="chat-item message" style="color: ${content.format_color};" data-item-id="${content._id}">
      <div class="time-stamp" aria-label="${formattedTimestamp}" data-microtip-position="top" role="tooltip">${formattedTimestamp}</div>
      <div class="message-content">
        <span class="user-name">${content.name}</span>
        <div class="message-text">${messageTextWithLinks}</div>
      </div>
    </div>
  `;
}

// Function to copy scrollbar styles
function copyScrollbarStyles(sourceElement, targetElement) {
  const scrollbarStyles = window.getComputedStyle(sourceElement, '::-webkit-scrollbar');
  const scrollbarThumbStyles = window.getComputedStyle(sourceElement, '::-webkit-scrollbar-thumb');

  // Copy scrollbar styles
  targetElement.style.setProperty('--scrollbar-width', scrollbarStyles.width);
  targetElement.style.setProperty('--scrollbar-bg', scrollbarStyles.backgroundColor);

  // Copy scrollbar thumb styles
  targetElement.style.setProperty('--scrollbar-thumb-bg', scrollbarThumbStyles.backgroundColor);
  targetElement.style.setProperty('--scrollbar-thumb-border-radius', scrollbarThumbStyles.borderRadius);

  // Apply the styles to the target element
  targetElement.style.scrollbarWidth = 'var(--scrollbar-width)';
  targetElement.style.scrollbarColor = 'var(--scrollbar-thumb-bg) var(--scrollbar-bg)';
  targetElement.style.overflowY = 'scroll'; // Ensure the scrollbar is visible
}



function simulateClickAtTopLeft() {
  // Simulate click at the top-left corner of the viewport
  const topLeftElement = document.elementFromPoint(0, 0);
  if (topLeftElement) {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0
    });
    topLeftElement.dispatchEvent(clickEvent);
  }

  // Change classes to simulate the result of the click
  const ulElement = document.querySelector("#ctabs > ul");
  if (ulElement) {
    const listItems = ulElement.querySelectorAll('li');
    listItems.forEach(li => {
      if (li.id === "logtab") {
        li.className = "ui-sortable-handle active";
      } else {
        li.className = "ui-sortable-handle";
      }
    });
    console.log("Classes updated based on simulated click.");

    // Call the function to update the room header text
    updateRoomHeaderText();
  } else {
    console.error("#ctabs > ul not found!");
  }
}


// Ensure the creation of the cloneNode happens before the submit button logic
const originalNode = document.querySelector("#messagesLC");
const destinationNode = document.querySelector("#messagesLS");

let clonedNode = null;

// Create the cloneNode and append it to the destinationNode
if (originalNode && destinationNode) {
  clonedNode = originalNode.cloneNode(true);
  clonedNode.id = 'chatlogs';
  clonedNode.style.overflowY = 'auto';
  clonedNode.style.zIndex = '1'; // Ensure it's on top
  clonedNode.style.backgroundColor = '#26282B';  // Set background color
  clonedNode.style.display = 'none'; // Hide initially
  clonedNode.style.position = 'absolute';
  clonedNode.style.top = '0';  // Position at the top inside the destinationNode
  clonedNode.style.left = '0';  // Position at the left inside the destinationNode
  clonedNode.style.width = '100%';
  clonedNode.style.height = '100%';

  // Copy scrollbar styles from #messagesLS
  copyScrollbarStyles(destinationNode, clonedNode);

  // Append the cloned node to the destinationNode
  destinationNode.appendChild(clonedNode);
}

// Handle the click event on the submit button
const submitButton = newModalContent.querySelector('#submitButton');

if (submitButton) {
  submitButton.addEventListener('click', async function() {
    // Get the selected radio button value
    const selectedRoomType = document.querySelector('input[name="Room"]:checked');
    const roomTypeValue = selectedRoomType ? selectedRoomType.value : 'None';

    // Get the values of the Name and Keyword inputs
    const nameValue = document.getElementById('filterName').value.trim();
    const keywordValue = document.getElementById('filterKeyword').value.trim();

    // Variable to hold the fetched messages
    let msgs;

    try {
      // Fetch chat logs based on the room type
      if (roomTypeValue === 'room') {
        msgs = await CLOUD.fetchChatLogs({ name: nameValue });
      } else if (roomTypeValue === 'dm') {
        msgs = await CLOUD.fetchChatLogs({ dm: nameValue });
      } else {
        return; // Exit if no valid room type is selected
      }

      // Check if msgs were fetched successfully
      if (msgs && Array.isArray(msgs)) {
        // Filter objects based on the keyword (if provided)
        let filteredMsgs = msgs;

        if (keywordValue) {
          filteredMsgs = msgs.filter(msg =>
            msg.message && msg.message.toLowerCase().includes(keywordValue.toLowerCase())
          );
        }

        // Ensure the cloned node exists
        if (clonedNode) {
          // Clear existing content
          clonedNode.innerHTML = '';

          // Append each filtered message
          filteredMsgs.forEach(msg => {
            const messageHTML = createNewChatItemHTML(msg);
            clonedNode.innerHTML += messageHTML;
          });

          // Show the cloned node
          clonedNode.style.display = 'block';

          // Clone and position the close button
          const originalCloseButton = document.querySelector("#ctabs > div.roomheaderinfo > div.roomMenu > span.closeTab > i");
          if (originalCloseButton) {
            const clonedCloseButton = originalCloseButton.cloneNode(true);
            clonedCloseButton.style.position = 'absolute';
            clonedCloseButton.style.top = `${originalCloseButton.offsetTop}px`;
            clonedCloseButton.style.left = `${originalCloseButton.offsetLeft}px`;
            clonedCloseButton.style.zIndex = '10000'; // Ensure it's on top of the overlay
            clonedCloseButton.style.cursor = 'pointer';

            originalCloseButton.parentNode.appendChild(clonedCloseButton);

            clonedCloseButton.addEventListener('click', function() {
              clonedNode.style.display = 'none'; // Hide the overlay
              clonedCloseButton.remove(); // Remove the cloned close button
            });
          }

          // Simulate a mouse click at the top-left pixel
          simulateClickAtTopLeft();
        }
      }
    } catch (error) {
      // Handle any errors during fetching or processing
      console.error('Error:', error);
    }

    // Hide the modal content after submission (optional)
    newModalContent.style.display = 'none';
  });
}

// ********************************************************************FAVORITE USERS********************************************************************


// Key for storing starred usernames in localStorage
const STARRED_USERNAMES_KEY = 'starredUsernames';

// Function to load starred usernames from localStorage
function loadStarredUsernames() {
    return JSON.parse(localStorage.getItem(STARRED_USERNAMES_KEY)) || [];
}

// Function to save starred usernames to localStorage
function saveStarredUsernames(starredUsernames) {
    localStorage.setItem(STARRED_USERNAMES_KEY, JSON.stringify(starredUsernames));
}

// Function to handle icon click
function handleIconClick(event) {
    event.stopPropagation(); // Stop the event from bubbling up to the username click handler
    event.preventDefault(); // Prevent the default action if needed

    const targetIcon = event.target;
    const userNameElement = targetIcon.closest('.user-layout, .chat-item.message').querySelector('.user-name');
    if (userNameElement) {
        const userName = userNameElement.textContent.trim();
        let starredUsernames = loadStarredUsernames();

        if (targetIcon.classList.contains('fa-regular')) {
            // Change class to filled star and add to starred list
            targetIcon.className = 'fa-solid fa-fw fa-star fav';
            if (!starredUsernames.includes(userName)) {
                starredUsernames.push(userName);
            }
        } else {
            // Change class back to regular star and remove from starred list
            targetIcon.className = 'fa-regular fa-fw fa-star';
            starredUsernames = starredUsernames.filter(name => name !== userName);
        }

        // Save updated starred usernames to localStorage
        saveStarredUsernames(starredUsernames);

        // Update the cloned users container and main chat container
        cloneStarredUsers();
        updateIcons();
        addStarsToChatUsers();
        updateMessageBackgrounds();
    }
}

// Function to get the background color from an element
function getBackgroundColor(element) {
    return window.getComputedStyle(element).backgroundColor;
}

// Function to simulate a click on the original node
function simulateClickOnOriginalNode(originalNode) {
    if (originalNode) {
        // Create a new mouse click event
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        // Dispatch the event on the original node
        originalNode.dispatchEvent(clickEvent);
    }
}

// Function to get the username from an element
function getUsernameFromElement(element) {
    const userNameElement = element.querySelector('.user-name');
    return userNameElement ? userNameElement.textContent.trim() : null;
}

// Function to apply specific icon styles and spacing
function applyIconStyles(clonedContainer, originalContainer) {
    // Get all icon elements in the original container
    const originalIcons = originalContainer.querySelectorAll('i');

    // Get all icons in the cloned container
    const clonedIcons = clonedContainer.querySelectorAll('i');

    // Map of original icon styles
    const iconStylesMap = new Map();

    // Create a map of icon styles based on the original container
    originalIcons.forEach(icon => {
        const iconClass = icon.className;
        const computedStyle = window.getComputedStyle(icon);
        iconStylesMap.set(iconClass, {
            color: computedStyle.color,
            fontSize: computedStyle.fontSize,
            margin: computedStyle.margin,
            padding: computedStyle.padding,
            // Add other styles if needed
        });
    });

    // Apply styles to the icons in the cloned container
    clonedIcons.forEach(icon => {
        const iconClass = icon.className;
        const styles = iconStylesMap.get(iconClass);
        if (styles) {
            icon.style.color = styles.color;
            icon.style.fontSize = styles.fontSize;
            icon.style.margin = styles.margin;
            icon.style.padding = styles.padding;
            // Apply other styles if needed
        }
    });
}

// Function to update star icons in the cloned container
function updateStarIconsInClonedContainer() {
    const clonedContainer = document.querySelector("#clonedContainer");
    const starredUsernames = loadStarredUsernames();

    if (clonedContainer) {
        Array.from(clonedContainer.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (userName) {
                const starIcon = child.querySelector('.fa-star');
                if (starIcon) {
                    starIcon.className = starredUsernames.includes(userName) ? 'fa-solid fa-fw fa-star fav' : 'fa-regular fa-fw fa-star';
                }
            }
        });
    }
}

// Function to clone the #usersLC container with starred users only
function cloneStarredUsers() {
    const usersLC = document.querySelector("#usersLC");

    if (usersLC) {
        // Load the starred usernames from localStorage
        const starredUsernames = loadStarredUsernames();

        // Check if the cloned container already exists
        let clonedContainer = document.querySelector("#clonedContainer");

        if (!clonedContainer) {
            // Clone the entire #usersLC element
            clonedContainer = usersLC.cloneNode(false); // Shallow clone to avoid copying child nodes

            // Get the background color of the original container
            const originalBackgroundColor = getBackgroundColor(usersLC);

            // Set the background color of the cloned container to match the original
            clonedContainer.style.backgroundColor = originalBackgroundColor;
            clonedContainer.style.position = 'relative'; // Ensure the container is positioned correctly
            clonedContainer.style.overflow = 'auto'; // Allow scrolling if content overflows
            clonedContainer.style.border = 'none'; // Remove any border
            clonedContainer.style.padding = '0'; // Remove any padding
            clonedContainer.style.margin = '0'; // Remove any margin
            clonedContainer.style.boxShadow = 'none'; // Remove any box shadow
            clonedContainer.style.visibility = 'visible'; // Ensure visibility
            clonedContainer.style.opacity = '1'; // Ensure full opacity
            clonedContainer.style.zIndex = '9999'; // Ensure it's above other elements if necessary
            clonedContainer.id = 'clonedContainer'; // Add an ID for reference

            // Insert the cloned container as a sibling above #usersLC
            usersLC.parentNode.insertBefore(clonedContainer, usersLC);
        }

        // Remove all children from the cloned container
        while (clonedContainer.firstChild) {
            clonedContainer.removeChild(clonedContainer.firstChild);
        }

        // Filter and clone nodes based on starred usernames
        Array.from(usersLC.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (starredUsernames.includes(userName)) {
                // Clone and append the matching node to the cloned container
                const clonedNode = child.cloneNode(true);
                clonedContainer.appendChild(clonedNode);

                // Apply icon styles
                applyIconStyles(clonedContainer, usersLC);

                // Attach the existing click event handler to the star icon in the cloned container
                const starIcon = clonedNode.querySelector('.fa-star');
                if (starIcon) {
                    starIcon.addEventListener('click', handleIconClick);
                }

                // Store the reference to the original node
                clonedNode.dataset.originalNodeId = userName;

                // Add click event listener to the cloned container to simulate a click on the original node
                clonedContainer.addEventListener('click', (event) => {
                    const clickedElement = event.target.closest('[data-original-node-id]');
                    if (clickedElement) {
                        const originalNodeId = clickedElement.dataset.originalNodeId;
                        const originalNode = Array.from(usersLC.children).find(child => getUsernameFromElement(child) === originalNodeId);
                        simulateClickOnOriginalNode(originalNode);
                    }
                });
            }
        });

        // Ensure initial stars are correctly applied
        updateStarIconsInClonedContainer();
    }
}

// Function to update icons for existing children
function updateIcons() {
    const parentElement = document.querySelector("#usersLC");
    if (parentElement) {
        const starredUsernames = loadStarredUsernames();

        Array.from(parentElement.children).forEach(child => {
            const headerDiv = child.querySelector('.header');
            if (headerDiv) {
                const userNameElement = headerDiv.querySelector('.user-name');
                if (userNameElement) {
                    const userName = userNameElement.textContent.trim();

                    let iconElement = headerDiv.previousElementSibling;
                    if (!iconElement || !iconElement.classList.contains('fa-star')) {
                        iconElement = document.createElement('i');
                        iconElement.className = 'fa-regular fa-fw fa-star';
                        iconElement.style.marginRight = '8px';
                        iconElement.style.display = 'inline-block';
                        iconElement.style.verticalAlign = 'middle';

                        iconElement.addEventListener('click', handleIconClick);
                        headerDiv.parentNode.insertBefore(iconElement, headerDiv);
                    }

                    iconElement.className = starredUsernames.includes(userName) ? 'fa-solid fa-fw fa-star fav' : 'fa-regular fa-fw fa-star';
                }
            }
        });
    }
}

// Function to add stars to chat users
function addStarsToChatUsers() {
    const starredUsernames = loadStarredUsernames();
    const messagesContainer = document.querySelector("#messagesLC");

    if (messagesContainer) {
        Array.from(messagesContainer.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (userName) {
                let starIcon = child.querySelector('.fa-star');
                if (!starIcon) {
                    starIcon = document.createElement('i');
                    starIcon.className = 'fa-regular fa-fw fa-star';
                    starIcon.style.marginRight = '8px';
                    starIcon.style.display = 'inline-block';
                    starIcon.style.verticalAlign = 'middle';

                    starIcon.addEventListener('click', handleIconClick);
                    child.insertBefore(starIcon, child.firstChild);
                }

                starIcon.className = starredUsernames.includes(userName) ? 'fa-solid fa-fw fa-star fav' : 'fa-regular fa-fw fa-star';
            }
        });
    }
}

// Function to update the message background colors
function updateMessageBackgrounds() {
    const starredUsernames = loadStarredUsernames();
    const messagesContainer = document.querySelector("#messagesLC");

    if (messagesContainer) {
        Array.from(messagesContainer.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (userName && starredUsernames.includes(userName)) {
                child.style.backgroundColor = '#4E4E4E'; // Apply background color
            } else {
                child.style.backgroundColor = ''; // Reset background color
            }
        });
    }
}

// Initialize everything on page load
document.addEventListener("DOMContentLoaded", () => {
    cloneStarredUsers();
    updateIcons();
    addStarsToChatUsers();
    updateMessageBackgrounds();
});

// Monitor for changes in the #usersLC container
const userListObserver = new MutationObserver(() => {
    updateIcons();
    cloneStarredUsers();
    addStarsToChatUsers();
    updateMessageBackgrounds();
});

const usersLC = document.querySelector("#usersLC");
if (usersLC) {
    userListObserver.observe(usersLC, { childList: true, subtree: true });
}

// Monitor for changes in the #messagesLC container
const messagesObserver = new MutationObserver(() => {
    addStarsToChatUsers();
    updateMessageBackgrounds();
});

const messagesLC = document.querySelector("#messagesLC");
if (messagesLC) {
    messagesObserver.observe(messagesLC, { childList: true, subtree: true });
}


CLOUD = await require('cloud');

