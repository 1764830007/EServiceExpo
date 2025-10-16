import { EquipDetail, MachineDto } from "@/models/equipments/EquipmentDetail";
import { defineStore } from "@helux/store-pinia";

const equipmentDetailStore = defineStore("equipmentDetailStore", {
  state: () => ({
    equipDetail: {} as EquipDetail,
    equipEditDto: {} as MachineDto,
  }),
  getters: {},
  actions: {
    setEquipDetail(equipDetail: EquipDetail) {
        this.equipDetail = equipDetail;
    },
    setEquipEditDto(machine: MachineDto) {
      this.equipEditDto = machine;
    },
    setNameNote(nameNote: string) {
      this.equipEditDto.nameNote = nameNote;
      console.log('changed nameNote', this.equipEditDto);
    },
    setPostCode(postCode: string) {
      this.equipEditDto.postalCode = postCode;
    },
    setSecondHand(val: boolean) {
      this.equipEditDto.secondHand = val;
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
