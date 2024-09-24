// ==UserScript==
// @name         EpikChat Mods
// @namespace    http://tampermonkey.net/
// @version      2024-09-01
// @description  v1.05
// @author       half_amused
// @match        https://www.epikchat.com/chat
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epikchat.com
// @grant        none
// @updateURL    https://github.com/halfamused/Epik/raw/main/EpikChat%20Mods.user.js
// @downloadURL  https://github.com/halfamused/Epik/raw/main/EpikChat%20Mods.user.js
// ==/UserScript==

// Mods list:
// Mod Settings - New menus to enable or disable the mods and choose settings for some of them. 
// Translate My Messages - Allows you to translate your messages in real time to the language chosen in the dropdown menu.
// Room Translations - Allows you to translate posts in the room by clicking them and clicking the globe icon (just like you would with the reply icon).
// Filter Mod - Allows you to filter whatever room you are in by partial usernames separated by commas. You will only see messages from the people on the list. Delete the list to return chat to normal.
// Imgur - Opens normal Imgur share links without going to a new tab.
// Volme - Changes volume scale from 1:100 to 1:1000 (for those really loud mics that are still too loud after turning them all the way down).
// Games - Adds the Game window where game share links can be entered to game with friends without leaving chat. (Replaces Popular Rooms and Doodles in the Side Bar).
// Multivid Popup - Allows you to open multiple free floating cam windows. They are restricted to the chat window. You can still open a single picture-in-picture window by right clicking a cam, which is not restricted to the chat window.
// @username Autosuggestion - Creates an autosuggestion list when you  type @ and begin typing a , you can click on a name from the list or use tab to choose the top name on the list.
// Favorite Users - Allows you to favorite users the same way you can with rooms. Favorite users will appear at the top of the user list and their posts will be highlighted in chat with a color you choose in the Mod Settings.


// Coming soon:
// Temporary Block - The inverse of the Filter Mod, the messages of people added to this list will not be seen in whatever room you are chatting in.
// Dictionary Module - A dictionary module in the Side Bar to help you understand words you don't know.
// Thesaurus Module - A thesaurus module in the Side Bar to help you find that word that is right on the tip of your tongue.


// ********************************************************************CUSTOM MENU********************************************************************

(function() {
    'use strict';

    // Function to create the input box and POST button
    function createQuickShareControls() {
        // Create the input box
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'inputurl';
        input.placeholder = 'QUICKSHARE URL';
        input.style.marginRight = '5px'; // Add some space between the input and button

        // Create the "POST" button
        const setButton2 = document.createElement('button');
        setButton2.className = 'badge';
        setButton2.textContent = 'POST';
        setButton2.addEventListener('click', function() {
            const inputurl = document.getElementById('inputurl');
            cApp.t_me(inputurl.value); // Assuming `cApp.t_me` is a function defined elsewhere
        });

        // Create a container for the input and button
        const quickShareContainer = document.createElement('div');
        quickShareContainer.style.display = 'flex';
        quickShareContainer.style.alignItems = 'center';

        // Append input and button to the container
        quickShareContainer.appendChild(input);
        quickShareContainer.appendChild(setButton2);

        // Select the target location for appending the quick share controls
        const targetLocation = document.querySelector("#navbar > div > div.navbar-header > a");
        if (targetLocation) {
            targetLocation.parentNode.insertBefore(quickShareContainer, targetLocation.nextSibling);
        }
    }

    // Call the function to create and place the controls
    createQuickShareControls();
})();



(function() {
    'use strict';

    function createCustomControls() {
        // Create and configure the main div
        const newDiv = document.createElement('div');
        newDiv.style.margin = '0px'; // Set margin for spacing

        // Create the single input box
        const input = document.createElement('input');
        input.type = 'text';
        input.className = '';
        input.placeholder = 'SHARED GAME LINK HERE';
        input.style.width = '285px';

        // Create the "SET" button
        const setButton = document.createElement('button');
        setButton.className = 'badge';
        setButton.textContent = 'SET';
        setButton.style.marginLeft = '5px'; // Add some space between the input and buttons
        setButton.addEventListener('click', () => {
            const iframe = document.querySelector('#epikgame'); // Assuming the iframe ID is #epikgame
            if (iframe) {
                iframe.src = input.value; // Set the iframe src to the input value
            }
        });

        // Create a container for the input and both buttons
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.marginBottom = '10px'; // Add spacing between elements
        inputContainer.className = 'btn-group list-search';

        // Append input and both buttons to the container
        inputContainer.appendChild(input);
        inputContainer.appendChild(setButton);

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


        // Create the dropdown for game links
        const dropdownContainer = document.createElement('div');
        const dropdown = document.createElement('select');
        dropdown.id = 'game-links-dropdown';
        dropdown.className = 'custom-select custom-select-sm multi-input';
        dropdown.style.marginTop = '8px';
        dropdown.style.width = '220px';

        // Add options to the dropdown
        const options = [
            { value: '', text: 'Select a game...' },
            { value: 'https://skribbl.io/', text: 'Skribbl.io' },
            { value: 'https://buddyboardgames.com/connect4', text: 'Connect 4' },
            { value: 'https://picturecards.online/static/index.html', text: 'Cards Against Humanity' },
            { value: 'https://playingcards.io/kr3pdh', text: 'DIY Dominos' },
            { value: 'https://playingcards.io/fap9wv', text: 'DIY Cards' },
            { value: 'https://richup.io/', text: 'Monopoly' },
        ];

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            dropdown.appendChild(opt);
        });

        // Add event listener to update iframe on selection change
        dropdown.addEventListener('change', function() {
            const iframe = document.querySelector('#epikgame'); // Ensure the iframe exists
            iframe.src = dropdown.value; // Set the src to the selected link
        });

        // Append the dropdown to its container
        dropdownContainer.appendChild(dropdown);

// First, retrieve the favoriteUsernames array from localStorage (assuming it's stored as a JSON string)
let favoriteUsernames = JSON.parse(localStorage.getItem('starredUsernames')) || [];

// Retrieve or initialize the starredUserColors object from localStorage
let starredUserColors = JSON.parse(localStorage.getItem('starredUserColors')) || {};

// Assign default color (#545454) to any favorite username that doesn't have a color
favoriteUsernames.forEach(username => {
    if (!starredUserColors[username]) {
        starredUserColors[username] = '#545454';
    }
});

// Load starredUsernames from localStorage
const loadedStarredUsernames = JSON.parse(localStorage.getItem('starredUsernames')) || [];
//const starredUserColors = JSON.parse(localStorage.getItem('starredUserColors')) || {}; // Assuming this is defined too

// Create the container for the dropdown and action elements
const usernameDropdownContainer = document.createElement('div');
usernameDropdownContainer.style.marginBottom = '10px'; // Spacing below the dropdown
usernameDropdownContainer.style.display = 'flex';
usernameDropdownContainer.style.flexDirection = 'column'; // Stack elements vertically

// Create the dropdown for favorite usernames
const usernameDropdown = document.createElement('select');
usernameDropdown.id = 'favorite-usernames-dropdown';
usernameDropdown.className = 'custom-select custom-select-sm multi-input';
usernameDropdown.style.width = '220px';

// Add a default option
const defaultOption = document.createElement('option');
defaultOption.value = '';
defaultOption.textContent = 'Favorite User Background Color';
usernameDropdown.appendChild(defaultOption);

// Function to update the dropdown options
function updateDropdown() {
    // Clear existing options
    usernameDropdown.innerHTML = '';

    // Create and add the default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Favorite User Background Color';
    usernameDropdown.appendChild(defaultOption);

    // Load the latest starredUsernames from localStorage
    const loadedStarredUsernames = JSON.parse(localStorage.getItem('starredUsernames')) || [];

    // Populate the dropdown with loadedStarredUsernames
    loadedStarredUsernames.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        usernameDropdown.appendChild(option);
    });
}





