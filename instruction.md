# Firebase Setup Instructions

Follow these steps to connect your Firebase backend to the Parallel Paths portfolio.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `parallel-paths`).
3. Disable Google Analytics (not needed for this minimal setup).
4. Click **Create Project**.

## 2. Register Your Web App
1. In the Project Overview sidebar, click the **Web `</>`** icon.
2. Register the app with a nickname (e.g., `parallel-paths-web`).
3. Click **Register app** (do not set up Firebase Hosting yet).
4. You will see a `firebaseConfig` object. Keep this tab open.

## 3. Configure Environment Variables
1. Open the `.env` file in the root of your project.
2. Paste the config values from your Firebase Console into their respective variables:
   ```env
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   ```

## 4. Enable Authentication (Admin Login)
1. In the Firebase Console sidebar, go to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable it and click **Save**.
5. Go to the **Users** tab and click **Add user**. 
6. Create an admin email and password (this will be your login for the `/admin` route).

## 5. Enable Cloud Firestore
1. In the sidebar, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select **Start in production mode** and choose a location close to your users.
4. Click **Enable**.

## 6. Apply Security Rules
1. Go to the **Rules** tab in Firestore.
2. Replace the default rules with the following to match our implementation plan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is authenticated (Admin)
    function isAdmin() {
      return request.auth != null;
    }

    match /contacts/{contactId} {
      // Anyone can submit a contact form
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'message', 'createdAt'])
                    && request.resource.data.name is string;
      
      // Only admin can read or manage contacts
      allow read, update, delete: if isAdmin();
    }

    match /projects/{projectId} {
      // Anyone can view projects
      allow read: if true;
      
      // Only admin can modify projects
      allow write: if isAdmin();
    }
  }
}
```
3. Click **Publish**.

> [!TIP]
> **Setup Complete!** Re-run `npm run dev` to ensure your Vite server loads the new `.env` variables.
