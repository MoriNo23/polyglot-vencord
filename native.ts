/*
 * Native helper for Polyglot API requests to bypass CSP
 */

import { IpcMainInvokeEvent } from "electron";

export async function makeGeminiRequest(
    _: IpcMainInvokeEvent,
    apiKey: string,
    model: string,
    prompt: string
): Promise<{ status: number; data: string }> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

export async function makeDatamuseRequest(
    _: IpcMainInvokeEvent,
    word: string
): Promise<{ status: number; data: string }> {
    try {
        const response = await fetch(
            `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`
        );
        const data = await response.text();
        return { status: response.status, data };
    } catch (e) {
        return { status: -1, data: String(e) };
    }
}

export async function makeDictionaryRequest(
    _: IpcMainInvokeEvent,
    word: string
): Promise<{ status: number; data: string }> {
    try {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );
        const data = await response.text();
        return { status: response.status, data };
    } catch (e) {
        return { status: -1, data: String(e) };
    }
}