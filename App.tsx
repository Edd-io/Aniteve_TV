import React, { useEffect } from 'react';
import {
  Pressable,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Home from './srcs/ui/home/home';


function App(): React.JSX.Element {

  return (
    <SafeAreaView style={styles.container}>
      <Home />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

export default App;
