import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { ListProjectsQuery } from "./dto";

/** Public read-only endpoints. Writes go through the guarded /admin API. */
@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query() query: ListProjectsQuery) {
    return this.projects.list(query);
  }

  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.projects.bySlug(slug);
  }
}
