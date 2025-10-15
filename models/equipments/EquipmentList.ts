import { TapGesture } from "react-native-gesture-handler";

export class EquipmentSearchDto {
  constructor(
    public limit: number = 10,
    public offset: number = 0,
    public status: string = '',
    public equipmentStatus: string = '',
    public searchText: string = '',
    public dealerList: string = '',
    public machineModel: string = '',
    public machineType: string = '',
    public locationCode: string = '',
    public totalHoursMin: number | string = '',
    public totalHoursMax: number | string = ''
  ) {}
}

export interface Equipments {
  new: boolean;
  equipmentModel: string;
  serialNumber: string;
  model: string;
  nameNote: string;
  equipmentType: string;
  equipmentTypeKey: string;
  dealer: string;
  location: string;
  totalHours: number;
  locationTime?: Date;
  status: string;
  connect: number;
  isFault: string;
  recomMaintTime: number;
}
export interface EquipmentListDto {
  amount: number;
  data: Equipments[];
  onLine: number;
  offLine: number;
}

export interface DealerOptions {
  Dealers: DealerDto[]
}

export interface DealerDto {
  dealerCode: string;
  accountGroup: string;
  dealerName: string;
  dealerName_CN: string;
  dealerName_EN: string;
  salesOrganization: string;
  dealerType: string;
  checked: boolean;
}

interface SelectOption {
  text: string;
  value: string;
  selected: boolean;
}

export interface ModelDto extends SelectOption {};

export interface NationDto extends SelectOption {};

export type Helpers = {
  openDrawer: TapGesture,
  closeDrawer: TapGesture
}
