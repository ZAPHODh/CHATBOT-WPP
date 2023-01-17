import { Message } from '@open-wa/wa-automate'

let ignore: string[] = []
export const handleIgnore = (
    order?: 'add' | 'remove' | 'removeCommand',
    message?: Message
) => {
    const send = message ? message.to : ''
    const from = message ? message.from : ''
    switch (order) {
        case 'add':
            ignore.push(from)
            return ignore
        case 'remove':
            ignore = ignore.filter((ignored) => ignored !== from)
            return ignore
        case 'removeCommand':
            ignore = ignore.filter((ignored) => ignored !== send)
            return ignore
        default:
            return ignore
    }
}
