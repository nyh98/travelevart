export class CreateTravelRouteDto {
  travelName: string;
  travelrouteRange: number;
  transportOption: string;
  startDate: Date;
  endDate: Date;
  detailRoute: DetailRouteDto[];
}

export class DetailRouteDto {
  placeId: number;
  routeIndex: number;
  day: number;
  date: string;
  distance: string;
  playTime: string;
  mapLink: string;
}
