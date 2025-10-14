import { getEquipmentLists } from "@/app/services/equipments/EquipmentService";
import { DealerDto, EquipmentListDto, EquipmentSearchDto } from "@/models/equipments/EquipmentList";
import { defineStore } from "@helux/store-pinia";

const equipmentStore = defineStore("equipmentStore", {
  state: () => ({
    status: '',
    equipmentStatus: '',
    searchText: '',
    dealerList: [] as DealerDto[],
    machineModel: '',
    machineType: '',
    locationCode: '',
    totalHoursMin: 0,
    totalHoursMax: 0,
    equipments: {} as EquipmentListDto
  }),
  getters: {
    selectedDealers() {
      return this.dealerList.filter(p => p.checked === true).map(p => p.dealerName).join(',');
    }
  },
  actions: {
    getSelectedDealers() {
      return this.selectedDealers;
    },
     async getEquipments() {
        const res = await getEquipmentLists(new EquipmentSearchDto());
        this.equipments = res;
    },
    setSearchText(text: string) {
      this.searchText =  text;
    },
    setDealerList(dealerDto: DealerDto[]) {
      this.dealerList = dealerDto;
    },
    setDealerToggle(dealerCode: string) {
      let dealer = this.dealerList.find(p => p.dealerCode === dealerCode);
      if (dealer) {
        dealer.checked = !dealer.checked;
      }
    },
    setMachineModel(text: string) {
      this.machineModel = text;
    },
    setMachineType(text: string) {
      this.machineModel = text;
    },
  },
  lifecycle: {
    // 可以访问actions，state
    mounted() {
      console.log("equipment mounted");
      this.getEquipments();
    },
    willUnmount() {
      this.equipments = {} as EquipmentListDto;
      console.log("equipment unmounted");
    },
  },
});

export default equipmentStore;
