import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import getInputFamilies, { Member } from '../input';
import { InjectModel } from '@nestjs/sequelize';
import { EncryptionService, EncryptionStrategy } from 'src/encryption/encryption.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FamilyService } from 'src/family/family.service';
import { AssignUserDto } from 'src/user/dto/assign-user.dto';

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
        this.shuffledParticipants = this.unbiasedShuffle(participants);
        const generatedPath = await this.generateGraphPath(this.shuffledParticipants, 1);
        if (generatedPath.length !== this.shuffledParticipants.length) {
            return false;
        }
        for (let i = 0; i < generatedPath.length; i++) {
            const nextIndex = i === generatedPath.length - 1 ? 0 : i + 1;
            try {
                let user = this.shuffledParticipants[i];
                // To-do: remove dots only from the first part, not the whole email. 
                // Also, don't save the email in the user object as we want to use it to send an e-mail in the future.
                
                // Remove dots and spaces from email. Google sometimes leaves dots in, sometimes not.
                if (user.email)
                    user.email = user.email.toLowerCase().replace(/\./g, '').replace(/\s/g, '');
                
                let assignUserDto = new AssignUserDto();
                assignUserDto.giftingTo = await this.encriptionService.encryptGiftingTo(user, generatedPath[nextIndex].name);
                this.userService.updateUsersAssignment(user.id, assignUserDto);
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
        // console.log(`Current node: ${currentNode}`);
        // console.log(`Remaining nodes: ${remainingNodes}`);
        const forbiddenPathsFromThisNode = await this.generateAllForbiddenPaths(currentNode, remainingNodes);
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
            const path = await this.generateGraphPath(recursiveNodes, depth + 1);
            if (path.length === remainingNodes.length) {
                return [currentNode, ...path];
            }
        }
        return [];
    }

    private async generateAllForbiddenPaths(node: User, remainingNodes: User[]): Promise<User[]> {
        let families = await this.familyService.findAll();
        for (let family of families) {
            if (family.members.map(x => x.name).includes(node.name)) {
                return family.members;
            }
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
        const users = await this.userService.findAll();
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