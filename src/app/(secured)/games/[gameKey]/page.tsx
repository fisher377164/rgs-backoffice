export default async function GamePage({
                                               params,
                                           }: {
    params: Promise<{ gameKey: string }>
}) {
    const { gameKey } = await params
    return (
        <div>
            <h1>{gameKey}</h1>
            Game Page
        </div>
    )
}