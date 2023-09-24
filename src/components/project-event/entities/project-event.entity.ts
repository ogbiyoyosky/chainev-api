import { Expose } from 'class-transformer';
import { StringColumnToJSONTransformer } from '../../../shared/utils/column-transformer.util';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { ProjectEnvironment } from '../../project-environment/entities/project-environment.entity';

@Entity('project_events')
export class ProjectEvent {
  @Expose({ name: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', transformer: new StringColumnToJSONTransformer() })
  payload: any;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  environmentId: string;

  @Column({ type: 'varchar' })
  networkType: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  webhookAckAt: Date;

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

  @ManyToOne(() => Project, (project) => project.id)
  project: Project;
}
