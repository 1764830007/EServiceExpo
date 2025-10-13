
export interface EquipmentSearchDto {
    limit: number;
    offset: number;
    status: string;
    equipmentStatus: string;
    searchText: string; 
    dealerList: string;
    machineModel: string; 
    machineType: string;
    totalHoursMin?: number;
    totalHoursMax?: number; 
    locationCode: string;
}