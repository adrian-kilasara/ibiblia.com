import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ContentService } from "./content.service";

@ApiTags("content")
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get("site/home")
  home() {
    return this.content.home();
  }

  @Get("impact-stats")
  impactStats() {
    return this.content.impactStats();
  }

  @Get("mission-areas")
  missionAreas() {
    return this.content.missionAreas();
  }

  @Get("mission-areas/:slug")
  missionArea(@Param("slug") slug: string) {
    return this.content.missionArea(slug);
  }

  @Get("testimonies")
  testimonies() {
    return this.content.testimonies();
  }

  @Get("testimonies/:id")
  testimony(@Param("id") id: string) {
    return this.content.testimony(id);
  }

  @Get("partners")
  partners() {
    return this.content.partners();
  }

  @Get("team")
  team() {
    return this.content.team();
  }

  @Get("media")
  media() {
    return this.content.media();
  }

  @Get("languages")
  languages() {
    return this.content.languages();
  }

  @Get("countries")
  countries() {
    return this.content.countries();
  }

  @Get("pages/:slug")
  page(@Param("slug") slug: string) {
    return this.content.page(slug);
  }

  @Get("contact-info")
  contactInfo() {
    return this.content.contactInfo();
  }

  @Get("section-backgrounds")
  sectionBackgrounds() {
    return this.content.sectionBackgrounds();
  }
}
