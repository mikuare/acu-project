# How to Update Your Mapbox API Token

If your map stops loading (shows a blank space or errors) or you receive a notification that you've reached your free tier limit, you will need to generate a new Mapbox API token.

## Step 1: Login to Mapbox
1.  Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2.  Log in with your credentials.

## Step 2: Generate a New Token
1.  On your account dashboard, look for the **"Access tokens"** section.
2.  Click the **"Create a token"** button.
3.  **Name:** Give it a name like "QMAZ Project Map 2".
4.  **Scopes:** You can leave the default "Public" scopes selected.
5.  Click **"Create token"**.

## Step 3: Copy the Public Token
1.  Find your newly created token in the list.
2.  It should start with **`pk.`** (e.g., `pk.eyJ1...`).
3.  Click the clipboard icon to copy it.

> **Important:** Do NOT use the "Secret" token (starts with `sk.`). That is for server-side use only.

## Step 4: Update Your Code
1.  Open your project folder in VS Code.
2.  Navigate to the file: `src/config/mapbox.ts`
3.  Look for this line:
    ```typescript
    export const MAPBOX_TOKEN = 'pk.eyJ1...'; 
    ```
4.  Replace the old token inside the quotes with your **new token**.
5.  Save the file (`Ctrl + S`).

## Step 5: Verify
1.  Go back to your website (Refresh the page).
2.  The map should now load correctly.
