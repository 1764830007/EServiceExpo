import { EquipDetail } from "@/models/equipments/EquipmentDetail";
import { defineStore } from "@helux/store-pinia";

const equipmentDetailStore = defineStore("equipmentDetailStore", {
  state: () => ({
    equipDetail: {} as EquipDetail
  }),
  getters: {},
  actions: {
    setEquipDetail(equipDetail: EquipDetail) {
        this.equipDetail = equipDetail;
    }
  },
  lifecycle: {
    mounted() {},
    willUnmount() {
      this.equipDetail = {} as EquipDetail;
    },
  },
});

export default equipmentDetailStore;
