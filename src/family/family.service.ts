import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Family } from './entities/family.entity';

@Injectable()
export class FamilyService {
    constructor(
        @InjectModel(Family)
        private familyRepository: typeof Family,
    ) { }

    async findAll(options?: any) {
        return this.familyRepository.findAll(options);
    }

    async findOne(options: any) {
        return this.familyRepository.findOne(options);
    }

    async createFamily(family: Family) {
        return this.familyRepository.create({
            name: family.name
        });
    }
}