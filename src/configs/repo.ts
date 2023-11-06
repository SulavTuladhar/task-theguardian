import { appDataSource } from "../appDataSource";
import { Edition } from "../entities/edition.entity";
import { Section } from "../entities/section.entity";

const repo = {
    sectionRepo: appDataSource.getRepository(Section),
    editionRepo: appDataSource.getRepository(Edition)
}

export default repo;