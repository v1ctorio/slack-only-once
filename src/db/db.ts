import { DataTypes, Model, type Sequelize } from "sequelize";

class User extends Model {
	declare id: string;
	declare banned: boolean;
	declare messageCount: number;
}

export async function Models(
	sequelize: Sequelize,
): Promise<{ User: typeof User }> {
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

	await sequelize.sync();

	return { User };
}
