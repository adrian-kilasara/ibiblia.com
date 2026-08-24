import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NewsService } from "./news.service";

/** Public read-only endpoints. Writes go through the guarded /admin API. */
@ApiTags("news")
@Controller("news")
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  list(@Query("limit") limit?: number) {
    return this.news.list(limit ? Number(limit) : undefined);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.news.bySlug(slug);
  }
}
