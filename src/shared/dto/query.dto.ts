import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class GetQueryDto {
  @IsDateString()
  @IsOptional()
  startPeriodDatetime?: Date | string;

  @IsDateString()
  @IsOptional()
  endPeriodDatetime?: Date | string;

  @IsNumberString()
  @IsOptional()
  limit?: Date | string;

  @IsNumberString()
  @IsOptional()
  page?: Date | string;
}
