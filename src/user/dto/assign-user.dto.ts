import { User } from "../entities/user.entity";

export class AssignUserDto {
    constructor(partial?: Partial<User>) {
        if (partial)
            Object.assign(this, JSON.parse(JSON.stringify(partial)));
    }
    iv: string;
    giftingTo: string;
    decryptionCode: string;
    giftingToDebug: string;
}