export class ReadUserDto {
    constructor(user: any) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.idCode = user.idCode;
        this.encryptionStrategy = user.encryptionStrategy;
        this.familyId = user.familyId;
        this.isAdmin = user.isAdmin;
    }
    
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly idCode: string;
    readonly encryptionStrategy: string;
    readonly familyId: number;
    readonly isAdmin: boolean;
    
}