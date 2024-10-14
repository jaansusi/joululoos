export class CreateUserDto {
    id: number;
    name: string;
    email: string;
    encryptionStrategy: string;
    familyId: number;
    isAdmin: boolean;
}