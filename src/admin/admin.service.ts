import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import inputFamilies, { Families } from '../input';

@Injectable()
export class AdminService {
    private allParticipants = inputFamilies.map((family) => family.members.map((member) => member.name)).flat();
    
    public getSantas(): Families {
        return inputFamilies;
    }

    public generateSantas(): string[] {

        return this.generateGraphPath(this.unbiasedShuffle(this.allParticipants));
    }

    private generateGraphPath(remainingNodes: string[]): string[] {
        const currentNode = remainingNodes[0];
        const forbiddenPathsFromThisNode = this.generateForbiddenPaths(currentNode, remainingNodes);
        const possiblePathsFromThisNode = remainingNodes.filter(x => !forbiddenPathsFromThisNode.includes(x));

        if (remainingNodes.length === 1) {
            // return [];
            // Reached the last node on the list, validate that it has a path to the first.
            if (!forbiddenPathsFromThisNode.includes(this.allParticipants[0])) {
                return [currentNode];
            } else {
                return [];
            }
        }
        for (let node of possiblePathsFromThisNode) {
            const recursiveNodes = remainingNodes.filter(x => x !== node);
            const path = this.generateGraphPath(recursiveNodes);
            if (path.length === remainingNodes.length - 1) {
                return [node, ...path];
            }
        }
        return [];
    }

    private generateForbiddenPaths(node: string, remainingNodes: string[]): string[] {
        for (let family of inputFamilies) {
            if (family.members.map(x => x.name).includes(node)) {
                // Find nodes that are in the same family as this node.
                const othersinFamily = family.members.filter(member => member.name !== node).map(x => x.name);
                // Filter out nodes that are in the same family as this node.
                return remainingNodes.filter(remainingNode => !othersinFamily.includes(remainingNode) && remainingNode !== node);
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
}