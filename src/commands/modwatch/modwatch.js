import { SlashCommandBuilder } from "discord.js";
import { forceCheckMods } from "../../services/modWatcher.js";

export default {
    data: new SlashCommandBuilder()
        .setName("modwatch")
        .setDescription("Mod watcher commands")
        .addSubcommand(sub =>
            sub
                .setName("forcecheck")
                .setDescription("Force the mod watcher to run immediately")
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === "forcecheck") {
            await interaction.deferReply({ ephemeral: true });

            const result = await forceCheckMods();

            if (result.error) {
                return interaction.editReply(`❌ Error: ${result.error}`);
            }

            if (result.updated) {
                return interaction.editReply(
                    `✅ Force-check complete.\nUpdated mods:\n- ${result.updates.join("\n- ")}`
                );
            }

            return interaction.editReply("✅ Force-check complete. No new updates found.");
        }
    }
};
