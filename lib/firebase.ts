// Direct export and re-export of Firebase configuration, authentication, and collections
// Ensuring seamless integration for imports from '@/lib/firebase' and 'lib/firebase.ts'
export * from '../src/lib/firebase';
export { app, db, auth, productsCollection, usersCollection, academiesCollection } from '../src/lib/firebase';
