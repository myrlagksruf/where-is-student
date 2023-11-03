const salt1 = process.env.SALT1
const salt2 = process.env.SALT2
const salt3 = process.env.SALT3
const PUK = process.env.PUBLIC_KEY
const PRK = process.env.PRIVATE_KEY

function pemToArrayBuffer(pem:string) {
  // PEM 파일에서 헤더와 푸터 제거
  const base64String = pem.replace(/-----(BEGIN|END) (PUBLIC|PRIVATE) KEY-----|\n/g, '');
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64ToArrayBuffer(base:string){
  const binaryString = atob(base);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(arrayBuffer:ArrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
  
    return btoa(String.fromCharCode(...bytes));
}

async function importPemKey(pemKey:string, type:'public'|'private') {
  const keyBuffer = pemToArrayBuffer(pemKey);

  return await crypto.subtle.importKey(
    type === 'public' ? "spki" : 'pkcs8',
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    [type === 'public' ? "encrypt" : 'decrypt']
  );
}


// 암호화 함수
function encryptMessage(publicKey:CryptoKey, message:string) {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  return crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedMessage
  );
}

// 복호화 함수
async function decryptMessage(privateKey:CryptoKey, encryptedData:ArrayBuffer) {
  const buffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedData
  )
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

export const getMessage = async (mes:string) => {
  const puk = await importPemKey(PUK ?? '', 'public')
  const buffer = await encryptMessage(puk, mes)
  return arrayBufferToBase64(buffer)
}

export const setMessage = async (mes:string) => {
  const prk = await importPemKey(PRK ?? '', 'private')
  const buf = base64ToArrayBuffer(mes)
  return await decryptMessage(prk, buf)
}

export const passToHash = async (obj:{user_id:string, pass:string}, salts = [salt1, salt2, salt3]) => {
  const [salt1, salt2, salt3] = salts
  const { user_id, pass } = obj
  const encoder = new TextEncoder()
  const data = encoder.encode(`${salt1}${user_id}${salt2}${pass}${salt3}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(arrayBufferToBase64(hash))
}