// Initial population of the dropdown
updateDropdown();

// Create a container for the action elements
const actionContainer = document.createElement('div');
actionContainer.style.display = 'flex';
actionContainer.style.alignItems = 'center';
actionContainer.style.gap = '10px'; // Space between elements

// Create the close button
const closeButton = document.createElement('button');
closeButton.type = 'button';
closeButton.className = 'close';
closeButton.style.border = 'none'; // Remove default button border
closeButton.style.background = 'none'; // Remove background
closeButton.disabled = true; // Initially disabled

// Add Font Awesome icon for the button
const icon = document.createElement('i');
icon.className = 'fa-solid fa-xmark'; // Font Awesome icon class
closeButton.appendChild(icon);

// Event listener for the close button
closeButton.addEventListener('click', () => {
    const selectedUsername = usernameDropdown.value;

    console.log("Close button clicked");
    console.log("Selected Username:", selectedUsername);

    if (!selectedUsername) {
        alert("Please select a username first.");
        return; // Exit if no user is selected
    }

    // Load the latest starredUsernames from localStorage
    const loadedStarredUsernames = JSON.parse(localStorage.getItem('starredUsernames')) || [];
    console.log("Before removal:", loadedStarredUsernames); // Log before removal

    // Find and remove the selected username
    const index = loadedStarredUsernames.indexOf(selectedUsername);
    if (index !== -1) {
        loadedStarredUsernames.splice(index, 1); // Remove only the selected user
        console.log(`${selectedUsername} has been removed.`);
    } else {
        console.log("User not found in the array."); // Log if not found
    }

    // Remove the corresponding color from starredUserColors
    delete starredUserColors[selectedUsername];

    // Update localStorage with the modified array
    localStorage.setItem('starredUsernames', JSON.stringify(loadedStarredUsernames));
    localStorage.setItem('starredUserColors', JSON.stringify(starredUserColors));

    // Update the dropdown to reflect the changes
    updateDropdown();

    console.log("After removal:", loadedStarredUsernames); // Log after removal
});





// Update button state based on dropdown selection
usernameDropdown.addEventListener('change', () => {
    closeButton.disabled = usernameDropdown.value === ''; // Enable if an option is selected
});

// Create the color display
const colorDisplay = document.createElement('div');
colorDisplay.style.width = '20px';
colorDisplay.style.height = '20px';
colorDisplay.style.border = '1px solid black';
colorDisplay.style.backgroundColor = '#545454'; // Default color

// Append elements to the action container
actionContainer.appendChild(document.createTextNode('Remove User'));
actionContainer.appendChild(closeButton);
actionContainer.appendChild(document.createTextNode('Background:'));
actionContainer.appendChild(colorDisplay);

// Append dropdown and action container to the main container
usernameDropdownContainer.appendChild(usernameDropdown);
usernameDropdownContainer.appendChild(actionContainer);

// Finally, append the main container to the document body
document.body.appendChild(usernameDropdownContainer);


// Create the canvas element for color picking
const canvas = document.createElement('canvas');
canvas.width = 280;
canvas.height = 280;
canvas.style.position = 'fixed'; // Make it float over the page
canvas.style.zIndex = '10000'; // Ensure it's above all other elements
canvas.style.display = 'none';  // Hide the canvas on load



// Set up the canvas drawing context
const ctx = canvas.getContext('2d');

// Create horizontal color gradient (red-green-blue-red)
const gradientX = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradientX.addColorStop(0, 'red');
gradientX.addColorStop(0.33, 'green');
gradientX.addColorStop(0.66, 'blue');
gradientX.addColorStop(1, 'red');
ctx.fillStyle = gradientX;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Create vertical white-transparent-black gradient
const gradientY = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradientY.addColorStop(0, 'white');
gradientY.addColorStop(0.5, 'transparent');
gradientY.addColorStop(1, 'black');
ctx.fillStyle = gradientY;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Function to convert RGB to HEX
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g); // Extract numeric values from RGB
    return `#${((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1).toUpperCase()}`;
}

// Function to get color from canvas at clicked position
function getColorAtPosition(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
}

// Show canvas when the colorDisplay is clicked
colorDisplay.addEventListener('click', () => {
    if (usernameDropdown.value) {
        canvas.style.display = 'block'; // Show the canvas if a user is selected
    } else {
        alert("Please select a username first.");
    }
});

// Update color display and localStorage, then hide canvas when color is selected
canvas.addEventListener('click', (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const selectedColor = getColorAtPosition(x, y);
    colorDisplay.style.backgroundColor = selectedColor;

    // Convert RGB to HEX before saving
    const hexColor = rgbToHex(selectedColor);

    // Get the currently selected user
    const selectedUsername = usernameDropdown.value;
    if (selectedUsername) {
        // Update the color for the selected user in the starredUserColors object
        starredUserColors[selectedUsername] = hexColor;
        // Save the updated colors to localStorage
        localStorage.setItem('starredUserColors', JSON.stringify(starredUserColors));
    }

    canvas.style.display = 'none'; // Hide the canvas after color is chosen
});

// When a username is selected from the dropdown, update the color display
usernameDropdown.addEventListener('change', function() {
    const selectedUsername = usernameDropdown.value;
    if (selectedUsername) {
        // Update the colorDisplay to the user's current color in localStorage
        colorDisplay.style.backgroundColor = starredUserColors[selectedUsername];
    } else {
        colorDisplay.style.backgroundColor = '#545454'; // Default color if no user selected
    }
});

        // Create the new <li> element for "Favorite Users"
