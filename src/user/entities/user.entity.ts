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

    @Column({
        unique: true,
    })
    decryptionCode: string;

    @Column
    iv: string;

    @Column
    idCode: string;

    @Column({
        defaultValue: EncryptionStrategy.CODE,
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

    @HasMany(() => UserHistoricalEntry, { foreignKey: 'id'})
    historicalEntries: UserHistoricalEntry[];
}

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

    @Column
    giftingToHash: string;

    @Column
    createdAt: Date;
}