# Firebase Setup Guide for Hamzury

This guide walks you through setting up Google Firebase (Cloud Firestore & Firebase Cloud Storage) for the Hamzury platform and connecting it to your Vercel deployment.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `hamzury-hub`).
3. (Optional) Enable or disable Google Analytics as desired.
4. Once created, click on the **Web** icon (`</>`) to add a Web App.
5. Register the app with a nickname (e.g. `hamzury-web`).
6. Firebase will show your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "hamzury-hub.firebaseapp.com",
     projectId: "hamzury-hub",
     storageBucket: "hamzury-hub.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```

---

## 2. Enable Cloud Firestore

1. In the Firebase console left menu, go to **Build** -> **Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (e.g. `europe-west1` or `us-central1`).
4. Choose **Start in production mode**.
5. Go to the **Rules** tab and paste the following rules, then click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Applications collection
    match /applications/{appId} {
      // Anyone can submit a new application
      allow create: if request.resource.data.ref != null;
      // Anyone can query/read their application by knowing their unique HMZ reference
      allow read: if true;
      // Updates and deletes are restricted to admin
      allow update, delete: if request.auth != null;
    }
    
    // Partnership requests
    match /partnerships/{enquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Sponsorship offers
    match /sponsorships/{sponsorId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Treasury public records
    match /treasury/{recordId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 3. Enable Firebase Cloud Storage

1. In the Firebase console left menu, go to **Build** -> **Storage**.
2. Click **Get Started** and select your location.
3. Choose **Start in production mode**.
4. Go to the **Rules** tab and paste the following rules, then click **Publish**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /applications/{ref}/{allPaths=**} {
      // Anyone can upload a receipt or school letter under 10MB (images or PDFs)
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && (request.resource.contentType.matches('image/.*')
                       || request.resource.contentType == 'application/pdf');
      // Public read of uploaded verification documents by applicant/staff
      allow read: if true;
    }
  }
}
```

---

## 4. Configure Environment Variables

### Local Development:
Create a `.env` file in the project root containing:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

### Vercel Deployment:
1. In your Vercel Project Dashboard, navigate to **Settings** -> **Environment Variables**.
2. Add each of the 6 variables above (`VITE_FIREBASE_API_KEY`, etc.).
3. Choose Environments: **Production**, **Preview**, and **Development**.
4. Redeploy or push a new commit to trigger the build.
