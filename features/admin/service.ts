import { AdminRepository } from "./repository";
import type {
  KpiData,
  MonthlyRevenue,
  FinancieroData,
  GeograficoData,
  RevenueBySector,
  TopOficial,
  RevenueBySeverity,
} from "./types";

export class AdminService {
  static async getKpiDataService(): Promise<KpiData> {
    return AdminRepository.getKpiData();
  }

  static async getFinancieroDataService(): Promise<FinancieroData> {
    return AdminRepository.getFinancieroData();
  }

  static async getGeograficoDataService(): Promise<GeograficoData> {
    return AdminRepository.getGeograficoData();
  }

  static async getMonthlyRevenueService(
    year: number,
  ): Promise<MonthlyRevenue[]> {
    return AdminRepository.getMonthlyRevenue(year);
  }

  static async getRevenueBySectorService(): Promise<RevenueBySector[]> {
    return AdminRepository.getRevenueBySector();
  }

  static async getTopOficialesService(): Promise<TopOficial[]> {
    return AdminRepository.getTopOficiales();
  }

  static async getRevenueBySeverityService(): Promise<RevenueBySeverity[]> {
    return AdminRepository.getRevenueBySeverity();
  }
}
