export interface MachineDto {
    dealerCode: string;
    dealerName: string;
    serialNumber: string;
    model: string;
    nameNote: string;
    equipmentType: string;
    orderType: string;
    purchasingDate?: Date;
    operator: string[];
    nationCode: string;
    country: string;
    postalCode: string;
    address: string;
    contact: string;
    industry: string;
    industryCode: string;
    secondHand: boolean;
    previousDealer: string;
    previousDealerCode: string;
    lastEditedBy: string;
    lastEditedTime?: Date;
}

export interface EquipData {
    eq_ID: number;
    eq_ReportTime?: Date;
    eq_ReportTimeDes: string;
    eq_LocationTime?: Date;
    eq_LocationTimeDes: string;
    eq_Location: string;
    eq_TodayTotalWorkingHour: number;
    eq_TodayTotalFuelConsumption: number;
    eq_TodayFuelperHour: string;
    eq_FuelPercent: number;
    eq_TotalHour: number;
    eq_TotalFuel: number;
    eq_Status: string;
    eq_StatusDes: string;
    eq_PLType: string;
    eq_BatteryVoltage: number;
    eq_EngineCoolantTemperature: number;
    eq_EngineSpeed: number;
    eq_EngineOilPressure: number;
    eq_WarrantyDate?: Date;
} 


export interface ConfigDto {
    configuration: string;
    configDesc: string;
    configurationValue: string;
    configValueDesc: string;
}

export interface EquipDetail {
    machineDto:MachineDto;
    data: EquipData;
    configDto: ConfigDto;
}