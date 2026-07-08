const { getStatus } = require("../lib/gemini");

module.exports = function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendJson(res, 405, { error: "Method tidak didukung." });
    }

    return sendJson(res, 200, getStatus());
};

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
}
