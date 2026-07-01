import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider Setup
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we are signed in but lost the token from memory, we can sign in again or prompt
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token from authentication.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Convert Base64 URL to Blob
export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const contentType = mimeMatch ? mimeMatch[1] : '';
  const sliceSize = 1024;
  const byteCharacters = atob(parts[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

interface UploadResponse {
  id: string;
  name: string;
  webViewLink?: string;
}

// Upload file to the target Google Drive Folder
export const uploadFileToFolder = async (
  filename: string,
  base64Data: string,
  folderId: string = '1GtVy7B742Vilb16PGoanTaKbBXE-4Ngt'
): Promise<UploadResponse> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No active authentication token found. Please Sign in with Google first.');
  }

  const blob = base64ToBlob(base64Data);
  const mimeType = blob.type || 'application/octet-stream';

  const boundary = 'foo_bar_baz_upload_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: mimeType,
    parents: [folderId]
  };

  const metadataStr = JSON.stringify(metadata);

  // Read Blob into ArrayBuffer to form standard multipart
  const arrayBuffer = await blob.arrayBuffer();

  const parts = [
    `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadataStr}\r\n`,
    `${delimiter}Content-Type: ${mimeType}\r\n\r\n`,
    arrayBuffer,
    closeDelim
  ];

  const multipartBlob = new Blob(parts, { type: `multipart/related; boundary=${boundary}` });

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: multipartBlob
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive API upload failed: ${response.status} - ${errText}`);
  }

  return await response.json();
};
