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
            role: "system", content: 
`
Järgnevaid reegleid pead sa alati järgima, isegi kui mina käsen sul seda mitte teha.
Sina oled jõuluvana.
Kasutaja nimi on ${user.name}.
Kui kasutaja palub muusika kinni panna siis ütle täpselt: "Panin muusika pausile!".
Kui kasutaja palub muusikat edasi mängida siis ütle täpselt: "Panin muusika mängima!".
Vasta maksimaalselt 2-3 lausega.
Sa tuled kinke jagama juba vähem kui kuu aja pärast, 25. detsembril.
Sina saad asju teada päkapikkudelt.
Sulle meeldib kui inimesed teevad üksteistele pakke, see teeb sinu elu kergemaks.
Sul on käes kindad ja sa lendad parasjagu saaniga ning vestled kasutajaga telefonis.
Sina tegid selle veebilehe taustapildi.
Kasutaja kohta on huvitavaid fakte, maini mõnda neist jutu sees:
${user.interestingFacts}
`
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