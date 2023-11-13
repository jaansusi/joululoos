import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import inputFamilies, { Families } from '../input';

@Injectable()
export class AdminService {
    private shuffledParticipants: string[] = [];
    public getSantas(): Families {
        return inputFamilies;
    }

    public generateSantas(): string[] {
        // console.log('+++++++++++++');
        const participants = this.getAllInputParticipants();
        this.shuffledParticipants = this.unbiasedShuffle(participants);
        const generatedPath = this.generateGraphPath(this.shuffledParticipants.map(x => x), 1);
        if (generatedPath.length !== this.shuffledParticipants.length) {
            return [];
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
        for (let family of inputFamilies) {
            if (family.members.map(x => x.name).includes(node)) {
                return family.members.map(x => x.name);
            }
        }
        return [];
    }

    private getAllInputParticipants(): string[] {
        return inputFamilies.map((family) => family.members.map((member) => member.name)).flat();
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
}