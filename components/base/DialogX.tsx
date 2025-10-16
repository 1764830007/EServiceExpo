import { useLocalization } from "@/hooks/locales/LanguageContext";
import React from "react";
import { Button, Dialog, Portal } from "react-native-paper";

type DialogProps = {
    DialogVisible: boolean;
    hideDialog: (hide: boolean) => void;
    children: React.ReactNode;
    confirmCallback?: () => void;
}

export default function DialogX({DialogVisible, hideDialog, confirmCallback, children}: DialogProps) {
    const { t } = useLocalization();

    const confirmButtons = () => {
        hideDialog(false);
        if(confirmCallback) {
            confirmCallback();
        }
    };

    return (
        <Portal>
            <Dialog style={{borderRadius: 10, backgroundColor: 'white' }} dismissable={false} visible={DialogVisible} 
                >
                <Dialog.Content>
                    {children}
                </Dialog.Content>
                <Dialog.Actions style={{ paddingTop: 20, borderTopWidth: 0.2, borderColor: 'grey',flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Button mode="contained" style={{borderRadius: 5, paddingHorizontal: 10 }} onPress={() => hideDialog(false) }>{t('common.Cancel')}</Button>
                    <Button mode="contained" style={{borderRadius: 5, paddingHorizontal: 10 }} onPress={confirmButtons}>{t('common.Confirm')}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}