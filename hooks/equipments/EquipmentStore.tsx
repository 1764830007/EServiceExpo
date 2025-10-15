import { getEquipmentLists } from "@/app/services/equipments/EquipmentService";
import { DealerDto, EquipmentListDto, EquipmentSearchDto, ModelDto, NationDto } from "@/models/equipments/EquipmentList";
import { defineStore } from "@helux/store-pinia";

const equipmentStore = defineStore("equipmentStore", {
  state: () => ({
    status: '',
    equipmentStatus: '',
    searchText: '',
    dealerList: [] as DealerDto[],
    machineModels: [] as ModelDto[],
    machineType: '',
    nationCodes: [] as NationDto[],
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
    setMachineModels(modelDtos: ModelDto[]) {
      this.machineModels = modelDtos;
    },
    setModelToggle(value: string) {
      let model = this.machineModels.find(p => p.value === value);
      if (model) {
        model.selected = !model.selected;
      }
    },
    setNationCodes(nationDtos: NationDto[]) {
      this.nationCodes = nationDtos;
    },
     setNationToggle(value: string) {
      let nation = this.nationCodes.find(p => p.value === value);
      if (nation) {
        nation.selected = !nation.selected;
      }
    },
    setMachineType(text: string) {
      this.machineType = text;
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
