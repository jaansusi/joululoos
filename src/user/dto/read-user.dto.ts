export class ReadUserDto {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly restrictions: string[];
    readonly encryptionStrategy: string;
    readonly isAdmin: boolean;
}