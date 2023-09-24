import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ProjectEnvironmentNetworkType } from '../../project-environment/enum/project-environment.enum';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEnum(ProjectEnvironmentNetworkType)
  networkType: ProjectEnvironmentNetworkType;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsJSON()
  abi: any;

  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty({ message: 'Enter at least one event name in your abi' })
  @IsString({ each: true })
  eventNames: string[];

  @IsUrl()
  webhookUrl: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsJSON()
  @IsOptional()
  abi?: any;

  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty({ message: 'Enter at least one event name in your abi' })
  @IsString({ each: true })
  @IsOptional()
  eventNames?: string[];
}

export class AddProjectEnvironmentDto {
  @IsEnum(ProjectEnvironmentNetworkType)
  networkType: ProjectEnvironmentNetworkType;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUrl()
  webhookUrl: string;
}
