import { Model, Column, Table } from "sequelize-typescript";

@Table({
    tableName: 'chatEntry',
})
export class ChatEntry extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column
    userId?: number;

    @Column
    sessionId: string;

    @Column({
        type: 'TEXT',
    })
    content: string;
}