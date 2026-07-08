const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { analyzePlant, getStatus, readJsonBody } = require("./lib/gemini");

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 8001);

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
            return sendJson(res, 200, getStatus());
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
    try {
        const body = await readJsonBody(req);
        const result = await analyzePlant(body);
        return sendJson(res, result.statusCode, result.payload);
    } catch (error) {
        const statusCode = error.message === "Request terlalu besar." ? 413 : 400;
        return sendJson(res, statusCode, { error: error.message || "Request tidak valid." });
    }
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

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify(payload));
}
