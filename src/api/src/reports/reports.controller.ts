import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AidByCategoriesQueryDto } from './dto/aid-by-categories-query-request.dto';
import { ReportsService } from './reports.service';
import { AidByCategoriesResponseDto } from './dto/aid-by-categories-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import type { Response } from 'express';

@ApiBearerAuth('JwtAuth')
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('aid-by-categories')
  async getAidByCategories(
    @Query() query: AidByCategoriesQueryDto,
  ): Promise<AidByCategoriesResponseDto> {
    const aidByCategories = await this.reportsService.getAidByCategories(
      query.dateFrom,
      query.dateTo,
    );

    return {
      dateFrom: aidByCategories.dateFrom ?? null,
      dateTo: aidByCategories.dateTo ?? null,
      data: aidByCategories.data,
    };
  }

  @Get('aid-by-categories/export')
  async exportAidByCategories(
    @Query() query: AidByCategoriesQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportAidByCategories(
      query.dateFrom,
      query.dateTo,
    );

    const fileName = `aid-by-categories-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    return res.send(csv);
  }
}
