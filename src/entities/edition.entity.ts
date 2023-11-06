import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Section } from './section.entity';

@Entity()
export class Edition {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    editionId!: string

    @Column()
    webTitle!: string;

    @Column()
    webUrl!: string;

    @Column()
    apiUrl!: string;

    @Column()
    code!: string;

    @ManyToOne(() => Section, section => section.editions)
    @JoinColumn({ name: 'sectionId' })
    section!: Section;
}