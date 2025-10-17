import equipmentDetailStore from "@/hooks/equipments/EquipmentDetailStore";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Switch, Text, TextInput } from "react-native-paper";
export default function UpdateDetail() {
  const router = useRouter();
  const { t } = useLocalization();
  const loading = useState(true);
  const equipDetailStore = equipmentDetailStore.useStore();
  const { equipDetail, equipEditDto } = equipDetailStore;

  // 首次加载时候，把equipDetail里的machineNo复制给equipEditDto
  useEffect(() => {
    equipDetailStore.setEquipEditDto(equipDetail.machineDto);
    //console.log("equip detail Dto", equipDetail.machineDto);
  }, [loading]);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={styles.bar} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={t("equipment.UpdateEquipmentDetail")}
          titleStyle={{ fontSize: 16, fontWeight: 600 }}
        />
      </Appbar.Header>
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 10,
          marginTop: 10,
        }}
      >
        <Text>{t("equipment.UpdateEquipmentDetail")}</Text>
        {/* 名称备注 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>名称备注</Text>
          <TextInput
            style={{ flexGrow: 1, flexShrink: 0 }}
            value={equipEditDto?.nameNote}
            onChangeText={(text) => equipDetailStore.setNameNote(text)}
          />
          <Feather
            style={{ flexBasis: "auto" }}
            name="edit"
            size={24}
            color="black"
          />
        </View>
        {/* purchasingDate */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            purchasing Date
          </Text>
          {/* todo: date plugin */}
          {/* <TextInput style={{flexGrow: 1, flexShrink: 0}} value={equipEditDto.purchasingDate} onChangeText={setNameNote}  /> */}
          <AntDesign
            style={{ flexBasis: "auto" }}
            name="right"
            size={24}
            color="black"
          />
        </View>
        {/* country */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            {t("equipment.EquipmentCountry")}
          </Text>
          <TextInput
            style={{ flexGrow: 1, flexShrink: 0 }}
            value={equipEditDto?.country}
            disabled
          />
        </View>
        {/* postal code  */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            {t("equipment.EquipmentPostalCode")}
          </Text>
          <TextInput
            style={{ flexGrow: 1, flexShrink: 0 }}
            value={equipEditDto?.postalCode}
            onChangeText={(postCode) => equipDetailStore.setPostCode(postCode)}
          />
          <Feather
            style={{ flexBasis: "auto" }}
            name="edit"
            size={24}
            color="black"
          />
        </View>
        {/* address */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            {t("equipment.EquipmentAddress")}
          </Text>
          <TextInput
            style={{ flexGrow: 1, flexShrink: 0 }}
            value={equipEditDto?.address}
            disabled
          />
        </View>
        {/* industry */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            {t("equipment.EquipmentIndustry")}
          </Text>
          {/* todo  */}
          {/* <TextInput style={{flexGrow: 1, flexShrink: 0}} value={equipEditDto.industry} onChangeText={setNameNote}  /> */}
          <AntDesign
            style={{ flexBasis: "auto" }}
            name="right"
            size={24}
            color="black"
          />
        </View>
        {/* second hand  */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ flexBasis: 100, flexWrap: "wrap" }}>
            {t("equipment.EquipmentSecondHand")}
          </Text>
          <Switch
            value={equipEditDto?.secondHand}
            onValueChange={(val) => equipDetailStore.setSecondHand(val)}
          />
        </View>
      </View>
      <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
        <Button mode="contained" compact style={{ borderRadius: 5 }}>
          {t("equipment.EquipmentSave")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#f6f6f6",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
});
