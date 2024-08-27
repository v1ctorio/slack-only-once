import { DataTypes, Model, type Sequelize } from "sequelize";

class User extends Model {
	declare id: string;
	declare banned: boolean;
	declare messageCount: number;
}

class Message extends Model {
	declare ts: string;
	declare userId: string;
	declare content: string;
}

export async function Models(
	sequelize: Sequelize,
): Promise<{ User: typeof User, Message: typeof Message }> {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Cannot connect to the database:", error);
	}

	User.init(
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			banned: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			messageCount: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: "User",
			timestamps: true,
		},
	);

	Message.init(
		{
			ts: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			content: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "Message",
			timestamps: true,
		},
	);

	await sequelize.sync();

	return { User, Message };
}