const newLi = document.createElement('li');
newLi.className = 'list-group-item';
newLi.innerHTML = `
  Favorite Users
  <input type="checkbox" id="mod2" class="switch-input" style="display:none;" />
  <label for="mod2" class="switch-label pull-right"></label>
`;
        // Append all containers to the new div
        newDiv.appendChild(inputContainer);
        newDiv.appendChild(visibilityContainer);
        newDiv.appendChild(dropdownContainer); // Add the dropdown to the main div
        newDiv.appendChild(newLi);
        newDiv.appendChild(usernameDropdownContainer);
        newDiv.appendChild(canvas);


        return newDiv; // Return the complete custom controls
    }

    function initializeModSettings() {
        // Create the new <li> element for Mod Settings
        const newModLink = document.createElement('li');
        newModLink.setAttribute('role', 'tooltip');
        newModLink.setAttribute('aria-label', 'Mod Settings');
        newModLink.setAttribute('data-microtip-position', 'bottom');

        const modLinkDiv = document.createElement('div');
        modLinkDiv.setAttribute('data-toggle', 'modal');
        modLinkDiv.setAttribute('data-target', '#chatSettings_modal');
        modLinkDiv.className = '';

        const icon = document.createElement('i');
        icon.className = 'fas fa-cogs';
        modLinkDiv.appendChild(icon);

        newModLink.appendChild(modLinkDiv);

        // Prevent the default click action
        modLinkDiv.addEventListener('click', function(event) {
            event.preventDefault(); // Prevents the default action of the <a> element
        });

        // Select the target container for adding new links
        const targetContainer = document.querySelector("#navbar > div > div.navbar-header > ul");

        // Check if the target container is found
        if (targetContainer) {
            // Append the new <li> element to the target container
            targetContainer.appendChild(newModLink);
        }

        // Create the new <div> element with the specified HTML structure for Mod Settings
const newModContent = document.createElement('div');
newModContent.className = 'modal-content mod-settings-content'; // New unique class
newModContent.style.display = 'none'; // Set initial display to none
newModContent.innerHTML = `
  <div class="modal-header">
    <h4 class="modal-title">
      Mod Settings
      <button type="button" class="close" data-dismiss="modal"><i class="fa-solid fa-xmark"></i></button>
    </h4>
  </div>
  <div class="modal-body">
    <ul class="list-group">
      <li class="list-group-item">
        Filter Chat by Usernames
        <input type="checkbox" id="mod1" class="switch-input" style="display:none;" />
        <label for="mod1" class="switch-label pull-right"></label>
      </li>
      <!-- Omit the Favorite Users <li> here -->
      <li class="list-group-item">
        Translate My Messages
        <input type="checkbox" id="mod3" class="switch-input" style="display:none;" />
        <label for="mod3" class="switch-label pull-right"></label>
      </li>
      <li class="list-group-item">
        Room Translations
        <input type="checkbox" id="mod4" class="switch-input" style="display:none;" />
        <label for="mod4" class="switch-label pull-right"></label>
      </li>
      <li class="list-group-item">
        Placeholder 4
        <input type="checkbox" id="mod5" class="switch-input" style="display:none;" />
        <label for="mod5" class="switch-label pull-right"></label>
      </li>
      <li class="list-group-item">
        Placeholder 5
        <input type="checkbox" id="mod6" class="switch-input" style="display:none;" />
        <label for="mod6" class="switch-label pull-right"></label>
      </li>
      <li class="list-group-item">
        Placeholder 6
        <input type="checkbox" id="mod7" class="switch-input" style="display:none;" />
        <label for="mod7" class="switch-label pull-right"></label>
      </li>
    </ul>
  </div>
  <!-- Add custom controls here -->
`;

// Create and append custom controls
const customControls = createCustomControls();
newModContent.querySelector('.modal-body').appendChild(customControls);

// Select the updated target container
const updatedTargetContainer = document.querySelector("#chatSettings_modal > div");

// Check if the updated target container is found
if (updatedTargetContainer) {
    // Append the new <div> elements to the updated target container
    updatedTargetContainer.appendChild(newModContent);
}

// Create the new <li> element for "Favorite Users"
const newLi = document.createElement('li');
newLi.className = 'list-group-item';
newLi.innerHTML = `
  Favorite Users
  <input type="checkbox" id="mod2" class="switch-input" style="display:none;" />
  <label for="mod2" class="switch-label pull-right"></label>
`;

// Now you can append `newLi` in your existing snippet where you see fit.

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
        const backButtonMod = newModContent.querySelector('.section-close');

        if (backButtonMod) {
            backButtonMod.addEventListener('click', function() {
                newModContent.style.display = 'none'; // Hide the modal content
            });
        }

        // Add event listener to the Mod Settings button
        modLinkDiv.addEventListener('click', function(event) {
            event.preventDefault(); // Prevents the default action of the <a> element

            // Toggle the visibility of the Mod Settings modal content
            if (newModContent.style.display === 'none') {
                newModContent.style.display = 'block'; // Show the modal content

                // Ensure existing modal content is hidden
                if (modalContentMain) {
                    modalContentMain.style.display = 'none';
                }
            } else {
                newModContent.style.display = 'none'; // Hide the modal content
            }
        });

        // Ensure the settings button is not interfering
        const settingsButton = document.querySelector('[data-toggle="modal"][data-target="#chatSettings_modal"]');

        if (settingsButton) {
            settingsButton.addEventListener('click', function() {
                // Ensure the settings modal is shown and the Mod Settings modal contents are hidden
                if (newModContent.style.display === 'block') {
                    newModContent.style.display = 'none';
                }
            });
        }

        // Function to load saved states from localStorage
        function loadSwitchStates() {
            document.querySelectorAll('.switch-input').forEach(function(input) {
                // Get the saved state from localStorage
                const modState = localStorage.getItem(input.id);

                // If there is a saved state, apply it (true = checked, false = unchecked)
                if (modState === 'enabled') {
                    input.checked = true;
                    input.nextElementSibling.style.backgroundColor = 'rgb(76, 175, 80)'; // Apply 'on' style
                } else {
                    input.checked = false;
                    input.nextElementSibling.style.backgroundColor = 'rgb(204, 204, 204)'; // Apply 'off' style
                }
            });
        }

        // Function to save the state to localStorage
        function saveSwitchState(input) {
            const modState = input.checked ? 'enabled' : 'disabled';
            localStorage.setItem(input.id, modState);

            // Dispatch custom event
            const event = new CustomEvent('switchStateChanged', { detail: { id: input.id, state: modState } });
            window.dispatchEvent(event);
        }

        // JavaScript functionality for the on/off switch
        document.querySelectorAll('.switch-input').forEach(function(input) {
            // Add an event listener to each switch to save the state when toggled
            input.addEventListener('change', function() {
                const label = input.nextElementSibling;

                if (input.checked) {
                    // Change to "on" state
                    label.style.backgroundColor = 'rgb(76, 175, 80)';
                } else {
                    // Change to "off" state
                    label.style.backgroundColor = 'rgb(204, 204, 204)';
                }

                // Save the state to localStorage
                saveSwitchState(input);
            });
        });

        // Load switch states on page load
        loadSwitchStates(); // Load saved switch states

        // Function to log the states of all switches to the console
        function logSwitchStates() {
            const switches = document.querySelectorAll('.switch-input');
            console.log("Switch states logging initiated.");
            if (switches.length === 0) {
                console.log("No switches found.");
            } else {
                switches.forEach(function(input) {
                    console.log(`Switch ID: ${input.id}, Checked: ${input.checked}`);
                });
            }
        }

        // Log switch states after they have loaded
        logSwitchStates();

        // Add event listener for custom switch state changes
        window.addEventListener('switchStateChanged', function(event) {
            console.log(`Custom Event - Switch ID: ${event.detail.id}, State: ${event.detail.state}`);
        });
    }

    // Create a MutationObserver to detect when the target container is available
    const observer = new MutationObserver(function(mutations) {
        const targetContainer = document.querySelector("#chatSettings_modal > div > div.modal-content.main > div.modal-body.main");
        if (targetContainer) {
            // Stop observing once the target container is found
            observer.disconnect();
            initializeModSettings();
        }
    });

    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();

