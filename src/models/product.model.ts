export enum Types {
  CHIPS = 'chips',
  DRINKS = 'drinks',
  BISCUITS = 'biscuits',
  CHOCOLATES = 'chocolates',
}

export enum Units {
  KILOGRAM = 'kg',
  GRAM = 'g',
  LITRE = 'l',
  MILLILITER = 'ml',
}

export interface Product {
  id: number;
  productCode: string;
  name: string;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
  measure: number;
  unit: Units;
  status: boolean;
  isApproved: boolean;
  type: Types;
  description: string;
}
