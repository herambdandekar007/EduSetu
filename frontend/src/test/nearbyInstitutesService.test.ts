// frontend/src/test/nearbyInstitutesService.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateDistanceKm,
  formatDistance,
  getGoogleMapsDirectionsUrl,
  getNearbyInstitutes,
} from "../features/education/services/nearbyInstitutesService";
import { EDUCATION_INSTITUTES } from "../features/education/services/nearbyInstitutesData";

describe("nearbyInstitutesService", () => {
  it("calculates distance between two coordinates correctly using Haversine formula", () => {
    // Distance between New Delhi (28.6139, 77.2090) and Dehradun NIEPVD (30.3475, 78.0645) ~ 210 km
    const dist = calculateDistanceKm(28.6139, 77.2090, 30.3475, 78.0645);
    expect(dist).toBeGreaterThan(190);
    expect(dist).toBeLessThan(230);
  });

  it("returns 0 km for identical coordinates", () => {
    const dist = calculateDistanceKm(28.6139, 77.2090, 28.6139, 77.2090);
    expect(dist).toBe(0);
  });

  it("formats distances properly in meters and kilometers", () => {
    expect(formatDistance(0.45)).toBe("450 m");
    expect(formatDistance(1.23)).toBe("1.2 km");
    expect(formatDistance(15.0)).toBe("15.0 km");
  });

  it("generates correct Google Maps directions URL with origin and destination", () => {
    const inst = EDUCATION_INSTITUTES[0]; // NIEPVD Dehradun
    const userCoords = { latitude: 28.6139, longitude: 77.2090 };
    const url = getGoogleMapsDirectionsUrl(inst, userCoords);

    expect(url).toContain("https://www.google.com/maps/dir/?api=1");
    expect(url).toContain("origin=28.6139,77.209");
    expect(url).toContain(`destination=${inst.lat},${inst.lng}`);
  });

  it("sorts institutes by nearest distance ascending", async () => {
    const dehradunCoords = { latitude: 30.3165, longitude: 78.0322 };
    const results = await getNearbyInstitutes(dehradunCoords);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe("Dehradun");

    // Verify sort order
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].distanceKm).toBeLessThanOrEqual(results[i + 1].distanceKm);
    }
  });

  it("filters institutes by category correctly", async () => {
    const delhiCoords = { latitude: 28.6139, longitude: 77.2090 };
    const collegeResults = await getNearbyInstitutes(delhiCoords, {
      category: "college",
    });

    expect(collegeResults.length).toBeGreaterThan(0);
    collegeResults.forEach((inst) => {
      expect(inst.category).toBe("college");
    });
  });

  it("matches college searches when user types 'college' or 'colleges'", async () => {
    const delhiCoords = { latitude: 28.6139, longitude: 77.2090 };
    const results = await getNearbyInstitutes(delhiCoords, {
      searchQuery: "college",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.toLowerCase().includes("college") || r.category === "college")).toBe(true);
  });

  it("matches specific college name search like 'Hansraj' or 'DAV'", async () => {
    const delhiCoords = { latitude: 28.6139, longitude: 77.2090 };
    const results = await getNearbyInstitutes(delhiCoords, {
      searchQuery: "Hansraj",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Hansraj");
  });

  it("discovers multiple local colleges within 50 km zone", async () => {
    const dehradunCoords = { latitude: 30.3165, longitude: 78.0322 };
    const results = await getNearbyInstitutes(dehradunCoords, {
      radiusKm: 50,
      includeLiveNearby: true,
    });

    expect(results.length).toBeGreaterThan(5);
    results.forEach((inst) => {
      expect(inst.distanceKm).toBeLessThanOrEqual(50);
    });
  });
});
