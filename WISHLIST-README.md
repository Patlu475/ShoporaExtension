# ShopBot Wishlist Feature

This document describes how to set up and use the Wishlist feature in the ShopBot extension.

## Firebase Configuration

To use the wishlist feature, you need to configure Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Firebase Authentication and Firestore Database
3. Update the Firebase configuration in `entrypoints/services/firebase/config.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

4. Add Firestore security rules to secure your data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own wishlist data
    match /wishlists/{productId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## How the Wishlist Feature Works

The wishlist feature allows users to save products to their personal wishlist, which is stored in Firebase Firestore. Each user has their own individual wishlist, and products are differentiated using unique IDs to prevent duplicates.

### Adding Products to Wishlist

When a user clicks the "Add to Wishlist" button on a product card:

1. The product details (image, title, price, description, etc.) are captured
2. The data is sent to the background script via a message
3. The background script checks if the user is logged in
4. If logged in, the product is saved to Firestore under the user's unique ID
5. A success or error message is displayed to the user

### Viewing the Wishlist

The wishlist page:

1. Fetches all products saved to the user's wishlist from Firestore
2. Displays them in a scrollable list
3. Shows loading, empty, and error states as appropriate
4. Allows removing products from the wishlist

### Removing Products from Wishlist

When a user clicks the remove button on a wishlist product:

1. The product ID is sent to the background script
2. The background script deletes the product from Firestore
3. The product is removed from the UI
4. A success or error message is displayed to the user

## Authentication

Users need to be logged in to use the wishlist feature. The extension provides:

- User authentication with Firebase Auth
- Email/password login and signup
- User state persistence across browser sessions

## Data Structure

The Firestore data structure for the wishlist is:

```
wishlists (collection)
├── [product_id] (document)
│   ├── userId: string
│   └── product: {
│       ├── id: string
│       ├── title: string
│       ├── description: string
│       ├── price: string
│       ├── image: string
│       ├── website: string
│       ├── availability: string (optional)
│       ├── category: string (optional)
│       ├── url: string (optional)
│       └── dateAdded: number (timestamp)
│   }
```

This structure ensures efficient queries and proper data organization. 