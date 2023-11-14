import { Column, Table, Model } from 'sequelize-typescript';

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

    @Column({
        unique: true,
    })
    giftingTo: string;

    @Column({
        unique: true,
    })
    decryptionCode: string;
}
