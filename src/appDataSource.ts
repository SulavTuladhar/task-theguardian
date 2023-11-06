import { DataSource } from "typeorm";
import { Edition } from "./entities/edition.entity";
import { Section } from "./entities/section.entity";

export const appDataSource = new DataSource({
    'type': 'mysql',
    'host': 'localhost',
    'port': 3306,
    'username': 'root',
    'password': '',
    'database': 'kotukonepal',
    'synchronize': true,
    'logging': true,
    'entities': [Edition, Section]
})