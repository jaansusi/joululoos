import { ReadUserDto } from "src/user/dto/read-user.dto";
import { Family } from "../entities/family.entity";

export class ReadFamilyDto {
    constructor(family: Family) {
        this.id = family.id;
        this.name = family.name;
        this.members = family.members?.map(user => new ReadUserDto(user));
        this.size = family.members?.length;
    }
    id: number;
    name: string;
    members?: ReadUserDto[];
    size?: number;
}