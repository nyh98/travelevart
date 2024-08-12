export class CreateTravelRouteDto {
  travel_name: string;
  travelroute_range: number;
  transportOption: string;
  detailRoute: DetailRouteDto[];
  accommodation: AccommodationDto[];
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

export class AccommodationDto {
  day: number;
  address: string;
  title: string;
  reservationLink: string;
}
