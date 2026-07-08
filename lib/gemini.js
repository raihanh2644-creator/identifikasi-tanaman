const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_BODY_BYTES = 18 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = process.env.VERCEL ? 55000 : 90000;
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

disableBrokenLocalProxy();

function getStatus() {
    return {
        ready: Boolean(process.env.GEMINI_API_KEY),
        model: GEMINI_MODEL
    };
}

async function analyzePlant(body) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            payload: {
                error: "GEMINI_API_KEY belum diatur di Environment Variables Vercel."
            }
        };
    }

    if (!body.prompt || !Array.isArray(body.images) || body.images.length === 0) {
        return {
            statusCode: 400,
            payload: {
                error: "Request harus berisi prompt dan minimal satu gambar."
            }
        };
    }

    const totalImageBytes = body.images.reduce((total, image) => total + estimateBase64Bytes(image.data), 0);
    console.log(`Analisis AI: ${body.images.length} gambar, sekitar ${(totalImageBytes / 1024 / 1024).toFixed(2)} MB.`);

    const parts = [
        { text: body.prompt },
        ...body.images.map((image) => ({
            inline_data: {
                mime_type: image.mimeType || "image/jpeg",
                data: image.data
            }
        }))
    ];

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), GEMINI_TIMEOUT_MS);

    let geminiResponse;
    let geminiData;
    try {
        geminiResponse = await fetch(GEMINI_API_URL, {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                generationConfig: {
                    response_mime_type: "application/json"
                },
                contents: [{ parts }]
            })
        });

        geminiData = await geminiResponse.json();
    } catch (error) {
        const message = error.name === "AbortError"
            ? "Request ke Gemini timeout. Coba lagi beberapa saat atau gunakan foto yang lebih kecil."
            : `Tidak bisa menghubungi Gemini: ${error.message}`;
        return { statusCode: 503, payload: { error: message } };
    } finally {
        clearTimeout(timeout);
    }

    if (!geminiResponse.ok) {
        const message = geminiData.error?.message || "Gagal menghubungi Gemini.";
        return { statusCode: geminiResponse.status, payload: { error: message } };
    }

    try {
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = parseAiJson(textResponse);
        return { statusCode: 200, payload: parsed };
    } catch (error) {
        return { statusCode: 502, payload: { error: "Jawaban Gemini bukan JSON yang valid." } };
    }
}

function estimateBase64Bytes(value) {
    if (!value) return 0;
    const padding = String(value).endsWith("==") ? 2 : String(value).endsWith("=") ? 1 : 0;
    return Math.max(0, Math.floor((String(value).length * 3) / 4) - padding);
}

function parseAiJson(textResponse) {
    const cleanJson = String(textResponse || "")
        .replace(/```json|```/g, "")
        .trim();

    try {
        return JSON.parse(cleanJson);
    } catch (error) {
        const start = cleanJson.indexOf("{");
        const end = cleanJson.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(cleanJson.slice(start, end + 1));
        }
        throw error;
    }
}

function readJsonBody(req) {
    if (req.body !== undefined && req.body !== null) {
        if (Buffer.isBuffer(req.body)) {
            return Promise.resolve(JSON.parse(req.body.toString("utf8") || "{}"));
        }

        if (typeof req.body === "string") {
            return Promise.resolve(JSON.parse(req.body || "{}"));
        }

        return Promise.resolve(req.body);
    }

    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
            if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
                reject(new Error("Request terlalu besar."));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch (error) {
                reject(new Error("JSON request tidak valid."));
            }
        });

        req.on("error", reject);
    });
}

function disableBrokenLocalProxy() {
    ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"].forEach((key) => {
        const value = process.env[key] || "";
        if (/^https?:\/\/127\.0\.0\.1:9\/?$/i.test(value)) {
            delete process.env[key];
        }
    });
}

module.exports = {
    analyzePlant,
    getStatus,
    readJsonBody
};
