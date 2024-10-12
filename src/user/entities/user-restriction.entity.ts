import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
    tableName: 'user_restriction',
})
export class UserRestriction extends Model {
    @ForeignKey(() => User)
    @Column
    userId: number;

    @ForeignKey(() => User)
    @Column
    restrictionId: number;
}