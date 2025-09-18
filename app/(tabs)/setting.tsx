// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import { Appbar, Divider, Icon, Text } from 'react-native-paper';

// export default function SettingScreen() {
//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('isLoggedIn');
//       await AsyncStorage.removeItem('username');
      
//       // 使用 router 进行导航，兼容移动端和 web 端
//       router.replace('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Appbar.Header style={styles.bar}>
//         {/* 占位 */}
//         <Appbar.Content
//           title=""
//         />
//         <Appbar.Action icon="bell" style={styles.barIcon} onPress={() => { }} />

//       </Appbar.Header>
//       <View style={styles.subtitleContainer}>
//         <Text style={styles.subtitleText}>袁满华</Text>
//         <View style={[styles.name, { marginTop: 10 }]}>
//          <Icon source="camera" size={15} />
//         <Text style={[styles.subtitleText,{ marginLeft:10}]}>EC_testj</Text>
//         </View>

//       </View>
//       <View style={[styles.profileList, { marginTop: 10 }]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>个人资料</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>

//       <View style={[styles.profileList, { marginTop: 10 }]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>深色模式</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>

//       <View style={[styles.profileList, { marginTop: 10 }]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>隐私公告</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>
//       <Divider bold={true} style={styles.divider}/>
//       <View style={[styles.profileList]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>联系我们</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>
//       <Divider bold={true} style={styles.divider}/>
//       <View style={[styles.profileList]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>关于</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>
//       <Divider bold={true} style={styles.divider}/>
//       <View style={[styles.profileList]}>
//         <View style={styles.leftContent}>
//           <Icon source="camera" size={20} />
//           <Text style={styles.profileListContent}>意见反馈</Text>
//         </View>
//         <Icon
//           source="chevron-right"  // 向右箭头图标
//           size={20}
//           color="#999"            // 灰色箭头
//         />
//       </View>

//       {/* 注销按钮 */}
//       <TouchableOpacity 
//         style={styles.logoutButton}
//         onPress={handleLogout}
//       >
//         <Text style={styles.logoutText}>退出登录</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#E8E8E8',
//     height: '100%',
//   },
//   bar: {
//     backgroundColor: '#274D7C',
//   },
//   barIcon: {
//     backgroundColor: 'white',
//   },
//   subtitleContainer: {
//     backgroundColor: '#274D7C', // 与 AppBar 同色
//     padding: 10,            // 内边距
//     alignItems: 'flex-start',
//   },
//   subtitleText: {
//     color: 'white',         // 文字颜色（与背景对比）
//     fontSize: 14,
//   },
//   name: {
//     flexDirection: 'row',    // 横向排列
//     alignItems: 'center',    // 垂直居中
//   },

//   profileList: {
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',    // 横向排列
//     alignItems: 'center',    // 垂直居中
//     justifyContent: 'space-between', // 左右两端对齐
//     paddingVertical: 12,     // 垂直内边距
//     paddingHorizontal: 16,   // 水平内边距
//   },

//   leftContent: {
//     flexDirection: 'row',    // 图标和文字横向排列
//     alignItems: 'center',    // 垂直居中
//   },
//   profileListContent: {
//     marginLeft: 12,          // 文字与左边图标的间距
//     fontSize: 16,
//   },
//   divider: {
//       marginLeft: 48,  // 20(icon) + 12(margin) + 16(padding)
//   },
//   logoutButton: {
//     backgroundColor: '#ff3b30',
//     margin: 20,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 30,
//   },
//   logoutText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   }
// });
import { Link, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
export default function Index() {
   const router = useRouter();
  const handleLogin = async () => {
router.push('/device')
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/device" style={styles.button}>
        Go to About screen
      </Link>
      <Button
          onPress={handleLogin}
          
        >
          登录
        </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
