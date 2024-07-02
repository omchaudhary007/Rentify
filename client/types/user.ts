export type Role = "user" | "deliveryman" | "admin";

export interface Address {
  lng?: number;
  lat?: number;
  landmark?: string;
  placeName: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
}

export interface CloudinaryImage {
  public_id: string | null;
  url: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  address: Address;
  profilePic: CloudinaryImage;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
