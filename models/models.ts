import { Table, Model, Column, DataType } from "sequelize-typescript"

@Table({
    timestamps: false,
    tableName: "tablet"
})

export class Tablet extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    nombre!: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    tipo!: string

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    image!: string
}