const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = __dirname;
disableBrokenLocalProxy();
loadEnvFile();

const PORT = Number(process.env.PORT || 8001);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_BODY_BYTES = 18 * 1024 * 1024;
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 90000);

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
    try {
        if (req.method === "GET" && req.url === "/api/status") {
            return sendJson(res, 200, {
                ready: Boolean(process.env.GEMINI_API_KEY),
                model: GEMINI_MODEL
            });
        }

        if (req.method === "POST" && req.url === "/api/analyze") {
            return handleAnalyze(req, res);
        }

        if (req.method === "GET" || req.method === "HEAD") {
            return serveStatic(req, res);
        }

        sendJson(res, 405, { error: "Method tidak didukung." });
    } catch (error) {
        console.error(error);
        sendJson(res, 500, { error: "Server error." });
    }
});

server.listen(PORT, () => {
    console.log(`LeafLens berjalan di http://localhost:${PORT}`);
});

async function handleAnalyze(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return sendJson(res, 500, {
            error: "GEMINI_API_KEY belum diisi di file .env."
        });
    }

    const body = await readJsonBody(req);
    if (!body.prompt || !Array.isArray(body.images) || body.images.length === 0) {
        return sendJson(res, 400, {
            error: "Request harus berisi prompt dan minimal satu gambar."
        });
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
        return sendJson(res, 503, { error: message });
    } finally {
        clearTimeout(timeout);
    }

    if (!geminiResponse.ok) {
        const message = geminiData.error?.message || "Gagal menghubungi Gemini.";
        return sendJson(res, geminiResponse.status, { error: message });
    }

    try {
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = parseAiJson(textResponse);
        sendJson(res, 200, parsed);
    } catch (error) {
        sendJson(res, 502, { error: "Jawaban Gemini bukan JSON yang valid." });
    }
}

function estimateBase64Bytes(value) {
    if (!value) return 0;
    const padding = String(value).endsWith("==") ? 2 : String(value).endsWith("=") ? 1 : 0;
    return Math.max(0, Math.floor((String(value).length * 3) / 4) - padding);
}

function serveStatic(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.resolve(ROOT_DIR, `.${decodeURIComponent(requestedPath)}`);

    if (!filePath.startsWith(ROOT_DIR)) {
        return sendJson(res, 403, { error: "Akses ditolak." });
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            return sendJson(res, 404, { error: "File tidak ditemukan." });
        }

        const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        if (req.method === "HEAD") return res.end();
        res.end(data);
    });
}

function readJsonBody(req) {
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

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(payload));
}

function loadEnvFile() {
    const envPath = path.join(ROOT_DIR, ".env");
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) return;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) process.env[key] = value;
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
