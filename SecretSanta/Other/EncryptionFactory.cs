using System.Security.Cryptography;
using System.Text;

namespace SecretSanta
{
    // Encryption helpers
    public class EncryptionFactory
    {
        public string Encrypt(string text, string IV, string key)
        {
            Aes cipher = CreateCipher(key);
            cipher.IV = Convert.FromBase64String(IV);

            ICryptoTransform cryptTransform = cipher.CreateEncryptor();
            byte[] plaintext = Encoding.UTF8.GetBytes(text);
            byte[] cipherText = cryptTransform.TransformFinalBlock(plaintext, 0, plaintext.Length);

            return Convert.ToBase64String(cipherText);
        }

        public string Decrypt(string encryptedText, string IV, string key)
        {
            Aes cipher = CreateCipher(key);
            cipher.IV = Convert.FromBase64String(IV);

            ICryptoTransform cryptTransform = cipher.CreateDecryptor();
            byte[] encryptedBytes = Convert.FromBase64String(encryptedText);
            byte[] plainBytes = cryptTransform.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

            return Encoding.UTF8.GetString(plainBytes);
        }

        public string InitSymmetricEncryptionIV(string encryptionKey)
        {
            Aes cipher = CreateCipher(encryptionKey);
            var IVBase64 = Convert.ToBase64String(cipher.IV);
            return IVBase64;
        }

        private string GetEncodedRandomString(int length)
        {
            var base64 = Convert.ToBase64String(GenerateRandomBytes(length));
            return base64;
        }

        private Aes CreateCipher(string keyBase64)
        {
            // Default values: Keysize 256, Padding PKC27
            Aes cipher = Aes.Create();
            cipher.Mode = CipherMode.CBC;  // Ensure the integrity of the ciphertext if using CBC

            cipher.Padding = PaddingMode.ISO10126;
            cipher.Key = Convert.FromBase64String(keyBase64);

            return cipher;
        }

        private byte[] GenerateRandomBytes(int length)
        {
            var byteArray = new byte[length];
            RandomNumberGenerator.Fill(byteArray);
            return byteArray;
        }
    }
}
