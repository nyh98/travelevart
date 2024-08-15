export class CreateTravelRouteDto {
  travelName: string;
  travelrouteRange: number;
  transportOption: string;
  startDate: Date;
  endDate: Date;
  detailRoute: DetailRouteDto[];
}

export class DetailRouteDto {
  address: string;
  placeTitle: string;
  routeIndex: number;
  placeImage: string;
  mapx: number;
  mapy: number;
  day: number;
  date: string;
  distance: string;
  estimatedTime: string;
  playTime: string;
  mapLink: string;
}
