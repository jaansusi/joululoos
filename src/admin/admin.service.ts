import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import getInputFamilies, { Member } from '../input';
import { InjectModel } from '@nestjs/sequelize';
import { exec } from "child_process";

@Injectable()
export class AdminService {
    private shuffledParticipants: string[] = [];

    constructor(
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }


    public async generateSantas(): Promise<string[]> {
        const participants = this.getAllInputParticipants();
        this.shuffledParticipants = this.unbiasedShuffle(participants);
        const generatedPath = this.generateGraphPath(this.shuffledParticipants.map(x => x), 1);
        if (generatedPath.length !== this.shuffledParticipants.length) {
            return [];
        }
        await this.userRepository.truncate();
        for (let i = 0; i < generatedPath.length; i++) {
            const nextIndex = i === generatedPath.length - 1 ? 0 : i + 1;
            try {
                let userInput = this.lookUpAdditionalInfo(generatedPath[i]);
                // Remove dots and spaces from email. Google sometimes leaves dots in, sometimes not.
                if (userInput.email)
                    userInput.email = userInput.email.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
                this.userRepository.create({
                    name: generatedPath[i],
                    giftingTo: generatedPath[nextIndex],
                    decryptionCode: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    ...userInput
                });
                await new Promise((resolve, reject) => {
                    exec("bash ./infra/encrypt.sh " + userInput.id_code + " " + generatedPath[i] + " " + generatedPath[nextIndex], function(
                        error, stdout, stderr
                    ) {
                        console.log(stdout);
                        
                        if (error !== null) {
                            console.log('exec error: ' + error);
                            return reject(error);
                        }
                        return resolve(stdout);
                    });
                });
            } catch (e) {
                console.log(e);
            }
        }
        return generatedPath;
    }

    private generateGraphPath(remainingNodes: string[], depth: number): string[] {
        // console.log('-------------------');
        // console.log(`Depth: ${depth}`);
        const currentNode = remainingNodes.shift();
        // console.log(`Current node: ${currentNode}`);
        // console.log(`Remaining nodes: ${remainingNodes}`);
        const forbiddenPathsFromThisNode = this.generateAllForbiddenPaths(currentNode, remainingNodes);
        // console.log(`Forbidden paths: ${forbiddenPathsFromThisNode}`);
        const possiblePathsFromThisNode = remainingNodes.filter(x => !forbiddenPathsFromThisNode.includes(x));
        // console.log(`Possible paths: ${possiblePathsFromThisNode}`);
        if (remainingNodes.length === 0) {
            // Reached the last node on the list, validate that it has a path to the first.
            let firstNode = this.shuffledParticipants[0];
            return !forbiddenPathsFromThisNode.includes(firstNode) ? [currentNode] : [];
        }
        for (let node of possiblePathsFromThisNode) {
            // Move the node to the front of the list.
            let recursiveNodes = remainingNodes.filter(x => x !== node);
            recursiveNodes.unshift(node);
            const path = this.generateGraphPath(recursiveNodes, depth + 1);
            if (path.length === remainingNodes.length) {
                return [currentNode, ...path];
            }
        }
        return [];
    }

    private generateAllForbiddenPaths(node: string, remainingNodes: string[]): string[] {
        for (let family of getInputFamilies()) {
            if (family.members.map(x => x.name).includes(node)) {
                return family.members.map(x => x.name);
            }
        }
        return [];
    }

    private getAllInputParticipants(): string[] {
        return getInputFamilies().map((family) => family.members.map((member) => member.name)).flat();
    }

    private lookUpAdditionalInfo(name: string): Member {
        for (let family of getInputFamilies()) {
            const memberIndex = family.members.map(x => x.name).indexOf(name);
            if (memberIndex !== -1) {
                return family.members[memberIndex];
            }

        }
    }

    private unbiasedShuffle(array: string[]): string[] {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex > 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    public async validateSantas(): Promise<any> {
        const users = await this.userRepository.findAll();
        let names = users.map(x => x.name).sort();
        let designatedSantas = users.map(x => x.giftingTo).sort();
        const allPeopleGiftToAUniquePerson = new Set(designatedSantas).size === users.length;
        let allPeopleGiftToSomeoneNotInTheirFamily = true;
        for (let user of users) {
            let userFamily = getInputFamilies().filter(x => x.members.map(y => y.name).includes(user.name))[0];
            let userFamilyNames = userFamily.members.map(x => x.name);
            if (userFamilyNames.includes(user.giftingTo)) {
                allPeopleGiftToSomeoneNotInTheirFamily = false;
                break;
            }
        }
        const secretNameArray = users.map(x => x.name);
        let response = {
            namesAndSantasMatch: JSON.stringify(names) === JSON.stringify(designatedSantas),
            allPeopleGiftToAUniquePerson: allPeopleGiftToAUniquePerson,
            allPeopleGiftToSomeoneNotInTheirFamily: allPeopleGiftToSomeoneNotInTheirFamily,
            usersIdsAndTheirDesignatedSantas: users.map(x => (secretNameArray.indexOf(x.name).toString() + '-' + secretNameArray.indexOf(x.giftingTo).toString())),
            names: names,
            designatedSantas: designatedSantas,
        };
        return response;
    }
}