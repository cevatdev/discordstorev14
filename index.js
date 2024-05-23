const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Discord Developer Portal'dan aldığınız bot token'ı buraya koyun

// Discord Developer Portal'dan aldığınız uygulama ID'sini (Client ID) buraya koyun
const CLIENT_ID = '1243133591815323690';
// Komutları belirli bir sunucuya eklemek için sunucu ID'sini buraya koyun
const GUILD_ID = '1233122881659994162';

const commands = [
    new SlashCommandBuilder()
        .setName('urunekle')
        .setDescription('Yeni bir ürün ekleyin')
        .addStringOption(option => 
            option.setName('urunismi')
                .setDescription('Ürünün ismi')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('urunresimi')
                .setDescription('Ürünün resim URL\'si')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('urunaciklamasi')
                .setDescription('Ürünün açıklaması')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('urunfiyati')
                .setDescription('Ürünün fiyatı')
                .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand() && interaction.commandName === 'urunekle') {
        const urunismi = interaction.options.getString('urunismi');
        const urunresimi = interaction.options.getString('urunresimi');
        const urunaciklamasi = interaction.options.getString('urunaciklamasi');
        const urunfiyati = interaction.options.getString('urunfiyati');

        const embed = new EmbedBuilder()
            .setTitle(urunismi)
            .setDescription(urunaciklamasi)
            .setColor(0x0099ff)
            .setImage(urunresimi)
            .addFields({ name: 'Fiyat', value: urunfiyati, inline: false });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_button')
                    .setLabel('Satın Al')
                    .setStyle(ButtonStyle.Primary),
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    } else if (interaction.isButton() && interaction.customId === 'buy_button') {
        const channelName = `ticket-${interaction.user.username}`;

        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                {
                    id: client.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle('Ticket')
            .setDescription('Bu kanalda sorularınızı sorabilirsiniz. Kapatmak için aşağıdaki düğmeyi kullanın.')
            .setColor(0x0099ff);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_button')
                    .setLabel('Kapat ve Sil')
                    .setStyle(ButtonStyle.Danger),
            );

        await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Özel bir kanal oluşturuldu.', ephemeral: true });
    } else if (interaction.isButton() && interaction.customId === 'close_button') {
        const channel = interaction.channel;
        await channel.delete();
    }
});

client.login(process.env.token);