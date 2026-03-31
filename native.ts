import { IpcMainInvokeEvent } from "electron";

export async function makeGeminiRequest(
    _: IpcMainInvokeEvent,
    apiKey: string,
    model: string,
    prompt: string
): Promise<{ status: number; data: string }> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.text();
        return { status: response.status, data };
    } catch (e) {
        return { status: -1, data: String(e) };
    }
}
