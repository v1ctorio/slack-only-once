import Slack, {} from "@slack/bolt";
const { App, subtype } = Slack;
import SlackOauth from "@slack/oauth";
const { FileInstallationStore } = SlackOauth;

import { config } from "dotenv";
import { Sequelize } from "sequelize";
import { Models } from "./db/db.js";
config();

const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN,SLACK_CLIENT_SECRET } = process.env;

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db.sqlite",
});
const { User } = await Models(sequelize);

const slack = new App({
	token: SLACK_BOT_TOKEN,
	appToken: SLACK_APP_TOKEN,
	socketMode: true, //TODO dont use socket mode
	signingSecret: SLACK_SIGNING_SECRET,
	port: 6777,
	clientSecret: SLACK_CLIENT_SECRET,
	installationStore: new FileInstallationStore(),
});


slack.command("/ooinvite", async ({ ack, body, client }) => {
	await ack();
	console.log(body);
	const { user_id } = body;
	
});