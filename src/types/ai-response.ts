export interface Irecommendations {
  routes: {
    date: string;
    detail: {
      placeId: number;
      routeIndex: number;
      day: number;
      distance: string;
      estimatedTime: string;
      playTime: string;
    }[];
  }[];
}
