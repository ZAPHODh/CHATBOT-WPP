import { create, Client, Message } from '@open-wa/wa-automate'
import { createCollector } from './functions/createCollector'
import { handleIgnore } from './functions/ignore'

const deal = async (client: Client, message: Message) => {
    await createCollector(
        client,
        message,
        'schedule',
        [
            {
                question: 'Seu nome',
                onError: 'nome inválido',
                deal: (client, message) => {
                    if (message.text) return true
                    false
                },
            },
            {
                question: 'Horário',
                onError: 'Horário inválido',
                deal: async (client, message) => {
                    if (message.text) {
                        return true
                    }
                    return false
                },
            },
        ],
        false
    )
    handleIgnore('remove', message)
    return false
}

const app = (client: Client) => {
    client.onAnyMessage(async (message: Message) => {
        const ignored = handleIgnore()
        if (message.text.includes('testar') && !ignored.includes(message.from))
            await createCollector(
                client,
                message,
                'Testando aqui',
                [
                    {
                        question: 'Agendar',
                        deal: deal,
                    },
                ],
                true
            )
    })
}

create().then((client) => app(client))
