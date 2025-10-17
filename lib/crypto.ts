import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 16

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'default-encryption-key-change-in-production'
  return scryptSync(secret, 'salt', KEY_LENGTH)
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const salt = randomBytes(SALT_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ])

  return combined.toString('base64')
}

export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedText, 'base64')

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + 16)
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + 16)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error('Failed to decrypt data')
  }
}
