export const MAX_IMAGES = 15;
export const MAX_FEATURED = 4;

export const COLLECTION = {
  INVENTORY: "inventory",
  LEADS: "leads",
};

export const STORAGE_PATH = {
  INVENTORY: "inventory",
};

export const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM",  "2:00 PM",
  "3:00 PM", "4:00 PM",  "5:00 PM",
];

export const CONDITIONS = ["Excellent", "Very Good", "Good", "Fair"];

export const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai",
  "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda",
  "Mercedes-Benz", "Mitsubishi", "Nissan", "Ram", "Subaru",
  "Tesla", "Toyota", "Volkswagen", "Volvo",
];

export const PRICE_RANGES = [
  { label: "Under $3,000", max: 3000 },
  { label: "Under $5,000", max: 5000 },
  { label: "Under $7,500", max: 7500 },
  { label: "Under $10,000", max: 10000 },
  { label: "Any Price",  max: Infinity },
];

export const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-Automatic"];
export const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD", "4x4"];
export const BODY_TYPES = [
  "Sedan", "SUV", "Truck", "Coupe", "Convertible",
  "Van", "Minivan", "Wagon", "Hatchback",
];