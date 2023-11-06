import { NextFunction, Request, Response } from 'express';
import repo from '../../configs/repo';
import axios from 'axios';
import cron from 'node-cron';
import { Edition } from '../../entities/edition.entity';
import { Section } from '../../entities/section.entity';
import { EditionData } from '../../configs/interfaces';
import customError from '../../helpers/customError';
const RSS = require('rss');

async function updateDatabase(sectionsData: any[]) {
    try {
        for (const sectionData of sectionsData) {
            const { id, webTitle, webUrl, apiUrl, editions } = sectionData;
            const existingSection = await repo.sectionRepo.findOne({ where: { sectionId: id }, relations: ['editions'] });
            if (existingSection) {
                // Updating section data
                existingSection.webTitle = webTitle;
                existingSection.webUrl = webUrl;
                existingSection.apiUrl = apiUrl;

                for (const newEditionData of editions) {
                    const existingEdition = existingSection.editions.find((edition) => edition.editionId === newEditionData.id);

                    if (existingEdition) {
                        // edition exists now updating
                        existingEdition.webTitle = newEditionData.webTitle;
                        existingEdition.webUrl = newEditionData.webUrl;
                        existingEdition.apiUrl = newEditionData.apiUrl;
                    } else {
                        // Edition does not exist. creating it now.
                        const edition: any = repo.editionRepo.create(newEditionData);
                        existingSection.editions.push(edition);
                    }
                }

                await repo.sectionRepo.save(existingSection);
            } else {
                // if section doesn't exist. creating both section & editions
                const newSectionData = new Section();
                newSectionData.sectionId = id;
                newSectionData.webTitle = webTitle;
                newSectionData.webUrl = webUrl;
                newSectionData.apiUrl = apiUrl;
                const savedSection = await repo.sectionRepo.save(newSectionData);
                editions.map(async (edition: EditionData) => {
                    const newedition = new Edition();
                    newedition.section = savedSection;
                    newedition.code = edition.code;
                    newedition.apiUrl = edition.apiUrl;
                    newedition.editionId = edition.id;
                    newedition.webTitle = edition.webTitle;
                    newedition.webUrl = edition.webUrl;
                    await repo.editionRepo.save(newedition)
                })
            }
        }
        console.log('Database updated successfully!!');
    } catch (error) {
        console.error('Error while updating database >>', error);
        throw error;
    }
}

// Corn job that keep updating the data every 10min
function scheduleCronJob(sectionId: string) {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const apiUrl = `https://content.guardianapis.com/sections?q=${sectionId}&api-key=test`;
            const response = await axios.get(apiUrl);
            await updateDatabase(response.data.response.results);
            console.log('Database updated successfully for section >>', sectionId);
        } catch (error) {
            console.error('Error while updating database >>', error);
        }
    });
}
export async function fetchData(req: Request, res: Response, next: NextFunction) {
    try {
        const sectionId = req.params.sectionId;

        if (sectionId.startsWith("-") || sectionId.endsWith("-")) {
            throw customError(
                `Section names must use only lowercase letters and hyphens (kebab-case). Valid names include "section", "a-section", but not "not-a-section-" or "-even-this".Please provide a valid section name.`,
                400
            );
        } else {
            const section = await repo.sectionRepo.findOne({ where: { sectionId: sectionId }, relations: ['editions'] });
            var feed;
            if (section) {
                feed = new RSS({
                    title: sectionId,
                    custom_elements: [
                        { id: section.sectionId },
                        { webTitle: section.webTitle },
                        { webUrl: section.sectionId },
                        { apiUrl: section.apiUrl }
                    ]
                });

                section.editions.forEach(edition => {
                    feed = new RSS({
                        title: edition.editionId,
                        custom_elements: [
                            { id: edition.editionId },
                            { webTitle: edition.webTitle },
                            { webUrl: edition.webUrl },
                            { apiUrl: edition.apiUrl }
                        ]

                    });
                });
            } else {
                const apiUrl = `https://content.guardianapis.com/sections?q=${sectionId}&api-key=test`;
                const response = await axios.get(apiUrl);
                const resData = response.data.response.results;
                if (resData.length === 0) {
                    throw customError('Invalid section name', 400)
                }
                await updateDatabase(response.data.response.results);
                const section = await repo.sectionRepo.findOne({ where: { sectionId: sectionId }, relations: ['editions'] }) as Section;
                if (section == null) {
                    throw customError('Invalid section name', 400)
                }
                feed = new RSS({
                    title: sectionId,
                    custom_elements: [
                        { id: section.sectionId },
                        { webTitle: section.webTitle },
                        { webUrl: section.sectionId },
                        { apiUrl: section.apiUrl }
                    ]
                });
                section.editions.forEach(edition => {
                    feed = new RSS({
                        title: edition.editionId,
                        custom_elements: [
                            { id: edition.editionId },
                            { webTitle: edition.webTitle },
                            { webUrl: edition.webUrl },
                            { apiUrl: edition.apiUrl }
                        ]
                    });
                });
            }
            scheduleCronJob(sectionId);
            const xml = feed.xml({ indent: true });
            res.set('Content-Type', 'text/xml');
            res.send(xml);
        }
    } catch (err) {
        return next(err)
    }
}