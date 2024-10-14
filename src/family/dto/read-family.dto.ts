import { ReadUserDto } from "src/user/dto/read-user.dto";

export class ReadFamilyDto {
    name: string;
    members: ReadUserDto[];
}