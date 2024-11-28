import { Column, Table, Model, BelongsToMany, HasOne, BelongsTo, HasMany } from 'sequelize-typescript';
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

    // Used for debugging purposes, not populated in production
    @Column
    giftingToDebug: string;

    @Column
    decryptionCode?: string;

    @Column
    iv: string;

    @Column
    idCode: string;

    @Column({
        defaultValue: EncryptionStrategy.CODE,
        allowNull: false,
    })
    encryptionStrategy: string;

    @Column({
        defaultValue: false,
    })
    isAdmin: boolean;

    @Column
    familyId: number;

    @BelongsTo(() => Family, { foreignKey: 'familyId'})
    family: Family;

    @Column
    lastYearGiftingToId: number;

    // to-do: implement usage of this
    @HasMany(() => UserHistoricalEntry, { foreignKey: 'id'})
    historicalEntries: UserHistoricalEntry[];
}

// to-do: implement usage of this
@Table({
    tableName: 'userHistoricalEntry',
})
export class UserHistoricalEntry extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @BelongsTo(() => User, { foreignKey: 'id'})
    userId: number;

    @Column
    userName: number;

    // For manual entry, ideally calculates the hash and does not store the plaintext
    @Column
    giftingTo: string;

    @Column
    giftingToHash: string;

    @Column
    createdAt: Date;
}