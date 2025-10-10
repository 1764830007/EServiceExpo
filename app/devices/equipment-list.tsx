import { useLocalization } from "@/hooks/locales/LanguageContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Icon, Searchbar } from "react-native-paper";

export default function EquipmentManageList() {
  const { t } = useLocalization();
  const router = useRouter();

  const [equipSearchField, setEquipmentSearchField] = useState('')

  return (
    <View style={styles.container}>
      {/* header bar of the equipment list  */}
      <Appbar.Header style={styles.bar} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={t("equipment.list")}
          titleStyle={{ fontSize: 16, fontWeight: 600 }}
        />
        <Appbar.Action icon="filter" />
      </Appbar.Header>
      {/* search bar */}
      <View style={{flexDirection: 'row', 
            justifyContent: 'space-between', 
            paddingHorizontal: 10,
            alignItems: 'center' }}>
        <Searchbar placeholder="please search serialNos"
            placeholderTextColor='grey'
            onChangeText={setEquipmentSearchField}
            style={{
                flex: 1,
                backgroundColor: '#fff', 
                borderRadius: 15,
                marginTop: 10,
                height: 36
             }}
             inputStyle={{ minHeight: 0, fontSize: 14 }}
             value={equipSearchField}>
        </Searchbar>
        <Icon source="map-check" size={24} />
      </View>
    </View>
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
