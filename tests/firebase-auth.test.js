import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFirebaseUser,
  getFirebaseErrorMessage
} from '../src/features/auth/services/firebase-auth.js';

test('formatFirebaseUser formats Google user to Wayvee profile schema', () => {
  const mockFirebaseUser = {
    uid: 'google-uid-12345',
    email: 'traveler@gmail.com',
    displayName: 'Nguyen Van A',
    photoURL: 'https://lh3.googleusercontent.com/a/test-photo',
    emailVerified: true
  };

  const user = formatFirebaseUser(mockFirebaseUser);

  assert.equal(user.id, 'google-uid-12345');
  assert.equal(user.userId, 'google-uid-12345');
  assert.equal(user.email, 'traveler@gmail.com');
  assert.equal(user.fullName, 'Nguyen Van A');
  assert.equal(user.firstName, 'Nguyen Van');
  assert.equal(user.lastName, 'A');
  assert.equal(user.avatarUrl, 'https://lh3.googleusercontent.com/a/test-photo');
  assert.equal(user.photoURL, 'https://lh3.googleusercontent.com/a/test-photo');
  assert.equal(user.role, 'USER');
  assert.equal(user.authProvider, 'google');
  assert.equal(user.isGoogleUser, true);
  assert.equal(user.emailVerified, true);
});

test('formatFirebaseUser handles single name and missing photo', () => {
  const mockFirebaseUser = {
    uid: 'google-uid-999',
    email: 'alice@gmail.com',
    displayName: 'Alice',
    photoURL: null,
    emailVerified: true
  };

  const user = formatFirebaseUser(mockFirebaseUser);

  assert.equal(user.fullName, 'Alice');
  assert.equal(user.firstName, 'Alice');
  assert.equal(user.lastName, '');
  assert.equal(user.avatarUrl, null);
});

test('getFirebaseErrorMessage maps common error codes to friendly messages', () => {
  assert.match(
    getFirebaseErrorMessage({ code: 'auth/popup-closed-by-user' }),
    /đóng cửa sổ/
  );
  assert.match(
    getFirebaseErrorMessage({ code: 'auth/popup-blocked' }),
    /chặn cửa sổ pop-up/
  );
  assert.match(
    getFirebaseErrorMessage({ code: 'auth/unauthorized-domain' }),
    /chưa được cấp phép trong Firebase Console/
  );
  assert.match(
    getFirebaseErrorMessage({ code: 'auth/network-request-failed' }),
    /kết nối mạng/
  );
  assert.match(
    getFirebaseErrorMessage({ code: 'auth/operation-not-allowed' }),
    /chưa được kích hoạt/
  );
});

