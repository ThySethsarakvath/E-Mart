import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Arrival {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  subtitle: string;

  @Column()
  imagePath: string;

  //Link for shop now
  @Column({ nullable: true })
  link: string;
}
