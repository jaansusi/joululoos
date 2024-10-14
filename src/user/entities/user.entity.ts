import { Column, Table, Model, BelongsToMany, HasOne } from 'sequelize-typescript';
import { EncryptionStrategy } from 'src/encryption/encryption.service';
import { Family } from 'src/family/entities/family.entity';

@Table({
    tableName: 'user',
})
export class User extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        unique: true,
    })
    name: string;

    @Column({
        unique: true,
    })
    email: string;

    @Column
    giftingTo: string;

    @Column({
        unique: true,
    })
    decryptionCode: string;

    @Column({
        defaultValue: EncryptionStrategy.CODE,
    })
    encryptionStrategy: string;

    @Column({
        defaultValue: false,
    })
    isAdmin: boolean;

    @HasOne(() => Family, 'id')
    family: Family;
}