(function() {
    'use strict';

    // Function to create the toggle button for game visibility as an <li>
    function createToggleGameVisibility() {
        // Create the <li> element
        const toggleLi = document.createElement('li');
        toggleLi.setAttribute('role', 'tooltip');
        toggleLi.setAttribute('aria-label', 'Toggle Games');
        toggleLi.setAttribute('data-microtip-position', 'bottom');

        // Create a <div> to hold the icon
        const iconDiv = document.createElement('div');
        iconDiv.innerHTML = '<i class="fa-solid fa-gamepad"></i>'; // Add the icon

        // Append the icon <div> to the <li>
        toggleLi.appendChild(iconDiv);

        // Add click event listener for toggling game visibility
        toggleLi.addEventListener('click', () => {
            const gameDiv = document.querySelector('#gamediv');
            if (gameDiv) {
                if (gameDiv.style.display === 'none' || gameDiv.style.display === '') {
                    gameDiv.style.display = 'block';
                    toggleLi.setAttribute('aria-label', 'Hide Games'); // Update tooltip
                } else {
                    gameDiv.style.display = 'none';
                    toggleLi.setAttribute('aria-label', 'Show Games'); // Update tooltip
                }
            }
        });

        // Select the target <ul> for appending
        const targetUl = document.querySelector("#navbar > div > div.navbar-header > ul");
        if (targetUl) {
            targetUl.appendChild(toggleLi); // Append the new <li> to the <ul>
        }
    }

    // Call the function to create and place the toggle button
    createToggleGameVisibility();
})();



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
    filterInput.className = "search"; // Use className instead of class
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
        saveFilterToLocalStorage(); // Save filter text to localStorage
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

// Function to initialize filter state from localStorage
function initializeFilterState() {
    const mod1State = localStorage.getItem('mod1');
    const savedFilter = localStorage.getItem('filterText');

    if (mod1State === 'disabled') {
        filterInput.disabled = true; // Disable the filter input
        filterInput.style.display = 'none'; // Hide the filter input box
        filterInput.value = ''; // Optionally clear the filter
    } else {
        filterInput.disabled = false; // Enable the filter input
        filterInput.style.display = 'block'; // Show the filter input box
        if (savedFilter) {
            filterInput.value = savedFilter; // Restore saved filter value
        }
    }

    updateMessageVisibility(); // Update message visibility based on the current filter
}

// Save the filter value to localStorage on change
function saveFilterToLocalStorage() {
    localStorage.setItem('filterText', filterInput.value.trim());
}

// Initialize the filter state
initializeFilterState();

// Add event listener for custom switch state changes
window.addEventListener('switchStateChanged', function(event) {
    if (event.detail.id === 'mod1') {
        if (event.detail.state === 'enabled') {
            filterInput.disabled = false; // Enable the filter input
            filterInput.style.display = 'block'; // Show the filter input box
            updateMessageVisibility(); // Ensure messages are visible according to the filter
            console.log("Filter Mod1 is now enabled.");
        } else {
            filterInput.disabled = true; // Disable the filter input
            filterInput.style.display = 'none'; // Hide the filter input box
            filterInput.value = ''; // Optionally clear the filter
            updateMessageVisibility(); // Ensure messages are visible according to the filter
            console.log("Filter Mod1 is now disabled.");
        }
    }
});


// ********************************************************************IMGUR MOD********************************************************************

