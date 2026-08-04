import api from '../API/Index';

export type ModelConfigPayload = {
  modelKey: string;
  modelName: string;
  endpoint?: string;
  apiKey: string;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64: string) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const pemToArrayBuffer = (pem: string) => {
  const base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  return base64ToArrayBuffer(base64);
};

const encryptModelConfig = async (publicKeyPem: string, payload: ModelConfigPayload) => {
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);
  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawAesKey);

  return {
    encrypted_key: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertext),
  };
};

export const saveModelConfig = async (payload: ModelConfigPayload) => {
  const keyResponse = await api.get('/model_config/public_key');
  const publicKey = keyResponse.data?.data?.public_key;
  if (!publicKey) {
    throw new Error('无法获取后端加密公钥');
  }

  const encryptedPayload = await encryptModelConfig(publicKey, payload);
  const formData = new FormData();
  formData.append('encrypted_key', encryptedPayload.encrypted_key);
  formData.append('iv', encryptedPayload.iv);
  formData.append('ciphertext', encryptedPayload.ciphertext);

  return api.post('/model_config', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
