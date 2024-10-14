import { Column, Table, Model, HasMany } from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entity';

@Table({
    tableName: 'family',
})
export class Family extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        unique: true,
    })
    name: string;

    @HasMany(() => User, 'familyId')
    members: User[];
}
