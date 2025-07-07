// Firebase Storage Example for Daily Readings
// This demonstrates how to integrate with Firebase/Firestore

class FirebaseStorage {
    constructor(config) {
        this.config = config;
        this.db = null;
        this.collection = 'daily-readings';
        this.userId = this.getUserId();
    }

    // Initialize Firebase
    async init() {
        // Import Firebase modules (you'd need to include Firebase SDK)
        // import { initializeApp } from 'firebase/app';
        // import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
        
        try {
            // Initialize Firebase app
            // const app = initializeApp(this.config);
            // this.db = getFirestore(app);
            
            console.log('Firebase initialized');
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            throw error;
        }
    }

    // Get unique user ID (could be based on device, login, etc.)
    getUserId() {
        let userId = localStorage.getItem('firebase_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('firebase_user_id', userId);
        }
        return userId;
    }

    // Get all readings for the user
    async getReadings() {
        try {
            // Example Firestore query
            // const q = query(
            //     collection(this.db, this.collection),
            //     where('userId', '==', this.userId),
            //     orderBy('timestamp', 'desc')
            // );
            // const querySnapshot = await getDocs(q);
            // const readings = [];
            // querySnapshot.forEach((doc) => {
            //     readings.push({ id: doc.id, ...doc.data() });
            // });
            // return readings;
            
            // Mock implementation
            return [];
        } catch (error) {
            console.error('Error getting readings:', error);
            throw error;
        }
    }

    // Add a new reading
    async addReading(reading) {
        try {
            const readingWithUser = {
                ...reading,
                userId: this.userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Example Firestore add
            // const docRef = await addDoc(collection(this.db, this.collection), readingWithUser);
            // return { id: docRef.id, ...readingWithUser };
            
            // Mock implementation
            console.log('Would save to Firebase:', readingWithUser);
            return readingWithUser;
        } catch (error) {
            console.error('Error adding reading:', error);
            throw error;
        }
    }

    // Delete a reading
    async deleteReading(readingId) {
        try {
            // Example Firestore delete
            // await deleteDoc(doc(this.db, this.collection, readingId));
            
            console.log('Would delete from Firebase:', readingId);
        } catch (error) {
            console.error('Error deleting reading:', error);
            throw error;
        }
    }

    // Update a reading
    async updateReading(readingId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            // Example Firestore update
            // await updateDoc(doc(this.db, this.collection, readingId), updateData);
            
            console.log('Would update in Firebase:', readingId, updateData);
        } catch (error) {
            console.error('Error updating reading:', error);
            throw error;
        }
    }

    // Real-time listener for changes
    setupRealtimeListener(callback) {
        try {
            // Example Firestore listener
            // const q = query(
            //     collection(this.db, this.collection),
            //     where('userId', '==', this.userId)
            // );
            // 
            // return onSnapshot(q, (querySnapshot) => {
            //     const readings = [];
            //     querySnapshot.forEach((doc) => {
            //         readings.push({ id: doc.id, ...doc.data() });
            //     });
            //     callback(readings);
            // });
            
            console.log('Would setup real-time listener');
        } catch (error) {
            console.error('Error setting up listener:', error);
        }
    }
}

// Firebase-powered Reading Manager
class FirebaseReadingManager extends DailyReadingManager {
    constructor(firebaseConfig) {
        super();
        this.firebase = new FirebaseStorage(firebaseConfig);
        this.useFirebase = !!firebaseConfig;
        this.realtimeListener = null;
    }

    async init() {
        if (this.useFirebase) {
            try {
                await this.firebase.init();
                await this.loadFromFirebase();
                this.setupRealtimeSync();
                this.updateStorageStatus('🔥 Firebase', 'Connected');
            } catch (error) {
                console.error('Firebase init failed:', error);
                this.updateStorageStatus('📱 Local Storage', 'Firebase failed, using local');
                this.useFirebase = false;
            }
        }
        
        super.init();
    }

    async loadFromFirebase() {
        const readings = await this.firebase.getReadings();
        this.saveReadings(readings); // Save to localStorage as cache
        this.displayReadings(readings);
    }

    setupRealtimeSync() {
        this.realtimeListener = this.firebase.setupRealtimeListener((readings) => {
            this.saveReadings(readings);
            this.displayReadings(readings);
            this.updateTagFilter();
            this.updateStorageStatus('🔥 Firebase', 'Synced');
        });
    }

    async addReading(reading) {
        // Optimistic update
        super.addReading(reading);
        
        if (this.useFirebase) {
            try {
                await this.firebase.addReading(reading);
                this.updateStorageStatus('🔥 Firebase', 'Saved');
            } catch (error) {
                console.error('Failed to save to Firebase:', error);
                this.updateStorageStatus('🔥 Firebase', 'Save failed');
            }
        }
    }

    async deleteReading(id) {
        // Optimistic update
        super.deleteReading(id);
        
        if (this.useFirebase) {
            try {
                await this.firebase.deleteReading(id);
                this.updateStorageStatus('🔥 Firebase', 'Updated');
            } catch (error) {
                console.error('Failed to delete from Firebase:', error);
                this.updateStorageStatus('🔥 Firebase', 'Delete failed');
            }
        }
    }

    updateStorageStatus(indicator, status) {
        const indicatorEl = document.getElementById('storage-indicator');
        const statusEl = document.getElementById('sync-status');
        if (indicatorEl) indicatorEl.textContent = indicator;
        if (statusEl) statusEl.textContent = status;
    }

    destroy() {
        if (this.realtimeListener) {
            this.realtimeListener(); // Unsubscribe
        }
    }
}

// Usage example:
// const firebaseConfig = {
//     apiKey: "your-api-key",
//     authDomain: "your-project.firebaseapp.com",
//     projectId: "your-project-id",
//     storageBucket: "your-project.appspot.com",
//     messagingSenderId: "123456789",
//     appId: "your-app-id"
// };
// 
// const manager = new FirebaseReadingManager(firebaseConfig);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FirebaseStorage, FirebaseReadingManager };
} 