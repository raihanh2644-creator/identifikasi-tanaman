const { analyzePlant, readJsonBody } = require("../lib/gemini");

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Method tidak didukung." });
    }

    try {
        const body = await readJsonBody(req);
        const result = await analyzePlant(body);
        return sendJson(res, result.statusCode, result.payload);
    } catch (error) {
        const message = error.message === "Request terlalu besar." || error.message === "JSON request tidak valid."
            ? error.message
            : "Server error.";
        return sendJson(res, error.message === "Request terlalu besar." ? 413 : 400, { error: message });
    }
};

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
}
