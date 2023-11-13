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

    @Column
    name: string;

    @Column
    email: string;

    @Column
    giftingTo: string;

    @Column
    salt: string;
}
