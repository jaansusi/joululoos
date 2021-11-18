using System.Security.Cryptography;
using System.Text;

namespace SantaReporter
{
    public class EncryptionFactory
    {
        private readonly string EncryptionKey;

        public EncryptionFactory(string encryptionKey)
        {
            EncryptionKey = encryptionKey;
        }
        public string Encrypt(string text)
        {
            Aes cipher = CreateCipher(EncryptionKey);

            ICryptoTransform cryptTransform = cipher.CreateEncryptor();
            byte[] plaintext = Encoding.UTF8.GetBytes(text);
            byte[] cipherText = cryptTransform.TransformFinalBlock(plaintext, 0, plaintext.Length);

            return Convert.ToBase64String(cipherText);
        }

        public string Decrypt(string encryptedText)
        {
            Aes cipher = CreateCipher(EncryptionKey);

            ICryptoTransform cryptTransform = cipher.CreateDecryptor();
            byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
            byte[] plainBytes = cryptTransform.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

            return Encoding.UTF8.GetString(plainBytes);
        }

        private Aes CreateCipher(string keyBase64)
        {
            // Default values: Keysize 256, Padding PKC27
            Aes cipher = Aes.Create();

            cipher.Mode = CipherMode.CBC;  // Ensure the integrity of the ciphertext if using CBC

            cipher.Padding = PaddingMode.PKCS7;
            cipher.Key = Convert.FromBase64String(keyBase64);

            return cipher;
        }
    }
}
