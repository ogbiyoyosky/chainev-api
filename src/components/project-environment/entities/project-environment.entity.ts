import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ProjectEnvironmentNetworkType,
  ProjectEnvironmentState,
} from '../enum/project-environment.enum';
import { Project } from '../../project/entities/project.entity';

@Entity('project_environments')
export class ProjectEnvironment {
  @Expose({ name: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  networkType: ProjectEnvironmentNetworkType;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  webhookUrl: string;

  @Column({ type: 'varchar' })
  projectId: string;

  @Column({ type: 'integer' })
  lastRecordedBlockNumber: number;

  @Column({ type: 'varchar', default: ProjectEnvironmentState.ACTIVE })
  state: ProjectEnvironmentState;

  @Column({ type: 'varchar' })
  userId: string;

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

  @ManyToOne(() => Project)
  project: Project;
}
