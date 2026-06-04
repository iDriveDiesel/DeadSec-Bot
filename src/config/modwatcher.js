export const modWatcherConfig = {
    // How often to check for updates
    pollIntervalMinutes: 5,

    // Steam Workshop mod IDs to watch
    modIds: [
        "1559212036", // example
        "2289461232", // example
    ],

    // Your Discord webhook URL (we'll set this in a moment)
    webhookUrl: "YOUR_WEBHOOK_URL_HERE",

    // Where to store last-known timestamps
    storageFile: "./data/modTimestamps.json"
};
