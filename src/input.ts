import { readFileSync } from "fs";

export interface Member {
    name: string;
    email?: string;
}

export interface Family {
    members: Member[];
}

export interface Families extends Array<Family> { }

const getInputFamilies = () => JSON.parse(readFileSync(process.env.INPUT_FILE_PATH, 'utf8')) as Families;
export default getInputFamilies;
