import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import getInputFamilies, { Member } from '../input';
import { InjectModel } from '@nestjs/sequelize';


export enum EncryptionStrategy {
    CODE = 'code',
    CDOC = 'cdoc',
    KEY = 'key',
}


@Injectable()
export class EncryptionService {
    public async encryptGiftingTo(user: User, giftingTo: string): Promise<string> {
        switch (user.encryptionStrategy) {
            case EncryptionStrategy.CODE:
                return this.encryptWithCode(giftingTo);
            case EncryptionStrategy.CDOC:
                return this.encryptWithCdoc(giftingTo);
            case EncryptionStrategy.KEY:
                return this.encryptWithKey(giftingTo);
            default:
                throw new Error('Invalid encryption strategy');
        }
    }

    public async decryptGiftingTo(user: User, giftingTo: string): Promise<string> {
        switch (user.encryptionStrategy) {
            case EncryptionStrategy.CODE:
                return this.decryptWithCode(giftingTo);
            case EncryptionStrategy.CDOC:
                throw new Error('CDOC decryption can not be done server-side');
            case EncryptionStrategy.KEY:
                throw new Error('KEY decryption can not be done server-side');
            default:
                throw new Error('Invalid encryption strategy');
        }
    }

    private encryptWithCode(input: string): string {
        //to-do: implement encryption
        return input;
    }

    private encryptWithCdoc(input: string): string {
        //to-do: implement encryption
        return input;
    }

    private encryptWithKey(input: string): string {
        //to-do: implement encryption
        return input;
    }

    private decryptWithCode(input: string): string {
        //to-do: implement decryption
        return input;
    }
}
