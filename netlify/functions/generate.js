const fetch = require("node-fetch");

exports.handler = async function (event) {
    const { promptText, selectedModel, width, height } = JSON.parse(event.body);

    const API_KEY = process.env.HF_API_KEY;
    const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;

    try {
        const response = await fetch(MODEL_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "x-use-cache": "false",
            },
            body: JSON.stringify({
                inputs: promptText,
                parameters: { width, height },
                options: { wait_for_model: true, user_cache: false },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: error.error || "Generation failed." }),
            };
        }

        const imageBuffer = await response.buffer();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": "inline",
            },
            body: imageBuffer.toString("base64"),
            isBase64Encoded: true,
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
