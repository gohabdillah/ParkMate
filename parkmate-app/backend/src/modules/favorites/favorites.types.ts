export interface Favorite {
  id: string;
  userId: string;
  carparkId: string;
  createdAt: string;
}

export interface FavoriteWithCarpark extends Favorite {
  carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
    carparkType?: string;
    parkingSystem?: string;
    freeParking?: string;
  };
}
