import { AdminRepository } from "./repository"
import type { KpiData } from "./types"

export class AdminService {
  static async getKpiDataService(): Promise<KpiData> {
    return AdminRepository.getKpiData()
  }
}
