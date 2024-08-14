export class CreateTravelRouteDto {
  travel_name: string;
  travelroute_range: number;
  transportOption: string;
  start_date: Date;
  end_date: Date;
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
