export const b64ify = (word: string) => {
    const obj = { word }
    return Buffer.from(JSON.stringify(obj)).toString('base64')
}
