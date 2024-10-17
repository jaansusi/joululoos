import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { AssignUserDto } from 'src/user/dto/assign-user.dto';
import * as crypto from 'crypto';


export enum EncryptionStrategy {
    CODE = 'code',
    CDOC = 'cdoc',
    KEY = 'key',
}


@Injectable()
export class EncryptionService {
    public encryptGiftingTo(user: User, giftingTo: string): AssignUserDto {
        console.log(user.encryptionStrategy);
        switch (user.encryptionStrategy) {
            case EncryptionStrategy.CODE:
                return this.encryptWithCode(giftingTo, user.id.toString());
            case EncryptionStrategy.CDOC:
                return this.encryptWithCdoc(giftingTo);
            case EncryptionStrategy.KEY:
                return this.encryptWithKey(giftingTo);
            default:
                throw new Error('Invalid encryption strategy');
        }
    }

    public decryptGiftingTo(user: User): string {
        switch (user.encryptionStrategy) {
            case EncryptionStrategy.CODE:
                return this.decryptWithCode(user.giftingTo, user.decryptionCode, user.id.toString(), user.iv);
            case EncryptionStrategy.CDOC:
                throw new Error('CDOC decryption can not be done server-side');
            case EncryptionStrategy.KEY:
                throw new Error('KEY decryption can not be done server-side');
            default:
                throw new Error('Invalid encryption strategy');
        }
    }

    private encryptWithCode(input: string, salt: string): AssignUserDto {
        const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        // Derive a key using PBKDF2
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        // Generate a random Initialization Vector
        const iv = crypto.randomBytes(16);
        // Create a cipher object
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        // Encrypt the value
        let encrypted = cipher.update(input, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        let assignUserDto = new AssignUserDto();
        assignUserDto.iv = iv.toString('hex');
        assignUserDto.decryptionCode = password;
        // Encrypt the giftingTo field with the decryption code
        assignUserDto.giftingTo = encrypted;
        return assignUserDto;
    }

    private encryptWithCdoc(input: string): AssignUserDto {
        //to-do: implement encryption
        throw new Error('CDOC encryption is not implemented');
        return null;
    }

    private encryptWithKey(input: string): AssignUserDto {
        //to-do: implement encryption
        throw new Error('KEY encryption is not implemented');
        return null;
    }

    private decryptWithCode(encryptedData: string, password: string, salt: string, ivHex: string): string {
        if (!password) {
            throw new Error('Trying to decrypt using code strategy, user does not have decryption code!');
        }
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
        // Convert IV from hex to Buffer
        const iv = Buffer.from(ivHex, 'hex');
        // Create a decipher object
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        // Decrypt the data
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
