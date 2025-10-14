import { useLocalization } from '@/hooks/locales/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Divider, Icon, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
export default function SettingScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { themeMode, currentTheme } = useCustomTheme();
  const theme = useTheme();
  const { locale, setLanguage, t } = useLocalization();
  const [user, setUser] = useState<string>('');
  const [company, setCompany] = useState<string>('');

  // 获取用户信息
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userName = await AsyncStorage.getItem('userLoginName');
        if (userName) {
          setUser(userName);
        } else {
          setUser('用户');
        }
        // 这里可以添加获取公司信息的逻辑，暂时使用默认值
        setCompany('涉县威远机械设备有限公司');
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser('用户');
        setCompany('涉县威远机械设备有限公司');
      }
    };
    getUserInfo();
  }, []);

    const handleLogout = async () => {
    try {
      console.log('🟢 Settings: Logout button pressed');
      console.log('🟢 Settings: Calling logout function...');
      await logout();
      console.log('🟢 Settings: Logout function completed, RouteProtection should handle navigation');
    } catch (error) {
      console.error('🔴 Settings: Logout error:', error);
    }
  };

  // 获取当前主题显示文本
  const getThemeDisplayText = () => {
    if (themeMode === 'system') {
      return t('setting.system');
    } else {
      return currentTheme === 'dark' ? t('setting.deepcolor') : t('setting.lightcolor');
    }
  };

  const saveToken = async () => {
    try {
      await AsyncStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjE1MTIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiRjhNSl9saW1pbmdodSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImxpYW5nLmxpLm1pbkBzaW1lZGFyYnkuY29tLmhrIiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiIzNDQ4ZWFiMS0zYWNkLTNiZDgtZDU0Yi0zOWZhMjUxYjYyMGMiLCJzdWIiOiIxNTEyIiwianRpIjoiYWIwNGY2NGQtZGNlNC00MTk3LWEyYzItNWY5OTExYzZiMGI2IiwiaWF0IjoxNzU4MDg5MzU4LCJTZXNzaW9uLk1haW5EZWFsZXJDb2RlIjoiRjhNSiIsIm5iZiI6MTc1ODA4OTM1OCwiZXhwIjoxNzU4MTc1NzU4LCJpc3MiOiJEQ1AiLCJhdWQiOiJEQ1AifQ.rVoiTUgyRpaUGNCkI080-W26XNGR2MAXUU-g2MNpco0');

    } catch (error) {

    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      {/* 页面内容容器 */}
      <View style={styles.contentContainer}>
        <Appbar.Header style={[styles.bar, { backgroundColor: theme.colors.surface }]}>
          <Appbar.Content title="" />
          <Appbar.Action
            icon="bell"
            style={[styles.barIcon, { backgroundColor: theme.colors.surface }]}
            onPress={() => { }}
          />
        </Appbar.Header>

        <View style={[styles.subtitleContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.subtitleText, { color: theme.colors.onSurface, fontSize: 20 }]}>{user || '用户'}</Text>
          <View style={[styles.name, { marginTop: 20 }]}>
            <Icon source="account" size={15} color={theme.colors.onSurface} />
            <Text style={[styles.subtitleText, { marginLeft: 10, color: theme.colors.onSurface }]}>{company || '涉县威远机械设备有限公司'}</Text>
          </View>
        </View>
        <View style={[styles.profileList, { marginTop: 10, backgroundColor: theme.colors.surface }]}>
          <View style={styles.leftContent}>
            <Icon source="shield-account" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.profileListContent, { color: theme.colors.onSurface }]}>{t('setting.personInfo')}</Text>
          </View>
          <Icon
            source="chevron-right"
            size={20}
            color={theme.colors.outline}
          />
        </View>



        <TouchableOpacity
          style={[styles.profileList, { marginTop: 10, backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/dark-mode')}
        >
          <View style={styles.leftContent}>
            <Icon source="moon-waxing-crescent" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.profileListContent, { color: theme.colors.onSurface }]}>{t('setting.deepcolor')}</Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={[styles.textRight, { color: theme.colors.outline }]}>{getThemeDisplayText()}</Text>
            <Icon
              source="chevron-right"
              size={20}
              color={theme.colors.outline}
            />
          </View>
        </TouchableOpacity>

        <View style={[styles.profileList, { marginTop: 10, backgroundColor: theme.colors.surface }]}>
          <View style={styles.leftContent}>
            <Icon source="shield-account" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.profileListContent, { color: theme.colors.onSurface }]}>{t('setting.PrivacyNotice')}</Text>
          </View>
          <Icon
            source="chevron-right"
            size={20}
            color={theme.colors.outline}
          />
        </View>

        <Divider bold={true} style={styles.divider} />

        <View style={[styles.profileList, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.leftContent}>
            <Icon source="alert-circle" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.profileListContent, { color: theme.colors.onSurface }]}>{t('setting.contractUs')}</Text>
          </View>
          <Icon
            source="chevron-right"
            size={20}
            color={theme.colors.outline}
          />
        </View>

        <Divider bold={true} style={styles.divider} />

        <View style={[styles.profileList, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.leftContent}>
            <Icon source="read" size={20} color={theme.colors.onSurface} />
            <Text style={[styles.profileListContent, { color: theme.colors.onSurface }]}>{t('setting.about')}</Text>
          </View>
          <Icon
            source="chevron-right"
            size={20}
            color={theme.colors.outline}
          />
        </View>

        <View style={{ padding: 20, marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#37589eff' }]}
            onPress={() => locale === 'zh' ?
              setLanguage('en') : setLanguage('zh')}
          >
            <Text style={styles.logoutText}>{t('changeLocale')}</Text>
          </TouchableOpacity>
        </View>

        {/* 固定在底部的注销按钮 */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#37589eff' }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>{t('setting.logout')}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // 使子元素可以使用绝对定位
  },
  contentContainer: {
    flex: 1, // 让内容区域占据剩余空间
  },
  bar: {},
  barIcon: {},
  subtitleContainer: {
    padding: 10,
    alignItems: 'flex-start',
  },
  subtitleText: {
    fontSize: 14,
  },
  name: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileListContent: {
    marginLeft: 12,
    fontSize: 16,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRight: {
    fontSize: 14,
  },
  divider: {
    marginLeft: 48,  // 20(icon) + 12(margin) + 16(padding)
  },

  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    pointerEvents: 'box-none', // Allow touches to pass through to children but not to this container
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%', // 按钮宽度占满容器
    pointerEvents: 'auto', // 恢复按钮的点击事件
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
