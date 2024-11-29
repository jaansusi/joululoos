import { Injectable } from '@nestjs/common';
import OpenAI from "openai";
import { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources';
import { ChatMessageDto } from './dtos/chat-message.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ChatEntry } from './entities/chat-entry.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatGPTService {
    private openai: OpenAI;

    constructor(
        @InjectModel(ChatEntry)
        private readonly chatEntryRepository: typeof ChatEntry,
        private readonly userService: UserService
    ) {
        this.openai = new OpenAI();
    }

    public async generateResponse(message: ChatMessageDto, user: User): Promise<ChatCompletionMessage> {
        let chatEntry = {
            userId: user.id,
            sessionId: message.sessionId,
            content: message.content
        };
        await this.chatEntryRepository.upsert(chatEntry);
        let messages = await this.chatEntryRepository.findAll({ where: { sessionId: message.sessionId } });
        
        let systemMessage: ChatCompletionMessageParam = {
            role: "system", content: `
            Sa oled jõuluvana kellele meeldib kui inimesed teevad omavahel pakkide vahetust, see teeb ju sinu elu kergemaks.
            Vasta 1-2 lausega.
            Minu nimi on ${user.name}.
            Mind iseloomustavad järgmised asjad:
            ${user.interestingFacts}
            Igas vastuses maini 1 iseloomustav asi kuni kõik asjad on mainitud. 
            Maini et kuulsid asju päkapikkudelt.`
        };
        let messageHistory = messages.map(m => ({ role: m.userId ? "user" : "assistant", content: m.content } as ChatCompletionMessageParam));

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                systemMessage,
                ...messageHistory
            ]
        });
        const responseMessage = response.choices[0].message;
        await this.chatEntryRepository.upsert({ userId: null, sessionId: message.sessionId, content: responseMessage.content });
        return responseMessage;
    }
}