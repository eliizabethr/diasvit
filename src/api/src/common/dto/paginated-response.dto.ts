import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

// mixin
export const PaginatedResponseDto = <T>(ItemDto: Type<T>) => {
  abstract class Paginated {
    @ApiProperty({ type: [ItemDto] }) // explicitly tell Swagger the type
    data!: T[];

    @ApiProperty({ type: Number })
    page!: number;

    @ApiProperty({ type: Number })
    limit!: number;

    @ApiProperty({ type: Number })
    total!: number;

    @ApiProperty({ type: Number })
    totalPages!: number;
  }

  return Paginated;
};
