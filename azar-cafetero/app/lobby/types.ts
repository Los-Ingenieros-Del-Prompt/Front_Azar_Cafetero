export interface Floor {
  id: string;
  number: number;
  name: string;
  route: string;
  icon: string;
  description: string;
  available: boolean;
  color: string;
}

export interface BuildingLayout {
  floors: Floor[];
}
