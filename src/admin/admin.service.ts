import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import getInputFamilies, { Member } from '../input';
import { InjectModel } from '@nestjs/sequelize';
import { EncryptionService, EncryptionStrategy } from 'src/encryption/encryption.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FamilyService } from 'src/family/family.service';
import { AssignUserDto } from 'src/user/dto/assign-user.dto';
import { Family } from 'src/family/entities/family.entity';

@Injectable()
export class AdminService {
    private shuffledParticipants: User[] = [];

    constructor(
        private userService: UserService,
        private familyService: FamilyService,
        private encriptionService: EncryptionService
    ) { }


    public async assignSantas(): Promise<boolean> {
        const participants = await this.userService.findAll();
        // console.log('-------------------');
        // console.log(`Participants: ${participants.map(x => x.name)}`);
        this.shuffledParticipants = this.unbiasedShuffle(participants);
        // console.log(`Shuffled participants: ${this.shuffledParticipants.map(x => x.name)}`);
        // Generate deep copy of shuffled participants to avoid modifying the original list.
        const generatedPath = await this.generateGraphPath(JSON.parse(JSON.stringify(this.shuffledParticipants)), 1);
        // console.log('-------------------');
        // console.log(`Generated path: ${generatedPath.map(x => x.name)}`);
        // console.log(`Shuffled participants: ${this.shuffledParticipants.map(x => x.name)}`);
        if (generatedPath.length !== this.shuffledParticipants.length) {
            return false;
        }
        for (let i = 0; i < generatedPath.length; i++) {
            const nextIndex = i === generatedPath.length - 1 ? 0 : i + 1;
            try {
                let user = this.shuffledParticipants[i];
                let giftingTo = generatedPath[nextIndex].name;
                let assignUserDto = await this.encriptionService.encryptGiftingTo(user, giftingTo);
                console.log(assignUserDto);
                await this.userService.updateUser(user.id, assignUserDto);
            } catch (e) {
                console.log('--------------')
                console.log(e);
            }
        }
        return true;
    }

    private async generateGraphPath(remainingNodes: User[], depth: number): Promise<User[]> {
        // console.log('-------------------');
        // console.log(`Depth: ${depth}`);
        const currentNode = remainingNodes.shift();
        // console.log(`Current node: ${currentNode.name}`);
        // console.log(`Remaining nodes: ${remainingNodes.map(x => x.name)}`);
        const forbiddenPathsFromThisNode = await this.generateAllForbiddenPaths(currentNode, remainingNodes);
        // console.log(`Forbidden paths: ${forbiddenPathsFromThisNode.map(x => x.name)}`);
        const possiblePathsFromThisNode = remainingNodes.filter(x => !forbiddenPathsFromThisNode.includes(x));
        // console.log(`Possible paths: ${possiblePathsFromThisNode.map(x => x.name)}`);
        if (remainingNodes.length === 0) {
            // Reached the last node on the list, validate that it has a path to the first.
            let firstNode = this.shuffledParticipants[0];
            return !forbiddenPathsFromThisNode.includes(firstNode) ? [currentNode] : [];
        }
        for (let node of possiblePathsFromThisNode) {
            // Move the node to the front of the list.
            let recursiveNodes = remainingNodes.filter(x => x !== node);
            recursiveNodes.unshift(node);
            const path = await this.generateGraphPath(recursiveNodes, depth + 1);
            if (path.length === remainingNodes.length) {
                return [currentNode, ...path];
            }
        }
        console.log('No path found');
        return [];
    }

    private async generateAllForbiddenPaths(node: User, remainingNodes: User[]): Promise<User[]> {
        if (node.family) {
            let familiy = await this.familyService.findOne({ where: { id: node.family.id }, include: [{ model: User }] });
            return familiy.members.filter(x => x.id !== node.id);
        }
        return [];
    }

    private unbiasedShuffle(array: User[]): User[] {
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
        const users = await this.userService.findAll({ include: [{ model: Family }] });
        let names = users.map(x => x.name).sort();
        let designatedSantas = users.map(x => x.giftingTo).sort();
        const allPeopleGiftToAUniquePerson = new Set(designatedSantas).size === users.length;
        let allPeopleGiftToSomeoneNotInTheirFamily = true;
        for (let user of users) {
            if (user.family) {
                let family = await this.familyService.findOne({ where: { id: user.family.id }, include: [{ model: User }] });
                let userFamilyNames = family.members.map(x => x.name);
                if (userFamilyNames && userFamilyNames.includes(user.giftingTo)) {
                    allPeopleGiftToSomeoneNotInTheirFamily = false;
                    break;
                }
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