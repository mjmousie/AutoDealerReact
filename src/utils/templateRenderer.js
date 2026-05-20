import business from "../config/business.js";
import { formatCurrency, formatMileage } from "./formatter.js";

export const SHORTCODES = [
  { code: "{{year}}", description: "Vehicle year" },
  { code: "{{make}}", description: "Vehicle make" },
  { code: "{{model}}", description: "Vehicle model" },
  { code: "{{trim}}", description: "Vehicle trim" },
  { code: "{{price}}", description: "Formatted price" },
  { code: "{{mileage}}", description: "Formatted mileage" },
  { code: "{{vin}}", description: "Vehicle VIN" },
  { code: "{{description}}", description: "Vehicle description" },
  { code: "{{condition}}", description: "Vehicle condition" },
  { code: "{{bodyType}}", description: "Body type" },
  { code: "{{engine}}", description: "Engine specs" },
  { code: "{{transmission}}", description: "Transmission type" },
  { code: "{{drivetrain}}", description: "Drivetrain" },
  { code: "{{dealerName}}", description: "Dealership name" },
  { code: "{{dealerPhone}}", description: "Dealer phone" },
  { code: "{{dealerAddress}}", description: "Dealer address" },
];

export function renderTemplate(template, vehicle) {
  if (!template || !vehicle) return template;

  return template
    .replace(/{{year}}/g, vehicle.year || "")
    .replace(/{{make}}/g, vehicle.make || "")
    .replace(/{{model}}/g, vehicle.model || "")
    .replace(/{{trim}}/g, vehicle.trim || "")
    .replace(/{{price}}/g, formatCurrency(vehicle.price))
    .replace(/{{mileage}}/g, formatMileage(vehicle.mileage))
    .replace(/{{vin}}/g, vehicle.vin || "")
    .replace(/{{description}}/g, vehicle.description || "")
    .replace(/{{condition}}/g, vehicle.condition || "")
    .replace(/{{bodyType}}/g, vehicle.bodyType || "")
    .replace(/{{engine}}/g, vehicle.engine || "")
    .replace(/{{transmission}}/g, vehicle.transmission || "")
    .replace(/{{drivetrain}}/g, vehicle.drivetrain || "")
    .replace(/{{dealerName}}/g, business.fullName)
    .replace(/{{dealerPhone}}/g, business.phone)
    .replace(/{{dealerAddress}}/g, business.fullAddress);
}
