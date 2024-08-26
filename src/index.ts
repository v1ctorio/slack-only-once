import Slack, {
} from "@slack/bolt";

const {App, subtype} = Slack;

import { config } from "dotenv";
import { Models } from "./db/db.js";
import { Sequelize } from "sequelize";
config();


const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN } = process.env;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db.sqlite',
});
const {User} = await Models(sequelize);

const slack = new App({
	token: SLACK_BOT_TOKEN,
	appToken: SLACK_APP_TOKEN,
	socketMode: true, //TODO dont use socket mode
	signingSecret: SLACK_SIGNING_SECRET,
	port: 6777
});