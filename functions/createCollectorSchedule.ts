import { Client, CollectorOptions, Message } from '@open-wa/wa-automate'
import { options } from './createCollector'
import { handleIgnore } from './ignore'

export const createCollectorSchedule = async (
    client: Client,
    message: Message,
    options: options[],
    shouldIgnore = false,
    config: CollectorOptions = { time: 60 * 1000, max: 5 }
) => {
    shouldIgnore ? handleIgnore('add', message) : null

    let counterToActualScheduleQuestion = 0
    let errorCounter = 0

    const filter = (m: Message) => m.from === message.from

    const collector = client.createMessageCollector(
        message.from,
        filter,
        config
    )

    await client.sendText(message.from, options[0].question)

    collector.on('collect', async (m: Message) => {
        if (errorCounter >= 5) {
            await client.sendText(
                message.from,
                'Número máximo de erros alcançado. estamos finalizando a operação'
            )
            collector.stop()
            return
        }
        const ok = await options[counterToActualScheduleQuestion].deal(
            client,
            m
        )

        if (!ok) {
            errorCounter++

            await client.sendText(
                message.from,
                options[counterToActualScheduleQuestion].onError as string
            )
            return
        }

        counterToActualScheduleQuestion++

        if (counterToActualScheduleQuestion >= options.length) {
            await client.sendText(
                message.from,
                'Agendamento finalizado com sucesso'
            )
            collector.stop()
            return
        }

        await client.sendText(
            message.from,
            options[counterToActualScheduleQuestion].question
        )

        return
    })
}
