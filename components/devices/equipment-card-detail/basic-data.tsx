import { UnBindEqiup } from "@/app/services/equipments/EquipmentService";
import DialogX from "@/components/base/DialogX";
import ModalX from "@/components/base/ModalX";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { EquipDetail } from "@/models/equipments/EquipmentDetail";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { Button, Icon, Text } from "react-native-paper";

type DetailProps = {
  equipDetail: EquipDetail;
};

export default function BasicData({ equipDetail }: DetailProps) {
  const router = useRouter();
  const { t } = useLocalization();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const hideDialog = (hide: boolean) => {
    setDialogVisible(hide);
  };
  const hideModal = (hide: boolean) => {
    setModalVisible(hide);
  };
  //console.log("equip detail", equipDetail);

  const unbindEquip = async() => {
    try {
      const res = await UnBindEqiup(equipDetail?.machineDto?.serialNumber);
      if(res.success) {
        setModalText(t('binding.EquipmentUnbindSuccess'));
        setModalVisible(true);
      }else {
        setModalText(t('binding.EquipmentUnbindFail'));
        setModalVisible(true);
      }
      //throw new Error("aaa");
    }catch(e) {
      console.log('unBindEquip', e);
      // dialog of react native paper
      setModalText(t('binding.EquipmentUnbindFail'));
      setModalVisible(true);
    }
  };

  return (
    <GestureHandlerRootView>
      <ScrollView>
        {/* 设备信息 */}
          <View>
            <View
              style={{
                backgroundColor: "#fff",
                marginTop: 20,
                borderRadius: 2,
              }}
            >
              <Text style={{ margin: 10 }} variant="titleMedium">
                设备信息
              </Text>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">经销商</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.dealerName}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">设备序列号</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.serialNumber}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">产品型号</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.model}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">名称备注</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.nameNote}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">设备类型</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.equipmentType}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">订单类型</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.orderType}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">购买日期</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.purchasingDate
                    ? new Date(
                        equipDetail?.machineDto?.purchasingDate
                      )?.toLocaleString()
                    : ""}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">操作人信息</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.operator?.join(",")}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">国家或地区</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.nationCode}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">邮编</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.postalCode}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text
                  style={{ flexShrink: 0, flexGrow: 0, flexBasis: "auto" }}
                  variant="bodyMedium"
                >
                  地址
                </Text>
                <Text
                  style={styles.addressText}
                  variant="bodyMedium"
                >
                  {equipDetail?.machineDto?.address}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">使用行业</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.industry}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">是否二手车</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.secondHand ? '是' : '否'}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">原经销商名称</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.previousDealer}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">最后修改人</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.lastEditedBy}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">最后修改时间</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.lastEditedTime ? 
                                              new Date(equipDetail.machineDto.lastEditedTime)?.toLocaleDateString() : ''}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">三包日期</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.purchasingDate ? new Date(equipDetail?.machineDto?.purchasingDate)?.toDateString() : ''}</Text>
              </View>
            </View>
            {/* 配置信息 */}
            <TouchableOpacity
              onPress={() => router.push("/devices/equipment-config")}
              style={styles.configTouch}
            >
              <Text style={{ fontWeight: 700 }}>配置信息</Text>
              <Icon source="chevron-right" size={24} />
            </TouchableOpacity>
          </View>
          {/* 申请解绑，修改设备详情 */}
          <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Button mode="contained" style={{borderRadius: 5}} onPress={() =>  setDialogVisible(true) }>申请解绑</Button>
            <Button mode="contained" style={{borderRadius: 5}} onPress={() => router.push('/devices/equipment-card-detail/update-detail') }>修改设备详情</Button>
          </View>
      </ScrollView>
      {/* 申请解绑对话框 */}
      <DialogX DialogVisible={dialogVisible} 
        hideDialog={ () => hideDialog(false) } confirmCallback={() => unbindEquip() }
        >
              <Text>{t('binding.EquipmentUnbindTips')}</Text> 
      </DialogX>
      <ModalX ModalVisible={modalVisible} hideModal={() => hideModal(false)} 
        title={modalText} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  equipInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexWrap: "nowrap",
  },
  addressText: {
    alignSelf: "center",
    textAlign: "right",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto"
  },
  configTouch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 2,
    marginTop: 20,
    padding: 20,
  }
});
