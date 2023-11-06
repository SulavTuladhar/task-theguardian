import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Edition } from './edition.entity';

@Entity()
export class Section {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sectionId!: string

    @Column()
    webTitle!: string;

    @Column()
    webUrl!: string;

    @Column()
    apiUrl!: string;

    @OneToMany(() => Edition, edition => edition.section)
    editions!: Edition[];
}