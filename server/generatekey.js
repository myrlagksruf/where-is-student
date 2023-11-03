import fs from 'node:fs/promises'

/** @param {ArrayBuffer} arrayBuffer  */
export function arrayBufferToBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
  
    return btoa(String.fromCharCode(...bytes));
}

/** @param {CryptoKey} key  */
export async function exportKey(key) {
    const keyType = key.type
    const exportedKey = await crypto.subtle.exportKey(
      keyType === 'public' ? "spki" : "pkcs8",
      key
    );
  
    const base64Key = arrayBufferToBase64(exportedKey);
    const pemKey = (`-----BEGIN ${keyType.toUpperCase()} KEY-----\n${base64Key}\n-----END ${keyType.toUpperCase()} KEY-----`);
    await fs.writeFile(`./${keyType}_key.pem`, pemKey, {encoding:'utf-8'})
}


export async function generateKeyPair() {
    return crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048, // 키 크기
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: "SHA-256" },
        },
        true, // 키를 내보낼 수 있는지 여부
        ["encrypt", "decrypt"] // 사용할 키 용도
    );
}

generateKeyPair().then(v => {
    return Promise.all([exportKey(v.privateKey), exportKey(v.publicKey)])
}).then(() => {
    console.log('publickey, privatekey 생성 완료')
})