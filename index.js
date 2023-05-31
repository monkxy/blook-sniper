(async () => {
    const WebSocket = require("ws");
    const axios = require("axios");
    const config = require("./config")

    sid = (await axios.default.post("https://blacket.org/worker/login", {
        username: config.user.username,
        password: config.user.password,
    })).headers["set-cookie"][0].split(";")[0];

    let ws = new WebSocket("wss://blacket.org/worker/socket", {
        headers: {
            Cookie: sid
        },
    });

    ws.on("open", () => {
        console.log("Connected to WebSocket");
        setInterval(() => {
            ws.send(JSON.stringify({
                type: "heartbeat",
                data: "ping",
            }));
        }, 10000);
    });

    const bazaar = (await axios.default.get(`https://blacket.org/worker/bazaar?item=${config.bazaar.item}`)).data;
    for (let i = 0; i < bazaar.bazaar.length; i++) {
        if (bazaar.bazaar[i].price < config.bazaar.maxprice && bazaar.bazaar[i].price > config.bazaar.minprice) {
            console.log(`[Sniper] Buying ${bazaar.bazaar[i].item} for ${bazaar.bazaar[i].price} tokens.`);
            await axios.default.post("https://blacket.org/worker/bazaar/buy", {
                id: bazaar.bazaar[i].id
            }, {
                headers: {
                    Cookie: sid
                }
            });
            await new Promise(r => setTimeout(r, 250));
        }
    }
})();
