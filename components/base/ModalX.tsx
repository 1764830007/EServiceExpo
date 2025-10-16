import { useLocalization } from "@/hooks/locales/LanguageContext";
import { View } from "react-native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";

type ModalProps = {
  ModalVisible: boolean;
  hideModal: (hide: boolean) => void;
  children?: React.ReactNode;
  title: string;
};

export default function ModalX({ ModalVisible, hideModal, title }: ModalProps) {
  const theme = useTheme();
  const { t } = useLocalization();
  return (
    <Portal>
      <Modal contentContainerStyle={{paddingHorizontal: 50, paddingVertical: 20,
        gap: 20, borderRadius: 10, backgroundColor: 'white'}}
        //style={{ backgroundColor: theme.colors.surface }}
        dismissable={false}
        visible={ModalVisible}
        style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}
      >
        <Text style={{alignSelf: 'center'}}>{title}</Text>
        <View
          style={{
            paddingHorizontal: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            mode="contained"
            style={{ borderRadius: 5, paddingHorizontal: 10 }}
            onPress={() => hideModal(false)}
          >
            {t('common.Confirm')}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}
