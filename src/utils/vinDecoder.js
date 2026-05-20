// Fetches vehicle data from the free NHTSA API.
// Returns an object with make, model, year, and an auto-generated description.
// Throws an error if the VIN is invalid or the fetch fails.
export async function decodeVin(vin) {
  let response;
  try {
    response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`
    );
  } catch {
    throw new Error("Could not reach the NHTSA API. Check your connection.");
  }

  if (!response.ok) {
    throw new Error(`NHTSA API error (${response.status}). Try again.`);
  }

  const data = await response.json();
  const results = data.Results ?? [];

  // Returns the value for a given variable name, or "" if absent/null/N-A.
  const get = (variable) => {
    const item = results.find((r) => r.Variable === variable);
    const val = item?.Value;
    if (!val || val === "Not Applicable" || val.trim() === "") return "";
    return val.trim();
  };

  function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

  const make = toTitleCase(get("Make"));
  const model = get("Model");
  const year = get("Model Year");
  const trim = get("Trim");
  const driveType = get("Drive Type");
  const fuelType = get("Fuel Type - Primary");
  const cylinders = get("Engine Number of Cylinders");
  const displacementRaw = get("Displacement (L)");
  const displacement = displacementRaw ? parseFloat(displacementRaw).toFixed(1) : "";
  const bodyClass = get("Body Class");

  // NHTSA returns empty values for unrecognized VINs — treat that as invalid.
  if (!make && !model && !year) {
    throw new Error("VIN not recognized. Verify the VIN and try again.");
  }

  // First line: Year Make Model Trim (skip Trim if empty).
  const firstLine = [year, make, model, trim].filter(Boolean).join(" ");
  const lines = [firstLine];

  if (driveType) lines.push(`Drive Type: ${driveType}`);
  if (fuelType) lines.push(`Fuel Type: ${fuelType}`);
  if (cylinders && displacement) lines.push(`Engine: ${cylinders}-cylinder, ${displacement}L`);
  if (bodyClass) lines.push(`Body Style: ${bodyClass}`);

  const description = lines.join("\n");

  // ── New spec fields ───────────────────────────────────────
  const bodyType = bodyClass;

  const engineParts = [
    displacement ? `${displacement}L` : "",
    cylinders ? `${cylinders}-cylinder` : "",
    fuelType,
  ].filter(Boolean);
  const engine = engineParts.join(" ");

  const transmissionRaw = get("Transmission Style");
  let transmission = transmissionRaw;
  if (transmissionRaw) {
    if (transmissionRaw.includes("Automatic")) transmission = "Automatic";
    else if (transmissionRaw.includes("CVT")) transmission = "CVT";
    else if (transmissionRaw.includes("Manual")) transmission = "Manual";
  }

  let drivetrain = driveType;
  if (driveType) {
    if (driveType.includes("FWD") || driveType.includes("Front")) drivetrain = "FWD";
    else if (driveType.includes("RWD") || driveType.includes("Rear")) drivetrain = "RWD";
    else if (driveType.includes("AWD") || driveType.includes("All Wheel")) drivetrain = "AWD";
    else if (driveType.includes("4WD") || driveType.includes("4x4") || driveType.includes("Four Wheel")) drivetrain = "4WD";
  }

  return { make, model, year, description, bodyType, engine, transmission, drivetrain };
}
