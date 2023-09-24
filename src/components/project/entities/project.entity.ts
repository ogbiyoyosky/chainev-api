import { Exclude, Expose } from 'class-transformer';
import { StringColumnToJSONTransformer } from '../../../shared/utils/column-transformer.util';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectState } from '../enum/project.enum';
import { ProjectEnvironment } from '../../project-environment/entities/project-environment.entity';

@Entity('projects')
export class Project {
  email(email: any) {
    throw new Error('Method not implemented.');
  }
  @Expose({ name: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', transformer: new StringColumnToJSONTransformer() })
  abi: any;

  @Column({ type: 'text', transformer: new StringColumnToJSONTransformer() })
  eventNames: string[];

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', default: ProjectState.STARTING_UP })
  state: string;

  @CreateDateColumn({ type: 'date' })
  createdAtDateOnly: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAtDateOnly() {
    this.createdAtDateOnly = new Date();
  }

  @OneToMany(() => ProjectEnvironment, (environment) => environment.project)
  environments: ProjectEnvironment[];
}
