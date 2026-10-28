---
status: "proposed"
date: 2026-10-28
---

# Character Exchange UI

## Statement

The system shall provide the user with a button on the character sheet to access a modal window for exchanging characters, allowing them to copy a short unique link to their active character, regenerate and invalidate previous links, open shared characters directly in a browser via the link, and import another player's character by entering the corresponding link.

## Rationale

Players need an intuitive and quick way to share their character's attributes with the Dungeon Master (DM) or other party members, as well as load other players' characters for a co-op session. Having a brief summary of the current character in the same window prevents mistakes, ensuring the player shares the link to the correct hero. Keeping links short ensures convenient sharing across messaging apps, while link invalidation upon regeneration allows users to revoke outdated or unauthorized access.

## Acceptance Criteria

*   **Entry Point:** The character sheet interface shall contain a dedicated button that opens the character exchange modal window.
*   **Link Display:** The window shall contain a read-only field displaying the unique URL of the currently active character.
*   **URL Length Constraint:** The full generated URL (including domain and protocol) shall not exceed 50 characters in total length.
*   **Copying:** Clicking the "Copy" button located next to the link field shall save the URL to the user's system clipboard.
*   **Link Invalidation:** The window shall provide an option to generate a new share link. Generating a new link shall immediately invalidate the previously active link for that character, causing subsequent access to the old link to return an expired/not found state.
*   **Direct Browser Navigation:** Entering an active character share URL directly into a web browser address bar shall open the corresponding character's sheet in view mode.
*   **Character Summary:** The "Your character" section shall correctly display brief information about the hero: Avatar, Name, Race, Class, Level, current/maximum HP, and current/maximum MP.
*   **Import:** The "Import character" section shall contain a text input field for a URL with an appropriate placeholder (e.g., "Paste link to another player's sheet...") and a "Load" button that initiates the import process.
*   **Closing the Window:** The modal window shall close without saving state changes (unless an import is already in progress) when clicking the "Close" button (with a red outline) or the "X" icon in the top right corner.
*   **Styling:** The visual design shall match the provided mockup (dark theme, rounded corners, red accents for close/cancel buttons).

## Verification Method

Test | Demonstration

*   **Test:** Verify the "Copy" button functionality (compare clipboard content with the expected URL). Test that the generated URL length does not exceed 50 characters. Test link regeneration: verify that an old URL returns an error/expired status once a new one is issued. Test the import input field validation for accepting correctly formatted URLs.
*   **Demonstration:** Visual comparison of the implemented window with the approved design mockup; verify opening the modal window via the button on the character sheet; verify that pasting the link into a browser opens the character sheet directly.

## More Information

*   **Design Mockup:** The window must be styled identically to the secondary mockup provided in the task (modern flat design, dark theme).
*   **Dependencies:** Requires the readiness of an API endpoint for generating and invalidating compact share links (max 50 chars) and an API endpoint for fetching/parsing character data via URL.
*   **Localization:** All UI texts must support the localization system to accommodate multiple languages easily.
