import Slack, {} from "@slack/bolt";
const { App, subtype } = Slack;
import SlackOauth from "@slack/oauth";

import { config } from "dotenv";
import { Sequelize } from "sequelize";
import { Models } from "./db/db.js";
config();

const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN,SLACK_CLIENT_SECRET } = process.env;
const ONLY_ONCE_CHANNEL = "C07K5SSA908";
const ONLY_ONCE_PORTAL = "C07JGDNQ91U";


const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db.sqlite",
});
const { User, Message } = await Models(sequelize);

const slack = new App({
	token: SLACK_BOT_TOKEN,
	appToken: SLACK_APP_TOKEN,
	socketMode: true, //TODO dont use socket mode
	signingSecret: SLACK_SIGNING_SECRET,
	port: 6777,
	clientSecret: SLACK_CLIENT_SECRET,
});


slack.event("member_joined_channel", async({client,body,})=>{

	console.log("Recieved member_joined_channel event",body);

	if (body.channel !== ONLY_ONCE_PORTAL) return;
	const {user} = body;

	const invite_message = {
		"text":"Welcome to the Only Once portal. Please read this on the slack client.",
		"blocks": [
			{
				"type": "header",
				"text": {
					"type": "plain_text",
					"text": "Join Only Once!",
					"emoji": true
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Welcome to the Only Once portal, ${user}. From here you can access the Only Once channel.`
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "In the Ony Once channel you can only send a message once, if you send the same message as anyone before you will get *BANNED*."
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*RULES*\n\n- If you send the same message as anyone before you'll get *BANNED*.\n- The max text length is 300characters. If you use more you'll get *BANNED*. \n- If you spam random characters to abuse the system you'll get *BANNED*."
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "I want to join!",
							"emoji": true
						},
						"action_id": "joinonlyonce"
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "image",
						"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
						"alt_text": "cute cat"
					},
					{
						"type": "mrkdwn",
						"text": "This was made by Victorio and is <https://github.com/v1ctorio/slack-only-once|completley open source>."
					}
				]
			}
		]
	}
	client.chat.postMessage({
		channel: body.channel,
		...invite_message
	})
})



slack.message("debug_channel_join", async({client,body,message,say})=>{
	if(message.subtype)return
	console.log("Recieved [DEBUG] member_joined_channel message",message);


	if (body.channel_id !== ONLY_ONCE_PORTAL) return;
	const user = message.user;
	const invite_message = {
		"text":"Welcome to the Only Once portal. Please read this on the slack client.",
		"blocks": [
			{
				"type": "header",
				"text": {
					"type": "plain_text",
					"text": "Join Only Once!",
					"emoji": true
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": `Welcome to the Only Once portal, ${user}. From here you can access the Only Once channel.`
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "In the Ony Once channel you can only send a message once, if you send the same message as anyone before you will get *BANNED*."
				}
			},
			{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "*RULES*\n\n- If you send the same message as anyone before you'll get *BANNED*.\n- The max text length is 300characters. If you use more you'll get *BANNED*. \n- If you spam random characters to abuse the system you'll get *BANNED*."
				}
			},
			{
				"type": "divider"
			},
			{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": "I want to join!",
							"emoji": true
						},
						"action_id": "joinonlyonce"
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "image",
						"image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
						"alt_text": "cute cat"
					},
					{
						"type": "mrkdwn",
						"text": "This was made by Victorio and is <https://github.com/v1ctorio/slack-only-once|completley open source>."
					}
				]
			}
		]
	}
	
	await client.chat.postMessage({
		channel: ONLY_ONCE_PORTAL,
		blocks: invite_message.blocks,
		text: invite_message.text
	})
})

slack.action("joinonlyonce", async({client,body,ack})=>{
	const user = body.user.id;

	const u = await User.findOne({where:{id:user}});
	if (!u){

		await client.chat.postEphemeral({
			text:"You already have access to the Only Once channel or have been banned!!",
			channel: ONLY_ONCE_PORTAL,
			user: user
		})
	}

	await User.create({id:user,banned:false,messageCount:0});

	await client.chat.postMessage({
		text:"There you go, youre being added to the Only Once channel",
		channel: ONLY_ONCE_PORTAL
	})

})

slack.command("/ooinvite", async ({ ack, body, client,respond }) => {
	await ack();
	console.log(body);
	const { text } = body;
	const parsedUser = parseUser(text.split(" ")[0]);
	if (!parsedUser ) {
		respond("You have not provided a valid user");
		return
	};
	respond(`Inviting ${parsedUser.name}`);

	let i = await client.conversations.invite({
		channel: ONLY_ONCE_CHANNEL,
		users: parsedUser.id
	})
	if (i.ok) {
		client.chat.postMessage({
			channel: ONLY_ONCE_CHANNEL,
			text: `Invited ${parsedUser.name}`
		})
	} else {
		client.chat.postMessage({
			channel: ONLY_ONCE_CHANNEL,
			text: `Failed to invite ${parsedUser.name}`
		})
	}
});



slack.command("/oorm", async ({ ack, body, client,respond }) => {
	await ack();
	const { text } = body;
	const parsedUser = parseUser(text.split(" ")[0]);
	if (!parsedUser ) {
		respond("You have not provided a valid user");
		return
	};
	respond(`Removing ${parsedUser.name}`);
	let i = await client.conversations.kick({
		channel: ONLY_ONCE_CHANNEL,
		user: parsedUser.id
	})
	if (i.ok) {
		client.chat.postMessage({
			channel: ONLY_ONCE_CHANNEL,
			text: `Removed ${parsedUser.name}`
		})
	} else {
		client.chat.postMessage({
			channel: ONLY_ONCE_CHANNEL,
			text: `Failed to remove ${parsedUser.name}`
		})
	}
})


slack.message(async ({ message, client }) => {
	if (message.subtype) return;
	if(message.channel !== ONLY_ONCE_CHANNEL) return;

	const possibleMessage = await Message.findOne({where:{content:message.text}});

	if (!possibleMessage){
		await Message.create({ts:message.ts,userId:message.user,content:message.text});
	}

	const { user, text, channel } = message;
	if (!text) return;

	if(text.length > 300){
		client.chat.postMessage({
			channel: ONLY_ONCE_CHANNEL,
			text: `${user} has been banned for exceeding the 300 character limit!!! Good Game.`,
			thread_ts: message.ts
		})

		client.chat.postMessage({
			channel: user,
			text: `You have been banned from the Only Once channel for exceeding the 300 character limit. Good Game.`,
		})

		await banUser(user);
		return;
	}


})

interface ParsedSlackUser {
	id: string;
	name: string;
}

function parseUser(user:String /* <@ID|username>*/): ParsedSlackUser | null {
	const id = user.match(/<@(.+?)\|/)?.[1];
	const name = user.match(/\|(.+?)>/)?.[1];
	if (!id || !name) return null;
	return { id, name };
}

async function banUser(user:string):Promise<boolean> {
	const u = await User.findOne({where:{id:user}});
	if (!u) return false;
	await u.update({banned:true});

	await slack.client.conversations.kick({
		channel: ONLY_ONCE_CHANNEL,
		user: user
	})
	return true;
}

await slack.start();