import fs from "fs";
import axios from "axios";
import { modWatcherConfig } from "../config/modwatcher.js";
import { logger } from "../utils/logger.js";

const STEAM_API = "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/";

let timestamps = {};

function loadTimestamps() {
    try {
        if (fs.existsSync(modWatcherConfig.storageFile)) {
            timestamps = JSON.parse(fs.readFileSync(modWatcherConfig.storageFile));
        }
    } catch (err) {
        logger.error("Failed to load timestamps:", err);
    }
}

function saveTimestamps() {
    try {
        fs.writeFileSync(modWatcherConfig.storageFile, JSON.stringify(timestamps, null, 2));
    } catch (err) {
        logger.error("Failed to save timestamps:", err);
    }
}

async function fetchModDetails(modIds) {
    const form = new URLSearchParams();
    form.append("itemcount", modIds.length);

    modIds.forEach((id, i) => {
        form.append(`publishedfileids[${i}]`, id);
    });

    const res = await axios.post(STEAM_API, form);
    return res.data.response.publishedfiledetails;
}

async function sendWebhook(mod) {
    await axios.post(modWatcherConfig.webhookUrl, {
        username: "DeadSec Mod Watcher",
        embeds: [
            {
                title: `🔧 Mod Updated: ${mod.title}`,
                url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.publishedfileid}`,
                color: 0x00aaff,
                fields: [
                    { name: "Mod ID", value: mod.publishedfileid, inline: true },
                    { name: "Updated", value: `<t:${mod.time_updated}:R>`, inline: true }
                ],
                thumbnail: { url: mod.preview_url }
            }
        ]
    });
}

async function checkMods() {
    try {
        const mods = await fetchModDetails(modWatcherConfig.modIds);

        for (const mod of mods) {
            const id = mod.publishedfileid;
            const updated = mod.time_updated;

            if (!timestamps[id]) {
                timestamps[id] = updated;
                continue;
            }

            if (updated > timestamps[id]) {
                logger.info(`Mod updated: ${mod.title}`);
                await sendWebhook(mod);
                timestamps[id] = updated;
            }
        }

        saveTimestamps();
    } catch (err) {
        logger.error("Mod watcher error:", err);
    }
}

export function startModWatcher() {
    loadTimestamps();
    logger.info("Mod watcher started.");

    checkMods(); // run immediately
    setInterval(checkMods, modWatcherConfig.pollIntervalMinutes * 60 * 1000);
}
