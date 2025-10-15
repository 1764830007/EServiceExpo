import {
  DealerDto,
  EquipmentListDto,
  EquipmentSearchDto,
  ModelDto,
  NationDto
} from "@/models/equipments/EquipmentList";
import api from "../api";

export const getEquipmentLists = async (q: EquipmentSearchDto) => {
  // const jsonData : EquipmentSearchDto = {
  //     limit: 0,
  //     offset: 0,
  //     status: "",
  //     equipmentStatus: "",
  //     searchText: "",
  //     dealerList: "",
  //     machineModel: "",
  //     machineType: "",
  //     locationCode: ""
  // };

  const url = `/services/app/EquipmentService/Equipments?Limit=${q.limit}&Offset=${q.offset}&SearchText=${q.searchText}&DealerList=${q.dealerList}&MachineModel=${q.machineModel}&MachineType=${q.machineType}&TotalHoursStart=${q.totalHoursMin}&TotalHoursEnd=${q.totalHoursMax}&Connect=${q.equipmentStatus}&Status=${q.status}&LocationCountryorRegion=${q.locationCode}`;
  const res = await api.get<{result: EquipmentListDto}>(url);
  return res.data.result;
};
// 加载dealer optons
export const LoadDealerOptions = async() => {
 const res =  await api.get<{ result: { dealers: DealerDto[] } }>('/services/app/UserService/GetUserDealerInfo');
 const dealers = res.data.result.dealers;
 return dealers;
}
// 加载 models
export const LoadModelOptions = async() => {
const res = await api.get<{ result: ModelDto[], success: boolean, error: string }>('/services/app/EquipmentService/EquipmentModels');
return res.data.result;
};
//  加载 位置
export const LoadCountryOptions = async(type: number = 0) => {
  const res = await api.get<{ result: NationDto[] }>(`/services/app/GeoService/Nations?type=${type}`);
  return res.data.result;
}