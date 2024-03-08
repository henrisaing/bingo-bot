//StAuth10222: I Henri Saing, 000132162 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

//NOTE: the api I'm using is BAD (I wrote it), could not figure a quick way around csrf token requirement, had to do pseudo post requests via get
//api also does not require a token
//api used http://bingo.uisnotc.com/api
const {Client, GatewayIntentBits} = require('discord.js');
const dotenv = require('dotenv').config();
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', function(){
    console.log(`logged in as ${client.user.tag}`);
});

client.on('messageCreate',async function(message){
    if(!message.author.bot){
        const command = message.content.split(' ');
        console.log(command);
        if(command[0].toLowerCase() == "bingobot"){
            if(command[1] == null ||command[1].toLowerCase() == "help" || command[1].toLowerCase() == "?"){
                message.reply(
                    "Commands list \n"
                    +"==============\n"
                    +"bingobot getall\n"
                    +"bingobot get {int collectionID}\n"
                    +"bingobot add {int collectionID} {string 'tile'} {int chance}\n"
                    +"bingobot update {int tileID} {string 'tile'} {int chance}\n"
                    +"bingobot create {string 'collection name'} {string 'public|private'}\n"
                    +"bingobot getcard {int 'collection id'}\n"
                );
            }else if(command[1].toLowerCase() == "getall"){
                var info = await axios.get('http://bingo.uisnotc.com/api/getall');
                var msg = "Here are all the Bingo Groups you have access to:";
                info.data.forEach(group => {
                    msg += "\n"+group.name +" ID:"+group.id;
                });

                message.reply(msg);
            }else if(command[1].toLowerCase() == "get"){
                var info = await axios.get(`http://bingo.uisnotc.com/api/${command[2]}`);
                var msg = "The tiles for this group are: ";
                console.log(info.data);
                info.data.forEach(item=>{
                    msg += "\n name:"+item.name +" ID:"+item.id+" chance:"+item.chance;
                });
                message.reply(msg);
            }else if(command[1].toLowerCase() == "getcard"){
                var info = await axios.get(`http://bingo.uisnotc.com/api/${command[2]}/card`);

                message.reply(`Here's your bingo card! ${info.data}`);
            }else if(command[1].toLowerCase() == "create"){
                var name = command[2].replaceAll("_", " ");
                var public = command[3];
                if(public != "public" && public != "private"){
                    public = "public";
                }
                var out = await axios.get(`http://bingo.uisnotc.com/api/${name}/${public}`);
                var msg = `Group:${out.data.name} created with ID:${out.data.id} and is ${out.data.type}`;

                message.reply(msg);

            }else if(command[1].toLowerCase() == "add"){
                var group = command[2];
                var name = command[3].replaceAll("_", " ");
                var chance = 5;
                if(command[4] != null){
                    chance = command[4];
                }

                if(isNaN(chance)){
                    if(chance < 0 || chance > 10){
                        chance = 5;
                    }
                }
                var out = await axios.get(`http://bingo.uisnotc.com/api/${group}/${name}/${chance}`);
                var msg = `${out.data.name}(ID: ${out.data.id}) added to Group:${out.data.group_id} with a chance of ${out.data.chance}`;
                message.reply(msg);
            }else if(command[1].toLowerCase() == "update"){
                var tile = command[2];
                var name = command[3].replaceAll("_", " ");
                var chance = 5;
                if(command[4] != null){
                    chance = command[4];
                }

                if(isNaN(chance)){
                    if(chance < 0 || chance > 10){
                        chance = 5;
                    }
                }
                var out = await axios.get(`http://bingo.uisnotc.com/api/${tile}/${name}/${chance}/update`);
                var msg = (out.data) ? "Update successful!" : "Update failed.";
                message.reply(msg);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);