import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from 'src/applications/entities/application.entity';

export class ChangeApplicationStatusRequestDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
