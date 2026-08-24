import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicationsService } from "./publications.service";
import { ListPublicationsQuery } from "./dto";

/** Public read-only endpoints. Writes go through the guarded /admin API. */
@ApiTags("publications")
@Controller("publications")
export class PublicationsController {
  constructor(private readonly publications: PublicationsService) {}

  @Get()
  list(@Query() query: ListPublicationsQuery) {
    return this.publications.list(query);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.publications.bySlug(slug);
  }
}
