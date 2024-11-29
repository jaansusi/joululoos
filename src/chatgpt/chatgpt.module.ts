import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatGPTService } from './chatgpt.service';
import { ChatGPTController } from './chatgpt.controller';
import { UserModule } from 'src/user/user.module';
import { ChatEntry } from './entities/chat-entry.entity';

@Module({
    controllers: [ChatGPTController],
    imports: [SequelizeModule.forFeature([ChatEntry]), UserModule],
    providers: [ChatGPTService],
    exports: [ChatGPTService],
})
export class ChatGPTModule { }