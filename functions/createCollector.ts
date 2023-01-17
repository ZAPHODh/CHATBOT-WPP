import {
    Client,
    Message,
    CollectorOptions,
    Collection,
} from '@open-wa/wa-automate' // importing wa types

import { handleIgnore } from './ignore'

export type options = {
    question: string
    onError?: string
    deal: (
        client: Client,
        message: Message
    ) => void | boolean | Promise<boolean> | Promise<void>
}

//generic MessageCollector generator
export const createCollector = async (
    client: Client,
    message: Message,
    firstMessage: string,
    options: options[],
    shouldIgnore = false,
    config: CollectorOptions = { time: 60 * 1000, max: 5 }
) => {
    shouldIgnore ? handleIgnore('add', message) : null

    let counterToActualQuestion = 0

    const filter = (m: Message) => m.from === message.from

    const collector = client.createMessageCollector(
        message.from,
        filter,
        config
    )

    await client.sendText(
        message.from,
        `${firstMessage}${options.map(
            (option, index) => `\n${index + 1} - ${option.question}`
        )}`
    )
    collector.on('collect', async (m: Message) => {
        counterToActualQuestion++

        if (counterToActualQuestion === config.max) {
            await client.sendText(
                message.from,
                'Número máximo de tentativas alcançado. Estamos encerrando a aplicação.'
            )
            handleIgnore('remove', message)
            return
        }
        const chooseMessage = options.filter(
            (option, index) => index + 1 == Number(m.text)
        )
        if (chooseMessage.length === 0) {
            await client.sendText(
                message.from,
                'Por favor, selecione uma opção válida'
            )
            return
        }
        await chooseMessage[0].deal(client, message)
        collector.stop()
    })
    collector.on('end', async (allMessage: Collection<string, Message[]>) => {
        if (allMessage.size === 0) {
            await client.sendText(
                message.from,
                'Ops, nenhuma resposta identificada. Estamos encerrando o atendimento.'
            )
            handleIgnore('remove', message)
            return
        }
    })

    return
}