(function() {
    'use strict';

    // Function to create and append the Imgur embed
    function appendImgurEmbed(imgurId, imgurHref) {
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
        imgurBlockquote.innerHTML = `<a href="//imgur.com/${imgurHref}"></a>`;

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
            window.open(`//imgur.com/${imgurHref}`, '_blank');
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
        if (target && target.href.includes('imgur.com')) {
            event.preventDefault(); // Prevent the default link behavior
            event.stopImmediatePropagation(); // Stop other listeners from running

            console.log('Clicked link:', target.href);

            // Extract the full URL for href
            const url = new URL(target.href);
            const pathname = url.pathname; // Get the path after imgur.com/

            // Extract everything after imgur.com/
            let imgurHref = pathname.replace(/^\//, ''); // Remove leading '/'

            // Remove any trailing query parameters or fragments from href
            imgurHref = imgurHref.split(/[?#]/)[0];

            // Process for data-id
            let imgurId = imgurHref.split('/').pop(); // Take the last segment of the path

            // Remove unwanted segments for data-id
            imgurId = imgurId.split(/[?#]/)[0];

            // Log the Imgur ID and href for debugging
            console.log('Imgur ID for data-id:', imgurId);
            console.log('Imgur Href:', imgurHref);

            // Append the Imgur embed
            appendImgurEmbed(imgurId, imgurHref); // Pass both imgurId and imgurHref

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
        innerIframe.src = '';
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

/*


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
        color: #888888;
        font-size: 14px;
        margin: 0px 4px;
        display: inline-block
        position: relative;
        cursor: pointer;
        background-color: #566666;
        border: none;
        padding: 2px 5px;
        height: 18px
        line-height: 14px;
        text-align: center;
        border-radius: 5px;
    }
    .send-button {

        width: auto;
    }
    .custom-button:not(.send-button) {

        width: 24px;
    }
    .custom-button:hover {
        background-color: #444444;
        color: #888888;
    }
    .list-item {
        display: block;
        padding: 4px 10px;
        color: var(--list-item-text-color);
        text-decoration: none;
        font-weight: 500;
        height: 42px;
        line-height: 42px;
        position: relative;
        transition: background-color 0.2s ease;
    }
    .text-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0);
        cursor: pointer;
        z-index: 10;

    }
    .text-overlay:hover {
        background: rgba(255, 255, 255, 0);
    }
    .list-item:hover {
        background-color: #1F2124;
    }
`;
document.head.appendChild(style);
*/

// ********************************************************************SCORE PAD********************************************************************
/*
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
*/

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
        const initialWidth = videoNode.videoWidth || 640; // Fallback to 640px width if videoWidth is not available
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
        const match = text.match(/[@\/dm\s](\w*)$/);
        const beforeKeyphrase = text.substring(0, match ? match.index : text.length);
        const newText = `${beforeKeyphrase}@${userName}`; // Maintain text before and replace after @

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
    const match = text.match(/(?:@|\/dm\s)(\w*)$/); // Match @ or /dm followed by a space
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


// ********************************************************************FAVORITE USERS********************************************************************

// Key for storing starred usernames in localStorage
const STARRED_USERNAMES_KEY = 'starredUsernames';

// Flag to prevent reacting to script-induced changes
let isUpdating = false;
let scriptActive = true; // Track if the script is active

// Function to load starred usernames from localStorage
function loadStarredUsernames() {
    return JSON.parse(localStorage.getItem(STARRED_USERNAMES_KEY)) || [];
}

// Function to save starred usernames to localStorage
function saveStarredUsernames(starredUsernames) {
    localStorage.setItem(STARRED_USERNAMES_KEY, JSON.stringify(starredUsernames));
}

// Function to prioritize starred users
function prioritizeStarredUsers() {
    if (!scriptActive) return; // Exit if the script is inactive

    const parent = document.getElementById('usersLC');
    const users = Array.from(parent.getElementsByClassName('user-item'));

    const starredUsernames = new Set(loadStarredUsernames());

    const starred = [];
    const nonStarred = [];

    users.forEach(user => {
        const userName = user.querySelector('.user-name').innerText.trim();
        if (starredUsernames.has(userName)) {
            starred.push(user);
        } else {
            nonStarred.push(user);
        }
    });

    isUpdating = true;

    const orderedUsers = [...starred, ...nonStarred];
    parent.replaceChildren(...orderedUsers); // This replaces children without losing event listeners

    isUpdating = false;
}

// Function to handle icon click (for starring/unstarring users)
function handleIconClick(event) {
    event.stopPropagation();
    event.preventDefault();

    const targetIcon = event.target;
    const userNameElement = targetIcon.closest('.user-layout, .chat-item.message').querySelector('.user-name');
    if (userNameElement) {
        const userName = userNameElement.textContent.trim();
        let starredUsernames = loadStarredUsernames();

        if (targetIcon.classList.contains('fa-regular')) {
            targetIcon.className = 'fa-solid fa-fw fa-star fav';
            if (!starredUsernames.includes(userName)) {
                starredUsernames.push(userName);
                updateDropdown(userName); // Update dropdown with new user
            }
        } else {
            targetIcon.className = 'fa-regular fa-fw fa-star';
            starredUsernames = starredUsernames.filter(name => name !== userName);
            removeFromDropdown(userName); // Remove user from dropdown
        }

        saveStarredUsernames(starredUsernames);
        updateIcons();
        addStarsToChatUsers();
        updateMessageBackgrounds();
        prioritizeStarredUsers(); // Prioritize users after starring/unstarring
    }
}

// Function to update the dropdown with a new user
function updateDropdown(userName) {
    const dropdown = document.querySelector('#favorite-usernames-dropdown');
    if (dropdown) {
        const option = document.createElement('option');
        option.value = userName;
        option.textContent = userName;
        dropdown.appendChild(option);
    }
}

// Function to remove a user from the dropdown
function removeFromDropdown(userName) {
    const dropdown = document.querySelector('#favorite-usernames-dropdown');
    if (dropdown) {
        const optionToRemove = Array.from(dropdown.options).find(option => option.value === userName);
        if (optionToRemove) {
            dropdown.remove(optionToRemove.index);
        }
    }
}


// Function to update icons for existing children
function updateIcons() {
    if (!scriptActive) return; // Exit if the script is inactive

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
    if (!scriptActive) return; // Exit if the script is inactive

    const starredUsernames = loadStarredUsernames();
    const messagesContainer = document.querySelector("#messagesLC");

    if (messagesContainer) {
        Array.from(messagesContainer.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (userName) {
                // Find or create the star icon
                let starIcon = child.querySelector('.fa-star');
                if (!starIcon) {
                    starIcon = document.createElement('i');
                    starIcon.className = 'fa-regular fa-fw fa-star';
                    starIcon.style.margin = '0';
                    starIcon.style.marginRight = '8px';
                    starIcon.style.display = 'inline-block';
                    starIcon.style.lineHeight = '1';
                    starIcon.style.verticalAlign = 'bottom';
                    starIcon.addEventListener('click', handleIconClick);
                    child.insertBefore(starIcon, child.firstChild);
                }

                // Update the icon's class based on the starred status
                starIcon.className = starredUsernames.includes(userName) ? 'fa-solid fa-fw fa-star fav' : 'fa-regular fa-fw fa-star';
            }
        });
    }
}

// Function to get the username from an element
function getUsernameFromElement(element) {
    const userNameElement = element.querySelector('.user-name'); // Adjust this selector based on your structure
    return userNameElement ? userNameElement.textContent.trim() : null;
}

// Function to update message backgrounds
function updateMessageBackgrounds() {
    if (!scriptActive) return; // Exit if the script is inactive

    const starredUsernames = loadStarredUsernames();
    const starredUserColors = JSON.parse(localStorage.getItem('starredUserColors')) || {};
    const messagesContainer = document.querySelector("#messagesLC");

    if (messagesContainer) {
        Array.from(messagesContainer.children).forEach(child => {
            const userName = getUsernameFromElement(child);
            if (userName && starredUsernames.includes(userName)) {
                // Apply the user's specific background color from starredUserColors
                child.style.backgroundColor = starredUserColors[userName] || '#545454'; // Fallback to default if not set
            } else {
                child.style.backgroundColor = ''; // Reset background color
            }
        });
    }
}


// Function to initialize filter state from localStorage
function initializeFilterState2() {
    const mod2State = localStorage.getItem('mod2');
    const savedFilter = localStorage.getItem('filterText');

    // Set scriptActive based on the value of mod2State
    scriptActive = mod2State !== 'disabled'; // Enable if not disabled

    updateMessageVisibility(); // Update message visibility based on the current filter
}

// Initialize the filter state
initializeFilterState2();

// Add event listener for custom switch state changes
window.addEventListener('switchStateChanged', function(event) {
    if (event.detail.id === 'mod2') {
        scriptActive = event.detail.state === 'enabled';
    }
});


// Function to create a MutationObserver
function createObserver(target, callback) {
    const observer = new MutationObserver(callback);
    observer.observe(target, {
        childList: true, // Observe direct children
        subtree: true // Observe all descendants
    });
    return observer;
}

// Setup user list element
const parent = document.getElementById('usersLC');
if (parent) {
    // Track the previous user list to detect changes
    let previousUserList = Array.from(parent.children).map(user => user.outerHTML).join();

    // User list observer focused on detecting changes
    createObserver(parent, () => {
        const currentUserList = Array.from(parent.children).map(user => user.outerHTML).join();

        // Check if the user list has been modified or sorted
        if (currentUserList !== previousUserList) {
            previousUserList = currentUserList; // Update the previous user list

            // Call your functions here
            prioritizeStarredUsers(); // Prioritize starred users
            updateIcons(); // Update user icons
        }
    });
} else {
    console.log('User list element not found.'); // Optional: keep this if you want to know when the element is missing
}

// Messages observer remains unchanged
const messagesLC = document.querySelector("#messagesLC");
if (messagesLC) {
    createObserver(messagesLC, () => {
        if (scriptActive) {
            addStarsToChatUsers();
            updateMessageBackgrounds();
        }
    });
}

// ********************************************************************Translation Mods********************************************************************


// Language map with full names
const languageMap = {
    'aa': 'Afar',
    'ab': 'Abkhazian',
    'ace': 'Achinese',
    'ach': 'Acoli',
    'af': 'Afrikaans',
    'ak': 'Akan',
    'alz': 'Alur',
    'am': 'Amharic',
    'ar': 'Arabic',
    'as': 'Assamese',
    'av': 'Avaric',
    'awa': 'Awadhi',
    'ay': 'Aymara',
    'az': 'Azerbaijani',
    'ba': 'Bashkir',
    'bal': 'Baluchi',
    'ban': 'Balinese',
    'bbc': 'Batak Toba',
    'bci': 'Baoulé',
    'be': 'Belarusian',
    'bem': 'Bemba',
    'ber': 'Berber',
    'ber-Latn': 'Berber (Latin)',
    'bew': 'Betawi',
    'bg': 'Bulgarian',
    'bho': 'Bhojpuri',
    'bik': 'Bikol',
    'bm': 'Bambara',
    'bm-Nkoo': 'Bambara (Nkoo)',
    'bn': 'Bengali',
    'bo': 'Tibetan',
    'br': 'Breton',
    'bs': 'Bosnian',
    'bts': 'Batak Simalungun',
    'btx': 'Batak Karo',
    'bua': 'Buryat',
    'ca': 'Catalan',
    'ce': 'Chechen',
    'ceb': 'Cebuano',
    'cgg': 'Chiga',
    'ch': 'Chamorro',
    'chk': 'Chuukese',
    'chm': 'Mari',
    'ckb': 'Central Kurdish',
    'cnh': 'Hakha Chin',
    'co': 'Corsican',
    'crh': 'Crimean Tatar',
    'crs': 'Seselwa Creole French',
    'cs': 'Czech',
    'cv': 'Chuvash',
    'cy': 'Welsh',
    'da': 'Danish',
    'de': 'German',
    'din': 'Dinka',
    'doi': 'Dogri',
    'dov': 'Dombe',
    'dv': 'Divehi',
    'dyu': 'Dyula',
    'dz': 'Dzongkha',
    'ee': 'Ewe',
    'el': 'Greek',
    'en': 'English',
    'eo': 'Esperanto',
    'es': 'Spanish',
    'et': 'Estonian',
    'eu': 'Basque',
    'fa': 'Persian',
    'fa-AF': 'Dari',
    'ff': 'Fulah',
    'fi': 'Finnish',
    'fj': 'Fijian',
    'fo': 'Faroese',
    'fon': 'Fon',
    'fr': 'French',
    'fur': 'Friulian',
    'fy': 'Western Frisian',
    'ga': 'Irish',
    'gaa': 'Ga',
    'gd': 'Scottish Gaelic',
    'gl': 'Galician',
    'gn': 'Guarani',
    'gom': 'Goan Konkani',
    'gu': 'Gujarati',
    'gv': 'Manx',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hil': 'Hiligaynon',
    'hmn': 'Hmong',
    'hr': 'Croatian',
    'hrx': 'Hunsrik',
    'ht': 'Haitian Creole',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'iba': 'Iban',
    'id': 'Indonesian',
    'ig': 'Igbo',
    'ilo': 'Ilocano',
    'is': 'Icelandic',
    'it': 'Italian',
    'iw': 'Hebrew',
    'ja': 'Japanese',
    'jam': 'Jamaican Creole English',
    'jv': 'Javanese',
    'jw': 'Javanese',
    'ka': 'Georgian',
    'kac': 'Kachin',
    'kek': 'Kekchi',
    'kg': 'Kongo',
    'kha': 'Khasi',
    'kk': 'Kazakh',
    'kl': 'Kalaallisut',
    'km': 'Khmer',
    'kn': 'Kannada',
    'ko': 'Korean',
    'kr': 'Kanuri',
    'kri': 'Krio',
    'ktu': 'Kituba',
    'ku': 'Kurdish',
    'kv': 'Komi',
    'ky': 'Kyrgyz',
    'la': 'Latin',
    'lb': 'Luxembourgish',
    'lg': 'Luganda',
    'li': 'Limburgish',
    'lij': 'Ligurian',
    'lmo': 'Lombard',
    'ln': 'Lingala',
    'lo': 'Lao',
    'lt': 'Lithuanian',
    'ltg': 'Latgalian',
    'luo': 'Luo',
    'lus': 'Mizo',
    'lv': 'Latvian',
    'mad': 'Madurese',
    'mai': 'Maithili',
    'mak': 'Makasar',
    'mam': 'Mam',
    'mfe': 'Morisyen',
    'mg': 'Malagasy',
    'mh': 'Marshallese',
    'mi': 'Māori',
    'min': 'Minangkabau',
    'mk': 'Macedonian',
    'ml': 'Malayalam',
    'mn': 'Mongolian',
    'mni-Mtei': 'Meitei',
    'mr': 'Marathi',
    'ms': 'Malay',
    'ms-Arab': 'Malay (Arabic script)',
    'mt': 'Maltese',
    'mwr': 'Marwari',
    'my': 'Burmese',
    'ndc-ZW': 'Ndau',
    'ne': 'Nepali',
    'new': 'Newari',
    'nhe': 'Eastern Huasteca Nahuatl',
    'nl': 'Dutch',
    'no': 'Norwegian',
    'nr': 'Southern Ndebele',
    'nso': 'Northern Sotho',
    'nus': 'Nuer',
    'ny': 'Chichewa',
    'oc': 'Occitan',
    'om': 'Oromo',
    'or': 'Odia',
    'os': 'Ossetian',
    'pa': 'Punjabi',
    'pa-Arab': 'Punjabi (Arabic)',
    'pag': 'Pangasinan',
    'pam': 'Kapampangan',
    'pap': 'Papiamento',
    'pl': 'Polish',
    'ps': 'Pashto',
    'pt': 'Portuguese',
    'pt-PT': 'Portuguese (Portugal)',
    'qu': 'Quechua',
    'rn': 'Kirundi',
    'ro': 'Romanian',
    'rom': 'Romani',
    'ru': 'Russian',
    'rw': 'Kinyarwanda',
    'sa': 'Sanskrit',
    'sah': 'Yakut',
    'sat-Latn': 'Santali (Latin)',
    'scn': 'Sicilian',
    'sd': 'Sindhi',
    'se': 'Northern Sami',
    'sg': 'Sango',
    'shn': 'Shan',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'sm': 'Samoan',
    'sn': 'Shona',
    'so': 'Somali',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'ss': 'Swati',
    'st': 'Southern Sotho',
    'su': 'Sundanese',
    'sus': 'Susu',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'szl': 'Silesian',
    'ta': 'Tamil',
    'tcy': 'Tulu',
    'te': 'Telugu',
    'tet': 'Tetum',
    'tg': 'Tajik',
    'th': 'Thai',
    'ti': 'Tigrinya',
    'tiv': 'Tiv',
    'tk': 'Turkmen',
    'tl': 'Tagalog',
    'tn': 'Tswana',
    'to': 'Tongan',
    'tpi': 'Tok Pisin',
    'tr': 'Turkish',
    'trp': 'Kokborok',
    'ts': 'Tsonga',
    'tt': 'Tatar',
    'tum': 'Tumbuka',
    'tw': 'Twi',
    'ty': 'Tahitian',
    'ug': 'Uyghur',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    've': 'Venda',
    'vi': 'Vietnamese',
    'vo': 'Volapük',
    'war': 'Waray',
    'wo': 'Wolof',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'yue': 'Cantonese',
    'zh': 'Chinese',
    'zu': 'Zulu'
};
 // Fetch supported languages using API key
const apiKey = 'AIzaSyC_iX3grLK49o6pQh5ZLGr7T03HAN8pYpM'; // Replace with your API key

let newButton; // Declare the newButton variable at the top for scope access

// Function to check and update the translator state
function updateTranslatorState() {
    const mod3State = localStorage.getItem("mod3");
    console.log(`Current mod3 state: ${mod3State}`); // Log current state for debugging

    // Remove any existing translator UI if it exists
    const existingDropdown = document.getElementById('languageDropdown');
    const existingCheckbox = document.getElementById('newCheckbox');

    // Remove existing UI elements if they exist
    if (existingDropdown) {
        existingDropdown.remove();
    }
    if (existingCheckbox) {
        existingCheckbox.remove();
    }

    // If mod3 is enabled, create the translator UI
    if (mod3State === "enabled") {
        console.log('Translator module is enabled.');
        createTranslator(); // Call the function to initialize the translator UI
    } else {
        console.log('Translator module is disabled.');
        removeTranslatorListeners(); // Remove listeners if disabled
    }

    updateTranslationIconState(); // Update the translation icon state
}

// Function to remove event listeners for translation
function removeTranslatorListeners() {
    const inputNode = document.querySelector(".emojionearea-editor");
    if (inputNode) {
        inputNode.removeEventListener('keydown', handleEnterKey);
    }
}

// Event handler for Enter key
async function handleEnterKey(event) {
    const mod3State = localStorage.getItem("mod3");
    const inputNode = document.querySelector(".emojionearea-editor");
    const checkbox = document.getElementById('newCheckbox');

    // Check if mod3 is enabled and the checkbox is checked
    if (event.key === 'Enter' && mod3State === "enabled" && checkbox.checked) {
        event.preventDefault(); // Prevent the default send action
        event.stopPropagation(); // Stop the event from bubbling up

        // Intercept the inner text from the specified node
        const text = inputNode.textContent.trim(); // Use textContent to get the text
        const targetLanguage = document.getElementById('languageDropdown').value;

        console.log('Intercepted text:', text);
        console.log('Selected language:', targetLanguage);

        if (!text || !targetLanguage) {
            alert('Please enter text and select a language.');
            return;
        }

        try {
            const translateResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLanguage,
                }),
            });

            const translationData = await translateResponse.json();
            if (translationData.error) {
                throw new Error(translationData.error.message);
            }

            cApp.t_me(translationData.data.translations[0].translatedText);
            inputNode.textContent = ""; // Clear the contenteditable area
        } catch (error) {
            console.error('Error translating text:', error);
            alert('Translation failed: ' + error.message);
        }
    }
}

// Function to create the translator UI
async function createTranslator() {
    // Sort the language options alphabetically by their full name
    const sortedLanguages = Object.entries(languageMap).sort((a, b) => a[1].localeCompare(b[1]));

    function waitForElement(selector, callback, interval = 100) {
        const elementCheck = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(elementCheck);
                callback(element);
            }
        }, interval);
    }

    function createAndPositionDropdown(targetLocation) {
        // Create a container for the dropdown and checkbox
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.zIndex = '1000'; // Ensure it appears above other elements
        container.style.display = 'flex'; // Use flex to position items horizontally

        // Get the target element position and size
        const targetRect = targetLocation.getBoundingClientRect();

        // Position the container to the left of the target node
        container.style.top = `${targetRect.top + window.scrollY}px`;  // Align vertically
        container.style.left = `${targetRect.left + window.scrollX - 35}px`; // Place to the left of the target (100px is arbitrary, adjust as needed)

        // Create the checkbox
        const newCheckbox = document.createElement('input');
        newCheckbox.type = 'checkbox';
        newCheckbox.id = 'newCheckbox';
        newCheckbox.style.marginRight = '0px'; // Space between checkbox and dropdown

        // Create label for the checkbox
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'newCheckbox';
        checkboxLabel.innerText = ''; // Empty text for the checkbox

        // Create language dropdown
        const languageDropdown = document.createElement('select');
        languageDropdown.id = 'languageDropdown'; // Assign an ID to the dropdown
        languageDropdown.style.width = '20px'; // Set the width of the dropdown
        languageDropdown.style.backgroundColor = '#34363A';

        // Load the saved language from localStorage and set it as default
        const savedLanguage = localStorage.getItem("selectedLanguage") || 'en'; // Default to English

        // Populate dropdown with languages (clear first)
        languageDropdown.innerHTML = '';
        sortedLanguages.forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.text = name;
            languageDropdown.appendChild(option);
        });

        languageDropdown.value = savedLanguage;

        // Append the checkbox and label to the container first, then the dropdown
        container.appendChild(newCheckbox);
        container.appendChild(checkboxLabel);
        container.appendChild(languageDropdown);

        // Append the container to the body
        document.body.appendChild(container);

        console.log('New dropdown and checkbox container created and appended to the body.');
    }

    // Start polling to wait for the target element
    waitForElement("#chatInputWrapper > div.dropup > div.circlecolor", (element) => {
        createAndPositionDropdown(element);
    });
}

