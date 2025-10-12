import CustomDrawer from "@/components/devices/CustomDrawer";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Searchbar } from "react-native-paper";

export default function EquipmentManageList() {
  const { t } = useLocalization();
  const router = useRouter();
  const [filterActive, setFilterActive] = useState(false);
  const [equipSearchField, setEquipmentSearchField] = useState("");

  return (
    <CustomDrawer title={t('equipment.list')}>
      <View style={styles.container}>
        {/* search bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            alignItems: "center",
          }}
        >
          <Searchbar
            placeholder="please search serialNos"
            placeholderTextColor="grey"
            onChangeText={setEquipmentSearchField}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 15,
              marginTop: 10,
              height: 36,
            }}
            inputStyle={{ minHeight: 0, fontSize: 14 }}
            value={equipSearchField}
          ></Searchbar>
          <Icon source="map-check" size={24} />
        </View>
      </View>
    </CustomDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f6f6f6",
  },
  bar: {
    backgroundColor: "#f6f6f6",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
});
