import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import familiesInput from '../input';

describe('AdminService', () => {
    let adminService: AdminService;
    const cycleCount: number = 1000;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [AdminService],
        }).compile();

        adminService = app.get<AdminService>(AdminService);
    });

    describe('validate the santa list', () => {
        it('santas should have all participants', () => {
            for (let i = 0; i < cycleCount; i++) {
                const santas = adminService.generateSantas();
                for (let family of familiesInput) {
                    for (let member of family.members) {
                        expect(santas.includes(member.name)).toBe(true);
                    }
                }
            }
        });

        it('no blocked connections', () => {
            // Generate blocklist for each person in the list.
            let blocklist = {};
            for (let family of familiesInput) {
                for (let member of family.members) {
                    blocklist[member.name] = family.members.map(x => x.name).filter(x => x !== member.name);
                }
            }
            for (let i = 0; i < cycleCount; i++) {
                const santas = adminService.generateSantas();
                for (let j = 0; j < santas.length; j++) {
                    const prevIndex = j === 0 ? santas.length - 1 : j - 1;
                    const nextIndex = j === santas.length - 1 ? 0 : j + 1;
                    expect(blocklist[santas[j]].includes(santas[prevIndex])).toBe(false);
                    expect(blocklist[santas[j]].includes(santas[nextIndex])).toBe(false);
                }
            }
        });

    });
});