// Call the function to check the initial state
updateTranslatorState(); // Ensure initial state is checked and UI created if needed

// Add event listener for the Enter key
const inputNode = document.querySelector(".emojionearea-editor");
if (inputNode) {
    inputNode.addEventListener('keydown', handleEnterKey, true); // Use capture phase
} else {
    console.log("Input node not found!");
}



// Create the translation icon and functionality
function createTranslationIcon() {
    const translationButton = document.createElement('button');
    translationButton.type = 'button';
    translationButton.className = 'btn btn-sm btn-default m-t-0'; // Match existing button class

    const newIcon = document.createElement('i');
    newIcon.className = 'fa-solid fa-globe';
    newIcon.style.marginLeft = '7px'; // Add a margin for spacing

    translationButton.appendChild(newIcon);

    // Add padding to the message preview node
    const messagePreviewNode = document.querySelector("#messagePopout > div.messagePreview");
    if (messagePreviewNode) {
        messagePreviewNode.style.paddingLeft = '20px'; // Apply padding initially
    }

    translationButton.onclick = async function() {
        if (messagePreviewNode) {
            const clonedNode = messagePreviewNode.cloneNode(true);
            // Remove <b> tags and get the text
            const boldElements = clonedNode.getElementsByTagName('b');
            while (boldElements.length > 0) {
                boldElements[0].parentNode.removeChild(boldElements[0]);
            }
            const messageText = clonedNode.innerText;

            // Prepare to translate the messageText to English
            const targetLanguage = 'en';

            if (!messageText) {
                console.error('No text to translate!');
                return;
            }

            try {
                const translateResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: messageText,
                        target: targetLanguage,
                    }),
                });

                const translationData = await translateResponse.json();
                if (translationData.error) {
                    throw new Error(translationData.error.message);
                }

                const translatedText = translationData.data.translations[0].translatedText;
                const detectedSourceLanguage = translationData.data.translations[0].detectedSourceLanguage;
                const fullLanguageName = languageMap[detectedSourceLanguage] || detectedSourceLanguage; // Use languageMap to get the full name

                // Create a new div based on the specified structure
                const newDiv = document.createElement('div');
                newDiv.className = 'chat-item welcome-message'; // Set classes
                newDiv.style.color = '#C2C2C2'; // Set the text color to #C2C2C2
                newDiv.setAttribute('data-item-id', ''); // Set the data attribute

                // Create the inner structure
                const userRightDiv = document.createElement('div');
                userRightDiv.className = 'user-right';

                const welcomeMessageContentDiv = document.createElement('div');
                welcomeMessageContentDiv.className = 'welcome-message-content';
                welcomeMessageContentDiv.textContent = `${fullLanguageName}: ${translatedText}`; // Fill with the language name and translated text

                // Append the inner structure
                userRightDiv.appendChild(welcomeMessageContentDiv);
                newDiv.appendChild(userRightDiv);

                // Append the new div to messagesLC
                const messagesLCNode = document.querySelector("#messagesLC");
                if (messagesLCNode) {
                    messagesLCNode.appendChild(newDiv);
                } else {
                    console.error('MessagesLC node not found!');
                }
            } catch (error) {
                console.error('Error translating text:', error);
                alert('Translation failed: ' + error.message);
            }
        } else {
            console.error('Message preview node not found!');
        }
    };

    // Insert the translation button in the desired location
    const mentionButton = document.querySelector("#messagePopout > div.btn-toolbar > div > button.btn.btn-sm.btn-default.m-t-0.mention-user");
    if (mentionButton) {
        mentionButton.parentNode.insertBefore(translationButton, mentionButton);
    }
}

// Function to show/hide the translation icon based on mod4 state
function updateTranslationIconState() {
    const mod4State = localStorage.getItem("mod4");
    const translationButton = document.querySelector('.fa-globe'); // Adjusted to find the icon directly
    if (translationButton) {
        translationButton.parentNode.style.display = (mod4State === "enabled") ? 'inline-block' : 'none';
    }
}

// Add event listener for mod4 state changes
window.addEventListener('switchStateChanged', function(event) {
    if (event.detail.id === 'mod4') {
        localStorage.setItem("mod4", event.detail.state);
        updateTranslationIconState(); // Update the visibility of the icon
    }
});

// Initialize the translation icon and state
createTranslationIcon();
updateTranslationIconState();

// Initial check for localStorage value
updateTranslatorState();

// Add event listener for custom switch state changes
window.addEventListener('switchStateChanged', function(event) {
    console.log(`Custom Event - Switch ID: ${event.detail.id}, State: ${event.detail.state}`);
    localStorage.setItem("mod3", event.detail.state);
    console.log(`Updated localStorage: mod3 = ${event.detail.state}`);
    updateTranslatorState();
});

// Log initial state for debugging
console.log(`Initial mod3 value: ${localStorage.getItem("mod3")}`);
