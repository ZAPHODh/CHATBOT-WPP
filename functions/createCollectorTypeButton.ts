import {
    Client,
    Message,
    CollectorOptions,
    Collection,
} from '@open-wa/wa-automate' // importing wa types
import { handleIgnore } from './ignore'
import { options } from './createCollector'
import { b64ify } from '../utils/b64ify'

export const createCollector = async (
    client: Client,
    message: Message,
    firstMessage: string,
    options: options[],

    shouldIgnore = false,

    config: CollectorOptions = { time: 60 * 1000, max: 5 }
) => {
    shouldIgnore ? handleIgnore('add', message) : null

    let counterOfQuestions = 0

    const filter = (m: Message) => m.from === message.from

    const collector = client.createMessageCollector(
        message.from,
        filter,
        config
    )
    await client.sendListMessage(
        message.from,
        [
            {
                title: 'Escolha o que deseja',
                rows: options.map((option) => ({
                    title: option.question,
                    description: option.question,
                    rowId: b64ify(option.question),
                })),
            },
        ],
        `${firstMessage}`,
        'Escolha o que deseja',
        'Opções'
    )
    collector.on('collect', async (m: Message) => {
        counterOfQuestions++

        if (counterOfQuestions === config.max) {
            await client.sendText(
                message.from,
                'Número máximo de tentativas alcançado. Estamos encerrando a aplicação.'
            )
            handleIgnore('remove', message)
            return
        }
        const chosenMessage = options.filter(
            (option) => option.question === m.text
        )

        if (chosenMessage.length === 0) {
            await client.sendText(
                message.from,
                'Por favor, selecione uma opção válida'
            )
            return
        }
        await chosenMessage[0].deal(client, message)
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
